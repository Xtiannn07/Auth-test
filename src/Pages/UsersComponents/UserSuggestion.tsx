// src/Components/UserSuggestion/UserSuggestion.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, X } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { followUser, removeUserSuggestion } from '../SearchComponents/SearchApi';
import Notification from '../../Components/UI/Notifications';
import UserService from '../../services/UserService';

interface UserSuggestionProps {
  user: {
    id?: string;
    uid: string;
    username: string;
    displayName?: string;
    photoURL?: string;
  };
  onFollow?: (userId: string) => void;
  onRemove?: (userId: string) => void;
}

const UserSuggestion = ({ user, onFollow, onRemove }: UserSuggestionProps) => {
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  // Check initial follow status
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !user.id) return;
      try {
        const following = await UserService.isFollowing(currentUser.uid, user.id);
        if (following) {
          // If already following, remove from suggestions
          handleRemove();
        }
      } catch (error) {
        console.error("Error checking follow status:", error);
      }
    };
    
    checkFollowStatus();
  }, [currentUser, user.id]);

  const handleFollow = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      const targetUserId = user.id || user.uid;
      const success = await followUser(currentUser.uid, targetUserId);
      
      if (success) {
        setIsFollowing(true);
        setNotification({ type: 'success', message: `You are now following ${user.displayName || user.username}` });
        
        // Invalidate relevant queries
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
        queryClient.invalidateQueries({ queryKey: ['user', currentUser.uid] });
        queryClient.invalidateQueries({ queryKey: ['user', targetUserId] });
        
        // Handle UI removal with animation
        handleFadeOut();
        
        if (onFollow) {
          onFollow(targetUserId);
        }
      } else {
        setNotification({ type: 'error', message: 'Failed to follow user. Please try again.' });
      }
    } catch (error) {
      console.error('Error following user:', error);
      setNotification({ type: 'error', message: 'An error occurred while following user' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRemove = async () => {
    if (!currentUser) return;
    
    setIsRemoving(true);
    try {
      const targetUserId = user.id || user.uid;
      await removeUserSuggestion(targetUserId, currentUser.uid);
      
      // Invalidate queries to refresh user suggestions
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
      
      // Handle UI removal with animation
      handleFadeOut();
      
      // Notify parent component if onRemove callback exists
      if (onRemove) {
        onRemove(targetUserId);
      }
    } catch (error) {
      console.error('Error removing suggestion:', error);
      setIsRemoving(false);
      setNotification({ type: 'error', message: 'Failed to remove suggestion' });
    }
  };
  
  const handleFadeOut = () => {
    setIsVisible(false);
    // After animation completes, we'll be removed from DOM by parent
  }

  if (!isVisible) {
    return (
      <div className="animate-fade-out opacity-0 h-0 overflow-hidden transition-all duration-500"></div>
    );
  }

  return (
    <>
      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}
      
      <div className={`flex items-center justify-between py-2 
        ${isRemoving ? 'opacity-0 transform translate-x-full' : 'opacity-100'} 
        transition-all duration-300`}>
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
    </>
  );
};

export default UserSuggestion;