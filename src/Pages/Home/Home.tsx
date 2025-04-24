import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import PostCard from '../../Pages/PostComponents/PostCard';
import UserSuggestion from '../UsersComponents/UserSuggestion';
import { SkeletonCard, SkeletonUser } from '../../Components/UI/Skeleton';
import { PostService } from '../../Services/PostService';
import UserService from '../../Services/UserService';

const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState<'latest' | 'popular' | 'following'>('latest');
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const queryClient = useQueryClient();

  const {
    data: posts,
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
    data: suggestions,
    isLoading: suggestionsLoading,
  } = useQuery({
    queryKey: ['userSuggestions'],
    queryFn: () => currentUser ? UserService.getUserSuggestions(currentUser.uid) : [], 
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser,
  });

  const handleFilterChange = (filter: 'latest' | 'popular' | 'following') => {
    setActiveFilter(filter);
  };

  // handleLike is removed as usePostActions now handles likes directly

  const handleFollow = async (userId: string) => {
    if (!currentUser) return;
    
    try {
      await UserService.followUser(currentUser.uid, userId);
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      {/* Filter buttons */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange('latest')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'latest' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleFilterChange('popular')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'popular' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'following' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-grow">
          {postsLoading ? (
            Array(3).fill(null).map((_, i) => (
              <SkeletonCard key={i} />
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
                key={post.id} 
                // Use type assertion to convince TypeScript that the post has the required properties
                post={post as any}
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
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Discover Posts
                </button>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="w-full md:w-60 lg:w-96">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-medium mb-4 text-lg">Who to follow</h3>
            
            {suggestionsLoading ? (
              Array(3).fill(null).map((_, i) => (
                <SkeletonUser key={i} />
              ))
            ) : suggestions && suggestions.length > 0 ? (
              suggestions.map(user => (
                <UserSuggestion 
                  key={user.id} 
                  user={user} 
                  onFollow={() => user.id && handleFollow(user.id)}
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No suggestions available
              </p>
            )}
            
            {suggestions && suggestions.length > 0 && (
              <div className="mt-4 text-center">
                <button className="text-blue-500 hover:text-blue-700">
                  See More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;