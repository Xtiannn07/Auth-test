// src/Components/Layout/AuthenticatedLayout.tsx
import { ReactNode } from 'react';
import TopNavigation from '../Components/Navigation/TopNavigation';
import BottomNavigation from '../Components/Navigation/BottomNavigation';

interface AuthenticatedLayoutProps {
  children: ReactNode;
  isLoading?: boolean;
  topNavProps?: {
    username: string;
    onLogout: () => void;
  };
}

export default function AuthenticatedLayout({ 
  children, 
  isLoading, 
  topNavProps 
}: AuthenticatedLayoutProps) {
  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Top Navigation - fixed height */}
      {topNavProps && (
        <header className="sticky top-0 z-50">
          <TopNavigation {...topNavProps} />
        </header>
      )}
      
      {/* Main Content Area - flex-grow for remaining space */}
      <main className="flex-1 relative overflow-y-auto">
        {isLoading && (
          <div className="absolute inset-0 bg-white bg-opacity-70 z-10 flex items-center justify-center">
            <div className="loader">Loading...</div>
          </div>
        )}
        <div className={`h-full ${isLoading ? 'opacity-50 pointer-events-none' : ''}`}>
          {children}
        </div>
      </main>
      
      {/* Bottom Navigation - fixed height */}
      <footer className="sticky bottom-0 z-50">
        <BottomNavigation />
      </footer>
    </div>
  );
}