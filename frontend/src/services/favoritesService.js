/**
 * Multi-Solution Favorites Service
 * Provides multiple fallback methods for managing favorite images
 */

import { imageService } from './index';

class FavoritesService {
  constructor() {
    this.favoritesKey = 'promptcanvas_favorites';
    this.syncKey = 'promptcanvas_favorites_sync';
    this.maxLocalFavorites = 200;
  }

  // ==================== MAIN METHODS ====================

  /**
   * Toggle favorite status with multiple fallbacks
   */
  async toggleFavorite(imageId, currentStatus) {
    const newStatus = !currentStatus;
    const results = {
      api: false,
      localStorage: false,
      memory: false,
      final: newStatus
    };

    console.log(`💖 Toggling favorite for ${imageId}: ${currentStatus} → ${newStatus}`);

    // Method 1: Try API first
    try {
      const apiResult = await imageService.toggleFavorite(imageId, newStatus);
      if (apiResult.success) {
        results.api = true;
        console.log('✅ API favorite toggle successful');
      } else {
        console.warn('⚠️ API favorite toggle failed:', apiResult.error);
      }
    } catch (apiError) {
      console.warn('⚠️ API favorite toggle error:', apiError);
    }

    // Method 2: Always update local storage
    try {
      results.localStorage = this.updateLocalFavorite(imageId, newStatus);
      console.log(`✅ Local favorite ${newStatus ? 'added' : 'removed'}`);
    } catch (localError) {
      console.warn('⚠️ Local favorite update failed:', localError);
    }

    // Method 3: Always update memory
    try {
      results.memory = this.updateMemoryFavorite(imageId, newStatus);
      console.log(`✅ Memory favorite ${newStatus ? 'added' : 'removed'}`);
    } catch (memoryError) {
      console.warn('⚠️ Memory favorite update failed:', memoryError);
    }

    // Mark for sync if API failed
    if (!results.api) {
      this.markForSync(imageId, newStatus);
    }

    return {
      success: true,
      newStatus: newStatus,
      results: results
    };
  }

  /**
   * Get all favorites from multiple sources
   */
  async getAllFavorites() {
    const sources = {
      api: [],
      localStorage: [],
      memory: []
    };

    // Method 1: Try API first
    try {
      console.log('📡 Fetching favorites from API...');
      const apiResult = await imageService.getFavorites({ limit: 100 });
      if (apiResult.success) {
        sources.api = apiResult.data.images || [];
        console.log(`✅ API favorites: ${sources.api.length}`);
      }
    } catch (apiError) {
      console.warn('⚠️ API favorites fetch failed:', apiError);
    }

    // Method 2: Get local favorites
    try {
      sources.localStorage = this.getLocalFavorites();
      console.log(`✅ Local favorites: ${sources.localStorage.length}`);
    } catch (localError) {
      console.warn('⚠️ Local favorites fetch failed:', localError);
    }

    // Method 3: Get memory favorites
    try {
      sources.memory = this.getMemoryFavorites();
      console.log(`✅ Memory favorites: ${sources.memory.length}`);
    } catch (memoryError) {
      console.warn('⚠️ Memory favorites fetch failed:', memoryError);
    }

    // Merge and return
    return this.mergeFavoriteSources(sources);
  }

  /**
   * Check if image is favorite (from multiple sources)
   */
  async isFavorite(imageId) {
    // Check memory first (fastest)
    if (this.isMemoryFavorite(imageId)) {
      return true;
    }

    // Check localStorage
    if (this.isLocalFavorite(imageId)) {
      return true;
    }

    // Check API as fallback
    try {
      const favorites = await this.getAllFavorites();
      return favorites.some(fav => fav.id === imageId);
    } catch (error) {
      console.warn('⚠️ Favorite check failed:', error);
      return false;
    }
  }

  // ==================== LOCAL STORAGE METHODS ====================

  updateLocalFavorite(imageId, isFavorite) {
    try {
      const favorites = this.getLocalFavorites();
      
      if (isFavorite) {
        // Add to favorites
        if (!favorites.includes(imageId)) {
          const updated = [imageId, ...favorites].slice(0, this.maxLocalFavorites);
          localStorage.setItem(this.favoritesKey, JSON.stringify(updated));
        }
      } else {
        // Remove from favorites
        const updated = favorites.filter(id => id !== imageId);
        localStorage.setItem(this.favoritesKey, JSON.stringify(updated));
      }
      
      return true;
    } catch (error) {
      console.warn('localStorage favorite update failed:', error);
      return false;
    }
  }

