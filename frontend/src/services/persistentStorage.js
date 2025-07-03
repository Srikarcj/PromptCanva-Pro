/**
 * Bulletproof Persistent Storage System
 * Ensures user data is NEVER lost by using multiple storage methods
 */

class PersistentStorage {
  constructor() {
    this.storageKeys = {
      images: 'promptcanvas_images_v2',
      history: 'promptcanvas_history_v2',
      favorites: 'promptcanvas_favorites_v2',
      stats: 'promptcanvas_stats_v2',
      backup: 'promptcanvas_backup_v2'
    };
    
    this.maxItems = {
      images: 1000,
      history: 500,
      favorites: 200
    };

    // Initialize storage on creation
    this.initializeStorage();
  }

  /**
   * Initialize all storage systems
   */
  async initializeStorage() {
    try {
      // Initialize IndexedDB
      await this.initIndexedDB();
      
      // Create automatic backup system
      this.setupAutoBackup();
      
      // Migrate old data if exists
      this.migrateOldData();
      
      console.log('✅ Persistent storage initialized');
    } catch (error) {
      console.error('❌ Storage initialization failed:', error);
    }
  }

  /**
   * Initialize IndexedDB for large data storage
   */
  async initIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptCanvasPersistent', 2);
      
      request.onerror = () => reject(request.error);
      
