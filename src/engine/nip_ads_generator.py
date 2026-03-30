"""
NIP-ADS Protocol Generator for AdNostr-Core

This module implements the NIP-ADS protocol (kind 40000+) for generating
decentralized advertisement events on the Nostr network.

NIP-ADS Protocol Specification:
- Kind: 40000 (Advertisement event)
- Content: JSON with ad metadata
- Required tags: ["t", "ad"], ["price_slot", "..."], ["category", "..."]
- Optional tags: ["language", "..."], ["mime_type", "..."], ["size", "..."]

Based on: https://ngengine.org/docs/nip-drafts/nip-ADS/

Author: AdNostr Team
License: MIT
"""

import json
import math
import os
import uuid
from dataclasses import dataclass, asdict
from datetime import datetime
from enum import Enum
from typing import Dict, List, Optional, Union
from decimal import Decimal

import structlog

logger = structlog.get_logger()


class PriceSlot(Enum):
    """NIP-ADS price slots in satoshis."""
    BTC1_000 = "BTC1_000"      # 1,000 sats
    BTC10_000 = "BTC10_000"    # 10,000 sats
    BTC100_000 = "BTC100_000"  # 100,000 sats
    BTC1_000_000 = "BTC1_000_000"  # 1,000,000 sats


class Category(Enum):
    """NIP-ADS content taxonomy categories."""
    GENERAL = "0"
    TECHNOLOGY = "1"
    BUSINESS = "2"
    ENTERTAINMENT = "3"
    SPORTS = "4"
    HEALTH = "5"
    SCIENCE = "6"
    POLITICS = "7"
    FOOD = "8"
    TRAVEL = "9"
    SHOPPING = "10"
    PERSONAL = "11"


class Language(Enum):
    """ISO 639-1 language codes."""
    ENGLISH = "en"
    CHINESE = "zh"
    SPANISH = "es"
    HINDI = "hi"
    ARABIC = "ar"
    PORTUGUESE = "pt"
    RUSSIAN = "ru"
    JAPANESE = "ja"
    GERMAN = "de"
    FRENCH = "fr"


class MimeType(Enum):
    """Supported MIME types for NIP-ADS."""
    JPEG = "image/jpeg"
    PNG = "image/png"
    GIF = "image/gif"
    WEBP = "image/webp"
    SVG = "image/svg+xml"


class AdSize(Enum):
    """Standard ad sizes with aspect ratios."""
    # Square
    SQUARE_250 = "250x250"
    SQUARE_300 = "300x300"
    SQUARE_600 = "600x600"
    
    # Rectangle
    RECT_300x250 = "300x250"
    RECT_336x280 = "336x280"
    RECT_728x90 = "728x90"
    RECT_970x90 = "970x90"
    RECT_970x250 = "970x250"
    
    # Mobile
    MOBILE_320x50 = "320x50"
    MOBILE_320x100 = "320x100"


@dataclass
class AdContent:
    """Advertisement content data."""
    title: str
    description: str
    call_to_action: str
    url: Optional[str] = None
    image_url: Optional[str] = None
    video_url: Optional[str] = None
    brand_name: Optional[str] = None
    price_amount: Optional[Decimal] = None
    price_currency: Optional[str] = "USD"


@dataclass
class AdTargeting:
    """Advertisement targeting parameters."""
    category: Category
    language: Language
    price_slot: PriceSlot
    mime_type: Optional[MimeType] = None
    ad_size: Optional[AdSize] = None
    geo_targeting: Optional[List[str]] = None
    age_range: Optional[tuple[int, int]] = None
    keywords: Optional[List[str]] = None


@dataclass
class NipAdsEvent:
    """Complete NIP-ADS event structure."""
    content: AdContent
    targeting: AdTargeting
    advertiser_pubkey: str
    created_at: int = None
    expires_at: Optional[int] = None
    event_id: Optional[str] = None
    
    def __post_init__(self):
        if self.created_at is None:
            self.created_at = int(datetime.utcnow().timestamp())
        if self.event_id is None:
            self.event_id = str(uuid.uuid4())
    
    def to_nostr_event(self) -> Dict:
        """Convert to Nostr event dictionary."""
        # Build content JSON
        content_dict = {
            "title": self.content.title,
            "description": self.content.description,
            "call_to_action": self.content.call_to_action,
        }
        
        # Add optional fields
        if self.content.url:
            content_dict["url"] = self.content.url
        if self.content.image_url:
            content_dict["image_url"] = self.content.image_url
        if self.content.video_url:
            content_dict["video_url"] = self.content.video_url
        if self.content.brand_name:
            content_dict["brand_name"] = self.content.brand_name
        if self.content.price_amount:
            content_dict["price"] = {
                "amount": str(self.content.price_amount),
                "currency": self.content.price_currency
            }
        
        # Build tags
        tags = [
            ["t", "ad"],
            ["price_slot", self.targeting.price_slot.value],
            ["category", self.targeting.category.value],
            ["language", self.targeting.language.value],
        ]
        
        # Add optional tags
        if self.targeting.mime_type:
            tags.append(["mime_type", self.targeting.mime_type.value])
        if self.targeting.ad_size:
            tags.append(["size", self.targeting.ad_size.value])
        if self.targeting.geo_targeting:
            for geo in self.targeting.geo_targeting:
                tags.append(["geo", geo])
        if self.targeting.keywords:
            for keyword in self.targeting.keywords:
                tags.append(["keyword", keyword])
        if self.expires_at:
            tags.append(["expiration", str(self.expires_at)])
        
        # Add advertiser pubkey
        tags.append(["p", self.advertiser_pubkey])
        
        # Add event ID for reference
        tags.append(["e", self.event_id])
        
        return {
            "kind": 40000,
            "content": json.dumps(content_dict, ensure_ascii=False),
            "tags": tags,
            "created_at": self.created_at,
            "pubkey": self.advertiser_pubkey,
        }
    
    def to_json(self) -> str:
        """Serialize to JSON string."""
        return json.dumps(self.to_nostr_event(), indent=2, ensure_ascii=False)


