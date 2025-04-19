// src/Components/UserSuggestion/UserSuggestion.tsx
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { UserService } from '../../Services/UserService';

interface UserSuggestionProps {
  user: {
    id: string;
    username: string;
    displayName?: string;
    photoURL?: string;
  };
  onFollow: (userId: string) => void;
}

const UserSuggestion = ({ user, onFollow }: UserSuggestionProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  const handleFollow = async () => {
    setIsLoading(true);
    try {
      await onFollow(user.id);
      setIsFollowing(true);
      // Invalidate relevant queries
      queryClient.invalidateQueries({ queryKey: ['users'] });
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentUser) return;
    
    setIsRemoving(true);
    try {
      // Use the removeUserSuggestion function from SearchPageService
      // Note: In the future, this could be moved to UserService for consistency
      await import('../SearchComponents/SearchApi').then(module => {
        return module.removeUserSuggestion(user.id, currentUser.uid);
      });
      
      // Invalidate queries to refresh user suggestions
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
    } catch (error) {
      console.error('Error removing suggestion:', error);
      setIsRemoving(false);
    }
  };

  return (
    <div className={`flex items-center justify-between py-2 ${isRemoving ? 'animate-slide-out opacity-0' : ''}`}>
      <Link to={`/profile/${user.username}`} className="flex items-center">
        <div className="flex-shrink-0">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || user.username} 
              className="w-10 h-10 rounded-full object-cover"
            />
          ) : (
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center text-gray-600">
              {(user.displayName || user.username || '?').charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <div className="ml-3">
          <p className="font-medium text-sm">{user.displayName || user.username}</p>
          <p className="text-gray-500 text-xs">@{user.username}</p>
        </div>
      </Link>
      
      <div className="flex space-x-1">
        <button
          onClick={handleFollow}
          disabled={isLoading || isFollowing}
          className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
            ${isFollowing 
              ? 'border border-gray-300 text-gray-700' 
              : 'bg-blue-500 text-white hover:bg-blue-600'}
            ${isLoading ? 'opacity-75' : ''}
            transition-all duration-200`}
          aria-label={isFollowing ? "Following" : "Follow"}
        >
          {!isFollowing && <UserPlus size={16} className="mr-1" />}
          {isLoading 
            ? '...' 
            : isFollowing 
              ? 'Following' 
              : 'Follow'}
        </button>
        
        <button
          onClick={handleRemove}
          className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
          aria-label="Remove from suggestions"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
};

export default UserSuggestion;