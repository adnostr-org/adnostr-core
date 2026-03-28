"""
Ad Generator Engine

This module provides the AI-powered advertisement generation interface for AdNostr-Core.
It handles text-to-image generation for both beauty images and product advertisements.

Key Features:
- Text-to-image generation for beauty/product images
- Configurable AI model integration
- Image optimization and validation
- Async processing for high performance
- Revenue calculation integration

Supported Image Types:
- Beauty images: Attractive visuals for social media engagement
- Product images: Commercial advertisements with branding

Author: AdNostr Team
License: MIT
"""

import asyncio
import base64
import io
import math
import os
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