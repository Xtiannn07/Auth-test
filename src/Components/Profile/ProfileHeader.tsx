// src/components/Profile/ProfileHeader.jsx
import { useState } from 'react';
import { Camera, Edit2, LogOut } from 'lucide-react';
import Button from '../UI/Button';
import { useAuth } from '../../Contexts/AuthContexts';

export default function ProfileHeader({ currentUser, userData, onLogout, onSuccess, onError }) {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || userData?.displayName || '');
  const [loading, setLoading] = useState(false);

  async function handleUpdateProfile() {
    try {
      setLoading(true);
      await updateUserProfile(displayName, null);
      onSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      onError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      {/* Cover photo */}
      <div 
        className="h-48 relative bg-gradient-to-r from-blue-400 to-blue-600"
        style={userData?.coverPhoto ? { backgroundImage: `url(${userData.coverPhoto})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
      >
        <button className="absolute bottom-4 right-4 bg-white bg-opacity-80 hover:bg-opacity-100 rounded-md px-3 py-1 text-sm flex items-center text-gray-700">
          <Camera size={16} className="mr-2" /> Edit Cover Photo
        </button>
      </div>
      
      {/* Profile picture and name */}
      <div className=" pr-1 pl-4 relative">
        <div className="flex justify-between items-end">
          <div className="flex items-end -mt-12 sm:-mt-16 pb-4">
            <div className="relative">
              <div className="w-24 h-24 sm:w-32 sm:h-32 bg-white rounded-full border-4 border-white shadow overflow-hidden flex items-center justify-center">
                {userData?.profilePicture ? (
                  <img 
                    src={userData.profilePicture} 
                    alt="Profile" 
                    className="w-full h-full object-cover" 
                  />
                ) : (
                  <div className="bg-blue-100 w-full h-full flex items-center justify-center">
                    <span className="text-blue-500 font-bold text-4xl">
                      {displayName.charAt(0).toUpperCase() || 'U'}
                    </span>
                  </div>
                )}
                <div className="absolute bottom-0 right-0 bg-gray-200 rounded-full p-1 cursor-pointer hover:bg-gray-300">
                  <Camera size={16} className="text-gray-700" />
                </div>
              </div>
            </div>
            <div className="ml-4 mb-4">
              <h1 className="text-2xl font-bold">{displayName || userData?.displayName}</h1>
              <p className="text-gray-500 text-sm">{currentUser.email}</p>
              {userData?.friendCount > 0 && (
                <p className="text-gray-500 text-sm">{userData.friendCount} Friends</p>
              )}
            </div>
          </div>
          
          <div className="pb-1 flex space-x-1 place-items-end">
            <Button 
              type="button"
              className=" w-full h-8 text-[8px] sm:text-[12px] hover:bg-blue-300 flex items-center"
              onClick={() => setIsEditing(!isEditing)}>
              <Edit2 size={12} className="mr-1" /> Edit Profile
            </Button>
            
          </div>
        </div>
      </div>
      
      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Edit Profile</h2>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Display Name</label>
              <input
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            <div className="flex space-x-2">
              <Button
                type="button"
                onClick={handleUpdateProfile}
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
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