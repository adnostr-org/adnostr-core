import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Search, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  Globe,
  Smartphone,
  Monitor,
  Filter,
  Download,
  Settings,
  Plus
} from "lucide-react";

import { getPlatformData } from "@/features/ad-console/staticAdapters";
import { CampaignPerformanceTable } from "../components/CampaignPerformanceTable";

export function GoogleAdsConsole() {
  const platformData = getPlatformData('google');
  
  return (
    <div className="p-6">
      {/* Platform Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl">
              <Search className="h-8 w-8 text-blue-600 dark:text-blue-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Google Ads</h2>
                <Badge className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {platformData.overallROI.toFixed(2)}x ROI
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                搜索廣告、展示廣告、YouTube 廣告和購物廣告
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

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總花費</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${platformData.totalSpend.toLocaleString()}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總收入</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${platformData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">活躍活動</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformData.activeCampaigns}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  共 {platformData.campaigns.length} 個活動
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Target className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">平均 CTR</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformData.campaigns[0]?.metrics.ctr.toFixed(2)}%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +2.4% 較上月
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <BarChart3 className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="campaigns" className="space-y-6">
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="campaigns">活動管理</TabsTrigger>
            <TabsTrigger value="performance">表現分析</TabsTrigger>
            <TabsTrigger value="keywords">關鍵詞</TabsTrigger>
            <TabsTrigger value="audience">受眾</TabsTrigger>
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
                管理您的 Google Ads 活動和預算
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

        {/* Performance Tab */}
        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>設備表現</CardTitle>
                <CardDescription>按設備類型劃分的表現</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { device: '移動設備', icon: Smartphone, percentage: 65, ctr: 2.4, cpc: 0.12 },
                    { device: '桌面設備', icon: Monitor, percentage: 30, ctr: 1.8, cpc: 0.15 },
                    { device: '平板電腦', icon: Smartphone, percentage: 5, ctr: 1.5, cpc: 0.10 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-white dark:bg-gray-700 rounded">
                          <item.icon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.device}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{item.percentage}% 流量</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-gray-900 dark:text-white">{item.ctr}% CTR</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">${item.cpc} CPC</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>地理表現</CardTitle>
                <CardDescription>按地區劃分的表現</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[
                    { location: '美國', revenue: 285000, growth: 12.5 },
                    { location: '加拿大', revenue: 78500, growth: 8.2 },
                    { location: '英國', revenue: 64200, growth: 15.3 },
                    { location: '澳大利亞', revenue: 43800, growth: 6.7 }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Globe className="h-5 w-5 text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">{item.location}</p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            ${item.revenue.toLocaleString()} 收入
                          </p>
                        </div>
                      </div>
                      <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                        +{item.growth}%
                      </Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Keywords Tab */}
        <TabsContent value="keywords">
          <Card>
            <CardHeader>
              <CardTitle>關鍵詞表現</CardTitle>
              <CardDescription>監控關鍵詞的表現和成本</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { keyword: 'ecommerce platform', clicks: 1250, ctr: 3.2, cpc: 0.85, conversions: 42 },
                  { keyword: 'online shopping', clicks: 980, ctr: 2.8, cpc: 0.72, conversions: 35 },
                  { keyword: 'digital marketing', clicks: 760, ctr: 2.1, cpc: 1.25, conversions: 28 },
                  { keyword: 'web development', clicks: 540, ctr: 1.8, cpc: 1.45, conversions: 19 },
                  { keyword: 'cloud hosting', clicks: 320, ctr: 1.5, cpc: 2.10, conversions: 12 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex-1">
                      <p className="font-medium text-gray-900 dark:text-white">{item.keyword}</p>
                      <div className="flex items-center gap-4 mt-2 text-sm text-gray-500 dark:text-gray-400">
                        <span>{item.clicks} 點擊</span>
                        <span>{item.ctr}% CTR</span>
                        <span>${item.cpc} CPC</span>
                        <span>{item.conversions} 轉化</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">優化</Button>
                      <Button variant="outline" size="sm">暫停</Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Audience Tab */}
        <TabsContent value="audience">
          <Card>
            <CardHeader>
              <CardTitle>受眾分析</CardTitle>
              <CardDescription>了解您的目標受眾</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">人口統計</h3>
                  {[
                    { group: '25-34 歲', percentage: 35, revenue: 125000 },
                    { group: '35-44 歲', percentage: 28, revenue: 98000 },
                    { group: '18-24 歲', percentage: 22, revenue: 75000 },
                    { group: '45-54 歲', percentage: 12, revenue: 42000 },
                    { group: '55+ 歲', percentage: 3, revenue: 15000 }
                  ].map((item, index) => (
                    <div key={index} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 dark:text-gray-400">{item.group}</span>
                        <span className="text-sm font-medium text-gray-900 dark:text-white">{item.percentage}%</span>
                      </div>
                      <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-blue-500 rounded-full"
                          style={{ width: `${item.percentage}%` }}
                        />
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        ${item.revenue.toLocaleString()} 收入
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white">興趣分類</h3>
                  {[
                    { interest: '科技愛好者', engagement: 85, ctr: 3.5 },
                    { interest: '商務專業人士', engagement: 72, ctr: 2.8 },
                    { interest: '線上購物者', engagement: 68, ctr: 4.2 },
                    { interest: '內容創作者', engagement: 54, ctr: 2.1 },
                    { interest: '遊戲玩家', engagement: 42, ctr: 1.8 }
                  ].map((item, index) => (
                    <div key={index} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium text-gray-900 dark:text-white">{item.interest}</span>
                        <Badge variant="outline">{item.engagement}% 參與度</Badge>
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {item.ctr}% CTR · 高轉化潛力
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Performance Trend */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>表現趨勢</CardTitle>
          <CardDescription>過去 30 天的表現數據</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 dark:text-gray-400">
              <div>日期</div>
              <div className="text-right">花費</div>
              <div className="text-right">收入</div>
            </div>
            
            <Separator />
            
            {platformData.performanceTrend.slice(-7).map((day, index) => (
              <div key={index} className="grid grid-cols-3 gap-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg px-2">
                <div className="font-medium text-gray-900 dark:text-white">{day.date}</div>
                <div className="text-right">
                  <span className="font-medium text-gray-900 dark:text-white">${day.spend.toFixed(2)}</span>
                </div>
                <div className="text-right">
                  <span className="font-medium text-green-600 dark:text-green-400">${day.revenue.toFixed(2)}</span>
                  <Badge variant="outline" className="ml-2 bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                    {day.roi.toFixed(2)}x
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}