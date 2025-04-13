// src/components/Auth/SignUp.jsx
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { signup, updateUserProfile } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    
    try {
      setError('');
      setLoading(true);
      const userCredential = await signup(email, password);
      
      if (displayName) {
        await updateUserProfile(displayName, null);
      }
      
      navigate('/profile');
    } catch (error) {
      setError('Failed to create an account: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 px-4">
      {/* Main content wrapper that fills the available space */}
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        {/* Language selector at top */}
        <div className="mb-22 text-gray-600 text-[12px]">
          English (US)
        </div>
        
        {/* Bookmark logo */}
        <div className="mb-22">
          <img 
            src="./Bookmark.png" 
            alt="Bookmark" 
            className="h-14 w-14"
          />
        </div>
        
        {/* Form container */}
        <div className="w-full">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{error}</span>
            </div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
              <Input
                id="display-name"
                name="displayName"
                type="text"
                placeholder="Display Name (optional)"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <div>
              <Input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <div>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <div>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <div className='w-full max-w-md flex p-[1px] rounded-3xl bg-white'>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {loading ? 'Creating account...' : 'Sign up'}
              </Button>
            </div>
            
            <div className="text-center">
              <p className="text-gray-600 text-sm font-medium">
                Already have an account?{' '}
                <Link to="/signin" className="text-blue-500 hover:underline">
                  Sign in
                </Link>
              </p>
            </div>
          </form>
        </div>
      </div>

      {/* Footer */}
      <SignInFooter />
    </div>
  );
}