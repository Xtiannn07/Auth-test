import { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import TopNavigation from "../../Components/Navigation/TopNavigation";
import BottomNavigation from "../../Components/Navigation/BottomNavigation";
import LoadingScreen from '../../Components/UI/Loading';
import ErrorScreen from '../../Components/UI/ErrorScreen'; // Added missing import

// Main layout component
export default function HomePage() {
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser, logout } = useAuth(); // Added logout from auth context
  
  // Handle user logout
  const handleLogout = async () => {
    try {
      await logout();
      // Any additional logout logic can go here
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };
  
  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      try {
        if (currentUser) {
          // Replace this with your actual data fetching logic
          // Example: const data = await getUserProfile(currentUser.uid);
          // For template purposes, simulating data fetching:
          setTimeout(() => {
            setUserData({
              username: currentUser.email?.split('@')[0] || 'User',
              // Add other user data properties as needed
            });
            setLoading(false);
          }, 1000);
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
        setLoading(false);
      }
    };
    
    fetchUserData();
  }, [currentUser]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (!userData) {
    return <ErrorScreen message="Failed to load profile data" />;
  }

  return (
    <div className="flex flex-col h-screen bg-white text-black">
      <TopNavigation 
        username={userData.username} 
        onLogout={handleLogout} 
      />
      <main className="flex-grow overflow-auto">
        {/* Your main content goes here */}
        <div className="p-4">
          <h1 className="text-xl font-bold">Welcome, {userData.username}!</h1>
          {/* Add your homepage components here */}
        </div>
      </main>
      <BottomNavigation />
    </div>
  );
}