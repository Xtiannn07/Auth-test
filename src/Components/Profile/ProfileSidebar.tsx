// src/components/Profile/ProfileSidebar.jsx
import React from 'react';

export default function ProfileSidebar({ currentUser, userData }) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-md shadow p-4">
        <h3 className="font-medium mb-3">Intro</h3>
        <div className="text-center space-y-3">
          <p className="text-gray-500 text-sm">
            {userData?.bio || 'Add a short bio to tell people more about yourself.'}
          </p>
          <button className="w-full py-2 bg-gray-200 hover:bg-gray-300 rounded-md text-sm font-medium">
            Edit Bio
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Photos</h3>
          {userData?.photos && userData.photos.length > 0 && (
            <a href="#" className="text-blue-500 text-sm">See All</a>
          )}
        </div>
        {userData?.photos && userData.photos.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {userData.photos.slice(0, 9).map((photo, index) => (
              <div key={index} className="aspect-square rounded-sm overflow-hidden">
                <img src={photo} alt={`Photo ${index+1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 gap-1">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="aspect-square bg-gray-100 rounded-sm"></div>
            ))}
          </div>
        )}
      </div>
      
      <div className="bg-white rounded-md shadow p-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">Friends</h3>
          {userData?.friends && userData.friends.length > 0 && (
            <a href="#" className="text-blue-500 text-sm">See All</a>
          )}
        </div>
        {userData?.friends && userData.friends.length > 0 ? (
          <div className="grid grid-cols-3 gap-1">
            {userData.friends.slice(0, 6).map((friend) => (
              <div key={friend.id} className="text-center">
                <div className="aspect-square rounded-md overflow-hidden mb-1">
                  <img src={friend.profilePicture} alt={friend.name} className="w-full h-full object-cover" />
                </div>
                <p className="text-xs font-medium truncate">{friend.name}</p>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 text-sm text-center">No friends to show</p>
        )}
      </div>
    </div>
  );
}