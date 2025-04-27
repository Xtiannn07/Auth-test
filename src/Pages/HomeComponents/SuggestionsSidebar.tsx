import { useState, useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import UserCard from '../UsersComponents/UserCard';
import { SkeletonUser } from '../../Components/UI/Skeleton';
import { removeUserSuggestion, isUserFollowed } from '../SearchComponents/SearchApi';
import type { User } from '../SearchComponents/SearchApi';

interface SuggestionsSidebarProps {
  suggestions: User[];
  isLoading: boolean;
  error: unknown;
  onRefresh: () => void;
}

const SuggestionsSidebar: React.FC<SuggestionsSidebarProps> = ({
  suggestions,
  isLoading,
  error,
  onRefresh
}) => {
  const [filteredSuggestions, setFilteredSuggestions] = useState<User[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  // Filter out followed users
  useEffect(() => {
    const filterFollowedUsers = async () => {
      if (!currentUser || !suggestions || suggestions.length === 0) {
        setFilteredSuggestions([]);
        return;
      }

      // Filter suggestions to exclude followed users
      const notFollowedUsers = await Promise.all(
        suggestions.map(async (user) => {
          if (!user.id || !currentUser.uid) return null;
          
          try {
            const isFollowing = await isUserFollowed(currentUser.uid, user.id);
            return isFollowing ? null : user;
          } catch (error) {
            console.error("Error checking follow status:", error);
            return null;
          }
        })
      );

      // Filter out null values and set the filtered suggestions
      setFilteredSuggestions(notFollowedUsers.filter(Boolean) as User[]);
    };

    filterFollowedUsers();
  }, [suggestions, currentUser]);

  // Handle when a user is removed from suggestions
  const handleUserRemove = async (userId: string) => {
    if (currentUser && userId) {
      try {
        // Use the SearchApi function to remove the user suggestion
        await removeUserSuggestion(userId, currentUser.uid);
        
        // Update the filtered suggestions by removing the user
        setFilteredSuggestions(prev => prev.filter(user => user.id !== userId));
        
        // Update the cached suggestions by filtering out the removed user
        queryClient.setQueryData(['userSuggestions'], (oldData: User[] = []) => 
          oldData.filter(user => user.id !== userId)
        );
      } catch (error) {
        console.error("Error removing user suggestion:", error);
      }
    }
  };

  return (
    <div className="w-full md:w-60 lg:w-96">
      {/* Advertisement Card */}
      <div className="bg-white rounded-lg shadow p-4">
        <h3 className="font-medium mb-4 text-sm">Advertisements</h3>
        <div className="flex items-center">
          <img
            src="https://placehold.co/100x100"
            alt="Ads"
            className="w-full aspect-auto"
          />
        </div>
      </div>

      {/* Suggestions Card */}
      <div className="bg-white rounded-lg shadow p-4 sticky top-4 mt-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-sm">Who to follow</h3>
          <button 
            onClick={onRefresh}
            className="text-xs text-blue-500 hover:text-blue-700"
          >
            Refresh
          </button>
        </div>
        
        {isLoading ? (
          // Display skeleton loading state for suggestions
          Array(3).fill(null).map((_, i) => (
            <SkeletonUser key={`skeleton-user-${i}`} />
          ))
        ) : error ? (
          <div className="text-center py-4">
            <p className="text-red-500 mb-3">Error loading suggestions.</p>
            <button 
              onClick={onRefresh} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm"
            >
              Try Again
            </button>
          </div>
        ) : filteredSuggestions && filteredSuggestions.length > 0 ? (
          filteredSuggestions.slice(0, 5).map((user: User) => (
            <UserCard
              key={user.id || `user-${user.username}`}
              user={user}
              className="mb-3"
              onCardRemove={() => {
                if (user.id) {
                  handleUserRemove(user.id);
                }
              }}
            />
          ))
        ) : (
          <div className="text-center py-4">
            <p className="text-gray-500">
              No suggestions available
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default SuggestionsSidebar;