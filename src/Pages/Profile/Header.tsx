// Header.jsx
import { Link } from 'lucide-react';
import ProfilePicture from '../../Components/UI/ProfilePicture';

export default function ProfileHeader({ currentUser, userData, onLogout, onSuccess, onError }) {
  if (!userData) return null;
  
  return (
    <div className="px-4 pt-2 pb-4">
      {/* Cover Photo */}
      <div className="h-32 -mx-4 bg-gray-800 relative">
        {userData.coverPhoto && (
          <img 
            src={userData.coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        )}
      </div>
      
      {/* Profile Picture */}
      <div className="relative -mt-12 ml-2">
        <ProfilePicture 
          src={userData.profilePicture} 
          size="lg" 
          alt={userData.displayName}
        />
      </div>
      
      {/* Profile Info */}
      <div className="mt-4">
        <h1 className="text-xl font-bold">{userData.displayName}</h1>
        <p className="text-gray-500">@{userData.username}</p>
        
        {userData.bio && (
          <p className="mt-3 text-sm">{userData.bio}</p>
        )}
        
        {userData.website && (
          <div className="mt-2 flex items-center text-gray-500 text-sm">
            <Link className="h-4 w-4 mr-1" />
            <a href={userData.website} target="_blank" rel="noopener noreferrer" className="text-blue-400">
              {userData.website.replace(/https?:\/\/(www\.)?/i, '')}
            </a>
          </div>
        )}
        
        {/* User Stats */}
        <div className="flex mt-3 text-sm">
          <div className="flex items-center mr-4">
            <span className="font-bold mr-1">{userData.followingCount}</span>
            <span className="text-gray-500">Following</span>
          </div>
          <div className="flex items-center mr-4">
            <span className="font-bold mr-1">{userData.followerCount}</span>
            <span className="text-gray-500">Followers</span>
          </div>
          <div className="flex items-center">
            <span className="font-bold mr-1">{userData.postCount}</span>
            <span className="text-gray-500">Posts</span>
          </div>
        </div>
      </div>
    </div>
  );
}