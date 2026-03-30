import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createHead, UnheadProvider } from '@unhead/react/client';
import { NostrLoginProvider } from '@nostrify/react/login';
import { AppProvider } from './components/AppProvider';
import { AppConfig } from '@/contexts/AppContext';
import { FSProvider } from './components/FSProvider';
import { AISettingsProvider } from './components/AISettingsProvider';
import { GitSettingsProvider } from './components/GitSettingsProvider';
import NostrProvider from './components/NostrProvider';
import { SessionManagerProvider } from './components/SessionManagerProvider';
import { ApifyTokenProvider } from './contexts/ApifyTokenContext';
import { AppRouter } from './AppRouter';

// 1. 创建 QueryClient 实例
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

// 2. 创建 Unhead 实例
const head = createHead();

// 3. 默认配置
const defaultConfig: AppConfig = {
  theme: 'light',
  relayMetadata: {
    relays: [
      { url: 'wss://relay.ditto.pub', read: true, write: true },
      { url: 'wss://relay.primal.net', read: true, write: true },
      { url: 'wss://relay.damus.io', read: true, write: true },
    ],
    updatedAt: 0,
  },
  templates: [
    {
      name: "MKStack",
      description: "Build Nostr clients with React.",
      url: "https://gitlab.com/soapbox-pub/mkstack.git"
    }
  ],
  esmUrl: 'https://esm.shakespeare.diy',
  corsProxy: 'https://proxy.shakespeare.diy/?url={href}',
  gitProxyOrigins: ['https://github.com', 'https://gitlab.com'],
  faviconUrl: 'https://external-content.duckduckgo.com/ip3/{hostname}.ico',
  ngitWebUrl: 'https://nostrhub.io/{naddr}',
  previewDomain: 'local-shakespeare.dev',
  language: 'en',
  showcaseEnabled: true,
  showcaseModerator: 'npub1jvnpg4c6ljadf5t6ry0w9q0rnm4mksde87kglkrc993z46c39axsgq89sc',
  graspMetadata: {
    relays: [
      { url: 'wss://git.shakespeare.diy/' },
      { url: 'wss://relay.ngit.dev/' },
    ],
    updatedAt: 0,
  },
  fsPathProjects: '/projects',
  fsPathConfig: '/config',
  fsPathTmp: '/tmp',
  fsPathPlugins: '/plugins',
  fsPathTemplates: '/templates',
  sentryDsn: '',
  sentryEnabled: false,
  systemPrompt: '',
};

function App() {
  return (
    // 2. 用 Provider 包裹整个应用
    <UnheadProvider head={head}>
      <QueryClientProvider client={queryClient}>
        <AppProvider storageKey='adnostr-app-config' defaultConfig={defaultConfig}>
          <FSProvider>
            <AISettingsProvider>
              <GitSettingsProvider>
                <NostrLoginProvider storageKey='adnostr-login'>
                  <NostrProvider>
                    <SessionManagerProvider>
                      <ApifyTokenProvider>
                        <AppRouter />
                      </ApifyTokenProvider>
                    </SessionManagerProvider>
                  </NostrProvider>
                </NostrLoginProvider>
              </GitSettingsProvider>
            </AISettingsProvider>
          </FSProvider>
        </AppProvider>
      </QueryClientProvider>
    </UnheadProvider>
  );
}

export default App;