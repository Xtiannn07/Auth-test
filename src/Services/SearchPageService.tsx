// src/Pages/Search/api.ts
import { collection, getDocs, query, where, orderBy, limit, doc, setDoc, getDoc } from 'firebase/firestore';
import { db, auth } from './Firebase';
import { User as FirebaseUser } from 'firebase/auth';

export interface User {
  id: string;
  username?: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

// Since we can't list users from Firebase Auth directly in client code,
// we need to maintain a separate users collection in Firestore
export const fetchUsers = async (limitCount = 10): Promise<User[]> => {
  try {
    const usersQuery = query(
      collection(db, 'users'),
      orderBy('createdAt', 'desc'), // Assuming users have a createdAt field
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    return querySnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    } as User));
  } catch (error) {
    console.error("Error fetching users:", error);
    throw error;
  }
};

// Search users by username or displayName
export const searchUsers = async (searchTerm: string): Promise<User[]> => {
  if (!searchTerm.trim()) {
    return fetchUsers();
  }

  try {
    // Unfortunately, Firestore doesn't support native case-insensitive search
    // We'll get all users (up to a reasonable limit) and filter client-side
    const usersQuery = query(
      collection(db, 'users'),
      limit(100) // Limit to avoid too much data transfer
    );
    
    const querySnapshot = await getDocs(usersQuery);
    const searchTermLower = searchTerm.toLowerCase();
    
    return querySnapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() } as User))
      .filter(user => 
        (user.username?.toLowerCase().includes(searchTermLower)) || 
        (user.displayName?.toLowerCase().includes(searchTermLower)) ||
        (user.email?.toLowerCase().includes(searchTermLower))
      )
      .slice(0, 20); // Limit to 20 results
  } catch (error) {
    console.error("Error searching users:", error);
    throw error;
  }
};

// Follow a user
export const followUser = async (followerId: string, followingId: string): Promise<void> => {
  const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
  
  // Check if already following
  const followDoc = await getDoc(followingRef);
  if (followDoc.exists()) {
    return; // Already following
  }
  
  await setDoc(followingRef, {
    followerId,
    followingId,
    createdAt: new Date()
  });
};

// Check if a user is already followed
export const isUserFollowed = async (followerId: string, followingId: string): Promise<boolean> => {
  const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
  const followDoc = await getDoc(followingRef);
  return followDoc.exists();
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