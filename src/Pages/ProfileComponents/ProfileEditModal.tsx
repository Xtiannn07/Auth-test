// src/Pages/Profile/ProfileEditModal.tsx
import { useState, FormEvent } from 'react';
import { UserProfile, UserService } from '../../Services/UserService';
import { X, Camera } from 'lucide-react';

interface ProfileEditModalProps {
  profile: UserProfile;
  onClose: () => void;
  onSave: (updatedProfile: UserProfile) => void;
}

const ProfileEditModal = ({ profile, onClose, onSave }: ProfileEditModalProps) => {
  const [displayName, setDisplayName] = useState(profile.displayName || '');
  const [username, setUsername] = useState(profile.username || '');
  const [bio, setBio] = useState(profile.bio || '');
  const [photoURL, setPhotoURL] = useState(profile.photoURL || '');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Check if username is available
  const checkUsernameAvailability = async () => {
    if (!username || username === profile.username) {
      setUsernameError('');
      return true;
    }
    
    try {
      const isAvailable = await UserService.isUsernameAvailable(username, profile.uid);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        return false;
      } else {
        setUsernameError('');
        return true;
      }
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameError('Error checking username availability');
      return false;
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    
    // Validate
    if (!displayName.trim()) {
      return; // Don't submit if display name is empty
    }
    
    // Check username availability
    const isUsernameValid = await checkUsernameAvailability();
    if (!isUsernameValid) return;
    
    setIsSubmitting(true);
    
    try {
      // Update the profile in the database
      const updatedProfile = await UserService.updateUserProfile(profile.uid, {
        displayName,
        username,
        bio,
        photoURL
      });
      
      // Notify parent component about the update
      onSave(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Simple image URL validator
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setPhotoURL(url);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center">
            <button 
              onClick={onClose}
              className="mr-4 p-1 rounded-full hover:bg-gray-100"
              aria-label="Close"
            >
              <X size={20} />
            </button>
            <h2 className="text-lg font-medium">Edit Profile</h2>
          </div>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || !displayName.trim() || !!usernameError}
            className={`px-4 py-1 rounded-full text-sm font-medium ${
              isSubmitting || !displayName.trim() || !!usernameError
              ? 'bg-gray-200 text-gray-500'
              : 'bg-blue-500 text-white hover:bg-blue-600'
            }`}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </button>
        </div>
        
        <form className="p-4">
          {/* Profile Picture */}
          <div className="mb-6 flex justify-center">
            <div className="relative">
              <div className="w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {photoURL ? (
                  <img 
                    src={photoURL} 
                    alt={displayName} 
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      // If image fails to load, show initial instead
                      setPhotoURL('');
                    }}
                  />
                ) : (
                  <span className="text-gray-600 font-medium text-3xl">
                    {displayName.charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-1 cursor-pointer">
                <Camera size={16} className="text-white" />
              </div>
            </div>
          </div>

          {/* Form Fields */}
          <div className="space-y-4">
            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                Display Name
              </label>
              <input
                type="text"
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={50}
                required
              />
            </div>
            
            {/* Username */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
                Username
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onBlur={checkUsernameAvailability}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={15}
                required
              />
              {usernameError && (
                <p className="text-red-500 text-xs mt-1">{usernameError}</p>
              )}
              <p className="text-gray-500 text-xs mt-1">
                Only letters, numbers, and underscores are allowed
              </p>
            </div>
            
            {/* Bio */}
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
                Bio
              </label>
              <textarea
                id="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows={4}
                maxLength={160}
              />
              <p className="text-gray-500 text-xs mt-1">
                {bio.length}/160 characters
              </p>
            </div>
            
            {/* Profile Picture URL */}
            <div>
              <label htmlFor="photoURL" className="block text-sm font-medium text-gray-700 mb-1">
                Profile Picture URL
              </label>
              <input
                type="text"
                id="photoURL"
                value={photoURL}
                onChange={handleImageChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="https://example.com/image.jpg"
              />
              <p className="text-gray-500 text-xs mt-1">
                Enter a valid image URL
              </p>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProfileEditModal;