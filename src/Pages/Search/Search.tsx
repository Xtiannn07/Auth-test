// src/Pages/Search/Search.tsx
import { useEffect, useState, useCallback } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../Contexts/AuthContexts';
import SearchHeader from './SearchHeader';
import UsersCard from './../SearchComponents/UserCard';
import { SkeletonUser } from '../../Components/UI/Skeleton';
import { fetchUsers, searchUsers, getHiddenSuggestions, User } from './../../Services/SearchPageService';

const SearchPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [displayedUsers, setDisplayedUsers] = useState<User[]>([]);
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

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
    queryFn: () => fetchUsers(10),
    staleTime: 2 * 60 * 1000, // 2 minutes
    enabled: !!currentUser,
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

  // Filter out hidden users
  useEffect(() => {
    const filterUsers = (users: User[] | undefined) => {
      if (!users) return [];
      if (!hiddenUserIds || hiddenUserIds.length === 0) return users;
      
      return users.filter(user => !hiddenUserIds.includes(user.id));
    };
    
    if (searchTerm.length > 0 && searchResults) {
      setDisplayedUsers(filterUsers(searchResults));
    } else if (suggestedUsers) {
      setDisplayedUsers(filterUsers(suggestedUsers));
    }
  }, [searchTerm, searchResults, suggestedUsers, hiddenUserIds]);

  // Page visibility change handler
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        if (searchTerm.length > 0) {
          refetchSearch();
        } else {
          refetchSuggested();
        }
        // Clear search when page becomes visible again
        setSearchTerm('');
      }
    };
    
    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [refetchSearch, refetchSuggested, searchTerm.length]);

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
                key={user.id} 
                user={user} 
                onCardRemove={() => handleRemoveUser(user.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchPage;