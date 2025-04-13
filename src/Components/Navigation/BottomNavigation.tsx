import { Search, Home, Heart, Edit, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BottomNavigation() {
  const navigate = useNavigate();
  
  const navItems = [
    { 
      icon: <Home size={24} />, 
      active: false,
      route: '/home',
      className: "text-gray-700" 
    },
    { 
      icon: <Search size={24} />, 
      active: false,
      route: '/search',
      className: "text-gray-500" 
    },
    { 
      icon: <Edit size={24} />, 
      active: false,
      route: '/create',
      className: "text-gray-500" 
    },
    { 
      icon: <Heart size={24} />, 
      active: false,
      route: '/activity',
      className: "text-gray-500" 
    },
    { 
      icon: <User size={24} />, 
      active: true,
      route: '/profile',
      className: "text-black" 
    }
  ];
  
  const handleNavigation = (route) => {
    navigate(route);
  };

  return (
    <div className="flex items-center justify-around py-3 border-t border-gray-200 bg-white">
      {navItems.map((item, index) => (
        <button 
          key={index} 
          className={`p-1 ${item.className}`}
          onClick={() => handleNavigation(item.route)}
        >
          {item.icon}
        </button>
      ))}
    </div>
  );
}