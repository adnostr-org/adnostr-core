"""
Ad Generator Engine with NIP-ADS Protocol Support

This module provides AI-powered advertisement generation with NIP-ADS protocol compliance.
It handles text-to-image generation and creates NIP-ADS events for the Nostr network.

Key Features:
- Text-to-image generation for advertisements
- NIP-ADS protocol compliance (kind 40000+)
- Integration with nostrads protocol library
- Async processing for high performance
- Arbitrage calculation between Web2 and Nostr

NIP-ADS Protocol:
- Kind: 40000 (Advertisement events)
- Tags: ["t", "ad"], ["price_slot", "..."], ["category", "..."]
- Content: JSON with ad metadata

Author: AdNostr Team
License: MIT
"""

import asyncio
import base64
import io
import json
import math
import os
import uuid
from datetime import datetime
from typing import Dict, List, Optional, Tuple, Union
from dataclasses import dataclass
from enum import Enum

import aiofiles
import numpy as np
from PIL import Image
import requests
import structlog

from src.utils.mastodon_client import MastodonClient

logger = structlog.get_logger()


class ImageType(Enum):
    """Enumeration of supported advertisement image types."""
    BEAUTY = "beauty"
    PRODUCT = "product"


@dataclass
class GenerationRequest:
    """Data class representing an image generation request."""
    prompt: str
    image_type: ImageType
    width: int = 1024
    height: int = 1024
    style: Optional[str] = None
    brand_elements: Optional[List[str]] = None


@dataclass
class GenerationResponse:
    """Data class representing the result of image generation."""
    image_data: bytes
    image_url: Optional[str] = None
    metadata: Dict[str, Union[str, int, float]] = None
    revenue_estimate: float = 0.0


