import React, { useState } from 'react';
import { useApifyToken } from '@/contexts/ApifyTokenContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Key, ExternalLink, CheckCircle, AlertCircle } from 'lucide-react';

interface ApifyTokenConfigProps {
  onConfigured?: () => void;
  showTitle?: boolean;
}

/**
 * Apify Token配置组件 - 遵循Shakespeare极简黑客美学
 * 1px实线边框，高对比度，无圆角无渐变
 */
export function ApifyTokenConfig({ onConfigured, showTitle = true }: ApifyTokenConfigProps) {
  const { token, setToken, isLoading } = useApifyToken();
  const [inputToken, setInputToken] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);
  const [validationSuccess, setValidationSuccess] = useState(false);

  const handleValidateToken = async () => {
    if (!inputToken.trim()) {
      setValidationError('请输入Apify Token');
      return;
    }

    // 基本格式验证
    if (!inputToken.startsWith('apify_api_')) {
      setValidationError('Token格式错误：应以 apify_api_ 开头');
      return;
    }

    setIsValidating(true);
    setValidationError(null);
    setValidationSuccess(false);

    try {
      // 调用后端验证接口
      const response = await fetch('/api/v1/apify/token/validate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token: inputToken }),
      });

      const data = await response.json();

      if (data.valid) {
        setValidationSuccess(true);
        // 保存token
        setToken(inputToken);
        setInputToken('');
        // 通知父组件
        if (onConfigured) {
          setTimeout(() => onConfigured(), 500);
        }
      } else {
        setValidationError(data.error || 'Token验证失败');
      }
    } catch (error) {
      console.error('Token validation failed:', error);
      setValidationError('验证服务暂时不可用，请稍后重试');
    } finally {
      setIsValidating(false);
    }
  };

  const handleSkipForNow = () => {
    if (onConfigured) {
      onConfigured();
    }
  };

  // 如果正在加载，显示加载状态
  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
        <span className="ml-2 text-sm text-gray-600">加载配置中...</span>
      </div>
    );
  }

  // 如果已经配置了token，显示成功状态
  if (token) {
    return (
      <Card className="border border-gray-300 shadow-none">
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <CheckCircle className="h-5 w-5 text-green-600" />
            <CardTitle className="text-lg">Apify 预言机已激活</CardTitle>
          </div>
          <CardDescription>
            您的套利引擎已准备就绪，可以开始抓取和分析广告数据
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="rounded border border-gray-300 bg-gray-50 p-3 font-mono text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Token:</span>
                <span className="truncate text-gray-900">{token.substring(0, 20)}...</span>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={() => {
                setInputToken(token);
                setToken('');
              }}
              className="w-full border border-gray-300 hover:bg-gray-50"
            >
              重新配置Token
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  // 显示Token配置界面
  return (
    <Card className="border border-gray-300 shadow-none">
      {showTitle && (
        <CardHeader className="pb-3">
          <div className="flex items-center space-x-2">
            <Key className="h-5 w-5 text-gray-700" />
            <CardTitle className="text-lg">配置 Apify 预言机</CardTitle>
          </div>
          <CardDescription>
            输入您的 Apify API Token 以激活广告套利引擎
          </CardDescription>
        </CardHeader>
      )}
      <CardContent>
        <div className="space-y-4">
          {/* 引导信息 */}
          <Alert className="border border-gray-300 bg-gray-50">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">
              <p className="mb-2">
                Apify Token 是访问广告数据预言机的唯一凭证。您需要：
              </p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>访问 <a href="https://apify.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline inline-flex items-center">
                  apify.com <ExternalLink className="ml-1 h-3 w-3" />
                </a> 注册账户</li>
                <li>在控制台获取 API Token</li>
                <li>粘贴到下方输入框并激活</li>
              </ol>
            </AlertDescription>
          </Alert>

          {/* Token输入表单 */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="apify-token" className="text-sm font-medium">
                Apify API Token
              </Label>
              <Input
                id="apify-token"
                type="password"
                placeholder="apify_api_xxxxxxxxxxxxxxxx"
                value={inputToken}
                onChange={(e) => {
                  setInputToken(e.target.value);
                  setValidationError(null);
                  setValidationSuccess(false);
                }}
                className="mt-1 border border-gray-300 focus:border-gray-500 focus:ring-1 focus:ring-gray-500"
                disabled={isValidating}
              />
              <p className="mt-1 text-xs text-gray-500">
                格式：以 "apify_api_" 开头的字符串
              </p>
            </div>

            {/* 验证状态 */}
            {validationError && (
              <Alert className="border border-red-300 bg-red-50">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-sm text-red-700">
                  {validationError}
                </AlertDescription>
              </Alert>
            )}

            {validationSuccess && (
              <Alert className="border border-green-300 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-sm text-green-700">
                  Token 验证成功！套利引擎已激活。
                </AlertDescription>
              </Alert>
            )}

            {/* 操作按钮 */}
            <div className="flex space-x-3">
              <Button
                onClick={handleValidateToken}
                disabled={isValidating || !inputToken.trim()}
                className="flex-1 border border-gray-800 bg-gray-900 text-white hover:bg-gray-800"
              >
                {isValidating ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    验证中...
                  </>
                ) : (
                  '激活套利引擎'
                )}
              </Button>
              <Button
                variant="outline"
                onClick={handleSkipForNow}
                className="border border-gray-300 hover:bg-gray-50"
              >
                稍后配置
              </Button>
            </div>

            {/* 隐私说明 */}
            <p className="text-xs text-gray-500">
              Token 仅存储在您的浏览器本地，用于访问 Apify 数据服务。我们不会上传或存储您的凭证。
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}