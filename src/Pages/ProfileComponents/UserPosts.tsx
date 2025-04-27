import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PostService } from '../../Services/PostService';
import PostCard from '../PostComponents/PostCard';
import { Loader } from 'lucide-react';
import { useProfile } from '../../Contexts/ProfileContext';

// Define post interface matching PostCard requirements
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  createdAt: any;
  likes: string[];
  savedBy?: string[];
  reposts?: number;
  comments?: any[];
}

interface UserPostsProps {
  userId: string;
  includeFollowing?: boolean; // Prop to include posts from followed users
}

const UserPosts: React.FC<UserPostsProps> = ({ userId, includeFollowing = false }) => {
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { userProfile } = useProfile();
  
  // Use React Query for better cache management and automatic refreshing
  const {
    data: posts,
    isLoading: loading,
    error: queryError,
    refetch
  } = useQuery<Post[]>({
    queryKey: ['user-posts', userId, includeFollowing, userProfile?.photoURL],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        // Fetch posts based on whether to include followed users or not
        const filter = includeFollowing ? 'following' : 'latest';
        const fetchedPosts = await PostService.fetchPosts(filter, userId);
        
        // If we're not including followed users, only show the user's posts
        let userPosts;
        if (includeFollowing) {
          userPosts = fetchedPosts || [];
        } else {
          userPosts = (fetchedPosts || []).filter((post: any) => 
            post.author && post.author.id === userId
          );
        }
        
        return userPosts as Post[];
      } catch (err) {
        console.error('Error fetching user posts:', err);
        throw new Error('Failed to load posts');
      }
    },
    staleTime: 30 * 1000, // Consider data stale after 30 seconds
    refetchOnWindowFocus: true // Refetch when window regains focus
  });
  
  const error = queryError ? (queryError as Error).message : null;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 text-black animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (!posts || posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <PostCard
          key={post.id}
          post={post}
          currentUser={currentUser}
          showFullContent={false}
          maxContentLength={500}
          customAnimation={{ delay: index * 0.1 }}
          onDeletePost={() => refetch()}
        />
      ))}
    </div>
  );
};

export default UserPosts;