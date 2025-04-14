import { useState } from 'react';
import { useAuth } from '../../Contexts/AuthContexts';
import { doc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore';
import { db } from '../Services/Firebase';
import PostCard from '../Components/UI/PostCard';

interface PostProps {
  post: {
    id: string;
    title: string;
    content: string;
    author: {
      id: string;
      name: string;
    };
    createdAt: any;
    likes: string[];
  };
  onLikeUpdate?: () => void;
}

export default function Post({ post, onLikeUpdate }: PostProps) {
  return <PostCard post={post} onLikeUpdate={onLikeUpdate} />;
}