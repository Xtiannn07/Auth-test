import { useState, useEffect } from 'react';
import { type UserProfile } from '../../Services/UserService';
import UserService from '../../Services/UserService';
import { X, Search } from 'lucide-react';
import LoaderSpinner from '../../Components/UI/Loader';
import UsersCard from '../UsersComponents/UserCard';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface FollowersListProps {
  userId: string;
  type: 'followers' | 'following';
  isOpen: boolean;
  onClose: () => void;
}

export default function FollowersList({ userId, type, isOpen, onClose }: FollowersListProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  // Get current user from Redux store to check follow status
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen, userId, type]);

  const loadUsers = async () => {
    try {
      setIsLoading(true);
      if (type === 'followers') {
        const followers = await UserService.getFollowers(userId);
        setUsers(followers);
      } else {
        const following = await UserService.getFollowing(userId);
        setUsers(following);
      }
    } catch (error) {
      console.error(`Error loading ${type}:`, error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  // Convert UserProfile to the User format expected by UsersCard
  const convertToUserFormat = (profile: UserProfile) => {
    return {
      id: profile.uid,
      uid: profile.uid,
      displayName: profile.displayName,
      username: profile.username,
      email: profile.email,
      photoURL: profile.photoURL,
      bio: profile.bio
    };
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-xs backdrop-saturate-150 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg w-full max-w-md max-h-[80vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b p-4">
          <h2 className="text-xl font-bold">
            {type === 'followers' ? 'Followers' : 'Following'}
          </h2>
          <button 
            onClick={onClose}
            className="p-1 rounded-full hover:bg-gray-100"
            aria-label="Close"
          >
            <X size={20} />
          </button>
        </div>
        
        {/* Search */}
        <div className="p-3 border-b">
          <div className="relative">
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search className="absolute left-3 top-2.5 text-gray-400" size={18} />
          </div>
        </div>
        
        {/* User list */}
        <div className="overflow-y-auto flex-grow p-3">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <LoaderSpinner/>
            </div>
          ) : filteredUsers.length > 0 ? (
            <div>
              {filteredUsers.map(user => (
                <UsersCard 
                  key={user.uid}
                  user={convertToUserFormat(user)}
                  compact={true}
                  className="mb-2"
                  // Custom prop to control action buttons visibility based on list type
                  showActionButtons={type === 'followers'}
                  // Hide remove button in all cases for this component
                  hideRemoveButton={true}
                />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}