import { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import TopNavigation from "../../Components/Navigation/TopNavigation";
import BottomNavigation from "../../Components/Navigation/BottomNavigation";
import LoadingScreen from '../../Components/UI/Loading';


// Main layout component
export default function HomePage() {

  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth();
  

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

        <BottomNavigation />
    </div>
  );
}