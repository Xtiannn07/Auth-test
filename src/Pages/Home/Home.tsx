// src/Pages/Home.tsx
import { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { useLoading } from '../../Contexts/LoadingContext';
import AuthenticatedLayout from '../Layout';
import PostCard from '../PostComponents/PostCard';
import { collection, query, orderBy, onSnapshot, limit, startAfter, getDocs } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface UserData {
  username: string;
  uid: string;
}

interface Post {
  id: string;
  title: string;
  content: string;
  author: {
    id: string;
    name: string;
  };
  createdAt: any;
  likes: string[];
  savedBy?: string[];
  reposts?: number;
  comments?: any[];
}

const POSTS_PER_PAGE = 5;

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const [loadingMore, setLoadingMore] = useState(false);
  const [lastVisible, setLastVisible] = useState<any>(null);
  const [hasMore, setHasMore] = useState(true);
  const { startLoading, stopLoading, resetLoading } = useLoading();
  const { currentUser } = useAuth();
  
  // For intersection observer
  const loaderRef = useRef<HTMLDivElement>(null);
  
  const fetchUserData = useCallback(async () => {
    try {
      if (!currentUser) return;
      
      startLoading('Loading your data...');
      
      // Simulate API call - replace with your actual data fetching
      await new Promise(resolve => setTimeout(resolve, 500));
      
      setUserData({
        username: currentUser.email?.split('@')[0] || 'User',
        uid: currentUser.uid,
      });
    } catch (err) {
      console.error("Error loading data:", err);
      setError('Failed to load user data');
      resetLoading();
    } finally {
      stopLoading();
    }
  }, [currentUser, startLoading, stopLoading, resetLoading]);

  const initializePosts = useCallback(async () => {
    try {
      startLoading('Loading posts...');
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        limit(POSTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const postsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      
      setPosts(postsData);
      
      // Get the last visible document
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === POSTS_PER_PAGE);
      
    } catch (err) {
      console.error("Error loading posts:", err);
      setError('Failed to load posts');
    } finally {
      stopLoading();
    }
  }, [startLoading, stopLoading]);
  
  const loadMorePosts = useCallback(async () => {
    if (!hasMore || loadingMore || !lastVisible) return;
    
    try {
      setLoadingMore(true);
      
      const postsRef = collection(db, 'posts');
      const q = query(
        postsRef,
        orderBy('createdAt', 'desc'),
        startAfter(lastVisible),
        limit(POSTS_PER_PAGE)
      );
      
      const querySnapshot = await getDocs(q);
      const newPostsData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Post[];
      
      setPosts(prevPosts => [...prevPosts, ...newPostsData]);
      
      // Update the last visible document
      const lastDoc = querySnapshot.docs[querySnapshot.docs.length - 1];
      setLastVisible(lastDoc);
      setHasMore(querySnapshot.docs.length === POSTS_PER_PAGE);
      
    } catch (err) {
      console.error("Error loading more posts:", err);
    } finally {
      setLoadingMore(false);
    }
  }, [hasMore, lastVisible, loadingMore]);
  
  // Set up post updates listener - OPTIMIZED to reduce unnecessary fetches
useEffect(() => {
  let unsubscribe: () => void;
  
  const setupListener = async () => {
    // First get the initial batch of posts
    const initialQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc'),
      limit(POSTS_PER_PAGE)
    );
    
    const initialSnapshot = await getDocs(initialQuery);
    const initialPosts = initialSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
    })) as Post[];
    
    setPosts(initialPosts);
    setLastVisible(initialSnapshot.docs[initialSnapshot.docs.length - 1]);
    setHasMore(initialSnapshot.docs.length === POSTS_PER_PAGE);
    
    // Then set up the real-time listener for changes
    unsubscribe = onSnapshot(
      query(collection(db, 'posts'), orderBy('createdAt', 'desc')),
      (snapshot) => {
        snapshot.docChanges().forEach((change) => {
          const changedPost = { id: change.doc.id, ...change.doc.data() } as Post;
          
          setPosts(prevPosts => {
            // Handle modifications
            if (change.type === 'modified') {
              return prevPosts.map(post => 
                post.id === change.doc.id ? changedPost : post
              );
            }
            // Handle additions (only if not already in the list)
            if (change.type === 'added') {
              const exists = prevPosts.some(p => p.id === changedPost.id);
              if (!exists) {
                return [changedPost, ...prevPosts];
              }
            }
            // Handle deletions
            if (change.type === 'removed') {
              return prevPosts.filter(post => post.id !== change.doc.id);
            }
            return prevPosts;
          });
        });
      },
      (error) => {
        console.error("Error in posts listener:", error);
      }
    );
  };

  setupListener();
  
  return () => {
    if (unsubscribe) unsubscribe();
  };
}, []); // Remove dependency on posts to prevent re-creating the listener
  
  // Initialize intersection observer for infinite scrolling
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loadingMore) {
          loadMorePosts();
        }
      },
      { threshold: 0.5 }
    );
    
    if (loaderRef.current) {
      observer.observe(loaderRef.current);
    }
    
    return () => {
      if (loaderRef.current) {
        observer.unobserve(loaderRef.current);
      }
    };
  }, [hasMore, loadMorePosts, loadingMore]);
  
  useEffect(() => {
    fetchUserData();
    initializePosts();
    
    return () => {
      resetLoading();
    };
  }, [fetchUserData, initializePosts, resetLoading]);

  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out');
  };

  const handleRetry = () => {
    setError('');
    fetchUserData();
    initializePosts();
  };

  const handleLikeUpdate = () => {
    // No need to do anything as the listener will handle updates
  };
  
  const handleDeletePost = (postId: string) => {
    // The listener will handle the removal, but we can optimize by removing it immediately
    setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
  };

  if (error) {
    return (
      <AuthenticatedLayout
        topNavProps={{ username: 'Error', onLogout: handleLogout }}
      >
        <div className="p-4">
          <div className="text-red-500">{error}</div>
          <button 
            onClick={handleRetry}
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      topNavProps={{ 
        username: userData?.username || 'Loading...', 
        onLogout: handleLogout 
      }}
    >
      <div className="p-4 max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">
            Welcome, {userData?.username || 'User'}!
          </h1>
          <Link 
            to="/post/create" 
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Create Post
          </Link>
        </div>
        
        <AnimatePresence>
          <div className="space-y-4">
            {posts.length > 0 ? (
              posts.map(post => (
                <PostCard 
                  key={post.id} 
                  post={post} 
                  onLikeUpdate={handleLikeUpdate}
                  onDeletePost={handleDeletePost}
                  currentUser={currentUser}
                />
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">
                No posts found. Be the first to create one!
              </div>
            )}
            
            {/* Loader for infinite scrolling */}
            {hasMore && (
              <div ref={loaderRef} className="py-4 text-center">
                {loadingMore ? (
                  <div className="flex justify-center items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                ) : (
                  <span className="text-gray-400">Scroll for more</span>
                )}
              </div>
            )}
          </div>
        </AnimatePresence>
      </div>
    </AuthenticatedLayout>
  );
}