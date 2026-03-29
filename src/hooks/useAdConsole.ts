// useAdConsole.ts - AdConsole Data Bridge and Hook Implementation for AdNostr Frontend

// 端口映射策略
type APIPort = 8000 | 9000 | 'static';

interface APIEndpoint {
  port: APIPort;
  path: string;
  requiresAuth: boolean;
  fallback: boolean;
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
    ]
  };

  // 智能路由算法
  async fetchWithFallback<T>(
    endpointKey: string,
    params: Record<string, any>
  ): Promise<T> {
    const endpoints = this.endpoints[endpointKey];
    
    for (const endpoint of endpoints) {
      try {
        const data = await this.fetchFromEndpoint(endpoint, params);
        if (data) return data;
      } catch (error) {
        console.warn(`Endpoint ${endpoint.port} failed, trying fallback...`);
        continue;
      }
    }
    
    throw new Error('All endpoints failed');
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
}

export interface RevenueParams {
  constant_c?: number;
  image_complexity: number;
  difficulty_factor: number;
  exponent_k?: number;
}

export function useAdConsole() {
  const bridge = new AdConsoleDataBridge();
  
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
  
  return {
    dashboard: dashboardQuery,
    platform: usePlatformData,
    calculateRevenue,
    bridge
  };
}

import { useQuery, useMutation } from '@tanstack/react-query';