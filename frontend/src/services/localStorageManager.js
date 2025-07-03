/**
 * Local Storage Manager
 * Centralized service for managing all local data storage
 * Handles: Stats, Gallery, History, Favorites
 */

class LocalStorageManager {
  constructor() {
    this.baseKeys = {
      stats: 'promptcanvas_stats',
      gallery: 'promptcanvas_gallery',
      history: 'promptcanvas_history',
      favorites: 'promptcanvas_favorites'
    };

    this.maxItems = {
      gallery: 500,
      history: 200,
      favorites: 300
    };

    // Event listeners for stats updates
    this.statsListeners = new Set();

    // Current user tracking
    this.currentUserEmail = null;

    // Initialize with default keys (will be updated when user is set)
    this.keys = { ...this.baseKeys };

    // Try to auto-detect user from stored email
    this.autoSetUser();

    this.initializeStorage();
  }

  // Set user-specific keys based on user email
  setUser(userEmail) {
    if (userEmail) {
      this.currentUserEmail = userEmail;
      const userSuffix = `_${userEmail.replace(/[^a-zA-Z0-9@.]/g, '_')}`;
      this.keys = {
        stats: this.baseKeys.stats + userSuffix,
        gallery: this.baseKeys.gallery + userSuffix,
        history: this.baseKeys.history + userSuffix,
        favorites: this.baseKeys.favorites + userSuffix
      };

      console.log('📧 User-specific storage keys set for:', userEmail);
      console.log('🔑 Storage keys:', this.keys);

      // Store current user email for persistence
      localStorage.setItem('promptcanvas_current_user', userEmail);

      // Reinitialize storage for this user
      this.initializeStorage();

      // Notify that user has changed
      this.notifyStatsChange();
    } else {
      // Use default keys if no user
      this.keys = { ...this.baseKeys };
      this.currentUserEmail = null;
    }
  }

  // Get current user email
  getCurrentUser() {
    return this.currentUserEmail || localStorage.getItem('promptcanvas_current_user');
  }

  // Auto-detect and set user from stored email
  autoSetUser() {
    const storedUser = localStorage.getItem('promptcanvas_current_user');
    if (storedUser && !this.currentUserEmail) {
      console.log('🔄 Auto-setting user from stored email:', storedUser);
      this.setUser(storedUser);
      return true;
    }
    return false;
  }

  // ==================== INITIALIZATION ====================
  
  initializeStorage() {
    try {
      // Initialize stats if not exists
      if (!localStorage.getItem(this.keys.stats)) {
        this.resetStats();
      }

      // Initialize other storages if not exists
      ['gallery', 'history', 'favorites'].forEach(key => {
        if (!localStorage.getItem(this.keys[key])) {
          localStorage.setItem(this.keys[key], JSON.stringify([]));
        }
      });

      console.log('✅ Local storage initialized');
    } catch (error) {
      console.error('❌ Failed to initialize local storage:', error);
    }
  }

  // Clear all data and start fresh
  clearAllDataAndReset() {
    try {
      console.log('🗑️ Clearing all existing data...');

      // Remove all existing data
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });

      // Also remove any cleanup flags
      localStorage.removeItem('promptcanvas_cleaned_up');
      localStorage.removeItem('promptcanvas_cleaned_up_v2');

      // Reinitialize with fresh data
      this.initializeStorage();

