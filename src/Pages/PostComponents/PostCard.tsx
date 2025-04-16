// src/Pages/PostComponents/PostCard.tsx
import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bookmark, MoreVertical } from 'lucide-react';
import { usePostActions } from './usePostActions';
import { formatDate } from '../../utils/dateUtils';

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
    savedBy?: string[];
    reposts?: number;
    comments?: any[];
  };
  onLike?: () => void;
  onDeletePost?: (postId: string) => void;
  showFullContent?: boolean;
  maxContentLength?: number;
  currentUser?: any;
  customAnimation?: {
    delay?: number;
  };
}

export default function PostCard({
  post,
  onLike,
  onDeletePost,
  showFullContent = false,
  maxContentLength = 200,
  currentUser,
  customAnimation
}: PostCardProps) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  
  const {
    isLiking,
    isSaving,
    isReposting,
    isDeleting,
    error,
    isLiked,
    isSaved,
    isOwnPost,
    handleLikeToggle,
    handleSaveToggle,
    handleRepost,
    handleDeletePost
  } = usePostActions({ 
    post, 
    currentUser, 
    onLike, 
    onDeletePost 
  });
  
  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeleteMenu(false);
      }
    };
    
    if (showDeleteMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteMenu]);
  
  const toggleDeleteMenu = () => setShowDeleteMenu(prev => !prev);
  
  const formattedDate = formatDate(post.createdAt);
  
  const displayContent = showFullContent ? 
    post.content : 
    post.content.length > maxContentLength ? 
      `${post.content.substring(0, maxContentLength)}...` : 
      post.content;
  
  // If post is being deleted, show deletion animation
  if (isDeleting) {
    return (
      <motion.div
        initial={{ opacity: 1, height: 'auto' }}
        animate={{ opacity: 0, height: 0 }}
        exit={{ opacity: 0, height: 0 }}
        transition={{ duration: 0.5 }}
        className="overflow-hidden mb-4"
      >
        <div className="bg-white rounded-lg shadow p-4 border border-gray-200">
          <p className="text-center text-gray-500">Deleting post...</p>
        </div>
      </motion.div>
    );
  }
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: customAnimation?.delay || 0 }}
      className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {/* Post Header */}
      <div className="flex justify-between items-center mb-3">
        <h3 className="text-xl font-semibold">{post.title}</h3>
        
        <div className="flex items-center space-x-2">
          {isOwnPost && (
            <div className="relative" ref={menuRef}>
              <button 
                onClick={toggleDeleteMenu}
                className="text-gray-500 hover:text-gray-700 transition-colors"
              >
                <MoreVertical size={20} />
              </button>
              
              {showDeleteMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                  <button
                    onClick={handleDeletePost}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md"
                  >
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>
      
      <p className="mb-4 text-gray-700 whitespace-pre-wrap">{displayContent}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
        <div className="flex items-center space-x-1">
          <span>Posted by </span>
          <span className="font-medium">{post.author.name}</span>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Like Button */}
          <button 
            onClick={handleLikeToggle}
            disabled={isLiking || !currentUser}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              isLiked ? 'text-blue-600' : 'hover:bg-gray-100'
            } transition-colors disabled:opacity-50`}
            aria-label={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart 
              size={20}
              fill={isLiked ? "currentColor" : "none"}
            />
            <span>{post.likes.length}</span>
          </button>
          
          {/* Comment Button */}
          <button
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Comment on post"
          >
            <MessageCircle size={20} />
            <span>{post.comments?.length || 0}</span>
          </button>
          
          {/* Repost Button */}
          <button
            onClick={handleRepost}
            disabled={isReposting || !currentUser}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
            aria-label="Repost"
          >
            <Repeat size={20} />
            <span>{post.reposts || 0}</span>
          </button>
          
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={isSaving || !currentUser}
            className={`flex items-center space-x-1 px-2 py-1 rounded ${
              isSaved ? 'text-yellow-600' : 'hover:bg-gray-100'
            } transition-colors disabled:opacity-50`}
            aria-label={isSaved ? "Unsave post" : "Save post"}
          >
            <Bookmark 
              size={20}
              fill={isSaved ? "currentColor" : "none"}
            />
          </button>
        </div>
      </div>
    </motion.div>
  );
}

// Define default props
PostCard.defaultProps = {
  showFullContent: false, 
  maxContentLength: 200,
  customAnimation: {}
};