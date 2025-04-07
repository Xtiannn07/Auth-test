// src/components/Profile/ProfileNavigation.jsx
import { Home, Users, Bookmark, Image } from 'lucide-react';

export default function ProfileNavigation({ activeTab, onTabChange }) {
  const tabs = [
    { id: 'posts', name: 'Posts', icon: <Home size={20} /> },
    { id: 'about', name: 'About', icon: <Users size={20} /> },
    { id: 'friends', name: 'Friends', icon: <Users size={20} /> },
    { id: 'photos', name: 'Photos', icon: <Image size={20} /> },
    { id: 'saved', name: 'Saved', icon: <Bookmark size={20} /> },
  ];

  return (
    <div className="bg-white shadow rounded-lg mt-4 overflow-x-auto">
      <div className="flex">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`flex items-center px-4 py-4 font-medium text-sm border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
            onClick={() => onTabChange(tab.id)}
          >
            <span className="mr-2">{tab.icon}</span>
            {tab.name}
          </button>
        ))}
      </div>
    </div>
  );
}