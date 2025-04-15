// src/Contexts/AuthContexts.tsx
import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../Services/Firebase';
import { useDispatch, useSelector } from 'react-redux';
import { 
  setCurrentUser, 
  signInUser,
  signUpUser,
  signOutUser,
  resetUserPassword,
  updateUserProfile as updateUserProfileAction
} from '../store/authSlice';
import { RootState } from '../store/store';

interface AuthContextType {
  currentUser: {
    uid: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (email: string, password: string, displayName?: string) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateUserProfile: (displayName?: string, photoURL?: string) => Promise<void>;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [loading, setLoading] = useState(true);
  const dispatch = useDispatch();
  
  // Get auth state from Redux
  const { currentUser, loading: authLoading, error: authError } = useSelector((state: RootState) => state.auth);

  // Listen to Firebase auth state changes and update Redux
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        dispatch(setCurrentUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        }));
      } else {
        dispatch(setCurrentUser(null));
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [dispatch]);

  // Auth methods that will dispatch Redux actions
  async function login(email: string, password: string) {
    await dispatch(signInUser({ email, password }));
  }

  async function signup(email: string, password: string, displayName?: string) {
    await dispatch(signUpUser({ email, password, displayName }));
  }

  async function logout() {
    await dispatch(signOutUser());
  }

  async function resetPassword(email: string) {
    await dispatch(resetUserPassword(email));
  }

  async function updateProfile(displayName?: string, photoURL?: string) {
    await dispatch(updateUserProfileAction({ displayName, photoURL }));
  }

  const value: AuthContextType = {
    currentUser,
    loading: loading || authLoading,
    error: authError,
    login,
    signup,
    logout,
    resetPassword,
    updateUserProfile: updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}