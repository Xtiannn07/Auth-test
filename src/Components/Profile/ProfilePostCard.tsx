// src/components/Profile/PostCard.jsx
import React from 'react';
import { ThumbsUp, MessageCircle, Share2, MoreHorizontal } from 'lucide-react';

export default function PostCard({ post, userData }) {
  const formatDate = (timestamp) => {
    return new Date(timestamp).toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-md shadow">
      {/* Post header */}
      <div className="p-4 flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full overflow-hidden mr-3">
            <img 
              src={userData.profilePicture} 
              alt={userData.displayName} 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 className="font-medium">{userData.displayName}</h3>
            <p className="text-gray-500 text-xs">{formatDate(post.timestamp)}</p>
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <MoreHorizontal size={20} />
        </button>
      </div>
      
      {/* Post content */}
      <div className="px-4 pb-3">
        <p>{post.content}</p>
      </div>
      
      {/* Post image if available */}
      {post.image && (
        <div className="mb-4">
          <img 
            src={post.image} 
            alt="Post content" 
            className="w-full h-auto"
          />
        </div>
      )}
      
      {/* Post stats */}
      <div className="px-4 py-2 border-t border-b flex justify-between text-gray-500 text-sm">
        <div>{post.likes} likes</div>
        <div>{post.comments.length} comments</div>
      </div>
      
      {/* Post actions */}
      <div className="px-4 py-2 flex justify-around">
        <button className="flex items-center text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md">
          <ThumbsUp size={18} className="mr-2" />
          Like
        </button>
        <button className="flex items-center text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md">
          <MessageCircle size={18} className="mr-2" />
          Comment
        </button>
        <button className="flex items-center text-gray-500 hover:bg-gray-100 px-3 py-1 rounded-md">
          <Share2 size={18} className="mr-2" />
          Share
        </button>
      </div>
    </div>
  );
}