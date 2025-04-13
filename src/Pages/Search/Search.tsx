// src/Pages/Search/Search.tsx
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { useLoading } from '../../Contexts/LoadingContext';
import AuthenticatedLayout from '../Layout';

interface UserData {
  username: string;
  // Add other user properties as needed
}

export default function SearchPage() {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [error, setError] = useState('');
  const { startLoading, stopLoading, resetLoading } = useLoading();
  const { currentUser } = useAuth();

  const fetchUserData = useCallback(async () => {
    try {
      if (!currentUser) return;
      
      startLoading('Loading your data...');
      
      // Simulate API call - replace with your actual data fetching
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setUserData({
        username: currentUser.email?.split('@')[0] || 'User',
        // Add other user properties here
      });
    } catch (err) {
      console.error("Error loading data:", err);
      setError('Failed to load user data');
      resetLoading(); // Reset loading state on error
    } finally {
      stopLoading();
    }
  }, [currentUser, startLoading, stopLoading, resetLoading]);

  useEffect(() => {
    fetchUserData();
    
    // Cleanup function to reset loading state when component unmounts
    return () => {
      resetLoading();
    };
  }, [fetchUserData, resetLoading]);

  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out');
  };

  const handleRetry = () => {
    setError('');
    fetchUserData();
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
            className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
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
      <div className="p-4">
        <h1 className="text-2xl font-bold mb-4">
          Search, {userData?.username || 'User'}!
        </h1>
        {/* Add your homepage content here */}
      </div>
    </AuthenticatedLayout>
  );
}