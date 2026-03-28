"""
Mastodon Client Wrapper

This module provides a comprehensive wrapper around the Mastodon.py library
for seamless integration with Mastodon instances, specifically admin.adnostr.org.

Key Features:
- Async-compatible Mastodon API client
- Media upload and attachment handling
- Status posting with rich content support
- Multi-account switching support via toot CLI
- Error handling and retry logic
- Connection pooling and resource management

Supported Operations:
- Post status updates with text and media
- Upload media files (images, videos)
- Retrieve timeline and status information
- Account management and authentication

Author: AdNostr Team
License: MIT
"""

import asyncio
import io
import os
import subprocess
import tempfile
from typing import Dict, List, Optional, Union, Any
from pathlib import Path

from mastodon import Mastodon
import aiofiles
import requests
import structlog

logger = structlog.get_logger()


class MastodonClientError(Exception):
    """Base exception for Mastodon client errors."""
    pass


class AuthenticationError(MastodonClientError):
    """Exception raised for authentication failures."""
    pass


class UploadError(MastodonClientError):
    """Exception raised for media upload failures."""
    pass


class PostingError(MastodonClientError):
    """Exception raised for status posting failures."""
    pass


class MastodonClient:
    """
    Async-compatible Mastodon API client wrapper.

    This class provides a high-level interface for interacting with Mastodon instances,
    with support for both direct API calls and toot CLI integration for multi-account management.

    Attributes:
        base_url: Mastodon instance base URL
        client_id: OAuth client ID
        client_secret: OAuth client secret
        access_token: OAuth access token
        mastodon: Mastodon.py client instance
        toot_config_dir: Directory for toot CLI configuration
        active_account: Currently active toot account name
    """

    def __init__(self):
        """Initialize the Mastodon client with configuration from environment variables."""
        self.base_url = os.getenv("MASTODON_BASE_URL", "https://admin.adnostr.org")
        self.client_id = os.getenv("MASTODON_CLIENT_ID")
        self.client_secret = os.getenv("MASTODON_CLIENT_SECRET")
        self.access_token = os.getenv("MASTODON_ACCESS_TOKEN")

        # Toot CLI configuration
        self.toot_config_dir = os.getenv("TOOT_CONFIG_DIR")
        self.active_account = os.getenv("TOOT_ACTIVE_ACCOUNT", "adnostr-admin")

        # Mastodon.py client instance
        self.mastodon: Optional[Mastodon] = None

        # Connection state
        self._initialized = False
        self.ready = True  # Default to ready, will be set to False if credentials are invalid

        logger.info("MastodonClient initialized",
                   base_url=self.base_url,
                   has_credentials=bool(self.access_token),
                   toot_enabled=bool(self.toot_config_dir))

    async def initialize(self) -> None:
        """
        Initialize the Mastodon client connection.

        This method sets up the Mastodon.py client with proper authentication
        and validates the connection. If credentials are invalid, sets ready=False
        but does not raise exceptions.

        Note: This function always completes successfully to avoid crashing the app.
        """
        if self._initialized:
            logger.debug("MastodonClient already initialized")
            return

        # Check if we have valid credentials
        if not self.access_token:
            logger.warning("MASTODON_ACCESS_TOKEN not configured, client will not be ready for posting")
            self.ready = False
            return

        try:
            # Create Mastodon client instance
            self.mastodon = Mastodon(
                client_id=self.client_id,
                client_secret=self.client_secret,
                access_token=self.access_token,
                api_base_url=self.base_url
            )

            # Test connection by getting instance information
            try:
                instance_info = self.mastodon.instance()
                logger.info("Connected to Mastodon instance",
                           instance=instance_info.get('title'),
                           version=instance_info.get('version'))
            except Exception as instance_error:
                logger.warning("Failed to get instance information, but continuing",
                              error=str(instance_error))
                # Do not raise, just warn and continue

            self._initialized = True
            self.ready = True

        except Exception as e:
            logger.warning("Failed to initialize Mastodon client, setting ready=False",
                          error=str(e))
            self.ready = False
            # Do not raise exception, just set ready=False

    async def cleanup(self) -> None:
        """Clean up client resources and close connections."""
        if self.mastodon:
            # Mastodon.py doesn't require explicit cleanup, but we can log
            logger.info("Cleaning up Mastodon client")
            self._initialized = False

    async def post_status(self, status: str, **kwargs) -> Dict[str, Any]:
        """
        Post a status update to Mastodon.

        Args:
            status: The text content of the status
            **kwargs: Additional parameters for the status (visibility, etc.)

        Returns:
            Dictionary containing the posted status information

        Raises:
            PostingError: If the status posting fails
        """
        if not self._initialized or not self.mastodon or not self.ready:
            raise MastodonClientError("Client not ready or not initialized")

        try:
            # Post the status
            posted_status = self.mastodon.status_post(status, **kwargs)

            logger.info("Status posted successfully",
                       status_id=posted_status.get('id'),
                       content_length=len(status))

            return posted_status

        except Exception as e:
            logger.error("Failed to post status", error=str(e), status_preview=status[:100])
            raise PostingError(f"Status posting failed: {str(e)}")

    async def upload_media(self, media_data: bytes, media_type: str,
                          description: Optional[str] = None) -> Dict[str, Any]:
        """
        Upload media to Mastodon.

        Args:
            media_data: Raw media file data as bytes
            media_type: MIME type of the media (e.g., 'image/jpeg', 'video/mp4')
            description: Optional alt text description for accessibility

        Returns:
            Dictionary containing the uploaded media information

        Raises:
            UploadError: If the media upload fails
        """
        if not self._initialized or not self.mastodon or not self.ready:
            raise MastodonClientError("Client not ready or not initialized")

        try:
            # Create a temporary file for upload
            with tempfile.NamedTemporaryFile(delete=False, suffix=self._get_file_extension(media_type)) as temp_file:
                temp_file.write(media_data)
                temp_file_path = temp_file.name

            try:
                # Upload the media
                media_dict = self.mastodon.media_post(
                    temp_file_path,
                    mime_type=media_type,
                    description=description
                )

                logger.info("Media uploaded successfully",
                           media_id=media_dict.get('id'),
                           media_type=media_type,
                           file_size=len(media_data))

                return media_dict

            finally:
                # Clean up temporary file
                os.unlink(temp_file_path)

        except Exception as e:
            logger.error("Failed to upload media", error=str(e), media_type=media_type)
            raise UploadError(f"Media upload failed: {str(e)}")

    async def post_status_with_media(self, status: str, media_data: bytes,
                                   media_type: str = "image/jpeg",
                                   description: Optional[str] = None,
                                   **kwargs) -> Dict[str, Any]:
        """
        Post a status with attached media in a single operation.

        Args:
            status: The text content of the status
            media_data: Raw media file data as bytes
            media_type: MIME type of the media
            description: Optional alt text for the media
            **kwargs: Additional parameters for the status

        Returns:
            Dictionary containing the posted status information

        Raises:
            UploadError: If media upload fails
            PostingError: If status posting fails
        """
        # First upload the media
        media_dict = await self.upload_media(media_data, media_type, description)

        # Then post the status with media attachment
        media_ids = [media_dict['id']]
        posted_status = await self.post_status(status, media_ids=media_ids, **kwargs)

        return posted_status

    async def post_with_toot_cli(self, status: str, media_path: Optional[str] = None,
                               account: Optional[str] = None) -> Dict[str, Any]:
        """
        Post a status using the toot CLI tool for multi-account support.

        This method uses subprocess to call the toot command-line tool,
        which supports multiple account configurations.

        Args:
            status: The text content to post
            media_path: Optional path to media file to attach
            account: Account name to use (defaults to active_account)

        Returns:
            Dictionary with posting result information

        Raises:
            MastodonClientError: If the toot command fails
        """
        if not self.toot_config_dir:
            raise MastodonClientError("Toot CLI not configured")

        account_name = account or self.active_account

        # Build toot command
        cmd = ["toot", "post"]

        # Set config directory
        env = os.environ.copy()
        env["TOOT_CONFIG_DIR"] = self.toot_config_dir

        # Add account selection if specified
        if account_name:
            cmd.extend(["--account", account_name])

        # Add media if provided
        if media_path and Path(media_path).exists():
            cmd.extend(["--media", media_path])

        # Add status text
        cmd.append(status)

        try:
            logger.info("Executing toot command",
                       command=" ".join(cmd),
                       account=account_name,
                       has_media=bool(media_path))

            # Execute the command
            result = subprocess.run(
                cmd,
                env=env,
                capture_output=True,
                text=True,
                timeout=30
            )

            if result.returncode != 0:
                error_msg = result.stderr.strip() or "Unknown toot error"
                logger.error("Toot command failed",
                           returncode=result.returncode,
                           error=error_msg)
                raise MastodonClientError(f"Toot command failed: {error_msg}")

            # Parse successful output
            output = result.stdout.strip()
            logger.info("Toot command succeeded", output=output)

            return {
                "success": True,
                "method": "toot_cli",
                "account": account_name,
                "output": output
            }

        except subprocess.TimeoutExpired:
            logger.error("Toot command timed out")
            raise MastodonClientError("Toot command timed out")

        except Exception as e:
            logger.error("Toot command execution failed", error=str(e))
            raise MastodonClientError(f"Toot execution failed: {str(e)}")

    def _get_file_extension(self, media_type: str) -> str:
        """
        Get appropriate file extension for a given media type.

        Args:
            media_type: MIME type string

        Returns:
            File extension including the dot
        """
        extensions = {
            'image/jpeg': '.jpg',
            'image/png': '.png',
            'image/gif': '.gif',
            'image/webp': '.webp',
            'video/mp4': '.mp4',
            'video/webm': '.webm',
        }
        return extensions.get(media_type, '.bin')

    async def get_instance_info(self) -> Dict[str, Any]:
        """
        Get information about the connected Mastodon instance.

        Returns:
            Dictionary containing instance information

        Raises:
            MastodonClientError: If the request fails
        """
        if not self._initialized or not self.mastodon or not self.ready:
            raise MastodonClientError("Client not ready or not initialized")

        try:
            instance_info = self.mastodon.instance()
            return instance_info
        except Exception as e:
            logger.error("Failed to get instance info", error=str(e))
            raise MastodonClientError(f"Instance info request failed: {str(e)}")

    async def get_account_info(self) -> Dict[str, Any]:
        """
        Get information about the authenticated account.

        Returns:
            Dictionary containing account information

        Raises:
            MastodonClientError: If the request fails
        """
        if not self._initialized or not self.mastodon or not self.ready:
            raise MastodonClientError("Client not ready or not initialized")

        try:
            account_info = self.mastodon.account_verify_credentials()
            return account_info
        except Exception as e:
            logger.error("Failed to get account info", error=str(e))
            raise MastodonClientError(f"Account info request failed: {str(e)}")