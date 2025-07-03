/**
 * Storage Recovery Utility
 * Helps recover and debug lost images from various storage locations
 */

export class StorageRecovery {
  constructor() {
    this.storageKeys = {
      gallery: 'promptcanvas_gallery',
      history: 'promptcanvas_history',
      favorites: 'promptcanvas_favorites',
      stats: 'promptcanvas_stats'
    };
  }

  /**
   * Check all storage locations for user data
   */
  checkAllStorage() {
    const report = {
      localStorage: this.checkLocalStorage(),
      sessionStorage: this.checkSessionStorage(),
      indexedDB: null, // Will be populated async
      memory: this.checkMemoryStorage(),
      summary: {}
    };

    // Calculate summary
    report.summary = {
      totalImages: report.localStorage.images.length + report.sessionStorage.images.length + report.memory.images.length,
      totalHistory: report.localStorage.history.length + report.sessionStorage.history.length,
      totalFavorites: report.localStorage.favorites.length + report.sessionStorage.favorites.length,
      hasData: false
    };

    report.summary.hasData = report.summary.totalImages > 0 || report.summary.totalHistory > 0;

    return report;
  }

  /**
   * Check localStorage for user data
   */
  checkLocalStorage() {
    const data = {
      images: [],
      history: [],
      favorites: [],
      stats: null,
      rawKeys: []
    };

    try {
      // Check all localStorage keys
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.includes('promptcanvas')) {
          data.rawKeys.push(key);
          
          try {
            const value = localStorage.getItem(key);
            const parsed = JSON.parse(value);

            if (key.includes('gallery') && Array.isArray(parsed)) {
              data.images = parsed;
            } else if (key.includes('history') && Array.isArray(parsed)) {
              data.history = parsed;
            } else if (key.includes('favorites') && Array.isArray(parsed)) {
              data.favorites = parsed;
            } else if (key.includes('stats')) {
              data.stats = parsed;
            }
          } catch (e) {
            console.warn(`Failed to parse ${key}:`, e);
          }
        }
      }
    } catch (error) {
      console.error('localStorage check failed:', error);
    }

    return data;
  }

  /**
   * Check sessionStorage for user data
   */
  checkSessionStorage() {
    const data = {
      images: [],
      history: [],
      favorites: [],
      rawKeys: []
    };

    try {
      for (let i = 0; i < sessionStorage.length; i++) {
        const key = sessionStorage.key(i);
        if (key && key.includes('promptcanvas')) {
          data.rawKeys.push(key);
          
          try {
            const value = sessionStorage.getItem(key);
            const parsed = JSON.parse(value);

            if (key.includes('gallery') && Array.isArray(parsed)) {
              data.images = parsed;
            } else if (key.includes('history') && Array.isArray(parsed)) {
              data.history = parsed;
            } else if (key.includes('favorites') && Array.isArray(parsed)) {
              data.favorites = parsed;
            }
          } catch (e) {
            console.warn(`Failed to parse ${key}:`, e);
          }
        }
      }
    } catch (error) {
      console.error('sessionStorage check failed:', error);
    }

    return data;
  }

  /**
   * Check memory storage for user data
   */
  checkMemoryStorage() {
    const data = {
      images: [],
      history: [],
      favorites: []
    };

    try {
      if (window.promptCanvasMemoryGallery) {
        data.images = window.promptCanvasMemoryGallery;
      }
      if (window.promptCanvasMemoryHistory) {
        data.history = window.promptCanvasMemoryHistory;
      }
      if (window.promptCanvasMemoryFavorites) {
        data.favorites = window.promptCanvasMemoryFavorites;
      }
    } catch (error) {
      console.error('Memory storage check failed:', error);
    }

    return data;
  }

  /**
   * Check IndexedDB for user data
   */
  async checkIndexedDB() {
    const data = {
      images: [],
      history: [],
      favorites: [],
      databases: []
    };

    try {
      // Check if IndexedDB is available
      if (!window.indexedDB) {
        return data;
      }

      // Try to open the PromptCanvas database
      const dbRequest = indexedDB.open('PromptCanvasDB', 1);
      
      return new Promise((resolve) => {
        dbRequest.onsuccess = (event) => {
          const db = event.target.result;
          data.databases.push('PromptCanvasDB');

          try {
            if (db.objectStoreNames.contains('images')) {
              const transaction = db.transaction(['images'], 'readonly');
              const store = transaction.objectStore('images');
              const request = store.getAll();

              request.onsuccess = () => {
                data.images = request.result || [];
                resolve(data);
              };

              request.onerror = () => {
                resolve(data);
              };
            } else {
              resolve(data);
            }
          } catch (error) {
            console.warn('IndexedDB read error:', error);
            resolve(data);
          }
        };

        dbRequest.onerror = () => {
          resolve(data);
        };

        dbRequest.onblocked = () => {
          resolve(data);
        };
      });
    } catch (error) {
      console.error('IndexedDB check failed:', error);
      return data;
    }
  }

  /**
   * Export all found data for backup
   */
  exportAllData() {
    const report = this.checkAllStorage();
    
    const exportData = {
      timestamp: new Date().toISOString(),
      report: report,
      backup: {
        images: [],
        history: [],
        favorites: [],
        stats: null
      }
    };

    // Combine all images from different storage locations
    exportData.backup.images = [
      ...report.localStorage.images,
      ...report.sessionStorage.images,
      ...report.memory.images
    ];

    // Remove duplicates based on ID
    exportData.backup.images = exportData.backup.images.filter((img, index, self) => 
      index === self.findIndex(i => i.id === img.id)
    );

    // Combine history
    exportData.backup.history = [
      ...report.localStorage.history,
      ...report.sessionStorage.history,
      ...report.memory.history
    ];

    // Remove duplicates
    exportData.backup.history = exportData.backup.history.filter((item, index, self) => 
      index === self.findIndex(i => i.id === item.id)
    );

    // Combine favorites
    exportData.backup.favorites = [
      ...report.localStorage.favorites,
      ...report.sessionStorage.favorites,
      ...report.memory.favorites
    ];

    exportData.backup.stats = report.localStorage.stats;

    return exportData;
  }

  /**
   * Download backup as JSON file
   */
  downloadBackup() {
    const data = this.exportAllData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `promptcanvas-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('📥 Backup downloaded:', data);
    return data;
  }

  /**
   * Restore data from backup
   */
  restoreFromBackup(backupData) {
    try {
      if (backupData.backup) {
        // Restore images to localStorage
        if (backupData.backup.images.length > 0) {
          localStorage.setItem(this.storageKeys.gallery, JSON.stringify(backupData.backup.images));
        }

        // Restore history
        if (backupData.backup.history.length > 0) {
          localStorage.setItem(this.storageKeys.history, JSON.stringify(backupData.backup.history));
        }

        // Restore favorites
        if (backupData.backup.favorites.length > 0) {
          localStorage.setItem(this.storageKeys.favorites, JSON.stringify(backupData.backup.favorites));
        }

        // Restore stats
        if (backupData.backup.stats) {
          localStorage.setItem(this.storageKeys.stats, JSON.stringify(backupData.backup.stats));
        }

        console.log('✅ Data restored from backup');
        return { success: true, restored: backupData.backup };
      }
    } catch (error) {
      console.error('❌ Restore failed:', error);
      return { success: false, error };
    }
  }

  /**
   * Clear all storage (use with caution!)
   */
  clearAllStorage() {
    try {
      // Clear localStorage
      Object.values(this.storageKeys).forEach(key => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      Object.values(this.storageKeys).forEach(key => {
        sessionStorage.removeItem(key);
      });

      // Clear memory storage
      delete window.promptCanvasMemoryGallery;
      delete window.promptCanvasMemoryHistory;
      delete window.promptCanvasMemoryFavorites;

      console.log('🗑️ All storage cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Clear storage failed:', error);
      return { success: false, error };
    }
  }
}

// Create global instance for easy access
window.storageRecovery = new StorageRecovery();

export default StorageRecovery;
