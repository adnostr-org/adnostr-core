import React, { useState } from 'react';
import { useApifyToken } from '@/contexts/ApifyTokenContext';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Terminal, Key, ExternalLink, Check, X } from 'lucide-react';

interface ApifyTokenConfigProps {
  onConfigured?: () => void;
  showAsOverlay?: boolean;
}

export function ApifyTokenConfig({ onConfigured, showAsOverlay = false }: ApifyTokenConfigProps) {
  const { token, setToken, isConfigured } = useApifyToken();
  const [inputToken, setInputToken] = useState(token || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputToken.trim()) return;

    setIsSubmitting(true);
    try {
      setToken(inputToken.trim());
      if (onConfigured) {
        onConfigured();
      }
    } catch (error) {
      console.error('Failed to save token:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClear = () => {
    setInputToken('');
    setToken('');
  };

  const handleTestConnection = () => {
    // TODO: Implement actual Apify token validation
    alert('Token validation would be implemented here');
  };

  const content = (
    <Card className={`border border-gray-300 bg-white ${showAsOverlay ? 'shadow-lg' : ''}`}>
      <CardHeader className="border-b border-gray-300 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gray-100 border border-gray-300">
            <Terminal className="h-5 w-5 text-gray-800" />
          </div>
          <div>
            <CardTitle className="text-lg font-semibold text-gray-900">
              Apify 预言机授权
            </CardTitle>
            <CardDescription className="text-sm text-gray-600">
              配置您的 Apify Token 以激活套利引擎
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 flex items-center gap-2">
              <Key className="h-4 w-4" />
              Apify API Token
            </label>
            <div className="relative">
              <Input
                type="password"
                value={inputToken}
                onChange={(e) => setInputToken(e.target.value)}
                placeholder="输入您的 Apify API Token"
                className="border border-gray-300 bg-white text-gray-900 placeholder:text-gray-500 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                disabled={isSubmitting}
              />
              {isConfigured && token === inputToken && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                  <Check className="h-4 w-4 text-green-600" />
                </div>
              )}
            </div>
            <p className="text-xs text-gray-600">
              您的 Token 仅存储在本地浏览器中，不会发送到任何第三方服务器
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Button
              type="submit"
              disabled={!inputToken.trim() || isSubmitting}
              className="border border-gray-800 bg-gray-900 text-white hover:bg-gray-800 hover:text-white"
            >
              {isSubmitting ? '保存中...' : isConfigured ? '更新 Token' : '激活套利引擎'}
            </Button>
            
            {isConfigured && (
              <Button
                type="button"
                variant="outline"
                onClick={handleClear}
                className="border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                <X className="h-4 w-4 mr-2" />
                清除 Token
              </Button>
            )}
            
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
            >
              {showAdvanced ? '隐藏高级选项' : '高级选项'}
            </Button>
          </div>

          {showAdvanced && (
            <div className="pt-4 border-t border-gray-200 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">连接状态</span>
                <span className={`text-sm font-medium ${isConfigured ? 'text-green-600' : 'text-gray-500'}`}>
                  {isConfigured ? '已配置' : '未配置'}
                </span>
              </div>
              
              <Button
                type="button"
                variant="outline"
                onClick={handleTestConnection}
                disabled={!isConfigured}
                className="w-full border border-gray-300 text-gray-700 hover:bg-gray-50 hover:text-gray-900"
              >
                测试连接
              </Button>
            </div>
          )}
        </form>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-900">如何获取 Token？</h4>
            <ol className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-100 border border-gray-300">1</span>
                <span>访问 <a href="https://console.apify.com" target="_blank" rel="noopener noreferrer" className="text-gray-900 hover:text-gray-700 underline inline-flex items-center gap-1">Apify Console <ExternalLink className="h-3 w-3" /></a></span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-100 border border-gray-300">2</span>
                <span>注册账户并完成验证</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-100 border border-gray-300">3</span>
                <span>在 Settings → Integrations 中创建 API Token</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-medium bg-gray-100 border border-gray-300">4</span>
                <span>复制 Token 并粘贴到上方输入框</span>
              </li>
            </ol>
          </div>
          
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-700">
              <strong>注意：</strong> Apify Token 用于访问 Google/TikTok 广告数据 API。
              套利引擎需要实时广告竞价数据来计算 Web2 vs Nostr 成本差异。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  if (showAsOverlay) {
    return (
      <div className="fixed inset-0 bg-white/95 z-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          {content}
        </div>
      </div>
    );
  }

  return content;
}

export default ApifyTokenConfig;