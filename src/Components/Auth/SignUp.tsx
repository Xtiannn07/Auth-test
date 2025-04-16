// src/components/Auth/SignUp.tsx
import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signUpUser, clearAuthError } from '../../store/authSlice';
import { RootState, AppDispatch } from '../../store/store';
import { UserService } from '../../Services/UserService';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const navigate = useNavigate();

  // Generate a username from display name or email
  const generateUsername = (value: string): string => {
    if (!value) return '';
    // Remove spaces, special chars, and make lowercase
    return value
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9]/g, '')
      .substring(0, 15);
  };

  // Handle display name change and suggest username
  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    
    // Only suggest username if user hasn't manually entered one yet
    if (!username && value) {
      setUsername(generateUsername(value));
    }
  };

  // Handle email change and suggest username if none provided
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    
    // Only suggest username from email if no display name and no username yet
    if (!username && !displayName && value) {
      const emailUsername = value.split('@')[0];
      setUsername(generateUsername(emailUsername));
    }
  };

  // Check if username is available
  const checkUsernameAvailability = async () => {
    if (!username) return;
    
    try {
      const isAvailable = await UserService.isUsernameAvailable(username);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        return false;
      } else {
        setUsernameError('');
        return true;
      }
    } catch (err) {
      console.error('Error checking username:', err);
      return false;
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    // Clear previous errors
    setPasswordError('');
    setUsernameError('');
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    // Username is required
    if (!username) {
      setUsernameError('Username is required');
      return;
    }
    
    // Check username availability
    const isAvailable = await checkUsernameAvailability();
    if (!isAvailable) return;
    
    setIsSubmitting(true);
    
    try {
      console.log('Starting signup process');
      
      // First, create the auth user
      const resultAction = await dispatch(signUpUser({ 
        email, 
        password, 
        displayName 
      }));
      
      if (signUpUser.fulfilled.match(resultAction)) {
        const user = resultAction.payload;
        
        if (user && user.uid) {
          console.log('Auth user created, now creating profile');
          
          // Create the user profile in Firestore
          await UserService.createUserProfile(user.uid, {
            displayName,
            username,
            email,
            createdAt: new Date()
          });
          
          console.log('User profile created, navigating to home');
          
          // Navigate to home after profile creation
          navigate('/home');
        }
      }
    } catch (err) {
      console.error('Signup failed:', err);
    } finally {
      setIsSubmitting(false);
    }
  }

  // Combine all errors
  const combinedError = passwordError || usernameError || error;
  const isLoading = loading || isSubmitting;

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
                placeholder="Display Name"
                value={displayName}
                onChange={handleDisplayNameChange}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <div>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setUsername(e.target.value)}
                onBlur={checkUsernameAvailability}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
              {usernameError && <p className="text-red-500 text-xs mt-1">{usernameError}</p>}
            </div>
            
            <div>
              <Input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
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
                onClick={() => {}} // Satisfy the onClick requirement for TypeScript
                disabled={isLoading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
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