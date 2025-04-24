import { useState, useEffect } from 'react';
import { useProfile } from '../../Contexts/ProfileContext';
import ProfileEditModal from '../ProfileComponents/ProfileEditModal';
import UserPosts from '../ProfileComponents/UserPosts';
import UserReposts from '../ProfileComponents/UserReposts';
import UserSavedPosts from '../ProfileComponents/UserSavedPosts';
import FollowersList from '../ProfileComponents/FollowersList';
import { Loader, Edit, BookmarkIcon, RefreshCw, MessageSquare } from 'lucide-react';
import UserService from '../../Services/UserService';

export default function ProfilePage() {
  const { userProfile: profile, loading, error, refreshProfile } = useProfile();
  
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);
  const [activeTab, setActiveTab] = useState<'posts' | 'reposts' | 'saved'>('posts');
  const [followListType, setFollowListType] = useState<'followers' | 'following'>('followers');
  const [isFollowListOpen, setIsFollowListOpen] = useState(false);

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
  const handleProfileUpdate = async () => {
    setIsEditModalOpen(false);
    // Refresh the profile to update UI
    await refreshProfile();
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
      <div className="max-w-6xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <p className="text-red-500">{error || 'Profile not found'}</p>
        </div>
      </div>
    );
  }

  // Username display
  const displayUsername = profile.username || (profile.email ? profile.email.split('@')[0] : 'User');

  return (
    <div className="max-w-6xl mx-auto pb-4 sm:pb-8">
      {/* Modern header with subtle gradient background */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-4 sm:p-6 rounded-b-lg relative">
        <div className="flex flex-col space-y-3 sm:space-y-4">
          <div className="flex justify-between items-start">
            {/* Profile image with improved shadow - smaller on mobile */}
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full border-2 border-white/20 overflow-hidden bg-gray-200 shadow-xl">
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

            {/* Edit profile button - smaller on mobile */}
            <button 
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 sm:px-4 py-1 sm:py-1.5 rounded-full text-xs sm:text-sm font-medium bg-white/10 text-white hover:bg-white/20 transition-colors flex items-center backdrop-blur-sm border border-white/10"
            >
              <Edit size={12} className="mr-1 sm:mr-1.5" />
              Edit
            </button>
          </div>

          {/* User info with improved layout - smaller text on mobile */}
          <div className="space-y-0.5 sm:space-y-1">
            <h1 className="text-xl sm:text-2xl font-bold">{profile.displayName || displayUsername}</h1>
            <p className="text-xs sm:text-sm text-white/70">@{displayUsername}</p>
            {profile.bio && (
              <p className="text-xs sm:text-sm text-white/90 mt-1 sm:mt-2 leading-relaxed">{profile.bio}</p>
            )}
          </div>

          {/* Threads-style followers count - smaller on mobile */}
          <div className="flex items-center space-x-3 sm:space-x-4 text-xs sm:text-sm text-white/80">
            <button 
              onClick={() => {
                setFollowListType('followers');
                setIsFollowListOpen(true);
              }}
              className="hover:text-white transition-colors flex items-center space-x-1"
            >
              <span className="font-semibold">{followerCount}</span>
              <span className="text-white/60">followers</span>
            </button>
            <button 
              onClick={() => {
                setFollowListType('following');
                setIsFollowListOpen(true);
              }}
              className="hover:text-white transition-colors flex items-center space-x-1"
            >
              <span className="font-semibold">{followingCount}</span>
              <span className="text-white/60">following</span>
            </button>
          </div>
        </div>
      </div>
      
      {/* Modern Tab Navigation - smaller on mobile */}
      <div className="mt-3 sm:mt-4 bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="flex border-b">
          <button
            className={`flex-1 py-2 sm:py-3 px-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${
              activeTab === 'posts'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('posts')}
          >
            <MessageSquare size={14} className="sm:w-4 sm:h-4" />
            <span>Posts</span>
          </button>
          
          <button
            className={`flex-1 py-2 sm:py-3 px-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${
              activeTab === 'reposts'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('reposts')}
          >
            <RefreshCw size={14} className="sm:w-4 sm:h-4" />
            <span>Reposts</span>
          </button>
          
          <button
            className={`flex-1 py-2 sm:py-3 px-2 text-center text-xs sm:text-sm font-medium flex items-center justify-center space-x-1 transition-colors ${
              activeTab === 'saved'
                ? 'text-black border-b-2 border-black'
                : 'text-gray-500 hover:text-gray-800'
            }`}
            onClick={() => setActiveTab('saved')}
          >
            <BookmarkIcon size={14} className="sm:w-4 sm:h-4" />
            <span>Saved</span>
          </button>
        </div>
        
        {/* Content based on active tab - adjusted padding for mobile */}
        <div className="p-3 sm:p-5">
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
      
      {/* Followers/Following List Modal */}
      {profile.uid && (
        <FollowersList
          userId={profile.uid}
          type={followListType}
          isOpen={isFollowListOpen}
          onClose={() => setIsFollowListOpen(false)}
        />
      )}
    </div>
  );
}