      console.log('✅ All data cleared and reset');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear and reset data:', error);
      return { success: false, error };
    }
  }

  // Force complete reset (can be called from console)
  forceCompleteReset() {
    try {
      console.log('🚨 NUCLEAR RESET - Clearing EVERYTHING to remove hardcoded 24, 8...');

      // NUCLEAR OPTION: Clear ALL localStorage
      console.log('� CLEARING ALL LOCALSTORAGE...');
      // Clear only PromptCanvas data, not all localStorage
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
        console.log(`🗑️ Removed: ${key}`);
      });

      // Remove cleanup flags
      localStorage.removeItem('promptcanvas_cleaned_up_final');
      localStorage.removeItem('promptcanvas_cleaned_up');
      localStorage.removeItem('promptcanvas_cleaned_up_v2');
      localStorage.removeItem('promptcanvas_cleaned_up_v3');
      localStorage.removeItem('promptcanvas_cleaned_up_v4');
      console.log('✅ ALL localStorage cleared');

      // Reinitialize with fresh zero data
      this.initializeStorage();

      console.log('✅ MANUAL RESET FINISHED - All PromptCanvas data cleared');
      return { success: true, message: 'Manual reset successful - all data cleared' };
    } catch (error) {
      console.error('❌ Nuclear reset failed:', error);
      return { success: false, error };
    }
  }

  // ==================== STATS MANAGEMENT ====================
  
  getStats() {
    try {
      const data = localStorage.getItem(this.keys.stats);
      return data ? JSON.parse(data) : this.getDefaultStats();
    } catch (error) {
      console.error('❌ Failed to get stats:', error);
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

      localStorage.setItem(this.keys.stats, JSON.stringify(newStats));
      console.log('📊 Stats updated:', newStats);

      // Notify listeners of stats change
      this.notifyStatsChange();

      return newStats;
    } catch (error) {
      console.error('❌ Failed to update stats:', error);
      return this.getStats();
    }
  }

  incrementImageCount() {
    const stats = this.getStats();
    return this.updateStats({
      total_images: stats.total_images + 1,
      this_month_count: stats.this_month_count + 1,
      this_week_count: stats.this_week_count + 1,
      daily_generations_used: stats.daily_generations_used + 1
    });
  }

  incrementFavoriteCount() {
    const stats = this.getStats();
    return this.updateStats({
      favorites_count: stats.favorites_count + 1
    });
  }

  decrementFavoriteCount() {
    const stats = this.getStats();
    return this.updateStats({
      favorites_count: Math.max(0, stats.favorites_count - 1)
    });
  }

  resetStats() {
    const defaultStats = this.getDefaultStats();
    localStorage.setItem(this.keys.stats, JSON.stringify(defaultStats));
    return defaultStats;
  }

  // ==================== GALLERY MANAGEMENT ====================
  
  addImageToGallery(imageData) {
    try {
      const gallery = this.getGallery();
      
      const galleryItem = {
        id: imageData.id,
        url: imageData.url,
        file_url: imageData.file_url || imageData.url,
        thumbnail_url: imageData.thumbnail_url || imageData.url,
        prompt: imageData.prompt,
        negative_prompt: imageData.negative_prompt || '',
        width: imageData.width || 1024,
        height: imageData.height || 1024,
        steps: imageData.steps || 4,
        guidance_scale: imageData.guidance_scale || 7.5,
        seed: imageData.seed || -1,
        style: imageData.style || 'none',
        is_favorite: false,
        created_at: imageData.created_at || new Date().toISOString(),
        file_size: imageData.file_size || 0
      };

      // Add to beginning and limit size
      const updatedGallery = [galleryItem, ...gallery.filter(img => img.id !== imageData.id)]
        .slice(0, this.maxItems.gallery);
      
      localStorage.setItem(this.keys.gallery, JSON.stringify(updatedGallery));
      console.log('🖼️ Image added to gallery:', imageData.id);
      
      // Update stats
      this.incrementImageCount();
      
      return { success: true, item: galleryItem };
    } catch (error) {
      console.error('❌ Failed to add image to gallery:', error);
      return { success: false, error };
    }
  }

  getGallery() {
    try {
      const data = localStorage.getItem(this.keys.gallery);
      const gallery = data ? JSON.parse(data) : [];
      
      // Sort by creation date (newest first)
      return gallery.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (error) {
      console.error('❌ Failed to get gallery:', error);
      return [];
    }
  }

  removeImageFromGallery(imageId) {
    try {
      const gallery = this.getGallery();
      const imageToDelete = gallery.find(img => img.id === imageId);

      if (!imageToDelete) {
        console.warn('⚠️ Image not found in gallery:', imageId);
        return { success: false, error: 'Image not found' };
      }

      const updatedGallery = gallery.filter(img => img.id !== imageId);
      localStorage.setItem(this.keys.gallery, JSON.stringify(updatedGallery));

      // Update stats - decrement image count
      const stats = this.getStats();
      this.updateStats({
        total_images: Math.max(0, stats.total_images - 1),
        this_month_count: Math.max(0, stats.this_month_count - 1),
        this_week_count: Math.max(0, stats.this_week_count - 1),
        daily_generations_used: Math.max(0, stats.daily_generations_used - 1)
      });

      console.log('🗑️ Image removed from gallery and stats updated:', imageId);

      return { success: true, deletedImage: imageToDelete };
    } catch (error) {
      console.error('❌ Failed to remove image from gallery:', error);
      return { success: false, error };
    }
  }

  // ==================== HISTORY MANAGEMENT ====================
  
  addToHistory(generationData) {
    try {
      const history = this.getHistory();
      
      const historyItem = {
        id: generationData.id || `gen_${Date.now()}`,
        prompt: generationData.prompt,
        negative_prompt: generationData.negative_prompt || '',
        width: generationData.width || 1024,
        height: generationData.height || 1024,
        steps: generationData.steps || 4,
        guidance_scale: generationData.guidance_scale || 7.5,
        seed: generationData.seed || -1,
        style: generationData.style || 'none',
        model: 'black-forest-labs/FLUX.1-schnell-Free',
        created_at: generationData.created_at || new Date().toISOString(),
        image_id: generationData.id,
        success: true
      };

      // Add to beginning and limit size
      const updatedHistory = [historyItem, ...history.filter(h => h.id !== historyItem.id)]
        .slice(0, this.maxItems.history);
      
      localStorage.setItem(this.keys.history, JSON.stringify(updatedHistory));
      console.log('📜 Added to history:', historyItem.id);
      
      return { success: true, item: historyItem };
    } catch (error) {
      console.error('❌ Failed to add to history:', error);
      return { success: false, error };
    }
  }

  getHistory() {
    try {
      const data = localStorage.getItem(this.keys.history);
      const history = data ? JSON.parse(data) : [];
      
      // Sort by creation date (newest first)
      return history.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (error) {
      console.error('❌ Failed to get history:', error);
      return [];
    }
  }

  // ==================== FAVORITES MANAGEMENT ====================
  
  toggleFavorite(imageId, isFavorite) {
    try {
      console.log(`💖 Toggling favorite for ${imageId}: ${isFavorite}`);

      const favorites = this.getFavorites();
      let updatedFavorites;
      let statsChanged = false;

      if (isFavorite) {
        // Add to favorites
        if (!favorites.includes(imageId)) {
          updatedFavorites = [imageId, ...favorites].slice(0, this.maxItems.favorites);
          this.incrementFavoriteCount();
          statsChanged = true;
          console.log(`💖 Added ${imageId} to favorites list`);
        } else {
          updatedFavorites = favorites;
          console.log(`💖 ${imageId} already in favorites`);
        }
      } else {
        // Remove from favorites
        if (favorites.includes(imageId)) {
          updatedFavorites = favorites.filter(id => id !== imageId);
          this.decrementFavoriteCount();
          statsChanged = true;
          console.log(`💖 Removed ${imageId} from favorites list`);
        } else {
          updatedFavorites = favorites;
          console.log(`💖 ${imageId} was not in favorites`);
        }
      }

      // Save updated favorites list
      localStorage.setItem(this.keys.favorites, JSON.stringify(updatedFavorites));
      console.log(`💖 Updated favorites list:`, updatedFavorites);

      // Update gallery item favorite status
      this.updateGalleryItemFavorite(imageId, isFavorite);

      console.log(`💖 Favorite ${isFavorite ? 'added' : 'removed'} successfully for:`, imageId);
      return { success: true, isFavorite, statsChanged };
    } catch (error) {
      console.error('❌ Failed to toggle favorite:', error);
      return { success: false, error };
    }
  }

  getFavorites() {
    try {
      const data = localStorage.getItem(this.keys.favorites);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('❌ Failed to get favorites:', error);
      return [];
    }
  }

  getFavoriteImages() {
    try {
      const favorites = this.getFavorites();
      const gallery = this.getGallery();

      console.log('💖 Getting favorite images...');
      console.log('💖 Favorites IDs:', favorites);
      console.log('🖼️ Gallery images count:', gallery.length);

      if (gallery.length > 0) {
        console.log('🖼️ Sample gallery item:', gallery[0]);
      }

      const favoriteImages = gallery.filter(img => {
        // Check multiple ways an image can be marked as favorite
        const isInFavoritesList = favorites.includes(img.id);
        const hasIsFavoriteFlag = img.is_favorite === true;
        const hasIsFavoriteProperty = img.isFavorite === true;

        const isFav = isInFavoritesList || hasIsFavoriteFlag || hasIsFavoriteProperty;

        if (isFav) {
          console.log(`💖 Found favorite image: ${img.id} (inList: ${isInFavoritesList}, is_favorite: ${hasIsFavoriteFlag}, isFavorite: ${hasIsFavoriteProperty})`);
        }

        return isFav;
      });

      console.log('💖 Final favorite images count:', favoriteImages.length);
      if (favoriteImages.length > 0) {
        console.log('💖 Favorite images:', favoriteImages.map(img => ({ id: img.id, prompt: img.prompt?.substring(0, 30) })));
      }

      return favoriteImages;
    } catch (error) {
      console.error('❌ Failed to get favorite images:', error);
      return [];
    }
  }

  isFavorite(imageId) {
    const favorites = this.getFavorites();
    return favorites.includes(imageId);
  }

  updateGalleryItemFavorite(imageId, isFavorite) {
    try {
      const gallery = this.getGallery();
      console.log(`🖼️ Updating gallery item ${imageId} favorite status to:`, isFavorite);

      const updatedGallery = gallery.map(img => {
        if (img.id === imageId) {
          console.log(`🖼️ Found image ${imageId} in gallery, updating favorite status`);
          return {
            ...img,
            is_favorite: isFavorite,
            isFavorite: isFavorite  // Set both properties for compatibility
          };
        }
        return img;
      });

      localStorage.setItem(this.keys.gallery, JSON.stringify(updatedGallery));
      console.log(`🖼️ Gallery updated for image ${imageId}`);
    } catch (error) {
      console.error('❌ Failed to update gallery item favorite:', error);
    }
  }

  // ==================== UTILITY METHODS ====================
  
  clearAllData() {
    try {
      Object.values(this.keys).forEach(key => {
        localStorage.removeItem(key);
      });
      this.initializeStorage();
      console.log('🗑️ All local data cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear all data:', error);
      return { success: false, error };
    }
  }

  exportAllData() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      stats: this.getStats(),
      gallery: this.getGallery(),
      history: this.getHistory(),
      favorites: this.getFavorites()
    };
  }

  importAllData(exportData) {
    try {
      if (exportData.version === '1.0') {
        if (exportData.stats) {
          localStorage.setItem(this.keys.stats, JSON.stringify(exportData.stats));
        }
        if (exportData.gallery) {
          localStorage.setItem(this.keys.gallery, JSON.stringify(exportData.gallery));
        }
        if (exportData.history) {
          localStorage.setItem(this.keys.history, JSON.stringify(exportData.history));
        }
        if (exportData.favorites) {
          localStorage.setItem(this.keys.favorites, JSON.stringify(exportData.favorites));
        }
        
        console.log('📦 All data imported successfully');
        return { success: true };
      }
      return { success: false, error: 'Invalid export format' };
    } catch (error) {
      console.error('❌ Failed to import data:', error);
      return { success: false, error };
    }
  }

  // ==================== DEBUG METHODS ====================
  
  logAllData() {
    console.log('📊 STATS:', this.getStats());
    console.log('🖼️ GALLERY:', this.getGallery());
    console.log('📜 HISTORY:', this.getHistory());
    console.log('💖 FAVORITES:', this.getFavorites());
    console.log('💖 FAVORITE IMAGES:', this.getFavoriteImages());
  }

  // Debug function specifically for favorites
  debugFavorites() {
    console.log('🔍 DEBUGGING FAVORITES...');

    const favorites = this.getFavorites();
    const gallery = this.getGallery();
    const favoriteImages = this.getFavoriteImages();

    console.log('💖 Favorites list:', favorites);
    console.log('🖼️ Gallery count:', gallery.length);
    console.log('💖 Favorite images count:', favoriteImages.length);

    // Check each gallery item
    gallery.forEach(img => {
      const isInList = favorites.includes(img.id);
      const hasFavoriteFlag = img.is_favorite || img.isFavorite;
      console.log(`🖼️ Image ${img.id}: inFavoritesList=${isInList}, hasFavoriteFlag=${hasFavoriteFlag}, prompt="${img.prompt?.substring(0, 30)}"`);
    });

    return {
      favoritesCount: favorites.length,
      galleryCount: gallery.length,
      favoriteImagesCount: favoriteImages.length,
      favorites,
      favoriteImages
    };
  }

  // Event system for stats updates
  addStatsListener(callback) {
    this.statsListeners.add(callback);
    console.log('📊 Added stats listener, total listeners:', this.statsListeners.size);
  }

  removeStatsListener(callback) {
    this.statsListeners.delete(callback);
    console.log('📊 Removed stats listener, total listeners:', this.statsListeners.size);
  }

  notifyStatsChange() {
    const currentStats = this.getStats();
    console.log('📊 Notifying stats change to', this.statsListeners.size, 'listeners:', currentStats);

    this.statsListeners.forEach(callback => {
      try {
        callback(currentStats);
      } catch (error) {
        console.error('❌ Error in stats listener:', error);
      }
    });
  }

  getStorageSize() {
    let totalSize = 0;
    Object.values(this.keys).forEach(key => {
      const data = localStorage.getItem(key);
      if (data) {
        totalSize += data.length;
      }
    });
    
    return {
      totalBytes: totalSize,
      totalKB: Math.round(totalSize / 1024 * 100) / 100,
      totalMB: Math.round(totalSize / (1024 * 1024) * 100) / 100
    };
  }
}

const localStorageManager = new LocalStorageManager();

// Make it available globally for debugging
if (typeof window !== 'undefined') {
  window.localStorageManager = localStorageManager;

  // Also add a quick reset function
  window.clearAllStats = () => {
    console.log('� MANUAL RESET - Clearing all stats data...');
    localStorageManager.forceCompleteReset();
    console.log('✅ Manual reset complete. Refresh the page to see changes.');
    return 'Reset complete - refresh page';
  };

  console.log('🔧 Debug tools available:');
  console.log('  - window.localStorageManager.forceCompleteReset()');
  console.log('  - window.clearAllStats()');
  console.log('  - window.localStorageManager.logAllData()');
}

export default localStorageManager;
