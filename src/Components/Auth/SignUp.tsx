// src/components/Auth/SignUp.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContexts';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const { signup, error, loading } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    try {
      await signup(email, password, displayName);
      navigate('/home');
    } catch (err) {
      // Error handling is done in the auth context/redux
      console.error('Signup failed:', err);
    }
  }

  // Combine Redux error with local password error
  const combinedError = passwordError || error;

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
          {combinedError && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" role="alert">
              <span className="block sm:inline">{combinedError}</span>
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDisplayName(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
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
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setConfirmPassword(e.target.value)}
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