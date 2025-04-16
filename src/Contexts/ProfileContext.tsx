import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store/store';
import { UserService, UserProfile } from '../Services/UserService';

interface ProfileContextType {
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
  updateProfile: (updates: Partial<UserProfile>) => Promise<UserProfile>;
  refreshProfile: () => Promise<void>;
  createProfile: (profileData: Partial<UserProfile>) => Promise<UserProfile>;
}

interface ProfileProviderProps {
  children: ReactNode;
}

const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

export function useProfile() {
  const context = useContext(ProfileContext);
  if (!context) {
    throw new Error('useProfile must be used within a ProfileProvider');
  }
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
    fetchUserProfile();
  }, [currentUser?.uid]);

  // Function to create a new profile
  const createProfile = async (profileData: Partial<UserProfile>): Promise<UserProfile> => {
    if (!currentUser) {
      throw new Error('User must be logged in to create a profile');
    }
    
    try {
      setLoading(true);
      setError(null);
      
      const profile = await UserService.createUserProfile(currentUser.uid, {
        ...profileData,
        email: currentUser.email || '',
        photoURL: currentUser.photoURL || undefined
      });
      
      setUserProfile(profile);
      return profile;
    } catch (err: any) {
      console.error('Error creating profile:', err);
      setError('Failed to create profile');
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
    createProfile
  };

  return (
    <ProfileContext.Provider value={value}>
      {children}
    </ProfileContext.Provider>
  );
}