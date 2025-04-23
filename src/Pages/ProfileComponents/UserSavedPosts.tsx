import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PostService } from '../../Services/PostService';
import PostCard from '../PostComponents/PostCard';
import { Loader, Bookmark } from 'lucide-react';
import { db } from '../../Services/Firebase';
import { doc, getDoc } from 'firebase/firestore';
import { useState, useEffect } from 'react';

// Define post interface
interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: any;
  likeCount?: number;
  commentCount?: number;
  repostCount?: number;
  saveCount?: number;
  savedAt?: any;
}

interface UserSavedPostsProps {
  userId: string;
}

const UserSavedPosts: React.FC<UserSavedPostsProps> = ({ userId }) => {
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  
  // Use React Query to fetch user's saved posts
  const {
    data: savedPostRefs,
    isLoading: savedPostsLoading,
    error: savedPostsError,
    refetch
  } = useQuery({
    queryKey: ['user-saved-posts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const userSavedPosts = await PostService.getUserSavedPosts(userId);
        return userSavedPosts;
      } catch (err) {
        console.error('Error fetching user saved posts:', err);
        throw new Error('Failed to load saved posts');
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!userId
  });

  // State to store the full post data for each saved post
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the actual post data for each saved post
  useEffect(() => {
    const fetchPostsData = async () => {
      if (!savedPostRefs || savedPostRefs.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const postPromises = savedPostRefs.map(async (savedPost: any) => {
          const postRef = doc(db, 'posts', savedPost.postId || savedPost.id);
          const postDoc = await getDoc(postRef);
          
          if (postDoc.exists()) {
            return {
              id: postDoc.id,
              ...postDoc.data(),
              savedAt: savedPost.savedAt
            } as Post;
          }
          return null;
        });

        const postsData = await Promise.all(postPromises);
        const validPosts = postsData.filter(post => post !== null) as Post[];
        
        // Sort by saved date (newest first)
        validPosts.sort((a, b) => {
          const dateA = a.savedAt?.toDate?.() || new Date();
          const dateB = b.savedAt?.toDate?.() || new Date();
          return dateB.getTime() - dateA.getTime();
        });
        
        setPosts(validPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post data for saved posts:', err);
        setLoading(false);
      }
    };

    if (savedPostRefs) {
      fetchPostsData();
    }
  }, [savedPostRefs]);

  const error = savedPostsError ? (savedPostsError as Error).message : null;

  if (savedPostsLoading || loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <Loader className="w-6 h-6 text-blue-500 animate-spin" />
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
        <p className="text-gray-500">No saved posts yet</p>
        {currentUser && currentUser.uid === userId && (
          <p className="text-sm text-gray-400 mt-2">
            Bookmarked posts will appear here when you save content
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div key={post.id} className="relative">
          {/* Saved indicator */}
          <div className="absolute -top-3 left-6 flex items-center text-xs text-gray-500 bg-gray-100 rounded-full py-1 px-2 z-10">
            <Bookmark size={12} className="mr-1" />
            <span>Saved</span>
          </div>
          
          <PostCard
            post={post}
            currentUser={currentUser}
            showFullContent={false}
            maxContentLength={200}
            customAnimation={{ delay: index * 0.1 }}
            onDeletePost={() => refetch()}
          />
        </div>
      ))}
    </div>
  );
};

export default UserSavedPosts;