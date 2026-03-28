"""
API Routes for AdNostr-Core

This module defines the FastAPI routes for the AdNostr-Core application,
providing endpoints for advertisement posting and click tracking.

Key Endpoints:
- POST /post_ad: Generate and post AI advertisements to Mastodon
- POST /click_track: Track advertisement clicks for analytics and revenue calculation
- GET /health: Health check endpoint (defined in main.py)

Supported Features:
- AI-powered advertisement image generation
- Automated posting to admin.adnostr.org with #adnostr tag
- Click attribution tracking with revenue calculation
- Async processing for high performance
- Comprehensive error handling and logging

Author: AdNostr Team
License: MIT
"""

import asyncio
import hashlib
import json
import math
import os
import sqlite3
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta
from pathlib import Path

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import structlog

from src.engine.ad_generator import AdGenerator, ImageType, GenerationRequest
from src.utils.mastodon_client import MastodonClient
from src.utils.data_bridge import DataBridge

logger = structlog.get_logger()

# Create API router
router = APIRouter()

# Global instances (injected from main.py)
ad_generator = AdGenerator()
mastodon_client = MastodonClient()


class PostAdRequest(BaseModel):
    """Request model for posting advertisements."""
    prompt: str = Field(..., min_length=10, max_length=500,
                       description="Text prompt for AI image generation")
    image_type: str = Field(..., regex="^(beauty|product)$",
                           description="Type of image to generate: 'beauty' or 'product'")
    description: Optional[str] = Field(None, max_length=200,
                                      description="Optional description text for the post")
    style: Optional[str] = Field(None, max_length=50,
                                description="Optional style specification")
    brand_elements: Optional[List[str]] = Field(None,
                                                description="Optional brand elements to include")

    @validator('image_type')
    def validate_image_type(cls, v):
        """Convert string to ImageType enum."""
        return ImageType(v)


class PostAdResponse(BaseModel):
    """Response model for advertisement posting."""
    success: bool
    post_id: Optional[str] = None
    post_url: Optional[str] = None
    image_url: Optional[str] = None
    revenue_estimate: float
    processing_time: float
    metadata: Dict[str, Any] = {}


class ClickTrackRequest(BaseModel):
    """Request model for click tracking."""
    post_id: str = Field(..., description="Mastodon post ID")
    click_source: str = Field(..., description="Source of the click (e.g., 'tiktok', 'twitter')")
    user_agent: Optional[str] = Field(None, description="User agent string")
    referrer: Optional[str] = Field(None, description="Referrer URL")
    ip_hash: Optional[str] = Field(None, description="Hashed IP address for privacy")
    campaign_id: Optional[str] = Field(None, description="Campaign identifier")


class ClickTrackResponse(BaseModel):
    """Response model for click tracking."""
    success: bool
    click_id: str
    revenue_calculated: float
    attribution_data: Dict[str, Any] = {}


class ClickRequest(BaseModel):
    """Request model for expert click tracking."""
    eid: int = Field(..., description="Expert ID")
    src: str = Field(..., description="Click source (e.g., 'tiktok', 'twitter')")


class ClickResponse(BaseModel):
    """Response model for expert click tracking."""
    success: bool
    expert_id: int
    click_source: str
    revenue_calculated: float
    timestamp: str


class AdStreamResponse(BaseModel):
    """Response model for advertisement stream."""
    experts: List[Dict[str, Any]]
    total_count: int
    timestamp: str


# In-memory storage for demonstration (use database in production)
click_storage: Dict[str, Dict[str, Any]] = {}
post_storage: Dict[str, Dict[str, Any]] = {}

# Database connection for AdNostr data
adnostr_db_path = os.getenv("ADNOSTR_DATA_DB", "adnostr_data.db")
adnostr_db_conn: Optional[sqlite3.Connection] = None

# Data bridge for TickleBell integration
data_bridge: Optional[DataBridge] = None


