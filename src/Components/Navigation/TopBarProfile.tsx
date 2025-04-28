import { LogOut, MoreVertical } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { signOutUser } from '../../store/authSlice';

interface TopBarProfileProps {
  username: string;
  onLogout?: () => void;
}

export default function TopBarProfile({ username, onLogout }: TopBarProfileProps) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      dispatch(signOutUser() as any);
      if (onLogout) {
        onLogout();
      }
      navigate('/signin');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleMenuClick = () => {
    setShowMenu(!showMenu);
  };

  return (
    <nav className="border-b border-gray-200 z-0">
      <div className="max-w-4xl mx-auto px-3 sm:px-4">
        <div className="flex justify-between items-center">
          {/* Logo/Brand - using Bookmark logo */}
          <Link to="/home" className="flex items-center space-x-2">
            <img 
              src="/mark.png" 
              alt="Marked" 
              className="w-10 lg:w-14 p-1"
            />
          </Link>

          {/* Vertical Menu Button - with positioned dropdown */}
          <div className="relative">
            <button 
              ref={buttonRef}
              type="button"
              onClick={handleMenuClick}
              className="p-1.5 sm:p-2 hover:bg-gray-100 rounded-lg transition-colors"
              aria-label="Open menu"
              aria-expanded={showMenu ? "true" : "false"}
              aria-haspopup="menu"
            >
              <MoreVertical className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
            </button>
            
            {/* Menu Dropdown - positioned directly under the button */}
            {showMenu && (
              <div 
                ref={menuRef}
                className="absolute right-0 mt-1 w-48 sm:w-56 bg-white rounded-lg shadow-lg py-1 z-50 border border-gray-100"
              >
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
      </div>
    </nav>
  );
}