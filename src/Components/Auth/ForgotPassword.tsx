import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContext';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuth(); // Assuming your AuthContext has resetPassword
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();

    try {
      setError('');
      setMessage('');
      setLoading(true);
      
      // Firebase sends a password reset email
      await resetPassword(email);
      setMessage('Check your inbox for further instructions.');
      
      // Optional: Redirect after a delay
      setTimeout(() => navigate('/signin'), 3000);
    } catch (error) {
      setError('Failed to reset password: ' + error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-2 px-4">
      <div className="w-full max-w-md flex flex-col items-center flex-1">
        {/* Language selector */}
        <div className="mb-22 text-gray-600 text-[12px]">
          English (US)
        </div>

        {/* Logo */}
        <div className="mb-22">
          <img 
            src="./Bookmark.png" 
            alt="Bookmark" 
            className="h-14 w-14"
          />
        </div>

        {/* Form */}
        <div className="w-full">
          <h2 className="text-center text-xl font-semibold mb-4">Reset Password</h2>
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          {message && (
            <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
              {message}
            </div>
          )}

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div>
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
            </div>

            <div className='w-full max-w-md flex p-[1px] rounded-3xl bg-white'>
              <Button
                type="submit"
                disabled={loading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {loading ? 'Sending...' : 'Reset Password'}
              </Button>
            </div>
          </form>

          <div className="text-center mt-4">
            <Link 
              to="/signin" 
              className="text-blue-500 hover:underline text-sm"
            >
              Back to Sign In
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <SignInFooter />
    </div>
  );
}