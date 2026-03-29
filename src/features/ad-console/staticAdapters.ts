/**
 * Global Ads Console - Static Data Adapters
 * 
 * 提供五大廣告平台的靜態模擬數據
 * 所有數據均基於 3247% ROI 的基準進行生成
 */

export type PlatformType = 'google' | 'meta' | 'amazon' | 'openads' | 'demo';

export interface AdMetrics {
  impressions: number;
  clicks: number;
  conversions: number;
  spend: number;
  revenue: number;
  roi: number; // ROI 百分比 (3247% = 32.47)
  ctr: number; // Click-through rate
  cpc: number; // Cost per click
  conversionRate: number;
}

export interface AdCampaign {
  id: string;
  name: string;
  status: 'active' | 'paused' | 'completed';
  budget: number;
  dailyBudget: number;
  startDate: string;
  endDate: string;
  metrics: AdMetrics;
  targeting: {
    locations: string[];
    languages: string[];
    devices: string[];
    interests: string[];
  };
}

export interface PlatformData {
  platform: PlatformType;
  platformName: string;
  platformIcon: string;
  totalSpend: number;
  totalRevenue: number;
  overallROI: number;
  activeCampaigns: number;
  campaigns: AdCampaign[];
  performanceTrend: {
    date: string;
    spend: number;
    revenue: number;
    roi: number;
  }[];
}

// 生成 3247% ROI 的基準數據
const BASE_ROI = 32.47; // 3247% 轉換為小數

// Google Ads 靜態適配器
export const googleAdsAdapter: PlatformData = {
  platform: 'google',
  platformName: 'Google Ads',
  platformIcon: 'Search',
  totalSpend: 12500,
  totalRevenue: 418375,
  overallROI: BASE_ROI,
  activeCampaigns: 8,
  campaigns: [
    {
      id: 'google-001',
      name: 'Search - E-commerce Summer Sale',
      status: 'active',
      budget: 5000,
      dailyBudget: 200,
      startDate: '2024-06-01',
      endDate: '2024-08-31',
      metrics: {
        impressions: 1250000,
        clicks: 25000,
        conversions: 1250,
        spend: 2500,
        revenue: 81175,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.10,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'Canada', 'United Kingdom', 'Australia'],
        languages: ['English'],
        devices: ['mobile', 'desktop', 'tablet'],
        interests: ['E-commerce', 'Shopping', 'Fashion', 'Electronics']
      }
    },
    {
      id: 'google-002',
      name: 'YouTube - Brand Awareness Campaign',
      status: 'active',
      budget: 3000,
      dailyBudget: 100,
      startDate: '2024-07-01',
      endDate: '2024-09-30',
      metrics: {
        impressions: 850000,
        clicks: 8500,
        conversions: 425,
        spend: 1500,
        revenue: 48705,
        roi: BASE_ROI,
        ctr: 1.0,
        cpc: 0.18,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'Germany', 'France', 'Japan'],
        languages: ['English', 'German', 'French', 'Japanese'],
        devices: ['mobile', 'desktop'],
        interests: ['Technology', 'Gaming', 'Entertainment', 'Education']
      }
    }
  ],
  performanceTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 6, i + 1).toISOString().split('T')[0];
    const spend = 400 + Math.random() * 50;
    const revenue = spend * BASE_ROI;
    return {
      date,
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      roi: BASE_ROI
    };
  })
};

// Meta Ads 靜態適配器
export const metaAdsAdapter: PlatformData = {
  platform: 'meta',
  platformName: 'Meta Ads',
  platformIcon: 'Facebook',
  totalSpend: 9800,
  totalRevenue: 318206,
  overallROI: BASE_ROI,
  activeCampaigns: 6,
  campaigns: [
    {
      id: 'meta-001',
      name: 'Facebook - Lead Generation',
      status: 'active',
      budget: 4000,
      dailyBudget: 150,
      startDate: '2024-06-15',
      endDate: '2024-09-15',
      metrics: {
        impressions: 950000,
        clicks: 19000,
        conversions: 950,
        spend: 1900,
        revenue: 61693,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.10,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'Canada', 'Mexico', 'Brazil'],
        languages: ['English', 'Spanish', 'Portuguese'],
        devices: ['mobile'],
        interests: ['Business', 'Marketing', 'Entrepreneurship', 'Finance']
      }
    },
    {
      id: 'meta-002',
      name: 'Instagram - Product Launch',
      status: 'active',
      budget: 2500,
      dailyBudget: 80,
      startDate: '2024-07-01',
      endDate: '2024-08-31',
      metrics: {
        impressions: 650000,
        clicks: 13000,
        conversions: 650,
        spend: 1300,
        revenue: 42211,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.10,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'United Kingdom', 'Australia', 'New Zealand'],
        languages: ['English'],
        devices: ['mobile'],
        interests: ['Fashion', 'Beauty', 'Lifestyle', 'Travel']
      }
    }
  ],
  performanceTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 6, i + 1).toISOString().split('T')[0];
    const spend = 320 + Math.random() * 40;
    const revenue = spend * BASE_ROI;
    return {
      date,
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      roi: BASE_ROI
    };
  })
};