  getLocalFavorites() {
    try {
      const data = localStorage.getItem(this.favoritesKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('localStorage favorites read failed:', error);
      return [];
    }
  }

  isLocalFavorite(imageId) {
    return this.getLocalFavorites().includes(imageId);
  }

  // ==================== MEMORY METHODS ====================

  updateMemoryFavorite(imageId, isFavorite) {
    try {
      if (!window.promptCanvasFavorites) {
        window.promptCanvasFavorites = new Set();
      }

      if (isFavorite) {
        window.promptCanvasFavorites.add(imageId);
      } else {
        window.promptCanvasFavorites.delete(imageId);
      }

      return true;
    } catch (error) {
      console.warn('Memory favorite update failed:', error);
      return false;
    }
  }

  getMemoryFavorites() {
    try {
      return Array.from(window.promptCanvasFavorites || []);
    } catch (error) {
      console.warn('Memory favorites read failed:', error);
      return [];
    }
  }

  isMemoryFavorite(imageId) {
    try {
      return window.promptCanvasFavorites?.has(imageId) || false;
    } catch (error) {
      return false;
    }
  }

  // ==================== SYNC METHODS ====================

  markForSync(imageId, isFavorite) {
    try {
      const syncData = this.getSyncQueue();
      syncData[imageId] = {
        isFavorite: isFavorite,
        timestamp: Date.now()
      };
      localStorage.setItem(this.syncKey, JSON.stringify(syncData));
    } catch (error) {
      console.warn('Sync marking failed:', error);
    }
  }

  getSyncQueue() {
    try {
      const data = localStorage.getItem(this.syncKey);
      return data ? JSON.parse(data) : {};
    } catch (error) {
      return {};
    }
  }

  async syncPendingFavorites() {
    const syncQueue = this.getSyncQueue();
    const syncResults = [];

    for (const [imageId, syncData] of Object.entries(syncQueue)) {
      try {
        const result = await imageService.toggleFavorite(imageId, syncData.isFavorite);
        if (result.success) {
          syncResults.push({ imageId, success: true });
          // Remove from sync queue
          delete syncQueue[imageId];
        } else {
          syncResults.push({ imageId, success: false, error: result.error });
        }
      } catch (error) {
        syncResults.push({ imageId, success: false, error: error.message });
      }
    }

    // Update sync queue
    localStorage.setItem(this.syncKey, JSON.stringify(syncQueue));

    console.log('🔄 Sync completed:', syncResults);
    return syncResults;
  }

  // ==================== UTILITY METHODS ====================

  mergeFavoriteSources(sources) {
    const allFavoriteIds = new Set();
    const favoriteImages = [];

    // Priority: API > localStorage > memory
    const priorityOrder = ['api', 'localStorage', 'memory'];

    for (const source of priorityOrder) {
      const sourceData = sources[source] || [];
      
      if (source === 'api') {
        // API returns full image objects
        for (const image of sourceData) {
          if (image.id && !allFavoriteIds.has(image.id)) {
            allFavoriteIds.add(image.id);
            favoriteImages.push({ ...image, source: 'api' });
          }
        }
      } else {
        // Local sources return just IDs
        for (const imageId of sourceData) {
          if (imageId && !allFavoriteIds.has(imageId)) {
            allFavoriteIds.add(imageId);
            favoriteImages.push({ 
              id: imageId, 
              isFavorite: true, 
              source: source,
              placeholder: true 
            });
          }
        }
      }
    }

    return favoriteImages.sort((a, b) => 
      new Date(b.created_at || b.timestamp || 0) - new Date(a.created_at || a.timestamp || 0)
    );
  }

  // ==================== MAINTENANCE ====================

  clearOldSyncData() {
    try {
      const syncQueue = this.getSyncQueue();
      const cutoffTime = Date.now() - (24 * 60 * 60 * 1000); // 24 hours ago
      
      for (const [imageId, syncData] of Object.entries(syncQueue)) {
        if (syncData.timestamp < cutoffTime) {
          delete syncQueue[imageId];
        }
      }
      
      localStorage.setItem(this.syncKey, JSON.stringify(syncQueue));
      console.log('🧹 Old sync data cleared');
    } catch (error) {
      console.warn('Sync cleanup failed:', error);
    }
  }

  // ==================== EXPORT/IMPORT ====================

  exportFavorites() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      favorites: this.getLocalFavorites(),
      syncQueue: this.getSyncQueue()
    };
  }

  importFavorites(exportData) {
    try {
      if (exportData.version === '1.0' && Array.isArray(exportData.favorites)) {
        localStorage.setItem(this.favoritesKey, JSON.stringify(exportData.favorites));
        
        if (exportData.syncQueue) {
          localStorage.setItem(this.syncKey, JSON.stringify(exportData.syncQueue));
        }
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Favorites import failed:', error);
      return false;
    }
  }
}

export default new FavoritesService();
