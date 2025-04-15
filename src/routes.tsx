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
        <AuthenticatedLayout>
          <LazyRoute component={HomePage} />
        </AuthenticatedLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/search',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <LazyRoute component={SearchPage} />
        </AuthenticatedLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/post',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <LazyRoute component={PostPage} />
        </AuthenticatedLayout>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <AuthenticatedLayout>
          <LazyRoute component={ProfilePage} />
        </AuthenticatedLayout>
      </PrivateRoute>
    ),
  },
];

export default routes;