def get_adnostr_db() -> sqlite3.Connection:
    """Get or create AdNostr database connection."""
    global adnostr_db_conn
    if adnostr_db_conn is None:
        adnostr_db_conn = sqlite3.connect(adnostr_db_path)
        adnostr_db_conn.row_factory = sqlite3.Row
        # Ensure tables exist
        adnostr_db_conn.execute("""
            CREATE TABLE IF NOT EXISTS experts (
                expert_id INTEGER PRIMARY KEY,
                avatar_url TEXT,
                banner_url TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        adnostr_db_conn.execute("""
            CREATE TABLE IF NOT EXISTS ad_clicks (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                expert_id INTEGER,
                click_source TEXT,
                revenue_calculated REAL,
                clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                ip_hash TEXT,
                campaign_id TEXT,
                FOREIGN KEY (expert_id) REFERENCES experts (expert_id)
            )
        """)
        adnostr_db_conn.commit()
    return adnostr_db_conn


def get_data_bridge() -> DataBridge:
    """Get or create DataBridge instance."""
    global data_bridge
    if data_bridge is None:
        data_bridge = DataBridge()
    return data_bridge


@router.post("/post_ad", response_model=PostAdResponse)
async def post_advertisement(
    request: PostAdRequest,
    background_tasks: BackgroundTasks
) -> PostAdResponse:
    """
    Generate and post an AI-powered advertisement to Mastodon.

    This endpoint:
    1. Generates an advertisement image using AI based on the prompt
    2. Calculates revenue estimate using the configured formula
    3. Posts the image to admin.adnostr.org with #adnostr tag
    4. Returns posting details and analytics

    Args:
        request: Advertisement posting request
        background_tasks: FastAPI background tasks for async processing

    Returns:
        Response containing posting results and metadata

    Raises:
        HTTPException: If generation or posting fails
    """
    start_time = time.time()

    try:
        logger.info("Processing advertisement posting request",
                   image_type=request.image_type.value,
                   prompt_length=len(request.prompt))

        # Create generation request
        gen_request = GenerationRequest(
            prompt=request.prompt,
            image_type=request.image_type,
            style=request.style,
            brand_elements=request.brand_elements
        )

        # Generate advertisement image
        generation_response = await ad_generator.generate_image(gen_request)

        # Post to Mastodon
        post_result = await ad_generator.post_to_mastodon(
            generation_response,
            request.description or ""
        )

        # Calculate processing time
        processing_time = time.time() - start_time

        # Store post metadata for tracking
        post_id = post_result.get("id")
        if post_id:
            post_storage[str(post_id)] = {
                "created_at": datetime.utcnow().isoformat(),
                "image_type": request.image_type.value,
                "revenue_estimate": generation_response.revenue_estimate,
                "metadata": generation_response.metadata,
                "click_count": 0
            }

        # Prepare response
        response = PostAdResponse(
            success=True,
            post_id=str(post_id) if post_id else None,
            post_url=post_result.get("url"),
            image_url=post_result.get("media_attachments", [{}])[0].get("url") if post_result.get("media_attachments") else None,
            revenue_estimate=generation_response.revenue_estimate,
            processing_time=round(processing_time, 2),
            metadata={
                "image_type": request.image_type.value,
                "prompt_length": len(request.prompt),
                "generation_time": round(processing_time, 2)
            }
        )

        logger.info("Advertisement posted successfully",
                   post_id=post_id,
                   revenue_estimate=generation_response.revenue_estimate,
                   processing_time=processing_time)

        return response

    except Exception as e:
        processing_time = time.time() - start_time
        logger.error("Advertisement posting failed",
                    error=str(e),
                    processing_time=processing_time)
        raise HTTPException(status_code=500, detail=f"Posting failed: {str(e)}")


@router.post("/click_track", response_model=ClickTrackResponse)
async def track_click(
    request: ClickTrackRequest,
    background_tasks: BackgroundTasks,
    req: Request
) -> ClickTrackResponse:
    """
    Track advertisement clicks for attribution and revenue calculation.

    This endpoint records click events and calculates revenue attribution
    using the formula: R = (C * ln(I + 1)) / D^k where additional factors
    like click source and timing are considered.

    Args:
        request: Click tracking request
        background_tasks: FastAPI background tasks
        req: FastAPI request object for additional metadata

    Returns:
        Response containing tracking results and calculated revenue

    Raises:
        HTTPException: If tracking fails or post not found
    """
    try:
        logger.info("Processing click tracking request",
                   post_id=request.post_id,
                   click_source=request.click_source)

        # Check if post exists
        if request.post_id not in post_storage:
            raise HTTPException(status_code=404, detail="Post not found")

        post_data = post_storage[request.post_id]

        # Generate click ID
        click_id = hashlib.sha256(
            f"{request.post_id}{request.click_source}{time.time()}".encode()
        ).hexdigest()[:16]

        # Calculate attributed revenue
        base_revenue = post_data["revenue_estimate"]
        click_multiplier = _calculate_click_multiplier(request.click_source)
        attributed_revenue = base_revenue * click_multiplier

        # Store click data
        click_data = {
            "click_id": click_id,
            "post_id": request.post_id,
            "click_source": request.click_source,
            "timestamp": datetime.utcnow().isoformat(),
            "user_agent": request.user_agent or req.headers.get("user-agent"),
            "referrer": request.referrer or req.headers.get("referer"),
            "ip_hash": request.ip_hash,
            "campaign_id": request.campaign_id,
            "attributed_revenue": attributed_revenue,
            "client_ip": req.client.host if req.client else None
        }

        click_storage[click_id] = click_data

        # Update post click count
        post_data["click_count"] += 1

        # Background task for additional processing
        background_tasks.add_task(_process_click_analytics, click_data)

        response = ClickTrackResponse(
            success=True,
            click_id=click_id,
            revenue_calculated=round(attributed_revenue, 4),
            attribution_data={
                "base_revenue": base_revenue,
                "click_multiplier": click_multiplier,
                "click_source": request.click_source,
                "post_click_count": post_data["click_count"]
            }
        )

        logger.info("Click tracked successfully",
                   click_id=click_id,
                   attributed_revenue=attributed_revenue,
                   total_clicks=post_data["click_count"])

        return response

    except HTTPException:
        raise
    except Exception as e:
        logger.error("Click tracking failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Tracking failed: {str(e)}")


@router.get("/analytics/{post_id}")
async def get_post_analytics(post_id: str) -> Dict[str, Any]:
    """
    Get analytics data for a specific advertisement post.

    Args:
        post_id: Mastodon post ID

    Returns:
        Dictionary containing post analytics

    Raises:
        HTTPException: If post not found
    """
    if post_id not in post_storage:
        raise HTTPException(status_code=404, detail="Post not found")

    post_data = post_storage[post_id]

    # Get all clicks for this post
    post_clicks = [
        click for click in click_storage.values()
        if click["post_id"] == post_id
    ]

    total_revenue = sum(click["attributed_revenue"] for click in post_clicks)

    analytics = {
        "post_id": post_id,
        "created_at": post_data["created_at"],
        "image_type": post_data["image_type"],
        "base_revenue_estimate": post_data["revenue_estimate"],
        "total_clicks": len(post_clicks),
        "total_attributed_revenue": round(total_revenue, 4),
        "click_sources": {},
        "recent_clicks": post_clicks[-10:]  # Last 10 clicks
    }

    # Aggregate by click source
    for click in post_clicks:
        source = click["click_source"]
        if source not in analytics["click_sources"]:
            analytics["click_sources"][source] = 0
        analytics["click_sources"][source] += 1

    return analytics


def _calculate_click_multiplier(click_source: str) -> float:
    """
    Calculate revenue multiplier based on click source.

    Different traffic sources have different conversion values:
    - TikTok: High engagement, premium multiplier
    - Direct: Medium engagement
    - Other social: Standard multiplier

    Args:
        click_source: Source of the click

    Returns:
        Revenue multiplier factor
    """
    multipliers = {
        "tiktok": 1.5,      # Premium TikTok traffic
        "twitter": 1.2,     # Good social engagement
        "facebook": 1.1,    # Standard social traffic
        "instagram": 1.3,   # Visual platform bonus
        "direct": 1.0,      # Direct traffic baseline
        "search": 0.9,      # Search traffic (more price-sensitive)
        "email": 0.8,       # Email traffic
    }

    return multipliers.get(click_source.lower(), 1.0)


async def _process_click_analytics(click_data: Dict[str, Any]) -> None:
    """
    Background processing for click analytics.

    This function runs in the background to process additional analytics
    like fraud detection, geographic analysis, etc.

    Args:
        click_data: Click tracking data
    """
    try:
        # Simulate additional processing time
        await asyncio.sleep(0.1)

        # In a real implementation, this could:
        # - Check for click fraud patterns
        # - Update real-time dashboards
        # - Trigger additional revenue calculations
        # - Send notifications for high-value clicks

        logger.debug("Click analytics processed",
                    click_id=click_data["click_id"],
                    revenue=click_data["attributed_revenue"])

    except Exception as e:
        logger.error("Click analytics processing failed", error=str(e))


# Additional utility endpoints for development
@router.get("/posts")
async def list_posts() -> Dict[str, Any]:
    """List all stored posts (development endpoint)."""
    return {
        "posts": list(post_storage.keys()),
        "total": len(post_storage)
    }


@router.get("/clicks")
async def list_clicks() -> Dict[str, Any]:
    """List all stored clicks (development endpoint)."""
    return {
        "clicks": list(click_storage.keys()),
        "total": len(click_storage)
    }


@router.get("/ad/stream", response_model=AdStreamResponse)
async def get_advertisement_stream() -> AdStreamResponse:
    """
    Get advertisement stream with 1000 experts data.

    This endpoint returns a JSON feed of expert advertisements for
    the waterfall display, including avatars and banners.

    Returns:
        Stream of expert advertisement data

    Raises:
        HTTPException: If database access fails
    """
    try:
        db = get_adnostr_db()
        cursor = db.cursor()

        # Get up to 1000 experts with their creative assets
        cursor.execute("""
            SELECT expert_id, avatar_url, banner_url, created_at, updated_at
            FROM experts
            ORDER BY last_sync DESC
            LIMIT 1000
        """)

        experts = []
        for row in cursor.fetchall():
            expert_data = {
                "id": row["expert_id"],
                "avatar": row["avatar_url"],
                "banner": row["banner_url"],
                "created_at": row["created_at"],
                "updated_at": row["updated_at"]
            }
            experts.append(expert_data)

        logger.info("Advertisement stream requested",
                   expert_count=len(experts),
                   total_available=cursor.rowcount)

        return AdStreamResponse(
            experts=experts,
            total_count=len(experts),
            timestamp=datetime.utcnow().isoformat()
        )

    except sqlite3.Error as e:
        logger.error("Database error in ad stream", error=str(e))
        raise HTTPException(status_code=500, detail="Database access failed")
    except Exception as e:
        logger.error("Failed to get advertisement stream", error=str(e))
        raise HTTPException(status_code=500, detail=f"Stream generation failed: {str(e)}")


@router.get("/click", response_model=ClickResponse)
async def track_expert_click(
    eid: int,
    src: str,
    request: Request
) -> ClickResponse:
    """
    Track clicks on expert advertisements for revenue calculation.

    This endpoint:
    1. Receives expert ID and click source
    2. Calculates revenue using the formula R = (C × ln(I + 1)) / D^k
    3. Stores click data in local AdNostr database
    4. Returns calculation results

    Args:
        eid: Expert ID that was clicked
        src: Click source (tiktok, twitter, etc.)
        request: FastAPI request for additional metadata

    Returns:
        Click tracking response with revenue calculation

    Raises:
        HTTPException: If expert not found or calculation fails
    """
    try:
        logger.info("Processing expert click tracking",
                   expert_id=eid,
                   click_source=src)

        # Validate expert exists
        db = get_adnostr_db()
        cursor = db.cursor()
        cursor.execute("SELECT expert_id FROM experts WHERE expert_id = ?", (eid,))
        expert = cursor.fetchone()

        if not expert:
            raise HTTPException(status_code=404, detail=f"Expert {eid} not found")

        # Calculate revenue using the formula R = (C × ln(I + 1)) / D^k
        revenue_calculated = await _calculate_expert_revenue(eid, src)

        # Store click data
        cursor.execute("""
            INSERT INTO ad_clicks (expert_id, click_source, revenue_calculated, ip_hash, campaign_id)
            VALUES (?, ?, ?, ?, ?)
        """, (
            eid,
            src,
            revenue_calculated,
            _hash_ip(request.client.host) if request.client else None,
            None  # campaign_id can be added later
        ))
        db.commit()

        timestamp = datetime.utcnow().isoformat()

        logger.info("Expert click tracked successfully",
                   expert_id=eid,
                   click_source=src,
                   revenue_calculated=revenue_calculated)

        return ClickResponse(
            success=True,
            expert_id=eid,
            click_source=src,
            revenue_calculated=round(revenue_calculated, 4),
            timestamp=timestamp
        )

    except HTTPException:
        raise
    except sqlite3.Error as e:
        logger.error("Database error in click tracking", error=str(e))
        raise HTTPException(status_code=500, detail="Database access failed")
    except Exception as e:
        logger.error("Expert click tracking failed", error=str(e))
        raise HTTPException(status_code=500, detail=f"Click tracking failed: {str(e)}")


async def _calculate_expert_revenue(expert_id: int, click_source: str) -> float:
    """
    Calculate revenue for expert click using the formula R = (C × ln(I + 1)) / D^k.

    Where:
    - R: Revenue estimate
    - C: Constant factor (from config, default 1.5)
    - I: Image complexity factor (based on expert data availability)
    - D: Difficulty factor (based on time since last sync)
    - k: Exponent factor (from config, default 0.8)

    Args:
        expert_id: The expert ID
        click_source: Source of the click

    Returns:
        Calculated revenue as float
    """
    try:
        # Get configuration parameters
        C = float(os.getenv("REVENUE_CONSTANT_C", "1.5"))
        k = float(os.getenv("REVENUE_EXPONENT_K", "0.8"))

        # Get expert data for complexity calculation
        db = get_adnostr_db()
        cursor = db.cursor()
        cursor.execute("""
            SELECT avatar_url, banner_url, created_at, last_sync
            FROM experts
            WHERE expert_id = ?
        """, (expert_id,))
        expert = cursor.fetchone()

        if not expert:
            raise ValueError(f"Expert {expert_id} not found")

        # Calculate Image complexity factor (I)
        # Higher if expert has both avatar and banner
        has_avatar = bool(expert["avatar_url"])
        has_banner = bool(expert["banner_url"])
        base_complexity = 1.0
        if has_avatar:
            base_complexity += 1.0
        if has_banner:
            base_complexity += 1.0

        # Apply click source multiplier
        source_multiplier = _calculate_click_multiplier(click_source)
        I = base_complexity * source_multiplier

        # Calculate Difficulty factor (D)
        # Based on how recent the data is (hours since last sync)
        try:
            last_sync = datetime.fromisoformat(expert["last_sync"])
            hours_since_sync = (datetime.utcnow() - last_sync).total_seconds() / 3600
            D = max(1.0, hours_since_sync / 24)  # At least 1.0, increases with staleness
        except (ValueError, TypeError):
            D = 1.0  # Default if date parsing fails

        # Apply the revenue formula
        revenue = (C * math.log(I + 1)) / (D ** k)

        # Ensure positive minimum revenue
        revenue = max(revenue, 0.01)

        logger.debug("Expert revenue calculated",
                    formula=f"({C} * ln({I} + 1)) / ({D}^{k})",
                    expert_id=expert_id,
                    click_source=click_source,
                    result=revenue)

        return revenue

    except Exception as e:
        logger.warning("Revenue calculation failed, using default",
                      error=str(e),
                      expert_id=expert_id)
        return 1.0  # Default fallback value


def _hash_ip(ip: Optional[str]) -> Optional[str]:
    """
    Hash IP address for privacy-preserving storage.

    Args:
        ip: IP address string

    Returns:
        SHA256 hash of IP address, or None if IP is invalid
    """
    if not ip:
        return None

    try:
        return hashlib.sha256(ip.encode()).hexdigest()
    except Exception:
        return None