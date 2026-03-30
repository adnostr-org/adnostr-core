/**
 * MemoryFS - 内存文件系统实现
 * 用于在没有真实文件系统时提供基本的FS接口
 */

export interface MemoryFS {
  mkdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
  readFile: (path: string, encoding?: string) => Promise<string | Uint8Array>;
  writeFile: (path: string, data: string | Uint8Array) => Promise<void>;
  readdir: (path: string) => Promise<string[]>;
  stat: (path: string) => Promise<{ isDirectory: () => boolean; isFile: () => boolean }>;
  unlink: (path: string) => Promise<void>;
  rmdir: (path: string, options?: { recursive?: boolean }) => Promise<void>;
}

/**
 * 创建内存文件系统实例
 */
export function createMemoryFS(): MemoryFS {
  const files = new Map<string, string | Uint8Array>();
  const directories = new Set<string>();

  // 确保根目录存在
  directories.add('/');
  directories.add('/config');
  directories.add('/projects');

  return {
    async mkdir(path: string, options?: { recursive?: boolean }) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      if (options?.recursive) {
        // 递归创建目录
        const parts = normalizedPath.split('/').filter(Boolean);
        let currentPath = '';
        
        for (const part of parts) {
          currentPath = currentPath ? `${currentPath}/${part}` : `/${part}`;
          directories.add(currentPath);
        }
      } else {
        directories.add(normalizedPath);
      }
    },

    async readFile(path: string, encoding?: string) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      const content = files.get(normalizedPath);
      
      if (content === undefined) {
        throw new Error(`File not found: ${path}`);
      }
      
      if (encoding === 'utf8' && content instanceof Uint8Array) {
        return new TextDecoder().decode(content);
      }
      
      return content;
    },

    async writeFile(path: string, data: string | Uint8Array) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      files.set(normalizedPath, data);
    },

    async readdir(path: string) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      // 检查是否是目录
      if (!directories.has(normalizedPath)) {
        throw new Error(`Directory not found: ${path}`);
      }
      
      // 获取该目录下的所有文件和子目录
      const entries = new Set<string>();
      
      // 查找文件
      for (const filePath of files.keys()) {
        if (filePath.startsWith(normalizedPath === '/' ? '/' : `${normalizedPath}/`)) {
          const relativePath = filePath.slice(normalizedPath === '/' ? 1 : normalizedPath.length + 1);
          const firstSegment = relativePath.split('/')[0];
          if (firstSegment) {
            entries.add(firstSegment);
          }
        }
      }
      
      // 查找子目录
      for (const dirPath of directories) {
        if (dirPath.startsWith(normalizedPath === '/' ? '/' : `${normalizedPath}/`) && dirPath !== normalizedPath) {
          const relativePath = dirPath.slice(normalizedPath === '/' ? 1 : normalizedPath.length + 1);
          const firstSegment = relativePath.split('/')[0];
          if (firstSegment) {
            entries.add(firstSegment);
          }
        }
      }
      
      return Array.from(entries);
    },

    async stat(path: string) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      const isDirectory = directories.has(normalizedPath);
      const isFile = files.has(normalizedPath);
      
      if (!isDirectory && !isFile) {
        throw new Error(`Path not found: ${path}`);
      }
      
      return {
        isDirectory: () => isDirectory,
        isFile: () => isFile,
      };
    },

    async unlink(path: string) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      files.delete(normalizedPath);
    },

    async rmdir(path: string, options?: { recursive?: boolean }) {
      const normalizedPath = path.startsWith('/') ? path : `/${path}`;
      
      if (!directories.has(normalizedPath)) {
        throw new Error(`Directory not found: ${path}`);
      }
      
      // 检查目录是否为空
      const hasFiles = Array.from(files.keys()).some(filePath => 
        filePath.startsWith(`${normalizedPath}/`)
      );
      
      const hasSubdirs = Array.from(directories).some(dirPath => 
        dirPath.startsWith(`${normalizedPath}/`) && dirPath !== normalizedPath
      );
      
      if ((hasFiles || hasSubdirs) && !options?.recursive) {
        throw new Error(`Directory not empty: ${path}`);
      }
      
      // 递归删除
      if (options?.recursive) {
        // 删除文件
        for (const filePath of Array.from(files.keys())) {
          if (filePath.startsWith(`${normalizedPath}/`)) {
            files.delete(filePath);
          }
        }
        
        // 删除子目录
        for (const dirPath of Array.from(directories)) {
          if (dirPath.startsWith(`${normalizedPath}/`) && dirPath !== normalizedPath) {
            directories.delete(dirPath);
          }
        }
      }
      
      directories.delete(normalizedPath);
    },
  };
}