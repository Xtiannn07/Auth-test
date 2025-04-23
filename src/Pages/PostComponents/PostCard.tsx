// src/Pages/PostComponents/PostCard.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bookmark, MoreVertical, Send, X, Trash2 } from 'lucide-react';
import { usePostActions } from './usePostActions';
import { formatDate } from '../../utils/dateUtils';
import { PostLike, Comment } from '../../Services/PostService';

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
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    saveCount?: number;
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
  // UI state
  const [showDeleteMenu, setShowDeleteMenu] = useState(false);
  const [showLikes, setShowLikes] = useState(false);
  const [showReposts, setShowReposts] = useState(false);
  const [showComments, setShowComments] = useState(false);
  const [showAllLikes, setShowAllLikes] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const likesRef = useRef<HTMLDivElement>(null);
  const repostsRef = useRef<HTMLDivElement>(null);
  const commentsRef = useRef<HTMLDivElement>(null);
  
  // Get post actions from hook
  const {
    isLiking,
    isSaving,
    isReposting,
    isDeleting,
    isAddingComment,
    error,
    isLiked,
    isSaved,
    isReposted,
    isOwnPost,
    handleLikeToggle,
    handleSaveToggle,
    handleRepost,
    handleAddComment,
    handleDeleteComment,
    handleDeletePost,
    likes,
    comments,
    commentText,
    setCommentText,
    likeCount,
    commentCount,
    repostCount
  } = usePostActions({ 
    post, 
    currentUser, 
    onLikeUpdate: onLike, 
    onDeletePost 
  });
  
  // Close popups when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      // Close delete menu if clicked outside
      if (showDeleteMenu && menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowDeleteMenu(false);
      }
      
      // Close likes popup if clicked outside
      if (showLikes && likesRef.current && !likesRef.current.contains(e.target as Node)) {
        setShowLikes(false);
      }
      
      // Close reposts popup if clicked outside
      if (showReposts && repostsRef.current && !repostsRef.current.contains(e.target as Node)) {
        setShowReposts(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDeleteMenu, showLikes, showReposts]);
  
  const toggleDeleteMenu = () => setShowDeleteMenu(prev => !prev);
  const toggleComments = () => setShowComments(prev => !prev);
  
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
  
  // Generate color classes for active states - applied to icons instead of buttons
  const likeColorClass = isLiked 
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-pink-500' 
    : 'text-gray-600';
    
  const repostColorClass = isReposted 
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-green-500 to-teal-500' 
    : 'text-gray-600';
    
  const saveColorClass = isSaved 
    ? 'text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-500' 
    : 'text-gray-600';
  
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: customAnimation?.delay || 0 }}
      className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4"
    >
      {/* SVG Gradients for icons */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="likeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#8B5CF6" />
            <stop offset="100%" stopColor="#EC4899" />
          </linearGradient>
          <linearGradient id="repostGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10B981" />
            <stop offset="100%" stopColor="#0D9488" />
          </linearGradient>
          <linearGradient id="saveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#F59E0B" />
            <stop offset="100%" stopColor="#D97706" />
          </linearGradient>
        </defs>
      </svg>

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
                title="Post options"
                aria-label="Post options"
              >
                <MoreVertical size={20} />
              </button>
              
              {showDeleteMenu && (
                <div className="absolute right-0 mt-1 w-36 bg-white rounded-md shadow-lg z-20 border border-gray-200">
                  <button
                    onClick={handleDeletePost}
                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 rounded-md flex items-center"
                  >
                    <Trash2 size={16} className="mr-2" />
                    Delete Post
                  </button>
                </div>
              )}
            </div>
          )}
          <span className="text-sm text-gray-500">{formattedDate}</span>
        </div>
      </div>
      
      {/* Post Content */}
      <p className="mb-4 text-gray-700 whitespace-pre-wrap">{displayContent}</p>
      
      {/* Post Footer */}
      <div className="flex justify-between items-center text-sm text-gray-600 border-t pt-3">
        <div className="flex items-center space-x-1">
          <span>Posted by </span>
          <span className="font-medium">{post.author.name}</span>
        </div>
        
        <div className="flex items-center space-x-6">
          {/* Like Button with Popup */}
          <div className="relative">
            <button 
              onClick={handleLikeToggle}
              onMouseEnter={() => likes.length > 0 && setShowLikes(true)}
              onMouseLeave={() => !showAllLikes && setShowLikes(false)}
              disabled={isLiking || !currentUser}
              className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              aria-label={isLiked ? "Unlike post" : "Like post"}
              title={isLiked ? "Unlike post" : "Like post"}
            >
              <Heart 
                size={20}
                className={likeColorClass}
                fill={isLiked ? "url(#likeGradient)" : "none"}
              />
              <span>{likeCount}</span>
            </button>
            
            {/* Likes Popup */}
            <AnimatePresence>
              {showLikes && likes.length > 0 && (
                <motion.div 
                  ref={likesRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 border border-gray-200 p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Liked by</h4>
                    <button 
                      onClick={() => {
                        setShowLikes(false);
                        setShowAllLikes(false);
                      }}
                      className="text-gray-500 hover:text-gray-700"
                      title="Close likes popup"
                      aria-label="Close likes popup"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <div className="max-h-60 overflow-y-auto">
                    {likes.slice(0, showAllLikes ? likes.length : 5).map((like) => (
                      <div key={like.userId} className="py-2 border-b border-gray-100 last:border-0">
                        <span className="font-medium">{like.displayName}</span>
                      </div>
                    ))}
                  </div>
                  
                  {likes.length > 5 && !showAllLikes && (
                    <button 
                      onClick={() => setShowAllLikes(true)}
                      className="w-full mt-2 text-blue-600 hover:text-blue-800 text-sm font-medium"
                    >
                      See all {likes.length} likes
                    </button>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Comment Button */}
          <button
            onClick={toggleComments}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors"
            aria-label="Comment on post"
            title="Comment on post"
          >
            <MessageCircle size={20} />
            <span>{commentCount}</span>
          </button>
          
          {/* Repost Button with Popup */}
          <div className="relative">
            <button
              onClick={handleRepost}
              onMouseEnter={() => repostCount > 0 && setShowReposts(true)}
              onMouseLeave={() => setShowReposts(false)}
              disabled={isReposting || !currentUser}
              className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
              aria-label={isReposted ? "Undo repost" : "Repost"}
              title={isReposted ? "Undo repost" : "Repost"}
            >
              <Repeat size={20} className={repostColorClass} />
              <span>{repostCount}</span>
            </button>
            
            {/* Reposts Popup - Could implement once we have a way to get reposters */}
            <AnimatePresence>
              {showReposts && repostCount > 0 && (
                <motion.div 
                  ref={repostsRef}
                  initial={{ opacity: 0, y: 10, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 10, scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                  className="absolute left-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 border border-gray-200 p-3"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium">Reposted by</h4>
                    <button 
                      onClick={() => setShowReposts(false)}
                      className="text-gray-500 hover:text-gray-700"
                      title="Close reposts popup"
                      aria-label="Close reposts popup"
                    >
                      <X size={16} />
                    </button>
                  </div>
                  
                  <p className="text-gray-600 text-sm py-2">
                    {isReposted ? 'You and others have' : 'Others have'} reposted this post.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          
          {/* Save Button */}
          <button
            onClick={handleSaveToggle}
            disabled={isSaving || !currentUser}
            className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-all duration-300 disabled:opacity-50"
            aria-label={isSaved ? "Unsave post" : "Save post"}
            title={isSaved ? "Unsave post" : "Save post"}
          >
            <Bookmark 
              size={20}
              className={saveColorClass}
              fill={isSaved ? "url(#saveGradient)" : "none"}
            />
          </button>
        </div>
      </div>
      
      {/* Comments Section */}
      <AnimatePresence>
        {showComments && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="mt-4 pt-4 border-t border-gray-200"
            ref={commentsRef}
          >
            <h4 className="font-medium mb-4">Comments</h4>
            
            {/* Comment List */}
            <div className="space-y-4 mb-4 max-h-80 overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-gray-500 text-sm">No comments yet. Be the first to comment!</p>
              ) : (
                comments.map((comment) => (
                  <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium text-sm">{comment.author.displayName}</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-xs text-gray-500">
                          {formatDate(comment.createdAt)}
                        </span>
                        
                        {(isOwnPost || (currentUser && comment.author.uid === currentUser.uid)) && (
                          <button
                            onClick={() => handleDeleteComment(comment.id as string)}
                            className="text-red-500 hover:text-red-700"
                            aria-label="Delete comment"
                            title="Delete comment"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                    <p className="text-gray-700 text-sm mt-1">{comment.text}</p>
                  </div>
                ))
              )}
            </div>
            
            {/* Comment Form */}
            {currentUser && (
              <div className="flex">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  className="flex-grow p-2 border border-gray-300 rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <button
                  onClick={handleAddComment}
                  disabled={isAddingComment || !commentText.trim()}
                  className="bg-blue-500 text-white px-4 py-2 rounded-r-lg hover:bg-blue-600 disabled:bg-blue-300 transition-colors flex items-center"
                  title="Post comment"
                  aria-label="Post comment"
                >
                  {isAddingComment ? (
                    <span className="animate-pulse">...</span>
                  ) : (
                    <Send size={16} />
                  )}
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// Define default props
PostCard.defaultProps = {
  showFullContent: false, 
  maxContentLength: 200,
  customAnimation: {}
};