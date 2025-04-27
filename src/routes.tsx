import { lazy, Suspense, ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from './store/store';
import AuthenticatedLayout from './Pages/Layout';
import PrivateRoute from './Auth/PrivateRoute';
import ErrorBoundary from './Components/UI/ErrorBoundary';
import LoaderSpinner from './Components/UI/Loader';

const SignIn = lazy(() => import('./Auth/SignIn'));
const SignUp = lazy(() => import('./Auth/SignUp'));
const ForgotPassword = lazy(() => import('./Auth/ForgotPassword'));
const HomePage = lazy(() => import('./Pages/Home/Home'));
const SearchPage = lazy(() => import('./Pages/Search/Search'));
const PostPage = lazy(() => import('./Pages/Post/Post'));
const ProfilePage = lazy(() => import('./Pages/Profile/Profile'));
const UserProfilePage = lazy(() => import('./Pages/UsersComponents/UserProfile'));
const ActivityPage = lazy(() => import('./Pages/Activity/Activity'));


const LazyRoute = ({ component: Component }: { component: React.ComponentType }) => (
  <ErrorBoundary>
    <Suspense fallback={<LoaderSpinner/>}>
      <Component />
    </Suspense>
  </ErrorBoundary>
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
    path: '/activity',
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={ActivityPage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile', // Route for current user's profile
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={ProfilePage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
  {
    path: '/user/:userId', // Dynamic route for viewing other users' profiles
    element: (
      <PrivateRoute>
        <AuthenticatedRouteWrapper>
          <LazyRoute component={UserProfilePage} />
        </AuthenticatedRouteWrapper>
      </PrivateRoute>
    ),
  },
];

export default routes;
