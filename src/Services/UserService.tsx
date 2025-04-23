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
  runTransaction,
  deleteDoc
} from 'firebase/firestore';
import { db } from './Firebase';

export interface UserProfile {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  photoURL?: string;
  bio?: string;
  // Removed followers and following maps and counts from user document
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

  // Follow a user - updated to use following and followers collections with username maps
  static async followUser(currentUserUid: string, targetUserUid: string): Promise<boolean> {
    try {
      if (!currentUserUid || !targetUserUid) {
        console.error('Invalid user IDs for following');
        return false;
      }

      // Get both users' profiles to access their usernames
      const [currentUser, targetUser] = await Promise.all([
        this.getUserProfile(currentUserUid),
        this.getUserProfile(targetUserUid)
      ]);

      const followingRef = doc(db, 'following', currentUserUid);
      const followersRef = doc(db, 'followers', targetUserUid);

      // Add target user to current user's following subcollection
      const followingUsersRef = collection(followingRef, 'users');
      // Add current user to target user's followers subcollection
      const followersUsersRef = collection(followersRef, 'users');

      // Use transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        const followingDoc = doc(followingUsersRef, targetUserUid);
        const followersDoc = doc(followersUsersRef, currentUserUid);

        transaction.set(followingDoc, { 
          username: targetUser.username,
          displayName: targetUser.displayName,
          photoURL: targetUser.photoURL || '',
          timestamp: new Date().toISOString()
        });
        
        transaction.set(followersDoc, { 
          username: currentUser.username,
          displayName: currentUser.displayName,
          photoURL: currentUser.photoURL || '',
          timestamp: new Date().toISOString()
        });
      });

      return true;
    } catch (error) {
      console.error('Error following user:', error);
      return false;
    }
  }

  // Unfollow a user - updated to use following and followers collections
  static async unfollowUser(currentUserUid: string, targetUserUid: string): Promise<void> {
    try {
      const followingRef = doc(db, 'following', currentUserUid);
      const followersRef = doc(db, 'followers', targetUserUid);

      const followingUsersRef = collection(followingRef, 'users');
      const followersUsersRef = collection(followersRef, 'users');

      const followingDoc = doc(followingUsersRef, targetUserUid);
      const followersDoc = doc(followersUsersRef, currentUserUid);

      // Use transaction to ensure atomicity
      await runTransaction(db, async (transaction) => {
        transaction.delete(followingDoc);
        transaction.delete(followersDoc);
      });
    } catch (error) {
      console.error('Error unfollowing user:', error);
      throw error;
    }
  }

  // Check if a user is following another user - updated to use following collection
  static async isFollowing(currentUserUid: string, targetUserUid: string): Promise<boolean> {
    try {
      const followingUsersRef = collection(db, 'following', currentUserUid, 'users');
      const followingDoc = doc(followingUsersRef, targetUserUid);
      const followingSnap = await getDoc(followingDoc);
      return followingSnap.exists();
    } catch (error) {
      console.error('Error checking following status:', error);
      return false;
    }
  }

  // Get follower count from followers collection
  static async getFollowerCount(userUid: string): Promise<number> {
    try {
      const followersUsersRef = collection(db, 'followers', userUid, 'users');
      const snapshot = await getDocs(followersUsersRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting follower count:', error);
      return 0;
    }
  }

  // Get following count from following collection
  static async getFollowingCount(userUid: string): Promise<number> {
    try {
      const followingUsersRef = collection(db, 'following', userUid, 'users');
      const snapshot = await getDocs(followingUsersRef);
      return snapshot.size;
    } catch (error) {
      console.error('Error getting following count:', error);
      return 0;
    }
  }

  // Get followers list from followers collection
  static async getFollowers(userUid: string): Promise<UserProfile[]> {
    try {
      const followersUsersRef = collection(db, 'followers', userUid, 'users');
      const snapshot = await getDocs(followersUsersRef);
      const followers: UserProfile[] = [];
      
      for (const docSnap of snapshot.docs) {
        const followerUid = docSnap.id;
        try {
          const userProfile = await this.getUserProfile(followerUid);
          followers.push(userProfile);
        } catch (error) {
          console.error(`Error getting follower profile for ${followerUid}:`, error);
          // Continue with other followers
        }
      }
      
      return followers;
    } catch (error) {
      console.error('Error getting followers:', error);
      return [];
    }
  }

  // Get following list from following collection
  static async getFollowing(userUid: string): Promise<UserProfile[]> {
    try {
      const followingUsersRef = collection(db, 'following', userUid, 'users');
      const snapshot = await getDocs(followingUsersRef);
      const following: UserProfile[] = [];
      
      for (const docSnap of snapshot.docs) {
        const followingUid = docSnap.id;
        try {
          const userProfile = await this.getUserProfile(followingUid);
          following.push(userProfile);
        } catch (error) {
          console.error(`Error getting following profile for ${followingUid}:`, error);
          // Continue with other followed users
        }
      }
      
      return following;
    } catch (error) {
      console.error('Error getting following:', error);
      return [];
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

  // Get user suggestions (users not followed)
  static async getUserSuggestions(uid: string, limit: number = 5): Promise<UserProfile[]> {
    try {
      // Get user's following list
      const followingUsersRef = collection(db, 'following', uid, 'users');
      const followingSnap = await getDocs(followingUsersRef);
      const followingUids = followingSnap.docs.map(doc => doc.id);

      // Add the current user to the exclusion list
      const excludeUsers = [...followingUids, uid];
      
      // Query for users ordered by creation date (newest first)
      const usersRef = collection(db, 'users');
      const usersQuery = query(
        usersRef,
        orderBy('createdAt', 'desc')  // Order by creation date, newest first
      );
      const usersSnap = await getDocs(usersQuery);
      
      const suggestions: UserProfile[] = [];
      
      // First pass: collect new users (created in the last 7 days)
      const sevenDaysAgo = new Date();
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
      
      usersSnap.forEach(doc => {
        const userData = doc.data() as UserProfile;
        if (!excludeUsers.includes(userData.uid)) {
          const createdAt = userData.createdAt ? new Date(userData.createdAt) : null;
          if (createdAt && createdAt > sevenDaysAgo) {
            suggestions.push({ ...userData, id: doc.id });
          }
        }
      });

      // Second pass: if we need more suggestions, add other users
      if (suggestions.length < limit) {
        usersSnap.forEach(doc => {
          const userData = doc.data() as UserProfile;
          const createdAt = userData.createdAt ? new Date(userData.createdAt) : null;
          if (!excludeUsers.includes(userData.uid) && 
              !suggestions.find(s => s.id === doc.id) &&
              (!createdAt || createdAt <= sevenDaysAgo)) {
            suggestions.push({ ...userData, id: doc.id });
          }
        });
      }

      // Get hidden suggestions
      const hiddenSuggestions = await this.getHiddenSuggestions(uid);
      
      // Filter out hidden suggestions
      const filteredSuggestions = suggestions.filter(
        user => !hiddenSuggestions.includes(user.uid)
      );
      
      // Return limited results
      return filteredSuggestions.slice(0, limit);
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