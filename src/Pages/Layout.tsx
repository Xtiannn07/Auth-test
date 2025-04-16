// src/Layout.tsx
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import TopNavigation from '../Components/Navigation/TopNavigation';
import BottomNavigation from '../Components/Navigation/BottomNavigation';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  if (!currentUser) {
    window.location.href = '/signin';
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="sticky top-0 z-50 bg-white shadow-xs">
        <TopNavigation username={currentUser.email.split('@')[0]} />
      </header>
      <main className="flex-1 overflow-y-auto">{children}</main>
      <footer className="sticky bottom-0 z-50 bg-white border-t">
        <BottomNavigation />
      </footer>
    </div>
  );
}