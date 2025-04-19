// src/Pages/Search/api.ts
import { collection, getDocs, query, where, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from '../../Services/Firebase';
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

// Remove a user from suggestions
export const removeUserSuggestion = async (userId: string, currentUserId: string): Promise<void> => {
  const hiddenRef = doc(db, 'hidden-suggestions', `${currentUserId}_${userId}`);
  await setDoc(hiddenRef, {
    userId,
    hiddenBy: currentUserId,
    createdAt: new Date()
  });
};

// Get list of hidden user suggestions
export const getHiddenSuggestions = async (currentUserId: string): Promise<string[]> => {
  const hiddenQuery = query(
    collection(db, 'hidden-suggestions'),
    where('hiddenBy', '==', currentUserId)
  );
  
  const querySnapshot = await getDocs(hiddenQuery);
  return querySnapshot.docs.map(doc => doc.data().userId);
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