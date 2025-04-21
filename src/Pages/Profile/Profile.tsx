import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useProfile } from '../../Contexts/ProfileContext';
import { UserProfile } from '../../Services/UserService';
import ProfileEditModal from '../ProfileComponents/ProfileEditModal';
import UserPosts from '../ProfileComponents/UserPosts';
import { Loader, Edit } from 'lucide-react';

export default function ProfilePage() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { userProfile: profile, loading, error } = useProfile();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  // Update profile after edit
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    // Profile will be updated in context
    setIsEditModalOpen(false);
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader className="w-8 h-8 text-blue-500 animate-spin" />
      </div>
    );
  }

  // Error state
  if (error || !profile) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-500">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  // Username display
  const displayUsername = profile.username || (profile.email ? profile.email.split('@')[0] : 'User');

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Enhanced header with gradient background */}
      <div className="bg-gradient-to-r from-blue-900 to-purple-900 text-white p-6 rounded-b-lg relative">
        <div className="flex items-end space-x-5 pb-4">
          {/* Profile image - larger size with subtle shadow */}
          <div className="w-24 h-24 rounded-full border-4 border-white overflow-hidden bg-gray-200 shadow-lg">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.displayName || displayUsername} 
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-300"></div>
            )}
          </div>

          {/* User info with improved typography */}
          <div>
            <h1 className="text-3xl font-bold">{profile.displayName || displayUsername}</h1>
            <p className="text-sm opacity-80 font-medium">
              Kunware Tga New York ako
            </p>
            <p className="text-sm opacity-70 mt-1">
              @{displayUsername}
            </p>
          </div>
        </div>

        {/* Edit profile button */}
        <button 
          onClick={() => setIsEditModalOpen(true)}
          className="absolute right-6 bottom-6 px-6 py-2 rounded-full text-sm font-medium bg-white text-purple-900 hover:bg-gray-100 transition-colors flex items-center"
        >
          <Edit size={16} className="mr-2" />
          Edit Profile
        </button>
      </div>
      
      {/* Stats section with improved styling */}
      <div className="flex justify-around py-5 border-b border-gray-200 bg-white shadow-sm">
        <div className="text-center">
          <p className="font-bold text-2xl">{profile.followerCount || 0}</p>
          <p className="text-gray-500 text-sm font-medium">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-2xl">{profile.followingCount || 0}</p>
          <p className="text-gray-500 text-sm font-medium">Following</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-2xl">0</p>
          <p className="text-gray-500 text-sm font-medium">Photos</p>
        </div>
      </div>
      
      {/* Bio section with improved styling */}
      {profile.bio && (
        <div className="p-5 bg-white mt-4 rounded-lg shadow-sm">
          <p className="text-gray-700 leading-relaxed">{profile.bio}</p>
        </div>
      )}
      
      {/* Posts section with UserPosts component */}
      <div className="mt-6 bg-white p-5 rounded-lg shadow-sm">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <span className="mr-2">Posts</span>
          <span className="text-sm font-normal text-gray-500">
            {currentUser && <span>(Your content and followed users)</span>}
          </span>
        </h2>
        
        {/* Use the UserPosts component with includeFollowing set to true */}
        {currentUser && (
          <UserPosts userId={currentUser.uid} includeFollowing={true} />
        )}
      </div>
      
      {/* Edit Profile Modal */}
      {isEditModalOpen && (
        <ProfileEditModal
          profile={profile}
          onClose={() => setIsEditModalOpen(false)}
          onSave={handleProfileUpdate}
        />
      )}
    </div>
  );
}