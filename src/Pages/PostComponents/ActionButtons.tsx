// src/Pages/PostComponents/ActionButtons.tsx
import {MessageSquare, Bookmark, Repeat2, Heart} from 'lucide-react';

interface ActionButtonsProps {
  currentUser: any;
  post: {
    id: string;
    likes: string[];
    comments?: { length: number } | number[];
    reposts?: number;
    savedBy?: string[];
  };
  isLiked: boolean;
  isSaved: boolean;
  onLikeToggle: () => Promise<void>;
  onRepost: () => Promise<void>;
  onSaveToggle: () => Promise<void>;
  onComment: () => void;
  isLiking: boolean;
  isReposting: boolean;
  isSaving: boolean;
}

export function ActionButtons({ 
  currentUser, 
  post, 
  isLiked, 
  isSaved, 
  onLikeToggle, 
  onRepost, 
  onSaveToggle,
  onComment,
  isLiking,
  isReposting,
  isSaving
}: ActionButtonsProps) {
  return (
    <div className="flex items-center justify-between sm:justify-start sm:space-x-6">
      {/* Like Button */}
      <button 
        onClick={onLikeToggle}
        disabled={isLiking || !currentUser}
        className={`group flex items-center space-x-1 p-2 sm:px-3 sm:py-2 rounded-full
          ${isLiked ? 'text-blue-600' : 'hover:bg-gray-100'}
          transition-all duration-200 disabled:opacity-50 touch-manipulation`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <Heart 
          className={` transition-transform group-hover:scale-110 ${isLiked ? 'scale-105' : ''}`}
          fill={isLiked ? "currentColor" : "none"} 
        />
        <span className="text-sm sm:text-base">{post.likes.length}</span>
      </button>
      
      {/* Comment Button */}
      <button
        onClick={onComment}
        disabled={!currentUser}
        className="group flex items-center space-x-1 p-2 sm:px-3 sm:py-2 rounded-full hover:bg-gray-100 
          transition-all duration-200 disabled:opacity-50 touch-manipulation"
        aria-label="Comment on post"
      >
        <MessageSquare 
          className=" transition-transform group-hover:scale-110" 
        />
        <span className="text-sm sm:text-base">{post.comments?.length || 0}</span>
      </button>
      
      {/* Repost Button */}
      <button
        onClick={onRepost}
        disabled={isReposting || !currentUser}
        className="group flex items-center space-x-1 p-2 sm:px-3 sm:py-2 rounded-full hover:bg-gray-100 
          transition-all duration-200 disabled:opacity-50 touch-manipulation"
        aria-label="Repost"
      >
        <Repeat2 
          className=" transition-transform group-hover:scale-110" 
        />
        <span className="text-sm sm:text-base">{post.reposts || 0}</span>
      </button>
      
      {/* Save Button */}
      <button
        onClick={onSaveToggle}
        disabled={isSaving || !currentUser}
        className={`group flex items-center space-x-1 p-2 sm:px-3 sm:py-2 rounded-full
          ${isSaved ? 'text-yellow-600' : 'hover:bg-gray-100'}
          transition-all duration-200 disabled:opacity-50 touch-manipulation`}
        aria-label={isSaved ? "Unsave post" : "Save post"}
      >
        <Bookmark 
          className={` transition-transform group-hover:scale-110 ${isSaved ? 'scale-110' : ''}`}
          fill={isSaved ? "currentColor" : "none"} 
        />
      </button>
    </div>
  );
}