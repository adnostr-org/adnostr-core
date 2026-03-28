"""
Expert Synchronization Tool for AdNostr-Core

This script synchronizes expert data from TickleBell database to AdNostr
local advertisement index. It provides a one-click solution to import
1000+ experts with their creative assets.

Key Features:
- Batch synchronization of expert data
- Progress tracking and error handling
- Duplicate detection and data validation
- Performance optimized for large datasets
- Logging for monitoring and debugging

Usage:
    python -m src.utils.sync_experts

Author: AdNostr Team
License: MIT
"""

import asyncio
import os
import sqlite3
import sys
from pathlib import Path
from typing import Dict, List, Optional, Any
from datetime import datetime
import structlog

from .data_bridge import DataBridge

logger = structlog.get_logger()


class ExpertSyncError(Exception):
    """Exception raised for synchronization errors."""
    pass


class ExpertSynchronizer:
    """
    Synchronizes expert data from TickleBell to AdNostr database.

    This class handles the complete synchronization process including:
    - Database connections and schema validation
    - Batch data extraction and transformation
    - Duplicate handling and conflict resolution
    - Progress monitoring and error recovery
    """

    def __init__(self, source_db_path: Optional[str] = None, target_db_path: str = "adnostr_data.db"):
        """
        Initialize the synchronizer.

        Args:
            source_db_path: Path to TickleBell database (reads from .env if None)
            target_db_path: Path to AdNostr local database
        """
        self.source_db_path = source_db_path
        self.target_db_path = Path(target_db_path)
        self.data_bridge: Optional[DataBridge] = None
        self.target_conn: Optional[sqlite3.Connection] = None

        logger.info("ExpertSynchronizer initialized",
                   source_db=str(source_db_path),
                   target_db=str(self.target_db_path))

    async def sync_experts(self, batch_size: int = 100, max_experts: int = 1000) -> Dict[str, Any]:
        """
        Perform the complete expert synchronization.

        Args:
            batch_size: Number of experts to process in each batch
            max_experts: Maximum number of experts to synchronize

        Returns:
            Synchronization results summary

        Raises:
            ExpertSyncError: If synchronization fails
        """
        start_time = datetime.utcnow()

        try:
            # Initialize connections
            await self._initialize_connections()

            # Validate schemas
            await self._validate_schemas()

            # Create target tables if needed
            await self._ensure_target_tables()

            # Get source data count
            total_experts = await self._get_source_expert_count()
            sync_count = min(total_experts, max_experts)

            logger.info("Starting expert synchronization",
                       total_experts=total_experts,
                       sync_count=sync_count,
                       batch_size=batch_size)

            # Perform batch synchronization
            results = await self._sync_in_batches(batch_size, sync_count)

            # Generate summary
            end_time = datetime.utcnow()
            duration = (end_time - start_time).total_seconds()

            summary = {
                "success": True,
                "total_experts": total_experts,
                "synced_experts": results["synced"],
                "skipped_experts": results["skipped"],
                "failed_experts": results["failed"],
                "duration_seconds": duration,
                "batches_processed": results["batches"],
                "errors": results["errors"]
            }

            logger.info("Expert synchronization completed",
                       summary=summary)

            return summary

        except Exception as e:
            logger.error("Expert synchronization failed", error=str(e))
            raise ExpertSyncError(f"Synchronization failed: {str(e)}") from e
        finally:
            await self._cleanup_connections()

    async def _initialize_connections(self) -> None:
        """Initialize database connections."""
        try:
            # Initialize data bridge for source
            self.data_bridge = DataBridge(self.source_db_path)

            # Initialize target connection
            self.target_conn = sqlite3.connect(str(self.target_db_path))
            self.target_conn.row_factory = sqlite3.Row

            logger.info("Database connections initialized")

        except Exception as e:
            logger.error("Failed to initialize connections", error=str(e))
            raise

    async def _cleanup_connections(self) -> None:
        """Clean up database connections."""
        if self.data_bridge:
            self.data_bridge.disconnect()
        if self.target_conn:
            self.target_conn.close()
            self.target_conn = None

    async def _validate_schemas(self) -> None:
        """Validate source and target database schemas."""
        if not self.data_bridge:
            raise ExpertSyncError("Data bridge not initialized")

        # Validate source schema
        if not self.data_bridge.validate_database_schema():
            raise ExpertSyncError("Source database schema validation failed")

        logger.info("Database schemas validated")

    async def _ensure_target_tables(self) -> None:
        """Ensure target database has required tables."""
        if not self.target_conn:
            raise ExpertSyncError("Target connection not initialized")

        # Create experts table if it doesn't exist
        create_table_sql = """
        CREATE TABLE IF NOT EXISTS experts (
            expert_id INTEGER PRIMARY KEY,
            avatar_url TEXT,
            banner_url TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            last_sync TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(expert_id)
        );

        CREATE INDEX IF NOT EXISTS idx_experts_updated ON experts(updated_at);
        CREATE INDEX IF NOT EXISTS idx_experts_sync ON experts(last_sync);
        """

        # Create ad_clicks table for click tracking
        create_clicks_table_sql = """
        CREATE TABLE IF NOT EXISTS ad_clicks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            expert_id INTEGER,
            click_source TEXT,
            revenue_calculated REAL,
            clicked_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            ip_hash TEXT,
            campaign_id TEXT,
            FOREIGN KEY (expert_id) REFERENCES experts (expert_id)
        );

        CREATE INDEX IF NOT EXISTS idx_clicks_expert ON ad_clicks(expert_id);
        CREATE INDEX IF NOT EXISTS idx_clicks_source ON ad_clicks(click_source);
        CREATE INDEX IF NOT EXISTS idx_clicks_time ON ad_clicks(clicked_at);
        """

        try:
            self.target_conn.executescript(create_table_sql)
            self.target_conn.executescript(create_clicks_table_sql)
            self.target_conn.commit()

            logger.info("Target database tables ensured")

        except sqlite3.Error as e:
            logger.error("Failed to create target tables", error=str(e))
            raise ExpertSyncError(f"Table creation failed: {str(e)}") from e

    async def _get_source_expert_count(self) -> int:
        """Get the total count of experts in source database."""
        if not self.data_bridge:
            raise ExpertSyncError("Data bridge not initialized")

        return self.data_bridge.get_expert_count()

    async def _sync_in_batches(self, batch_size: int, total_count: int) -> Dict[str, Any]:
        """
        Synchronize experts in batches for performance.

        Args:
            batch_size: Size of each batch
            total_count: Total number of experts to sync

        Returns:
            Synchronization results
        """
        results = {
            "synced": 0,
            "skipped": 0,
            "failed": 0,
            "batches": 0,
            "errors": []
        }

        for offset in range(0, total_count, batch_size):
            batch_limit = min(batch_size, total_count - offset)
            batch_results = await self._sync_batch(offset, batch_limit)

            results["synced"] += batch_results["synced"]
            results["skipped"] += batch_results["skipped"]
            results["failed"] += batch_results["failed"]
            results["batches"] += 1
            results["errors"].extend(batch_results["errors"])

            # Progress logging
            processed = offset + batch_limit
            progress = (processed / total_count) * 100
            logger.info("Batch synchronization progress",
                       batch=results["batches"],
                       processed=processed,
                       total=total_count,
                       progress=f"{progress:.1f}%",
                       synced=results["synced"])

        return results

    async def _sync_batch(self, offset: int, limit: int) -> Dict[str, Any]:
        """
        Synchronize a single batch of experts.

        Args:
            offset: Starting offset for the batch
            limit: Number of experts in this batch

        Returns:
            Batch synchronization results
        """
        if not self.data_bridge or not self.target_conn:
            raise ExpertSyncError("Connections not initialized")

        batch_results = {
            "synced": 0,
            "skipped": 0,
            "failed": 0,
            "errors": []
        }

        try:
            # Get batch data from source
            batch_data = await self._get_batch_data(offset, limit)

            # Process each expert
            for expert_data in batch_data:
                try:
                    await self._sync_single_expert(expert_data)
                    batch_results["synced"] += 1
                except Exception as e:
                    batch_results["failed"] += 1
                    error_msg = f"Failed to sync expert {expert_data.get('expert_id')}: {str(e)}"
                    batch_results["errors"].append(error_msg)
                    logger.warning("Expert sync failed", error=error_msg)

            self.target_conn.commit()

        except Exception as e:
            batch_results["failed"] += limit  # Mark entire batch as failed
            batch_results["errors"].append(f"Batch sync failed: {str(e)}")
            logger.error("Batch synchronization failed", error=str(e))

        return batch_results

    async def _get_batch_data(self, offset: int, limit: int) -> List[Dict[str, Any]]:
        """Get a batch of expert data from source database."""
        if not self.data_bridge:
            raise ExpertSyncError("Data bridge not initialized")

        # This is a simplified implementation - in practice, you'd modify DataBridge
        # to support offset/limit queries
        all_data = self.data_bridge.get_all_experts_creative(limit=10000)  # Get all, then slice
        return all_data[offset:offset + limit]

    async def _sync_single_expert(self, expert_data: Dict[str, Any]) -> None:
        """
        Synchronize a single expert to target database.

        Args:
            expert_data: Expert data from source

        Raises:
            sqlite3.Error: If database operation fails
        """
        if not self.target_conn:
            raise ExpertSyncError("Target connection not initialized")

        expert_id = expert_data["expert_id"]

        # Check if expert already exists
        cursor = self.target_conn.cursor()
        cursor.execute("SELECT expert_id FROM experts WHERE expert_id = ?", (expert_id,))
        existing = cursor.fetchone()

        if existing:
            # Update existing expert
            cursor.execute("""
                UPDATE experts
                SET avatar_url = ?, banner_url = ?, updated_at = CURRENT_TIMESTAMP, last_sync = CURRENT_TIMESTAMP
                WHERE expert_id = ?
            """, (
                expert_data["avatar_url"],
                expert_data["banner_url"],
                expert_id
            ))
        else:
            # Insert new expert
            cursor.execute("""
                INSERT INTO experts (expert_id, avatar_url, banner_url, created_at, updated_at, last_sync)
                VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            """, (
                expert_id,
                expert_data["avatar_url"],
                expert_data["banner_url"],
                expert_data.get("created_at", datetime.utcnow().isoformat())
            ))


