import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  ShoppingCart, 
  Package,
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  BarChart3,
  Star,
  Truck,
  Shield,
  Filter,
  Download,
  Settings,
  Plus
} from "lucide-react";

import { getPlatformData } from "@/features/ad-console/staticAdapters";
import { CampaignPerformanceTable } from "../components/CampaignPerformanceTable";

export function AmazonAdsConsole() {
  const platformData = getPlatformData('amazon');
  
  return (
    <div className="p-6">
      {/* Platform Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-xl">
              <ShoppingCart className="h-8 w-8 text-orange-600 dark:text-orange-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Amazon Ads</h2>
                <Badge className="bg-gradient-to-r from-orange-500 to-yellow-600 text-white">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  {platformData.overallROI.toFixed(2)}x ROI
                </Badge>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                贊助產品、贊助品牌和展示型廣告
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

      {/* Ad Type Tabs */}
      <Tabs defaultValue="sponsored" className="mb-8">
        <TabsList className="grid grid-cols-3 w-full">
          <TabsTrigger value="sponsored" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            贊助產品
          </TabsTrigger>
          <TabsTrigger value="brands" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            贊助品牌
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">總銷售額</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  ${platformData.totalRevenue.toLocaleString()}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <DollarSign className="h-6 w-6 text-orange-600 dark:text-orange-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">ACOS</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  18.2%
                </p>
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  -3.5% 較上月
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">轉化率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformData.campaigns[0]?.metrics.conversionRate.toFixed(2)}%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  亞馬遜平均: 2.8%
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Target className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">平均評分</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  4.7
                </p>
                <div className="flex items-center mt-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star 
                      key={star}
                      className={`h-3 w-3 ${star <= 4 ? 'text-yellow-500 fill-yellow-500' : 'text-gray-300'}`}
                    />
                  ))}
                </div>
              </div>
              <div className="p-3 bg-yellow-100 dark:bg-yellow-900 rounded-full">
                <Star className="h-6 w-6 text-yellow-600 dark:text-yellow-300" />
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
            <TabsTrigger value="products">產品表現</TabsTrigger>
            <TabsTrigger value="keywords">搜索詞</TabsTrigger>
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
                管理您的 Amazon 廣告活動
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

        {/* Products Tab */}
        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>熱銷產品</CardTitle>
              <CardDescription>表現最佳的產品列表</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { product: '無線藍牙耳機', sales: 1250, revenue: 62500, acos: 15.2 },
                  { product: '智能手錶', sales: 980, revenue: 88200, acos: 18.5 },
                  { product: '筆記本電腦支架', sales: 2450, revenue: 36750, acos: 12.8 },
                  { product: '手機充電器', sales: 3200, revenue: 48000, acos: 14.3 },
                  { product: '辦公椅', sales: 420, revenue: 63000, acos: 22.1 }
                ].map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-700 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded">
                        <Package className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{item.product}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.sales} 件售出</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">${item.revenue.toLocaleString()}</p>
                      <Badge 
                        variant="outline" 
                        className={item.acos < 20 ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'}
                      >
                        {item.acos}% ACOS
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Amazon Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Truck className="h-5 w-5" />
              物流表現
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">準時送達率</span>
                <span className="font-medium text-gray-900 dark:text-white">98.5%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平均配送時間</span>
                <span className="font-medium text-gray-900 dark:text-white">2.3 天</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">退貨率</span>
                <span className="font-medium text-gray-900 dark:text-white">1.8%</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Shield className="h-5 w-5" />
              賬戶健康
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">政策合規</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">優秀</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">客戶反饋</span>
                <Badge className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300">4.8/5</Badge>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">庫存狀態</span>
                <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">充足</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="h-5 w-5" />
              客戶洞察
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">重複購買率</span>
                <span className="font-medium text-gray-900 dark:text-white">42%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">平均訂單價值</span>
                <span className="font-medium text-gray-900 dark:text-white">$68.50</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Prime 會員比例</span>
                <span className="font-medium text-gray-900 dark:text-white">78%</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}