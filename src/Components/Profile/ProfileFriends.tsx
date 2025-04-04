
// src/components/Profile/ProfileFriends.jsx
import React from 'react';
import { UserPlus } from 'lucide-react';

export default function ProfileFriends({ userData, isGuest }) {
  if (isGuest) {
    return (
      <div className="bg-white p-6 rounded-md shadow text-center">
        <p className="text-gray-500">Sign in to see your friends</p>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">Friends</h3>
      {userData?.friends && userData.friends.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {userData.friends.map((friend) => (
            <div key={friend.id} className="flex flex-col items-center">
              <div className="w-20 h-20 rounded-md overflow-hidden mb-2">
                <img src={friend.profilePicture} alt={friend.name} className="w-full h-full object-cover" />
              </div>
              <p className="font-medium text-center">{friend.name}</p>
              <button className="text-blue-500 text-sm flex items-center mt-1">
                <UserPlus size={14} className="mr-1" /> Add Friend
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No friends to show</p>
      )}
    </div>
  );
}