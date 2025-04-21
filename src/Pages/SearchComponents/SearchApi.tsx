// src/Pages/Search/api.ts
import { User as FirebaseUser } from 'firebase/auth';
import { UserService, UserProfile } from '../../Services/UserService';

// Use the User interface from UserService
export type User = UserProfile;

// Fetch recent users - delegating to UserService
export const fetchUsers = async (limitCount = 10): Promise<User[]> => {
  try {
    return await UserService.fetchUsers(limitCount);
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Search users by username or displayName - delegating to UserService
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  try {
    return await UserService.searchUsers(searchTerm);
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Follow a user - delegating to UserService
export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  try {
    await UserService.followUser(followerId, followingId);
  } catch (error) {
    console.error("Error following user:", error);
    throw error;
  }
};

// Check if a user is already followed - delegating to UserService
export const isUserFollowed = async (followerId: string, followingId: string): Promise<boolean> => {
  try {
    return await UserService.isFollowing(followerId, followingId);
  } catch (error) {
    console.error("Error checking following status:", error);
    throw error;
  }
};

// Remove a user from suggestions - delegating to UserService
export const removeUserSuggestion = async (userId: string, currentUserId: string): Promise<void> => {
  try {
    await UserService.removeUserSuggestion(userId, currentUserId);
  } catch (error) {
    console.error("Error removing user suggestion:", error);
    throw error;
  }
};

// Get list of hidden user suggestions - delegating to UserService
export const getHiddenSuggestions = async (currentUserId: string): Promise<string[]> => {
  try {
    return await UserService.getHiddenSuggestions(currentUserId);
  } catch (error) {
    console.error("Error getting hidden suggestions:", error);
    return [];
  }
};

// Utility function to get user display information
export const getUserDisplayInfo = (user: FirebaseUser | User | null): {
  displayName: string;
  username: string;
  initial: string;
} => {
  if (!user) {
    return {
      displayName: 'User',
      username: 'user',
      initial: 'U'
    };
  }

  // Use displayName or email username part as fallback
  const displayName = user.displayName || 
    (user.email ? user.email.split('@')[0] : 'User');
  
  // Use email username as username if no dedicated username field
  const username = 'username' in user && user.username ? 
    user.username : 
    user.email ? user.email.split('@')[0] : 'user';

  // Get initial for avatar
  const initial = displayName.charAt(0).toUpperCase();

  return { displayName, username, initial };
};