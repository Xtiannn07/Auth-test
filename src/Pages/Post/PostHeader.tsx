// src/Pages/PostComponents/PostHeader.tsx
import { DeleteMenu } from './DeletedMenu';
import { formatDate } from '../../utils/dateUtils';

interface PostHeaderProps {
  post: {
    title: string;
    createdAt: any;
  };
  isOwnPost: boolean;
  showDeleteMenu: boolean;
  toggleDeleteMenu: () => void;
  onDeletePost: () => Promise<void>;
}

export function PostHeader({ 
  post, 
  isOwnPost, 
  showDeleteMenu, 
  toggleDeleteMenu, 
  onDeletePost 
}: PostHeaderProps) {
  const formattedDate = formatDate(post.createdAt);
  
  return (
    <div className="flex justify-between items-center mb-3">
      <h3 className="text-xl font-semibold">{post.title}</h3>
      
      <div className="flex items-center space-x-2">
        {isOwnPost && (
          <DeleteMenu 
            isOpen={showDeleteMenu} 
            toggleOpen={toggleDeleteMenu} 
            onDelete={onDeletePost} 
          />
        )}
        <span className="text-sm text-gray-500">{formattedDate}</span>
      </div>
    </div>
  );
}
