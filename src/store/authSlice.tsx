import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User
  // UserCredential
} from 'firebase/auth';
import { auth } from '../Services/Firebase';

interface AuthState {
  currentUser: {
    uid: string;
    email: string | null;
    displayName?: string | null;
    photoURL?: string | null;
  } | null;
  loading: boolean;
  error: string | null;
}

const initialState: AuthState = {
  currentUser: null,
  loading: false,
  error: null,
};

// Helper function to handle Firebase auth errors
const handleAuthError = (error: any) => {
  console.error('Firebase auth error:', error);
  
  // Translate Firebase error codes to user-friendly messages
  if (error.code === 'auth/email-already-in-use') {
    return 'This email is already in use. Try signing in or use a different email.';
  } else if (error.code === 'auth/invalid-email') {
    return 'Please enter a valid email address.';
  } else if (error.code === 'auth/weak-password') {
    return 'Password should be at least 6 characters.';
  } else if (error.code === 'auth/wrong-password') {
    return 'Incorrect password. Please try again.';
  } else if (error.code === 'auth/user-not-found') {
    return 'No account found with this email. Please sign up.';
  } else if (error.code === 'auth/too-many-requests') {
    return 'Too many failed attempts. Please try again later.';
  } else {
    return error.message || 'An error occurred during authentication.';
  }
};

// Extract user data from Firebase User object
const extractUserData = (user: User) => ({
  uid: user.uid,
  email: user.email,
  displayName: user.displayName,
  photoURL: user.photoURL,
});

// Async thunks for Firebase auth operations
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string, password: string, displayName?: string }, { rejectWithValue }) => {
    try {
      console.log('Creating user with Firebase');
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      console.log('User created successfully');
      return extractUserData(userCredential.user);
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string, password: string }, { rejectWithValue }) => {
    try {
      console.log('Attempting login with Firebase');
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      console.log('Login successful');
      return extractUserData(userCredential.user);
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      console.log('Signing out user');
      await signOut(auth);
      console.log('User logged out');
      return null;
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      console.log('Sending password reset email');
      await sendPasswordResetEmail(auth, email);
      console.log('Password reset email sent');
      return null;
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

export const updateUserProfile = createAsyncThunk(
  'auth/updateProfile',
  async ({ displayName, photoURL }: { displayName?: string, photoURL?: string }, { rejectWithValue }) => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is signed in');
      }
      await updateProfile(auth.currentUser, { displayName, photoURL });
      return {
        displayName,
        photoURL,
      };
    } catch (error: any) {
      return rejectWithValue(handleAuthError(error));
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCurrentUser(state, action: PayloadAction<AuthState['currentUser']>) {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    },
    clearCurrentUser(state) {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    },
    clearAuthError(state) {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    // Sign Up
    builder.addCase(signUpUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signUpUser.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signUpUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign In
    builder.addCase(signInUser.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(signInUser.fulfilled, (state, action) => {
      state.currentUser = action.payload;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signInUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Sign Out
    builder.addCase(signOutUser.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(signOutUser.fulfilled, (state) => {
      state.currentUser = null;
      state.loading = false;
      state.error = null;
    });
    builder.addCase(signOutUser.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Password Reset
    builder.addCase(resetUserPassword.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(resetUserPassword.fulfilled, (state) => {
      state.loading = false;
    });
    builder.addCase(resetUserPassword.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // Update Profile
    builder.addCase(updateUserProfile.pending, (state) => {
      state.loading = true;
    });
    builder.addCase(updateUserProfile.fulfilled, (state, action) => {
      if (state.currentUser) {
        state.currentUser = {
          ...state.currentUser,
          displayName: action.payload.displayName || state.currentUser.displayName,
          photoURL: action.payload.photoURL || state.currentUser.photoURL,
        };
      }
      state.loading = false;
    });
    builder.addCase(updateUserProfile.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

export const { setCurrentUser, clearCurrentUser, clearAuthError } = authSlice.actions;
export default authSlice.reducer;