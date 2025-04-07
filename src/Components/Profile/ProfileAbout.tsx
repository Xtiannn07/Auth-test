// src/components/Profile/ProfileAbout.jsx
import { useState } from 'react';
import { Edit2 } from 'lucide-react';
import Button from '../UI/Button';
import { useAuth } from '../../Contexts/AuthContexts';

export default function ProfileAbout({ currentUser, userData, onSuccess, onError }) {
  const { updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [displayName, setDisplayName] = useState(currentUser?.displayName || userData?.displayName || '');
  const [loading, setLoading] = useState(false);
  const [bio, setBio] = useState(userData?.bio || '');

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      setLoading(true);
      await updateUserProfile(displayName, null);
      // In a real app, you'd update the bio in your database here
      onSuccess('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      onError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white p-6 rounded-md shadow">
      <h3 className="text-xl font-semibold mb-4">About</h3>
      <div className="space-y-4">
        <div>
          <p className="text-gray-500 text-sm">Email</p>
          <p className="font-medium">{currentUser.email}</p>
        </div>
        
        {!isEditing ? (
          <>
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Display Name</p>
                <p className="font-medium">{displayName || 'Add a name'}</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            <div className="flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Bio</p>
                <p className="font-medium">{bio || 'Add a bio'}</p>
              </div>
              <button 
                onClick={() => setIsEditing(true)}
                className="text-blue-500 hover:text-blue-700"
              >
                <Edit2 size={16} />
              </button>
            </div>
            
            {userData?.location && (
              <div>
                <p className="text-gray-500 text-sm">Location</p>
                <p className="font-medium">{userData.location}</p>
              </div>
            )}
            
            {userData?.workplace && (
              <div>
                <p className="text-gray-500 text-sm">Works at</p>
                <p className="font-medium">{userData.workplace}</p>
              </div>
            )}
          </>
        ) : (
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div>
              <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">Display Name</label>
              <input
                id="display-name"
                name="displayName"
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
              <textarea
                id="bio"
                name="bio"
                placeholder="Tell people about yourself"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={3}
                className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
            
            <div className="flex space-x-4">
              <Button
                type="submit"
                disabled={loading}
              >
                {loading ? 'Saving...' : 'Save'}
              </Button>
              
              <Button
                type="button"
                onClick={() => setIsEditing(false)}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}