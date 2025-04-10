import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContexts';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function SignIn() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      setError('Failed to sign in: ' + error.message);
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
        
        {/* Facebook logo */}
        <div className="mb-22">
          <img 
            src="./facebook-icon.svg" 
            alt="Facebook" 
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
                id="email-address"
                name="email"
                type="text"
                required
                placeholder="Mobile number or email"
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
            
            <Button
              type="submit"
              disabled={loading}
              className="w-full text-white"
            >
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
            
            <div className="text-center">
              <Link to="/forgot-password" className="text-gray-600 text-sm font-medium ">
                Forgot password?
              </Link>
            </div>
          </form>
        </div>
      </div>

      {/* Footer is now placed outside the main content wrapper */}
      <SignInFooter />
    </div>
  );
}