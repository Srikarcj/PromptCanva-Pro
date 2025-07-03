import { useState, useEffect, useCallback } from 'react';
import { useUser as useClerkUser } from '@clerk/clerk-react';
import { userService } from '../services/userService';

export const useUser = () => {
  const { user: clerkUser, isLoaded, isSignedIn } = useClerkUser();
  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Fetch user profile
  const fetchProfile = useCallback(async () => {
    if (!isSignedIn) return;
    
    setLoading(true);
    try {
      const result = await userService.getProfile();
      if (result.success) {
        setProfile(result.data);
      } else {
        setError(result.error);
      }
    } catch (err) {
      setError({
        status: 0,
        message: 'Failed to load profile',
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [isSignedIn]);

  // Fetch user stats
  const fetchStats = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      const result = await userService.getStats();
      if (result.success) {
        setStats(result.data);
      }
    } catch (err) {
      console.error('Failed to load stats:', err);
    }
  }, [isSignedIn]);

  // Fetch user settings
  const fetchSettings = useCallback(async () => {
    if (!isSignedIn) return;
    
    try {
      const result = await userService.getSettings();
      if (result.success) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error('Failed to load settings:', err);
    }
  }, [isSignedIn]);

  // Update profile
  const updateProfile = useCallback(async (profileData) => {
    try {
      const result = await userService.updateProfile(profileData);
      if (result.success) {
        setProfile(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to update profile',
          details: err.message,
        },
      };
    }
  }, []);

  // Update settings
  const updateSettings = useCallback(async (settingsData) => {
    try {
      const result = await userService.updateSettings(settingsData);
      if (result.success) {
        setSettings(result.data);
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to update settings',
          details: err.message,
        },
      };
    }
  }, []);

  // Load data when user signs in
  useEffect(() => {
    if (isLoaded && isSignedIn) {
      fetchProfile();
      fetchStats();
      fetchSettings();
    }
  }, [isLoaded, isSignedIn, fetchProfile, fetchStats, fetchSettings]);

  // Clear data when user signs out
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      setProfile(null);
      setStats(null);
      setSettings(null);
      setError(null);
    }
  }, [isLoaded, isSignedIn]);

  return {
    // Clerk user data
    clerkUser,
    isLoaded,
    isSignedIn,
    
    // Extended user data
    profile,
    stats,
    settings,
    loading,
    error,
    
    // Actions
    updateProfile,
    updateSettings,
    fetchProfile,
    fetchStats,
    fetchSettings,
  };
};

export default useUser;
