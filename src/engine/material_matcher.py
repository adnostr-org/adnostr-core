"""
Material Matcher for AdNostr-Core

This module matches keywords and visual features to high-conversion materials from a local database.
It retrieves the most suitable material IDs based on tags and returns URLs, hashes, and Nostr metadata.

Author: AdNostr Team
License: MIT
"""

import os
import sqlite3
import hashlib
from typing import Dict, List, Any, Optional

import structlog

logger = structlog.get_logger()

class MaterialMatcher:
    """
    Engine to match keywords and visual features to materials in a local database.
    Retrieves material IDs, URLs, hashes, and associated Nostr metadata.
    """
    
    def __init__(self, db_path: str = "test_experts.db"):
        """Initialize MaterialMatcher with path to local database."""
        self.db_path = os.getenv("MATERIAL_DB_PATH", db_path)
        self.conn = None
        logger.info("MaterialMatcher initialized", db_path=self.db_path)
    
    def connect(self):
        """Connect to the local SQLite database."""
        try:
            self.conn = sqlite3.connect(self.db_path)
            self.conn.row_factory = sqlite3.Row
            logger.info("Connected to material database", db_path=self.db_path)
        except sqlite3.Error as e:
            logger.error("Failed to connect to material database", error=str(e))
            raise
    
    def disconnect(self):
        """Disconnect from the local SQLite database."""
        if self.conn:
            self.conn.close()
            logger.info("Disconnected from material database")
            self.conn = None
    
    def match_material(self, keywords: List[str], visual_features: Dict[str, str], max_results: int = 1) -> List[Dict[str, Any]]:
        """
        Match materials based on keywords and visual features.
        
        Args:
            keywords: List of keywords to match against tags.
            visual_features: Dictionary of visual features (e.g., color_tendency, model_type).
            max_results: Maximum number of matching results to return.
        
        Returns:
            List of dictionaries containing material ID, URL, hash, and Nostr metadata.
        """
        if not self.conn:
            self.connect()
        
        try:
            cursor = self.conn.cursor()
            
            # Construct query to match materials based on tags and visual features
            query = """
                SELECT id, url, tags, metadata
                FROM materials
                WHERE 1=1
            """
            params = []
            
            # Add keyword matching for tags
            if keywords:
                keyword_conditions = " OR ".join(["tags LIKE ?" for _ in keywords])
                query += f" AND ({keyword_conditions})"
                params.extend([f"%{kw}%" for kw in keywords])
            
            # Add visual feature matching if provided
            if visual_features.get("color_tendency"):
                query += " AND tags LIKE ?"
                params.append(f"%color:{visual_features['color_tendency']}%")
            
            if visual_features.get("model_type"):
                query += " AND tags LIKE ?"
                params.append(f"%model:{visual_features['model_type']}%")
            
            # Limit results
            query += " LIMIT ?"
            params.append(max_results)
            
            cursor.execute(query, params)
            results = cursor.fetchall()
            
            matched_materials = []
            for row in results:
                material_id = row["id"]
                url = row["url"]
                metadata_str = row["metadata"]
                try:
                    metadata = json.loads(metadata_str) if metadata_str else {}
                except json.JSONDecodeError:
                    metadata = {}
                
                # Calculate hash of URL or content (mock implementation)
                material_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
                
                matched_materials.append({
                    "id": material_id,
                    "url": url,
                    "hash": material_hash,
                    "nostr_metadata": {
                        "event_kind": metadata.get("event_kind", 1),
                        "tags": metadata.get("tags", [["t", "material"]]),
                        "created_at": metadata.get("created_at", int(time.time()))
                    }
                })
            
            logger.info("Materials matched successfully", keyword_count=len(keywords), match_count=len(matched_materials))
            return matched_materials
        
        except sqlite3.Error as e:
            logger.error("Database error during material matching", error=str(e))
            return self._mock_material_match(keywords, visual_features, max_results)
        
        finally:
            if os.getenv("KEEP_DB_CONNECTION", "False").lower() != "true":
                self.disconnect()
    
    def _mock_material_match(self, keywords: List[str], visual_features: Dict[str, str], max_results: int) -> List[Dict[str, Any]]:
        """
        Generate mock material matches when database is unavailable.
        
        Args:
            keywords: List of keywords (used for context in real implementation).
            visual_features: Dictionary of visual features (used for context).
            max_results: Maximum number of results to return.
        
        Returns:
            List of mock material matches with IDs, URLs, hashes, and Nostr metadata.
        """
        logger.warning("Using mock material matching due to database unavailability")
        mock_materials = []
        for i in range(min(max_results, 3)):  # Limit to 3 mock results
            material_id = f"ID_{random.randint(100, 999)}"
            url = f"https://example.com/material/{material_id}.jpg"
            material_hash = hashlib.sha256(url.encode()).hexdigest()[:16]
            
            mock_materials.append({
                "id": material_id,
                "url": url,
                "hash": material_hash,
                "nostr_metadata": {
                    "event_kind": 1,
                    "tags": [["t", "material"], ["t", "adnostr"]],
                    "created_at": int(time.time())
                }
            })
        
        return mock_materials