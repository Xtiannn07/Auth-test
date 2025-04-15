import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  sendPasswordResetEmail,
  User
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

// Async thunks for Firebase auth operations
export const signUpUser = createAsyncThunk(
  'auth/signUp',
  async ({ email, password, displayName }: { email: string, password: string, displayName?: string }, { rejectWithValue }) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      if (displayName && userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signInUser = createAsyncThunk(
  'auth/signIn',
  async ({ email, password }: { email: string, password: string }, { rejectWithValue }) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      return {
        uid: userCredential.user.uid,
        email: userCredential.user.email,
        displayName: userCredential.user.displayName,
        photoURL: userCredential.user.photoURL,
      };
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const signOutUser = createAsyncThunk(
  'auth/signOut',
  async (_, { rejectWithValue }) => {
    try {
      await signOut(auth);
      // Set a timestamp for logout
      localStorage.setItem('logoutTimestamp', Date.now().toString());
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const resetUserPassword = createAsyncThunk(
  'auth/resetPassword',
  async (email: string, { rejectWithValue }) => {
    try {
      await sendPasswordResetEmail(auth, email);
      return null;
    } catch (error: any) {
      return rejectWithValue(error.message);
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
      return rejectWithValue(error.message);
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