// Amazon Ads 靜態適配器
export const amazonAdsAdapter: PlatformData = {
  platform: 'amazon',
  platformName: 'Amazon Ads',
  platformIcon: 'ShoppingCart',
  totalSpend: 15200,
  totalRevenue: 493544,
  overallROI: BASE_ROI,
  activeCampaigns: 10,
  campaigns: [
    {
      id: 'amazon-001',
      name: 'Sponsored Products - Electronics',
      status: 'active',
      budget: 6000,
      dailyBudget: 250,
      startDate: '2024-06-01',
      endDate: '2024-12-31',
      metrics: {
        impressions: 1800000,
        clicks: 36000,
        conversions: 1800,
        spend: 3600,
        revenue: 116892,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.10,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'Canada', 'United Kingdom', 'Germany'],
        languages: ['English', 'German'],
        devices: ['desktop', 'mobile'],
        interests: ['Electronics', 'Computers', 'Gaming', 'Home Appliances']
      }
    },
    {
      id: 'amazon-002',
      name: 'Sponsored Brands - Home & Kitchen',
      status: 'active',
      budget: 4000,
      dailyBudget: 150,
      startDate: '2024-07-01',
      endDate: '2024-10-31',
      metrics: {
        impressions: 1200000,
        clicks: 24000,
        conversions: 1200,
        spend: 2400,
        revenue: 77928,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.10,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'United Kingdom', 'Australia', 'Japan'],
        languages: ['English', 'Japanese'],
        devices: ['desktop', 'mobile'],
        interests: ['Home Improvement', 'Kitchen', 'Furniture', 'Gardening']
      }
    }
  ],
  performanceTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 6, i + 1).toISOString().split('T')[0];
    const spend = 500 + Math.random() * 60;
    const revenue = spend * BASE_ROI;
    return {
      date,
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      roi: BASE_ROI
    };
  })
};

// OpenAds 靜態適配器
export const openAdsAdapter: PlatformData = {
  platform: 'openads',
  platformName: 'OpenAds',
  platformIcon: 'Globe',
  totalSpend: 7500,
  totalRevenue: 243525,
  overallROI: BASE_ROI,
  activeCampaigns: 5,
  campaigns: [
    {
      id: 'openads-001',
      name: 'Programmatic Display - B2B',
      status: 'active',
      budget: 3000,
      dailyBudget: 120,
      startDate: '2024-06-01',
      endDate: '2024-09-30',
      metrics: {
        impressions: 2000000,
        clicks: 20000,
        conversions: 1000,
        spend: 1500,
        revenue: 48705,
        roi: BASE_ROI,
        ctr: 1.0,
        cpc: 0.075,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['North America', 'Europe', 'Asia Pacific'],
        languages: ['English', 'Chinese', 'Spanish'],
        devices: ['desktop', 'mobile', 'tablet'],
        interests: ['Business', 'Technology', 'Finance', 'Healthcare']
      }
    },
    {
      id: 'openads-002',
      name: 'Native Advertising - Content Discovery',
      status: 'active',
      budget: 2000,
      dailyBudget: 80,
      startDate: '2024-07-01',
      endDate: '2024-10-31',
      metrics: {
        impressions: 1500000,
        clicks: 15000,
        conversions: 750,
        spend: 1000,
        revenue: 32470,
        roi: BASE_ROI,
        ctr: 1.0,
        cpc: 0.067,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['Global'],
        languages: ['English'],
        devices: ['mobile', 'desktop'],
        interests: ['News', 'Entertainment', 'Sports', 'Lifestyle']
      }
    }
  ],
  performanceTrend: Array.from({ length: 30 }, (_, i) => {
    const date = new Date(2024, 6, i + 1).toISOString().split('T')[0];
    const spend = 250 + Math.random() * 30;
    const revenue = spend * BASE_ROI;
    return {
      date,
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      roi: BASE_ROI
    };
  })
};

