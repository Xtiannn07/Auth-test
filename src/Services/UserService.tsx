// src/Services/UserService.ts
import { User as FirebaseUser } from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from './Firebase';

interface UserProfile {
  displayName?: string;
  username?: string;
  email?: string;
  photoURL?: string;
  bio?: string;
}

export const UserService = {
  // Create or update a user record in Firestore when user signs up or updates profile
  async syncUserToFirestore(user: FirebaseUser): Promise<void> {
    if (!user.uid) return;

    const userRef = doc(db, 'users', user.uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      // New user - create record
      await setDoc(userRef, {
        displayName: user.displayName || null,
        username: user.email ? user.email.split('@')[0] : null,
        email: user.email,
        photoURL: user.photoURL || null,
        createdAt: new Date()
      });
    } else {
      // Existing user - check if we need to update any fields
      const userData = userDoc.data();
      const updates: Partial<UserProfile> = {};
      
      if (user.displayName && user.displayName !== userData.displayName) {
        updates.displayName = user.displayName;
      }
      if (user.photoURL && user.photoURL !== userData.photoURL) {
        updates.photoURL = user.photoURL;
      }
      if (user.email && user.email !== userData.email) {
        updates.email = user.email;
        // Update username if it was based on email and email changed
        if (!userData.username || userData.username === userData.email?.split('@')[0]) {
          updates.username = user.email.split('@')[0];
        }
      }
      
      // Only update if there are changes
      if (Object.keys(updates).length > 0) {
        await updateDoc(userRef, updates);
      }
    }
  },
  
  // Update a user's profile information
  async updateUserProfile(userId: string, profile: Partial<UserProfile>): Promise<void> {
    const userRef = doc(db, 'users', userId);
    await updateDoc(userRef, {
      ...profile,
      updatedAt: new Date()
    });
  },
  
  // Verify if a username is available (not used by another user)
  async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
    const usersQuery = query(
      collection(db, 'users'),
      where('username', '==', username)
    );
    
    const querySnapshot = await getDocs(usersQuery);
    
    // Username is available if no user has it, or if only the current user has it
    return querySnapshot.empty || 
           (querySnapshot.size === 1 && querySnapshot.docs[0].id === currentUserId);
  }
};

// Import missing function
import { query, collection, where } from 'firebase/firestore';