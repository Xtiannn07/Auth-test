import { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../store/store';

interface PrivateRouteProps {
  children: ReactNode;
}

/**
 * PrivateRoute component
 * 
 * This component protects routes that require authentication.
 * It checks if the user is logged in via Redux state and either:
 * 1. Renders the protected children components if user is authenticated
 * 2. Redirects to the signin page if user is not authenticated
 */
export default function PrivateRoute({ children }: PrivateRouteProps) {
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);
  const location = useLocation();

  if (!currentUser) {
    // Redirect to signin page, but save the attempted URL for redirecting back after login
    return <Navigate to="/signin" state={{ from: location }} replace />;
  }

  // If we have a user, render the protected route's children
  return <>{children}</>;
}