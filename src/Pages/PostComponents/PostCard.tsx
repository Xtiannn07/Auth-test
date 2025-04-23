// src/Pages/PostComponents/PostCard.tsx
import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, MessageCircle, Repeat, Bookmark, MoreVertical, Send, X, Trash2 } from 'lucide-react';
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
      photoURL?: string;
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
    commentCount,
    repostCount
  } = usePostActions({ 
    post, 
    currentUser, 
    onLikeUpdate: onLike, 
    onDeletePost 
  });

  // Add state for local counts
  const [localLikeCount, setLocalLikeCount] = useState(post.likeCount || 0);
  const [localRepostCount, setLocalRepostCount] = useState(post.repostCount || 0);

  // Update local counts when props change
  useEffect(() => {
    setLocalLikeCount(post.likeCount || 0);
    setLocalRepostCount(post.repostCount || 0);
  }, [post.likeCount, post.repostCount]);

  // Update the button styles - make them more robust
  const buttonBaseClasses = "flex items-center space-x-1 px-2 py-1 rounded transition-all duration-300 disabled:opacity-50";
  const likeButtonClasses = `${buttonBaseClasses} ${isLiked ? 'text-[#FF3040]' : 'text-gray-600 hover:bg-gray-100'}`;
  const repostButtonClasses = `${buttonBaseClasses} ${isReposted ? 'text-[#00C853]' : 'text-gray-600 hover:bg-gray-100'}`;
  const saveButtonClasses = `${buttonBaseClasses} ${isSaved ? 'text-[#FFD700]' : 'text-gray-600 hover:bg-gray-100'}`;

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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: customAnimation?.delay || 0 }}
      className="bg-white rounded-lg shadow p-4 border border-gray-200 mb-4"
    >
      {/* SVG Gradients for icons - update color stops */}
      <svg width="0" height="0" className="hidden">
        <defs>
          <linearGradient id="likeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FF3040" />
            <stop offset="100%" stopColor="#FF79A3" />
          </linearGradient>
          <linearGradient id="repostGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#00C853" />
            <stop offset="100%" stopColor="#69F0AE" />
          </linearGradient>
          <linearGradient id="saveGradient" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#FFD700" />
            <stop offset="100%" stopColor="#FFA000" />
          </linearGradient>
        </defs>
      </svg>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2 rounded mb-4 text-sm">
          {error}
        </div>
      )}
      
      {/* Post Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-start flex-1">
          {/* Author Image and Info */}
          <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 flex items-center justify-center overflow-hidden">
            {post.author.photoURL ? (
              <img 
                src={post.author.photoURL} 
                alt={post.author.name} 
                className="w-full h-full object-cover"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  target.src = '/user.svg';
                }}
              />
            ) : (
              <span className="text-gray-600 font-medium text-lg">
                {post.author.name.charAt(0).toUpperCase() || 'U'}
              </span>
            )}
          </div>
          <div className="ml-3 flex-1">
            <h3 className="text-xl font-semibold">{post.title}</h3>
            <div className="flex items-center text-sm text-gray-600">
              <span className="font-medium">{post.author.name}</span>
              <span className="mx-2">•</span>
              <span>{formattedDate}</span>
            </div>
          </div>
        </div>
        
        {/* More Options Menu */}
        {isOwnPost && (
          <div className="relative ml-4" ref={menuRef}>
            <button 
              onClick={toggleDeleteMenu}
              className="p-1 text-gray-500 hover:text-gray-700 transition-colors rounded-full hover:bg-gray-100"
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
      </div>
      
      {/* Post Content */}
      <p className="mb-4 text-gray-700 whitespace-pre-wrap">{displayContent}</p>
      
      {/* Action Buttons */}
      <div className="flex justify-end items-center space-x-6 border-t pt-3">
        {/* Like Button with Popup */}
        <div className="relative">
          <button 
            onClick={async () => {
              const prevCount = localLikeCount;
              setLocalLikeCount(prev => isLiked ? prev - 1 : prev + 1);
              try {
                await handleLikeToggle();
              } catch (err) {
                setLocalLikeCount(prevCount); // Revert on error
              }
            }}
            onMouseEnter={() => likes.length > 0 && setShowLikes(true)}
            onMouseLeave={() => !showAllLikes && setShowLikes(false)}
            disabled={isLiking || !currentUser}
            className={likeButtonClasses}
            aria-label={isLiked ? "Unlike post" : "Like post"}
            title={isLiked ? "Unlike post" : "Like post"}
          >
            <Heart 
              size={20}
              className={`transition-transform duration-300 ${isLiked ? 'scale-110' : 'scale-100'}`}
              fill={isLiked ? "currentColor" : "none"}
              stroke={isLiked ? "currentColor" : "currentColor"}
            />
            <span className={isLiked ? 'text-[#FF3040]' : ''}>{localLikeCount}</span>
          </button>
          
          <AnimatePresence>
            {showLikes && likes.length > 0 && (
              <motion.div 
                ref={likesRef}
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg z-20 border border-gray-200 p-3"
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
                    <div 
                      key={`${like.userId}_${like.timestamp?.toString()}`} 
                      className="py-2 border-b border-gray-100 last:border-0"
                    >
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
          className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-all duration-300"
          aria-label="Comment on post"
          title="Comment on post"
        >
          <MessageCircle size={20} className="text-gray-600" />
          <span>{commentCount}</span>
        </button>
        
        {/* Repost Button */}
        <button
          onClick={async () => {
            const prevCount = localRepostCount;
            setLocalRepostCount(prev => isReposted ? prev - 1 : prev + 1);
            try {
              await handleRepost();
            } catch (err) {
              setLocalRepostCount(prevCount); // Revert on error
            }
          }}
          disabled={isReposting || !currentUser}
          className={repostButtonClasses}
          aria-label={isReposted ? "Undo repost" : "Repost"}
          title={isReposted ? "Undo repost" : "Repost"}
        >
          <Repeat 
            size={20}
            className={`transition-transform duration-300 ${isReposted ? 'scale-110' : 'scale-100'}`}
            fill={isReposted ? "currentColor" : "none"}
            stroke={isReposted ? "currentColor" : "currentColor"}
          />
          <span className={isReposted ? 'text-[#00C853]' : ''}>{localRepostCount}</span>
        </button>
        
        {/* Save Button */}
        <button
          onClick={handleSaveToggle}
          disabled={isSaving || !currentUser}
          className={saveButtonClasses}
          aria-label={isSaved ? "Unsave post" : "Save post"}
          title={isSaved ? "Unsave post" : "Save post"}
        >
          <Bookmark 
            size={20}
            className={`transition-transform duration-300 ${isSaved ? 'scale-110' : 'scale-100'}`}
            fill={isSaved ? "currentColor" : "none"}
            stroke={isSaved ? "currentColor" : "currentColor"}
          />
        </button>
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