// src/routes.js
import { Navigate } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn';
import SignUp from './Components/Auth/SignUp';
import UserProfile from './Components/Profile/UserProfile';
import { useAuth } from './Contexts/AuthContexts';

function PrivateRoute({ children }) {
  const { currentUser } = useAuth();
  
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
    path: '/profile',
    element: (
      <PrivateRoute>
        <UserProfile />
      </PrivateRoute>
    )
  }
];

export default routes;