class NipAdsGenerator:
    """
    NIP-ADS protocol event generator.
    
    This class handles the creation of NIP-ADS compliant advertisement events
    from Web2 advertising data.
    """
    
    def __init__(self):
        """Initialize the NIP-ADS generator."""
        self.logger = structlog.get_logger()
        self.logger.info("NIP-ADS Generator initialized")
    
    def create_from_web2_ad(
        self,
        web2_ad_data: Dict,
        advertiser_pubkey: str,
        price_slot: PriceSlot = PriceSlot.BTC1_000
    ) -> NipAdsEvent:
        """
        Create a NIP-ADS event from Web2 advertisement data.
        
        Args:
            web2_ad_data: Dictionary containing Web2 ad data
            advertiser_pubkey: Nostr public key of the advertiser
            price_slot: NIP-ADS price slot for the advertisement
            
        Returns:
            NipAdsEvent compliant with NIP-ADS protocol
        """
        self.logger.info("Creating NIP-ADS event from Web2 ad", 
                        advertiser=advertiser_pubkey[:16])
        
        # Extract and validate Web2 ad data
        title = web2_ad_data.get("title", "Untitled Advertisement")
        description = web2_ad_data.get("description", "")
        call_to_action = web2_ad_data.get("call_to_action", "Learn More")
        url = web2_ad_data.get("url")
        image_url = web2_ad_data.get("image_url")
        brand_name = web2_ad_data.get("brand_name")
        
        # Determine category from Web2 data
        category = self._infer_category(web2_ad_data)
        
        # Determine language (default to English)
        language = self._infer_language(web2_ad_data)
        
        # Create ad content
        ad_content = AdContent(
            title=title[:100],  # Limit title length
            description=description[:500],  # Limit description length
            call_to_action=call_to_action,
            url=url,
            image_url=image_url,
            brand_name=brand_name
        )
        
        # Create targeting
        ad_targeting = AdTargeting(
            category=category,
            language=language,
            price_slot=price_slot,
            mime_type=MimeType.JPEG if image_url else None,
            keywords=web2_ad_data.get("keywords", [])
        )
        
        # Calculate expiration (default: 30 days from now)
        expires_at = int(datetime.utcnow().timestamp()) + (30 * 24 * 60 * 60)
        
        # Create NIP-ADS event
        nip_ads_event = NipAdsEvent(
            content=ad_content,
            targeting=ad_targeting,
            advertiser_pubkey=advertiser_pubkey,
            expires_at=expires_at
        )
        
        self.logger.info("NIP-ADS event created successfully",
                        event_id=nip_ads_event.event_id[:16],
                        category=category.value,
                        price_slot=price_slot.value)
        
        return nip_ads_event
    
    def _infer_category(self, web2_ad_data: Dict) -> Category:
        """Infer NIP-ADS category from Web2 ad data."""
        # Try to extract category from Web2 data
        web2_category = web2_ad_data.get("category", "").lower()
        keywords = web2_ad_data.get("keywords", [])
        
        # Category mapping based on keywords and content
        category_map = {
            "tech": Category.TECHNOLOGY,
            "technology": Category.TECHNOLOGY,
            "business": Category.BUSINESS,
            "finance": Category.BUSINESS,
            "entertainment": Category.ENTERTAINMENT,
            "movie": Category.ENTERTAINMENT,
            "music": Category.ENTERTAINMENT,
            "sports": Category.SPORTS,
            "health": Category.HEALTH,
            "fitness": Category.HEALTH,
            "science": Category.SCIENCE,
            "politics": Category.POLITICS,
            "food": Category.FOOD,
            "restaurant": Category.FOOD,
            "travel": Category.TRAVEL,
            "shopping": Category.SHOPPING,
            "retail": Category.SHOPPING,
            "personal": Category.PERSONAL,
        }
        
        # Check category string
        for key, category in category_map.items():
            if key in web2_category:
                return category
        
        # Check keywords
        for keyword in keywords:
            keyword_lower = keyword.lower()
            for key, category in category_map.items():
                if key in keyword_lower:
                    return category
        
        # Default to general category
        return Category.GENERAL
    
    def _infer_language(self, web2_ad_data: Dict) -> Language:
        """Infer language from Web2 ad data."""
        # Try to extract language from Web2 data
        language_code = web2_ad_data.get("language", "en").lower()
        
        # Map to NIP-ADS language enum
        language_map = {
            "en": Language.ENGLISH,
            "zh": Language.CHINESE,
            "es": Language.SPANISH,
            "hi": Language.HINDI,
            "ar": Language.ARABIC,
            "pt": Language.PORTUGUESE,
            "ru": Language.RUSSIAN,
            "ja": Language.JAPANESE,
            "de": Language.GERMAN,
            "fr": Language.FRENCH,
        }
        
        return language_map.get(language_code, Language.ENGLISH)
    
    def calculate_arbitrage_savings(
        self,
        web2_cpc: float,
        nostr_sats_per_click: int,
        btc_price_usd: float = 50000.0
    ) -> Dict[str, float]:
        """
        Calculate cost savings between Web2 and Nostr advertising.
        
        Args:
            web2_cpc: Web2 cost per click in USD
            nostr_sats_per_click: Nostr cost per click in satoshis
            btc_price_usd: Current BTC price in USD
            
        Returns:
            Dictionary with savings metrics
        """
        # Convert satoshis to USD
        sats_to_usd = (nostr_sats_per_click / 100_000_000) * btc_price_usd
        
        # Calculate savings
        savings_usd = web2_cpc - sats_to_usd
        savings_percentage = (savings_usd / web2_cpc) * 100 if web2_cpc > 0 else 0
        
        # Calculate per 1k impressions
        web2_cost_per_1k = web2_cpc * 1000
        nostr_cost_per_1k = sats_to_usd * 1000
        savings_per_1k = web2_cost_per_1k - nostr_cost_per_1k
        
        return {
            "web2_cpc_usd": web2_cpc,
            "nostr_cpc_usd": sats_to_usd,
            "nostr_cpc_sats": nostr_sats_per_click,
            "savings_usd": savings_usd,
            "savings_percentage": savings_percentage,
            "web2_cost_per_1k_usd": web2_cost_per_1k,
            "nostr_cost_per_1k_usd": nostr_cost_per_1k,
            "savings_per_1k_usd": savings_per_1k,
            "message": f"Save {savings_percentage:.1f}% by using Nostr advertising"
        }


