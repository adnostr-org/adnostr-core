import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  Search, 
  MessageSquare, 
  ShoppingCart, 
  Globe, 
  BarChart,
  ChevronRight
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const platforms = [
  {
    id: 'dashboard',
    name: '儀表板總覽',
    path: '/global-ads',
    icon: BarChart,
    description: '所有平台綜合視圖',
    badge: '綜合'
  },
  {
    id: 'google',
    name: 'Google Ads',
    path: '/global-ads/google',
    icon: Search,
    description: '搜索與展示廣告',
    badge: '3247% ROI',
    color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300'
  },
  {
    id: 'meta',
    name: 'Meta Ads',
    path: '/global-ads/meta',
    icon: MessageSquare,
    description: 'Facebook & Instagram',
    badge: '3247% ROI',
    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/20 dark:text-indigo-300'
  },
  {
    id: 'amazon',
    name: 'Amazon Ads',
    path: '/global-ads/amazon',
    icon: ShoppingCart,
    description: '電商與產品廣告',
    badge: '3247% ROI',
    color: 'bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300'
  },
  {
    id: 'openads',
    name: 'OpenAds',
    path: '/global-ads/openads',
    icon: Globe,
    description: '程序化廣告網絡',
    badge: '3247% ROI',
    color: 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-300'
  },
  {
    id: 'demo',
    name: '演示數據',
    path: '/global-ads/demo',
    icon: BarChart,
    description: '豐富的演示數據集',
    badge: '演示',
    color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/20 dark:text-purple-300'
  }
];

export function PlatformSwitcher() {
  return (
    <nav className="space-y-2">
      {platforms.map((platform) => {
        const Icon = platform.icon;
        return (
          <NavLink
            key={platform.id}
            to={platform.path}
            end={platform.id === 'dashboard'}
            className={({ isActive }) =>
              cn(
                "flex items-center justify-between p-3 rounded-lg transition-all duration-200",
                "hover:bg-gray-100 dark:hover:bg-gray-800",
                "border border-transparent hover:border-gray-200 dark:hover:border-gray-700",
                isActive 
                  ? "bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 shadow-sm"
                  : ""
              )
            }
          >
            {({ isActive }) => (
              <>
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "p-2 rounded-lg",
                    platform.color || "bg-gray-100 dark:bg-gray-800",
                    isActive && "ring-2 ring-offset-2 ring-blue-500 dark:ring-blue-400"
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  
                  <div className="text-left">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-medium",
                        isActive 
                          ? "text-gray-900 dark:text-white" 
                          : "text-gray-700 dark:text-gray-300"
                      )}>
                        {platform.name}
                      </span>
                      <Badge 
                        variant="outline" 
                        className={cn(
                          "text-xs font-normal",
                          platform.color?.replace('bg-', 'bg-opacity-20').replace('text-', ''),
                          isActive && "border-blue-500 dark:border-blue-400"
                        )}
                      >
                        {platform.badge}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                      {platform.description}
                    </p>
                  </div>
                </div>
                
                <ChevronRight className={cn(
                  "h-4 w-4 transition-transform",
                  isActive 
                    ? "text-blue-500 dark:text-blue-400" 
                    : "text-gray-400 dark:text-gray-500",
                  isActive && "translate-x-1"
                )} />
              </>
            )}
          </NavLink>
        );
      })}
      
      {/* Quick Stats */}
      <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">平台數量</span>
            <span className="font-semibold text-gray-900 dark:text-white">5</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">總 ROI</span>
            <span className="font-semibold text-green-600 dark:text-green-400">3247%</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm text-gray-600 dark:text-gray-400">數據狀態</span>
            <Badge variant="outline" className="bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300">
              實時同步
            </Badge>
          </div>
        </div>
        
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-4"
          onClick={() => {
            // 刷新所有平台數據
            window.location.reload();
          }}
        >
          刷新所有數據
        </Button>
      </div>
    </nav>
  );
}