// ProfilePage.jsx
import { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import TopNavigation from "../../Components/Navigation/TopNavigation";
import BottomNavigation from "../../Components/Navigation/BottomNavigation";
import ProfileHeader from './Header';
import ProfileContent from './ProfileContent';
import LoadingScreen from '../../Components/UI/Loader';
import ErrorScreen from '../../Components/UI/ErrorScreen';

export default function ProfilePage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) return;
        
        // Get additional user data from Firestore
        const userDocRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userDocRef);
        
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
          // If no user document exists, create basic profile from auth data
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
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load user data');
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  const handleLogout = () => {
    // Your logout logic here
    console.log('Logging out');
  };

  const handleSuccess = (message) => {
    setSuccess(message);
  };

  const handleError = (message) => {
    setError(message);
  };

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userData) {
    return <ErrorScreen message="Failed to load profile data" />;
  }

  return (
    <div className="flex flex-col h-screen">
      <TopNavigation 
        username={userData.username} 
        onLogout={handleLogout} 
      />
      
      <ProfileHeader 
        currentUser={currentUser}
        userData={userData}
        onLogout={handleLogout}
        onSuccess={handleSuccess}
        onError={handleError}
      />
      
      <ProfileContent userData={userData} />
      <BottomNavigation />
    </div>
  );
}