import api, { apiEndpoints, handleApiError } from './api';

/**
 * Usage Limit Service
 * Handles checking and displaying usage limits for authenticated and anonymous users
 */

export const usageLimitService = {
  /**
   * Get current usage limits and stats
   */
  async getUsageLimits() {
    try {
      const response = await api.get('/images/usage-limits');
      
      return {
        success: true,
        data: response.data.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  /**
   * Check if user can generate more images
   */
  async canGenerateImage() {
    try {
      const result = await this.getUsageLimits();
      
      if (result.success) {
        return {
          success: true,
          canGenerate: result.data.can_generate,
          usage: result.data,
        };
      }
      
      return {
        success: false,
        canGenerate: false,
        error: result.error,
      };
    } catch (error) {
      return {
        success: false,
        canGenerate: false,
        error: 'Failed to check usage limits',
      };
    }
  },

  /**
   * Get usage limit message for display
   */
  getUsageLimitMessage(usageData) {
    if (!usageData) return '';

    const { current_usage, limit, remaining, user_type } = usageData;

    if (user_type === 'anonymous') {
      if (remaining === 0) {
        return `You've used your ${limit} free image for today. Resets at midnight UTC. Sign up to get ${5} images per day!`;
      }
      return `Free users: ${remaining}/${limit} image remaining today. Sign up for ${5} images per day!`;
    } else {
      if (remaining === 0) {
        return `You've used all ${limit} images for today. Limit resets at midnight UTC.`;
      }
      return `${remaining}/${limit} images remaining today (resets at midnight UTC)`;
    }
  },

  /**
   * Get usage limit color for UI styling
   */
  getUsageLimitColor(usageData) {
    if (!usageData) return 'gray';

    const { remaining, limit } = usageData;
    const percentage = remaining / limit;

    if (percentage === 0) return 'red';
    if (percentage <= 0.2) return 'orange';
    if (percentage <= 0.5) return 'yellow';
    return 'green';
  },

  /**
   * Format time until reset
   */
  formatTimeUntilReset(resetTime) {
    if (!resetTime) return '';

    try {
      const reset = new Date(resetTime);
      const now = new Date();
      const diff = reset - now;

      if (diff <= 0) return 'Resetting soon...';

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        return `Resets in ${hours}h ${minutes}m (midnight UTC)`;
      }
      return `Resets in ${minutes}m (midnight UTC)`;
    } catch (error) {
      return 'Resets at midnight UTC';
    }
  },

  /**
   * Get upgrade message for anonymous users
   */
  getUpgradeMessage(usageData) {
    if (!usageData || usageData.user_type !== 'anonymous') return '';

    return {
      title: 'Get More Images!',
      message: 'Sign up for free to get 5 images per day instead of just 1!',
      benefits: [
        '5 images per day (vs 1 for anonymous)',
        'Save your images to gallery',
        'Access to generation history',
        'Favorite and organize images',
        'Higher resolution options'
      ]
    };
  },

  /**
   * Check if user should see upgrade prompt
   */
  shouldShowUpgradePrompt(usageData) {
    return usageData && 
           usageData.user_type === 'anonymous' && 
           usageData.current_usage >= usageData.limit;
  },

  /**
   * Get progress percentage for usage bar
   */
  getUsagePercentage(usageData) {
    if (!usageData) return 0;
    
    const { current_usage, limit } = usageData;
    return Math.min(100, (current_usage / limit) * 100);
  },

  /**
   * Local storage key for caching usage data
   */
  STORAGE_KEY: 'promptcanvas_usage_cache',

  /**
   * Cache usage data locally (with expiration)
   */
  cacheUsageData(usageData) {
    try {
      const cacheData = {
        data: usageData,
        timestamp: Date.now(),
        expires: Date.now() + (5 * 60 * 1000) // 5 minutes
      };
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(cacheData));
    } catch (error) {
      console.warn('Failed to cache usage data:', error);
    }
  },

  /**
   * Get cached usage data if still valid
   */
  getCachedUsageData() {
    try {
      const cached = localStorage.getItem(this.STORAGE_KEY);
      if (!cached) return null;

      const cacheData = JSON.parse(cached);
      
      // Check if cache is still valid
      if (Date.now() > cacheData.expires) {
        localStorage.removeItem(this.STORAGE_KEY);
        return null;
      }

      return cacheData.data;
    } catch (error) {
      console.warn('Failed to get cached usage data:', error);
      return null;
    }
  },

  /**
   * Get usage limits with caching
   */
  async getUsageLimitsWithCache() {
    // Try cache first
    const cached = this.getCachedUsageData();
    if (cached) {
      return {
        success: true,
        data: cached,
        fromCache: true
      };
    }

    // Fetch fresh data
    const result = await this.getUsageLimits();
    
    if (result.success) {
      this.cacheUsageData(result.data);
    }

    return result;
  },

  /**
   * Clear usage cache (call after successful generation)
   */
  clearUsageCache() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear usage cache:', error);
    }
  }
};

export default usageLimitService;
