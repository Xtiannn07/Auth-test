import { useState, useEffect } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import TopNavigation from "../../Components/Navigation/TopNavigation";
import BottomNavigation from "../../Components/Navigation/BottomNavigation";
import ProfileHeader from './Header';
import { Heart, MoreHorizontal, Link } from 'lucide-react';

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

  if (loading) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div>Loading profile...</div>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col h-screen bg-black text-white items-center justify-center">
        <div>Failed to load profile data</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-black text-white">
      <TopNavigation 
        username={userData.username} 
        onLogout={handleLogout} 
      />
      
      <ProfileHeader 
        currentUser={currentUser}
        userData={userData}
        onLogout={handleLogout}
        onSuccess={(message) => setSuccess(message)}
        onError={(message) => setError(message)}
      />
      
      <ProfileContent userData={userData} />
      <BottomNavigation />
    </div>
  );
}

// Rest of your components remain the same...

// Profile content component
function ProfileContent({ userData }) {
  const [activeTab, setActiveTab] = useState('threads');
  
  return (
    <div className="flex-1 overflow-hidden flex flex-col">
      <ProfileActions />
      <ContentTabs activeTab={activeTab} setActiveTab={setActiveTab} />
      <TabContent activeTab={activeTab} />
    </div>
  );
}

// Profile picture component
function ProfilePicture({ src, size = "md", alt = "Profile" }) {
  const sizeClasses = {
    sm: "h-10 w-10",
    md: "h-12 w-12",
    lg: "h-16 w-16"
  };
  
  return (
    <div className={`${sizeClasses[size]} bg-gray-700 rounded-full overflow-hidden`}>
      <img src={src} alt={alt} className="w-full h-full object-cover" />
    </div>
  );
}

// Profile action buttons component
function ProfileActions() {
  return (
    <div className="flex px-4 gap-2 mt-2">
      <Button variant="secondary">Edit profile</Button>
      <Button variant="secondary">Share profile</Button>
    </div>
  );
}

// Reusable button component
function Button({ children, variant = "primary", onClick }) {
  const variantClasses = {
    primary: "bg-white text-black",
    secondary: "bg-transparent border border-gray-700 hover:bg-gray-800 text-white"
  };
  
  return (
    <button 
      className={`flex-1 py-2 rounded-full font-medium ${variantClasses[variant]}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

// Content tabs component
function ContentTabs({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'threads', label: 'Threads' },
    { id: 'replies', label: 'Replies' },
    { id: 'reposts', label: 'Reposts' }
  ];
  
  return (
    <div className="flex border-t border-b border-gray-800 mt-4">
      {tabs.map(tab => (
        <button 
          key={tab.id}
          className={`flex-1 py-3 font-medium ${activeTab === tab.id ? 'border-b-2 border-white' : 'text-gray-500'}`}
          onClick={() => setActiveTab(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

// Tab content container component
function TabContent({ activeTab }) {
  return (
    <div className="flex-1 overflow-y-auto">
      {activeTab === 'threads' && <ThreadsList />}
      {activeTab === 'replies' && <EmptyState message="No replies yet" />}
      {activeTab === 'reposts' && <EmptyState message="No reposts yet" />}
    </div>
  );
}

// Empty state component
function EmptyState({ message }) {
  return (
    <div className="flex items-center justify-center h-40 text-gray-500">
      {message}
    </div>
  );
}

// Threads list component
function ThreadsList() {
  const threads = [
    {
      id: 1,
      content: "Just visited this amazing coffee shop downtown. The atmosphere was perfect for catching up on emails while enjoying some quality espresso. What's your favorite work spot?",
      image: "/api/placeholder/400/320",
      likes: 342,
      replies: 57,
      timestamp: "2d"
    },
    {
      id: 2,
      content: "Trying out a new productivity method this week. So far, time blocking has been a game changer for my workflow!",
      likes: 213,
      replies: 28,
      timestamp: "4d"
    },
    {
      id: 3,
      content: "What's everyone reading this month? Just finished 'Atomic Habits' and can't recommend it enough.",
      image: "/api/placeholder/400/200",
      likes: 529,
      replies: 82,
      timestamp: "1w"
    }
  ];
  
  return (
    <div className="divide-y divide-gray-800">
      {threads.map(thread => (
        <ThreadItem key={thread.id} thread={thread} />
      ))}
    </div>
  );
}

// Thread item component
function ThreadItem({ thread }) {
  return (
    <div className="p-4">
      <div className="flex">
        <ThreadItemSidebar />
        <div className="flex-1">
          <ThreadItemHeader username="jessicalexus" timestamp={thread.timestamp} />
          <ThreadItemContent content={thread.content} image={thread.image} />
          <ThreadItemActions />
          <ThreadItemStats likes={thread.likes} replies={thread.replies} />
        </div>
      </div>
    </div>
  );
}

// Thread item sidebar with profile picture and connector line
function ThreadItemSidebar() {
  return (
    <div className="mr-3">
      <ProfilePicture src="/api/placeholder/40/40" size="sm" />
      <div className="w-0.5 bg-gray-700 h-16 mx-auto mt-1"></div>
    </div>
  );
}

// Thread item header with username and timestamp
function ThreadItemHeader({ username, timestamp }) {
  return (
    <div className="flex items-center justify-between">
      <div className="font-medium">{username}</div>
      <div className="flex items-center text-gray-500">
        <span className="text-xs">{timestamp}</span>
        <MoreHorizontal className="h-4 w-4 ml-2" />
      </div>
    </div>
  );
}

// Thread item content (text and optional image)
function ThreadItemContent({ content, image }) {
  return (
    <>
      <p className="mt-1 text-sm">{content}</p>
      
      {image && (
        <div className="mt-3 bg-gray-800 rounded-xl overflow-hidden">
          <img src={image} alt="Thread image" className="w-full object-cover" />
        </div>
      )}
    </>
  );
}

// Thread item action buttons
function ThreadItemActions() {
  return (
    <div className="flex items-center mt-3 text-gray-500">
      <Heart className="h-5 w-5 mr-4" />
      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M12 21C16.9706 21 21 16.9706 21 12C21 7.02944 16.9706 3 12 3C7.02944 3 3 7.02944 3 12C3 13.4876 3.36093 14.891 4 16.1272L3 21L7.8728 20C9.10904 20.6391 10.5124 21 12 21Z" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-5 w-5 mr-4" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M7 10L12 15L17 10" />
      </svg>
      <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.5">
        <path d="M5 15L5 17C5 18.1046 5.89543 19 7 19L17 19C18.1046 19 19 18.1046 19 17L19 15M12 4L12 16M12 4L8 8M12 4L16 8" />
      </svg>
    </div>
  );
}

// Thread item stats component
function ThreadItemStats({ likes, replies }) {
  return (
    <div className="mt-1 text-sm text-gray-500">
      <span>{likes} likes</span>
      <span className="mx-1">•</span>
      <span>{replies} replies</span>
    </div>
  );
}