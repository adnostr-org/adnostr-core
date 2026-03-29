// vite.config.ts - AdNostr 前端生产力配置 (修复路径重写逻辑)

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';
import path from 'path';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: {
    port: 8081,
    host: '0.0.0.0', // 允许通过服务器公网 IP 访问
    proxy: {
      // 核心修复逻辑：将前端的 /api 映射到后端的 /api/v1
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // 这里必须保留 /api，或者根据你路由的实际前缀调整
        // 既然 main.py 挂载的是 prefix="/api/v1"，我们统一保持前缀一致
        rewrite: (path) => path.replace(/^\/api/, '/api/v1')
      }
    }
  }
});