import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { UserService, UserProfile } from '../../Services/UserService';
import UserPosts from '../ProfileComponents/UserPosts';
import { Loader } from 'lucide-react';

export default function UserProfilePage() {
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followerCount, setFollowerCount] = useState(0);
  const [followingCount, setFollowingCount] = useState(0);

  // Fetch the profile based on userId
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);

        // Check if this is the current user's profile
        if (currentUser && userId === currentUser.uid) {
          // If it is the current user, redirect to the profile page
          navigate('/profile');
          return;
        }

        // Try to get user by ID
        const userProfile = await UserService.getUserProfile(userId);
        
        if (!userProfile) {
          setError('User not found');
          return;
        }
        
        setProfile(userProfile);
        
        // Check if current user is following this profile
        if (currentUser) {
          const following = await UserService.isFollowing(
            currentUser.uid, 
            userProfile.uid
          );
          setIsFollowing(following);
        }

        // Fetch follower and following counts from new collections
        const followersCount = await UserService.getFollowerCount(userId);
        const followingCount = await UserService.getFollowingCount(userId);
        setFollowerCount(followersCount);
        setFollowingCount(followingCount);

      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [userId, currentUser, navigate]);

  // Handle follow/unfollow
  const handleFollowUser = async () => {
    if (!currentUser || !profile) return;
    
    try {
      if (isFollowing) {
        await UserService.unfollowUser(currentUser.uid, profile.uid);
        setIsFollowing(false);
        setFollowerCount(prev => prev - 1);
      } else {
        await UserService.followUser(currentUser.uid, profile.uid);
        setIsFollowing(true);
        setFollowerCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error updating follow status:', err);
    }
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

  // Username display - use username, or email without domain if no username
  const displayUsername = profile.username || (profile.email ? profile.email.split('@')[0] : 'User');

  return (
    <div className="max-w-2xl mx-auto pb-8">
      {/* Header with background color */}
      <div className="bg-gray-900 text-white p-4 relative">
        <div className="flex items-end space-x-4 pb-4">
          {/* Profile image */}
          <div className="w-20 h-20 rounded-full border-4 border-white overflow-hidden bg-gray-200">
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

          {/* User info */}
          <div>
            <h1 className="text-2xl font-bold">{profile.displayName || displayUsername}</h1>
            <p className="text-sm opacity-80">
              New York
            </p>
          </div>
        </div>

        {/* Follow button */}
        <button 
          onClick={handleFollowUser}
          className={`absolute right-4 bottom-4 px-6 py-1.5 rounded-full text-sm font-medium ${
            isFollowing ? 'bg-white text-gray-800' : 'bg-blue-500 text-white'
          }`}
        >
          {isFollowing ? 'Following' : 'Follow'}
        </button>
      </div>
      
      {/* Stats section */}
      <div className="flex justify-around py-4 border-b border-gray-200">
        <div className="text-center">
          <p className="font-bold text-xl">{followerCount}</p>
          <p className="text-gray-500 text-sm">Followers</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">{followingCount}</p>
          <p className="text-gray-500 text-sm">Following</p>
        </div>
        <div className="text-center">
          <p className="font-bold text-xl">0</p>
          <p className="text-gray-500 text-sm">Photos</p>
        </div>
      </div>
      
      {/* Bio section */}
      {profile.bio && (
        <div className="p-4">
          <p className="text-gray-700">{profile.bio}</p>
        </div>
      )}
      
      {/* Posts section - Use UserPosts component */}
      <div className="mt-4 p-4">
        <h2 className="text-xl font-semibold mb-4">Posts</h2>
        {userId && <UserPosts userId={userId} includeFollowing={false} />}
      </div>
    </div>
  );
}
