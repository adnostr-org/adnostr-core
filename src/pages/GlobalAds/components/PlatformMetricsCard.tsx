import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign,
  Users,
  MousePointerClick,
  Target
} from "lucide-react";
import { NavLink } from "react-router-dom";
import type { PlatformData } from "@/features/ad-console/staticAdapters";

interface PlatformMetricsCardProps {
  platform: PlatformData;
  icon: React.ReactNode;
}

export function PlatformMetricsCard({ platform, icon }: PlatformMetricsCardProps) {
  const { metrics } = platform.campaigns[0] || { metrics: { roi: 0, ctr: 0, conversionRate: 0 } };
  
  return (
    <NavLink to={`/global-ads/${platform.platform}`}>
      <Card className="hover:shadow-lg transition-all duration-300 hover:scale-[1.02] cursor-pointer border-2 border-gray-200 dark:border-gray-700">
        <CardContent className="p-6">
          {/* Platform Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                {icon}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900 dark:text-white">
                  {platform.platformName}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {platform.activeCampaigns} 個活動進行中
                </p>
              </div>
            </div>
            
            <Badge className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
              <TrendingUp className="h-3 w-3 mr-1" />
              {platform.overallROI.toFixed(2)}x ROI
            </Badge>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <DollarSign className="h-4 w-4" />
                <span>總花費</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${platform.totalSpend.toLocaleString()}
              </p>
            </div>
            
            <div className="space-y-1">
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                <TrendingUp className="h-4 w-4" />
                <span>總收入</span>
              </div>
              <p className="text-xl font-bold text-gray-900 dark:text-white">
                ${platform.totalRevenue.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Performance Indicators */}
          <div className="space-y-3">
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">點擊率 (CTR)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.ctr.toFixed(2)}%
                </span>
              </div>
              <Progress value={metrics.ctr * 10} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">轉化率</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {metrics.conversionRate.toFixed(2)}%
                </span>
              </div>
              <Progress value={metrics.conversionRate * 10} className="h-2" />
            </div>
            
            <div>
              <div className="flex items-center justify-between text-sm mb-1">
                <span className="text-gray-600 dark:text-gray-400">每次點擊成本 (CPC)</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  ${metrics.cpc.toFixed(2)}
                </span>
              </div>
              <Progress value={100 - (metrics.cpc * 100)} className="h-2" />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {platform.campaigns.reduce((sum, c) => sum + c.metrics.impressions, 0).toLocaleString().slice(0, 3)}K
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">展示</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {platform.campaigns.reduce((sum, c) => sum + c.metrics.clicks, 0).toLocaleString().slice(0, 3)}K
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">點擊</div>
            </div>
            
            <div className="text-center">
              <div className="text-lg font-bold text-gray-900 dark:text-white">
                {platform.campaigns.reduce((sum, c) => sum + c.metrics.conversions, 0).toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400">轉化</div>
            </div>
          </div>

          {/* View Details Button */}
          <Button 
            variant="outline" 
            size="sm" 
            className="w-full mt-4"
            onClick={(e) => e.preventDefault()}
          >
            查看詳細數據
          </Button>
        </CardContent>
      </Card>
    </NavLink>
  );
}