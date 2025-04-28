import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import PostCard from '../../Pages/PostComponents/PostCard';
import SuggestionsSidebar from './../HomeComponents/SuggestionsSidebar';
import { SkeletonCard } from '../../Components/UI/Skeleton';
import { PostService } from '../../Services/PostService';
import UserService from '../../Services/UserService';

const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular' | 'following'>('latest');
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  // Get cached data from localStorage on component mount
  useEffect(() => {
    const cachedSuggestions = localStorage.getItem('userSuggestions');
    if (cachedSuggestions && currentUser) {
      try {
        const parsedData = JSON.parse(cachedSuggestions);
        queryClient.setQueryData(['userSuggestions'], parsedData);
      } catch (error) {
        console.error('Error parsing cached suggestions:', error);
      }
    }
  }, [queryClient, currentUser]);

  const {
    data: posts = [],
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['posts', activeFilter],
    queryFn: () => PostService.fetchPosts(activeFilter, currentUser?.uid),
    staleTime: 2 * 60 * 1000,
    enabled: !!currentUser,
  });

  const {
    data: suggestions = [],
    isLoading: suggestionsLoading,
    error: suggestionsError,
    refetch: refetchSuggestions
  } = useQuery({
    queryKey: ['userSuggestions'],
    queryFn: async () => {
      if (!currentUser) return [];
      
      const users = await UserService.getUserSuggestions(currentUser.uid);
      
      // Cache the results in localStorage
      if (users && users.length > 0) {
        localStorage.setItem('userSuggestions', JSON.stringify(users));
      }
      
      return users;
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser,
  });

  const handleFilterChange = (filter: 'latest' | 'popular' | 'following') => {
    setActiveFilter(filter);
  };

  // Function to manually refresh suggestions
  const refreshSuggestions = () => {
    if (queryClient) {
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Filter buttons */}
      <div className="bg-white rounded-lg shadow p-3 mb-4">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange('latest')}
            className={`px-4 py-2 rounded-xl ${
              activeFilter === 'latest' 
                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleFilterChange('popular')}
            className={`px-4 py-2 rounded-xl ${
              activeFilter === 'popular' 
                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            className={`px-4 py-2 rounded-xl ${
              activeFilter === 'following' 
                ? 'bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      {/* Main content layout with proper structure for sticky sidebar */}
      <div className="flex flex-col md:flex-row gap-4">
        {/* Main content area - posts */}
        <div className="flex-grow md:max-w-[calc(100%-16rem)] lg:max-w-[calc(100%-26rem)]">
          {postsLoading ? (
            Array(3).fill(null).map((_, i) => (
              <SkeletonCard key={`skeleton-post-${i}`} />
            ))
          ) : postsError ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-red-500 mb-3">Error loading posts.</p>
              <button 
                onClick={() => refetchPosts()} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map((post, index) => (
              <PostCard 
                key={post.id || `post-${index}`} 
                post={post}
                currentUser={currentUser}
                customAnimation={{ delay: index * 0.1 }}
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === 'following' 
                  ? "Follow people to see their posts here" 
                  : "There are no posts at the moment"}
              </p>
              {activeFilter === 'following' && (
                <button 
                  onClick={() => handleFilterChange('latest')}
                  className="px-4 py-2 bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white rounded-lg hover:bg-blue-600"
                >
                  Discover Posts
                </button>
              )}
            </div>
          )}
        </div>

        {/* Sidebar container with fixed width */}
        <div className="w-full md:w-64 lg:w-96 sticky top-4">
          <SuggestionsSidebar 
            suggestions={suggestions}
            isLoading={suggestionsLoading}
            error={suggestionsError}
            onRefresh={refreshSuggestions}
          />
        </div>
      </div>
    </div>
  );
};

export default HomePage;