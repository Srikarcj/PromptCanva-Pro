/**
 * Multi-Solution Stats Calculation Service
 * Provides multiple methods for calculating and caching user statistics
 */

import { userService, imageService } from './index';
import galleryStorageService from './galleryStorageService';
import favoritesService from './favoritesService';

class StatsCalculationService {
  constructor() {
    this.cacheKey = 'promptcanvas_stats_cache';
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes
    this.localStatsKey = 'promptcanvas_local_stats';
  }

  // ==================== MAIN METHODS ====================

  /**
   * Get comprehensive stats from multiple sources
   */
  async getComprehensiveStats() {
    console.log('📊 Calculating comprehensive stats...');

    const sources = {
      api: null,
      local: null,
      calculated: null,
      cached: null
    };

    // Method 1: Try cached stats first
    sources.cached = this.getCachedStats();
    if (sources.cached && this.isCacheValid(sources.cached)) {
      console.log('✅ Using cached stats');
      return this.enhanceStats(sources.cached.data);
    }

    // Method 2: Try API stats
    try {
      console.log('📡 Fetching stats from API...');
      const apiResult = await userService.getStats();
      if (apiResult.success) {
        sources.api = apiResult.data;
        console.log('✅ API stats fetched successfully');
      }
    } catch (apiError) {
      console.warn('⚠️ API stats fetch failed:', apiError);
    }

    // Method 3: Calculate from local data
    try {
      console.log('💾 Calculating stats from local data...');
      sources.local = await this.calculateLocalStats();
      console.log('✅ Local stats calculated');
    } catch (localError) {
      console.warn('⚠️ Local stats calculation failed:', localError);
    }

    // Method 4: Calculate from available data
    sources.calculated = this.calculateBasicStats(sources);

    // Merge all sources and cache result
    const finalStats = this.mergeStatsSources(sources);
    this.cacheStats(finalStats);

    return this.enhanceStats(finalStats);
  }

  /**
   * Calculate stats from local storage data
   */
  async calculateLocalStats() {
    const stats = {
      total_images: 0,
      favorites_count: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      }
    };

