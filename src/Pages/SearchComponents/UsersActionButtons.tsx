import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { UserMinus, UserPlus, X } from 'lucide-react';
import { removeUserSuggestion } from './SearchApi';
import { UserService } from './../../Services/UserService'; // Import UserService
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface UsersActionButtonsProps {
  userId: string;
  isFollowing?: boolean;
  isLoading?: boolean;
  onFollowStatusChange?: (isFollowing: boolean) => void;
  onRemove?: () => void;
}

const UsersActionButtons: React.FC<UsersActionButtonsProps> = ({ 
  userId, 
  isFollowing = false,
  isLoading: isCheckingStatus = false,
  onFollowStatusChange,
  onRemove
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isSliding, setIsSliding] = useState(false);
  const [currentIsFollowing, setCurrentIsFollowing] = useState(isFollowing);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  const handleFollow = async () => {
    if (!currentUser) return;
    
    setIsLoading(true);
    try {
      // Use UserService instead of SearchPageService
      await UserService.followUser(currentUser.uid, userId);
      setCurrentIsFollowing(true);
      if (onFollowStatusChange) {
        onFollowStatusChange(true);
      }
      // Invalidate queries that might contain user lists
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
    
    setIsSliding(true);
    
    // Wait for slide animation to complete
    setTimeout(async () => {
      try {
        await removeUserSuggestion(userId, currentUser.uid);
        // Invalidate queries to refresh user lists
        queryClient.invalidateQueries({ queryKey: ['users'] });
        
        if (onRemove) {
          onRemove();
        }
      } catch (error) {
        console.error('Error removing user suggestion:', error);
        setIsSliding(false); // Reset if there's an error
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
    <div className="flex space-x-2">
      <button
        onClick={handleFollow}
        disabled={isLoading || isCheckingStatus || currentIsFollowing}
        className={`px-3 py-1 rounded-full text-sm font-medium flex items-center
          ${currentIsFollowing 
            ? 'border border-gray-300 text-gray-700' 
            : 'bg-blue-500 text-white hover:bg-blue-600'}
          ${(isLoading || isCheckingStatus) ? 'opacity-75' : ''}
          transition-all duration-200`}
        aria-label={currentIsFollowing ? "Following" : "Follow"}
      >
        {!currentIsFollowing && <UserPlus size={16} className="mr-1" />}
        {isLoading || isCheckingStatus 
          ? '...' 
          : currentIsFollowing 
            ? 'Following' 
            : 'Follow'}
      </button>
      
      <button
        onClick={handleRemove}
        className="p-2 rounded-full hover:bg-gray-100 text-gray-500"
        aria-label="Remove from suggestions"
      >
        <X size={18} />
      </button>
    </div>
  );
};

export default UsersActionButtons;