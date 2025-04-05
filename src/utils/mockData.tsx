// src/utils/mockData.js

// Default profile template that will be used for any user
export const defaultProfileTemplate = {
  displayName: 'User',
  profilePicture: 'https://randomuser.me/api/portraits/men/80.jpg',
  coverPhoto: 'https://source.unsplash.com/random/800x300/?gradient',
  bio: 'Tell people about yourself',
  location: 'Add your location',
  workplace: 'Add your workplace',
  friendCount: 0,
  friends: [],
  photos: [],
  posts: [],
  saved: []
};

// Function to get user data with fallback to template
export function getUserData(user) {
  if (!user) return null;
  
  // Create a profile based on the default template
  const profileData = {
    ...defaultProfileTemplate,
    uid: user.uid || 'unknown',
    displayName: user.displayName || defaultProfileTemplate.displayName,
    email: user.email || '',
    profilePicture: user.photoURL || defaultProfileTemplate.profilePicture,
  };
  
  return profileData;
}