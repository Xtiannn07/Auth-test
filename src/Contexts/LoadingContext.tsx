// src/Contexts/LoadingContext.tsx - FIXED VERSION
import { createContext, useContext, useState, useRef, useEffect } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  loadingMessage: string;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  resetLoading: () => void; // Added reset function
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export function LoadingProvider({ children }: { children: React.ReactNode }) {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingMessage, setLoadingMessage] = useState('Loading...');
  const loadingCount = useRef(0);

  // Safety mechanism: reset loading state if stuck for too long
  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    
    if (isLoading) {
      // If loading state persists for more than 10 seconds, reset it
      timeoutId = setTimeout(() => {
        console.warn('Loading state was active for too long - automatically resetting');
        resetLoading();
      }, 10000);
    }
    
    return () => {
      clearTimeout(timeoutId);
    };
  }, [isLoading]);

  const startLoading = (message: string = 'Loading...') => {
    loadingCount.current += 1;
    setLoadingMessage(message);
    setIsLoading(true);
  };

  const stopLoading = () => {
    loadingCount.current = Math.max(0, loadingCount.current - 1);
    if (loadingCount.current === 0) {
      setIsLoading(false);
    }
  };

  // Add a function to forcibly reset the loading state
  const resetLoading = () => {
    loadingCount.current = 0;
    setIsLoading(false);
  };

  return (
    <LoadingContext.Provider value={{ 
      isLoading, 
      loadingMessage, 
      startLoading, 
      stopLoading,
      resetLoading 
    }}>
      {children}
    </LoadingContext.Provider>
  );
}

export function useLoading() {
  const context = useContext(LoadingContext);
  if (!context) {
    throw new Error('useLoading must be used within a LoadingProvider');
  }
  return context;
}