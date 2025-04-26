import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Services/Firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Notification, { NotificationType } from '../../Components/UI/Notifications';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';
import { useProfile } from '../../Contexts/ProfileContext';
import { PostFormSkeleton } from '../../Components/UI/Skeleton';
import { motion } from 'framer-motion';

interface PostPageProps {
  maxContentLength?: number;
  titlePlaceholder?: string;
  contentPlaceholder?: string;
  submitButtonText?: string;
}

export default function PostPage({
  maxContentLength = 500,
  titlePlaceholder = "Enter your post title",
  contentPlaceholder = "What's on your mind?",
  submitButtonText = "Post"
}: PostPageProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [notification, setNotification] = useState<{ type: NotificationType; message: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const { userProfile, loading: profileLoading } = useProfile(); // Get the user's complete profile
  const navigate = useNavigate();

  useEffect(() => {
    if (shouldRedirect) {
      navigate('/home', { replace: true });
    } else if (!currentUser) {
      navigate('/signin');
    }
  }, [currentUser, navigate, shouldRedirect]);

  useEffect(() => {
    if (shouldRedirect) {
      const timer = setTimeout(() => {
        navigate('/', { replace: true });
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [shouldRedirect, navigate]);

  useEffect(() => {
    // Set loading state based on profile loading
    setIsLoading(profileLoading);
  }, [profileLoading]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim()) {
      setNotification({ type: 'error', message: 'Title is required' });
      return;
    }

    if (!content.trim()) {
      setNotification({ type: 'error', message: 'Content is required' });
      return;
    }

    if (content.length > maxContentLength) {
      setNotification({ type: 'error', message: `Content exceeds maximum length of ${maxContentLength} characters` });
      return;
    }

    if (!currentUser || !userProfile) {
      setNotification({ type: 'error', message: 'You must be logged in to post' });
      return;
    }

    setNotification(null);
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'posts'), {
        title: title.trim(),
        content: content.trim(),
        author: {
          id: currentUser.uid,
          name: userProfile.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
          photoURL: userProfile.photoURL || '' // Use the profile's photoURL
        },
        createdAt: serverTimestamp(),
        likes: [],
        likeCount: 0,
        commentCount: 0,
        repostCount: 0,
        saveCount: 0
      });

      setTitle('');
      setContent('');
      setNotification({ type: 'success', message: 'Post created successfully!' });
      setShouldRedirect(true);
    } catch (err) {
      console.error('Error submitting post:', err);
      setNotification({ type: 'error', message: 'Failed to submit your post. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  const contentLength = content.length;
  const contentLengthColor = contentLength > maxContentLength ? 'text-red-500' :
    contentLength > maxContentLength * 0.8 ? 'text-yellow-500' :
    'text-gray-500';

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { 
      y: 0, 
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  };

  const buttonVariants = {
    hover: { 
      scale: 1.03,
      transition: { 
        type: "spring", 
        stiffness: 400, 
        damping: 10 
      }
    },
    tap: { scale: 0.97 }
  };

  const skeletonVariants = {
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

  if (!currentUser) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <motion.div 
        className="fixed top-4 right-4 mb-2"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
          >
        Sup! {userProfile?.displayName || currentUser.email?.split('@')[0] || 'Anonymous'}
      </motion.div>

      <motion.h1 
        className="text-2xl font-bold mb-2"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        Create a New Post
      </motion.h1>

      {isLoading ? (
        <motion.div
          initial="initial"
          animate="animate"
          variants={skeletonVariants}
        >
          <PostFormSkeleton />
        </motion.div>
      ) : (
        <>

          {notification && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Notification
                type={notification.type}
                message={notification.message}
                onClose={() => setNotification(null)}
              />
            </motion.div>
          )}

          <motion.form 
            onSubmit={handleSubmit} 
            className="space-y-4"
            variants={containerVariants}
            initial="hidden"
            animate="visible"
          >
            <motion.div variants={itemVariants}>
              <label htmlFor="title" className="block text-gray-700 font-medium mb-2">
                Title
              </label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={titlePlaceholder}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                maxLength={100}
              />
            </motion.div>

            <motion.div variants={itemVariants}>
              <label htmlFor="content" className="block text-gray-700 font-medium mb-2">
                Content
              </label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder={contentPlaceholder}
                className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[200px]"
              />
              <div className={`text-right text-sm mt-1 ${contentLengthColor}`}>
                {contentLength}/{maxContentLength} characters
              </div>
            </motion.div>

            <motion.div 
              className="flex justify-end space-x-4"
              variants={itemVariants}
            >
              <motion.button
                type="button"
                onClick={() => navigate('/')}
                className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
                variants={buttonVariants}
                whileHover="hover"
                whileTap="tap"
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
                disabled={!title.trim() || !content.trim() || content.length > maxContentLength || isSubmitting}
                variants={buttonVariants}
                whileHover={!isSubmitting && title.trim() && content.trim() && content.length <= maxContentLength ? "hover" : undefined}
                whileTap={!isSubmitting && title.trim() && content.trim() && content.length <= maxContentLength ? "tap" : undefined}
              >
                {isSubmitting ? (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    Posting...
                  </motion.span>
                ) : submitButtonText}
              </motion.button>
            </motion.div>
          </motion.form>
        </>
      )}
    </div>
  );
}