async def main():
    """
    Main entry point for the expert synchronization script.

    Usage: python -m src.utils.sync_experts [options]
    """
    import argparse

    parser = argparse.ArgumentParser(description="Synchronize experts from TickleBell to AdNostr")
    parser.add_argument("--batch-size", type=int, default=100,
                       help="Number of experts to process in each batch")
    parser.add_argument("--max-experts", type=int, default=1000,
                       help="Maximum number of experts to synchronize")
    parser.add_argument("--target-db", type=str, default="adnostr_data.db",
                       help="Path to target AdNostr database")
    parser.add_argument("--verbose", action="store_true",
                       help="Enable verbose logging")

    args = parser.parse_args()

    # Configure logging
    if args.verbose:
        import logging
        logging.basicConfig(level=logging.INFO)

    try:
        synchronizer = ExpertSynchronizer(target_db_path=args.target_db)
        results = await synchronizer.sync_experts(
            batch_size=args.batch_size,
            max_experts=args.max_experts
        )

        print("✅ Expert synchronization completed!")
        print(f"📊 Synced: {results['synced_experts']}")
        print(f"⏭️  Skipped: {results['skipped_experts']}")
        print(f"❌ Failed: {results['failed_experts']}")
        print(f"⏱️  Duration: {results['duration_seconds']:.2f} seconds")

        if results['errors']:
            print("⚠️  Errors encountered:")
            for error in results['errors'][:10]:  # Show first 10 errors
                print(f"   - {error}")
            if len(results['errors']) > 10:
                print(f"   ... and {len(results['errors']) - 10} more errors")

        sys.exit(0)

    except ExpertSyncError as e:
        print(f"❌ Synchronization failed: {str(e)}")
        sys.exit(1)
    except Exception as e:
        print(f"💥 Unexpected error: {str(e)}")
        sys.exit(1)


if __name__ == "__main__":
    asyncio.run(main())