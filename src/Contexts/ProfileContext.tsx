import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { type UserProfile } from '../Services/UserService';
import UserService from '../Services/UserService';

interface ProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  createProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
  checkProfileExists: () => Promise<boolean>;
}

interface ProfileProviderProps {
  children: ReactNode;
}

// Create context with a more helpful default value
const ProfileContext = createContext<ProfileContextType>({
  userProfile: null,
  loading: false,
  error: null,
  updateProfile: async () => {
    throw new Error('ProfileContext not initialized');
  },
  refreshProfile: async () => {
    throw new Error('ProfileContext not initialized');
  },
  createProfile: async () => {
    throw new Error('ProfileContext not initialized');
  },
  checkProfileExists: async () => {
    throw new Error('ProfileContext not initialized');
  }
});

export function useProfile() {
  const context = useContext(ProfileContext);
  return context;
}

export function ProfileProvider({ children }: ProfileProviderProps) {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const currentUser = useSelector((state: RootState) => state.auth.currentUser);

  const fetchUserProfile = async () => {
    if (!currentUser) {
      setUserProfile(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const profile = await UserService.getUserProfile(currentUser.uid);
      setUserProfile(profile);
    } catch (err: any) {
      console.error('Error fetching user profile:', err);
      setError('Failed to load user profile');
    } finally {
      setLoading(false);
    }
  };

  // Fetch profile whenever currentUser changes
  useEffect(() => {
    if (currentUser?.uid) {
      fetchUserProfile();
    } else {
      setUserProfile(null);
      setLoading(false);
    }
  }, [currentUser?.uid]);

  // Function to check if profile exists
  const checkProfileExists = async (): Promise<boolean> => {
    if (!currentUser) {
      return false;
    }
    
    try {
      const profile = await UserService.getUserProfile(currentUser.uid);
      return !!profile;
    } catch (err) {
      console.error('Error checking profile existence:', err);
      return false;
    }
  };

  // Function to create a new profile with better error handling
  const createProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!currentUser) {
      throw new Error('User must be logged in to create a profile');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Make sure we have a UID
      const uid = profileData.uid || currentUser.uid;
      
      // Check if profile already exists to avoid duplicates
      try {
        const existingProfile = await UserService.getUserProfile(uid);
        
        if (existingProfile) {
          console.log('Profile already exists, returning existing profile');
          setUserProfile(existingProfile);
          return existingProfile;
        }
      } catch (error) {
        // If error is because profile doesn't exist, continue with creation
        console.log('No existing profile found, creating new one');
      }
      
      // Create complete profile data with defaults for missing fields
      const completeProfileData = {
        uid,
        displayName: profileData.displayName || currentUser.displayName || '',
        username: profileData.username || `user_${uid.substring(0, 8)}`,
        email: profileData.email || currentUser.email || '',
        photoURL: profileData.photoURL || currentUser.photoURL || '',
        bio: profileData.bio || '',
        createdAt: new Date().toISOString()
      };
      
      console.log('Creating new user profile with data:', completeProfileData);
      
      // Enhanced error handling and retry logic
      try {
        // First attempt with full data
        const profile = await UserService.createUserProfile(uid, completeProfileData);
        console.log('Profile created successfully:', profile);
        setUserProfile(profile);
        return profile;
      } catch (initialError) {
        console.error('Error in profile creation. Detailed error:', initialError);
        
          // On failure, try with just the required fields
          try {
            console.log('Attempting with minimal profile data');
            const minimalProfile = {
              uid,
              displayName: completeProfileData.displayName,
              username: completeProfileData.username,
              email: completeProfileData.email,
              createdAt: new Date().toISOString()
            };
          
          const profile = await UserService.createUserProfile(uid, minimalProfile);
          console.log('Minimal profile created successfully:', profile);
          setUserProfile(profile);
          return profile;
        } catch (retryError: any) {
          console.error('Both profile creation attempts failed:', retryError);
          throw new Error(`Failed to create user profile: ${retryError.message || 'Unknown error'}`);
        }
      }
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile: ' + (err.message || ''));
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to update profile
  const updateProfile = async (updates: Partial<UserProfile>): Promise<UserProfile> => {
    if (!currentUser) {
      throw new Error('User must be logged in to update profile');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const updatedProfile = await UserService.updateUserProfile(currentUser.uid, updates);
      setUserProfile(updatedProfile);
      return updatedProfile;
    } catch (err: any) {
      console.error('Error updating profile:', err);
      setError(err.message || 'Failed to update profile');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  // Function to manually refresh profile
  const refreshProfile = async () => {
    await fetchUserProfile();
  };

  const value: ProfileContextType = {
    userProfile,
    loading,
    error,
    updateProfile,
    refreshProfile,
    createProfile,
    checkProfileExists
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}