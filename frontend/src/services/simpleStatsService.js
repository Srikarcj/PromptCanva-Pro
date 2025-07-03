/**
 * Simple Stats Service - Guaranteed to work with localStorage
 * This is a fallback service that ensures stats always work
 */

class SimpleStatsService {
  constructor() {
    this.storageKey = 'promptcanvas_simple_stats';
    this.initializeStats();
  }

  initializeStats() {
    const defaultStats = {
      total_images: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      favorites_count: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      },
      last_updated: new Date().toISOString(),
      created_at: new Date().toISOString()
    };

    try {
      const existing = localStorage.getItem(this.storageKey);
      if (!existing) {
        localStorage.setItem(this.storageKey, JSON.stringify(defaultStats));
        console.log('📊 Simple stats initialized with defaults');
      }
    } catch (error) {
      console.warn('⚠️ Could not initialize simple stats:', error);
    }
  }

  getStats() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const stats = data ? JSON.parse(data) : this.getDefaultStats();
      console.log('📊 Simple stats retrieved:', stats);
      return stats;
    } catch (error) {
      console.warn('⚠️ Could not get simple stats:', error);
      return this.getDefaultStats();
    }
  }

  getDefaultStats() {
    return {
      total_images: 0,
      this_month_count: 0,
      this_week_count: 0,
      daily_generations_used: 0,
      favorites_count: 0,
      storage_usage: {
        total_size_bytes: 0,
        total_size_mb: 0,
        object_count: 0
      },
      last_updated: new Date().toISOString()
    };
  }

  updateStats(updates) {
    try {
      const currentStats = this.getStats();
      const newStats = {
        ...currentStats,
        ...updates,
        last_updated: new Date().toISOString()
      };
      
      localStorage.setItem(this.storageKey, JSON.stringify(newStats));
      console.log('📊 Simple stats updated:', newStats);
      return newStats;
    } catch (error) {
      console.error('❌ Could not update simple stats:', error);
      return this.getStats();
    }
  }

  incrementImageCount() {
    console.log('📊 Simple stats: Incrementing image count');
    const currentStats = this.getStats();
    
    const updates = {
      total_images: (currentStats.total_images || 0) + 1,
      this_month_count: (currentStats.this_month_count || 0) + 1,
      this_week_count: (currentStats.this_week_count || 0) + 1,
      daily_generations_used: (currentStats.daily_generations_used || 0) + 1
    };
    
    return this.updateStats(updates);
  }

  incrementFavoriteCount() {
    console.log('📊 Simple stats: Incrementing favorite count');
    const currentStats = this.getStats();
    
    const updates = {
      favorites_count: (currentStats.favorites_count || 0) + 1
    };
    
    return this.updateStats(updates);
  }

  decrementFavoriteCount() {
    console.log('📊 Simple stats: Decrementing favorite count');
    const currentStats = this.getStats();
    
    const updates = {
      favorites_count: Math.max(0, (currentStats.favorites_count || 0) - 1)
    };
    
    return this.updateStats(updates);
  }

  decrementImageCount() {
    console.log('📊 Simple stats: Decrementing image count');
    const currentStats = this.getStats();
    
    const updates = {
      total_images: Math.max(0, (currentStats.total_images || 0) - 1),
      this_month_count: Math.max(0, (currentStats.this_month_count || 0) - 1),
      this_week_count: Math.max(0, (currentStats.this_week_count || 0) - 1)
    };
    
    return this.updateStats(updates);
  }

  resetStats() {
    console.log('📊 Simple stats: Resetting all stats');
    const defaultStats = this.getDefaultStats();
    localStorage.setItem(this.storageKey, JSON.stringify(defaultStats));
    return defaultStats;
  }

  exportStats() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stats: this.getStats()
    };
  }

  importStats(exportData) {
    try {
      if (exportData.version === '1.0' && exportData.stats) {
        localStorage.setItem(this.storageKey, JSON.stringify(exportData.stats));
        console.log('📊 Simple stats imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ Simple stats import failed:', error);
      return false;
    }
  }

  // Debug methods
  logCurrentStats() {
    const stats = this.getStats();
    console.log('📊 CURRENT SIMPLE STATS:', stats);
    console.table(stats);
    return stats;
  }

  testIncrement() {
    console.log('🧪 Testing simple stats increment...');
    const before = this.getStats();
    console.log('Before:', before);
    
    const after = this.incrementImageCount();
    console.log('After:', after);
    
    return {
      before: before,
      after: after,
      success: after.total_images > before.total_images
    };
  }
}

export default new SimpleStatsService();
