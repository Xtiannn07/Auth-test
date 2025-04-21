import { useState, useEffect } from 'react';
import { PostService } from '../../../Services/PostService';
import { Loader } from 'lucide-react';

interface Post {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  likes: number;
  userId: string;
  username: string;
  userPhotoURL?: string;
  imageURL?: string;
}

interface UserPostsProps {
  userId: string;
}

const UserPosts: React.FC<UserPostsProps> = ({ userId }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserPosts = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        
        // Custom query to get only this user's posts
        const fetchedPosts = await PostService.fetchPosts('latest', userId);
        const userPosts = fetchedPosts.filter((post: any) => post.userId === userId);
        
        setPosts(userPosts as Post[]);
      } catch (err) {
        console.error('Error fetching user posts:', err);
        setError('Failed to load posts');
      } finally {
        setLoading(false);
      }
    };

    fetchUserPosts();
  }, [userId]);

  if (loading) {
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

  if (posts.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-500">No posts yet</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-3 gap-1">
      {posts.map((post) => (
        <div 
          key={post.id} 
          className="aspect-square bg-gray-100 overflow-hidden relative"
        >
          {post.imageURL ? (
            <img 
              src={post.imageURL} 
              alt={post.title || 'Post image'} 
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="flex items-center justify-center h-full bg-gray-200">
              <p className="text-gray-500 p-4 text-sm line-clamp-4">{post.content}</p>
            </div>
          )}
          <div className="absolute bottom-2 left-2 flex items-center text-white text-xs">
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-4 w-4 mr-1" 
              fill="white" 
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            {post.likes || 0}
          </div>
        </div>
      ))}
    </div>
  );
};

export default UserPosts;