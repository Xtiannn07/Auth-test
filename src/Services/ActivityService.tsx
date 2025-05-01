// src/Services/ActivityService.tsx
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  orderBy, 
  limit,
  getDocs,
  serverTimestamp,
  getDoc,
  doc,
  deleteDoc,
  DocumentReference,
  setDoc
} from 'firebase/firestore';
import { db } from './Firebase';

export interface Activity {
  id?: string;
  type: 'like' | 'comment' | 'repost' | 'follow';
  senderId: string;
  senderName: string;
  senderPhotoURL?: string;
  recipientId: string;
  createdAt: any;
  postId?: string;
  postTitle?: string;
  commentText?: string;
}

export const ActivityService = {
  // Create a new activity
  async createActivity(activity: Omit<Activity, 'id' | 'createdAt'>): Promise<string> {
    try {
      const activityRef = await addDoc(collection(db, 'activities'), {
        ...activity,
        createdAt: serverTimestamp()
      });
      return activityRef.id;
    } catch (error) {
      console.error('Error creating activity:', error);
      // Don't throw the error - just log it and return empty string
      // This prevents activity errors from affecting the main functionality
      return '';
    }
  },

  // Find existing activity to prevent duplicates
  async findExistingActivity(
    type: Activity['type'], 
    senderId: string, 
    recipientId: string, 
    postId?: string
  ): Promise<string | null> {
    try {
      const constraints = [
        where('type', '==', type),
        where('senderId', '==', senderId),
        where('recipientId', '==', recipientId)
      ];
      
      // Add postId constraint if it's provided (not applicable for 'follow' type)
      if (postId) {
        constraints.push(where('postId', '==', postId));
      }
      
      const activitiesQuery = query(
        collection(db, 'activities'),
        ...constraints
      );
      
      const snapshot = await getDocs(activitiesQuery);
      
      if (!snapshot.empty) {
        // Return the first matching activity ID
        return snapshot.docs[0].id;
      }
      
      return null;
    } catch (error) {
      console.error('Error finding existing activity:', error);
      return null;
    }
  },

  // Get activities for a user (where they are the recipient)
  async getUserActivities(userId: string, limitCount = 20): Promise<Activity[]> {
    try {
      const activitiesQuery = query(
        collection(db, 'activities'),
        where('recipientId', '==', userId),
        orderBy('createdAt', 'desc'),
        limit(limitCount)
      );

      const snapshot = await getDocs(activitiesQuery);
      return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Activity));
    } catch (error) {
      console.error('Error getting user activities:', error);
      return []; // Return empty array instead of throwing
    }
  },
  
  // Delete an activity by ID
  async deleteActivity(activityId: string): Promise<boolean> {
    try {
      const activityRef = doc(db, 'activities', activityId);
      await deleteDoc(activityRef);
      return true;
    } catch (error) {
      console.error('Error deleting activity:', error);
      return false;
    }
  },

  // Create or delete like activity based on action
  async toggleLikeActivity(
    senderId: string, 
    senderName: string, 
    recipientId: string, 
    postId: string, 
    isLiking: boolean, 
    senderPhotoURL?: string
  ): Promise<void> {
    try {
      // Check if like activity already exists
      const existingActivityId = await this.findExistingActivity('like', senderId, recipientId, postId);
      
      // If liking and no existing activity, create one
      if (isLiking && !existingActivityId) {
        // Get post title for context
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        const postData = postDoc.data();

        await this.createActivity({
          type: 'like',
          senderId,
          senderName,
          senderPhotoURL,
          recipientId,
          postId,
          postTitle: postData?.title
        });
      } 
      // If unliking and existing activity exists, delete it
      else if (!isLiking && existingActivityId) {
        await this.deleteActivity(existingActivityId);
      }
      // Otherwise do nothing (no duplicate needed or no activity to remove)
    } catch (error) {
      console.error('Error toggling like activity:', error);
    }
  },

  // Create a comment activity - with error swallowing
  async createCommentActivity(senderId: string, senderName: string, recipientId: string, postId: string, commentText: string, senderPhotoURL?: string): Promise<void> {
    try {
      // Comments are unique events, so we don't need to check for duplicates
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      const postData = postDoc.data();

      await this.createActivity({
        type: 'comment',
        senderId,
        senderName,
        senderPhotoURL,
        recipientId,
        postId,
        postTitle: postData?.title,
        commentText
      });
    } catch (error) {
      console.error('Error creating comment activity:', error);
      // Don't throw - just log
    }
  },

  // Create a repost activity only if it doesn't already exist
  async createRepostActivity(senderId: string, senderName: string, recipientId: string, postId: string, senderPhotoURL?: string): Promise<void> {
    try {
      // Check if repost activity already exists
      const existingActivityId = await this.findExistingActivity('repost', senderId, recipientId, postId);
      
      // Only create if doesn't exist already
      if (!existingActivityId) {
        const postRef = doc(db, 'posts', postId);
        const postDoc = await getDoc(postRef);
        const postData = postDoc.data();

        await this.createActivity({
          type: 'repost',
          senderId,
          senderName,
          senderPhotoURL,
          recipientId,
          postId,
          postTitle: postData?.title
        });
      }
    } catch (error) {
      console.error('Error creating repost activity:', error);
      // Don't throw - just log
    }
  },

  // Create a follow activity only if it doesn't already exist
  async createFollowActivity(senderId: string, senderName: string, recipientId: string, senderPhotoURL?: string): Promise<void> {
    try {
      // Check if follow activity already exists
      const existingActivityId = await this.findExistingActivity('follow', senderId, recipientId);
      
      // Only create if doesn't exist already
      if (!existingActivityId) {
        await this.createActivity({
          type: 'follow',
          senderId,
          senderName,
          senderPhotoURL,
          recipientId
        });
      }
    } catch (error) {
      console.error('Error creating follow activity:', error);
      // Don't throw - just log
    }
  },
  
  // Remove follow activity when unfollowing
  async removeFollowActivity(senderId: string, recipientId: string): Promise<void> {
    try {
      const existingActivityId = await this.findExistingActivity('follow', senderId, recipientId);
      
      if (existingActivityId) {
        await this.deleteActivity(existingActivityId);
      }
    } catch (error) {
      console.error('Error removing follow activity:', error);
    }
  }
};