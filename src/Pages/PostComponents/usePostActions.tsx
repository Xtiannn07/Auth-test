// src/components/PostComponents/usePostActions.ts
import { useState } from 'react';
import { doc, updateDoc, arrayUnion, arrayRemove, deleteDoc } from 'firebase/firestore';
import { db } from '../../Services/Firebase';

interface UsePostActionsProps {
  post: {
    id: string;
    likes: string[];
    savedBy?: string[];
    reposts?: number;
  };
  currentUser: any;
  onLikeUpdate?: () => void;
  onDeletePost?: (postId: string) => void;
}

export function usePostActions({ post, currentUser, onLikeUpdate, onDeletePost }: UsePostActionsProps) {
  const [isLiking, setIsLiking] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isReposting, setIsReposting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [error, setError] = useState('');
  
  const isLiked = currentUser && post.likes.includes(currentUser.uid);
  const isSaved = currentUser && post.savedBy?.includes(currentUser.uid);
  const isOwnPost = currentUser && post.author?.id === currentUser.uid;
  
  const handleLikeToggle = async () => {
    if (!currentUser) return;
    
    setIsLiking(true);
    setError('');
    
    try {
      const postRef = doc(db, 'posts', post.id);
      
      if (isLiked) {
        await updateDoc(postRef, {
          likes: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          likes: arrayUnion(currentUser.uid)
        });
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
  
  const handleSaveToggle = async () => {
    if (!currentUser) return;
    
    setIsSaving(true);
    setError('');
    
    try {
      const postRef = doc(db, 'posts', post.id);
      
      if (isSaved) {
        await updateDoc(postRef, {
          savedBy: arrayRemove(currentUser.uid)
        });
      } else {
        await updateDoc(postRef, {
          savedBy: arrayUnion(currentUser.uid)
        });
      }
    } catch (err) {
      console.error('Error updating save status:', err);
      setError('Failed to save post');
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleRepost = async () => {
    if (!currentUser) return;
    
    setIsReposting(true);
    setError('');
    
    try {
      const postRef = doc(db, 'posts', post.id);
      const currentReposts = post.reposts || 0;
      
      await updateDoc(postRef, {
        reposts: currentReposts + 1
      });
    } catch (err) {
      console.error('Error reposting:', err);
      setError('Failed to repost');
    } finally {
      setIsReposting(false);
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
    error,
    isLiked,
    isSaved,
    isOwnPost,
    handleLikeToggle,
    handleSaveToggle,
    handleRepost,
    handleDeletePost,
    setError
  };
}