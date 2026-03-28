#!/usr/bin/env python3
"""
AdNostr Expert Synchronization Script

This script provides a convenient way to synchronize experts from TickleBell
database to the AdNostr advertisement system.

Usage:
    python sync_experts.py

Requirements:
    - Python 3.8+
    - Access to TickleBell avatar database
    - AdNostr-Core environment configured

Author: AdNostr Team
License: MIT
"""

import asyncio
import sys
from pathlib import Path

# Add src to path for imports
sys.path.insert(0, str(Path(__file__).parent / "src"))

from src.utils.sync_experts import main as sync_main

if __name__ == "__main__":
    asyncio.run(sync_main())