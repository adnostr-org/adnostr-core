import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import ArbitrageDashboard from './components/ArbitrageDashboard';

// 1. 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  return (
    // 2. 用 Provider 包裹整个应用
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-white">
        <ArbitrageDashboard />
      </div>
    </QueryClientProvider>
  );
}

export default App;