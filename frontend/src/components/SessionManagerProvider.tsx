import { ReactNode, useEffect, useRef, useState } from 'react';
import { SessionManagerContext } from '@/contexts/SessionManagerContext';
import { SessionManager } from '@/lib/SessionManager';

interface SessionManagerProviderProps {
  children: ReactNode;
}

/**
 * Provider that creates and manages the global session manager instance
 * 简化版本，避免依赖缺失导致的崩溃
 */
export function SessionManagerProvider({ children }: SessionManagerProviderProps) {
  const [isInitialized, setIsInitialized] = useState(false);
  const sessionManager = useRef<SessionManager | undefined>(undefined);

  // 延迟初始化，避免在hooks未就绪时崩溃
  useEffect(() => {
    if (!sessionManager.current) {
      try {
        // 使用简化参数创建SessionManager
        sessionManager.current = new SessionManager(
          null, // fs - 暂时为null
          null, // nostr - 暂时为null
          () => ({}), // getSettings - 返回空对象
          () => ({}), // getConfig - 返回空对象
          () => ({}), // getDefaultConfig - 返回空对象
          () => [], // getProviderModels - 返回空数组
          () => ({ user: null, metadata: null }), // getCurrentUser - 返回空用户
        );
        setIsInitialized(true);
      } catch (error) {
        console.error('Failed to initialize SessionManager:', error);
        // 即使初始化失败，也设置已初始化，避免白屏
        setIsInitialized(true);
      }
    }
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Fire and forget cleanup - we don't need to await in useEffect cleanup
      sessionManager.current?.cleanup().catch(error => {
        console.warn('Failed to cleanup session manager:', error);
      });
    };
  }, []);

  // 在SessionManager初始化完成前显示加载状态
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">初始化会话管理器...</p>
        </div>
      </div>
    );
  }

  return (
    <SessionManagerContext.Provider value={sessionManager.current}>
      {children}
    </SessionManagerContext.Provider>
  );
}