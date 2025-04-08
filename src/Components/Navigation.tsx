import { Search, Grid, MessageCircle, Bell } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const [activeTab, setActiveTab] = useState('home');
  
  const handleTabClick = (tab) => {
    setActiveTab(tab);
  };
// new
  
  return (
    <div className="bg-black w-full py-2 px-4">
      <div className="max-w-6xl mx-auto flex items-center justify-between">
        {/* Left section */}
        <div className="flex items-center space-x-2">
          {/* Facebook logo */}
          <div>
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <path d="M16.7 39.8C7.2 38.1 0 29.9 0 20C0 9 9 0 20 0C31 0 40 9 40 20C40 29.9 32.8 38.1 23.3 39.8L22.2 38.9H17.8L16.7 39.8Z" fill="#1877F2" />
              <path d="M27.8 25.6L28.7 20H23.4V16.3C23.4 14.7 24.2 13.2 26.8 13.2H29V8.4C27.1 8.1 25.2 7.9 23.3 7.9C18.4 7.9 15.2 10.9 15.2 15.7V20H10.3V25.6H15.2V39.7C16.4 39.9 17.6 40 18.9 40C20.2 40 21.4 39.9 22.6 39.7V25.6H27.8Z" fill="white" />
            </svg>
          </div>
          
          {/* Search - visible on all screen sizes */}
          <div className="relative">
            <div className="bg-gray-800 rounded-full p-2 flex items-center">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>
        
        {/* Middle section - Hidden on mobile, visible on larger screens */}
        <div className="hidden md:flex flex-1 justify-center">
          <div className="flex space-x-2">
            {/* Home tab */}
            <button 
              className={`px-10 py-2 rounded-md relative ${activeTab === 'home' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => handleTabClick('home')}
            >
              <svg className="h-7 w-7 mx-auto" fill={activeTab === 'home' ? "#1877F2" : "#8A8D91"} viewBox="0 0 28 28">
                <path d="M25.825 12.29l-11.5-11a.5.5 0 0 0-.65 0l-11.5 11a.5.5 0 0 0 0 .71l.7.7a.5.5 0 0 0 .7.01l10.75-10.3 10.75 10.3a.5.5 0 0 0 .7 0l.7-.71a.5.5 0 0 0 0-.7z"/>
                <path d="M14 25a1 1 0 0 1-1-1v-7a1 1 0 0 0-1-1H9a1 1 0 0 0-1 1v7a1 1 0 0 1-1 1H5a2 2 0 0 1-2-2V14c0-.55.22-1.05.6-1.4L14 3l10.4 9.6c.37.35.6.85.6 1.4v9a2 2 0 0 1-2 2h-2a1 1 0 0 1-1-1v-7a1 1 0 0 0-1-1h-3a1 1 0 0 0-1 1v7a1 1 0 0 1-1 1h-2z" fill={activeTab === 'home' ? "#1877F2" : "#8A8D91"} />
              </svg>
              {activeTab === 'home' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
            </button>
            
            {/* Watch tab */}
            <button 
              className={`px-10 py-2 rounded-md relative ${activeTab === 'watch' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => handleTabClick('watch')}
            >
              <svg className="h-7 w-7 mx-auto" fill={activeTab === 'watch' ? "#1877F2" : "#8A8D91"} viewBox="0 0 28 28">
                <path d="M8.75 25.25a.75.75 0 0 1-.75-.75v-14.5a.75.75 0 0 1 .75-.75h10.5a.75.75 0 0 1 .75.75v14.5a.75.75 0 0 1-.75.75h-10.5zm1.75-12h7v10h-7v-10z"/>
                <path d="M23.25 12.75a.75.75 0 0 1-.75-.75V8c0-1.1-.9-2-2-2h-8.5v-1.5h8.5c1.93 0 3.5 1.57 3.5 3.5v4a.75.75 0 0 1-.75.75z"/>
                <path d="M6.75 12.75a.75.75 0 0 1-.75-.75V5a.75.75 0 0 1 1.5 0v7a.75.75 0 0 1-.75.75z"/>
                <circle cx="5.75" cy="8.5" r="1.5" />
              </svg>
              {activeTab === 'watch' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
            </button>
            
            {/* Marketplace tab */}
            <button 
              className={`px-10 py-2 rounded-md relative ${activeTab === 'marketplace' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => handleTabClick('marketplace')}
            >
              <svg className="h-7 w-7 mx-auto" fill={activeTab === 'marketplace' ? "#1877F2" : "#8A8D91"} viewBox="0 0 28 28">
                <path d="M17.5 23.75h-9a2.25 2.25 0 0 1-2.25-2.25v-7.5a2.25 2.25 0 0 1 2.25-2.25h9a2.25 2.25 0 0 1 2.25 2.25v7.5a2.25 2.25 0 0 1-2.25 2.25zm-9-10.5a.75.75 0 0 0-.75.75v7.5c0 .414.336.75.75.75h9a.75.75 0 0 0 .75-.75v-7.5a.75.75 0 0 0-.75-.75h-9z"/>
                <path d="M21.94 7.94l-6.5-4.2a.75.75 0 0 0-.812-.004L8 7.93a.75.75 0 0 0-.3.6v3.44a.75.75 0 0 0 1.5 0V9.15l5.812-3.59 5.738 3.71v2.66a.75.75 0 1 0 1.5 0V8.54a.75.75 0 0 0-.31-.6z"/>
              </svg>
              {activeTab === 'marketplace' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
            </button>
            
            {/* Groups tab */}
            <button 
              className={`px-10 py-2 rounded-md relative ${activeTab === 'groups' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => handleTabClick('groups')}
            >
              <svg className="h-7 w-7 mx-auto" fill={activeTab === 'groups' ? "#1877F2" : "#8A8D91"} viewBox="0 0 28 28">
                <path d="M21 8a7 7 0 0 1-7-7h-2a7 7 0 0 1-7 7v2a7 7 0 0 1 7 7h2a7 7 0 0 1 7-7V8zM7.5 14A4.5 4.5 0 0 1 3 9.5v-2a4.5 4.5 0 0 1 4.5-4.5h2A4.5 4.5 0 0 1 14 7.5v2a4.5 4.5 0 0 1-4.5 4.5h-2z" />
              </svg>
              {activeTab === 'groups' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
            </button>
            
            {/* Gaming tab */}
            <button 
              className={`px-10 py-2 rounded-md relative ${activeTab === 'gaming' ? 'border-b-2 border-blue-500' : ''}`}
              onClick={() => handleTabClick('gaming')}
            >
              <svg className="h-7 w-7 mx-auto" fill={activeTab === 'gaming' ? "#1877F2" : "#8A8D91"} viewBox="0 0 28 28">
                <path d="M23 7v11a4 4 0 0 1-4 4H9a4 4 0 0 1-4-4V7h18zm-9 6.75A2.75 2.75 0 0 0 16.75 11a2.75 2.75 0 0 0-5.5 0A2.75 2.75 0 0 0 14 13.75zm-9-8.25V6h18V5.5A1.5 1.5 0 0 0 20.5 4h-13A1.5 1.5 0 0 0 6 5.5V7H5z" />
              </svg>
              {activeTab === 'gaming' && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500"></div>}
            </button>
          </div>
        </div>
        
        {/* Right section - Action buttons */}
        <div className="flex items-center space-x-2">
          {/* Menu */}
          <button className="bg-gray-700 p-2 rounded-full">
            <Grid className="h-5 w-5 text-gray-200" />
          </button>
          
          {/* Messenger */}
          <button className="bg-gray-700 p-2 rounded-full">
            <MessageCircle className="h-5 w-5 text-gray-200" />
          </button>
          
          {/* Notifications */}
          <button className="bg-gray-700 p-2 rounded-full">
            <Bell className="h-5 w-5 text-gray-200" />
          </button>
          
          {/* Profile */}
          <button className="flex items-center">
            <img src="/api/placeholder/32/32" alt="Profile" className="rounded-full w-10 h-10" />
          </button>
        </div>
      </div>
    </div>
  );
}