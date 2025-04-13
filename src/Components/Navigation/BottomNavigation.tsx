import { Search, Home, Heart, Edit, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';

export default function BottomNavigation() {
  const navigate = useNavigate();
  const location = useLocation();
  
  const navItems = [
    { 
      icon: <Home size={24} />, 
      route: '/home',
      name: 'Home'
    },
    { 
      icon: <Search size={24} />, 
      route: '/search',
      name: 'Search'
    },
    { 
      icon: <Edit size={24} />, 
      route: '/create',
      name: 'Create'
    },
    { 
      icon: <Heart size={24} />, 
      route: '/activity',
      name: 'Activity'
    },
    { 
      icon: <User size={24} />, 
      route: '/profile',
      name: 'Profile'
    }
  ];
  
  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="flex items-center justify-around py-3 border-t border-gray-200  fixed bottom-0 w-full x-auto">
      {navItems.map((item) => {
        const isActive = location.pathname === item.route;
        
        return (
          <motion.button 
            key={item.route}
            className={`p-2 flex flex-col items-center ${isActive ? 'text-black' : 'text-gray-500'}`}
            onClick={() => handleNavigation(item.route)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
          >
            <motion.div
              animate={{ 
                scale: isActive ? 1.1 : 1,
                y: isActive ? -2 : 0
              }}
              transition={{ type: 'spring', stiffness: 500 }}
            >
              {item.icon}
            </motion.div>
            {isActive && (
              <motion.div 
                className="h-1 w-6 bg-gradient-to-r from-purple-400 to-blue-300 rounded-full "
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 500 }}
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}