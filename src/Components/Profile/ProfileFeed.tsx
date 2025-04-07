// src/components/Profile/ProfileFeed.jsx
import { useState } from 'react';
import { Camera, Users, MessageCircle } from 'lucide-react';
import PostCard from './ProfilePostCard';

export default function ProfileFeed({ userData, currentUser }) {
  const [postText, setPostText] = useState('');
  const displayName = currentUser?.displayName || userData?.displayName || 'User';
  
  const handlePostSubmit = (e) => {
    e.preventDefault();
    // Handle post submission logic here
    setPostText('');
    alert('Post functionality would be implemented here');
  };
  
  return (
    <div className="space-y-4">
      {/* Create post card */}
      <div className="bg-white p-4 rounded-md shadow">
        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center overflow-hidden">
            {userData?.profilePicture ? (
              <img 
                src={userData.profilePicture} 
                alt="Profile" 
                className="w-full h-full object-cover" 
              />
            ) : (
              <span className="text-blue-500 font-bold text-xl">
                {displayName.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <form className="flex-1" onSubmit={handlePostSubmit}>
            <input
              type="text"
              value={postText}
              onChange={(e) => setPostText(e.target.value)}
              className="bg-gray-100 rounded-full w-full px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`What's on your mind, ${displayName}?`}
            />
          </form>
        </div>
        <div className="flex justify-between border-t pt-3">
          <button className="flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md px-4 py-1">
            <Camera size={20} className="mr-2" /> Photo/Video
          </button>
          <button className="flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md px-4 py-1">
            <Users size={20} className="mr-2" /> Tag Friends
          </button>
          <button className="flex items-center justify-center text-gray-500 hover:bg-gray-100 rounded-md px-4 py-1">
            <MessageCircle size={20} className="mr-2" /> Feeling
          </button>
        </div>
      </div>
      
      {/* User's posts */}
      {userData?.posts && userData.posts.length > 0 ? (
        userData.posts.map((post) => (
          <PostCard key={post.id} post={post} userData={userData} />
        ))
      ) : (
        <div className="bg-white p-6 rounded-md shadow text-center">
          <p className="text-gray-500">No posts to show</p>
        </div>
      )}
    </div>
  );
}