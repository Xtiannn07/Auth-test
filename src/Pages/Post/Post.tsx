import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Services/Firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import Notification, { NotificationType } from '../../Components/UI/Notifications';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

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
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
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

    if (!currentUser) {
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
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous',
        },
        createdAt: serverTimestamp(),
        likes: [],
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

  if (!currentUser) {
    return null; // Don't render anything if not authenticated
  }

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-6">Create a New Post</h1>

      <div>Welcome, {currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous'}</div>

      {notification && (
        <Notification
          type={notification.type}
          message={notification.message}
          onClose={() => setNotification(null)}
        />
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
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
        </div>

        <div>
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
        </div>

        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={() => navigate('/')}
            className="px-4 py-2 border border-gray-300 rounded text-gray-700 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors disabled:bg-blue-300"
            disabled={!title.trim() || !content.trim() || content.length > maxContentLength || isSubmitting}
          >
            {isSubmitting ? 'Posting...' : submitButtonText}
          </button>
        </div>
      </form>
    </div>
  );
}
