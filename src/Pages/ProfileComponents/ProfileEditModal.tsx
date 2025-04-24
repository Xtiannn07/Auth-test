// src/Pages/Profile/ProfileEditModal.tsx
import { useState, FormEvent } from 'react';
import { type UserProfile } from '../../Services/UserService';
import UserService from '../../Services/UserService';
import { X, Camera } from 'lucide-react';
import ImageSelector from '../../Components/UI/ImageSelector';

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
  const [isImageSelectorOpen, setIsImageSelectorOpen] = useState(false);

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
      return;
    }
    
    // Check username availability
    const isUsernameValid = await checkUsernameAvailability();
    if (!isUsernameValid) return;
    
    setIsSubmitting(true);
    
    try {
      const updatedProfile = await UserService.updateUserProfile(profile.uid, {
        displayName,
        username,
        bio,
        photoURL
      });
      
      onSave(updatedProfile);
    } catch (err) {
      console.error('Error updating profile:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle image selection from ImageSelector
  const handleImageSelect = (imageUrl: string) => {
    setPhotoURL(imageUrl);
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
                    onError={() => {
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
              <button
                type="button"
                onClick={() => setIsImageSelectorOpen(true)}
                className="absolute bottom-0 right-0 bg-blue-500 rounded-full p-2 cursor-pointer hover:bg-blue-600 transition-colors"
                aria-label="Change profile picture"
              >
                <Camera size={16} className="text-white" />
              </button>
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
          </div>
        </form>
      </div>

      {/* Image Selector Modal */}
      <ImageSelector
        isOpen={isImageSelectorOpen}
        onClose={() => setIsImageSelectorOpen(false)}
        onSelect={handleImageSelect}
        currentImageUrl={photoURL}
      />
    </div>
  );
};

export default ProfileEditModal;