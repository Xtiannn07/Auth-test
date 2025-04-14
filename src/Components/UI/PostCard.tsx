import { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { formatDistanceToNow } from 'date-fns';

interface PostCardProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    createdAt: any;
    likes: string[];
  };
  onLikeUpdate?: () => void;
  showFullContent?: boolean;
  maxContentLength?: number;
}

export default function PostCard({
  post,
  onLikeUpdate,
  showFullContent = false,
  maxContentLength = 200
}: PostCardProps) {
  const { currentUser } = useAuth();
  const [isLiking, setIsLiking] = useState(false);
  const [error, setError] = useState('');
  
  const isLiked = currentUser && post.likes.includes(currentUser.uid);
  const likeCount = post.likes.length;
  
  const formattedDate = post.createdAt ? 
    formatDistanceToNow(new Date(post.createdAt.toDate()), { addSuffix: true }) : 
    'Just now';
  
  const displayContent = showFullContent ? 
    post.content : 
    post.content.length > maxContentLength ? 
      `${post.content.substring(0, maxContentLength)}...` : 
      post.content;
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    setIsLiking(true);
    setError('');
    
    try {
      const postRef = doc(db, 'posts', post.id);
      
      if (isLiked) {
        // Unlike the post
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        // Like the post
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
      }
      
      if (onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (err) {
      console.error('Error updating like:', err);
      setError('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold">{post.title}</h3>
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
      
      <p className="mb-4 text-gray-700 whitespace-pre-wrap">{displayContent}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-600">
        <div className="flex items-center space-x-1">
          <span>Posted by </span>
          <span className="font-medium">{post.author.name}</span>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleLikeToggle}
            disabled={isLiking || !currentUser}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              isLiked ? 'text-blue-600' : 'hover:bg-gray-100'
            } transition-colors disabled:opacity-50`}
          >
            <svg 
              xmlns="http://www.w3.org/2000/svg" 
              className="h-5 w-5" 
              fill={isLiked ? "currentColor" : "none"}
              viewBox="0 0 24 24" 
              stroke="currentColor"
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={1.5} 
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" 
              />
            </svg>
            <span>{likeCount}</span>
          </button>
        </div>
      </div>
    </div>
  );
}

// Define default props
PostCard.defaultProps = {
  showFullContent: false, 
  maxContentLength: 200
};