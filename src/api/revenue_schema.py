"""
Revenue Schemas for AdNostr-Core

This module defines Pydantic models for revenue calculation and advertisement metrics responses.
These schemas ensure data consistency across API endpoints.

Author: AdNostr Team
License: MIT
"""

from datetime import datetime
from decimal import Decimal
from typing import Literal
from pydantic import BaseModel, Field, validator
import math

class RevenueFormula(BaseModel):
    """R = (C × ln(I + 1)) / D^k 的標準化實現"""
    
    # 輸入參數
    constant_c: Decimal = Field(
        default=Decimal('1.5'),
        ge=Decimal('0.1'),
        le=Decimal('10.0'),
        description="配置常數因子，範圍 0.1-10.0"
    )
    
    image_complexity: Decimal = Field(
        ...,
        gt=Decimal('0'),
        le=Decimal('1000'),
        description="圖像複雜度因子 I，範圍 0-1000"
    )
    
    difficulty_factor: Decimal = Field(
        ...,
        gt=Decimal('0'),
        le=Decimal('100'),
        description="難度因子 D，範圍 0-100"
    )
    
    exponent_k: Decimal = Field(
        default=Decimal('0.8'),
        ge=Decimal('0.1'),
        le=Decimal('2.0'),
        description="指數因子 k，範圍 0.1-2.0"
    )
    
    # 計算方法
    @property
    def revenue(self) -> Decimal:
        """計算收入 R = (C × ln(I + 1)) / D^k"""
        # 使用 Decimal 保證精度
        numerator = self.constant_c * Decimal(math.log(float(self.image_complexity + 1)))
        denominator = self.difficulty_factor ** float(self.exponent_k)
        return numerator / Decimal(str(denominator))
    
    @property
    def roi_percentage(self) -> Decimal:
        """計算 ROI 百分比"""
        return (self.revenue / Decimal('100')) * Decimal('100')
    
    # 驗證器
    @validator('image_complexity')
    def validate_image_complexity(cls, v):
        """圖像複雜度驗證"""
        if v <= 0:
            raise ValueError('Image complexity must be greater than 0')
        return v
    
    @validator('difficulty_factor')
    def validate_difficulty_factor(cls, v):
        """難度因子驗證"""
        if v <= 0:
            raise ValueError('Difficulty factor must be greater than 0')
        return v

class PlatformMetrics(BaseModel):
    """平台指標統一格式"""
    platform: Literal['google', 'meta', 'amazon', 'openads', 'demo']
    period: Literal['7d', '30d', '90d', 'ytd']
    
    # 核心指標
    spend: Decimal = Field(..., ge=Decimal('0'))
    revenue: Decimal = Field(..., ge=Decimal('0'))
    impressions: int = Field(..., ge=0)
    clicks: int = Field(..., ge=0)
    conversions: int = Field(..., ge=0)
    
    # 計算指標
    @property
    def ctr(self) -> Decimal:
        """點擊率"""
        if self.impressions == 0:
            return Decimal('0')
        return Decimal(str(self.clicks)) / Decimal(str(self.impressions)) * Decimal('100')
    
    @property
    def cpc(self) -> Decimal:
        """每次點擊成本"""
        if self.clicks == 0:
            return Decimal('0')
        return self.spend / Decimal(str(self.clicks))
    
    @property
    def conversion_rate(self) -> Decimal:
        """轉化率"""
        if self.clicks == 0:
            return Decimal('0')
        return Decimal(str(self.conversions)) / Decimal(str(self.clicks)) * Decimal('100')
    
    @property
    def roi(self) -> Decimal:
        """投資回報率"""
        if self.spend == 0:
            return Decimal('0')
        return (self.revenue - self.spend) / self.spend * Decimal('100')