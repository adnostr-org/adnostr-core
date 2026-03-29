"""
Security Middleware for AdNostr-Core

This module implements a three-layer security system for protecting API endpoints:
1. Transport Layer: HTTPS, CORS, Rate Limiting
2. Authentication Layer: API Key, Request Signing
3. Data Layer: Input Validation, XSS/SQL Injection Prevention

Author: AdNostr Team
License: MIT
"""

from fastapi import HTTPException, Request
from datetime import datetime, timedelta
import hashlib
import hmac
import os
from typing import Dict, Set, Any

import structlog

logger = structlog.get_logger()

class ThreeLayerSecurity:
    """三層安全防護體系"""
    
    def __init__(self):
        # 請求簽名密鑰（定期輪換）
        self.signing_keys = {
            'current': os.getenv('SIGNING_KEY_CURRENT', 'placeholder-current-key'),
            'previous': os.getenv('SIGNING_KEY_PREVIOUS', 'placeholder-previous-key'),
            'next': os.getenv('SIGNING_KEY_NEXT', 'placeholder-next-key')
        }
        
        # IP 白名單（可動態更新）
        self.ip_whitelist: Set[str] = set([
            '127.0.0.1',
            'localhost',
            # 前端部署地址可以在此添加
        ])
        
        # 允許的來源
        self.allowed_origins: Set[str] = set([
            'http://localhost:8081',
            'https://demo.adnostr.org',
        ])
        
        # 請求歷史記錄（防重放攻擊）
        self.request_history: Dict[str, datetime] = {}
        
        # 速率限制記錄
        self.rate_limit_records: Dict[str, List[datetime]] = {}
        self.rate_limit_window = timedelta(hours=1)
        self.rate_limit_max_requests = 100
    
    async def verify_request(self, request: Request):
        """驗證請求的三層安全"""
        
        # 1. 傳輸層驗證
        if not await self.verify_transport_layer(request):
            raise HTTPException(403, "Transport layer security violation")
        
        # 2. 認證層驗證
        if not await self.verify_authentication_layer(request):
            raise HTTPException(401, "Authentication failed")
        
        # 3. 數據層驗證
        if not await self.verify_data_layer(request):
            raise HTTPException(400, "Data validation failed")
        
        return True
    
    async def verify_transport_layer(self, request: Request) -> bool:
        """傳輸層安全驗證"""
        # CORS 驗證
        origin = request.headers.get('origin', '')
        if origin and origin not in self.allowed_origins:
            logger.warning("CORS violation", origin=origin, request_url=str(request.url))
            return False
        
        # 速率限制檢查
        client_ip = request.client.host if request.client else 'unknown'
        if self.is_rate_limited(client_ip):
            logger.warning("Rate limit exceeded", client_ip=client_ip)
            return False
        
        # HTTPS 強制（生產環境）
        if os.getenv('ENVIRONMENT') == 'production':
            if request.url.scheme != 'https':
                logger.warning("Non-HTTPS request in production", request_url=str(request.url))
                return False
        
        # 記錄請求以進行速率限制
        self.record_request(client_ip)
        return True
    
    async def verify_authentication_layer(self, request: Request) -> bool:
        """認證層安全驗證"""
        # API 密鑰驗證
        api_key = request.headers.get('X-API-Key', '')
        if not self.validate_api_key(api_key):
            logger.warning("Invalid API key", request_url=str(request.url))
            return False
        
        # 請求簽名驗證
        timestamp = request.headers.get('X-Timestamp', '')
        signature = request.headers.get('X-Signature', '')
        
        if not timestamp or not signature:
            logger.warning("Missing signature headers", request_url=str(request.url))
            return False
        
        # 防止重放攻擊（5分鐘內有效）
        try:
            request_time = datetime.fromtimestamp(int(timestamp))
            if datetime.utcnow() - request_time > timedelta(minutes=5):
                logger.warning("Expired request timestamp", timestamp=timestamp, request_url=str(request.url))
                return False
        except ValueError:
            logger.warning("Invalid timestamp format", timestamp=timestamp, request_url=str(request.url))
            return False
        
        # 驗證簽名
        body = await request.body()
        expected_signature = self.calculate_signature(
            request.method,
            request.url.path,
            timestamp,
            body
        )
        
        if not hmac.compare_digest(signature, expected_signature):
            logger.warning("Invalid request signature", request_url=str(request.url))
            return False
        
        # 記錄請求以防止重放攻擊
        request_id = f"{timestamp}:{signature}"
        if request_id in self.request_history:
            logger.warning("Replay attack detected", request_id=request_id, request_url=str(request.url))
            return False
        
        self.request_history[request_id] = datetime.utcnow()
        return True
    
    async def verify_data_layer(self, request: Request) -> bool:
        """數據層安全驗證"""
        # 輸入驗證（Pydantic 已處理）
        
        # SQL 注入防護
        try:
            body = await request.json()
            if self.contains_sql_injection(body):
                logger.warning("SQL injection attempt detected", request_url=str(request.url))
                return False
            
            # XSS 防護
            if self.contains_xss_payload(body):
                logger.warning("XSS attempt detected", request_url=str(request.url))
                return False
        except Exception:
            pass  # 如果不是 JSON 數據，跳過檢查
        
        # 數據大小限制
        content_length = request.headers.get('content-length', '0')
        try:
            if int(content_length) > 10 * 1024 * 1024:  # 10MB
                logger.warning("Request size limit exceeded", content_length=content_length, request_url=str(request.url))
                return False
        except ValueError:
            pass
        
        return True
    
    def validate_api_key(self, api_key: str) -> bool:
        """驗證 API 密鑰"""
        expected_key = os.getenv('API_KEY', 'placeholder-api-key')
        return bool(api_key and api_key == expected_key)
    
    def calculate_signature(self, method: str, path: str, timestamp: str, body: bytes) -> str:
        """計算請求簽名"""
        # 組合請求元素
        data_to_sign = f"{method.upper()}:{path}:{timestamp}".encode('utf-8')
        if body:
            data_to_sign += b":" + body
        
        # 使用當前密鑰進行簽名
        key = self.signing_keys['current'].encode('utf-8')
        return hmac.new(key, data_to_sign, hashlib.sha256).hexdigest()
    
    def is_rate_limited(self, client_ip: str) -> bool:
        """檢查是否超出速率限制"""
        if client_ip not in self.rate_limit_records:
            return False
        
        now = datetime.utcnow()
        # 清理過期的記錄
        self.rate_limit_records[client_ip] = [
            req_time for req_time in self.rate_limit_records[client_ip]
            if now - req_time < self.rate_limit_window
        ]
        
        # 檢查請求數量
        return len(self.rate_limit_records[client_ip]) >= self.rate_limit_max_requests
    
    def record_request(self, client_ip: str):
        """記錄請求以進行速率限制"""
        if client_ip not in self.rate_limit_records:
            self.rate_limit_records[client_ip] = []
        self.rate_limit_records[client_ip].append(datetime.utcnow())
    
    def contains_sql_injection(self, data: Any) -> bool:
        """檢查是否包含 SQL 注入嘗試"""
        if isinstance(data, str):
            sql_injection_patterns = [
                r'\b(SELECT|INSERT|UPDATE|DELETE|DROP|ALTER|CREATE|TRUNCATE)\b',
                r'\b(UNION|JOIN|WHERE|FROM|INTO|TABLE)\b',
                r'--',
                r';\s*$',
                r'1=1',
            ]
            data_lower = data.lower()
            for pattern in sql_injection_patterns:
                import re
                if re.search(pattern, data_lower):
                    return True
        elif isinstance(data, (dict, list)):
            if isinstance(data, dict):
                items = data.values()
            else:
                items = data
            for item in items:
                if self.contains_sql_injection(item):
                    return True
        return False
    
    def contains_xss_payload(self, data: Any) -> bool:
        """檢查是否包含 XSS 有效負載"""
        if isinstance(data, str):
            xss_patterns = [
                r'<script>',
                r'on\w+=',
                r'javascript:',
                r'<iframe>',
                r'<img\s+src=',
            ]
            data_lower = data.lower()
            for pattern in xss_patterns:
                import re
                if re.search(pattern, data_lower):
                    return True
        elif isinstance(data, (dict, list)):
            if isinstance(data, dict):
                items = data.values()
            else:
                items = data
            for item in items:
                if self.contains_xss_payload(item):
                    return True
        return False