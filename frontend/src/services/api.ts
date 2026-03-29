// api.ts - API Service for AdNostr Frontend

import axios from 'axios';

// API base URL
const API_BASE_URL = '/api';

// API key (should be securely stored and retrieved in a real implementation)
const API_KEY = 'placeholder-api-key';

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'X-AdNostr-Version': '1.0.0',
    'X-API-Key': API_KEY
  }
});

// API endpoints
export const fetchDashboardData = async () => {
  const response = await apiClient.get('/v1/global-ads/dashboard');
  return response.data;
};

export const fetchPlatformData = async (platform: string) => {
  const response = await apiClient.get(`/v1/global-ads/platforms/${platform}`);
  return response.data;
};

export const calculateRevenue = async (params: any) => {
  const response = await apiClient.post('/v1/revenue/calculate', params);
  return response.data;
};

export const fetchArbitrageData = async () => {
  const response = await apiClient.get('/v1/global-ads/dashboard');
  return response.data;
};

export default apiClient;