class AdGenerator:
    """
    AI-powered advertisement image generator.

    This class handles the generation of advertisement images using various AI models.
    It supports both beauty images and product advertisements with revenue calculation.

    Attributes:
        api_key: AI service API key from environment
        api_endpoint: AI service endpoint URL
        mastodon_client: Client for posting generated images
        revenue_constant_c: Revenue calculation constant C
        revenue_exponent_k: Revenue calculation exponent k
    """

    def __init__(self):
        """Initialize the AdGenerator with configuration from environment variables."""
        self.api_key = os.getenv("AI_API_KEY")
        self.api_endpoint = os.getenv("AI_API_ENDPOINT", "https://api.example.com/generate-image")
        self.mastodon_client = MastodonClient()

        # Revenue calculation parameters
        self.revenue_constant_c = float(os.getenv("REVENUE_CONSTANT_C", "1.5"))
        self.revenue_exponent_k = float(os.getenv("REVENUE_EXPONENT_K", "0.8"))

        logger.info("AdGenerator initialized",
                   api_endpoint=self.api_endpoint,
                   has_api_key=bool(self.api_key))

    async def generate_image(self, request: GenerationRequest) -> GenerationResponse:
        """
        Generate an advertisement image based on the provided request.

        Args:
            request: GenerationRequest containing prompt and parameters

        Returns:
            GenerationResponse with generated image data and metadata

        Raises:
            ValueError: If generation parameters are invalid
            RuntimeError: If AI service is unavailable or returns an error
        """
        logger.info("Starting image generation",
                   image_type=request.image_type.value,
                   prompt_length=len(request.prompt))

        # Validate request
        self._validate_request(request)

        # Enhance prompt based on image type
        enhanced_prompt = self._enhance_prompt(request)

        try:
            # Generate image using AI service
            image_data = await self._call_ai_service(enhanced_prompt, request)

            # Optimize and validate the generated image
            optimized_image = await self._optimize_image(image_data, request)

            # Calculate revenue estimate
            revenue_estimate = self._calculate_revenue_estimate(request)

            # Create response
            response = GenerationResponse(
                image_data=optimized_image,
                metadata={
                    "prompt": enhanced_prompt,
                    "image_type": request.image_type.value,
                    "width": request.width,
                    "height": request.height,
                    "style": request.style or "default"
                },
                revenue_estimate=revenue_estimate
            )

            logger.info("Image generation completed successfully",
                       image_size=len(optimized_image),
                       revenue_estimate=revenue_estimate)

            return response

        except Exception as e:
            logger.error("Image generation failed", error=str(e))
            raise RuntimeError(f"Failed to generate image: {str(e)}") from e

    def _validate_request(self, request: GenerationRequest) -> None:
        """
        Validate the generation request parameters.

        Args:
            request: The request to validate

        Raises:
            ValueError: If any parameter is invalid
        """
        if not request.prompt or len(request.prompt.strip()) < 10:
            raise ValueError("Prompt must be at least 10 characters long")

        if request.width < 256 or request.width > 2048:
            raise ValueError("Width must be between 256 and 2048 pixels")

        if request.height < 256 or request.height > 2048:
            raise ValueError("Height must be between 256 and 2048 pixels")

        if request.image_type not in [ImageType.BEAUTY, ImageType.PRODUCT]:
            raise ValueError("Invalid image type specified")

    def _enhance_prompt(self, request: GenerationRequest) -> str:
        """
        Enhance the user prompt with type-specific optimizations.

        Args:
            request: The generation request

        Returns:
            Enhanced prompt string optimized for the AI model
        """
        base_prompt = request.prompt.strip()

        # Add style-specific enhancements
        if request.image_type == ImageType.BEAUTY:
            enhancements = [
                "photorealistic beauty portrait",
                "professional photography",
                "high resolution, detailed skin texture",
                "attractive facial features",
                "stunning makeup and hairstyle"
            ]
        elif request.image_type == ImageType.PRODUCT:
            enhancements = [
                "professional product photography",
                "clean white background",
                "commercial advertising style",
                "high quality, detailed product features",
                "appetizing presentation" if "food" in base_prompt.lower() else "premium quality"
            ]

        # Add brand elements if specified
        if request.brand_elements:
            brand_text = ", ".join(request.brand_elements)
            enhancements.append(f"incorporating brand elements: {brand_text}")

        # Add technical specifications
        enhancements.extend([
            f"resolution: {request.width}x{request.height}",
            "sharp focus, professional lighting",
            "no text overlays, no watermarks"
        ])

        enhanced_prompt = f"{base_prompt}, {', '.join(enhancements)}"

        logger.debug("Prompt enhanced", original_length=len(base_prompt), enhanced_length=len(enhanced_prompt))

        return enhanced_prompt

    async def _call_ai_service(self, prompt: str, request: GenerationRequest) -> bytes:
        """
        Call the configured AI service to generate the image.

        Args:
            prompt: Enhanced prompt for generation
            request: Original generation request

        Returns:
            Raw image data as bytes

        Raises:
            RuntimeError: If the AI service call fails
        """
        if not self.api_key:
            raise RuntimeError("AI API key not configured")

        # Placeholder implementation - replace with actual AI service integration
        # This is a mock implementation that creates a simple colored image
        logger.warning("Using placeholder AI service implementation")

        # Create a placeholder image (solid color with text overlay)
        img = Image.new('RGB', (request.width, request.height), color='#FF6B6B')
        img_byte_arr = io.BytesIO()
        img.save(img_byte_arr, format='PNG')
        img_byte_arr.seek(0)

        return img_byte_arr.getvalue()

    async def _optimize_image(self, image_data: bytes, request: GenerationRequest) -> bytes:
        """
        Optimize the generated image for social media posting.

        Args:
            image_data: Raw image data from AI service
            request: Generation request for optimization parameters

        Returns:
            Optimized image data as bytes
        """
        try:
            # Open image with PIL
            img = Image.open(io.BytesIO(image_data))

            # Ensure RGB mode for compatibility
            if img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if necessary (though AI should generate correct size)
            if img.size != (request.width, request.height):
                img = img.resize((request.width, request.height), Image.Resampling.LANCZOS)

            # Optimize for web (reduce file size while maintaining quality)
            output_buffer = io.BytesIO()
            img.save(output_buffer, format='JPEG', quality=85, optimize=True)
            output_buffer.seek(0)

            optimized_data = output_buffer.getvalue()

            logger.debug("Image optimized",
                        original_size=len(image_data),
                        optimized_size=len(optimized_data),
                        compression_ratio=len(optimized_data)/len(image_data))

            return optimized_data

        except Exception as e:
            logger.error("Image optimization failed", error=str(e))
            # Return original data if optimization fails
            return image_data

    def _calculate_revenue_estimate(self, request: GenerationRequest) -> float:
        """
        Calculate estimated revenue for the generated advertisement.

        Uses the formula: R = (C * ln(I + 1)) / D^k
        Where:
        - R: Revenue estimate
        - C: Constant factor (from config)
        - I: Image quality/complexity factor (derived from prompt length and type)
        - D: Difficulty factor (derived from image dimensions)
        - k: Exponent factor (from config)

        Args:
            request: Generation request

        Returns:
            Estimated revenue as float
        """
        # Calculate image complexity factor (I)
        # Higher for longer prompts and beauty images (more engaging)
        prompt_complexity = min(len(request.prompt) / 100, 5.0)  # Max 5.0
        type_bonus = 2.0 if request.image_type == ImageType.BEAUTY else 1.0
        I = prompt_complexity * type_bonus

        # Calculate difficulty factor (D)
        # Higher for larger images (more processing intensive)
        pixel_count = request.width * request.height
        D = math.sqrt(pixel_count) / 1000  # Normalized difficulty

        # Apply the revenue formula
        try:
            revenue = (self.revenue_constant_c * math.log(I + 1)) / (D ** self.revenue_exponent_k)

            # Ensure positive revenue
            revenue = max(revenue, 0.01)

            logger.debug("Revenue calculated",
                        formula=f"({self.revenue_constant_c} * ln({I} + 1)) / ({D}^{self.revenue_exponent_k})",
                        result=revenue)

            return round(revenue, 4)

        except (ValueError, ZeroDivisionError) as e:
            logger.warning("Revenue calculation failed, using default", error=str(e))
            return 1.0  # Default fallback value

    async def post_to_mastodon(self, generation_response: GenerationResponse,
                              description: str = "") -> Dict[str, Union[str, int]]:
        """
        Post the generated image to Mastodon with #adnostr tag.

        Args:
            generation_response: The generated image response
            description: Optional description text for the post

        Returns:
            Dictionary containing post details from Mastodon

        Raises:
            RuntimeError: If posting fails
        """
        try:
            # Create post content with hashtag
            post_content = f"{description} #adnostr".strip()

            # Post to Mastodon
            result = await self.mastodon_client.post_status_with_media(
                status=post_content,
                media_data=generation_response.image_data,
                media_type="image/jpeg"
            )

            logger.info("Successfully posted to Mastodon",
                       post_id=result.get("id"),
                       url=result.get("url"))

            return result

        except Exception as e:
            logger.error("Failed to post to Mastodon", error=str(e))
            raise RuntimeError(f"Mastodon posting failed: {str(e)}") from e

    # NIP-ADS Protocol Methods
    def create_nip_ads_event(
        self,
        title: str,
        description: str,
        image_url: Optional[str] = None,
        web2_cpc: float = 0.5,
        category: str = "0",
        language: str = "en",
        price_slot: str = "BTC1_000"
    ) -> Dict:
        """
        Create a NIP-ADS compliant advertisement event.

        Args:
            title: Advertisement title
            description: Advertisement description
            image_url: Optional image URL
            web2_cpc: Web2 cost per click in USD
            category: NIP-ADS category code
            language: ISO 639-1 language code
            price_slot: NIP-ADS price slot

        Returns:
            NIP-ADS event dictionary
        """
        # Calculate Nostr equivalent cost (100 sats per click as conservative estimate)
        nostr_sats_per_click = 100
        btc_price_usd = 50000.0  # Example BTC price
        
        # Calculate savings
        nostr_cpc_usd = (nostr_sats_per_click / 100_000_000) * btc_price_usd
        savings_usd = web2_cpc - nostr_cpc_usd
        savings_percentage = (savings_usd / web2_cpc) * 100 if web2_cpc > 0 else 0
        
        # Create NIP-ADS event content
        content = {
            "title": title[:100],
            "description": description[:500],
            "call_to_action": "Learn More",
            "image_url": image_url,
            "arbitrage_data": {
                "web2_cpc_usd": web2_cpc,
                "nostr_cpc_sats": nostr_sats_per_click,
                "nostr_cpc_usd": nostr_cpc_usd,
                "savings_usd": savings_usd,
                "savings_percentage": savings_percentage,
                "message": f"Save {savings_percentage:.1f}% with Nostr advertising"
            }
        }
        
        # Create NIP-ADS tags
        tags = [
            ["t", "ad"],
            ["price_slot", price_slot],
            ["category", category],
            ["language", language],
            ["source", "adnostr"],
            ["arbitrage", "true"]
        ]
        
        if image_url:
            tags.append(["mime_type", "image/jpeg"])
        
        # Create the event
        event = {
            "kind": 40000,
            "content": json.dumps(content, ensure_ascii=False),
            "tags": tags,
            "created_at": int(datetime.utcnow().timestamp()),
            "id": str(uuid.uuid4())[:32]  # Placeholder ID
        }
        
        logger.info("NIP-ADS event created",
                   title=title[:30],
                   category=category,
                   price_slot=price_slot,
                   savings_percentage=f"{savings_percentage:.1f}%")
        
        return event
    
    def create_from_web2_data(
        self,
        web2_ad_data: Dict,
        advertiser_pubkey: str
    ) -> Dict:
        """
        Create NIP-ADS event from Web2 advertisement data.

        Args:
            web2_ad_data: Web2 advertisement data from Apify or similar
            advertiser_pubkey: Nostr public key of the advertiser

        Returns:
            Complete NIP-ADS event with arbitrage calculations
        """
        # Extract data from Web2 ad
        title = web2_ad_data.get("title", "Web2 Advertisement")
        description = web2_ad_data.get("description", "")
        image_url = web2_ad_data.get("image_url")
        web2_cpc = web2_ad_data.get("cpc_usd", 0.5)
        category = web2_ad_data.get("category", "0")
        language = web2_ad_data.get("language", "en")
        
        # Create NIP-ADS event
        nip_ads_event = self.create_nip_ads_event(
            title=title,
            description=description,
            image_url=image_url,
            web2_cpc=web2_cpc,
            category=category,
            language=language
        )
        
        # Add advertiser pubkey to tags
        nip_ads_event["tags"].append(["p", advertiser_pubkey])
        nip_ads_event["pubkey"] = advertiser_pubkey
        
        # Calculate detailed arbitrage metrics
        content_dict = json.loads(nip_ads_event["content"])
        arbitrage_data = content_dict.get("arbitrage_data", {})
        
        # Add Web2 vs Nostr comparison
        comparison = {
            "web2": {
                "cpc_usd": web2_cpc,
                "cost_per_1k_usd": web2_cpc * 1000,
                "platform": web2_ad_data.get("platform", "unknown")
            },
            "nostr": {
                "cpc_sats": arbitrage_data.get("nostr_cpc_sats", 100),
                "cpc_usd": arbitrage_data.get("nostr_cpc_usd", 0.05),
                "cost_per_1k_usd": arbitrage_data.get("nostr_cpc_usd", 0.05) * 1000,
                "protocol": "NIP-ADS"
            },
            "savings": {
                "per_click_usd": arbitrage_data.get("savings_usd", 0.45),
                "per_1k_usd": arbitrage_data.get("savings_usd", 0.45) * 1000,
                "percentage": arbitrage_data.get("savings_percentage", 90.0)
            }
        }
        
        result = {
            "nip_ads_event": nip_ads_event,
            "arbitrage_comparison": comparison,
            "web2_source_data": {
                "title": title,
                "description": description[:200],
                "cpc_usd": web2_cpc,
                "platform": web2_ad_data.get("platform", "unknown"),
                "scraped_at": web2_ad_data.get("timestamp", datetime.utcnow().isoformat())
            },
            "metadata": {
                "generated_at": datetime.utcnow().isoformat(),
                "protocol": "NIP-ADS",
                "version": "1.0",
                "event_kind": 40000
            }
        }
        
        logger.info("NIP-ADS event created from Web2 data",
                   platform=web2_ad_data.get("platform", "unknown"),
                   savings=f"{comparison['savings']['percentage']:.1f}%")
        
        return result