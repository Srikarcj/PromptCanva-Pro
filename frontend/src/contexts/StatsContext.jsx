import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { userService, imageService } from '../services';
import localStorageManager from '../services/localStorageManager';

const StatsContext = createContext();

export const useStats = () => {
  const context = useContext(StatsContext);
  if (!context) {
    throw new Error('useStats must be used within a StatsProvider');
  }
  return context;
};

export const StatsProvider = ({ children }) => {
  const { user } = useUser();
  const [stats, setStats] = useState({
    total_images: 0,
    this_month_count: 0,
    favorites_count: 0,
    daily_generations_used: 0,
    this_week_count: 0,
    storage_usage: {
      total_size_bytes: 0,
      total_size_mb: 0,
      object_count: 0
    }
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lastUserUpdate, setLastUserUpdate] = useState(0); // Track when user made changes

  // Multi-source stats fetching with fallbacks
  const fetchStats = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      console.log('📊 Loading stats from local storage only...');

      // Get stats directly from local storage manager
      const localStats = localStorageManager.getStats();
      console.log('✅ Local stats loaded:', localStats);

      // Use local stats as the source of truth
      const statsData = {
        total_images: localStats.total_images || 0,
        this_month_count: localStats.this_month_count || 0,
        favorites_count: localStats.favorites_count || 0,
        daily_generations_used: localStats.daily_generations_used || 0,
        this_week_count: localStats.this_week_count || 0,
        storage_usage: {
          total_size_bytes: localStats.storage_usage?.total_size_bytes || 0,
          total_size_mb: localStats.storage_usage?.total_size_mb || 0,
          object_count: localStats.storage_usage?.object_count || 0
        },
        primary_source: 'local_storage',
        last_updated: localStats.last_updated || new Date().toISOString()
      };

      setStats(statsData);
      setError(null); // No errors for local storage

      console.log('✅ Stats loaded successfully from local storage');

    } catch (err) {
      console.error('❌ Error loading local stats:', err);

      // Set default stats if local storage fails
      const defaultStats = {
        total_images: 0,
        this_month_count: 0,
        favorites_count: 0,
        daily_generations_used: 0,
        this_week_count: 0,
        storage_usage: {
          total_size_bytes: 0,
          total_size_mb: 0,
          object_count: 0
        },
        primary_source: 'default',
        last_updated: new Date().toISOString()
      };

      setStats(defaultStats);
      setError(null); // No error messages
    } finally {
      setLoading(false);
    }
  }, [user, lastUserUpdate]);

  // Initial fetch
  useEffect(() => {
    console.log('🚀 StatsContext: Initial fetch triggered');

    // Ensure user-specific storage is set up
    if (user?.emailAddresses?.[0]?.emailAddress) {
      const userEmail = user.emailAddresses[0].emailAddress;
      const currentUser = localStorageManager.getCurrentUser();

      // Always set user to ensure consistency
      if (currentUser !== userEmail) {
        console.log('📧 Setting user-specific storage for:', userEmail);
        localStorageManager.setUser(userEmail);
      } else {
        console.log('📧 User already set:', userEmail);
      }
    } else {
      // Try to auto-detect user if not logged in yet
      const autoDetected = localStorageManager.autoSetUser();
      if (autoDetected) {
        console.log('🔄 Auto-detected user from stored data');
      }
    }

    // Check if we need to do one-time cleanup (global flag, not user-specific)
    const globalCleanupFlag = 'promptcanvas_global_cleanup_done';
    const hasGlobalCleanupRun = localStorage.getItem(globalCleanupFlag);

    if (!hasGlobalCleanupRun) {
      console.log('🧹 One-time global cleanup - Removing hardcoded stats only');

      // Only clear old non-user-specific stats
      localStorage.removeItem('promptcanvas_stats');

      // Remove old cleanup flags
      localStorage.removeItem('promptcanvas_cleaned_up');
      localStorage.removeItem('promptcanvas_cleaned_up_v2');
      localStorage.removeItem('promptcanvas_cleaned_up_v3');
      localStorage.removeItem('promptcanvas_cleaned_up_v4');
      localStorage.removeItem('promptcanvas_cleaned_up_final');

      // Set global cleanup flag so this NEVER runs again for any user
      localStorage.setItem(globalCleanupFlag, 'true');

      console.log('✅ Global cleanup completed - all user data preserved forever');
    } else {
      console.log('✅ Global cleanup already done - preserving all user data');
    }

    // Load stats from local storage immediately
    try {
      const localStats = localStorageManager.getStats();
      console.log('📊 Loading initial stats from local storage:', localStats);

      // If stats are not zero and you want to reset them, run this in console:
      if (localStats.total_images > 0) {
        console.log('🔧 To reset stats to zero, run: window.localStorageManager.forceCompleteReset()');
      }

      setStats(localStats);
    } catch (error) {
      console.warn('⚠️ Could not load local stats:', error);
    }

    // No API calls needed - everything is local storage based
  }, [fetchStats, lastUserUpdate]);

  // Separate effect for stats listener (runs once)
  useEffect(() => {
    console.log('📊 Setting up stats listener...');

    const handleStatsChange = (newStats) => {
      console.log('📊 Stats changed, updating context:', newStats);
      setStats(newStats);
    };

    localStorageManager.addStatsListener(handleStatsChange);

    // Cleanup listener on unmount
    return () => {
      console.log('📊 Removing stats listener...');
      localStorageManager.removeStatsListener(handleStatsChange);
    };
  }, []); // Empty dependency array - runs once

  // Auto-refresh stats every 2 minutes, but only if no recent user updates
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      const timeSinceLastUpdate = Date.now() - lastUserUpdate;
      // Only fetch from server if no user updates in the last 2 minutes
      if (timeSinceLastUpdate > 120000) { // 2 minutes
        console.log('🔄 Auto-refreshing stats (no recent user activity)');
        fetchStats();
      } else {
        console.log('⏭️ Skipping auto-refresh (recent user activity detected)');
      }
    }, 120000); // Check every 2 minutes

    return () => clearInterval(interval);
  }, [user, fetchStats, lastUserUpdate]);

  // Update stats when new image is created
  const incrementImageCount = useCallback(() => {
    console.log('📊 INCREMENTING IMAGE COUNT - START');

    // Mark that user made an update
    const updateTime = Date.now();
    setLastUserUpdate(updateTime);
    console.log('📊 Set lastUserUpdate to:', updateTime);

    // Update local storage stats (this is the source of truth)
    try {
      const updatedStats = localStorageManager.incrementImageCount();
      console.log('📊 Local storage stats updated:', updatedStats);

      // Update UI state with the new stats from local storage
      setStats(updatedStats);
      console.log('📊 UI stats updated from local storage');

    } catch (error) {
      console.error('❌ Local storage stats update failed:', error);

      // Fallback: update UI state directly
      setStats(prev => {
        const newStats = {
          ...prev,
          total_images: (prev.total_images || 0) + 1,
          this_month_count: (prev.this_month_count || 0) + 1,
          this_week_count: (prev.this_week_count || 0) + 1,
          daily_generations_used: (prev.daily_generations_used || 0) + 1,
          last_updated: new Date().toISOString()
        };
        console.log('📊 Fallback stats update:', newStats);
        return newStats;
      });
    }

    console.log('📊 INCREMENTING IMAGE COUNT - END');
  }, []);

  // Update stats when image is favorited/unfavorited
  const updateFavoriteCount = useCallback((increment) => {
    console.log(`📊 ${increment ? 'Adding' : 'Removing'} favorite in stats`);

    // Mark that user made an update
    setLastUserUpdate(Date.now());

    // Update local storage stats
    try {
      const updatedStats = increment
        ? localStorageManager.incrementFavoriteCount()
        : localStorageManager.decrementFavoriteCount();

      console.log('📊 Favorite stats updated in local storage:', updatedStats);
      setStats(updatedStats);

    } catch (error) {
      console.error('❌ Local storage favorite update failed:', error);

      // Fallback: update UI state directly
      setStats(prev => {
        const newStats = {
          ...prev,
          favorites_count: Math.max(0, (prev.favorites_count || 0) + (increment ? 1 : -1))
        };
        console.log('📊 Fallback favorite stats update:', newStats);
        return newStats;
      });
    }
  }, []);

  // Update stats when image is deleted
  const decrementImageCount = useCallback(() => {
    console.log('📊 Decrementing image count in stats');

    // Mark that user made an update
    setLastUserUpdate(Date.now());

    // Update local stats tracking
    statsCalculationService.updateLocalStats('image_deleted');

    // Update UI state immediately
    setStats(prev => {
      const newStats = {
        ...prev,
        total_images: Math.max(0, (prev.total_images || 0) - 1),
        this_month_count: Math.max(0, (prev.this_month_count || 0) - 1),
        this_week_count: Math.max(0, (prev.this_week_count || 0) - 1)
      };
      console.log('✅ Delete stats updated:', newStats);
      return newStats;
    });
  }, []);

  // Calculate derived stats
  const derivedStats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Ensure storage_usage exists and has required properties
    const storageUsage = stats.storage_usage || {
      total_size_bytes: 0,
      total_size_mb: 0,
      object_count: 0
    };

    return {
      ...stats,
      storage_usage: storageUsage,
      generation_rate: (stats.daily_generations_used || 0) > 0
        ? ((stats.daily_generations_used || 0) / 24).toFixed(1)
        : '0',
      storage_usage_percentage: storageUsage.total_size_mb > 0
        ? Math.min(100, (storageUsage.total_size_mb / 1000) * 100).toFixed(1)
        : '0',
      avg_images_per_day: (stats.total_images || 0) > 0
        ? ((stats.total_images || 0) / 30).toFixed(1)
        : '0'
    };
  }, [stats]);

  const value = {
    stats: derivedStats,
    loading,
    error,
    fetchStats,
    incrementImageCount,
    updateFavoriteCount,
    decrementImageCount,
    refreshStats: useCallback(() => {
      console.log('🔄 Manual stats refresh triggered');
      setLastUserUpdate(0); // Reset user update timer to allow fresh fetch
      fetchStats();
    }, [fetchStats])
  };

  // Make stats context globally accessible for persistent storage
  React.useEffect(() => {
    window.statsContext = value;
    return () => {
      delete window.statsContext;
    };
  }, [value]);

  return (
    <StatsContext.Provider value={value}>
      {children}
    </StatsContext.Provider>
  );
};

export default StatsProvider;
