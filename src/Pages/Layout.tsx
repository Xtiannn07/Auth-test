import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import TopNavigation from '../Components/Navigation/TopNavigation';
import BottomNavigation from '../Components/Navigation/BottomNavigation';
import { ProfileProvider } from '../Contexts/ProfileContext';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  // Remove redirect logic since PrivateRoute handles unauthenticated redirect

  const username = currentUser?.email ? currentUser.email.split('@')[0] : '';

  return (
    <ProfileProvider>
      <div className="flex flex-col h-screen">
        <header className="sticky top-0 z-50 bg-white shadow-xs">
          <TopNavigation username={username} />
        </header>
        <main className="flex-1 overflow-y-auto">{children}</main>
        <footer className="sticky bottom-0 z-50 bg-white border-t">
          <BottomNavigation />
        </footer>
      </div>
    </ProfileProvider>
  );
}
