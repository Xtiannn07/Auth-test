import { 
  doc, 
  getDoc, 
  setDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  getDocs,
  increment,
  orderBy,
  limit,
  runTransaction
} from 'firebase/firestore';
import { db } from './Firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  // Maps to store followers and following directly in the user document
  // Key is the user's UID, value contains username for displaying
  followers: Record<string, {username: string}>;
  following: Record<string, {username: string}>;
  // Keep counts for quick access
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
        followers: {}, // Initialize empty followers map
        following: {}, // Initialize empty following map
        followerCount: 0,
        followingCount: 0,
        createdAt: typeof profileData.createdAt === 'string' 
          ? profileData.createdAt 
          : new Date().toISOString()
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
        
        // If username is updated, we need to update all follower/following references
        if (currentProfile.followers && Object.keys(currentProfile.followers).length > 0) {
          await this.updateFollowerReferences(Object.keys(currentProfile.followers), 
                                              uid, 
                                              updates.username);
        }
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

  // Helper method to update username in followers' following lists
  static async updateFollowerReferences(
    followerUids: string[], 
    targetUid: string, 
    newUsername: string
  ): Promise<void> {
    try {
      for (const followerUid of followerUids) {
        const followerRef = doc(db, 'users', followerUid);
        const followerSnap = await getDoc(followerRef);
        
        if (followerSnap.exists()) {
          const followerData = followerSnap.data() as UserProfile;
          const following = followerData.following || {};
          
          // Update the username in the following map
          if (following[targetUid]) {
            const updatedFollowing = { 
              ...following,
              [targetUid]: { username: newUsername }
            };
            
            await updateDoc(followerRef, { following: updatedFollowing });
          }
        }
      }
    } catch (error) {
      console.error('Error updating follower references:', error);
      // Continue even if updating follower references fails
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
  static async followUser(currentUserUid: string, targetUserUid: string): Promise<boolean> {
    try {
      // Ensure we have valid user IDs
      if (!currentUserUid || !targetUserUid) {
        console.error('Invalid user IDs for following');
        return false;
      }
      
      // Get current user profile
      const currentUserRef = doc(db, 'users', currentUserUid);
      const currentUserSnap = await getDoc(currentUserRef);
      if (!currentUserSnap.exists()) {
        throw new Error('Current user profile not found');
      }
      const currentUser = currentUserSnap.data() as UserProfile;
      
      // Get target user profile
      const targetUserRef = doc(db, 'users', targetUserUid);
      const targetUserSnap = await getDoc(targetUserRef);
      if (!targetUserSnap.exists()) {
        throw new Error('Target user profile not found');
      }
      const targetUser = targetUserSnap.data() as UserProfile;
      
      // Transaction to ensure both updates happen atomically
      await runTransaction(db, async (transaction) => {
        // Add target user to current user's following map
        const currentUserFollowing = currentUser.following || {};
        if (!currentUserFollowing[targetUserUid]) {
          const updatedFollowing = { 
            ...currentUserFollowing,
            [targetUserUid]: { username: targetUser.username }
          };
          
          transaction.update(currentUserRef, {
            following: updatedFollowing,
            followingCount: increment(1)
          });
        }
        
        // Add current user to target user's followers map
        const targetUserFollowers = targetUser.followers || {};
        if (!targetUserFollowers[currentUserUid]) {
          const updatedFollowers = { 
            ...targetUserFollowers,
            [currentUserUid]: { username: currentUser.username }
          };
          
          transaction.update(targetUserRef, {
            followers: updatedFollowers,
            followerCount: increment(1)
          });
        }
      });
      
      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
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
      // Get current user profile
      const currentUserRef = doc(db, 'users', currentUserUid);
      const currentUserSnap = await getDoc(currentUserRef);
      if (!currentUserSnap.exists()) {
        throw new Error('Current user profile not found');
      }
      const currentUser = currentUserSnap.data() as UserProfile;
      
      // Get target user profile
      const targetUserRef = doc(db, 'users', targetUserUid);
      const targetUserSnap = await getDoc(targetUserRef);
      if (!targetUserSnap.exists()) {
        throw new Error('Target user profile not found');
      }
      const targetUser = targetUserSnap.data() as UserProfile;
      
      // Remove target user from current user's following map
      const currentUserFollowing = currentUser.following || {};
      
      if (currentUserFollowing[targetUserUid]) {
        const updatedFollowing = { ...currentUserFollowing };
        delete updatedFollowing[targetUserUid];
        
        await updateDoc(currentUserRef, {
          following: updatedFollowing,
          followingCount: increment(-1)
        });
      }
      
      // Remove current user from target user's followers map
      const targetUserFollowers = targetUser.followers || {};
      
      if (targetUserFollowers[currentUserUid]) {
        const updatedFollowers = { ...targetUserFollowers };
        delete updatedFollowers[currentUserUid];
        
        await updateDoc(targetUserRef, {
          followers: updatedFollowers,
          followerCount: increment(-1)
        });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Check if a user is following another user
  static async isFollowing(currentUserUid: string, targetUserUid: string): Promise<boolean> {
    try {
      const currentUserRef = doc(db, 'users', currentUserUid);
      const currentUserSnap = await getDoc(currentUserRef);
      
      if (!currentUserSnap.exists()) return false;
      
      const currentUser = currentUserSnap.data() as UserProfile;
      const following = currentUser.following || {};
      
      return !!following[targetUserUid];
    } catch (error) {
      console.error('Error checking following status:', error);
      throw error;
    }
  }

  // Get user suggestions (users not followed)
  static async getUserSuggestions(uid: string, limit: number = 5): Promise<UserProfile[]> {
    try {
      // Get user's following list
      const currentUserRef = doc(db, 'users', uid);
      const currentUserSnap = await getDoc(currentUserRef);
      
      if (!currentUserSnap.exists()) {
        throw new Error('User profile not found');
      }
      
      const currentUser = currentUserSnap.data() as UserProfile;
      const following = currentUser.following || {};
      
      // Extract UIDs from following map
      const followingUids = Object.keys(following);
      
      // Add the current user to the exclusion list
      const excludeUsers = [...followingUids, uid];
      
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
      
      // Get list of hidden suggestions
      const hiddenSuggestions = await this.getHiddenSuggestions(uid);
      
      // Filter out hidden suggestions
      const filteredSuggestions = suggestions.filter(
        user => !hiddenSuggestions.includes(user.uid)
      );
      
      // Shuffle and limit the results
      return filteredSuggestions
        .sort(() => 0.5 - Math.random())
        .slice(0, limit);
    } catch (error) {
      console.error('Error getting user suggestions:', error);
      throw error;
    }
  }
  
  // Get hidden suggestions
  static async getHiddenSuggestions(currentUserId: string): Promise<string[]> {
    try {
      const hiddenQuery = query(
        collection(db, 'hidden-suggestions'),
        where('hiddenBy', '==', currentUserId)
      );
      
      const querySnapshot = await getDocs(hiddenQuery);
      return querySnapshot.docs.map(doc => doc.data().userId);
    } catch (error) {
      console.error('Error getting hidden suggestions:', error);
      return [];
    }
  }
  
  // Remove a user from suggestions
  static async removeUserSuggestion(userId: string, currentUserId: string): Promise<void> {
    try {
      const hiddenRef = doc(db, 'hidden-suggestions', `${currentUserId}_${userId}`);
      await setDoc(hiddenRef, {
        userId,
        hiddenBy: currentUserId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error removing user suggestion:', error);
      throw error;
    }
  }
}