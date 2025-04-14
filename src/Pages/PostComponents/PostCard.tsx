// src/components/PostComponents/PostCard.tsx
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { PostHeader } from './PostHeader';
import { ActionButtons } from './ActionButtons';
import { usePostActions } from './usePostActions';

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
  onLikeUpdate?: () => void;
  onDeletePost?: (postId: string) => void;
  showFullContent?: boolean;
  maxContentLength?: number;
  currentUser?: any;
}

export default function PostCard({
  post,
  onLikeUpdate,
  onDeletePost,
  showFullContent = false,
  maxContentLength = 200,
  currentUser
}: PostCardProps) {
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  
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
    onLikeUpdate, 
    onDeletePost 
  });
  
  const toggleDeleteMenu = () => setShowDeleteMenu(prev => !prev);
  
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
        className="overflow-hidden"
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
      transition={{ duration: 0.3 }}
      className="bg-white rounded-lg shadow p-4 border border-gray-200"
    >
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      <PostHeader 
        post={post} 
        isOwnPost={isOwnPost} 
        showDeleteMenu={showDeleteMenu} 
        toggleDeleteMenu={toggleDeleteMenu} 
        onDeletePost={handleDeletePost} 
      />
      
      <p className="mb-4 text-gray-700 whitespace-pre-wrap">{displayContent}</p>
      
      <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
        <div className="flex items-center space-x-1">
          <span>Posted by </span>
          <span className="font-medium">{post.author.name}</span>
        </div>
        
        <ActionButtons 
          currentUser={currentUser}
          post={post}
          isLiked={isLiked}
          isSaved={isSaved}
          onLikeToggle={handleLikeToggle}
          onRepost={handleRepost}
          onSaveToggle={handleSaveToggle}
          isLiking={isLiking}
          isReposting={isReposting}
          isSaving={isSaving}
        />
      </div>
    </motion.div>
  );
}

// Define default props
PostCard.defaultProps = {
  showFullContent: false, 
  maxContentLength: 200
};
