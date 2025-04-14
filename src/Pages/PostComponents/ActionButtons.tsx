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
    <div className="flex items-center space-x-6">
      {/* Like Button */}
      <button 
        onClick={onLikeToggle}
        disabled={isLiking || !currentUser}
        className={`flex items-center space-x-1 px-2 py-1 rounded ${
          isLiked ? 'text-blue-600' : 'hover:bg-gray-100'
        } transition-colors disabled:opacity-50`}
        aria-label={isLiked ? "Unlike post" : "Like post"}
      >
        <Heart fill={isLiked ? "currentColor" : "none"} size={20} />
        <span>{post.likes.length}</span>
      </button>
      
      {/* Comment Button */}
      <button
        onClick={onComment}
        disabled={!currentUser}
        className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Comment on post"
      >
        <MessageSquare size={20} />
        <span>{post.comments?.length || 0}</span>
      </button>
      
      {/* Repost Button */}
      <button
        onClick={onRepost}
        disabled={isReposting || !currentUser}
        className="flex items-center space-x-1 px-2 py-1 rounded hover:bg-gray-100 transition-colors disabled:opacity-50"
        aria-label="Repost"
      >
        <Repeat2 size={20} />
        <span>{post.reposts || 0}</span>
      </button>
      
      {/* Save Button */}
      <button
        onClick={onSaveToggle}
        disabled={isSaving || !currentUser}
        className={`flex items-center space-x-1 px-2 py-1 rounded ${
          isSaved ? 'text-yellow-600' : 'hover:bg-gray-100'
        } transition-colors disabled:opacity-50`}
        aria-label={isSaved ? "Unsave post" : "Save post"}
      >
        <Bookmark fill={isSaved ? "currentColor" : "none"} size={20} />
      </button>
    </div>
  );
}