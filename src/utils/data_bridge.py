"""
Data Bridge for AdNostr-Core

This module provides database connectivity and data transformation utilities
for bridging TickleBell expert data with AdNostr advertisement system.

Key Features:
- SQLite database connection to TickleBell avatar database
- URL path transformation for static assets
- Expert creative data extraction (avatars and banners)
- Data synchronization and caching

Author: AdNostr Team
License: MIT
"""

import os
import sqlite3
from typing import Dict, List, Optional, Tuple, Any
from pathlib import Path
import structlog

logger = structlog.get_logger()


class DataBridge:
    """
    Database bridge for connecting to TickleBell avatar database.

    This class handles:
    - Connection management to SQLite databases
    - URL transformation for static assets
    - Expert data extraction and processing
    - Error handling and logging
    """

    def __init__(self, db_path: Optional[str] = None):
        """
        Initialize the DataBridge with database path.

        Args:
            db_path: Path to the TickleBell avatar database. If None, reads from .env
        """
        if db_path is None:
            db_path = os.getenv("TICKLEBELL_AVATAR_DB")

        if not db_path:
            raise ValueError("TICKLEBELL_AVATAR_DB environment variable not set")

        self.db_path = Path(db_path)
        self._connection: Optional[sqlite3.Connection] = None

        if not self.db_path.exists():
            logger.warning("Database file does not exist", path=str(self.db_path))

        logger.info("DataBridge initialized", db_path=str(self.db_path))

    def connect(self) -> sqlite3.Connection:
        """
        Establish database connection.

        Returns:
            SQLite connection object

        Raises:
            sqlite3.Error: If connection fails
        """
        if self._connection is None:
            try:
                self._connection = sqlite3.connect(str(self.db_path))
                self._connection.row_factory = sqlite3.Row  # Enable column access by name
                logger.info("Database connection established")
            except sqlite3.Error as e:
                logger.error("Failed to connect to database", error=str(e))
                raise
        return self._connection

    def disconnect(self) -> None:
        """Close database connection."""
        if self._connection:
            self._connection.close()
            self._connection = None
            logger.info("Database connection closed")

    def __enter__(self):
        """Context manager entry."""
        return self.connect()

    def __exit__(self, exc_type, exc_val, exc_tb):
        """Context manager exit."""
        self.disconnect()

    @staticmethod
    def get_clean_url(dirty_path: str) -> str:
        """
        Transform static asset paths to clean public URLs.

        Converts:
        - /static/avatars/ -> https://adnostr.org/assets/experts/
        - /static/covers/horizontal/ -> https://adnostr.org/assets/banners/

        Args:
            dirty_path: The original path from database

        Returns:
            Clean public URL

        Raises:
            ValueError: If path format is unrecognized
        """
        if not dirty_path:
            return ""

        # Remove leading slash if present
        clean_path = dirty_path.lstrip('/')

        if clean_path.startswith('static/avatars/'):
            # Transform avatar path
            filename = clean_path.replace('static/avatars/', '')
            return f"https://adnostr.org/assets/experts/{filename}"
        elif clean_path.startswith('static/covers/horizontal/'):
            # Transform banner/cover path
            filename = clean_path.replace('static/covers/horizontal/', '')
            return f"https://adnostr.org/assets/banners/{filename}"
        else:
            logger.warning("Unrecognized path format", path=dirty_path)
            # Return original path if not recognized (backward compatibility)
            return dirty_path

    def get_expert_creative(self, expert_id: int) -> Optional[Dict[str, Any]]:
        """
        Extract expert's creative assets (avatar and banner) from avatar_queue table.

        Args:
            expert_id: The expert ID to look up

        Returns:
            Dictionary containing avatar and banner URLs, or None if not found

        Raises:
            sqlite3.Error: If database query fails
        """
        query = """
        SELECT
            expert_id,
            avatar_path,
            banner_path,
            created_at,
            updated_at
        FROM avatar_queue
        WHERE expert_id = ?
        ORDER BY updated_at DESC
        LIMIT 1
        """

        try:
            with self.connect() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (expert_id,))
                row = cursor.fetchone()

                if row:
                    creative_data = {
                        "expert_id": row["expert_id"],
                        "avatar_url": self.get_clean_url(row["avatar_path"]) if row["avatar_path"] else None,
                        "banner_url": self.get_clean_url(row["banner_path"]) if row["banner_path"] else None,
                        "created_at": row["created_at"],
                        "updated_at": row["updated_at"]
                    }

                    logger.debug("Expert creative data retrieved",
                               expert_id=expert_id,
                               has_avatar=bool(creative_data["avatar_url"]),
                               has_banner=bool(creative_data["banner_url"]))

                    return creative_data
                else:
                    logger.warning("Expert not found in avatar_queue", expert_id=expert_id)
                    return None

        except sqlite3.Error as e:
            logger.error("Database query failed", error=str(e), expert_id=expert_id)
            raise

    def get_all_experts_creative(self, limit: int = 1000) -> List[Dict[str, Any]]:
        """
        Retrieve creative data for all experts, limited to prevent memory issues.

        Args:
            limit: Maximum number of experts to retrieve

        Returns:
            List of expert creative data dictionaries

        Raises:
            sqlite3.Error: If database query fails
        """
        query = """
        SELECT
            expert_id,
            avatar_path,
            banner_path,
            created_at,
            updated_at
        FROM avatar_queue
        ORDER BY updated_at DESC
        LIMIT ?
        """

        try:
            with self.connect() as conn:
                cursor = conn.cursor()
                cursor.execute(query, (limit,))
                rows = cursor.fetchall()

                experts_data = []
                for row in rows:
                    creative_data = {
                        "expert_id": row["expert_id"],
                        "avatar_url": self.get_clean_url(row["avatar_path"]) if row["avatar_path"] else None,
                        "banner_url": self.get_clean_url(row["banner_path"]) if row["banner_path"] else None,
                        "created_at": row["created_at"],
                        "updated_at": row["updated_at"]
                    }
                    experts_data.append(creative_data)

                logger.info("Retrieved expert creative data",
                           count=len(experts_data),
                           limit=limit)

                return experts_data

        except sqlite3.Error as e:
            logger.error("Database query failed", error=str(e))
            raise

    def get_expert_count(self) -> int:
        """
        Get the total count of experts in the avatar_queue table.

        Returns:
            Number of experts

        Raises:
            sqlite3.Error: If database query fails
        """
        query = "SELECT COUNT(*) as count FROM avatar_queue"

        try:
            with self.connect() as conn:
                cursor = conn.cursor()
                cursor.execute(query)
                row = cursor.fetchone()
                count = row["count"] if row else 0

                logger.debug("Expert count retrieved", count=count)
                return count

        except sqlite3.Error as e:
            logger.error("Failed to get expert count", error=str(e))
            raise

    def validate_database_schema(self) -> bool:
        """
        Validate that the database has the expected schema.

        Returns:
            True if schema is valid, False otherwise
        """
        required_tables = ["avatar_queue"]
        required_columns = {
            "avatar_queue": ["expert_id", "avatar_path", "banner_path", "created_at", "updated_at"]
        }

        try:
            with self.connect() as conn:
                cursor = conn.cursor()

                # Check if tables exist
                cursor.execute("SELECT name FROM sqlite_master WHERE type='table'")
                existing_tables = {row[0] for row in cursor.fetchall()}

                for table in required_tables:
                    if table not in existing_tables:
                        logger.error("Required table missing", table=table)
                        return False

                # Check table schemas
                for table, columns in required_columns.items():
                    cursor.execute(f"PRAGMA table_info({table})")
                    existing_columns = {row[1] for row in cursor.fetchall()}

                    for column in columns:
                        if column not in existing_columns:
                            logger.error("Required column missing",
                                       table=table, column=column)
                            return False

                logger.info("Database schema validation passed")
                return True

        except sqlite3.Error as e:
            logger.error("Schema validation failed", error=str(e))
            return False