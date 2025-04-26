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
    doc
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
  
    // Create a like activity - with error swallowing
    async createLikeActivity(senderId: string, senderName: string, recipientId: string, postId: string, senderPhotoURL?: string): Promise<void> {
      try {
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
      } catch (error) {
        console.error('Error creating like activity:', error);
        // Don't throw - just log
      }
    },
  
    // Create a comment activity - with error swallowing
    async createCommentActivity(senderId: string, senderName: string, recipientId: string, postId: string, commentText: string, senderPhotoURL?: string): Promise<void> {
      try {
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
  
    // Create a repost activity - with error swallowing
    async createRepostActivity(senderId: string, senderName: string, recipientId: string, postId: string, senderPhotoURL?: string): Promise<void> {
      try {
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
      } catch (error) {
        console.error('Error creating repost activity:', error);
        // Don't throw - just log
      }
    },
  
    // Create a follow activity - with error swallowing
    async createFollowActivity(senderId: string, senderName: string, recipientId: string, senderPhotoURL?: string): Promise<void> {
      try {
        await this.createActivity({
          type: 'follow',
          senderId,
          senderName,
          senderPhotoURL,
          recipientId
        });
      } catch (error) {
        console.error('Error creating follow activity:', error);
        // Don't throw - just log
      }
    }
  };