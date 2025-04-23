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
  addDoc, 
  deleteDoc, 
  getDoc,
  setDoc,
  serverTimestamp,
  onSnapshot
} from 'firebase/firestore';
import { db } from './Firebase';

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

export const PostService = {
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
      const allPosts = querySnapshot.docs.map(doc => ({ 
        id: doc.id, 
        ...doc.data() 
      }));
      
      // Filter posts by followed users and return only first 20
      return allPosts
        .filter((post: any) => followingIds.includes(post.author?.id))
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
      return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  },

  async fetchUserSuggestions(currentUserId: string) {
    const followingQuery = query(
      collection(db, 'following'),
      where('followerId', '==', currentUserId)
    );
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    followingIds.push(currentUserId);
    
    const usersQuery = query(collection(db, 'users'), limit(10));
    const usersSnapshot = await getDocs(usersQuery);
    const users = usersSnapshot.docs
      .filter(doc => !followingIds.includes(doc.id))
      .map(doc => ({ id: doc.id, ...doc.data() }));
    
    return users.slice(0, 5);
  },

  // === LIKES FUNCTIONALITY ===
  
  // Add a like to a post
  async likePost(postId: string, userId: string, displayName: string) {
    const likeRef = doc(db, `posts/${postId}/likes/${userId}`);
    await setDoc(likeRef, {
      userId,
      displayName,
      timestamp: serverTimestamp()
    });
    
    // Also update the count in the main post document for efficiency
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likeCount: increment(1)
    });
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
    
    const commentRef = await addDoc(collection(db, `posts/${postId}/comments`), comment);
    
    // Also update the count in the main post document
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      commentCount: increment(1)
    });
    
    return {
      id: commentRef.id,
      ...comment
    };
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
    // Get the original post to save metadata
    const postRef = doc(db, 'posts', postId);
    const postDoc = await getDoc(postRef);
    
    if (!postDoc.exists()) {
      throw new Error('Post not found');
    }
    
    const postData = postDoc.data();
    
    // Create repost in reposts collection
    const repost = {
      originalPostId: postId,
      repostedBy: userId,
      repostedAt: serverTimestamp(),
      originalAuthor: postData.author
    };
    
    const repostRef = await addDoc(collection(db, 'reposts'), repost);
    
    // Also add to user's reposts subcollection
    await setDoc(doc(db, `users/${userId}/reposts/${repostRef.id}`), repost);
    
    // Update repost count on original post
    await updateDoc(postRef, {
      repostCount: increment(1)
    });
    
    return {
      id: repostRef.id,
      ...repost
    };
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