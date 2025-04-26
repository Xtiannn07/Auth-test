// src/Pages/PostComponents/usePostActions.tsx
import { useState, useEffect } from 'react';
import { deleteDoc, doc, runTransaction } from 'firebase/firestore';
import { db } from '../../Services/Firebase';
import { PostService, PostLike, Comment } from '../../Services/PostService';
import { UserService } from '../../Services/UserService';

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

  useEffect(() => {
    setLikeCount(post.likeCount || 0);
    setRepostCount(post.repostCount || 0);
  }, [post.likeCount, post.repostCount]);
  
  useEffect(() => {
    if (!currentUser?.uid || !post.id) return;
    
    let isMounted = true;
    
    const checkEngagementStatus = async () => {
      try {
        const [hasLiked, hasSaved, hasReposted] = await Promise.all([
          PostService.hasUserLikedPost(post.id, currentUser.uid),
          PostService.hasUserSavedPost(post.id, currentUser.uid),
          PostService.hasUserRepostedPost(post.id, currentUser.uid)
        ]);

        if (isMounted) {
          setIsLiked(hasLiked);
          setIsSaved(hasSaved);
          setIsReposted(hasReposted);
        }

        if (hasReposted) {
          const repost = await PostService.getUserRepostOfPost(post.id, currentUser.uid);
          if (repost?.id && isMounted) {
            setRepostId(repost.id);
          }
        }
      } catch (err) {
        console.error('Error checking engagement status:', err);
        if (isMounted) {
          setError('Error loading post status');
        }
      }
    };

    checkEngagementStatus();
    
    return () => {
      isMounted = false;
    };
  }, [currentUser?.uid, post.id]);

  useEffect(() => {
    if (!post.id) return;
    
    const likesUnsubscribe = PostService.subscribeToPostLikes(
      post.id, 
      10,
      (updatedLikes) => setLikes(updatedLikes)
    );
    
    const commentsUnsubscribe = PostService.subscribeToPostComments(
      post.id,
      (updatedComments) => setComments(updatedComments)
    );
    
    return () => {
      likesUnsubscribe();
      commentsUnsubscribe();
    };
  }, [post.id]);
  
  const handleLikeToggle = async () => {
    if (!currentUser?.uid || !post.id) {
      setError('You must be logged in to like posts');
      return;
    }
    
    setIsLiking(true);
    setError('');
    
    try {
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
      
      // Immediately update UI state for better UX
      const wasLiked = isLiked;
      setIsLiked(!wasLiked);
      setLikeCount(prev => wasLiked ? Math.max(0, prev - 1) : prev + 1);
      
      if (wasLiked) {
        await PostService.unlikePost(post.id, currentUser.uid);
        // Update local likes array after successful Firebase operation
        setLikes(prev => prev.filter(like => like.userId !== currentUser.uid));
      } else {
        await PostService.likePost(post.id, currentUser.uid, displayName);
        // Update local likes array after successful Firebase operation
        const newLike = { userId: currentUser.uid, displayName, timestamp: new Date() };
        setLikes(prev => [newLike, ...prev]);
      }
      
      if (onLikeUpdate) {
        onLikeUpdate();
      }
    } catch (err) {
      console.error('Error updating like:', err);
      // Revert optimistic updates on error
      setIsLiked(isLiked);
      setLikeCount(likeCount);
      setError('Failed to update like status');
    } finally {
      setIsLiking(false);
    }
  };

  const handleRepost = async () => {
    if (!currentUser?.uid || !post.id) {
      setError('You must be logged in to repost');
      return;
    }
    
    setIsReposting(true);
    setError('');
    
    // Track original state for reverting on error
    const wasReposted = isReposted;
    const originalRepostCount = repostCount;
    const originalRepostId = repostId;
    
    // Update optimistically
    setIsReposted(!wasReposted);
    setRepostCount(prev => wasReposted ? Math.max(0, prev - 1) : prev + 1);
    
    try {
      if (wasReposted && repostId) {
        await PostService.unrepostPost(repostId, currentUser.uid, post.id);
        setRepostId(null);
      } else {
        const repost = await PostService.repostPost(post.id, currentUser.uid);
        setRepostId(repost.id);
      }
    } catch (err) {
      console.error('Error reposting:', err);
      // Revert on error
      setIsReposted(wasReposted);
      setRepostCount(originalRepostCount);
      setRepostId(originalRepostId);
      setError('Failed to repost');
    } finally {
      setIsReposting(false);
    }
  };

  const handleSaveToggle = async () => {
    if (!currentUser?.uid || !post.id) {
      setError('You must be logged in to save posts');
      return;
    }
    
    setIsSaving(true);
    setError('');
    
    // Track original state
    const wasSaved = isSaved;
    
    // Update optimistically
    setIsSaved(!wasSaved);
    
    try {
      if (wasSaved) {
        await PostService.unsavePost(post.id, currentUser.uid);
      } else {
        await PostService.savePost(post.id, currentUser.uid);
      }
    } catch (err) {
      console.error('Error updating save status:', err);
      // Revert on error
      setIsSaved(wasSaved);
      setError('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };

  const handleAddComment = async () => {
    if (!currentUser?.uid || !post.id) {
      setError('You must be logged in to comment');
      return;
    }
    
    if (!commentText.trim()) {
      setError('Comment cannot be empty');
      return;
    }
    
    setIsAddingComment(true);
    setError('');
    
    // Store the comment text to clear input field immediately for better UX
    const commentToAdd = commentText.trim();
    setCommentText('');
    
    try {
      const displayName = currentUser.displayName || currentUser.email?.split('@')[0] || 'Anonymous';
      await PostService.addComment(
        post.id, 
        currentUser.uid, 
        displayName, 
        commentToAdd,
        currentUser.photoURL
      );
      
      // We don't need to update comments state manually because the subscription will handle it
    } catch (err) {
      console.error('Error adding comment:', err);
      // Restore comment text on error
      setCommentText(commentToAdd);
      setError('Failed to add comment');
    } finally {
      setIsAddingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!currentUser?.uid || !post.id) return;
    
    try {
      await PostService.deleteComment(post.id, commentId);
      // We don't need to update comments state manually because the subscription will handle it
    } catch (err) {
      console.error('Error deleting comment:', err);
      setError('Failed to delete comment');
    }
  };

  const handleDeletePost = async () => {
    if (!currentUser?.uid || !isOwnPost) return;
    
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
    } finally {
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