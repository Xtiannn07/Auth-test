// src/Components/UsersActionButtons.tsx
import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserPlus, X } from 'lucide-react';
import { followUser, removeUserSuggestion } from '../SearchComponents/SearchApi';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import Notification from '../../Components/UI/Notifications';

interface UsersActionButtonsProps {
  userId: string;
  username?: string;
  displayName?: string;
  isFollowing?: boolean;
  isLoading?: boolean;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  onRemove?: () => void;
  compact?: boolean; // New prop for compact mode
}

const UsersActionButtons: React.FC<UsersActionButtonsProps> = ({ 
  userId, 
  username = '',
  displayName = '',
  isFollowing = false,
  isLoading: isCheckingStatus = false,
  onFollowStatusChange,
  onRemove,
  compact = false // Default to standard size
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [currentIsFollowing, setCurrentIsFollowing] = useState(isFollowing);
  const [notification, setNotification] = useState<{type: 'success' | 'error', message: string} | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  useEffect(() => {
    setCurrentIsFollowing(isFollowing);
  }, [isFollowing]);

  const handleFollow = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Follow the user
      const success = await followUser(currentUser.uid, userId);
      
      if (success) {
        setCurrentIsFollowing(true);
        const displayText = displayName || username || 'user';
        setNotification({ type: 'success', message: `You are now following ${displayText}` });
        
        // Notify parent component if callback exists
        if (onFollowStatusChange) {
          onFollowStatusChange(true);
        }
        
        // Invalidate queries that might contain user lists
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
        queryClient.invalidateQueries({ queryKey: ['user', currentUser.uid] });
        queryClient.invalidateQueries({ queryKey: ['user', userId] });
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
    
    setIsSliding(true);
    
    // Wait for slide animation to complete
    setTimeout(async () => {
      try {
        await removeUserSuggestion(userId, currentUser.uid);
        // Invalidate queries to refresh user lists
        queryClient.invalidateQueries({ queryKey: ['users'] });
        queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
        
        if (onRemove) {
          onRemove();
        }
      } catch (error) {
        console.error('Error removing user suggestion:', error);
        setIsSliding(false); // Reset if there's an error
        setNotification({ type: 'error', message: 'Failed to remove suggestion' });
      }
    }, 300);
  };

  if (isSliding) {
    return (
      <div className="transform translate-x-full opacity-0 transition-all duration-300 ease-out">
        Removing...
      </div>
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
      
      <div className="flex space-x-2">
        <button
          onClick={handleFollow}
          disabled={isLoading || isCheckingStatus || currentIsFollowing}
          className={`${compact ? 'px-2 py-0.5' : 'px-3 py-1'} rounded-full ${compact ? 'text-xs' : 'text-sm'} font-medium flex items-center
            ${currentIsFollowing 
              ? 'border border-gray-300 text-gray-700' 
              : 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white hover:bg-blue-900'}
            ${(isLoading || isCheckingStatus) ? 'opacity-75' : ''}
            transition-all duration-200`}
          aria-label={currentIsFollowing ? "Following" : "Follow"}
        >
          {!currentIsFollowing && <UserPlus size={compact ? 14 : 16} className={compact ? '' : 'mr-1'} />}
          {isLoading || isCheckingStatus 
            ? '...' 
            : currentIsFollowing 
              ? 'Following' 
              : compact ? null : 'Follow'}
        </button>
        
        <button
          onClick={handleRemove}
          className={`${compact ? 'p-1' : 'p-2'} rounded-full hover:bg-gray-200 text-gray-500`}
          aria-label="Remove from suggestions"
        >
          <X size={compact ? 14 : 18} />
        </button>
      </div>
    </>
  );
};

export default UsersActionButtons;