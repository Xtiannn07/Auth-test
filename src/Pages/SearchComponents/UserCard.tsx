import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import UsersActionButtons from './UsersActionButtons';
import { User, isUserFollowed } from './SearchApi';

interface UsersCardProps {
  user: User;
  onCardRemove?: () => void;
}

const UsersCard: React.FC<UsersCardProps> = ({ user, onCardRemove }) => {
  const [isRemoving, setIsRemoving] = useState(false);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  
  useEffect(() => {
    const checkFollowStatus = async () => {
      if (!currentUser || !user.id) return;
      
      try {
        const following = await isUserFollowed(currentUser.uid, user.id);
        setIsFollowing(following);
      } catch (error) {
        console.error("Error checking follow status:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [currentUser, user.id]);
  
  const handleFollowStatusChange = (newStatus: boolean) => {
    setIsFollowing(newStatus);
    // When user follows someone, start the removal animation
    if (newStatus === true) {
      handleRemove();
    }
  };
  
  const handleRemove = () => {
    setIsRemoving(true);
    // Use setTimeout to match the animation duration
    setTimeout(() => {
      setIsVisible(false);
      if (onCardRemove) {
        setTimeout(() => {
          onCardRemove();
        }, 300);
      }
    }, 300);
  };

  // Get initial letter for avatar placeholder
  const userInitial = user.displayName 
    ? user.displayName.charAt(0).toUpperCase() 
    : user.username 
      ? user.username.charAt(0).toUpperCase()
      : user.email
        ? user.email.charAt(0).toUpperCase()
        : '?';

  // Username display - use username, or email without domain if no username
  const displayUsername = user.username || (user.email ? user.email.split('@')[0] : 'User');

  if (!isVisible) {
    return null;
  }

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-4 mb-3 flex items-center justify-between
        ${isRemoving ? 'transform translate-x-full opacity-0' : ''}
        transition-all duration-300
      `}
    >
      <Link 
        to={`/user/${user.id}`} 
        className="flex items-center flex-1"
      >
        {/* Avatar placeholder */}
        <div className="w-12 h-12 rounded-full bg-gray-200 mr-4 flex items-center justify-center">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || displayUsername} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium text-lg">
              {userInitial}
            </span>
          )}
        </div>
        
        <div>
          <h3 className="font-medium text-gray-900">
            {user.displayName || displayUsername}
          </h3>
          <p className="text-gray-500 text-sm">@{displayUsername}</p>
          {user.email && (
            <p className="text-gray-600 text-sm mt-1 truncate">{user.email}</p>
          )}
        </div>
      </Link>
      
      <UsersActionButtons 
        userId={user.id || user.uid}
        isFollowing={isFollowing}
        onFollowStatusChange={handleFollowStatusChange}
        onRemove={handleRemove}
        isLoading={isLoading}
      />
    </div>
  );
};

export default UsersCard;