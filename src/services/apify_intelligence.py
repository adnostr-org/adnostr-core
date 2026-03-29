"""
Apify Intelligence Service for AdNostr-Core

This module integrates with Apify to scrape data from Google Ads Transparency and TikTok Scraper.
It focuses on extracting keyword CPC and high-frequency visual features for advertising intelligence.

Author: AdNostr Team
License: MIT
"""

import os
import asyncio
import json
from typing import Dict, List, Any, Optional

import structlog
from apify_client import ApifyClient

logger = structlog.get_logger()

class ApifyIntelligence:
    """
    Service to call Apify for scraping Google Ads Transparency and TikTok data.
    Extracts average CPC for keywords and visual features (color trends, model types).
    """
    
    def __init__(self):
        """Initialize Apify client with API token from environment."""
        self.api_token = os.getenv("APIFY_API_TOKEN", "placeholder-token")
        self.client = ApifyClient(self.api_token) if self.api_token != "placeholder-token" else None
        logger.info("ApifyIntelligence initialized", has_token=bool(self.api_token != "placeholder-token"))
    
    async def scrape_google_ads(self, keywords: List[str], max_results: int = 100) -> Dict[str, Any]:
        """
        Scrape Google Ads Transparency data for given keywords.
        
        Args:
            keywords: List of keywords to search for.
            max_results: Maximum number of results to retrieve.
        
        Returns:
            Dictionary with scraped data including average CPC and visual features.
        """
        if not self.client:
            logger.warning("Apify client not initialized, returning mock data")
            return self._mock_google_data(keywords)
        
        try:
            # Configuration for Google Ads Transparency scraper on Apify
            run_input = {
                "keywords": keywords,
                "maxResults": max_results,
                "country": "US",
                "language": "en"
            }
            
            # Run the actor (scraper) on Apify
            run = self.client.actor("apify/google-ads-transparency").call(run_input=run_input)
            
            # Fetch results
            items = []
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                items.append(item)
            
            # Extract CPC and visual features
            extracted_data = self._extract_google_data(items)
            logger.info("Google Ads data scraped successfully", keyword_count=len(keywords), result_count=len(items))
            return extracted_data
        except Exception as e:
            logger.error("Failed to scrape Google Ads data", error=str(e))
            return self._mock_google_data(keywords)
    
    async def scrape_tiktok_data(self, hashtags: List[str], max_videos: int = 50) -> Dict[str, Any]:
        """
        Scrape TikTok data for given hashtags.
        
        Args:
            hashtags: List of hashtags to search for.
            max_videos: Maximum number of videos to retrieve.
        
        Returns:
            Dictionary with scraped data including engagement metrics and visual features.
        """
        if not self.client:
            logger.warning("Apify client not initialized, returning mock data")
            return self._mock_tiktok_data(hashtags)
        
        try:
            # Configuration for TikTok Scraper on Apify
            run_input = {
                "hashtags": hashtags,
                "maxVideos": max_videos,
                "region": "US"
            }
            
            # Run the actor (scraper) on Apify
            run = self.client.actor("apify/tiktok-scraper").call(run_input=run_input)
            
            # Fetch results
            items = []
            for item in self.client.dataset(run["defaultDatasetId"]).iterate_items():
                items.append(item)
            
            # Extract engagement and visual features
            extracted_data = self._extract_tiktok_data(items)
            logger.info("TikTok data scraped successfully", hashtag_count=len(hashtags), video_count=len(items))
            return extracted_data
        except Exception as e:
            logger.error("Failed to scrape TikTok data", error=str(e))
            return self._mock_tiktok_data(hashtags)
    
    def _extract_google_data(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract relevant data from Google Ads Transparency results.
        
        Args:
            items: List of scraped items from Apify.
        
        Returns:
            Dictionary with average CPC and visual features.
        """
        if not items:
            return {"average_cpc": 0.0, "visual_features": {"color_tendency": "neutral", "model_type": "unknown"}, "keywords": []}
        
        total_cpc = 0.0
        cpc_count = 0
        visual_features = {"colors": [], "models": []}
        keywords = set()
        
        for item in items:
            # Extract CPC if available
            cost = item.get("cost", "")
            if cost and isinstance(cost, (int, float)):
                total_cpc += float(cost)
                cpc_count += 1
            
            # Extract keywords
            if "keywords" in item:
                keywords.update(item.get("keywords", []))
            
            # Extract visual features (mock logic as real data may vary)
            if "creative" in item:
                creative = item.get("creative", {})
                if "dominant_color" in creative:
                    visual_features["colors"].append(creative.get("dominant_color", "neutral"))
                if "model_type" in creative:
                    visual_features["models"].append(creative.get("model_type", "unknown"))
        
        # Calculate average CPC
        average_cpc = total_cpc / cpc_count if cpc_count > 0 else 0.0
        
        # Determine most frequent color and model type
        color_tendency = max(set(visual_features["colors"]), key=visual_features["colors"].count) if visual_features["colors"] else "neutral"
        model_type = max(set(visual_features["models"]), key=visual_features["models"].count) if visual_features["models"] else "unknown"
        
        return {
            "average_cpc": average_cpc,
            "visual_features": {
                "color_tendency": color_tendency,
                "model_type": model_type
            },
            "keywords": list(keywords),
            "source": "google_ads_transparency",
            "item_count": len(items)
        }
    
    def _extract_tiktok_data(self, items: List[Dict[str, Any]]) -> Dict[str, Any]:
        """
        Extract relevant data from TikTok Scraper results.
        
        Args:
            items: List of scraped items from Apify.
        
        Returns:
            Dictionary with engagement metrics and visual features.
        """
        if not items:
            return {"engagement": {"views": 0, "likes": 0, "shares": 0}, "visual_features": {"color_tendency": "neutral", "model_type": "unknown"}, "hashtags": []}
        
        total_views = 0
        total_likes = 0
        total_shares = 0
        visual_features = {"colors": [], "models": []}
        hashtags = set()
        item_count = len(items)
        
        for item in items:
            # Extract engagement metrics
            total_views += item.get("playCount", 0)
            total_likes += item.get("diggCount", 0)
            total_shares += item.get("shareCount", 0)
            
            # Extract hashtags
            if "textExtra" in item:
                for extra in item.get("textExtra", []):
                    if "hashtagName" in extra:
                        hashtags.add(extra.get("hashtagName", ""))
            
            # Extract visual features (mock logic as real data may vary)
            if "videoMeta" in item:
                visual_features["colors"].append("dynamic")  # Placeholder
                visual_features["models"].append("casual")   # Placeholder
        
        # Determine most frequent color and model type
        color_tendency = max(set(visual_features["colors"]), key=visual_features["colors"].count) if visual_features["colors"] else "neutral"
        model_type = max(set(visual_features["models"]), key=visual_features["models"].count) if visual_features["models"] else "unknown"
        
        return {
            "engagement": {
                "views": total_views / item_count if item_count > 0 else 0,
                "likes": total_likes / item_count if item_count > 0 else 0,
                "shares": total_shares / item_count if item_count > 0 else 0
            },
            "visual_features": {
                "color_tendency": color_tendency,
                "model_type": model_type
            },
            "hashtags": list(hashtags),
            "source": "tiktok_scraper",
            "item_count": item_count
        }
    
    def _mock_google_data(self, keywords: List[str]) -> Dict[str, Any]:
        """
        Generate mock Google Ads data when Apify client is not available.
        
        Args:
            keywords: List of keywords for mock data.
        
        Returns:
            Dictionary with mock CPC and visual features.
        """
        return {
            "average_cpc": random.uniform(0.5, 3.0),
            "visual_features": {
                "color_tendency": random.choice(["warm", "cool", "neutral"]),
                "model_type": random.choice(["professional", "casual", "lifestyle"])
            },
            "keywords": keywords,
            "source": "mock_google_data",
            "item_count": random.randint(10, 50)
        }
    
    def _mock_tiktok_data(self, hashtags: List[str]) -> Dict[str, Any]:
        """
        Generate mock TikTok data when Apify client is not available.
        
        Args:
            hashtags: List of hashtags for mock data.
        
        Returns:
            Dictionary with mock engagement and visual features.
        """
        return {
            "engagement": {
                "views": random.randint(1000, 100000),
                "likes": random.randint(100, 10000),
                "shares": random.randint(10, 1000)
            },
            "visual_features": {
                "color_tendency": random.choice(["vibrant", "pastel", "dark"]),
                "model_type": random.choice(["youth", "adult", "mixed"])
            },
            "hashtags": hashtags,
            "source": "mock_tiktok_data",
            "item_count": random.randint(5, 20)
        }
    
    def to_oracle(self, data: Dict[str, Any]) -> 'AdDataOracle':
        """
        Convert scraped data to AdDataOracle object for arbitrage engine.
        
        Args:
            data: Scraped data dictionary.
        
        Returns:
            AdDataOracle object with standardized data.
        """
        return AdDataOracle(
            source=data.get("source", "unknown"),
            average_cpc=data.get("average_cpc", 0.0) if "average_cpc" in data else 0.0,
            engagement=data.get("engagement", {"views": 0, "likes": 0, "shares": 0}),
            visual_features=data.get("visual_features", {"color_tendency": "neutral", "model_type": "unknown"}),
            keywords=data.get("keywords", []),
            hashtags=data.get("hashtags", []),
            item_count=data.get("item_count", 0)
        )

class AdDataOracle:
    """
    Standardized data object for advertising intelligence, used by arbitrage engine.
    """
    
    def __init__(self, source: str, average_cpc: float, engagement: Dict[str, int], visual_features: Dict[str, str], keywords: List[str], hashtags: List[str], item_count: int):
        self.source = source
        self.average_cpc = average_cpc
        self.engagement = engagement
        self.visual_features = visual_features
        self.keywords = keywords
        self.hashtags = hashtags
        self.item_count = item_count
    
    def to_dict(self) -> Dict[str, Any]:
        """
        Convert AdDataOracle to dictionary.
        
        Returns:
            Dictionary representation of the object.
        """
        return {
            "source": self.source,
            "average_cpc": self.average_cpc,
            "engagement": self.engagement,
            "visual_features": self.visual_features,
            "keywords": self.keywords,
            "hashtags": self.hashtags,
            "item_count": self.item_count
        }