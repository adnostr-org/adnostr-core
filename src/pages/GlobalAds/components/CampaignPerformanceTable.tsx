import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TrendingUp,
  TrendingDown,
  MoreVertical,
  ExternalLink,
  PauseCircle,
  PlayCircle,
  CheckCircle,
  AlertCircle
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { AdCampaign } from "@/features/ad-console/staticAdapters";

interface CampaignPerformanceTableProps {
  campaigns: AdCampaign[];
  showPlatform?: boolean;
}

// 平台名稱映射
const platformNames: Record<string, string> = {
  google: 'Google Ads',
  meta: 'Meta Ads',
  amazon: 'Amazon Ads',
  openads: 'OpenAds',
  demo: 'Demo Platform'
};

// 平台顏色映射
const platformColors: Record<string, string> = {
  google: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300',
  meta: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300',
  amazon: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300',
  openads: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
  demo: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
};

// 狀態映射
const statusConfig = {
  active: {
    icon: PlayCircle,
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300',
    label: '進行中'
  },
  paused: {
    icon: PauseCircle,
    color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-300',
    label: '已暫停'
  },
  completed: {
    icon: CheckCircle,
    color: 'bg-gray-100 text-gray-700 dark:bg-gray-900/20 dark:text-gray-300',
    label: '已完成'
  }
};

export function CampaignPerformanceTable({ campaigns, showPlatform = false }: CampaignPerformanceTableProps) {
  // 從 campaign ID 提取平台信息
  const getPlatformFromId = (id: string) => {
    if (id.startsWith('google-')) return 'google';
    if (id.startsWith('meta-')) return 'meta';
    if (id.startsWith('amazon-')) return 'amazon';
    if (id.startsWith('openads-')) return 'openads';
    if (id.startsWith('demo-')) return 'demo';
    return 'demo';
  };

  // 計算預算使用率
  const calculateBudgetUsage = (campaign: AdCampaign) => {
    return Math.min((campaign.metrics.spend / campaign.budget) * 100, 100);
  };

  // 格式化日期
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50 dark:bg-gray-800">
            <TableHead className="w-[300px]">活動名稱</TableHead>
            {showPlatform && <TableHead>平台</TableHead>}
            <TableHead>狀態</TableHead>
            <TableHead className="text-right">花費</TableHead>
            <TableHead className="text-right">收入</TableHead>
            <TableHead className="text-right">ROI</TableHead>
            <TableHead>預算使用</TableHead>
            <TableHead className="text-right">操作</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {campaigns.map((campaign) => {
            const platform = getPlatformFromId(campaign.id);
            const StatusIcon = statusConfig[campaign.status].icon;
            const budgetUsage = calculateBudgetUsage(campaign);
            const roiPercentage = (campaign.metrics.roi * 100).toFixed(0);
            
            return (
              <TableRow key={campaign.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <TableCell>
                  <div className="space-y-1">
                    <div className="font-medium text-gray-900 dark:text-white">
                      {campaign.name}
                    </div>
                    <div className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(campaign.startDate)} - {formatDate(campaign.endDate)}
                    </div>
                  </div>
                </TableCell>
                
                {showPlatform && (
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={platformColors[platform]}
                    >
                      {platformNames[platform]}
                    </Badge>
                  </TableCell>
                )}
                
                <TableCell>
                  <Badge 
                    variant="outline" 
                    className={statusConfig[campaign.status].color}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {statusConfig[campaign.status].label}
                  </Badge>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="font-medium text-gray-900 dark:text-white">
                    ${campaign.metrics.spend.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    日預算: ${campaign.dailyBudget}
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="font-medium text-green-600 dark:text-green-400">
                    ${campaign.metrics.revenue.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {campaign.metrics.conversions.toLocaleString()} 轉化
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <div className="flex items-center justify-end gap-1">
                    {campaign.metrics.roi >= 1 ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <TrendingDown className="h-4 w-4 text-red-500" />
                    )}
                    <span className="font-bold text-gray-900 dark:text-white">
                      {campaign.metrics.roi.toFixed(2)}x
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {roiPercentage}%
                  </div>
                </TableCell>
                
                <TableCell>
                  <div className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">
                        ${campaign.metrics.spend.toLocaleString()} / ${campaign.budget.toLocaleString()}
                      </span>
                      <span className="font-medium text-gray-900 dark:text-white">
                        {budgetUsage.toFixed(1)}%
                      </span>
                    </div>
                    <Progress value={budgetUsage} className="h-2" />
                  </div>
                </TableCell>
                
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <ExternalLink className="h-4 w-4 mr-2" />
                        查看詳細
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <TrendingUp className="h-4 w-4 mr-2" />
                        優化建議
                      </DropdownMenuItem>
                      {campaign.status === 'active' && (
                        <DropdownMenuItem className="text-yellow-600 dark:text-yellow-400">
                          <PauseCircle className="h-4 w-4 mr-2" />
                          暫停活動
                        </DropdownMenuItem>
                      )}
                      {campaign.status === 'paused' && (
                        <DropdownMenuItem className="text-green-600 dark:text-green-400">
                          <PlayCircle className="h-4 w-4 mr-2" />
                          恢復活動
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem className="text-red-600 dark:text-red-400">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        刪除活動
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
      
      {campaigns.length === 0 && (
        <div className="py-12 text-center">
          <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <AlertCircle className="h-6 w-6 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
            沒有找到活動
          </h3>
          <p className="text-gray-500 dark:text-gray-400">
            嘗試調整篩選條件或創建新的廣告活動
          </p>
        </div>
      )}
      
      {campaigns.length > 0 && (
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600 dark:text-gray-400">
              顯示 {campaigns.length} 個活動中的 {Math.min(campaigns.length, 10)} 個
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm">
                上一頁
              </Button>
              <Button variant="outline" size="sm">
                下一頁
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}