// src/Services/UserService.ts
import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc, 
    query, 
    where, 
    getDocs, 
    increment,
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
    createdAt: Date;
    updatedAt?: Date;
    followerCount?: number;
    followingCount?: number;
  }
  
  export const UserService = {
    // Create a new user profile in Firestore
    async createUserProfile(uid: string, data: Partial<UserProfile>): Promise<UserProfile> {
      try {
        console.log('Creating user profile for:', uid, data);
        const userRef = doc(db, 'users', uid);
        
        // Generate a unique username if not provided
        let username = data.username;
        if (!username) {
          username = data.email?.split('@')[0] || uid.slice(0, 8);
          // Check if username exists and make unique if needed
          let isAvailable = await this.isUsernameAvailable(username);
          let counter = 1;
          while (!isAvailable) {
            const newUsername = `${username}${counter}`;
            isAvailable = await this.isUsernameAvailable(newUsername);
            if (isAvailable) {
              username = newUsername;
            }
            counter++;
          }
        }
        
        const profileData: UserProfile = {
          uid,
          displayName: data.displayName || username || 'User',
          username,
          email: data.email || '',
          photoURL: data.photoURL || null,
          bio: data.bio || '',
          createdAt: new Date(),
          updatedAt: new Date(),
          followerCount: 0,
          followingCount: 0,
          ...data
        };
        
        await setDoc(userRef, profileData);
        console.log('User profile created successfully');
        return profileData;
      } catch (error) {
        console.error("Error creating user profile:", error);
        throw error;
      }
    },
    
    // Get user profile from Firestore
    async getUserProfile(uid: string): Promise<UserProfile | null> {
      try {
        const userRef = doc(db, 'users', uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          return userDoc.data() as UserProfile;
        }
        return null;
      } catch (error) {
        console.error("Error getting user profile:", error);
        throw error;
      }
    },
    
    // Update a user's profile information
    async updateUserProfile(uid: string, updates: Partial<UserProfile>): Promise<UserProfile> {
      try {
        const userRef = doc(db, 'users', uid);
        
        // Check if username is being updated and is available
        if (updates.username) {
          const isAvailable = await this.isUsernameAvailable(updates.username, uid);
          if (!isAvailable) {
            throw new Error('Username is already taken');
          }
        }
        
        const updateData = {
          ...updates,
          updatedAt: new Date()
        };
        
        await updateDoc(userRef, updateData);
        
        // Get the updated profile
        const updatedProfile = await this.getUserProfile(uid);
        if (!updatedProfile) {
          throw new Error('Failed to retrieve updated profile');
        }
        
        return updatedProfile;
      } catch (error) {
        console.error("Error updating user profile:", error);
        throw error;
      }
    },
    
    // Check if a username is available
    async isUsernameAvailable(username: string, currentUserId?: string): Promise<boolean> {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        // Username is available if no user has it, or if only the current user has it
        return querySnapshot.empty || 
               (querySnapshot.size === 1 && querySnapshot.docs[0].id === currentUserId);
      } catch (error) {
        console.error("Error checking username availability:", error);
        throw error;
      }
    },
  
    // Get user by username
    async getUserByUsername(username: string): Promise<UserProfile | null> {
      try {
        const usersQuery = query(
          collection(db, 'users'),
          where('username', '==', username)
        );
        
        const querySnapshot = await getDocs(usersQuery);
        
        if (!querySnapshot.empty) {
          const userDoc = querySnapshot.docs[0];
          return userDoc.data() as UserProfile;
        }
        
        return null;
      } catch (error) {
        console.error("Error getting user by username:", error);
        throw error;
      }
    },
  
    // Follow a user
    async followUser(followerId: string, followingId: string): Promise<void> {
      try {
        // Check if already following
        const isAlreadyFollowing = await this.isFollowing(followerId, followingId);
        if (isAlreadyFollowing) return;
        
        const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
        
        await setDoc(followingRef, {
          followerId,
          followingId,
          createdAt: new Date()
        });
  
        // Update follower/following counts
        const followerRef = doc(db, 'users', followingId);
        const followingUserRef = doc(db, 'users', followerId);
  
        await updateDoc(followerRef, {
          followerCount: increment(1)
        });
  
        await updateDoc(followingUserRef, {
          followingCount: increment(1)
        });
      } catch (error) {
        console.error("Error following user:", error);
        throw error;
      }
    },
  
    // Unfollow a user
    async unfollowUser(followerId: string, followingId: string): Promise<void> {
      try {
        // Check if actually following
        const isFollowing = await this.isFollowing(followerId, followingId);
        if (!isFollowing) return;
        
        const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
        await deleteDoc(followingRef);
  
        // Update follower/following counts
        const followerRef = doc(db, 'users', followingId);
        const followingUserRef = doc(db, 'users', followerId);
  
        await updateDoc(followerRef, {
          followerCount: increment(-1)
        });
  
        await updateDoc(followingUserRef, {
          followingCount: increment(-1)
        });
      } catch (error) {
        console.error("Error unfollowing user:", error);
        throw error;
      }
    },
  
    // Check if a user is following another user
    async isFollowing(followerId: string, followingId: string): Promise<boolean> {
      try {
        const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
        const followDoc = await getDoc(followingRef);
        return followDoc.exists();
      } catch (error) {
        console.error("Error checking follow status:", error);
        throw error;
      }
    },
  
    // Get suggested users (users not followed by current user)
    async getSuggestedUsers(currentUserId: string, limit: number = 5): Promise<UserProfile[]> {
      try {
        // Get users current user is following
        const followingQuery = query(
          collection(db, 'following'),
          where('followerId', '==', currentUserId)
        );
        const followingSnapshot = await getDocs(followingQuery);
        const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
        followingIds.push(currentUserId); // Add current user to exclude list
        
        // Get all users
        const usersSnapshot = await getDocs(collection(db, 'users'));
        
        // Filter out users that are already followed
        const suggestedUsers = usersSnapshot.docs
          .filter(doc => !followingIds.includes(doc.id))
          .map(doc => doc.data() as UserProfile);
        
        return suggestedUsers.slice(0, limit);
      } catch (error) {
        console.error("Error getting suggested users:", error);
        throw error;
      }
    },
    
    // Search users by username, displayName, or email
    async searchUsers(searchTerm: string, limit: number = 20): Promise<UserProfile[]> {
      try {
        if (!searchTerm.trim()) {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          return usersSnapshot.docs
            .map(doc => doc.data() as UserProfile)
            .slice(0, limit);
        }
        
        // Get all users (up to a reasonable number) and filter client-side
        const usersSnapshot = await getDocs(query(collection(db, 'users'), limit(100)));
        
        const searchTermLower = searchTerm.toLowerCase();
        
        return usersSnapshot.docs
          .map(doc => doc.data() as UserProfile)
          .filter(user => 
            (user.username?.toLowerCase().includes(searchTermLower)) || 
            (user.displayName?.toLowerCase().includes(searchTermLower)) ||
            (user.email?.toLowerCase().includes(searchTermLower))
          )
          .slice(0, limit);
      } catch (error) {
        console.error("Error searching users:", error);
        throw error;
      }
    }
  };