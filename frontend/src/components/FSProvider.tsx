import { ReactNode, useEffect, useState } from 'react';
import { FSContext, type FSContextType } from '@/contexts/FSContext';
import { createMemoryFS } from '@/lib/MemoryFS';

interface FSProviderProps {
  children: ReactNode;
  fs?: any; // 可选的文件系统实例
}

export function FSProvider({ children, fs: providedFs }: FSProviderProps) {
  const [fs, setFs] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initializeFS = async () => {
      try {
        if (providedFs) {
          // 使用传入的文件系统
          setFs(providedFs);
        } else {
          // 创建内存文件系统作为后备
          console.log('Creating memory filesystem as fallback');
          const memoryFS = createMemoryFS();
          
          // 确保必要的目录存在
          await memoryFS.mkdir('/config', { recursive: true });
          await memoryFS.mkdir('/projects', { recursive: true });
          await memoryFS.mkdir('/tmp', { recursive: true });
          
          setFs(memoryFS);
        }
      } catch (error) {
        console.error('Failed to initialize filesystem:', error);
        // 即使失败也创建一个基本的内存文件系统
        const fallbackFS = createMemoryFS();
        setFs(fallbackFS);
      } finally {
        setIsLoading(false);
      }
    };

    initializeFS();
  }, [providedFs]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
          <p className="mt-2 text-sm text-gray-600">初始化文件系统...</p>
        </div>
      </div>
    );
  }

  if (!fs) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600">文件系统初始化失败</p>
          <p className="text-sm text-gray-600 mt-2">请刷新页面重试</p>
        </div>
      </div>
    );
  }

  const contextValue: FSContextType = {
    fs,
  };

  return (
    <FSContext.Provider value={contextValue}>
      {children}
    </FSContext.Provider>
  );
}