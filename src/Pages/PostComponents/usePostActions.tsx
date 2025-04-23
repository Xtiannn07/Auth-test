// src/Pages/PostComponents/usePostActions.tsx
import { useState, useEffect } from 'react';
import { deleteDoc, doc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { PostService, PostLike, Comment } from '../../Services/PostService';

interface UsePostActionsProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    createdAt: any;
    likeCount?: number;
    commentCount?: number;
    repostCount?: number;
    saveCount?: number;
  };
  currentUser: any;
  onLikeUpdate?: () => void;
  onDeletePost?: (postId: string) => void;
}

export function usePostActions({ post, currentUser, onLikeUpdate, onDeletePost }: UsePostActionsProps) {
  // State for loading indicators
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);
  const [error, setError] = useState('');
  
  // State for tracking engagement status
  const [isLiked, setIsLiked] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  const [isReposted, setIsReposted] = useState(false);
  const [repostId, setRepostId] = useState<string | null>(null);
  
  // State for storing engagement data
  const [likes, setLikes] = useState<PostLike[]>([]);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState('');
  
  const isOwnPost = currentUser && post.author.id === currentUser.uid;
  const [likeCount, setLikeCount] = useState(post.likeCount || 0);
  const [repostCount, setRepostCount] = useState(post.repostCount || 0);
  const commentCount = post.commentCount || 0;

  // Update counts when post changes
  useEffect(() => {
    setLikeCount(post.likeCount || 0);
    setRepostCount(post.repostCount || 0);
  }, [post.likeCount, post.repostCount]);
  
  // Check initial engagement status
  useEffect(() => {
    if (!currentUser || !post.id) return;
    
    // Check if user has liked this post
    const checkLikeStatus = async () => {
      try {
        const hasLiked = await PostService.hasUserLikedPost(post.id, currentUser.uid);
        setIsLiked(hasLiked);
      } catch (err) {
        console.error('Error checking like status:', err);
      }
    };
    
    // Check if user has saved this post
    const checkSaveStatus = async () => {
      try {
        const hasSaved = await PostService.hasUserSavedPost(post.id, currentUser.uid);
        setIsSaved(hasSaved);
      } catch (err) {
        console.error('Error checking save status:', err);
      }
    };
    
    // Check if user has reposted this post
    const checkRepostStatus = async () => {
      try {
        const hasReposted = await PostService.hasUserRepostedPost(post.id, currentUser.uid);
        setIsReposted(hasReposted);
        
        if (hasReposted) {
          const repost = await PostService.getUserRepostOfPost(post.id, currentUser.uid);
          if (repost && repost.id) {
            setRepostId(repost.id as string);
          }
        }
      } catch (err) {
        console.error('Error checking repost status:', err);
      }
    };
    
    checkLikeStatus();
    checkSaveStatus();
    checkRepostStatus();
  }, [currentUser, post.id]);
  
  // Set up listeners for real-time updates
  useEffect(() => {
    if (!post.id) return;
    
    // Subscribe to likes updates
    const likesUnsubscribe = PostService.subscribeToPostLikes(
      post.id, 
      10,
      (updatedLikes) => {
        setLikes(updatedLikes);
      }
    );
    
    // Subscribe to comments updates 
    const commentsUnsubscribe = PostService.subscribeToPostComments(
      post.id,
      (updatedComments) => {
        setComments(updatedComments);
      }
    );
    
    // Cleanup listeners on unmount
    return () => {
      likesUnsubscribe();
      commentsUnsubscribe();
    };
  }, [post.id]);
  
  // Handle like/unlike action
  const handleLikeToggle = async () => {
    if (!currentUser || !post.id) return;
    
    setIsLiking(true);
    setError('');
    
    try {
      if (isLiked) {
        await PostService.unlikePost(post.id, currentUser.uid);
        setIsLiked(false);
        setLikes(prev => prev.filter(like => like.userId !== currentUser.uid));
        setLikeCount(prev => Math.max(0, prev - 1));
      } else {
        const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
        await PostService.likePost(post.id, currentUser.uid, displayName);
        setIsLiked(true);
        // Add timestamp to match PostLike type
        setLikes(prev => [...prev, { userId: currentUser.uid, displayName, timestamp: new Date() }]);
        setLikeCount(prev => prev + 1);
      }
      
      if (onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (err) {
      console.error('Error updating like:', err);
      setError('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };
  
  // Handle save/unsave action
  const handleSaveToggle = async () => {
    if (!currentUser || !post.id) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      if (isSaved) {
        await PostService.unsavePost(post.id, currentUser.uid);
        setIsSaved(false);
      } else {
        await PostService.savePost(post.id, currentUser.uid);
        setIsSaved(true);
      }
    } catch (err) {
      console.error('Error updating save status:', err);
      setError('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };
  
  // Handle repost action
  const handleRepost = async () => {
    if (!currentUser || !post.id) return;
    
    setIsReposting(true);
    setError('');
    
    try {
      if (isReposted && repostId) {
        await PostService.unrepostPost(repostId, currentUser.uid, post.id);
        setIsReposted(false);
        setRepostId(null);
        setRepostCount(prev => Math.max(0, prev - 1));
      } else {
        const repost = await PostService.repostPost(post.id, currentUser.uid);
        setIsReposted(true);
        setRepostId(repost.id);
        setRepostCount(prev => prev + 1);
      }
    } catch (err) {
      console.error('Error reposting:', err);
      setError('Failed to repost');
    } finally {
      setIsReposting(false);
    }
  };
  
  // Handle adding a comment
  const handleAddComment = async () => {
    if (!currentUser || !post.id || !commentText.trim()) return;
    
    setIsAddingComment(true);
    setError('');
    
    try {
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
      await PostService.addComment(
        post.id, 
        currentUser.uid, 
        displayName, 
        commentText.trim(),
        currentUser.photoURL
      );
      
      // Clear comment input after successful post
      setCommentText('');
    } catch (err) {
      console.error('Error adding comment:', err);
      setError('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };
  
  // Handle deleting a comment
  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser || !post.id) return;
    
    try {
      await PostService.deleteComment(post.id, commentId);
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };
  
  const handleDeletePost = async () => {
    if (!currentUser || !isOwnPost) return;
    
    setIsDeleting(true);
    setError('');
    
    try {
      await deleteDoc(doc(db, 'posts', post.id));
      
      if (onDeletePost) {
        onDeletePost(post.id);
      }
    } catch (err) {
      console.error('Error deleting post:', err);
      setError('Failed to delete post');
      setIsDeleting(false);
    }
  };
  
  return {
    isLiking,
    isSaving,
    isReposting,
    isDeleting,
    isAddingComment,
    error,
    isLiked,
    isSaved,
    isReposted,
    isOwnPost,
    handleLikeToggle,
    handleSaveToggle,
    handleRepost,
    handleAddComment,
    handleDeleteComment,
    handleDeletePost,
    setError,
    likes,
    comments,
    commentText,
    setCommentText,
    likeCount,
    commentCount,
    repostCount
  };
}