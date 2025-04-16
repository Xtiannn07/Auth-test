// src/Services/PostService.ts
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from './Firebase';

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
        orderBy('likes', 'desc'),
        limit(20)
      );
    } else if (filter === 'following' && currentUserId) {
      const followingQuery = query(
        collection(db, 'following'), 
        where('followerId', '==', currentUserId)
      );
      const followingSnapshot = await getDocs(followingQuery);
      const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
      
      if (followingIds.length === 0) return [];
      
      postsQuery = query(
        collection(db, 'posts'), 
        where('userId', 'in', followingIds),
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    } else {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    }
    
    const querySnapshot = await getDocs(postsQuery);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
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

  async likePost(postId: string, userId: string) {
    const postRef = doc(db, 'posts', postId);
    await updateDoc(postRef, {
      likes: increment(1)
    });
    
    const likeRef = doc(db, 'user-likes', `${userId}_${postId}`);
    await updateDoc(likeRef, {
      userId,
      postId,
      createdAt: new Date()
    });
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