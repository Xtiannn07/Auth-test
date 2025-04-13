// src/routes.js
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn';
import SignUp from './Components/Auth/SignUp';
import ForgotPassword from './Components/Auth/ForgotPassword';
import { useAuth } from './Contexts/AuthContexts';
import ProfilePage from './Pages/Profile/Profile'
import HomePage from './Pages/Home/Home';

// Define interface for the component props
interface PrivateRouteProps {
  children: ReactNode;
}

// Define what the useAuth hook returns
interface AuthContextType {
  currentUser: any; // You can use a more specific type here if you know the structure
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser } = useAuth() as AuthContextType;
  
  return currentUser ? children : <Navigate to="/signin" />;
}

const routes = [
  {
    path: '/',
    element: <Navigate to="/signin" />
  },
  {
    path: '/signin',
    element: <SignIn />
  },
  {
    path: '/signup',
    element: <SignUp />
  },
  {
    path: '/forgot',
    element: <ForgotPassword />
  },
  {
    path: '/home',
    element: (
        <HomePage />
    )
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <ProfilePage />
      </PrivateRoute>
    )
  }

];

export default routes;