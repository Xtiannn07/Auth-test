import { useState, useEffect } from 'react';
import { UserService, UserProfile } from '../../Services/UserService';
import { useNavigate } from 'react-router-dom';
import { X, Search, User } from 'lucide-react';

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
  const navigate = useNavigate();

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

  const handleUserClick = (userId: string) => {
    navigate(`/search?uid=${userId}`);
    onClose();
  };

  // Filter users based on search term
  const filteredUsers = searchTerm
    ? users.filter(user => 
        user.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.username.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : users;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
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
        <div className="overflow-y-auto flex-grow">
          {isLoading ? (
            <div className="flex justify-center items-center h-40">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredUsers.length > 0 ? (
            <ul>
              {filteredUsers.map(user => (
                <li 
                  key={user.uid} 
                  className="border-b last:border-b-0 hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleUserClick(user.uid)}
                >
                  <div className="flex items-center p-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-3 flex items-center justify-center">
                      {user.photoURL ? (
                        <img 
                          src={user.photoURL} 
                          alt={user.displayName} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User size={24} className="text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{user.displayName}</p>
                      <p className="text-gray-500 text-sm">@{user.username}</p>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-gray-500">
              <User size={40} className="mb-2 text-gray-300" />
              <p>No users found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}