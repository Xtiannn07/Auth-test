// src/components/Profile/UserProfile.jsx
import { useState } from 'react'; 
import { useAuth } from '../../Contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import { getUserData } from '../../utils/mockData';
import ProfileHeader from './ProfileHeader';
import ProfileNavigation from './ProfileNavigation';
import ProfileAbout from './ProfileAbout';
import ProfileFeed from './ProfileFeed';
import ProfileFriends from './ProfileFriends';
import ProfilePhotos from './ProfilePhotos';
import ProfileSaved from './ProfileSaved';
import ProfileSidebar from './ProfileSidebar';
import Notification from '../UI/Notifications';

export default function UserProfile() {
  const { currentUser, logout } = useAuth();
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeTab, setActiveTab] = useState('posts');
  const navigate = useNavigate();

  // If not authenticated, redirect to signin
  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  // Get user data based on the current user
  const userData = getUserData(currentUser);

  async function handleLogout() {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
    }
  }

  const renderTabContent = () => {
    switch(activeTab) {
      case 'posts':
        return <ProfileFeed userData={userData} currentUser={currentUser} />;
      case 'about':
        return <ProfileAbout 
          currentUser={currentUser} 
          userData={userData}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
        />;
      case 'friends':
        return <ProfileFriends userData={userData} />;
      case 'photos':
        return <ProfilePhotos userData={userData} />;
      case 'saved':
        return <ProfileSaved userData={userData} />;
      default:
        return <div className="bg-white p-6 rounded-md shadow flex items-center justify-center h-40">
          <p className="text-gray-500">No content available for this tab yet</p>
        </div>;
    }
  };

  return (
    <div className="bg-gray-100 min-h-screen">
      {/* Notifications */}
      {error && <Notification type="error" message={error} onClose={() => setError('')} />}
      {success && <Notification type="success" message={success} onClose={() => setSuccess('')} />}
      
      <div className="max-w-4xl mx-auto md:pt-5">
        {/* Profile Header with Cover and Profile Picture */}
        <ProfileHeader 
          currentUser={currentUser}
          userData={userData}
          onLogout={handleLogout}
          onSuccess={(message) => setSuccess(message)}
          onError={(message) => setError(message)}
        />
        
        {/* Navigation Tabs */}
        <ProfileNavigation 
          activeTab={activeTab} 
          onTabChange={setActiveTab}
        />
        
        {/* Main content area */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left sidebar */}
          <ProfileSidebar 
            currentUser={currentUser}
            userData={userData}
          />
          
          {/* Main content */}
          <div className="md:col-span-2 space-y-4">
            {renderTabContent()}
          </div>
        </div>
      </div>
    </div>
  );
}