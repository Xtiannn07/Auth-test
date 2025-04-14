import { Search, Home, Heart, Edit, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import React, { ErrorInfo, ReactNode } from 'react';

// Custom error boundary component
class ErrorBoundary extends React.Component<{ children: ReactNode }, { hasError: boolean }> {
  constructor(props: { children: ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Navigation Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex items-center bg-gray-100 justify-around py-3 border-t border-gray-200 fixed bottom-0 w-full">
          <div className="text-red-500 text-xs">Navigation temporarily unavailable</div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Gradient icon component with type safety
const GradientIcon = ({ icon, active }: { icon: React.ReactElement; active: boolean }) => {
  const iconWithProps = React.cloneElement(icon, {
    size: 24,
    className: active ? '' : 'text-gray-400',
    ...(active ? { stroke: "url(#nav-gradient)" } : {})
  });

  return iconWithProps;
};

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  const navItems = [
    { icon: <Home />, route: '/home' },
    { icon: <Search />, route: '/search'},
    { icon: <Edit />, route: '/post'},
    { icon: <Heart />, route: '/activity' },
    { icon: <User />, route: '/profile', }
  ];

  const handleNavigation = (route: string) => {
    navigate(route);
  };

  return (
    <ErrorBoundary>
      <div className="flex items-center bg-gray-100 justify-around py-3 border-t border-gray-200 fixed bottom-0 w-full">
        {/* SVG Gradient Definition - only rendered once */}
        <svg width="0" height="0" className="absolute">
          <defs>
            <linearGradient id="nav-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#8B5CF6" /> {/* purple-400 */}
              <stop offset="100%" stopColor="#3B82F6" /> {/* blue-400 */}
            </linearGradient>
          </defs>
        </svg>

        {navItems.map((item) => {
          const isActive = location.pathname === item.route;
          
          return (
            <motion.button
              key={item.route}
              className="p-2 flex flex-col items-center focus:outline-none"
              onClick={() => handleNavigation(item.route)}
              whileTap={{ scale: 0.9 }}
              whileHover={{ scale: 1.05 }}
              aria-current={isActive ? 'page' : undefined}
            >
              <motion.div
                animate={{
                  scale: isActive ? 1.1 : 1,
                  y: isActive ? -2 : 0
                }}
                transition={{ type: 'spring', stiffness: 500 }}
              >
                <GradientIcon icon={item.icon} active={isActive} />
              </motion.div>


              {isActive && (
                <motion.div
                  className="h-1 w-6 bg-gradient-to-r from-purple-400 to-blue-400 rounded-full"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 500 }}
                />
              )}
            </motion.button>
          );
        })}
      </div>
    </ErrorBoundary>
  );
}