// src/Pages/Search/api.ts
import { getAuth, listUsers, UserRecord } from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './Firebase';

export interface User {
  id: string;
  username: string;
  displayName?: string;
  email?: string;
  photoURL?: string;
}

// Custom admin-only function to fetch users from Firebase Authentication
// Note: Firebase Authentication listUsers requires admin SDK and can't be used in client apps directly
// Instead, we'll assume you have a users collection in Firestore that mirrors your auth users
export const fetchUsers = async (limitCount = 10): Promise<User[]> => {
  try {
    const usersQuery = query(collection(db, 'users'), limit(limitCount));
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
    // Get all users and filter client-side
    // Note: In a production app, you might want a proper search index
    const usersQuery = query(collection(db, 'users'));
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

// Import necessary functions
import { limit } from 'firebase/firestore';