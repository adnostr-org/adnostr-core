"""
Revenue Schemas for AdNostr-Core

This module defines Pydantic models for revenue calculation and advertisement metrics responses.
These schemas ensure data consistency across API endpoints.

Author: AdNostr Team
License: MIT
"""

from datetime import datetime
from pydantic import BaseModel, Field, validator
import math

class RevenueCalculation(BaseModel):
    """R = (C × ln(I + 1)) / D^k formula standardization"""
    constant_c: float = Field(1.5, description="Configured constant factor")
    image_complexity: float = Field(..., description="Image complexity factor I")
    difficulty_factor: float = Field(..., description="Difficulty factor D")
    exponent_k: float = Field(0.8, description="Exponent factor k")
    
    @property
    def revenue(self) -> float:
        """Calculate revenue R = (C × ln(I + 1)) / D^k"""
        return (self.constant_c * math.log(self.image_complexity + 1)) / (self.difficulty_factor ** self.exponent_k)

class AdMetricsResponse(BaseModel):
    """Unified response format for advertisement metrics"""
    platform: str
    spend: float
    revenue: float
    roi: float
    ctr: float
    cpc: float
    conversion_rate: float
    calculated_at: datetime
    formula_version: str = "R = (C × ln(I + 1)) / D^k"