import { useState, useEffect, FormEvent } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { signInUser, clearAuthError } from '../store/authSlice';
import { RootState, AppDispatch } from '../store/store';
import Input from '../Components/UI/Input';
import Button from '../Components/UI/Button';
import SignInFooter from './Footer';


export default function SignIn() {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const dispatch = useDispatch<AppDispatch>();
  const { error, loading } = useSelector((state: RootState) => state.auth);
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
    <div className="flex flex-col items-center min-h-screen py-2 px-4 ">
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
            
            <div className='w-full max-w-md flex p-[1px] rounded-3xl bg-white'>
              <Button
                type="submit"
                onClick={() => {}} // Satisfy the onClick requirement for TypeScript
                disabled={loading}
                className="w-full text-white rounded-3xl border-1 border-white"
              >
                {loading ? 'Logging in...' : 'Log in'}
              </Button>
            </div>
            
            <div className="text-center">
              <Link to="/forgot" className="text-gray-600 text-sm font-medium ">
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