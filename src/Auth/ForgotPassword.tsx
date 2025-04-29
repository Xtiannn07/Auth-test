import { useState, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { AppDispatch } from '../store/store'; // Import your store's AppDispatch type
import { resetUserPassword } from '../store/authSlice';
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import SignInFooter from './Footer';
import { motion } from 'framer-motion';
import FeatureModal from '../Components/UI/FeatureModal'; // Import the modal component

// Animation variants - added from SignIn.tsx
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

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false); // Add state for the modal
  // Use the typed dispatch
  const dispatch = useDispatch<AppDispatch>();
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // Dispatch the resetUserPassword action
      await dispatch(resetUserPassword(email)).unwrap();
      setMessage('Check your inbox for further instructions.');
      
      // Optional: Redirect after a delay
      setTimeout(() => navigate('/signin'), 3000);
    } catch (error) {
      setError(`Failed to reset password: ${error instanceof Error ? error.message : String(error)}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <motion.div 
      className="flex flex-col items-center min-h-screen py-2 px-4"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        {/* Language selector */}
        <motion.div 
          className="mb-22 text-gray-600 text-[12px] cursor-pointer"
          variants={itemVariants}
          onClick={() => setIsModalOpen(true)}
        >
          English (US)
        </motion.div>

        {/* Logo */}
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

        {/* Form */}
        <div className="w-full">
          <motion.h2 
            className="text-center text-xl font-semibold mb-4"
            variants={itemVariants}
          >
            Reset Password
          </motion.h2>
          
          {error && (
            <motion.div 
              className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {error}
            </motion.div>
          )}

          {message && (
            <motion.div 
              className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: "spring", stiffness: 100 }}
            >
              {message}
            </motion.div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <motion.div variants={itemVariants}>
              <Input
                id="email"
                name="email"
                type="email"
                required
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
                disabled={loading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
            </motion.div>
          </form>

          <motion.div 
            className="text-center mt-4"
            variants={itemVariants}
          >
            <Link 
              to="/signin" 
              className="text-gray-800 hover:underline text-sm"
            >
              Back to Sign In
            </Link>
          </motion.div>
        </div>
      </div>

      {/* Footer */}
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