// src/Services/PostService.tsx
import { 
  collection, 
  getDocs, 
  query, 
  where, 
  orderBy, 
  limit, 
  doc, 
  updateDoc, 
  increment, 
  // addDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot,
  writeBatch,
  runTransaction
} from 'firebase/firestore';
import { db } from './Firebase';
import UserService from './UserService';
import { ActivityService } from './ActivityService';

export interface PostLike {
  userId: string;
  displayName: string;
  timestamp: any;
}

export interface Comment {
  id?: string;
  postId: string;
  author: {
    uid: string;
    displayName: string;
    photoURL?: string;
  };
  text: string;
  createdAt: any;
}

export interface Repost {
  id?: string;
  originalPostId: string;
  repostedBy: string;
  repostedAt: any;
  originalAuthor?: {
    id: string;
    name: string;
  };
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
    photoURL?: string;
  };
  createdAt: any;
  likeCount: number;
  commentCount: number;
  repostCount: number;
  saveCount: number;
  likes: string[];
}

export const PostService = {
  // Helper function to normalize post data
  normalizePostData(doc: any): Post {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title || '',
      content: data.content || '',
      author: {
        id: data.author?.id || '',
        name: data.author?.name || 'Anonymous',
        photoURL: data.author?.photoURL || ''
      },
      createdAt: data.createdAt || serverTimestamp(),
      likeCount: data.likeCount || 0,
      commentCount: data.commentCount || 0,
      repostCount: data.repostCount || 0,
      saveCount: data.saveCount || 0,
      likes: data.likes || []
    };
  },

  async fetchPosts(filter: string, currentUserId?: string) {
    let postsQuery;
    
    if (filter === 'latest') {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    } else if (filter === 'popular') {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('likeCount', 'desc'),
        limit(20)
      );
    } else if (filter === 'following' && currentUserId) {
      // First get the list of users that currentUser follows
      const followingUsersRef = collection(db, 'following', currentUserId, 'users');
      const followingSnapshot = await getDocs(followingUsersRef);
      const followingIds = followingSnapshot.docs.map(doc => doc.id);
      
      if (followingIds.length === 0) return [];
      
      // First get all recent posts
      postsQuery = query(
        collection(db, 'posts'),
        orderBy('createdAt', 'desc'),
        limit(50) // Get more posts since we'll filter them
      );
      
      // Get the posts and filter them in memory
      const querySnapshot = await getDocs(postsQuery);
      const allPosts = querySnapshot.docs.map(doc => this.normalizePostData(doc));
      
      // Filter posts by followed users and return only first 20
      return allPosts
        .filter(post => followingIds.includes(post.author?.id))
        .slice(0, 20);
    } else {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }
    
    // For non-following queries, return the results directly
    if (filter !== 'following') {
      const querySnapshot = await getDocs(postsQuery);
      return querySnapshot.docs.map(doc => this.normalizePostData(doc));
    }
  },

  async fetchUserSuggestions(currentUserId: string) {
    try {
      return await UserService.getUserSuggestions(currentUserId);
    } catch (error) {
      console.error('Error fetching user suggestions:', error);
      return [];
    }
  },

  // === LIKES FUNCTIONALITY ===
  
  // Add a like to a post
  async likePost(postId: string, userId: string, displayName: string) {
    try {
      const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
      
      // Get post data for activity
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }
      const postData = postDoc.data();
      
      // Create batch operations to ensure atomicity
      const batch = writeBatch(db);
      
      // Add like
      batch.set(likeRef, {
        userId,
        displayName,
        timestamp: serverTimestamp()
      });
      
      // Update count in main post
      batch.update(postRef, {
        likeCount: increment(1)
      });
      
      // Commit transaction
      await batch.commit();
      
      // Activity creation should not block the main flow or throw errors
      // that would prevent like from succeeding
      if (postData?.author?.id !== userId) {
        try {
          // Get user profile for photo
          const userProfile = await UserService.getUserProfile(userId);
          ActivityService.createLikeActivity(
            userId,
            displayName,
            postData.author.id,
            postId,
            userProfile.photoURL
          ).catch(err => console.error('Failed to create like activity:', err));
        } catch (activityError) {
          console.error('Error preparing like activity:', activityError);
          // Don't throw - the like operation itself succeeded
        }
      }
    } catch (error) {
      console.error('Error liking post:', error);
      throw error; // Rethrow to let the UI handle it
    }
  },
  
  // Remove a like from a post
  async unlikePost(postId: string, userId: string) {
    const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
    await deleteDoc(likeRef);
    
    // Also update the count in the main post document
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likeCount: increment(-1)
    });
  },
  
  // Get likes for a post (for initial load)
  async getPostLikes(postId: string, limitCount = 10) {
    const likesQuery = query(
      collection(db, `posts/${postId}/likes`),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const likesSnapshot = await getDocs(likesQuery);
    return likesSnapshot.docs.map(doc => ({ 
      userId: doc.id,
      ...doc.data() 
    })) as PostLike[];
  },
  
  // Subscribe to likes updates (for real-time)
  subscribeToPostLikes(postId: string, limitCount = 10, callback: (likes: PostLike[]) => void) {
    const likesQuery = query(
      collection(db, `posts/${postId}/likes`),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    return onSnapshot(likesQuery, (snapshot) => {
      const likes = snapshot.docs.map(doc => ({ 
        userId: doc.id,
        ...doc.data() 
      })) as PostLike[];
      callback(likes);
    });
  },
  
  // Check if user has liked a post
  async hasUserLikedPost(postId: string, userId: string) {
    const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
    const likeDoc = await getDoc(likeRef);
    return likeDoc.exists();
  },
  
  // === COMMENTS FUNCTIONALITY ===
  
  // Add a comment to a post
  async addComment(postId: string, userId: string, displayName: string, text: string, photoURL?: string) {
    try {
      const comment = {
        postId,
        author: {
          uid: userId,
          displayName,
          photoURL
        },
        text,
        createdAt: serverTimestamp()
      };
      
      // Get post data
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }
      const postData = postDoc.data();
      
      // Use transaction to ensure atomicity
      let commentId = '';
      await runTransaction(db, async (transaction) => {
        // Create the comment
        const commentRef = doc(collection(db, `posts/${postId}/comments`));
        transaction.set(commentRef, comment);
        commentId = commentRef.id;
        
        // Update comment count
        transaction.update(postRef, {
          commentCount: increment(1)
        });
      });
      
      // Send activity notification separately (don't block main function)
      if (postData?.author?.id !== userId) {
        ActivityService.createCommentActivity(
          userId,
          displayName,
          postData.author.id,
          postId,
          text,
          photoURL
        ).catch(err => console.error('Failed to create comment activity:', err));
      }
      
      return {
        id: commentId,
        ...comment
      };
    } catch (error) {
      console.error('Error adding comment:', error);
      throw error;
    }
  },
  
  // Delete a comment
  async deleteComment(postId: string, commentId: string) {
    await deleteDoc(doc(db, `posts/${postId}/comments/${commentId}`));
    
    // Also update the count in the main post document
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(-1)
    });
  },
  
  // Get comments for a post (with pagination)
  async getPostComments(postId: string, startAfter = null, pageSize = 10) {
    let commentsQuery;
    
    if (startAfter) {
      commentsQuery = query(
        collection(db, `posts/${postId}/comments`),
        orderBy('createdAt', 'desc'),
        where('createdAt', '<', startAfter),
        limit(pageSize)
      );
    } else {
      commentsQuery = query(
        collection(db, `posts/${postId}/comments`),
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
    }
    
    const commentsSnapshot = await getDocs(commentsQuery);
    return commentsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Comment[];
  },
  
  // Subscribe to comments updates (for real-time)
  subscribeToPostComments(postId: string, callback: (comments: Comment[]) => void, pageSize = 10) {
    const commentsQuery = query(
      collection(db, `posts/${postId}/comments`),
      orderBy('createdAt', 'desc'),
      limit(pageSize)
    );
    
    return onSnapshot(commentsQuery, (snapshot) => {
      const comments = snapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      })) as Comment[];
      callback(comments);
    });
  },
  
  // === REPOSTS FUNCTIONALITY ===
  
  // Repost a post
  async repostPost(postId: string, userId: string) {
    try {
      // Get the original post
      const postRef = doc(db, 'posts', postId);
      const postDoc = await getDoc(postRef);
      
      if (!postDoc.exists()) {
        throw new Error('Post not found');
      }
      
      const postData = postDoc.data();
      
      // Get user data for activity
      const userProfile = await UserService.getUserProfile(userId);
      
      // Create repost reference before the transaction
      const repostRef = doc(collection(db, 'reposts'));
      
      // Create repost and update counts in a transaction
      await runTransaction(db, async (transaction) => {
        // Create repost
        const repostData = {
          originalPostId: postId,
          repostedBy: userId,
          repostedAt: serverTimestamp(),
          originalAuthor: postData.author
        };
        
        // Create in main collection
        transaction.set(repostRef, repostData);
        
        // Add to user's reposts subcollection
        transaction.set(doc(db, `users/${userId}/reposts/${repostRef.id}`), repostData);
        
        // Update count on original post
        transaction.update(postRef, {
          repostCount: increment(1)
        });
      });
      
      // Send activity notification (don't block)
      if (postData?.author?.id !== userId) {
        ActivityService.createRepostActivity(
          userId,
          userProfile.displayName,
          postData.author.id,
          postId,
          userProfile.photoURL
        ).catch(err => console.error('Failed to create repost activity:', err));
      }
      
      return {
        id: repostRef.id,
        originalPostId: postId,
        repostedBy: userId,
        repostedAt: new Date(),
        originalAuthor: postData.author
      };
    } catch (error) {
      console.error('Error reposting:', error);
      throw error;
    }
  },
  
  // Remove a repost
  async unrepostPost(repostId: string, userId: string, originalPostId: string) {
    // Delete from main reposts collection
    await deleteDoc(doc(db, 'reposts', repostId));
    
    // Delete from user's reposts subcollection
    await deleteDoc(doc(db, `users/${userId}/reposts/${repostId}`));
    
    // Update count on original post
    const postRef = doc(db, 'posts', originalPostId);
    await updateDoc(postRef, {
      repostCount: increment(-1)
    });
  },
  
  // Get user's reposts
  async getUserReposts(userId: string, limitCount = 20) {
    const repostsQuery = query(
      collection(db, `users/${userId}/reposts`),
      orderBy('repostedAt', 'desc'),
      limit(limitCount)
    );
    
    const repostsSnapshot = await getDocs(repostsQuery);
    return repostsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    })) as Repost[];
  },
  
  // Check if user has reposted a post
  async hasUserRepostedPost(postId: string, userId: string) {
    const repostsQuery = query(
      collection(db, `users/${userId}/reposts`),
      where('originalPostId', '==', postId),
      limit(1)
    );
    
    const repostsSnapshot = await getDocs(repostsQuery);
    return !repostsSnapshot.empty;
  },
  
  // Get repost by user and post (to get repost ID for unreposting)
  async getUserRepostOfPost(postId: string, userId: string) {
    const repostsQuery = query(
      collection(db, `users/${userId}/reposts`),
      where('originalPostId', '==', postId),
      limit(1)
    );
    
    const repostsSnapshot = await getDocs(repostsQuery);
    if (repostsSnapshot.empty) return null;
    
    const doc = repostsSnapshot.docs[0];
    return {
      id: doc.id,
      ...doc.data()
    } as Repost;
  },
  
  // === SAVES (BOOKMARKS) FUNCTIONALITY ===
  
  // Save a post
  async savePost(postId: string, userId: string) {
    // Get the post to save some metadata
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    await setDoc(doc(db, `users/${userId}/savedPosts/${postId}`), {
      postId,
      savedAt: serverTimestamp(),
      postAuthor: postData.author,
      postTitle: postData.title
    });
    
    // Also update the saved count in the post for analytics
    await updateDoc(postRef, {
      saveCount: increment(1)
    });
  },
  
  // Unsave a post
  async unsavePost(postId: string, userId: string) {
    await deleteDoc(doc(db, `users/${userId}/savedPosts/${postId}`));
    
    // Update the saved count
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      saveCount: increment(-1)
    });
  },
  
  // Get user's saved posts
  async getUserSavedPosts(userId: string, limitCount = 20) {
    const savedPostsQuery = query(
      collection(db, `users/${userId}/savedPosts`),
      orderBy('savedAt', 'desc'),
      limit(limitCount)
    );
    
    const savedPostsSnapshot = await getDocs(savedPostsQuery);
    return savedPostsSnapshot.docs.map(doc => ({ 
      id: doc.id, 
      ...doc.data() 
    }));
  },
  
  // Check if user has saved a post
  async hasUserSavedPost(postId: string, userId: string) {
    const savedPostRef = doc(db, `users/${userId}/savedPosts/${postId}`);
    const savedPostDoc = await getDoc(savedPostRef);
    return savedPostDoc.exists();
  },

  async followUser(followerId: string, followingId: string) {
    const followingRef = doc(db, 'following', `${followerId}_${followingId}`);
    await updateDoc(followingRef, {
      followerId,
      followingId,
      createdAt: new Date()
    });
  }
};