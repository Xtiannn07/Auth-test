import { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useProfile } from '../../Contexts/ProfileContext';
import { UserProfile } from '../../Services/UserService';
import ProfileEditModal from '../ProfileComponents/ProfileEditModal';
import UserPosts from '../ProfileComponents/UserPosts';
import UserReposts from '../ProfileComponents/UserReposts';
import UserSavedPosts from '../ProfileComponents/UserSavedPosts';
import { Loader, Edit, BookmarkIcon, RefreshCw, MessageSquare } from 'lucide-react';
import { UserService } from '../../Services/UserService';

export default function ProfilePage() {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { userProfile: profile, loading, error } = useProfile();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts' | 'saved'>('posts');

  // Fetch follower and following counts when profile changes
  useEffect(() => {
    const fetchCounts = async () => {
      if (profile && profile.uid) {
        const followers = await UserService.getFollowerCount(profile.uid);
        const following = await UserService.getFollowingCount(profile.uid);
        setFollowerCount(followers);
        setFollowingCount(following);
      }
    };
    fetchCounts();
  }, [profile]);

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
          <p className="font-bold text-2xl">{followerCount}</p>
          <p className="text-gray-500 text-sm font-medium">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-2xl">{followingCount}</p>
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
      
      {/* Tab Navigation */}
      <div className="mt-6 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-4 px-2 text-center font-medium flex items-center justify-center space-x-1 ${
              activeTab === 'posts'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <MessageSquare size={18} />
            <span>Posts</span>
          </button>
          
          <button
            className={`flex-1 py-4 px-2 text-center font-medium flex items-center justify-center space-x-1 ${
              activeTab === 'reposts'
                ? 'text-green-600 border-b-2 border-green-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('reposts')}
          >
            <RefreshCw size={18} />
            <span>Reposts</span>
          </button>
          
          <button
            className={`flex-1 py-4 px-2 text-center font-medium flex items-center justify-center space-x-1 ${
              activeTab === 'saved'
                ? 'text-amber-600 border-b-2 border-amber-600'
                : 'text-gray-600 hover:bg-gray-50'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <BookmarkIcon size={18} />
            <span>Saved</span>
          </button>
        </div>
        
        {/* Content based on active tab */}
        <div className="p-5">
          {activeTab === 'posts' && profile.uid && (
            <UserPosts userId={profile.uid} includeFollowing={false} />
          )}
          
          {activeTab === 'reposts' && profile.uid && (
            <UserReposts userId={profile.uid} />
          )}
          
          {activeTab === 'saved' && profile.uid && (
            <UserSavedPosts userId={profile.uid} />
          )}
        </div>
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
