import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../Contexts/AuthContexts';
import Input from '../UI/Input';
import Button from '../UI/Button';
import SignInFooter from './Footer';

export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const { login } = useAuth() as { login: (email: string, password: string) => Promise<void> };
  const navigate = useNavigate();

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    
    try {
      setError('');
      setLoading(true);
      await login(email, password);
      navigate('/profile');
    } catch (error) {
      if (error instanceof Error) {
        setError('Failed to sign in: ' + error.message);
      } else {
        setError('Failed to sign in');
      }
    } finally {
      setLoading(false);
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
                  required={true}
                  placeholder="Mobile number or email"
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
                required={true}
                placeholder="Password"
                value={password}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
                className="w-full px-3 py-3 border bg-[#f2f3f5] border-gray-400 rounded-xl"
              />
            </div>
            
            <Button
              type="submit"
              onClick={() => console.log('Button clicked')}
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