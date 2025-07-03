/**
 * Multi-Solution Gallery Storage Service
 * Provides multiple fallback methods for storing and retrieving gallery images
 */

class GalleryStorageService {
  constructor() {
    this.storageKey = 'promptcanvas_gallery';
    this.sessionKey = 'promptcanvas_session_gallery';
    this.maxLocalImages = 100; // Limit local storage
    this.maxSessionImages = 50; // Limit session storage
  }

  // ==================== STORAGE METHODS ====================

  /**
   * Save image to multiple storage locations
   */
  async saveImage(imageData) {
    const results = {
      localStorage: false,
      sessionStorage: false,
      indexedDB: false,
      memory: false
    };

    try {
      // 1. Try localStorage first
      results.localStorage = this.saveToLocalStorage(imageData);
    } catch (error) {
      console.warn('⚠️ localStorage save failed:', error);
    }

    try {
      // 2. Try sessionStorage
      results.sessionStorage = this.saveToSessionStorage(imageData);
    } catch (error) {
      console.warn('⚠️ sessionStorage save failed:', error);
    }

    try {
      // 3. Try IndexedDB for larger storage
      results.indexedDB = await this.saveToIndexedDB(imageData);
    } catch (error) {
      console.warn('⚠️ IndexedDB save failed:', error);
    }

    try {
      // 4. Always save to memory as final fallback
      results.memory = this.saveToMemory(imageData);
    } catch (error) {
      console.warn('⚠️ Memory save failed:', error);
    }

    console.log('💾 Image saved with results:', results);
    return results;
  }

  /**
   * Get all images from multiple sources
   */
  async getAllImages() {
    const sources = {
      localStorage: [],
      sessionStorage: [],
      indexedDB: [],
      memory: []
    };

    try {
      sources.localStorage = this.getFromLocalStorage();
    } catch (error) {
      console.warn('⚠️ localStorage read failed:', error);
    }

    try {
      sources.sessionStorage = this.getFromSessionStorage();
    } catch (error) {
      console.warn('⚠️ sessionStorage read failed:', error);
    }

    try {
      sources.indexedDB = await this.getFromIndexedDB();
    } catch (error) {
      console.warn('⚠️ IndexedDB read failed:', error);
    }

    try {
      sources.memory = this.getFromMemory();
    } catch (error) {
      console.warn('⚠️ Memory read failed:', error);
    }

    // Merge and deduplicate images
    return this.mergeImageSources(sources);
  }

  // ==================== LOCAL STORAGE ====================

  saveToLocalStorage(imageData) {
    try {
      const existing = this.getFromLocalStorage();
      const updated = [imageData, ...existing].slice(0, this.maxLocalImages);
      localStorage.setItem(this.storageKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.warn('localStorage full or unavailable:', error);
      return false;
    }
  }

  getFromLocalStorage() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('localStorage read error:', error);
      return [];
    }
  }

  // ==================== SESSION STORAGE ====================

  saveToSessionStorage(imageData) {
    try {
      const existing = this.getFromSessionStorage();
      const updated = [imageData, ...existing].slice(0, this.maxSessionImages);
      sessionStorage.setItem(this.sessionKey, JSON.stringify(updated));
      return true;
    } catch (error) {
      console.warn('sessionStorage full or unavailable:', error);
      return false;
    }
  }

  getFromSessionStorage() {
    try {
      const data = sessionStorage.getItem(this.sessionKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.warn('sessionStorage read error:', error);
      return [];
    }
  }

  // ==================== INDEXED DB ====================

  async saveToIndexedDB(imageData) {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      
      await store.put({
        id: imageData.id,
        data: imageData,
        timestamp: Date.now()
      });
      
      return true;
    } catch (error) {
      console.warn('IndexedDB save error:', error);
      return false;
    }
  }

  async getFromIndexedDB() {
    try {
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.getAll();
      
      return new Promise((resolve) => {
        request.onsuccess = () => {
          const results = request.result || [];
          resolve(results.map(item => item.data).sort((a, b) => 
            new Date(b.created_at) - new Date(a.created_at)
          ));
        };
        request.onerror = () => resolve([]);
      });
    } catch (error) {
      console.warn('IndexedDB read error:', error);
      return [];
    }
  }

  openIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('PromptCanvasDB', 1);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => resolve(request.result);
      
      request.onupgradeneeded = (event) => {
        const db = event.target.result;
        if (!db.objectStoreNames.contains('images')) {
          const store = db.createObjectStore('images', { keyPath: 'id' });
          store.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }

  // ==================== MEMORY STORAGE ====================

  saveToMemory(imageData) {
    try {
      if (!window.promptCanvasMemoryGallery) {
        window.promptCanvasMemoryGallery = [];
      }
      
      const existing = window.promptCanvasMemoryGallery;
      const updated = [imageData, ...existing.filter(img => img.id !== imageData.id)]
        .slice(0, this.maxLocalImages);
      
      window.promptCanvasMemoryGallery = updated;
      return true;
    } catch (error) {
      console.warn('Memory storage error:', error);
      return false;
    }
  }

  getFromMemory() {
    try {
      return window.promptCanvasMemoryGallery || [];
    } catch (error) {
      console.warn('Memory read error:', error);
      return [];
    }
  }

  // ==================== UTILITY METHODS ====================

  mergeImageSources(sources) {
    const allImages = [];
    const seenIds = new Set();

    // Priority order: IndexedDB > localStorage > sessionStorage > memory
    const priorityOrder = ['indexedDB', 'localStorage', 'sessionStorage', 'memory'];

    for (const source of priorityOrder) {
      for (const image of sources[source] || []) {
        if (image && image.id && !seenIds.has(image.id)) {
          seenIds.add(image.id);
          allImages.push({
            ...image,
            source: source,
            timestamp: image.created_at || image.timestamp || Date.now()
          });
        }
      }
    }

    // Sort by creation time (newest first)
    return allImages.sort((a, b) => 
      new Date(b.timestamp) - new Date(a.timestamp)
    );
  }

  // ==================== MAINTENANCE ====================

  async clearOldImages() {
    try {
      // Clear old images from all storage methods
      const cutoffDate = Date.now() - (7 * 24 * 60 * 60 * 1000); // 7 days ago

      // Clear localStorage
      const localImages = this.getFromLocalStorage()
        .filter(img => new Date(img.created_at || img.timestamp) > cutoffDate);
      localStorage.setItem(this.storageKey, JSON.stringify(localImages));

      // Clear sessionStorage (will be cleared on session end anyway)
      
      // Clear IndexedDB
      const db = await this.openIndexedDB();
      const transaction = db.transaction(['images'], 'readwrite');
      const store = transaction.objectStore('images');
      const index = store.index('timestamp');
      const range = IDBKeyRange.upperBound(cutoffDate);
      
      index.openCursor(range).onsuccess = (event) => {
        const cursor = event.target.result;
        if (cursor) {
          cursor.delete();
          cursor.continue();
        }
      };

      console.log('🧹 Old images cleaned up');
    } catch (error) {
      console.warn('⚠️ Cleanup failed:', error);
    }
  }

  // ==================== EXPORT/IMPORT ====================

  async exportGallery() {
    const images = await this.getAllImages();
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      images: images,
      count: images.length
    };
  }

  async importGallery(exportData) {
    try {
      if (exportData.version === '1.0' && Array.isArray(exportData.images)) {
        for (const image of exportData.images) {
          await this.saveImage(image);
        }
        return true;
      }
      return false;
    } catch (error) {
      console.error('Import failed:', error);
      return false;
    }
  }
}

export default new GalleryStorageService();
