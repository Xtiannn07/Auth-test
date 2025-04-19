import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import AuthenticatedLayout from './Pages/Layout';
import PrivateRoute from './Components/Auth/PrivateRoute';

const SignIn = lazy(() => import('./Components/Auth/SignIn'));
const SignUp = lazy(() => import('./Components/Auth/SignUp'));
const ForgotPassword = lazy(() => import('./Components/Auth/ForgotPassword'));
const HomePage = lazy(() => import('./Pages/Home/Home'));
const SearchPage = lazy(() => import('./Pages/Search/Search'));
const PostPage = lazy(() => import('./Pages/Post/Post'));
const ProfilePage = lazy(() => import('./Pages/Profile/Profile'));

const LazyRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <Suspense fallback={<div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>}>
    <Component />
  </Suspense>
);

const AuthenticatedRouteWrapper = ({ children }: { children: ReactNode }) => {
  return (
    <AuthenticatedLayout>
      {children}
    </AuthenticatedLayout>
  );
};

const RootRedirect = () => {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const location = useLocation();

  if (currentUser) {
    return <Navigate to="/home" state={{ from: location }} replace />;
  } else {
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }
};

const routes = [
  {
    path: '/',
    element: <RootRedirect />,
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
    path: '/profile/:username', // Dynamic route for user profiles
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
