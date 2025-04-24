import { useEffect, useState, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import SearchHeader from './SearchHeader';
import UsersCard from '../UsersComponents/UserCard';
import { SkeletonUser } from '../../Components/UI/Skeleton';
import { searchUsers, getHiddenSuggestions, User } from '../SearchComponents/SearchApi';
import UserService from '../../Services/UserService';

const SearchPage = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  // Get hidden suggestions first to filter them out
  const { data: hiddenUserIds } = useQuery({
    queryKey: ['users', 'hidden'],
    queryFn: () => currentUser ? getHiddenSuggestions(currentUser.uid) : [],
    staleTime: 5 * 60 * 1000, // 5 minutes
    enabled: !!currentUser,
  });

  // Query for suggested users when search is empty
  const {
    data: suggestedUsers,
    isLoading: suggestedLoading,
    error: suggestedError,
    refetch: refetchSuggested
  } = useQuery({
    queryKey: ['users', 'suggested'],
    queryFn: async () => {
      if (!currentUser) return [];
      // Use getUserSuggestions to get users not being followed
      return UserService.getUserSuggestions(currentUser.uid);
    },
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!currentUser && !searchTerm,
  });

  // Query for search results
  const {
    data: searchResults,
    isLoading: searchLoading,
    error: searchError,
    refetch: refetchSearch
  } = useQuery({
    queryKey: ['users', 'search', searchTerm],
    queryFn: () => searchUsers(searchTerm),
    staleTime: 30 * 1000, // 30 seconds
    enabled: !!currentUser && searchTerm.length > 0,
  });

  // Filter out hidden users and current user
  useEffect(() => {
    const filterUsers = async (users: User[] | undefined) => {
      if (!users) return [];
      if (!currentUser) return users;

      return users.filter(user => {
        // Filter out current user
        if (user.uid === currentUser.uid) return false;
        
        // Filter out hidden users
        if (hiddenUserIds && user.uid && hiddenUserIds.includes(user.uid)) return false;
        
        return true;
      });
    };
    
    const updateDisplayedUsers = async () => {
      if (searchTerm.length > 0 && searchResults) {
        // For search results, show all users including followed ones
        setDisplayedUsers(await filterUsers(searchResults));
      } else if (suggestedUsers) {
        // For suggestions, we're already getting filtered users from getUserSuggestions
        setDisplayedUsers(await filterUsers(suggestedUsers));
      }
    };

    updateDisplayedUsers();
  }, [searchTerm, searchResults, suggestedUsers, hiddenUserIds, currentUser]);

  // Page visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Clear search and refresh data when page becomes visible again
        setSearchTerm('');
        refetchSuggested();
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchSuggested]);

  // Handle removing a user card
  const handleRemoveUser = useCallback((userId: string) => {
    setDisplayedUsers(prev => prev.filter(user => user.id !== userId));
  }, []);

  // Loading state
  const isLoading = (searchTerm.length > 0 && searchLoading) || 
                   (searchTerm.length === 0 && suggestedLoading);

  // Error state
  const hasError = (searchTerm.length > 0 && searchError) || 
                  (searchTerm.length === 0 && suggestedError);

  return (
    <div className="max-w-2xl mx-auto pb-6">
      <SearchHeader 
        searchTerm={searchTerm} 
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
      />
      
      <div className="px-4 mt-4">
        {/* Title section */}
        <h2 className="text-xl font-medium mb-4">
          {searchTerm ? 'Search Results' : 'Suggested Users'}
        </h2>
        
        {/* Loading state */}
        {isLoading && (
          <div>
            {Array(3).fill(null).map((_, i) => (
              <SkeletonUser key={i} />
            ))}
          </div>
        )}
        
        {/* Error state */}
        {hasError && (
          <div className="bg-white rounded-lg shadow p-6 text-center">
            <p className="text-red-500 mb-3">Error loading users.</p>
            <button 
              onClick={() => searchTerm ? refetchSearch() : refetchSuggested()} 
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
            >
              Try Again
            </button>
          </div>
        )}
        
        {/* No results state */}
        {!isLoading && !hasError && displayedUsers?.length === 0 && (
          <div className="bg-white rounded-lg shadow p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No users found</h3>
            <p className="text-gray-500">
              {searchTerm 
                ? `No users matching "${searchTerm}"` 
                : "No suggested users available"}
            </p>
          </div>
        )}
        
        {/* Results */}
        {!isLoading && !hasError && displayedUsers?.length > 0 && (
          <div className="space-y-3">
            {displayedUsers.map(user => (
              <UsersCard 
                key={user.uid} 
                user={user} 
                onCardRemove={() => user.uid && handleRemoveUser(user.uid)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;