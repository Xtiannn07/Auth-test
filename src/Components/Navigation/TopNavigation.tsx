import { ArrowLeft, MoreHorizontal, LogOut } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContexts';

interface TopNavigationProps {
  username: string;
  onLogout?: () => void;
}

export default function TopNavigation({ username, onLogout }: TopNavigationProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { logout } = useAuth();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      // Use the logout function from AuthContext that dispatches Redux action
      await logout();
      // Use the parent component's onLogout if provided
      if (onLogout) {
        onLogout();
      }
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <div className="flex items-center justify-between p-4 border-b border-gray-200">
      <div className="flex items-center">
        <ArrowLeft className="h-5 w-5 mr-6 text-gray-600" />
        <h2 className="text-xl font-semibold text-gray-800">{"@" + username}</h2>
      </div>
      
      <div className="relative" ref={menuRef}>
        <button 
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-full hover:bg-gray-100 transition-colors"
          aria-label="User menu"
        >
          <MoreHorizontal className="h-5 w-5 text-gray-600" />
        </button>
        
        {showMenu && (
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-100">
            <div className="px-4 py-2 text-sm text-gray-500 border-b border-gray-100">
              {username}@gmail.com
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-gray-50"
            >
              <LogOut className="h-4 w-4 mr-3" />
              Sign out
            </button>
          </div>
        )}
      </div>
    </div>
  );
}