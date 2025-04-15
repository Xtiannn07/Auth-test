import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../../Services/Firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import SuccessToast from '../../Components/UI/SuccessToast';
import { useAuth } from '../../Contexts/AuthContexts';

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
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [shouldRedirect, setShouldRedirect] = useState(false);
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/signin');
      return;
    }
  }, [currentUser, navigate]);

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
      setError('Title is required');
      return;
    }

    if (!content.trim()) {
      setError('Content is required');
      return;
    }

    if (content.length > maxContentLength) {
      setError(`Content exceeds maximum length of ${maxContentLength} characters`);
      return;
    }

    if (!currentUser) {
      setError('You must be logged in to post');
      return;
    }

    setError('');
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
      setShowToast(true);
      setShouldRedirect(true); // Trigger the redirect sequence
    } catch (err) {
      console.error('Error submitting post:', err);
      setError('Failed to submit your post. Please try again.');
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

      {showToast && <SuccessToast message="Post created successfully!" />}

      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

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