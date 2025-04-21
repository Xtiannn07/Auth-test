import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Services/Firebase';
import { setCurrentUser, clearCurrentUser } from '../store/authSlice';

/**
 * AuthStateListener component
 * 
 * This component listens to Firebase authentication state changes and
 * updates the Redux store accordingly. It should be placed high in the 
 * component tree to ensure it's running throughout the app's lifecycle.
 */
export default function AuthStateListener({ children }: { children: React.ReactNode }) {
  const dispatch = useDispatch();

  useEffect(() => {
    
    // Set up Firebase auth state observer
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        console.log('Auth state changed: User logged in', user.email);
        // Extract minimal user data to store in Redux
        dispatch(setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
      } else {
        console.log('Auth state changed: No user');
        dispatch(clearCurrentUser());
      }
    });

    // Clean up observer on unmount
    return () => {
      console.log('Cleaning up Firebase auth state listener');
      unsubscribe();
    };
  }, [dispatch]);

  // The component doesn't render anything, just returns its children
  return <>{children}</>;
}