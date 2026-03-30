import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface ApifyTokenContextType {
  token: string | null;
  isConfigured: boolean;
  setToken: (token: string) => void;
  clearToken: () => void;
  isLoading: boolean;
}

const ApifyTokenContext = createContext<ApifyTokenContextType | undefined>(undefined);

const APIFY_TOKEN_STORAGE_KEY = 'adnostr_apify_token';

interface ApifyTokenProviderProps {
  children: ReactNode;
}

export function ApifyTokenProvider({ children }: ApifyTokenProviderProps) {
  const [token, setTokenState] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 从localStorage加载token
  useEffect(() => {
    const loadToken = () => {
      try {
        const storedToken = localStorage.getItem(APIFY_TOKEN_STORAGE_KEY);
        setTokenState(storedToken);
      } catch (error) {
        console.error('Failed to load Apify token from localStorage:', error);
        setTokenState(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadToken();
  }, []);

  // 保存token到localStorage
  const setToken = (newToken: string) => {
    try {
      localStorage.setItem(APIFY_TOKEN_STORAGE_KEY, newToken);
      setTokenState(newToken);
    } catch (error) {
      console.error('Failed to save Apify token to localStorage:', error);
    }
  };

  // 清除token
  const clearToken = () => {
    try {
      localStorage.removeItem(APIFY_TOKEN_STORAGE_KEY);
      setTokenState(null);
    } catch (error) {
      console.error('Failed to clear Apify token from localStorage:', error);
    }
  };

  const value: ApifyTokenContextType = {
    token,
    isConfigured: !!token,
    setToken,
    clearToken,
    isLoading,
  };

  return (
    <ApifyTokenContext.Provider value={value}>
      {children}
    </ApifyTokenContext.Provider>
  );
}

export function useApifyToken() {
  const context = useContext(ApifyTokenContext);
  if (context === undefined) {
    throw new Error('useApifyToken must be used within an ApifyTokenProvider');
  }
  return context;
}