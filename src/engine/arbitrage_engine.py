"""
Arbitrage Engine for AdNostr-Core

This module calculates cost savings by comparing Web2 CPC with Nostr Sats per 1k impressions.
It includes an alert mechanism to pause campaigns if Nostr costs exceed 50% of Web2 costs.

Author: AdNostr Team
License: MIT
"""

import os
from datetime import datetime
from typing import Dict, Any, Optional

import structlog

logger = structlog.get_logger()

class ArbitrageEngine:
    """
    Engine to calculate arbitrage opportunities between Web2 CPC and Nostr Sats costs.
    Provides savings calculations and alerts for cost thresholds.
    """
    
    def __init__(self, exchange_rate: float = None):
        """Initialize ArbitrageEngine with Bitcoin exchange rate (USD per BTC)."""
        self.default_exchange_rate = float(os.getenv("BTC_USD_RATE", "50000.0"))  # Default: 50,000 USD/BTC
        self.exchange_rate = exchange_rate if exchange_rate else self.default_exchange_rate
        self.web2_cpc_threshold = float(os.getenv("WEB2_CPC_THRESHOLD", "0.5"))  # Default: 50% of Web2 CPC
        logger.info("ArbitrageEngine initialized", exchange_rate=self.exchange_rate, threshold=self.web2_cpc_threshold)
    
    def calculate_savings(self, web2_cpc: float, nostr_sats_per_1k: float) -> Dict[str, Any]:
        """
        Calculate savings by comparing Web2 CPC with Nostr Sats per 1k impressions.
        
        Formula: Savings = (Web2_CPC * 1000) - (Nostr_Sats_Per_1k_Impression / Exchange_Rate)
        
        Args:
            web2_cpc: Cost per click on Web2 platforms (in USD).
            nostr_sats_per_1k: Cost in Sats per 1000 impressions on Nostr.
        
        Returns:
            Dictionary with savings, cost comparison, and alert status.
        """
        try:
            # Calculate Web2 cost per 1000 clicks
            web2_cost_per_1k = web2_cpc * 1000
            
            # Convert Nostr Sats to USD
            nostr_cost_per_1k_usd = nostr_sats_per_1k / (self.exchange_rate * 100000000)  # 1 BTC = 100,000,000 Sats
            
            # Calculate savings
            savings_per_1k = web2_cost_per_1k - nostr_cost_per_1k_usd
            
            # Check if Nostr cost exceeds 50% of Web2 cost
            alert_triggered = nostr_cost_per_1k_usd > (web2_cost_per_1k * self.web2_cpc_threshold)
            alert_message = ("Pause campaign: Nostr cost exceeds 50% of Web2 cost" if alert_triggered 
                             else "Continue campaign: Nostr cost is below threshold")
            
            result = {
                "web2_cpc": web2_cpc,
                "web2_cost_per_1k_usd": round(web2_cost_per_1k, 2),
                "nostr_sats_per_1k": nostr_sats_per_1k,
                "nostr_cost_per_1k_usd": round(nostr_cost_per_1k_usd, 4),
                "savings_per_1k_usd": round(savings_per_1k, 2),
                "savings_percentage": round((savings_per_1k / web2_cost_per_1k * 100) if web2_cost_per_1k > 0 else 0, 2),
                "alert_triggered": alert_triggered,
                "alert_message": alert_message,
                "exchange_rate_used": self.exchange_rate,
                "calculated_at": datetime.utcnow().isoformat()
            }
            
            logger.info("Savings calculated", savings_per_1k=result["savings_per_1k_usd"], alert_triggered=alert_triggered)
            return result
        
        except ZeroDivisionError:
            logger.error("Division by zero in savings calculation", web2_cpc=web2_cpc, exchange_rate=self.exchange_rate)
            return self._fallback_savings(web2_cpc, nostr_sats_per_1k)
        except Exception as e:
            logger.error("Error in savings calculation", error=str(e))
            return self._fallback_savings(web2_cpc, nostr_sats_per_1k)
    
    def _fallback_savings(self, web2_cpc: float, nostr_sats_per_1k: float) -> Dict[str, Any]:
        """
        Return fallback savings data in case of calculation errors.
        
        Args:
            web2_cpc: Cost per click on Web2 platforms (in USD).
            nostr_sats_per_1k: Cost in Sats per 1000 impressions on Nostr.
        
        Returns:
            Dictionary with fallback data and error indication.
        """
        return {
            "web2_cpc": web2_cpc,
            "web2_cost_per_1k_usd": 0.0,
            "nostr_sats_per_1k": nostr_sats_per_1k,
            "nostr_cost_per_1k_usd": 0.0,
            "savings_per_1k_usd": 0.0,
            "savings_percentage": 0.0,
            "alert_triggered": False,
            "alert_message": "Error in calculation, fallback data returned",
            "exchange_rate_used": self.exchange_rate,
            "calculated_at": datetime.utcnow().isoformat(),
            "error": True
        }
    
    def update_exchange_rate(self, new_rate: float):
        """
        Update the Bitcoin exchange rate used for calculations.
        
        Args:
            new_rate: New exchange rate (USD per BTC).
        """
        if new_rate <= 0:
            logger.warning("Invalid exchange rate update attempted", new_rate=new_rate)
            return False
        
        self.exchange_rate = new_rate
        logger.info("Exchange rate updated", new_rate=new_rate)
        return True