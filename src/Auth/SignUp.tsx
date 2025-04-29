import { useState, FormEvent, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { signUpUser, clearAuthError, signOutUser } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import UserService from '../Services/UserService';
import { useProfile } from '../Contexts/ProfileContext';
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import SignInFooter from './Footer';
import FeatureModal from '../Components/UI/FeatureModal';

// Animation variants
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
      delayChildren: 0.05
    }
  }
};

const itemVariants = {
  hidden: { y: 20, opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { 
      type: "spring", 
      stiffness: 100 
    }
  }
};

const logoVariants = {
  hidden: { scale: 0.8, opacity: 0 },
  visible: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "spring",
      stiffness: 100,
      delay: 0.05
    }
  }
};

export default function SignUp() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [pendingProfileData, setPendingProfileData] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading, currentUser } = useSelector((state: RootState) => state.auth);
  const { createProfile, loading: profileLoading } = useProfile();
  const navigate = useNavigate();

  // Check if user is already logged in
  useEffect(() => {
    if (currentUser && !isSubmitting) {
      navigate('/home');
    }
  }, [currentUser, navigate, isSubmitting]);

  // Effect to handle profile creation after authentication
  useEffect(() => {
    const createUserProfile = async () => {
      if (currentUser && pendingProfileData) {
        try {
          setStatusMessage('Setting up your profile...');
          
          // Add the uid from currentUser to the profile data
          const profileData = {
            ...pendingProfileData,
            uid: currentUser.uid,
            email: currentUser.email || email
          };
          
          await createProfile(profileData);
          
          // Verify profile creation
          setStatusMessage('Verifying account setup...');
          let profileExists = await verifyProfileCreation(currentUser.uid);
          
          // If profile doesn't exist, try one more time with simplified data
          if (!profileExists) {
            profileExists = await retryProfileCreation(currentUser.uid);
          }
          
          if (profileExists) {
            setStatusMessage('Account created successfully! Redirecting...');
            // Small delay to ensure data is propagated
            setTimeout(() => {
              navigate('/home');
            }, 500);
          } else {
            setStatusMessage('');
            dispatch({ type: 'auth/setError', payload: "We couldn't complete your profile setup. Please try again." });
            // Clean up the auth user if profile creation failed completely
            await cleanupAuthUser();
          }
        } catch (err: any) {
          console.error('Profile creation failed:', err);
          const errorMessage = err.message || 'Failed to create user profile';
          dispatch({ type: 'auth/setError', payload: errorMessage });
          // Clean up the auth user if profile creation failed
          await cleanupAuthUser();
        } finally {
          setPendingProfileData(null);
          setIsSubmitting(false);
        }
      }
    };
    
    createUserProfile();
  }, [currentUser, pendingProfileData, createProfile, dispatch, navigate, email]);

  const generateUsername = (value: string): string => {
    if (!value) return '';
    return value
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/[^a-z0-9_]/g, '')
      .substring(0, 15);
  };

  const handleDisplayNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDisplayName(value);
    if (!username && value) {
      setUsername(generateUsername(value));
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setEmail(value);
    if (!username && !displayName && value) {
      const emailUsername = value.split('@')[0];
      setUsername(generateUsername(emailUsername));
    }
  };

  const checkUsernameAvailability = async () => {
    if (!username) {
      setUsernameError('Username is required');
      return false;
    }
    
    try {
      const isAvailable = await UserService.isUsernameAvailable(username);
      if (!isAvailable) {
        setUsernameError('Username is already taken');
        return false;
      }
      setUsernameError('');
      return true;
    } catch (err) {
      console.error('Error checking username:', err);
      setUsernameError('Error checking username availability');
      return false;
    }
  };

  // Function to verify the profile was created in Firestore
  const verifyProfileCreation = async (uid: string): Promise<boolean> => {
    try {
      await UserService.getUserProfile(uid);
      return true;
    } catch (err) {
      console.error('Profile verification failed:', err);
      return false;
    }
  };

  // Function to clean up auth user if profile creation fails
  const cleanupAuthUser = async () => {
    try {
      await dispatch(signOutUser());
      console.log('Cleaned up auth user after failed profile creation');
    } catch (err) {
      console.error('Error during auth cleanup:', err);
    }
  };

  // Function to retry profile creation with simplified data
  const retryProfileCreation = async (uid: string): Promise<boolean> => {
    try {
      setStatusMessage('Retrying profile creation...');
      
      const minimalProfile = {
        uid: uid,
        displayName: displayName || email.split('@')[0],
        username: username || `user_${uid.substring(0, 8)}`,
        email: email,
        photoURL: '',
        bio: ''
      };
      
      await UserService.createUserProfile(uid, minimalProfile);
      return true;
    } catch (err) {
      console.error('Retry profile creation failed:', err);
      return false;
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    setPasswordError('');
    setUsernameError('');
    setStatusMessage('');
    dispatch(clearAuthError());
    
    if (password !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }
    
    const isAvailable = await checkUsernameAvailability();
    if (!isAvailable) return;
    
    setIsSubmitting(true);
    
    try {
      // Step 1: Create auth user
      setStatusMessage('Creating account...');
      const authResult = await dispatch(signUpUser({ 
        email, 
        password, 
        displayName 
      }));
      
      if (signUpUser.fulfilled.match(authResult)) {
        const user = authResult.payload;
        
        // Instead of immediately creating the profile, store the data
        // and let the useEffect handle profile creation once currentUser is available
        setPendingProfileData({
          displayName,
          username,
          photoURL: user.photoURL || ''
        });
      }
    } catch (err) {
      console.error('Signup failed:', err);
      setStatusMessage('');
      setIsSubmitting(false);
    }
  }

  const combinedError = passwordError || usernameError || error;
  const isLoading = loading || profileLoading || isSubmitting;

  return (
    <motion.div 
      className="flex flex-col items-center min-h-screen py-2 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        <motion.div 
          className="mb-22 text-gray-600 text-[12px] cursor-pointer"
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
        >
          English (US)
        </motion.div>
          
        <motion.div 
          className="mb-6"
          variants={logoVariants}
        >
          <img 
            src="./mark.png" 
            alt="marked logo" 
            className="h-14 w-14"
          />
        </motion.div>
        
        <div className="w-full">
          {combinedError && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" 
              role="alert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <span className="block sm:inline">{combinedError}</span>
            </motion.div>
          )}
          
          {statusMessage && !combinedError && (
            <motion.div 
              className="bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded mb-4" 
              role="alert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <span className="block sm:inline">{statusMessage}</span>
            </motion.div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <Input
                id="display-name"
                name="displayName"
                type="text"
                placeholder="Display Name"
                value={displayName}
                onChange={handleDisplayNameChange}
                className="w-full px-3 py-3 border bg-gray-100 border-gray-300 rounded-xl"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                id="username"
                name="username"
                type="text"
                required
                placeholder="Username"
                value={username}
                onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                onBlur={checkUsernameAvailability}
                className="w-full px-3 py-3 border bg-gray-100 border-gray-300 rounded-xl"
                disabled={isLoading}
              />
              {usernameError && (
                <motion.p 
                  className="text-red-500 text-xs mt-1"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                >
                  {usernameError}
                </motion.p>
              )}
              <motion.p 
                className="text-gray-500 text-xs mt-1"
                variants={itemVariants}
              >
                Only letters, numbers, and underscores are allowed
              </motion.p>
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                id="email-address"
                name="email"
                type="email"
                required
                placeholder="Email address"
                value={email}
                onChange={handleEmailChange}
                className="w-full px-3 py-3 border bg-gray-100 border-gray-300 rounded-xl"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                id="password"
                name="password"
                type="password"
                required
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-gray-100 border-gray-300 rounded-xl"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                id="confirm-password"
                name="confirmPassword"
                type="password"
                required
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-gray-100 border-gray-300 rounded-xl"
                disabled={isLoading}
              />
            </motion.div>
            
            <motion.div 
              className='w-full max-w-md flex p-[1px] rounded-3xl bg-white'
              variants={itemVariants}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full text-white bg-blue-500 hover:bg-blue-600 rounded-3xl py-2"
              >
                {isLoading ? 'Creating account...' : 'Sign up'}
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              <p className="text-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-sm font-medium">
                Already have an account?{' '}
                <Link to="/signin" className="text-gray-600 hover:underline">
                  Sign in
                </Link>
              </p>
            </motion.div>
          </form>
        </div>
      </div>
      
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <SignInFooter />
      </motion.div>

      {/* Feature Modal */}
      <FeatureModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)}
        title="Language Selection Coming Soon"
        message="I'm working hard to bring you multiple language options. This feature will be available soon!"
      />

    </motion.div>
  );
}