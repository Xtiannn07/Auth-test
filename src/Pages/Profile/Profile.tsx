import { useState, useEffect } from 'react';
import { useParams, Navigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useProfile } from '../../Contexts/ProfileContext';
import { UserService, UserProfile } from '../../Services/UserService';
import ProfileHeader from './ProfileHeader';
import ProfileEditModal from './ProfileComponents/ProfileEditModal';
import { Loader } from 'lucide-react';

export default function ProfilePage() {
  const { username } = useParams<{ username: string }>();
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { userProfile: myProfile } = useProfile();
  
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCurrentUser, setIsCurrentUser] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);

  // Fetch the profile based on username
  useEffect(() => {
    const fetchProfile = async () => {
      if (!username) return;
      
      try {
        setLoading(true);
        setError(null);

        // Try to get user by username
        const userProfile = await UserService.getUserByUsername(username);
        
        if (!userProfile) {
          setError('User not found');
          return;
        }
        
        setProfile(userProfile);
        
        // Check if this is the current user's profile
        if (currentUser && userProfile.uid === currentUser.uid) {
          setIsCurrentUser(true);
        } else {
          setIsCurrentUser(false);
          
          // Check if current user is following this profile
          if (currentUser) {
            const following = await UserService.isFollowing(
              currentUser.uid, 
              userProfile.uid
            );
            setIsFollowing(following);
          }
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username, currentUser]);

  // Handle follow/unfollow
  const handleFollowUser = async () => {
    if (!currentUser || !profile) return;
    
    try {
      await UserService.followUser(currentUser.uid, profile.uid);
      setIsFollowing(true);
    } catch (err) {
      console.error('Error following user:', err);
    }
  };

  // Update profile after edit
  const handleProfileUpdate = (updatedProfile: UserProfile) => {
    setProfile(updatedProfile);
    setIsEditModalOpen(false);
  };

  // If no username parameter, redirect to current user's profile
  if (!username && myProfile) {
    return <Navigate to={`/profile/${myProfile.username}`} />;
  }

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

  return (
    <div className="max-w-2xl mx-auto pb-8">
      <ProfileHeader 
        profile={profile}
        isCurrentUser={isCurrentUser}
        isFollowing={isFollowing}
        onEditProfile={() => setIsEditModalOpen(true)}
        onFollowUser={handleFollowUser}
      />
      
      {/* Profile content */}
      <div className="p-4">
        {/* Bio */}
        {profile.bio && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-800 mb-2">Bio</h3>
            <p className="text-gray-600">{profile.bio}</p>
          </div>
        )}
        
        {/* Statistics */}
        <div className="flex justify-around bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="text-center">
            <p className="font-bold text-lg">{profile.followerCount || 0}</p>
            <p className="text-gray-500 text-sm">Followers</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">{profile.followingCount || 0}</p>
            <p className="text-gray-500 text-sm">Following</p>
          </div>
          <div className="text-center">
            <p className="font-bold text-lg">0</p>
            <p className="text-gray-500 text-sm">Posts</p>
          </div>
        </div>
        
        {/* Posts section - this would be populated with the user's posts */}
        <div className="mt-6">
          <h3 className="font-medium text-gray-800 mb-2">Posts</h3>
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <p className="text-gray-500">No posts yet</p>
          </div>
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