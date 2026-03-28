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
import time
from typing import Dict, List, Optional, Any
from datetime import datetime, timedelta

from fastapi import APIRouter, HTTPException, BackgroundTasks, Request
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field, validator
import structlog

from src.engine.ad_generator import AdGenerator, ImageType, GenerationRequest
from src.utils.mastodon_client import MastodonClient

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


# In-memory storage for demonstration (use database in production)
click_storage: Dict[str, Dict[str, Any]] = {}
post_storage: Dict[str, Dict[str, Any]] = {}


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