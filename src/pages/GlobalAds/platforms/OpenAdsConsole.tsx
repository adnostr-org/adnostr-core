import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Globe, 
  Cpu,
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  Zap,
  Network,
  Filter,
  Download,
  Settings,
  Plus
} from "lucide-react";

import { getPlatformData } from "@/features/ad-console/staticAdapters";
import { CampaignPerformanceTable } from "../components/CampaignPerformanceTable";

export function OpenAdsConsole() {
  const platformData = getPlatformData('openads');
  
  return (
    <div className="p-6">
      {/* Platform Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl">
              <Globe className="h-8 w-8 text-green-600 dark:text-green-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">OpenAds</h2>
                <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {platformData.overallROI.toFixed(2)}x ROI
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                程序化廣告、原生廣告和展示廣告網絡
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              設置
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              新建活動
            </Button>
          </div>
        </div>
      </div>

      {/* Ad Format Tabs */}
      <Tabs defaultValue="programmatic" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="programmatic" className="flex items-center gap-2">
            <Cpu className="h-4 w-4" />
            程序化
          </TabsTrigger>
          <TabsTrigger value="native" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            原生廣告
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            展示廣告
          </TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總展示量</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformData.campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0).toLocaleString().slice(0, 4)}M
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Globe className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總收入</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${platformData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">平均 CPM</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  $2.45
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  -12% 較上月
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">填充率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  94.8%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  廣告位利用率
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Zap className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">活動管理</TabsTrigger>
            <TabsTrigger value="inventory">庫存分析</TabsTrigger>
            <TabsTrigger value="demand">需求方平台</TabsTrigger>
            <TabsTrigger value="analytics">實時分析</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              篩選
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              導出
            </Button>
          </div>
        </div>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>廣告活動</CardTitle>
              <CardDescription>
                管理您的程序化廣告活動
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CampaignPerformanceTable 
                campaigns={platformData.campaigns}
                showPlatform={false}
              />
            </CardContent>
          </Card>
        </TabsContent>

        {/* Inventory Tab */}
        <TabsContent value="inventory">
          <Card>
            <CardHeader>
              <CardTitle>廣告庫存</CardTitle>
              <CardDescription>可用廣告位和表現分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: '橫幅廣告', available: '125K', cpm: 1.85, fillRate: 92.5 },
                  { type: '插頁廣告', available: '85K', cpm: 3.25, fillRate: 88.2 },
                  { type: '原生廣告', available: '210K', cpm: 2.45, fillRate: 96.8 },
                  { type: '視頻廣告', available: '45K', cpm: 8.75, fillRate: 78.5 },
                  { type: '音頻廣告', available: '32K', cpm: 4.20, fillRate: 82.3 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {item.available} 可用展示
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">${item.cpm} CPM</p>
                      <Badge 
                        variant="outline" 
                        className={item.fillRate > 90 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'}
                      >
                        {item.fillRate}% 填充率
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Real-time Metrics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            實時指標
          </CardTitle>
          <CardDescription>當前活動的實時表現數據</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">當前展示/秒</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">1,245</p>
              <div className="h-1 bg-green-500 rounded-full mt-2"></div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">當前點擊/秒</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">28</p>
              <div className="h-1 bg-blue-500 rounded-full mt-2"></div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">實時 CTR</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">2.25%</p>
              <div className="h-1 bg-purple-500 rounded-full mt-2"></div>
            </div>
            
            <div className="text-center p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <p className="text-sm text-gray-600 dark:text-gray-300">延遲</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">42ms</p>
              <div className="h-1 bg-green-500 rounded-full mt-2"></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Supply Chain */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            供應鏈分析
          </CardTitle>
          <CardDescription>廣告供應商和需求方表現</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top 供應商</h3>
              <div className="space-y-3">
                {[
                  { name: 'Publisher A', impressions: '2.5M', revenue: '125K', share: 28 },
                  { name: 'Publisher B', impressions: '1.8M', revenue: '98K', share: 20 },
                  { name: 'Publisher C', impressions: '1.2M', revenue: '65K', share: 15 },
                  { name: 'Publisher D', impressions: '850K', revenue: '42K', share: 10 }
                ].map((item, index) => (
                  <div key={index} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">{item.name}</span>
                      <span className="font-medium text-gray-900 dark:text-white">{item.share}%</span>
                    </div>
                    <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-green-500 rounded-full"
                        style={{ width: `${item.share}%` }}
                      />
                    </div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">
                      {item.impressions} 展示 · ${item.revenue} 收入
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Top 需求方</h3>
              <div className="space-y-3">
                {[
                  { name: 'Advertiser X', spend: '85K', impressions: '3.2M', cpm: 2.65 },
                  { name: 'Advertiser Y', spend: '62K', impressions: '2.8M', cpm: 2.21 },
                  { name: 'Advertiser Z', spend: '48K', impressions: '1.9M', cpm: 2.52 },
                  { name: 'Advertiser W', spend: '35K', impressions: '1.5M', cpm: 2.33 }
                ].map((item, index) => (
                  <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex justify-between items-center">
                      <span className="font-medium text-gray-900 dark:text-white">{item.name}</span>
                      <Badge variant="outline">${item.cpm} CPM</Badge>
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                      ${item.spend} 花費 · {item.impressions} 展示
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}