// src/Layout.tsx
import { ReactNode } from 'react';
import TopNavigation from '../Components/Navigation/TopNavigation';
import BottomNavigation from '../Components/Navigation/BottomNavigation';

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
  return (
    <div className="flex flex-col h-screen bg-white">
      {topNavProps && (
        <header className="sticky top-0 z-50">
          <TopNavigation {...topNavProps} />
        </header>
      )}
      
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
      
      <footer className="sticky bottom-0 z-50">
        <BottomNavigation />
      </footer>
    </div>
  );
}