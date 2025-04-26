import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import UsersActionButtons from './UsersActionButtons';
import { User, isUserFollowed } from '../SearchComponents/SearchApi';

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
    if (newStatus) {
      handleRemove();
    }
  };
  
  const handleRemove = () => {
    if (!isVisible) return;
    setIsRemoving(true);
    setTimeout(() => {
      setIsVisible(false);
      if (onCardRemove) {
        onCardRemove();
      }
    }, 300);
  };

  if (!isVisible) {
    return null;
  }

  const displayUsername = user.username || (user.email ? user.email.split('@')[0] : 'User');
  const userInitial = user.displayName 
    ? user.displayName.charAt(0).toUpperCase() 
    : user.username 
      ? user.username.charAt(0).toUpperCase()
      : user.email
        ? user.email.charAt(0).toUpperCase()
        : '?';

  return (
    <div 
      className={`bg-white rounded-lg shadow-sm p-3 sm:p-4 mb-3 flex items-center justify-between
        ${isRemoving ? 'transform translate-x-full opacity-0' : 'transform translate-x-0 opacity-100'}
        transition-all duration-300 ease-out hover:bg-gray-50
      `}
    >
      <Link 
        to={`/user/${user.id}`} 
        className="flex items-center flex-1 min-w-0 group"
      >
        {/* Profile image - smaller on mobile */}
        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gray-200 mr-3 sm:mr-4 flex-shrink-0 flex items-center justify-center border border-gray-100 overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
          {user.photoURL ? (
            <img 
              src={user.photoURL} 
              alt={user.displayName || displayUsername} 
              className="w-full h-full rounded-full object-cover"
            />
          ) : (
            <span className="text-gray-600 font-medium text-base sm:text-lg">
              {userInitial}
            </span>
          )}
        </div>
        
        <div className="min-w-0 flex-1 space-y-0.5">
          <h3 className="font-semibold text-gray-900 text-sm sm:text-base truncate group-hover:text-gray-300 transition-colors">
            {user.displayName || displayUsername}
          </h3>
          <p className="text-gray-500 text-xs sm:text-sm truncate">@{displayUsername}</p>
          {user.bio && (
            <p className="text-gray-600 text-xs sm:text-sm truncate mt-0.5 hidden sm:block">
              {user.bio}
            </p>
          )}
        </div>
      </Link>
      
      <div className="ml-3 sm:ml-4 flex-shrink-0">
        <UsersActionButtons 
          userId={user.id || user.uid}
          username={user.username}
          displayName={user.displayName}
          isFollowing={isFollowing}
          onFollowStatusChange={handleFollowStatusChange}
          onRemove={handleRemove}
          isLoading={isLoading}
        />
      </div>
    </div>
  );
};

export default UsersCard;