// Demo Data 靜態適配器（豐富的演示數據）
export const demoDataAdapter: PlatformData = {
  platform: 'demo',
  platformName: 'Demo Platform',
  platformIcon: 'BarChart',
  totalSpend: 50000,
  totalRevenue: 1623500,
  overallROI: BASE_ROI,
  activeCampaigns: 15,
  campaigns: [
    {
      id: 'demo-001',
      name: 'Multi-Channel Master Campaign',
      status: 'active',
      budget: 15000,
      dailyBudget: 500,
      startDate: '2024-01-01',
      endDate: '2024-12-31',
      metrics: {
        impressions: 5000000,
        clicks: 100000,
        conversions: 5000,
        spend: 7500,
        revenue: 243525,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.075,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['Global'],
        languages: ['English', 'Spanish', 'Chinese', 'French', 'German'],
        devices: ['mobile', 'desktop', 'tablet', 'connected-tv'],
        interests: ['All Categories']
      }
    },
    {
      id: 'demo-002',
      name: 'AI-Optimized Performance Campaign',
      status: 'active',
      budget: 10000,
      dailyBudget: 350,
      startDate: '2024-03-01',
      endDate: '2024-11-30',
      metrics: {
        impressions: 3500000,
        clicks: 70000,
        conversions: 3500,
        spend: 5000,
        revenue: 162350,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.071,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['North America', 'Europe', 'Asia'],
        languages: ['English', 'Chinese', 'Japanese', 'Korean'],
        devices: ['mobile', 'desktop'],
        interests: ['AI', 'Technology', 'Innovation', 'Startups']
      }
    },
    {
      id: 'demo-003',
      name: 'Seasonal Holiday Campaign',
      status: 'completed',
      budget: 8000,
      dailyBudget: 400,
      startDate: '2023-11-01',
      endDate: '2023-12-31',
      metrics: {
        impressions: 2800000,
        clicks: 56000,
        conversions: 2800,
        spend: 4000,
        revenue: 129880,
        roi: BASE_ROI,
        ctr: 2.0,
        cpc: 0.071,
        conversionRate: 5.0
      },
      targeting: {
        locations: ['United States', 'Canada', 'United Kingdom', 'Australia'],
        languages: ['English'],
        devices: ['mobile', 'desktop'],
        interests: ['Shopping', 'Gifts', 'Holiday', 'Family']
      }
    }
  ],
  performanceTrend: Array.from({ length: 90 }, (_, i) => {
    const date = new Date(2024, 3, i + 1).toISOString().split('T')[0];
    const spend = 550 + Math.random() * 100;
    const revenue = spend * BASE_ROI;
    return {
      date,
      spend: parseFloat(spend.toFixed(2)),
      revenue: parseFloat(revenue.toFixed(2)),
      roi: BASE_ROI
    };
  })
};

// 所有平台的映射
export const platformAdapters: Record<PlatformType, PlatformData> = {
  google: googleAdsAdapter,
  meta: metaAdsAdapter,
  amazon: amazonAdsAdapter,
  openads: openAdsAdapter,
  demo: demoDataAdapter
};

// 獲取所有平台數據
export function getAllPlatformData(): PlatformData[] {
  return Object.values(platformAdapters);
}

// 獲取單個平台數據
export function getPlatformData(platform: PlatformType): PlatformData {
  return platformAdapters[platform];
}

// 計算總體統計
export function getGlobalStats() {
  const allPlatforms = getAllPlatformData();
  return {
    totalSpend: allPlatforms.reduce((sum, platform) => sum + platform.totalSpend, 0),
    totalRevenue: allPlatforms.reduce((sum, platform) => sum + platform.totalRevenue, 0),
    totalCampaigns: allPlatforms.reduce((sum, platform) => sum + platform.campaigns.length, 0),
    activeCampaigns: allPlatforms.reduce((sum, platform) => sum + platform.activeCampaigns, 0),
    averageROI: BASE_ROI,
    platforms: allPlatforms.length
  };
}