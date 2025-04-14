import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { useLoading } from '../../Contexts/LoadingContext';
import AuthenticatedLayout from '../Layout';
import PostCard from '../../Components/UI/PostCard';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { Link } from 'react-router-dom';

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
}

export default function HomePage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [error, setError] = useState('');
  const { startLoading, stopLoading, resetLoading } = useLoading();
  const { currentUser } = useAuth();

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

  const setupPostsListener = useCallback(() => {
    startLoading('Loading posts...');
    
    const postsQuery = query(
      collection(db, 'posts'),
      orderBy('createdAt', 'desc')
    );
    
    const unsubscribe = onSnapshot(postsQuery, 
      (querySnapshot) => {
        const postsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as Post[];
        
        setPosts(postsData);
        stopLoading();
      },
      (error) => {
        console.error("Error loading posts:", error);
        setError('Failed to load posts');
        stopLoading();
      }
    );
    
    return unsubscribe;
  }, [startLoading, stopLoading]);

  useEffect(() => {
    fetchUserData();
    const unsubscribe = setupPostsListener();
    
    return () => {
      unsubscribe();
      resetLoading();
    };
  }, [fetchUserData, setupPostsListener, resetLoading]);

  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out');
  };

  const handleRetry = () => {
    setError('');
    fetchUserData();
    setupPostsListener();
  };

  const handleLikeUpdate = () => {
    // This will trigger a refresh of the posts through the listener
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
        
        <div className="space-y-4">
          {posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLikeUpdate={handleLikeUpdate}
              />
            ))
          ) : (
            <div className="text-center py-8 text-gray-500">
              No posts found. Be the first to create one!
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}