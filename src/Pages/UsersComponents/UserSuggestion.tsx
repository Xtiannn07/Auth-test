// src/Components/UserSuggestion/UserSuggestion.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';

interface UserSuggestionProps {
  user: {
    id: string;
    username: string;
    displayName?: string;
  };
  onFollow: (userId: string) => void;
}

const UserSuggestion = ({ user, onFollow }: UserSuggestionProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await onFollow(user.id);
      setIsFollowing(true);
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-between py-3">
      <Link 
        to={`/profile/${user.username}`} 
        className="flex items-center flex-1 hover:underline"
      >
        
        {/* Simple circle placeholder instead of Avatar */}
        <div className="w-10 h-10 rounded-full bg-gray-200 mr-3 flex items-center justify-center">
          <span className="text-gray-500 text-sm">
            {user.username.charAt(0).toUpperCase()}
          </span>
        </div>
        <div className="overflow-hidden">
          <h4 className="font-medium truncate">{user.displayName || user.username}</h4>
          <p className="text-gray-500 text-sm truncate">@{user.username}</p>
        </div>
      </Link>
      
      
      {/* Using native button instead of custom Button component */}
      <button
        onClick={handleFollow}
        disabled={isLoading || isFollowing}
        className={`
          ml-2 w-24 px-3 py-1 rounded-full text-sm font-medium
          ${isFollowing 
            ? 'border border-gray-300 text-gray-700' 
            : 'bg-blue-500 text-white hover:bg-blue-600'
          }
          ${(isLoading || isFollowing) ? 'opacity-75' : ''}
        `}
      >
        {isLoading ? '...' : isFollowing ? 'Following' : 'Follow'}
      </button>
    </div>
  );
};

export default UserSuggestion;