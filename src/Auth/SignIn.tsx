import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { signInUser, clearAuthError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
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
      duration: 0.3,
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

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get the intended destination if redirected to login
  const from = location.state?.from?.pathname || '/home';
  
  // Clear errors when component mounts or inputs change
  useEffect(() => {
    dispatch(clearAuthError());
  }, [email, password, dispatch]);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    try {
      console.log('Attempting to login with:', email);
      const resultAction = await dispatch(signInUser({ email, password }));
      
      if (signInUser.fulfilled.match(resultAction)) {
        console.log('Login successful, navigating to home');
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error('Login failed:', err);
    }
  }

  useEffect(() => {
    // Clear any residual auth data when arriving at signin
    localStorage.removeItem('authToken');
    sessionStorage.clear();
    
    // Disable cache
    window.onpageshow = (event: PageTransitionEvent) => {
      if (event.persisted) {
        window.location.reload();
      }
    };
  }, []);

  return (
    <motion.div 
      className="flex flex-col items-center min-h-screen py-2 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Main content wrapper that fills the available space */}
      <div className="w-full max-w-md flex flex-col items-center flex-1">
    {/* Language selector */}
        <motion.div 
          className="mb-22 text-gray-600 text-[12px] cursor-pointer"
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
        >
          English (US)
        </motion.div>
        
        {/* Logo with animation */}
        <motion.div 
          className="mb-22"
          variants={logoVariants}
        >
          <img 
            src="./mark.png" 
            alt="Marked Logo" 
            className="h-14 w-14"
          />
        </motion.div>

        {/* Form container */}
        <div className="w-full">
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4" 
              role="alert"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              <span className="block sm:inline">{error}</span>
            </motion.div>
          )}
          
          <form className="space-y-4" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <Input
                id="email-address"
                name="email"
                type="text"
                required={true}
                placeholder="Mobile number or email"
                value={email}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </motion.div>
            
            <motion.div variants={itemVariants}>
              <Input
                id="password"
                name="password"
                type="password"
                required={true}
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
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
                onClick={() => {}} // Satisfy the onClick requirement for TypeScript
                disabled={loading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </motion.div>
            
            <motion.div 
              className="text-center"
              variants={itemVariants}
            >
              <Link to="/forgot" className="text-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-sm font-medium hover:underline">
                Forgot password?
              </Link>
            </motion.div>
          </form>
        </div>
      </div>

      {/* Footer with animation */}
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