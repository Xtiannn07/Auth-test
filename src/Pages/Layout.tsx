import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import TopBarProfile from '../Components/Navigation/TopBarProfile';
import BottomNavigation from '../Components/Navigation/BottomNavigation';
import { ProfileProvider } from '../Contexts/ProfileContext';
import { useLocation } from 'react-router-dom';

export default function AuthenticatedLayout({ children }: { children: React.ReactNode }) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const location = useLocation();
  const username = currentUser?.email ? currentUser.email.split('@')[0] : '';

  // Check if we're on the current user's profile page
  const isCurrentUserProfile = location.pathname === '/profile' || location.pathname === `/profile/${username}`;

  return (
    <ProfileProvider>
      <div className="flex flex-col h-screen">
        {isCurrentUserProfile && (
          <header className="sticky top-0 z-50 bg-white shadow-xs">
            <TopBarProfile username={username} />
          </header>
        )}
        <main className="flex-1 overflow-y-auto pb-16">{children}</main>
        <footer className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t">
          <BottomNavigation />
        </footer>
      </div>
    </ProfileProvider>
  );
}