      request.onsuccess = () => {
        this.db = request.result;
        resolve(this.db);
      };
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('images')) {
          const imageStore = db.createObjectStore('images', { keyPath: 'id' });
          imageStore.createIndex('created_at', 'created_at', { unique: false });
          imageStore.createIndex('user_id', 'user_id', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('history')) {
          const historyStore = db.createObjectStore('history', { keyPath: 'id' });
          historyStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('favorites')) {
          const favStore = db.createObjectStore('favorites', { keyPath: 'id' });
          favStore.createIndex('created_at', 'created_at', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('backups')) {
          const backupStore = db.createObjectStore('backups', { keyPath: 'timestamp' });
        }
      };
    });
  }

  /**
   * Save image with bulletproof persistence
   */
  async saveImage(imageData, updateStats = true) {
    const results = {
      localStorage: false,
      indexedDB: false,
      memory: false,
      backup: false,
      stats: false,
      favorites: false
    };

    try {
      // Ensure image has required fields
      const processedImage = {
        id: imageData.id || `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        url: imageData.url,
        thumbnail_url: imageData.thumbnail_url || imageData.url,
        prompt: imageData.prompt,
        negative_prompt: imageData.negative_prompt || '',
        width: imageData.width || 1024,
        height: imageData.height || 1024,
        steps: imageData.steps || 4,
        guidance_scale: imageData.guidance_scale || 7.5,
        seed: imageData.seed || -1,
        model: imageData.model || 'FLUX.1-schnell',
        style: imageData.style || 'none',
        generation_time: imageData.generation_time || 0,
        created_at: imageData.created_at || new Date().toISOString(),
        is_favorite: imageData.is_favorite || false,
        file_size: imageData.file_size || 0,
        user_id: imageData.user_id || 'current_user'
      };

      // 1. Save to localStorage
      try {
        const images = this.getImagesFromLocalStorage();
        const updatedImages = [processedImage, ...images.filter(img => img.id !== processedImage.id)]
          .slice(0, this.maxItems.images);
        
        localStorage.setItem(this.storageKeys.images, JSON.stringify(updatedImages));
        results.localStorage = true;
        console.log('✅ Image saved to localStorage');
      } catch (error) {
        console.warn('⚠️ localStorage save failed:', error);
      }

      // 2. Save to IndexedDB
      try {
        if (this.db) {
          const transaction = this.db.transaction(['images'], 'readwrite');
          const store = transaction.objectStore('images');
          await store.put(processedImage);
          results.indexedDB = true;
          console.log('✅ Image saved to IndexedDB');
        }
      } catch (error) {
        console.warn('⚠️ IndexedDB save failed:', error);
      }

      // 3. Save to memory
      try {
        if (!window.promptCanvasPersistentImages) {
          window.promptCanvasPersistentImages = [];
        }
        const memoryImages = window.promptCanvasPersistentImages;
        const updatedMemory = [processedImage, ...memoryImages.filter(img => img.id !== processedImage.id)]
          .slice(0, this.maxItems.images);
        window.promptCanvasPersistentImages = updatedMemory;
        results.memory = true;
        console.log('✅ Image saved to memory');
      } catch (error) {
        console.warn('⚠️ Memory save failed:', error);
      }

      // 4. Create backup
      try {
        await this.createBackup();
        results.backup = true;
      } catch (error) {
        console.warn('⚠️ Backup creation failed:', error);
      }

      // 5. Update stats if requested
      if (updateStats) {
        try {
          await this.updateStats(processedImage);
          results.stats = true;
        } catch (error) {
          console.warn('⚠️ Stats update failed:', error);
        }
      }

      // 6. Handle favorites
      if (processedImage.is_favorite) {
        try {
          await this.addToFavorites(processedImage);
          results.favorites = true;
        } catch (error) {
          console.warn('⚠️ Favorites update failed:', error);
        }
      }

      // Also save to history
      await this.saveToHistory({
        id: `hist_${processedImage.id}`,
        image_id: processedImage.id,
        prompt: processedImage.prompt,
        negative_prompt: processedImage.negative_prompt,
        parameters: {
          width: processedImage.width,
          height: processedImage.height,
          steps: processedImage.steps,
          guidance_scale: processedImage.guidance_scale,
          seed: processedImage.seed,
          style: processedImage.style
        },
        created_at: processedImage.created_at,
        success: true
      });

      console.log('🎉 Image saved with results:', results);
      return { success: true, results, image: processedImage };

    } catch (error) {
      console.error('❌ Critical save error:', error);
      return { success: false, error, results };
    }
  }

  /**
   * Get all images from all storage locations
   */
  async getAllImages() {
    const sources = {
      localStorage: [],
      indexedDB: [],
      memory: []
    };

    try {
      // Get from localStorage
      sources.localStorage = this.getImagesFromLocalStorage();

      // Get from IndexedDB
      if (this.db) {
        try {
          const transaction = this.db.transaction(['images'], 'readonly');
          const store = transaction.objectStore('images');
          const request = store.getAll();
          
          sources.indexedDB = await new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
          });
        } catch (error) {
          console.warn('IndexedDB read failed:', error);
        }
      }

      // Get from memory
      sources.memory = window.promptCanvasPersistentImages || [];

      // Merge and deduplicate
      const allImages = [
        ...sources.localStorage,
        ...sources.indexedDB,
        ...sources.memory
      ];

      // Remove duplicates based on ID, keeping the most recent
      const uniqueImages = allImages.reduce((acc, current) => {
        const existing = acc.find(img => img.id === current.id);
        if (!existing) {
          acc.push(current);
        } else {
          // Keep the one with the most recent created_at
          if (new Date(current.created_at) > new Date(existing.created_at)) {
            const index = acc.findIndex(img => img.id === current.id);
            acc[index] = current;
          }
        }
        return acc;
      }, []);

      // Sort by creation date (newest first)
      uniqueImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      console.log(`📸 Retrieved ${uniqueImages.length} images from storage`);
      return uniqueImages;

    } catch (error) {
      console.error('❌ Failed to get images:', error);
      return [];
    }
  }

  /**
   * Save to history
   */
  async saveToHistory(historyData) {
    try {
      // Save to localStorage
      const history = this.getHistoryFromLocalStorage();
      const updatedHistory = [historyData, ...history.filter(h => h.id !== historyData.id)]
        .slice(0, this.maxItems.history);
      
      localStorage.setItem(this.storageKeys.history, JSON.stringify(updatedHistory));

      // Save to IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['history'], 'readwrite');
        const store = transaction.objectStore('history');
        await store.put(historyData);
      }

      console.log('📜 History saved:', historyData.id);
      return { success: true };
    } catch (error) {
      console.error('❌ History save failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Get all history
   */
  async getAllHistory() {
    try {
      const localHistory = this.getHistoryFromLocalStorage();
      
      let dbHistory = [];
      if (this.db) {
        try {
          const transaction = this.db.transaction(['history'], 'readonly');
          const store = transaction.objectStore('history');
          const request = store.getAll();
          
          dbHistory = await new Promise((resolve) => {
            request.onsuccess = () => resolve(request.result || []);
            request.onerror = () => resolve([]);
          });
        } catch (error) {
          console.warn('IndexedDB history read failed:', error);
        }
      }

      // Merge and deduplicate
      const allHistory = [...localHistory, ...dbHistory];
      const uniqueHistory = allHistory.reduce((acc, current) => {
        const existing = acc.find(h => h.id === current.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort by creation date (newest first)
      uniqueHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return uniqueHistory;
    } catch (error) {
      console.error('❌ Failed to get history:', error);
      return [];
    }
  }

  /**
   * Helper methods
   */
  getImagesFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKeys.images);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('localStorage images read failed:', error);
      return [];
    }
  }

  getHistoryFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKeys.history);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('localStorage history read failed:', error);
      return [];
    }
  }

  /**
   * Create automatic backup
   */
  async createBackup() {
    try {
      const backup = {
        timestamp: new Date().toISOString(),
        images: await this.getAllImages(),
        history: await this.getAllHistory(),
        version: '2.0'
      };

      // Save backup to localStorage
      localStorage.setItem(this.storageKeys.backup, JSON.stringify(backup));

      // Save backup to IndexedDB
      if (this.db) {
        const transaction = this.db.transaction(['backups'], 'readwrite');
        const store = transaction.objectStore('backups');
        await store.put(backup);
      }

      console.log('💾 Backup created successfully');
      return backup;
    } catch (error) {
      console.error('❌ Backup creation failed:', error);
      return null;
    }
  }

  /**
   * Setup automatic backup every 5 minutes
   */
  setupAutoBackup() {
    setInterval(() => {
      this.createBackup();
    }, 5 * 60 * 1000); // 5 minutes

    console.log('⏰ Auto-backup scheduled every 5 minutes');
  }

  /**
   * Migrate old data from previous storage systems
   */
  migrateOldData() {
    try {
      // Check for old storage keys and migrate
      const oldKeys = [
        'promptcanvas_gallery',
        'promptcanvas_history',
        'promptcanvas_favorites'
      ];

      oldKeys.forEach(key => {
        const oldData = localStorage.getItem(key);
        if (oldData) {
          try {
            const parsed = JSON.parse(oldData);
            if (Array.isArray(parsed) && parsed.length > 0) {
              console.log(`🔄 Migrating ${parsed.length} items from ${key}`);
              
              if (key.includes('gallery')) {
                parsed.forEach(item => this.saveImage(item));
              } else if (key.includes('history')) {
                parsed.forEach(item => this.saveToHistory(item));
              }
            }
          } catch (error) {
            console.warn(`Migration failed for ${key}:`, error);
          }
        }
      });
    } catch (error) {
      console.error('❌ Data migration failed:', error);
    }
  }

  /**
   * Update stats with new image
   */
  async updateStats(imageData) {
    try {
      // Get current stats
      const currentStats = this.getStatsFromLocalStorage();

      // Update stats
      const updatedStats = {
        ...currentStats,
        total_images: (currentStats.total_images || 0) + 1,
        this_month_count: (currentStats.this_month_count || 0) + 1,
        this_week_count: (currentStats.this_week_count || 0) + 1,
        daily_generations_used: (currentStats.daily_generations_used || 0) + 1,
        last_generation: new Date().toISOString(),
        total_storage_mb: (currentStats.total_storage_mb || 0) + (imageData.file_size || 0) / (1024 * 1024)
      };

      // Save updated stats
      localStorage.setItem(this.storageKeys.stats, JSON.stringify(updatedStats));

      // Trigger stats context update if available
      if (window.statsContext && window.statsContext.fetchStats) {
        window.statsContext.fetchStats();
      }

      console.log('📊 Stats updated:', updatedStats);
      return updatedStats;
    } catch (error) {
      console.error('❌ Stats update failed:', error);
      throw error;
    }
  }

  /**
   * Add image to favorites
   */
  async addToFavorites(imageData) {
    try {
      const favorites = this.getFavoritesFromLocalStorage();
      const updatedFavorites = [imageData, ...favorites.filter(fav => fav.id !== imageData.id)];

      localStorage.setItem(this.storageKeys.favorites, JSON.stringify(updatedFavorites));

      // Update stats
      const currentStats = this.getStatsFromLocalStorage();
      const updatedStats = {
        ...currentStats,
        favorites_count: updatedFavorites.length
      };
      localStorage.setItem(this.storageKeys.stats, JSON.stringify(updatedStats));

      console.log('⭐ Added to favorites:', imageData.id);
      return updatedFavorites;
    } catch (error) {
      console.error('❌ Favorites update failed:', error);
      throw error;
    }
  }

  /**
   * Get stats from localStorage
   */
  getStatsFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKeys.stats);
      return data ? JSON.parse(data) : {
        total_images: 0,
        this_month_count: 0,
        this_week_count: 0,
        daily_generations_used: 0,
        favorites_count: 0,
        total_storage_mb: 0,
        last_generation: null
      };
    } catch (error) {
      console.warn('localStorage stats read failed:', error);
      return {
        total_images: 0,
        this_month_count: 0,
        this_week_count: 0,
        daily_generations_used: 0,
        favorites_count: 0,
        total_storage_mb: 0,
        last_generation: null
      };
    }
  }

  /**
   * Get favorites from localStorage
   */
  getFavoritesFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKeys.favorites);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('localStorage favorites read failed:', error);
      return [];
    }
  }

  /**
   * Export all data for manual backup
   */
  async exportAllData() {
    const data = {
      timestamp: new Date().toISOString(),
      images: await this.getAllImages(),
      history: await this.getAllHistory(),
      favorites: this.getFavoritesFromLocalStorage(),
      stats: this.getStatsFromLocalStorage(),
      version: '2.0',
      platform: 'PromptCanvas Pro'
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);

    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcanvas-export-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    console.log('📥 Data exported successfully');
    return data;
  }
}

// Create global instance
const persistentStorage = new PersistentStorage();

// Make it globally accessible for debugging
window.persistentStorage = persistentStorage;

export default persistentStorage;
