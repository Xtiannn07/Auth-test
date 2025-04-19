import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  arrayUnion,
  arrayRemove,
  increment,
  DocumentReference,
  getFirestore,
  orderBy,
  limit
} from 'firebase/firestore';
import { db } from './Firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  followerCount: number;
  followingCount: number;
  createdAt?: string;
  id?: string; // Added for compatibility with existing User type
}

export class UserService {
  // Create user profile in Firestore
  static async createUserProfile(
    uid: string, 
    profileData: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const userProfileRef = doc(db, 'users', uid);
      // Create a complete user profile object
      const userProfile: UserProfile = {
        uid,
        displayName: profileData.displayName || '',
        username: profileData.username || '',
        email: profileData.email || '',
        photoURL: profileData.photoURL || '',
        bio: profileData.bio || '',
        followerCount: profileData.followerCount || 0,
        followingCount: profileData.followingCount || 0,
        createdAt: profileData.createdAt || new Date().toISOString()
      };
      
      // Set the document in Firestore
      await setDoc(userProfileRef, userProfile);
      
      // If username is provided, add to username collection for faster lookups
      if (userProfile.username) {
        try {
          await this.setUsernameMapping(userProfile.username, uid);
        } catch (error) {
          console.error('Error setting username mapping:', error);
          // Continue even if username mapping fails
        }
      }
      // Initialize following and followers documents
      try {
        await this.createFollowingDocument(uid);
        await this.createFollowersDocument(uid);
      } catch (error) {
        console.error('Error creating follow documents:', error);
        // Continue even if follow documents creation fails
      }
      return userProfile;
    } catch (error) {
      console.error('Error creating user profile:', error);
      throw error;
    }
  }

  // Create username mapping
  static async setUsernameMapping(username: string, uid: string): Promise<void> {
    try {
      const usernameRef = doc(db, 'usernames', username.toLowerCase());
      await setDoc(usernameRef, { uid });
    } catch (error) {
      console.error('Error setting username mapping:', error);
      throw error;
    }
  }

  // Create following document
  static async createFollowingDocument(uid: string): Promise<void> {
    try {
      const followingRef = doc(db, 'following', uid);
      await setDoc(followingRef, { users: [] });
    } catch (error) {
      console.error('Error creating following document:', error);
      throw error;
    }
  }

  // Create followers document
  static async createFollowersDocument(uid: string): Promise<void> {
    try {
      const followersRef = doc(db, 'followers', uid);
      await setDoc(followersRef, { users: [] });
    } catch (error) {
      console.error('Error creating followers document:', error);
      throw error;
    }
  }

  // Get user profile by UID
  static async getUserProfile(uid: string): Promise<UserProfile> {
    try {
      const userProfileRef = doc(db, 'users', uid);
      const userProfileSnap = await getDoc(userProfileRef);
      
      if (!userProfileSnap.exists()) {
        throw new Error('User profile not found');
      }
      
      const userData = userProfileSnap.data() as UserProfile;
      // Ensure id field is set for compatibility
      return { ...userData, id: uid };
    } catch (error) {
      console.error('Error getting user profile:', error);
      throw error;
    }
  }

  // Update user profile
  static async updateUserProfile(
    uid: string, 
    updates: Partial<UserProfile>
  ): Promise<UserProfile> {
    try {
      const userProfileRef = doc(db, 'users', uid);
      
      // Get current profile data
      const currentProfileSnap = await getDoc(userProfileRef);
      if (!currentProfileSnap.exists()) {
        throw new Error('User profile not found');
      }
      
      const currentProfile = currentProfileSnap.data() as UserProfile;
      
      // If username is being updated, update the username mapping
      if (updates.username && updates.username !== currentProfile.username) {
        // Remove old username mapping
        if (currentProfile.username) {
          await this.removeUsernameMapping(currentProfile.username);
        }
        
        // Add new username mapping
        await this.setUsernameMapping(updates.username, uid);
      }
      
      // Update the profile
      await updateDoc(userProfileRef, updates);
      
      // Return the updated profile
      const updatedProfile = {
        ...currentProfile,
        ...updates
      };
      
      // Ensure id field is set for compatibility
      return { ...updatedProfile, id: uid };
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  }

  // Get user by username
  static async getUserByUsername(username: string): Promise<UserProfile | null> {
    try {
      // First, try to get the user ID from the username mapping
      const uid = await this.getUserIDFromUsername(username);
      
      if (!uid) return null;
      
      // Then get the user profile using the ID
      return await this.getUserProfile(uid);
    } catch (error) {
      console.error('Error getting user by username:', error);
      throw error;
    }
  }

  // Check if a username is available
  static async isUsernameAvailable(username: string, currentUserUid?: string): Promise<boolean> {
    if (!username || typeof username !== 'string') {
      return false;
    }
    
    try {
      const normalizedUsername = username.toLowerCase();
      
      if (!/^[a-z0-9_]+$/.test(normalizedUsername)) {
        return false;
      }
      
      const usernameRef = doc(db, 'usernames', normalizedUsername);
      const usernameSnap = await getDoc(usernameRef);
      
      if (!usernameSnap.exists()) {
        return true;
      }
      
      const data = usernameSnap.data();
      if (currentUserUid && data?.uid === currentUserUid) {
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Error checking username availability:', error);
      throw error;
    }
  }

  // Remove username mapping
  static async removeUsernameMapping(username: string): Promise<void> {
    try {
      username = username.toLowerCase();
      const usernameRef = doc(db, 'usernames', username);
      await setDoc(usernameRef, { uid: null });
    } catch (error) {
      console.error('Error removing username mapping:', error);
      throw error;
    }
  }

  // Get user ID from username
  static async getUserIDFromUsername(username: string): Promise<string | null> {
    try {
      username = username.toLowerCase();
      const usernameRef = doc(db, 'usernames', username);
      const usernameSnap = await getDoc(usernameRef);
      
      if (!usernameSnap.exists()) return null;
      
      const data = usernameSnap.data();
      return data.uid;
    } catch (error) {
      console.error('Error getting user ID from username:', error);
      throw error;
    }
  }

  // Follow a user
  static async followUser(currentUserUid: string, targetUserUid: string): Promise<void> {
    try {
      // Add target user to current user's following list
      const currentUserRef = doc(db, 'users', currentUserUid);
      const followingRef = doc(db, 'following', currentUserUid);
      
      // Add current user to target user's followers list
      const targetUserRef = doc(db, 'users', targetUserUid);
      const followersRef = doc(db, 'followers', targetUserUid);
      
      // Update following document
      await setDoc(followingRef, {
        users: arrayUnion(targetUserUid)
      }, { merge: true });
      
      // Update followers document
      await setDoc(followersRef, {
        users: arrayUnion(currentUserUid)
      }, { merge: true });
      
      // Update follower/following counts
      await updateDoc(currentUserRef, {
        followingCount: increment(1)
      });
      
      await updateDoc(targetUserRef, {
        followerCount: increment(1)
      });
    } catch (error) {
      console.error('Error following user:', error);
      throw error;
    }
  }

  // Fetch users with pagination
  static async fetchUsers(limitCount = 10): Promise<UserProfile[]> {
    try {
      const usersQuery = query(
        collection(db, 'users'),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      return querySnapshot.docs.map(doc => {
        const userData = doc.data() as UserProfile;
        return { ...userData, id: doc.id };
      });
    } catch (error) {
      console.error("Error fetching users:", error);
      throw error;
    }
  }

  // Search users
  static async searchUsers(searchTerm: string): Promise<UserProfile[]> {
    if (!searchTerm.trim()) {
      return this.fetchUsers();
    }

    try {
      // Get all users (up to a reasonable limit) and filter client-side
      const usersQuery = query(
        collection(db, 'users'),
        limit(100)
      );
      
      const querySnapshot = await getDocs(usersQuery);
      const searchTermLower = searchTerm.toLowerCase();
      
      return querySnapshot.docs
        .map(doc => {
          const userData = doc.data() as UserProfile;
          return { ...userData, id: doc.id };
        })
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
  }

  // Unfollow a user
  static async unfollowUser(currentUserUid: string, targetUserUid: string): Promise<void> {
    try {
      // Remove target user from current user's following list
      const currentUserRef = doc(db, 'users', currentUserUid);
      const followingRef = doc(db, 'following', currentUserUid);
      
      // Remove current user from target user's followers list
      const targetUserRef = doc(db, 'users', targetUserUid);
      const followersRef = doc(db, 'followers', targetUserUid);
      
      // Update following document
      await updateDoc(followingRef, {
        users: arrayRemove(targetUserUid)
      });
      
      // Update followers document
      await updateDoc(followersRef, {
        users: arrayRemove(currentUserUid)
      });
      
      // Update follower/following counts
      await updateDoc(currentUserRef, {
        followingCount: increment(-1)
      });
      
      await updateDoc(targetUserRef, {
        followerCount: increment(-1)
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Check if a user is following another user
  static async isFollowing(currentUserUid: string, targetUserUid: string): Promise<boolean> {
    try {
      const followingRef = doc(db, 'following', currentUserUid);
      const followingSnap = await getDoc(followingRef);
      
      if (!followingSnap.exists()) return false;
      
      const data = followingSnap.data();
      return data.users?.includes(targetUserUid) || false;
    } catch (error) {
      console.error('Error checking following status:', error);
      throw error;
    }
  }

  // Get user suggestions (users not followed)
  static async getUserSuggestions(uid: string, limit: number = 5): Promise<UserProfile[]> {
    try {
      // Get user's following list
      const followingRef = doc(db, 'following', uid);
      const followingSnap = await getDoc(followingRef);
      
      const followingList = followingSnap.exists() 
        ? followingSnap.data().users || []
        : [];
      
      // Add the current user to the exclusion list
      const excludeUsers = [...followingList, uid];
      
      // Query for users not in the exclusion list
      const usersRef = collection(db, 'users');
      const usersQuery = query(usersRef);
      const usersSnap = await getDocs(usersQuery);
      
      const suggestions: UserProfile[] = [];
      
      usersSnap.forEach(doc => {
        const userData = doc.data() as UserProfile;
        if (!excludeUsers.includes(userData.uid)) {
          suggestions.push({ ...userData, id: doc.id });
        }
      });
      
      // Shuffle and limit the results
      return suggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      throw error;
    }
  }
}