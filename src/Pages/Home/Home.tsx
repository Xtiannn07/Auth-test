// src/Pages/Home/Home.tsx
import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { collection, getDocs, query, where, orderBy, limit, doc, updateDoc, increment } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { useAuth } from '../../Contexts/AuthContexts';
import PostCard from '../../Pages/PostComponents/PostCard';
import UserSuggestion from '../UsersComponents/UserSuggestion';
import { SkeletonCard, SkeletonUser } from '../../Components/UI/Skeleton';

const HomePage = () => {
  const [activeFilter, setActiveFilter] = useState('latest');
  const { currentUser } = useAuth();
  const queryClient = useQueryClient();

  const fetchPosts = async () => {
    let postsQuery;
    
    if (activeFilter === 'latest') {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('createdAt', 'desc'),
        limit(20)
      );
    } else if (activeFilter === 'popular') {
      postsQuery = query(
        collection(db, 'posts'), 
        orderBy('likes', 'desc'),
        limit(20)
      );
    } else if (activeFilter === 'following' && currentUser) {
      const followingQuery = query(
        collection(db, 'following'), 
        where('followerId', '==', currentUser.uid)
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
    const posts = [];
    querySnapshot.forEach((doc) => {
      posts.push({ id: doc.id, ...doc.data() });
    });
    
    return posts;
  };

  const fetchSuggestions = async () => {
    if (!currentUser) return [];
    
    const followingQuery = query(
      collection(db, 'following'),
      where('followerId', '==', currentUser.uid)
    );
    const followingSnapshot = await getDocs(followingQuery);
    const followingIds = followingSnapshot.docs.map(doc => doc.data().followingId);
    followingIds.push(currentUser.uid);
    
    const usersQuery = query(collection(db, 'users'), limit(10));
    const usersSnapshot = await getDocs(usersQuery);
    const users = [];
    usersSnapshot.forEach((doc) => {
      if (!followingIds.includes(doc.id)) {
        users.push({ id: doc.id, ...doc.data() });
      }
    });
    
    return users.slice(0, 5);
  };

  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = useQuery({
    queryKey: ['posts', activeFilter],
    queryFn: fetchPosts,
    staleTime: 2 * 60 * 1000,
    enabled: !!currentUser,
  });

  const {
    data: suggestions,
    isLoading: suggestionsLoading,
  } = useQuery({
    queryKey: ['userSuggestions'],
    queryFn: fetchSuggestions,
    staleTime: 5 * 60 * 1000,
    enabled: !!currentUser,
  });

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
  };

  const handleLike = async (postId) => {
    if (!currentUser) return;
    
    queryClient.setQueryData(['posts', activeFilter], (oldData) => {
      if (!oldData) return [];
      return oldData.map(post => 
        post.id === postId ? { ...post, likes: post.likes + 1 } : post
      );
    });
    
    try {
      const postRef = doc(db, 'posts', postId);
      await updateDoc(postRef, {
        likes: increment(1)
      });
      
      const likeRef = doc(db, 'user-likes', `${currentUser.uid}_${postId}`);
      await updateDoc(likeRef, {
        userId: currentUser.uid,
        postId: postId,
        createdAt: new Date()
      });
    } catch (error) {
      console.error('Error liking post:', error);
      refetchPosts();
    }
  };

  const handleFollow = async (userId) => {
    if (!currentUser) return;
    
    try {
      const followingRef = doc(db, 'following', `${currentUser.uid}_${userId}`);
      await updateDoc(followingRef, {
        followerId: currentUser.uid,
        followingId: userId,
        createdAt: new Date()
      });
      
      queryClient.invalidateQueries({ queryKey: ['userSuggestions'] });
    } catch (error) {
      console.error('Error following user:', error);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-4">
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex space-x-4">
          <button
            onClick={() => handleFilterChange('latest')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'latest' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Latest
          </button>
          <button
            onClick={() => handleFilterChange('popular')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'popular' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Popular
          </button>
          <button
            onClick={() => handleFilterChange('following')}
            className={`px-4 py-2 rounded-full ${
              activeFilter === 'following' 
                ? 'bg-blue-500 text-white' 
                : 'bg-gray-100 hover:bg-gray-200'
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="flex-grow">
          {postsLoading ? (
            Array(3).fill(null).map((_, i) => (
              <SkeletonCard key={i} />
            ))
          ) : postsError ? (
            <div className="bg-white rounded-lg shadow p-6 text-center">
              <p className="text-red-500 mb-3">Error loading posts.</p>
              <button 
                onClick={() => refetchPosts()} 
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Try Again
              </button>
            </div>
          ) : posts && posts.length > 0 ? (
            posts.map(post => (
              <PostCard 
                key={post.id} 
                post={post} 
                onLike={() => handleLike(post.id)} 
              />
            ))
          ) : (
            <div className="bg-white rounded-lg shadow p-8 text-center">
              <h3 className="text-xl font-medium mb-2">No posts found</h3>
              <p className="text-gray-500 mb-4">
                {activeFilter === 'following' 
                  ? "Follow people to see their posts here" 
                  : "There are no posts at the moment"}
              </p>
              {activeFilter === 'following' && (
                <button 
                  onClick={() => handleFilterChange('latest')}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
                >
                  Discover Posts
                </button>
              )}
            </div>
          )}
        </div>

        <div className="w-full lg:w-80">
          <div className="bg-white rounded-lg shadow p-4 sticky top-4">
            <h3 className="font-medium mb-4 text-lg">Who to follow</h3>
            
            {suggestionsLoading ? (
              Array(3).fill(null).map((_, i) => (
                <SkeletonUser key={i} />
              ))
            ) : suggestions && suggestions.length > 0 ? (
              suggestions.map(user => (
                <UserSuggestion 
                  key={user.id} 
                  user={user} 
                  onFollow={() => handleFollow(user.id)} 
                />
              ))
            ) : (
              <p className="text-gray-500 text-center py-4">
                No suggestions available
              </p>
            )}
            
            {suggestions && suggestions.length > 0 && (
              <div className="mt-4 text-center">
                <button className="text-blue-500 hover:text-blue-700">
                  See More
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default HomePage;