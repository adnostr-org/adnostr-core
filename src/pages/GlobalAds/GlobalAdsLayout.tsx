import { Outlet } from "react-router-dom";
import { PlatformSwitcher } from "./components/PlatformSwitcher";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

export function GlobalAdsLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Global Ads 指揮部
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            統一管理五大廣告平台，實時監控 3247% ROI 表現
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Platform Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6 border-2 border-blue-100 dark:border-blue-900">
              <CardContent className="p-6">
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200 mb-4">
                    廣告平台
                  </h2>
                  <PlatformSwitcher />
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h3 className="font-medium text-blue-700 dark:text-blue-300">總體表現</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">3247% ROI</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">基準收益率</p>
                  </div>
                  
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h3 className="font-medium text-green-700 dark:text-green-300">活躍活動</h3>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white mt-2">44</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">跨平台總數</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content Area */}
          <div className="lg:col-span-3">
            <Card className="border-2 border-gray-200 dark:border-gray-700">
              <CardContent className="p-0">
                <Outlet />
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Footer Note */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>數據更新時間: {new Date().toLocaleString('zh-CN')} | 所有數據基於 3247% ROI 基準計算</p>
          <p className="mt-1">⚠️ 演示數據 - 實際數據需連接各平台 API</p>
        </div>
      </div>
    </div>
  );
}