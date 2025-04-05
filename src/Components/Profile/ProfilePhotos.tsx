// src/components/Profile/ProfilePhotos.jsx
import React from 'react';

export default function ProfilePhotos({ userData }) {
  return (
    <div className="bg-white p-6 rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">Photos</h3>
      {userData?.photos && userData.photos.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {userData.photos.map((photo, index) => (
            <div key={index} className="aspect-square rounded-md overflow-hidden">
              <img src={photo} alt={`Photo ${index+1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      ) : (
        <p className="text-gray-500 text-center">No photos to show</p>
      )}
    </div>
  );
}