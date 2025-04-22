// src/Pages/Profile/ProfileHeader.tsx
import { UserProfile } from '../../Services/UserService';
import { ArrowLeft, Edit, UserPlus, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ProfileHeaderProps {
  profile: UserProfile;
  isCurrentUser: boolean;
  isFollowing: boolean;
  followerCount: number;
  followingCount: number;
  onEditProfile: () => void;
  onFollowUser: () => void;
}

const ProfileHeader = ({ 
  profile, 
  isCurrentUser, 
  isFollowing,
  followerCount,
  followingCount,
  onEditProfile,
  onFollowUser
}: ProfileHeaderProps) => {
  const navigate = useNavigate();

  return (
    <div className="sticky top-0 bg-white shadow-sm z-10">
      {/* Navigation bar */}
      <div className="flex items-center px-4 py-3 border-b">
        <button 
          onClick={() => navigate(-1)} 
          className="mr-4 p-1 rounded-full hover:bg-gray-100"
          aria-label="Go back"
        >
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="font-medium text-lg">{profile.displayName}</h1>
          <p className="text-gray-500 text-sm">@{profile.username}</p>
        </div>
      </div>
      
      {/* Profile info */}
      <div className="px-4 py-6">
        <div className="flex mb-4">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-gray-200 mr-4 flex items-center justify-center overflow-hidden">
            {profile.photoURL ? (
              <img 
                src={profile.photoURL} 
                alt={profile.displayName} 
                className="w-full h-full object-cover"
              />
            ) : (
              <span className="text-gray-600 font-medium text-2xl">
                {profile.displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          
          {/* Action buttons */}
          <div className="flex-1 flex items-center justify-end">
            {isCurrentUser ? (
              <button
                onClick={onEditProfile}
                className="px-4 py-2 border border-gray-300 rounded-full text-sm font-medium flex items-center hover:bg-gray-50"
              >
                <Edit size={16} className="mr-1" />
                Edit Profile
              </button>
            ) : (
              <button
                onClick={onFollowUser}
                disabled={isFollowing}
                className={`
                  px-4 py-2 rounded-full text-sm font-medium flex items-center
                  ${isFollowing 
                    ? 'bg-gray-100 text-gray-600 border border-gray-300' 
                    : 'bg-blue-500 text-white hover:bg-blue-600'}
                `}
              >
                {isFollowing ? (
                  <>
                    <Check size={16} className="mr-1" />
                    Following
                  </>
                ) : (
                  <>
                    <UserPlus size={16} className="mr-1" />
                    Follow
                  </>
                )}
              </button>
            )}
          </div>
        </div>
        
        {/* Follower stats */}
        <div className="flex space-x-4 text-sm">
          <div>
            <span className="font-medium">{followerCount || 0}</span>{' '}
            <span className="text-gray-500">Followers</span>
          </div>
          <div>
            <span className="font-medium">{followingCount || 0}</span>{' '}
            <span className="text-gray-500">Following</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;