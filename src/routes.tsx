// src/routes.tsx
import { lazy, Suspense, ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from './Contexts/AuthContexts';
import AuthenticatedLayout from './Pages/Layout';

const SignIn = lazy(() => import('./Components/Auth/SignIn'));
const SignUp = lazy(() => import('./Components/Auth/SignUp'));
const ForgotPassword = lazy(() => import('./Components/Auth/ForgotPassword'));
const HomePage = lazy(() => import('./Pages/Home/Home'));
const SearchPage = lazy(() => import('./Pages/Search/Search'));
const PostPage = lazy(() => import('./Pages/Post/Post'));
const ProfilePage = lazy(() => import('./Pages/Profile/Profile'));

interface PrivateRouteProps {
  children: ReactNode;
}

function PrivateRoute({ children }: PrivateRouteProps) {
  const { currentUser } = useAuth();
  return currentUser ? children : <Navigate to="/signin" />;
}

const LazyRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <Suspense fallback={<div>Loading...</div>}>
    <Component />
  </Suspense>
);

const AuthenticatedRouteWrapper = ({ children }: { children: ReactNode }) => {
  const { currentUser, logout } = useAuth();

  return (
    <AuthenticatedLayout 
      topNavProps={{
        username: currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User',
        onLogout: logout
      }}
    >
      {children}
    </AuthenticatedLayout>
  );
};

const routes = [
  {
    path: '/',
    element: <Navigate to="/signin" />,
  },
  {
    path: '/signin',
    element: <LazyRoute component={SignIn} />,
  },
  {
    path: '/signup',
    element: <LazyRoute component={SignUp} />,
  },
  {
    path: '/forgot',
    element: <LazyRoute component={ForgotPassword} />,
  },
  {
    path: '/home',
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={HomePage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
  {
    path: '/search',
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={SearchPage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
  {
    path: '/post',
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={PostPage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={ProfilePage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
];

export default routes;