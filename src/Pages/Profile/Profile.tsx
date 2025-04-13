import { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContext';
import { useLoading } from '../../Contexts/LoadingContext'; // Add this
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import TopNavigation from "../../Components/Navigation/TopNavigation";
import BottomNavigation from "../../Components/Navigation/BottomNavigation";
import ProfileHeader from './Header';
import ProfileContent from './ProfileContent';
import ErrorScreen from '../../Components/UI/ErrorScreen';

export default function ProfilePage() {
  const [success, setSuccess] = useState('');
  const [error, setError] = useState('');
  const [userData, setUserData] = useState(null);
  const { setIsLoading } = useLoading(); // Replace local loading state
  const { currentUser } = useAuth();
  
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (!currentUser) return;
        
        setIsLoading(true); // Use context loader instead of local state
        
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
      } catch (err) {
        console.error("Error fetching user data:", err);
        setError('Failed to load user data');
      } finally {
        setIsLoading(false); // Ensure loader is hidden in all cases
      }
    };
    
    fetchUserData();
  }, [currentUser, setIsLoading]);

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

  if (error) {
    return (
      <div className="flex flex-col h-screen">
        <TopNavigation 
          username={userData?.username || ''} 
          onLogout={handleLogout} 
        />
        <ErrorScreen message={error} />
        <BottomNavigation />
      </div>
    );
  }

  if (!userData) {
    return null; // Let the layout loader handle the loading state
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