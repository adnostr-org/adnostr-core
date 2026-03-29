// useAdConsole.ts - AdConsole Data Bridge and Hook Implementation for AdNostr Frontend with Intelligent Fallback and Arbitrage Data Fetching

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import axios from 'axios';

// 端口映射策略
type APIPort = 8000 | 9000 | 'static';

interface APIEndpoint {
  port: APIPort;
  path: string;
  requiresAuth: boolean;
  fallback: boolean;
}

interface ArbitrageLogEntry {
  timestamp: string;
  message: string;
  data?: any;
}

// 三層數據獲取策略
class AdConsoleDataBridge {
  private endpoints: Record<string, APIEndpoint[]> = {
    dashboard: [
      { port: 8000, path: '/api/v1/global-ads/dashboard', requiresAuth: true, fallback: false },
      { port: 9000, path: '/v1/aggregated/dashboard', requiresAuth: true, fallback: true },
      { port: 'static', path: '/features/ad-console/staticAdapters', requiresAuth: false, fallback: true }
    ],
    platform: [
      { port: 8000, path: '/api/v1/global-ads/platforms/{platform}', requiresAuth: true, fallback: false },
      { port: 9000, path: '/v1/scraped/{platform}/metrics', requiresAuth: true, fallback: true }
    ],
    revenue: [
      { port: 8000, path: '/api/v1/revenue/calculate', requiresAuth: true, fallback: false }
    ],
    arbitrage: [
      { port: 8000, path: '/api/v1/global-ads/dashboard', requiresAuth: true, fallback: false }
    ]
  };

  private intelligentFallback: IntelligentFallback;

  constructor() {
    this.intelligentFallback = new IntelligentFallback(this.endpoints);
  }

  // 智能路由算法
  async fetchWithFallback<T>(
    endpointKey: string,
    params: Record<string, any>
  ): Promise<T> {
    return this.intelligentFallback.fetchWithIntelligence(endpointKey, params);
  }
  