# Utility functions for API integration
def create_nip_ads_from_apify(
    apify_data: Dict,
    advertiser_pubkey: str,
    price_slot: str = "BTC1_000"
) -> Dict:
    """
    Create NIP-ADS event from Apify scraped data.
    
    Args:
        apify_data: Apify scraped advertisement data
        advertiser_pubkey: Nostr public key
        price_slot: NIP-ADS price slot string
        
    Returns:
        Dictionary with NIP-ADS event and arbitrage data
    """
    generator = NipAdsGenerator()
    
    # Extract Web2 CPC from Apify data
    web2_cpc = apify_data.get("cpc_usd", 0.5)  # Default 0.5 USD
    web2_impressions = apify_data.get("impressions", 1000)
    
    # Calculate Nostr equivalent cost (conservative estimate: 100 sats per click)
    nostr_sats_per_click = 100
    
    # Create NIP-ADS event
    price_slot_enum = PriceSlot(price_slot)
    nip_ads_event = generator.create_from_web2_ad(
        web2_ad_data=apify_data,
        advertiser_pubkey=advertiser_pubkey,
        price_slot=price_slot_enum
    )
    
    # Calculate arbitrage savings
    savings = generator.calculate_arbitrage_savings(
        web2_cpc=web2_cpc,
        nostr_sats_per_click=nostr_sats_per_click
    )
    
    return {
        "nip_ads_event": nip_ads_event.to_nostr_event(),
        "arbitrage_savings": savings,
        "web2_data": {
            "cpc_usd": web2_cpc,
            "impressions": web2_impressions,
            "total_cost_usd": web2_cpc * web2_impressions
        },
        "nostr_data": {
            "sats_per_click": nostr_sats_per_click,
            "estimated_cost_usd": savings["nostr_cpc_usd"] * web2_impressions
        },
        "metadata": {
            "generated_at": datetime.utcnow().isoformat(),
            "protocol_version": "NIP-ADS-draft",
            "event_kind": 40000
        }
    }