    try {
      // Get images from local storage
      const localImages = await galleryStorageService.getAllImages();
      stats.total_images = localImages.length;
      stats.storage_usage.object_count = localImages.length;

      // Calculate storage usage
      let totalSize = 0;
      for (const image of localImages) {
        if (image.file_size) {
          totalSize += image.file_size;
        } else if (image.url && image.url.startsWith('data:image')) {
          // Estimate size from base64 data
          const base64Data = image.url.split(',')[1] || '';
          totalSize += Math.floor(base64Data.length * 0.75); // Base64 overhead
        }
      }
      
      stats.storage_usage.total_size_bytes = totalSize;
      stats.storage_usage.total_size_mb = Math.round(totalSize / (1024 * 1024) * 100) / 100;

      // Calculate time-based stats
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      for (const image of localImages) {
        const imageDate = new Date(image.created_at || image.timestamp || 0);
        
        if (imageDate >= today) {
          stats.daily_generations_used++;
        }
        
        if (imageDate >= thisWeek) {
          stats.this_week_count++;
        }
        
        if (imageDate >= thisMonth) {
          stats.this_month_count++;
        }
      }

      // Get favorites count
      const localFavorites = favoritesService.getLocalFavorites();
      stats.favorites_count = localFavorites.length;

      console.log('📊 Local stats calculated:', stats);
      return stats;

    } catch (error) {
      console.error('❌ Local stats calculation failed:', error);
      return stats;
    }
  }

  /**
   * Calculate basic stats from available sources
   */
  calculateBasicStats(sources) {
    const stats = {
      total_images: 0,
      favorites_count: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      }
    };

    // Use API data if available, otherwise local data
    const sourceData = sources.api || sources.local || stats;
    
    return {
      ...stats,
      ...sourceData,
      source: sources.api ? 'api' : sources.local ? 'local' : 'default'
    };
  }

  /**
   * Merge stats from multiple sources
   */
  mergeStatsSources(sources) {
    // Priority: API > Local > Calculated > Default
    const finalStats = {
      total_images: 0,
      favorites_count: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      }
    };

    // Use API data as primary source
    if (sources.api) {
      Object.assign(finalStats, sources.api);
      finalStats.primary_source = 'api';
    }
    // Fall back to local calculations
    else if (sources.local) {
      Object.assign(finalStats, sources.local);
      finalStats.primary_source = 'local';
    }
    // Use calculated data as last resort
    else if (sources.calculated) {
      Object.assign(finalStats, sources.calculated);
      finalStats.primary_source = 'calculated';
    }

    // Supplement missing data from other sources
    if (sources.local && !sources.api) {
      // If API failed, use local data to supplement
      finalStats.total_images = Math.max(finalStats.total_images, sources.local.total_images);
      finalStats.favorites_count = Math.max(finalStats.favorites_count, sources.local.favorites_count);
    }

    finalStats.last_updated = new Date().toISOString();
    finalStats.sources_used = Object.keys(sources).filter(key => sources[key] !== null);

    return finalStats;
  }

  /**
   * Enhance stats with calculated metrics
   */
  enhanceStats(stats) {
    const enhanced = { ...stats };

    // Calculate derived metrics
    enhanced.generation_rate = stats.daily_generations_used > 0 
      ? (stats.daily_generations_used / 24).toFixed(1) 
      : '0';

    enhanced.storage_usage_percentage = stats.storage_usage?.total_size_mb > 0 
      ? Math.min(100, (stats.storage_usage.total_size_mb / 1000) * 100).toFixed(1)
      : '0';

    enhanced.avg_images_per_day = stats.total_images > 0 
      ? (stats.total_images / 30).toFixed(1) 
      : '0';

    enhanced.favorite_percentage = stats.total_images > 0 
      ? ((stats.favorites_count / stats.total_images) * 100).toFixed(1)
      : '0';

    enhanced.this_week_count = stats.this_week_count || 0;

    return enhanced;
  }

  // ==================== CACHING METHODS ====================

  cacheStats(stats) {
    try {
      const cacheData = {
        data: stats,
        timestamp: Date.now(),
        version: '1.0'
      };
      localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      console.log('💾 Stats cached successfully');
    } catch (error) {
      console.warn('⚠️ Stats caching failed:', error);
    }
  }

  getCachedStats() {
    try {
      const cached = localStorage.getItem(this.cacheKey);
      return cached ? JSON.parse(cached) : null;
    } catch (error) {
      console.warn('⚠️ Cache read failed:', error);
      return null;
    }
  }

  isCacheValid(cachedData) {
    if (!cachedData || !cachedData.timestamp) {
      return false;
    }
    
    const age = Date.now() - cachedData.timestamp;
    return age < this.cacheTimeout;
  }

  clearCache() {
    try {
      localStorage.removeItem(this.cacheKey);
      console.log('🗑️ Stats cache cleared');
    } catch (error) {
      console.warn('⚠️ Cache clear failed:', error);
    }
  }

  // ==================== REAL-TIME UPDATES ====================

  /**
   * Update local stats when actions occur
   */
  updateLocalStats(action, data = {}) {
    try {
      const localStats = this.getLocalStats();
      
      switch (action) {
        case 'image_generated':
          localStats.total_images++;
          localStats.daily_generations_used++;
          localStats.this_month_count++;
          localStats.this_week_count++;
          break;
          
        case 'image_deleted':
          localStats.total_images = Math.max(0, localStats.total_images - 1);
          break;
          
        case 'favorite_added':
          localStats.favorites_count++;
          break;
          
        case 'favorite_removed':
          localStats.favorites_count = Math.max(0, localStats.favorites_count - 1);
          break;
      }
      
      localStats.last_updated = new Date().toISOString();
      this.saveLocalStats(localStats);
      this.clearCache(); // Invalidate cache
      
      console.log(`📊 Local stats updated for action: ${action}`);
      return localStats;
      
    } catch (error) {
      console.warn('⚠️ Local stats update failed:', error);
      return null;
    }
  }

  getLocalStats() {
    try {
      const data = localStorage.getItem(this.localStatsKey);
      return data ? JSON.parse(data) : this.getDefaultStats();
    } catch (error) {
      return this.getDefaultStats();
    }
  }

  saveLocalStats(stats) {
    try {
      localStorage.setItem(this.localStatsKey, JSON.stringify(stats));
    } catch (error) {
      console.warn('⚠️ Local stats save failed:', error);
    }
  }

  getDefaultStats() {
    return {
      total_images: 0,
      favorites_count: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      },
      last_updated: new Date().toISOString()
    };
  }

  // ==================== EXPORT/IMPORT ====================

  exportStats() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      cached: this.getCachedStats(),
      local: this.getLocalStats()
    };
  }

  importStats(exportData) {
    try {
      if (exportData.version === '1.0') {
        if (exportData.cached) {
          localStorage.setItem(this.cacheKey, JSON.stringify(exportData.cached));
        }
        if (exportData.local) {
          localStorage.setItem(this.localStatsKey, JSON.stringify(exportData.local));
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Stats import failed:', error);
      return false;
    }
  }
}

export default new StatsCalculationService();
