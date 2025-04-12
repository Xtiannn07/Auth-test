// src/Pages/Profile/Header.tsx
import { useState } from 'react';
import { Camera, Settings, MoreHorizontal } from 'lucide-react';
import Button from '../../Components/UI/Button';
import { useAuth } from '../../Contexts/AuthContexts';

export default function ProfileHeader({ currentUser, userData, onLogout, onSuccess, onError }) {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || userData?.displayName || '');
  const [bio, setBio] = useState(userData?.bio || '');
  const [loading, setLoading] = useState(false);

  async function handleUpdateProfile() {
    try {
      setLoading(true);
      await updateUserProfile(displayName, null, bio);
      onSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      onError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-black text-white">
      {/* Profile info section */}
      <div className="px-4 pt-6 pb-4">
        <div className="flex justify-between items-start">
          {/* Profile picture and name */}
          <div className="flex-1">
            <h1 className="text-xl font-bold">{displayName || userData?.displayName}</h1>
            <p className="text-gray-400 text-sm">{currentUser.email}</p>
          </div>
          
          {/* Profile picture */}
          <div className="relative">
            <div className="w-20 h-20 rounded-full overflow-hidden border border-gray-700">
              {userData?.profilePicture ? (
                <img 
                  src={userData.profilePicture} 
                  alt="Profile" 
                  className="w-full h-full object-cover" 
                />
              ) : (
                <div className="bg-gray-800 w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 font-bold text-2xl">
                    {displayName.charAt(0).toUpperCase() || 'U'}
                  </span>
                </div>
              )}
            </div>
            <button className="absolute bottom-0 right-0 bg-gray-800 rounded-full p-1.5 border border-gray-700">
              <Camera size={14} className="text-gray-300" />
            </button>
          </div>
        </div>
        
        {/* Bio */}
        {userData?.bio && (
          <p className="text-white mt-4">{userData.bio}</p>
        )}
        
        {/* Stats */}
        <div className="flex mt-4 text-sm">
          <div className="mr-4">
            <span className="font-bold">{userData?.postCount || 0}</span> <span className="text-gray-400">posts</span>
          </div>
          <div>
            <span className="font-bold">{userData?.followerCount || 0}</span> <span className="text-gray-400">followers</span>
          </div>
        </div>
        

      </div>
      
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="bg-gray-900 p-6 rounded-xl w-full max-w-md border border-gray-800">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold">Edit profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <label className="block text-sm text-gray-400 mb-1">Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm text-gray-400 mb-1">Bio</label>
              <textarea
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white h-24"
              />
            </div>
            
            <div className="space-y-2">
              <Button
                type="button"
                onClick={handleUpdateProfile}
                disabled={loading}
                className="w-full bg-white text-black hover:bg-gray-200 rounded-lg py-2"
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                className="w-full bg-transparent border border-gray-700 hover:bg-gray-800 rounded-lg py-2"
              >
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}