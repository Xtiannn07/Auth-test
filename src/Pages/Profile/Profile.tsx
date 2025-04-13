// src/Pages/Profile/Profile.tsx - FIXED VERSION
import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { useLoading } from '../../Contexts/LoadingContext';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import AuthenticatedLayout from '../Layout';
import ProfileHeader from './Header';
import ProfileContent from './ProfileContent';
import ErrorScreen from '../../Components/UI/ErrorScreen';
import SuccessToast from '../../Components/UI/SuccessToast';

interface UserData {
  uid: string;
  displayName: string;
  username: string;
  email: string;
  bio: string;
  website: string;
  followerCount: number;
  followingCount: number;
  postCount: number;
  profilePicture: string;
  coverPhoto: string | null;
}

export default function ProfilePage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState<UserData | null>(null);
  const { startLoading, stopLoading, resetLoading } = useLoading();
  const { currentUser } = useAuth();

  // Wrap fetchUserData with useCallback to avoid recreating it on each render
  const fetchUserData = useCallback(async () => {
    if (!currentUser) {
      return;
    }
    
    try {
      startLoading('Loading your profile...');
      
      // Minimum 500ms loading time to prevent flickering
      const [_, userDoc] = await Promise.all([
        new Promise(resolve => setTimeout(resolve, 500)),
        getDoc(doc(db, 'users', currentUser.uid))
      ]);
      
      if (userDoc.exists()) {
        setUserData({
          uid: currentUser.uid,
          displayName: currentUser.displayName || userDoc.data().displayName || currentUser.email.split('@')[0],
          username: userDoc.data().username || currentUser.email.split('@')[0],
          email: currentUser.email,
          bio: userDoc.data().bio || '',
          website: userDoc.data().website || '',
          followerCount: userDoc.data().followerCount || 0,
          followingCount: userDoc.data().followingCount || 0,
          postCount: userDoc.data().postCount || 0,
          profilePicture: currentUser.photoURL || userDoc.data().profilePicture || './user.svg',
          coverPhoto: userDoc.data().coverPhoto || null
        });
      } else {
        setUserData({
          uid: currentUser.uid,
          displayName: currentUser.displayName || currentUser.email.split('@')[0],
          username: currentUser.email.split('@')[0],
          email: currentUser.email,
          bio: '',
          website: '',
          followerCount: 0,
          followingCount: 0,
          postCount: 0,
          profilePicture: currentUser.photoURL || './user.svg',
          coverPhoto: null
        });
      }
    } catch (err) {
      console.error("Error loading profile:", err);
      setError('Failed to load profile data. Please try again.');
      // Make sure to reset loading state on error
      resetLoading();
    } finally {
      stopLoading(); // This ensures stopLoading is always called
    }
  }, [currentUser, startLoading, stopLoading, resetLoading]);

  useEffect(() => {
    fetchUserData();
    
    // Cleanup function to ensure loading state is reset when component unmounts
    return () => {
      resetLoading();
    };
  }, [fetchUserData, resetLoading]);

  const handleLogout = () => {
    // Implement your logout logic here
    console.log('User logged out');
  };

  const handleSuccess = (message: string) => {
    setSuccess(message);
    setTimeout(() => setSuccess(''), 3000);
  };

  const handleError = (message: string) => {
    setError(message);
  };

  const handleRetry = () => {
    setError('');
    fetchUserData();
  };

  if (error) {
    return (
      <AuthenticatedLayout
        topNavProps={{ 
          username: userData?.username || 'Error', 
          onLogout: handleLogout 
        }}
      >
        <div className="p-4">
          <ErrorScreen 
            message={error} 
            onRetry={handleRetry} 
          />
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout
      topNavProps={{ 
        username: userData?.username || 'Profile', 
        onLogout: handleLogout 
      }}
    >
      <div className="pb-16"> {/* Padding for bottom navigation */}
        {success && <SuccessToast message={success} onDismiss={() => setSuccess('')} />}
        
        {userData && (
          <>
            <ProfileHeader 
              currentUser={currentUser}
              userData={userData}
              onLogout={handleLogout}
              onSuccess={handleSuccess}
              onError={handleError}
            />
            
            <ProfileContent 
              userData={userData} 
              onUpdateSuccess={handleSuccess}
              onUpdateError={handleError}
            />
          </>
        )}
      </div>
    </AuthenticatedLayout>
  );
}