import { useQuery } from '@tanstack/react-query';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { PostService, Repost } from '../../Services/PostService';
import PostCard from '../PostComponents/PostCard';
import { RefreshCcw } from 'lucide-react';
import LoaderSpinner from '../../Components/UI/Loader';
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
  // Properties added for reposts
  repostedBy?: string;
  repostedAt?: any;
}

interface UserRepostsProps {
  userId: string;
}

const UserReposts: React.FC<UserRepostsProps> = ({ userId }) => {
  // Get current user from Redux store
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  
  // Use React Query to fetch user's reposts
  const {
    data: reposts,
    isLoading: repostsLoading,
    error: repostsError,
    refetch
  } = useQuery<Repost[]>({
    queryKey: ['user-reposts', userId],
    queryFn: async () => {
      if (!userId) return [];
      
      try {
        const userReposts = await PostService.getUserReposts(userId);
        return userReposts;
      } catch (err) {
        console.error('Error fetching user reposts:', err);
        throw new Error('Failed to load reposts');
      }
    },
    staleTime: 30 * 1000,
    refetchOnWindowFocus: true,
    enabled: !!userId
  });

  // State to store the full post data for each repost
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch the actual post data for each repost
  useEffect(() => {
    const fetchPostsData = async () => {
      if (!reposts || reposts.length === 0) {
        setLoading(false);
        return;
      }

      try {
        const postPromises = reposts.map(async (repost) => {
          const postRef = doc(db, 'posts', repost.originalPostId);
          const postDoc = await getDoc(postRef);
          
          if (postDoc.exists()) {
            return {
              id: postDoc.id,
              ...postDoc.data(),
              repostedBy: userId,
              repostedAt: repost.repostedAt
            } as Post;
          }
          return null;
        });

        const postsData = await Promise.all(postPromises);
        const validPosts = postsData.filter(post => post !== null) as Post[];
        
        // Sort by repost date (newest first)
        validPosts.sort((a, b) => {
          const dateA = a.repostedAt?.toDate?.() || new Date();
          const dateB = b.repostedAt?.toDate?.() || new Date();
          return dateB.getTime() - dateA.getTime();
        });
        
        setPosts(validPosts);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching post data for reposts:', err);
        setLoading(false);
      }
    };

    if (reposts) {
      fetchPostsData();
    }
  }, [reposts, userId]);

  const error = repostsError ? (repostsError as Error).message : null;

  if (repostsLoading || loading) {
    return (
      <div className="flex justify-center items-center py-8">
        <LoaderSpinner />
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
        <p className="text-gray-500">No reposts yet</p>
        {currentUser && currentUser.uid === userId && (
          <p className="text-sm text-gray-400 mt-2">
            Reposts will appear here when you repost content
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {posts.map((post, index) => (
        <div key={post.id} className="relative">
          {/* Repost indicator */}
          <div className="absolute -top-3 left-6 flex items-center text-xs text-gray-500 bg-gray-100 rounded-full py-1 px-2 z-10">
            <RefreshCcw size={12} className="mr-1" />
            <span>Reposted</span>
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

export default UserReposts;