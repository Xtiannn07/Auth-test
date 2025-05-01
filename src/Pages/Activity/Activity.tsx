// src/Pages/Activity/Activity.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Activity as ActivityType, ActivityService } from '../../Services/ActivityService';
import { formatDistanceToNow } from 'date-fns';
import { ActivitySkeleton } from '../../Components/UI/Skeleton';
import { motion, Variants, AnimatePresence } from 'framer-motion';

// Helper type for Firestore Timestamp
interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Type guard to check if a value is a Firestore Timestamp
function isFirestoreTimestamp(value: any): value is FirestoreTimestamp {
  return (
    value !== null &&
    typeof value === 'object' &&
    'seconds' in value &&
    'nanoseconds' in value &&
    typeof value.seconds === 'number' &&
    typeof value.nanoseconds === 'number'
  );
}

export default function Activity() {
  const [activities, setActivities] = useState<ActivityType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [deletingIds, setDeletingIds] = useState<string[]>([]);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    const loadActivities = async () => {
      if (!currentUser) return;

      try {
        setLoading(true);
        setError(null);
        const userActivities = await ActivityService.getUserActivities(currentUser.uid);
        setActivities(userActivities);
      } catch (err) {
        console.error('Error loading activities:', err);
        setError('Failed to load activity. Please try refreshing the page.');
      } finally {
        setLoading(false);
      }
    };

    loadActivities();
  }, [currentUser]);

  const handleDeleteActivity = async (activityId: string) => {
    if (!activityId) return;
    
    try {
      // Clear any previous error
      setDeleteError(null);
      
      // Add to deleting IDs to show loading state
      setDeletingIds(prev => [...prev, activityId]);
      
      const success = await ActivityService.deleteActivity(activityId);
      
      if (success) {
        // Filter out the deleted activity
        setActivities(prev => prev.filter(activity => activity.id !== activityId));
      } else {
        throw new Error('Failed to delete activity');
      }
    } catch (err) {
      console.error('Error deleting activity:', err);
      // Set the error message to display to the user
      setDeleteError('Unable to delete this activity. Please try again later.');
      
      // Auto-dismiss the error after 5 seconds
      setTimeout(() => {
        setDeleteError(null);
      }, 5000);
    } finally {
      // Remove from deleting IDs
      setDeletingIds(prev => prev.filter(id => id !== activityId));
    }
  };

  const renderActivityMessage = (activity: ActivityType) => {
    // Safely get sender name with fallback
    const senderName = activity.senderName || 'Someone';
    
    const userLink = (
      <Link 
        to={`/user/${activity.senderId}`}
        className="font-medium hover:underline"
      >
        {senderName}
      </Link>
    );

    const postLink = activity.postId ? (
      <Link 
        to={`/post/${activity.postId}`}
        className="text-gray-600 hover:underline"
      >
        {activity.postTitle || 'a post'}
      </Link>
    ) : null;

    switch (activity.type) {
      case 'like':
        return (
          <>
            {userLink} liked {postLink || 'your post'}
          </>
        );
      case 'comment':
        return (
          <>
            {userLink} commented on {postLink || 'your post'}: 
            <span className="text-gray-600">"{activity.commentText || ''}"</span>
          </>
        );
      case 'repost':
        return (
          <>
            {userLink} reposted {postLink || 'your post'}
          </>
        );
      case 'follow':
        return (
          <>
            {userLink} followed you
          </>
        );
      default:
        return <>{userLink} interacted with your content</>;
    }
  };

  // Helper function to safely format dates including Firestore Timestamps
  const formatActivityDate = (dateValue: any): string => {
    if (!dateValue) return 'recently';
    
    try {
      let date: Date;
      
      // Handle Firestore Timestamp objects
      if (isFirestoreTimestamp(dateValue)) {
        // Convert Firestore Timestamp to milliseconds and create Date
        const milliseconds = dateValue.seconds * 1000;
        date = new Date(milliseconds);
      } 
      // Handle Date objects
      else if (dateValue instanceof Date) {
        date = dateValue;
      }
      // Handle string dates
      else if (typeof dateValue === 'string') {
        const timestamp = Date.parse(dateValue);
        if (isNaN(timestamp)) return 'recently';
        date = new Date(timestamp);
      }
      // Handle numeric timestamps
      else if (typeof dateValue === 'number') {
        date = new Date(dateValue);
      }
      else {
        return 'recently';
      }
      
      // Validate the resulting date
      if (isNaN(date.getTime())) return 'recently';
      
      // Check if the date is in the future (Firebase sometimes returns future timestamps)
      if (date > new Date()) {
        return 'just now';
      }
      
      return formatDistanceToNow(date, { addSuffix: true });
    } catch (err) {
      console.error('Error formatting date:', err, dateValue);
      return 'recently';
    }
  };

  // Animation variants
  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants: Variants = {
    hidden: { y: 20, opacity: 0 },
    show: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    },
    exit: {
      opacity: 0,
      x: -100,
      transition: {
        duration: 0.3
      }
    }
  };

  const skeletonVariants: Variants = {
    initial: { opacity: 0.6 },
    animate: { 
      opacity: 1,
      transition: {
        repeat: Infinity,
        repeatType: "reverse",
        duration: 0.8
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <motion.h1 
          className="text-2xl font-bold mb-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          Activity
        </motion.h1>
        <motion.div
          initial="initial"
          animate="animate"
          variants={skeletonVariants}
        >
          <ActivitySkeleton />
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <motion.div 
          className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3 }}
        >
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Refresh page
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <motion.h1 
        className="text-2xl font-bold mb-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Activity
      </motion.h1>
      
      {/* Error notification */}
      <AnimatePresence>
        {deleteError && (
          <motion.div 
            className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4 flex justify-between items-center"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, height: 0, marginBottom: 0, padding: 0, overflow: 'hidden' }}
            transition={{ duration: 0.3 }}
          >
            <p>{deleteError}</p>
            <button 
              onClick={() => setDeleteError(null)} 
              className="text-red-700 hover:text-red-900"
              aria-label="Dismiss"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </motion.div>
        )}
      </AnimatePresence>
      {activities.length > 0 ? (
        <motion.div 
          className="space-y-4"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          <AnimatePresence>
            {activities.map((activity) => (
              <motion.div 
                key={activity.id} 
                className="bg-white rounded-lg shadow p-4 flex items-start space-x-3"
                variants={itemVariants}
                whileHover={{ scale: 1.01, boxShadow: "0 4px 6px rgba(0,0,0,0.1)" }}
                exit="exit"
              >
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {activity.senderPhotoURL ? (
                    <img
                      src={activity.senderPhotoURL}
                      alt={activity.senderName || 'User'}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                      <span className="text-gray-600 font-medium text-lg">
                        {(activity.senderName || 'A').charAt(0).toUpperCase()}
                      </span>
                    </div>
                  )}
                </div>

                {/* Activity Content */}
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm">
                        {renderActivityMessage(activity)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">
                        {formatActivityDate(activity.createdAt)}
                      </p>
                    </div>
                    
                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteActivity(activity.id!)}
                      disabled={deletingIds.includes(activity.id!)}
                      className={`text-gray-400 hover:text-red-500 focus:outline-none transition-colors ${
                        deletingIds.includes(activity.id!) ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                      title="Delete activity"
                      aria-label="Delete activity"
                    >
                      {deletingIds.includes(activity.id!) ? (
                        <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      ) : (
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                        </svg>
                      )}
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div 
          className="text-center text-gray-500 mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <p>No activity to show yet</p>
        </motion.div>
      )}
    </div>
  );
}