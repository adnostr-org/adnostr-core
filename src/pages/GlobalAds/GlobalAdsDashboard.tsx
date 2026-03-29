import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart3, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Zap,
  Globe,
  ShoppingCart,
  Search,
  MessageSquare,
  BarChart
} from "lucide-react";

import { 
  getAllPlatformData, 
  getGlobalStats,
  type PlatformData 
} from "@/features/ad-console/staticAdapters";
import { PlatformMetricsCard } from "./components/PlatformMetricsCard";
import { CampaignPerformanceTable } from "./components/CampaignPerformanceTable";

export function GlobalAdsDashboard() {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>('30d');
  const platforms = getAllPlatformData();
  const globalStats = getGlobalStats();

  // 平台圖標映射
  const platformIcons: Record<string, React.ReactNode> = {
    google: <Search className="h-5 w-5" />,
    meta: <MessageSquare className="h-5 w-5" />,
    amazon: <ShoppingCart className="h-5 w-5" />,
    openads: <Globe className="h-5 w-5" />,
    demo: <BarChart className="h-5 w-5" />
  };

  return (
    <div className="p-6">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">全局儀表板</h2>
            <p className="text-gray-600 dark:text-gray-300 mt-1">
              實時監控所有廣告平台的綜合表現
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
                <TrendingUp className="h-3 w-3 mr-1" />
                3247% ROI
              </Badge>
              <Badge variant="outline" className="bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                <Zap className="h-3 w-3 mr-1" />
                高性能
              </Badge>
            </div>
            
            <div className="flex gap-2">
              {['7d', '30d', '90d'].map((timeframe) => (
                <Button
                  key={timeframe}
                  variant={selectedTimeframe === timeframe ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedTimeframe(timeframe as any)}
                >
                  {timeframe}
                </Button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Global Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總花費</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${globalStats.totalSpend.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總收入</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${globalStats.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">平均 ROI</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {globalStats.averageROI.toFixed(2)}x
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  {(globalStats.averageROI * 100).toFixed(0)}%
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <BarChart3 className="h-6 w-6 text-purple-600 dark:text-purple-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">活躍活動</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {globalStats.activeCampaigns}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  共 {globalStats.totalCampaigns} 個活動
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <Target className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Platform Performance Grid */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">平台表現概覽</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            點擊平台卡片查看詳細數據
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {platforms.map((platform) => (
            <PlatformMetricsCard 
              key={platform.platform}
              platform={platform}
              icon={platformIcons[platform.platform]}
            />
          ))}
        </div>
      </div>

      {/* Campaign Performance */}
      <Tabs defaultValue="all" className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <TabsList>
            <TabsTrigger value="all">所有活動</TabsTrigger>
            <TabsTrigger value="active">進行中</TabsTrigger>
            <TabsTrigger value="top">表現最佳</TabsTrigger>
          </TabsList>
          
          <Button variant="outline" size="sm">
            <TrendingUp className="h-4 w-4 mr-2" />
            導出報告
          </Button>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <CampaignPerformanceTable 
            campaigns={platforms.flatMap(p => p.campaigns)}
            showPlatform={true}
          />
        </TabsContent>
        
        <TabsContent value="active" className="mt-0">
          <CampaignPerformanceTable 
            campaigns={platforms.flatMap(p => p.campaigns).filter(c => c.status === 'active')}
            showPlatform={true}
          />
        </TabsContent>
        
        <TabsContent value="top" className="mt-0">
          <CampaignPerformanceTable 
            campaigns={platforms.flatMap(p => p.campaigns)
              .sort((a, b) => b.metrics.revenue - a.metrics.revenue)
              .slice(0, 10)}
            showPlatform={true}
          />
        </TabsContent>
      </Tabs>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            管理您的廣告活動和設置
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <div className="mx-auto mb-2 p-2 bg-blue-100 dark:bg-blue-900 rounded-full w-12 h-12 flex items-center justify-center">
                  <DollarSign className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <span className="font-medium">預算管理</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <div className="mx-auto mb-2 p-2 bg-green-100 dark:bg-green-900 rounded-full w-12 h-12 flex items-center justify-center">
                  <BarChart3 className="h-6 w-6 text-green-600 dark:text-green-300" />
                </div>
                <span className="font-medium">報表生成</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <div className="mx-auto mb-2 p-2 bg-purple-100 dark:bg-purple-900 rounded-full w-12 h-12 flex items-center justify-center">
                  <Target className="h-6 w-6 text-purple-600 dark:text-purple-300" />
                </div>
                <span className="font-medium">受眾優化</span>
              </div>
            </Button>
            
            <Button variant="outline" className="h-auto py-4">
              <div className="text-center">
                <div className="mx-auto mb-2 p-2 bg-orange-100 dark:bg-orange-900 rounded-full w-12 h-12 flex items-center justify-center">
                  <Users className="h-6 w-6 text-orange-600 dark:text-orange-300" />
                </div>
                <span className="font-medium">團隊協作</span>
              </div>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}