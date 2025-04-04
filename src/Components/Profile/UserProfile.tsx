// src/components/Profile/UserProfile.jsx
import React, { useState } from 'react'; 
import { useAuth } from '../../Contexts/AuthContexts';
import { useNavigate } from 'react-router-dom';
import Input from '../UI/Input';
import Button from '../UI/Button';

export default function UserProfile() {
  const { currentUser, updateUserProfile, logout } = useAuth();
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  if (!currentUser) {
    navigate('/signin');
    return null;
  }

  async function handleUpdateProfile(e) {
    e.preventDefault();

    try {
      setError('');
      setSuccess('');
      setLoading(true);
      await updateUserProfile(displayName, null);
      setSuccess('Profile updated successfully!');
    } catch (error) {
      setError('Failed to update profile: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    try {
      await logout();
      navigate('/signin');
    } catch (error) {
      setError('Failed to log out: ' + error.message);
    }
  }

  return (
    <div className="pt-16 pb-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md overflow-hidden">
        <div className="px-4 py-5 sm:px-6 bg-blue-500">
          <h3 className="text-lg leading-6 font-medium text-white">User Profile</h3>
          <p className="mt-1 max-w-2xl text-sm text-blue-100">Your personal information</p>
        </div>
        
        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3" role="alert">
          <span className="block sm:inline">{error}</span>
        </div>}
        
        {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3" role="alert">
          <span className="block sm:inline">{success}</span>
        </div>}
        
        <div className="px-4 py-5 sm:px-6">
          <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <dt className="text-sm font-medium text-gray-500">Email</dt>
              <dd className="mt-1 text-sm text-gray-900">{currentUser.email}</dd>
            </div>
            
            <div className="sm:col-span-2">
              <form onSubmit={handleUpdateProfile} className="space-y-4">
                <div className='text-black'>
                  <label htmlFor="display-name" className="block text-sm font-medium text-gray-700">Display Name</label>
                  <div className="mt-1">
                    <Input
                      id="display-name"
                      name="displayName"
                      type="text"
                      placeholder="Display Name"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                    />
                  </div>
                </div>
                
                <div className="flex space-x-4">
                  <Button
                    type="submit"
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Profile'}
                  </Button>
                  
                  <Button
                    type="button"
                    onClick={handleLogout}
                    className="bg-red-500 hover:bg-red-600"
                  >
                    Sign Out
                  </Button>
                </div>
              </form>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}