  private async fetchFromEndpoint(
    endpoint: APIEndpoint,
    params: Record<string, any>
  ): Promise<any> {
    if (endpoint.port === 'static') {
      return this.getStaticData(endpoint.path, params);
    }
    
    const url = `http://localhost:${endpoint.port}${this.interpolatePath(endpoint.path, params)}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-AdNostr-Version': '1.0.0'
    };
    
    if (endpoint.requiresAuth) {
      headers['X-API-Key'] = await this.getApiKey(endpoint.port);
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async getApiKey(port: APIPort): Promise<string> {
    // Placeholder for API key retrieval logic
    // In a real implementation, this would fetch from secure storage or environment
    return 'placeholder-api-key';
  }

  private getStaticData(path: string, params: Record<string, any>): any {
    // Placeholder for static data retrieval
    // In a real implementation, this would return mock data or static fallback content
    return { status: 'static-fallback', path, params };
  }

  private interpolatePath(path: string, params: Record<string, any>): string {
    // Replace path parameters with actual values
    return path.replace(/{([^}]+)}/g, (_, key) => params[key] || '');
  }

  async fetchArbitrageData(): Promise<any> {
    // Fetch arbitrage data from 8000 port
    try {
      const response = await axios.get('/api/v1/global-ads/dashboard', {
        headers: {
          'X-API-Key': await this.getApiKey(8000),
          'Content-Type': 'application/json',
          'X-AdNostr-Version': '1.0.0'
        }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch arbitrage data:', error);
      throw error;
    }
  }
}

class IntelligentFallback {
  private healthCheck: Map<APIPort, boolean> = new Map();
  private performanceMetrics: Map<APIPort, number> = new Map();
  private endpoints: Record<string, APIEndpoint[]>;
  
  constructor(endpoints: Record<string, APIEndpoint[]>) {
    this.endpoints = endpoints;
    // 初始化健康檢查
    this.healthCheck.set(8000, true);
    this.healthCheck.set(9000, true);
    this.healthCheck.set('static', true);
    
    // 定期健康檢查
    setInterval(() => this.checkEndpoints(), 30000);
  }
  
  async checkEndpoints(): Promise<void> {
    for (const port of [8000, 9000] as const) {
      try {
        const start = performance.now();
        await fetch(`http://localhost:${port}/health`, {
          signal: AbortSignal.timeout(5000)
        });
        const latency = performance.now() - start;
        
        this.healthCheck.set(port, true);
        this.performanceMetrics.set(port, latency);
      } catch {
        this.healthCheck.set(port, false);
      }
    }
  }
  
  getOptimalEndpoint(endpointKey: string): APIEndpoint {
    const endpoints = this.endpoints[endpointKey];
    
    // 1. 優先選擇健康的端點
    const healthyEndpoints = endpoints.filter(ep => 
      ep.port === 'static' || this.healthCheck.get(ep.port)
    );
    
    if (healthyEndpoints.length === 0) {
      throw new Error('No healthy endpoints available');
    }
    
    // 2. 根據性能選擇最佳端點
    return healthyEndpoints.reduce((best, current) => {
      if (current.port === 'static') return current;
      
      const bestLatency = this.performanceMetrics.get(best.port) || Infinity;
      const currentLatency = this.performanceMetrics.get(current.port) || Infinity;
      
      return currentLatency < bestLatency ? current : best;
    });
  }
  
  async fetchWithIntelligence<T>(
    endpointKey: string,
    params: Record<string, any>
  ): Promise<T> {
    const maxRetries = 3;
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const endpoint = this.getOptimalEndpoint(endpointKey);
        console.log(`Attempt ${attempt}: Using ${endpoint.port}`);
        
        const data = await this.fetchFromEndpoint(endpoint, params);
        
        // 記錄成功
        this.recordSuccess(endpoint.port);
        
        return data;
      } catch (error) {
        console.warn(`Attempt ${attempt} failed:`, error);
        
        if (attempt === maxRetries) {
          // 最後嘗試：使用靜態數據
          const staticEndpoint = this.endpoints[endpointKey].find(ep => ep.port === 'static');
          if (staticEndpoint) {
            return this.fetchFromEndpoint(staticEndpoint, params);
          }
          throw error;
        }
        
        // 指數退避
        await new Promise(resolve => 
          setTimeout(resolve, Math.pow(2, attempt) * 1000)
        );
      }
    }
    
    throw new Error('All attempts failed');
  }
  
  private async fetchFromEndpoint(
    endpoint: APIEndpoint,
    params: Record<string, any>
  ): Promise<any> {
    if (endpoint.port === 'static') {
      return this.getStaticData(endpoint.path, params);
    }
    
    const url = `http://localhost:${endpoint.port}${this.interpolatePath(endpoint.path, params)}`;
    
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      'X-AdNostr-Version': '1.0.0'
    };
    
    if (endpoint.requiresAuth) {
      headers['X-API-Key'] = await this.getApiKey(endpoint.port);
    }
    
    const response = await fetch(url, { headers });
    
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }
    
    return response.json();
  }

  private async getApiKey(port: APIPort): Promise<string> {
    // Placeholder for API key retrieval logic
    return 'placeholder-api-key';
  }

  private getStaticData(path: string, params: Record<string, any>): any {
    // Placeholder for static data retrieval
    return { status: 'static-fallback', path, params };
  }

  private interpolatePath(path: string, params: Record<string, any>): string {
    // Replace path parameters with actual values
    return path.replace(/{([^}]+)}/g, (_, key) => params[key] || '');
  }

  private recordSuccess(port: APIPort): void {
    // Update health status on successful request
    this.healthCheck.set(port, true);
  }
}

export interface RevenueParams {
  constant_c?: number;
  image_complexity: number;
  difficulty_factor: number;
  exponent_k?: number;
}

export function useAdConsole() {
  const bridge = new AdConsoleDataBridge();
  const [arbitrageLog, setArbitrageLog] = useState<ArbitrageLogEntry[]>([]);
  
  // 全局儀表板數據
  const dashboardQuery = useQuery({
    queryKey: ['global-ads', 'dashboard'],
    queryFn: () => bridge.fetchWithFallback('dashboard', {}),
    staleTime: 5 * 60 * 1000, // 5分鐘
    retry: 2
  });
  
  // 平台特定數據
  const usePlatformData = (platform: string) => 
    useQuery({
      queryKey: ['global-ads', 'platform', platform],
      queryFn: () => bridge.fetchWithFallback('platform', { platform }),
      enabled: !!platform
    });
  
  // 收入計算
  const calculateRevenue = useMutation({
    mutationFn: (params: RevenueParams) => 
      bridge.fetchWithFallback('revenue', params)
  });

  // Fetch arbitrage data
  const fetchArbitrageData = async () => {
    try {
      const data = await bridge.fetchArbitrageData();
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: 'Fetched arbitrage data',
        data: data
      };
      setArbitrageLog(prevLog => [...prevLog, logEntry]);
      return data;
    } catch (error) {
      const logEntry = {
        timestamp: new Date().toISOString(),
        message: 'Failed to fetch arbitrage data',
        data: error.message
      };
      setArbitrageLog(prevLog => [...prevLog, logEntry]);
      throw error;
    }
  };
  
  return {
    dashboard: dashboardQuery,
    platform: usePlatformData,
    calculateRevenue,
    fetchArbitrageData,
    arbitrageLog,
    bridge
  };
}