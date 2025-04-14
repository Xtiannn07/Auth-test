// src/routes.ts
import { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import SignIn from './Components/Auth/SignIn';
import SignUp from './Components/Auth/SignUp';
import ForgotPassword from './Components/Auth/ForgotPassword';
import { useAuth } from './Contexts/AuthContexts';
import ProfilePage from './Pages/Profile/Profile';
import HomePage from './Pages/Home/Home';
import SearchPage from './Pages/Search/Search';
import PostPage from './Pages/Post/Post';
import AuthenticatedLayout from './Pages/Layout';

interface PrivateRouteProps {
  children: ReactNode;
}

interface AuthContextType {
  currentUser: any;
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
      <PrivateRoute>
        <AuthenticatedLayout>
          <HomePage />
        </AuthenticatedLayout>
      </PrivateRoute>
    )
  },
  {
    path: '/search',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <SearchPage />
        </AuthenticatedLayout>
      </PrivateRoute>
    )
  },
  {
    path: '/post',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <PostPage/>
        </AuthenticatedLayout>
      </PrivateRoute>
    )
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <ProfilePage />
        </AuthenticatedLayout>
      </PrivateRoute>
    )
  }
];

export default routes;