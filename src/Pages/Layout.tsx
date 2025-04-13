// src/Layout.tsx - FIXED VERSION
import { ReactNode, useEffect, useState } from 'react';
import { useLoading } from '../Contexts/LoadingContext';
import TopNavigation from '../Components/Navigation/TopNavigation';
import BottomNavigation from '../Components/Navigation/BottomNavigation';
import AnimatedLoader from '../Components/UI/AnimatedLoader';

interface AuthenticatedLayoutProps {
  children: React.ReactNode;
  topNavProps?: {
    username: string;
    onLogout: () => void;
  };
}

export default function AuthenticatedLayout({ 
  children, 
  topNavProps 
}: AuthenticatedLayoutProps) {
  const { isLoading, loadingMessage, resetLoading } = useLoading();
  const [showLoader, setShowLoader] = useState(false);

  // This prevents loader flickering by adding a small delay
  useEffect(() => {
    let timer: NodeJS.Timeout;
    
    if (isLoading) {
      setShowLoader(true);
    } else {
      timer = setTimeout(() => setShowLoader(false), 300); // Match this with your CSS transition
    }
    
    return () => clearTimeout(timer);
  }, [isLoading]);

  // Add an additional safety timeout to prevent permanent loading state
  useEffect(() => {
    let safetyTimer: NodeJS.Timeout;
    
    if (showLoader) {
      safetyTimer = setTimeout(() => {
        console.warn('Layout loader was visible for too long - forcing reset');
        resetLoading();
        setShowLoader(false);
      }, 15000);
    }
    
    return () => clearTimeout(safetyTimer);
  }, [showLoader, resetLoading]);

  return (
    <div className="flex flex-col h-screen bg-white">
      {topNavProps && (
        <header className="sticky top-0 z-50">
          <TopNavigation {...topNavProps} />
        </header>
      )}
      
      <main className="flex-1 relative overflow-y-auto">
        <div className={`transition-opacity duration-300 ${showLoader ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
          {children}
        </div>
        
        {showLoader && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex flex-col items-center justify-center gap-4 transition-opacity duration-300">
            <AnimatedLoader />
            <p className="text-gray-600">{loadingMessage}</p>
          </div>
        )}
      </main>
      
      <footer className="sticky bottom-0 z-50">
        <BottomNavigation />
      </footer>
    </div>
  );
}