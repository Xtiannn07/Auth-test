// src/Pages/Activity/Activity.tsx
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { Activity as ActivityType, ActivityService } from '../../Services/ActivityService';
import { formatDistanceToNow } from 'date-fns';
import { ActivitySkeleton } from '../../Components/UI/Skeleton';

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

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <h1 className="text-2xl font-bold mb-6">Activity</h1>
        <ActivitySkeleton />
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto p-4">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="mt-2 text-red-600 underline"
          >
            Refresh page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Activity</h1>
      {activities.length > 0 ? (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div 
              key={activity.id} 
              className="bg-white rounded-lg shadow p-4 flex items-start space-x-3"
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
                <p className="text-sm">
                  {renderActivityMessage(activity)}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {formatActivityDate(activity.createdAt)}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center text-gray-500 mt-8">
          <p>No activity to show yet</p>
        </div>
      )}
    </div>
  );
}