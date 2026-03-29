import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  MessageSquare, 
  Camera,
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  Heart,
  MessageCircle,
  Share2,
  Filter,
  Download,
  Settings,
  Plus
} from "lucide-react";

import { getPlatformData } from "@/features/ad-console/staticAdapters";
import { CampaignPerformanceTable } from "../components/CampaignPerformanceTable";

export function MetaAdsConsole() {
  const platformData = getPlatformData('meta');
  
  return (
    <div className="p-6">
      {/* Platform Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-xl">
              <MessageSquare className="h-8 w-8 text-indigo-600 dark:text-indigo-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Meta Ads</h2>
                <Badge className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {platformData.overallROI.toFixed(2)}x ROI
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                Facebook、Instagram、Messenger 和 Audience Network 廣告
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

      {/* Platform Tabs */}
      <Tabs defaultValue="facebook" className="mb-8">
        <TabsList className="grid grid-cols-4 w-full">
          <TabsTrigger value="facebook" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Facebook
          </TabsTrigger>
          <TabsTrigger value="instagram" className="flex items-center gap-2">
            <Camera className="h-4 w-4" />
            Instagram
          </TabsTrigger>
          <TabsTrigger value="messenger" className="flex items-center gap-2">
            <MessageCircle className="h-4 w-4" />
            Messenger
          </TabsTrigger>
          <TabsTrigger value="audience" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Audience
          </TabsTrigger>
        </TabsList>
      </Tabs>

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
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900 rounded-full">
                <DollarSign className="h-6 w-6 text-indigo-600 dark:text-indigo-300" />
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">互動率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  4.8%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  +1.2% 較上月
                </p>
              </div>
              <div className="p-3 bg-pink-100 dark:bg-pink-900 rounded-full">
                <Heart className="h-6 w-6 text-pink-600 dark:text-pink-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">分享次數</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  2.4K
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  有機分享
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Share2 className="h-6 w-6 text-blue-600 dark:text-blue-300" />
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
            <TabsTrigger value="creative">創意素材</TabsTrigger>
            <TabsTrigger value="audience">受眾洞察</TabsTrigger>
            <TabsTrigger value="placement">版位分析</TabsTrigger>
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
                管理您的 Meta 廣告活動
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

        {/* Creative Tab */}
        <TabsContent value="creative">
          <Card>
            <CardHeader>
              <CardTitle>創意表現</CardTitle>
              <CardDescription>分析不同創意素材的表現</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { type: '視頻廣告', views: '125K', engagement: 8.5, ctr: 4.2 },
                  { type: '輪播廣告', swipes: '42K', engagement: 6.8, ctr: 3.5 },
                  { type: '圖片廣告', impressions: '850K', engagement: 4.2, ctr: 2.8 },
                  { type: '動態產品廣告', conversions: '1.2K', engagement: 9.2, ctr: 5.4 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{item.type}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {Object.entries(item).filter(([key]) => key !== 'type' && key !== 'engagement' && key !== 'ctr').map(([key, value]) => `${key}: ${value}`).join(' · ')}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">{item.engagement}% 互動率</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{item.ctr}% CTR</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Engagement Metrics */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>互動指標</CardTitle>
          <CardDescription>社交媒體互動表現</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Heart className="h-8 w-8 text-pink-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">8,542</p>
              <p className="text-gray-600 dark:text-gray-300">點讚</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">+24% 較上月</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <MessageCircle className="h-8 w-8 text-blue-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">1,248</p>
              <p className="text-gray-600 dark:text-gray-300">評論</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">+18% 較上月</p>
            </div>
            
            <div className="text-center p-6 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Share2 className="h-8 w-8 text-green-500 mx-auto mb-3" />
              <p className="text-2xl font-bold text-gray-900 dark:text-white">2,415</p>
              <p className="text-gray-600 dark:text-gray-300">分享</p>
              <p className="text-sm text-green-600 dark:text-green-400 mt-2">+32% 較上月</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}