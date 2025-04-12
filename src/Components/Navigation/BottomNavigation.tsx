import { Search, Home, Heart, Edit, User} from 'lucide-react';

// Bottom navigation component
export default function BottomNavigation() {
    const navItems = [
      { icon: <Home className="h-6 w-6 text-gray-700" />, active: false },
      { icon: <Search className="h-6 w-6 text-gray-500" />, active: false },
      { icon: <Edit className="h-6 w-6 text-gray-500" />, active: false },
      { icon: <Heart className="h-6 w-6 text-gray-500" />, active: false },
      { icon: <User className="h-6 w-6 text-black" />, active: true }
    ];
    
    return (
      <div className="flex items-center justify-around py-3 border-t border-gray-200 bg-white">
        {navItems.map((item, index) => (
          <button key={index} className="p-1">
            {item.icon}
          </button>
        ))}
      </div>
    );
  }