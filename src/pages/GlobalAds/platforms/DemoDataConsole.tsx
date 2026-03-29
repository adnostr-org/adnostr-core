import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  BarChart, 
  TrendingUp, 
  DollarSign, 
  Users, 
  Target,
  Zap,
  Database,
  Filter,
  Download,
  Settings,
  Plus,
  PlayCircle,
  PauseCircle,
  RefreshCw
} from "lucide-react";

import { getPlatformData } from "@/features/ad-console/staticAdapters";
import { CampaignPerformanceTable } from "../components/CampaignPerformanceTable";

export function DemoDataConsole() {
  const platformData = getPlatformData('demo');
  const [isLive, setIsLive] = useState(true);
  
  return (
    <div className="p-6">
      {/* Platform Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl">
              <Database className="h-8 w-8 text-purple-600 dark:text-purple-300" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">演示數據平台</h2>
                <div className="flex items-center gap-2">
                  <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
                    <TrendingUp className="h-3 w-3 mr-1" />
                    {platformData.overallROI.toFixed(2)}x ROI
                  </Badge>
                  <Badge variant="outline" className={isLive ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300'}>
                    {isLive ? '實時模式' : '暫停模式'}
                  </Badge>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 mt-1">
                豐富的演示數據集，用於測試和展示 Global Ads 指揮部功能
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsLive(!isLive)}
            >
              {isLive ? (
                <>
                  <PauseCircle className="h-4 w-4 mr-2" />
                  暫停數據
                </>
              ) : (
                <>
                  <PlayCircle className="h-4 w-4 mr-2" />
                  恢復數據
                </>
              )}
            </Button>
            <Button variant="outline" size="sm">
              <RefreshCw className="h-4 w-4 mr-2" />
              重置數據
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              生成數據
            </Button>
          </div>
        </div>
      </div>

      {/* Demo Controls */}
      <Card className="mb-8 border-2 border-dashed border-purple-300 dark:border-purple-700">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white">演示控制面板</h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">
                調整演示參數以測試不同場景
              </p>
            </div>
            
            <div className="flex flex-wrap gap-3">
              <Button variant="outline" size="sm">
                低 ROI 場景
              </Button>
              <Button variant="outline" size="sm">
                高流量場景
              </Button>
              <Button variant="outline" size="sm">
                季節性波動
              </Button>
              <Button variant="outline" size="sm">
                異常檢測
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">數據集大小</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {platformData.campaigns.length * 1000}K
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  數據點
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <Database className="h-6 w-6 text-purple-600 dark:text-purple-300" />
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
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  演示數據
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <DollarSign className="h-6 w-6 text-green-600 dark:text-green-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">數據覆蓋率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  100%
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  所有平台和指標
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <BarChart className="h-6 w-6 text-blue-600 dark:text-blue-300" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">更新頻率</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">
                  {isLive ? '實時' : '暫停'}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  數據刷新
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
            <TabsTrigger value="scenarios">測試場景</TabsTrigger>
            <TabsTrigger value="analytics">高級分析</TabsTrigger>
            <TabsTrigger value="export">數據導出</TabsTrigger>
          </TabsList>
          
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm">
              <Filter className="h-4 w-4 mr-2" />
              篩選
            </Button>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              導出數據
            </Button>
          </div>
        </div>

        {/* Campaigns Tab */}
        <TabsContent value="campaigns" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>演示活動</CardTitle>
              <CardDescription>
                完整的演示數據集，包含多種場景
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

        {/* Scenarios Tab */}
        <TabsContent value="scenarios">
          <Card>
            <CardHeader>
              <CardTitle>測試場景</CardTitle>
              <CardDescription>預定義的測試場景和用例</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[
                  {
                    title: '季節性高峰',
                    description: '模擬假日購物季的流量高峰',
                    metrics: '流量 +300%, 轉化 +45%',
                    color: 'bg-blue-50 dark:bg-blue-900/20'
                  },
                  {
                    title: '競品活動',
                    description: '模擬競爭對手的廣告活動影響',
                    metrics: 'CPC +25%, CTR -15%',
                    color: 'bg-red-50 dark:bg-red-900/20'
                  },
                  {
                    title: '新產品發布',
                    description: '模擬新產品上市的市場反應',
                    metrics: '關注度 +180%, 試用率 +65%',
                    color: 'bg-green-50 dark:bg-green-900/20'
                  },
                  {
                    title: '技術故障',
                    description: '模擬服務中斷對廣告表現的影響',
                    metrics: '展示 -85%, 收入 -92%',
                    color: 'bg-yellow-50 dark:bg-yellow-900/20'
                  },
                  {
                    title: '病毒式傳播',
                    description: '模擬內容病毒式傳播的效果',
                    metrics: '分享 +1200%, 自然流量 +450%',
                    color: 'bg-purple-50 dark:bg-purple-900/20'
                  },
                  {
                    title: '預算優化',
                    description: '模擬預算重新分配的影響',
                    metrics: 'ROI +42%, 浪費 -68%',
                    color: 'bg-indigo-50 dark:bg-indigo-900/20'
                  }
                ].map((scenario, index) => (
                  <Card key={index} className={scenario.color}>
                    <CardContent className="p-6">
                      <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                        {scenario.title}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-4">
                        {scenario.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge variant="outline">{scenario.metrics}</Badge>
                        <Button size="sm" variant="ghost">
                          應用場景
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics">
          <Card>
            <CardHeader>
              <CardTitle>高級分析</CardTitle>
              <CardDescription>演示數據的深度分析</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">數據分布</h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[
                      { label: '正常分布', value: '65%', color: 'bg-green-500' },
                      { label: '異常值', value: '8%', color: 'bg-yellow-500' },
                      { label: '缺失數據', value: '2%', color: 'bg-red-500' },
                      { label: '邊緣案例', value: '25%', color: 'bg-blue-500' }
                    ].map((item, index) => (
                      <div key={index} className="text-center">
                        <div className="h-24 flex items-end justify-center">
                          <div 
                            className={`w-8 ${item.color} rounded-t-lg`}
                            style={{ height: `${parseInt(item.value)}%` }}
                          />
                        </div>
                        <p className="font-medium text-gray-900 dark:text-white mt-2">{item.value}</p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{item.label}</p>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">數據質量指標</h3>
                  <div className="space-y-3">
                    {[
                      { metric: '完整性', score: 98, status: '優秀' },
                      { metric: '準確性', score: 95, status: '良好' },
                      { metric: '一致性', score: 92, status: '良好' },
                      { metric: '時效性', score: 100, status: '優秀' },
                      { metric: '相關性', score: 88, status: '良好' }
                    ].map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{item.metric}</span>
                        <div className="flex items-center gap-3">
                          <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-green-500 rounded-full"
                              style={{ width: `${item.score}%` }}
                            />
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white w-12 text-right">
                            {item.score}%
                          </span>
                          <Badge 
                            variant="outline" 
                            className={item.status === '優秀' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'}
                          >
                            {item.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Data Generation Controls */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>數據生成器</CardTitle>
          <CardDescription>生成自定義演示數據</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">數據規模</h3>
              <div className="space-y-2">
                {[1000, 5000, 10000, 50000].map((size) => (
                  <Button key={size} variant="outline" className="w-full justify-start">
                    {size.toLocaleString()} 條記錄
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">時間範圍</h3>
              <div className="space-y-2">
                {['7天', '30天', '90天', '1年'].map((range) => (
                  <Button key={range} variant="outline" className="w-full justify-start">
                    {range}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 dark:text-white">數據類型</h3>
              <div className="space-y-2">
                {['正常分布', '隨機波動', '季節性', '趨勢性'].map((type) => (
                  <Button key={type} variant="outline" className="w-full justify-start">
                    {type}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <Button className="w-full">
              <Database className="h-4 w-4 mr-2" />
              生成演示數據
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}