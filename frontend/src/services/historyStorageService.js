/**
 * History Storage Service
 * Provides local storage for generation history
 */

class HistoryStorageService {
  constructor() {
    this.storageKey = 'promptcanvas_generation_history';
    this.maxHistoryItems = 200; // Limit history storage
  }

  // ==================== MAIN METHODS ====================

  /**
   * Add a new generation to history
   */
  addGeneration(generationData) {
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
        model: generationData.model || 'black-forest-labs/FLUX.1-schnell-Free',
        created_at: generationData.created_at || new Date().toISOString(),
        image_id: generationData.image_id || generationData.id,
        success: true
      };

      // Add to beginning of array and limit size
      const updatedHistory = [historyItem, ...history].slice(0, this.maxHistoryItems);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
      console.log('📜 Generation added to history:', historyItem.id);
      
      return { success: true, item: historyItem };
    } catch (error) {
      console.error('❌ Failed to add generation to history:', error);
      return { success: false, error };
    }
  }

  /**
   * Get all generation history
   */
  getHistory() {
    try {
      const data = localStorage.getItem(this.storageKey);
      const history = data ? JSON.parse(data) : [];
      
      // Sort by creation date (newest first)
      return history.sort((a, b) => 
        new Date(b.created_at) - new Date(a.created_at)
      );
    } catch (error) {
      console.warn('⚠️ Failed to get history:', error);
      return [];
    }
  }

  /**
   * Get paginated history
   */
  getPaginatedHistory(page = 1, limit = 20) {
    try {
      const allHistory = this.getHistory();
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      
      const paginatedItems = allHistory.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          history: paginatedItems,
          pagination: {
            page: page,
            limit: limit,
            total: allHistory.length,
            has_more: endIndex < allHistory.length,
            total_pages: Math.ceil(allHistory.length / limit)
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to get paginated history:', error);
      return {
        success: false,
        error: error.message,
        data: {
          history: [],
          pagination: {
            page: page,
            limit: limit,
            total: 0,
            has_more: false,
            total_pages: 0
          }
        }
      };
    }
  }

  /**
   * Search history by prompt
   */
  searchHistory(searchTerm, page = 1, limit = 20) {
    try {
      const allHistory = this.getHistory();
      const searchLower = searchTerm.toLowerCase();
      
      const filteredHistory = allHistory.filter(item => 
        item.prompt?.toLowerCase().includes(searchLower) ||
        item.negative_prompt?.toLowerCase().includes(searchLower)
      );
      
      const startIndex = (page - 1) * limit;
      const endIndex = startIndex + limit;
      const paginatedItems = filteredHistory.slice(startIndex, endIndex);
      
      return {
        success: true,
        data: {
          history: paginatedItems,
          pagination: {
            page: page,
            limit: limit,
            total: filteredHistory.length,
            has_more: endIndex < filteredHistory.length,
            total_pages: Math.ceil(filteredHistory.length / limit)
          }
        }
      };
    } catch (error) {
      console.error('❌ Failed to search history:', error);
      return this.getPaginatedHistory(page, limit);
    }
  }

  /**
   * Get history item by ID
   */
  getHistoryItem(id) {
    try {
      const history = this.getHistory();
      const item = history.find(h => h.id === id || h.image_id === id);
      
      if (item) {
        return { success: true, data: item };
      } else {
        return { success: false, error: 'History item not found' };
      }
    } catch (error) {
      console.error('❌ Failed to get history item:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Delete history item
   */
  deleteHistoryItem(id) {
    try {
      const history = this.getHistory();
      const updatedHistory = history.filter(h => h.id !== id && h.image_id !== id);
      
      localStorage.setItem(this.storageKey, JSON.stringify(updatedHistory));
      console.log('🗑️ History item deleted:', id);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to delete history item:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Clear all history
   */
  clearHistory() {
    try {
      localStorage.removeItem(this.storageKey);
      console.log('🗑️ All history cleared');
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to clear history:', error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get recent prompts for suggestions
   */
  getRecentPrompts(limit = 10) {
    try {
      const history = this.getHistory();
      const recentPrompts = history
        .slice(0, limit)
        .map(item => item.prompt)
        .filter(prompt => prompt && prompt.trim().length > 0);
      
      // Remove duplicates
      return [...new Set(recentPrompts)];
    } catch (error) {
      console.warn('⚠️ Failed to get recent prompts:', error);
      return [];
    }
  }

  /**
   * Get generation statistics from history
   */
  getHistoryStats() {
    try {
      const history = this.getHistory();
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

      const stats = {
        total_generations: history.length,
        today_count: 0,
        week_count: 0,
        month_count: 0,
        most_used_prompts: {},
        most_used_styles: {},
        avg_steps: 0,
        avg_guidance: 0
      };

      let totalSteps = 0;
      let totalGuidance = 0;

      for (const item of history) {
        const itemDate = new Date(item.created_at);
        
        if (itemDate >= today) {
          stats.today_count++;
        }
        
        if (itemDate >= thisWeek) {
          stats.week_count++;
        }
        
        if (itemDate >= thisMonth) {
          stats.month_count++;
        }

        // Track prompt usage
        if (item.prompt) {
          const promptKey = item.prompt.substring(0, 50); // First 50 chars
          stats.most_used_prompts[promptKey] = (stats.most_used_prompts[promptKey] || 0) + 1;
        }

        // Track style usage
        if (item.style) {
          stats.most_used_styles[item.style] = (stats.most_used_styles[item.style] || 0) + 1;
        }

        // Calculate averages
        totalSteps += item.steps || 4;
        totalGuidance += item.guidance_scale || 7.5;
      }

      if (history.length > 0) {
        stats.avg_steps = Math.round(totalSteps / history.length * 10) / 10;
        stats.avg_guidance = Math.round(totalGuidance / history.length * 10) / 10;
      }

      return stats;
    } catch (error) {
      console.warn('⚠️ Failed to calculate history stats:', error);
      return {
        total_generations: 0,
        today_count: 0,
        week_count: 0,
        month_count: 0,
        most_used_prompts: {},
        most_used_styles: {},
        avg_steps: 4,
        avg_guidance: 7.5
      };
    }
  }

  // ==================== EXPORT/IMPORT ====================

  exportHistory() {
    return {
      version: '1.0',
      exportDate: new Date().toISOString(),
      history: this.getHistory(),
      stats: this.getHistoryStats()
    };
  }

  importHistory(exportData) {
    try {
      if (exportData.version === '1.0' && Array.isArray(exportData.history)) {
        localStorage.setItem(this.storageKey, JSON.stringify(exportData.history));
        console.log('📜 History imported successfully');
        return true;
      }
      return false;
    } catch (error) {
      console.error('❌ History import failed:', error);
      return false;
    }
  }

  // ==================== DEBUG METHODS ====================

  logHistory() {
    const history = this.getHistory();
    console.log('📜 CURRENT HISTORY:', history);
    console.table(history);
    return history;
  }

  testAddGeneration() {
    const testGeneration = {
      id: `test_${Date.now()}`,
      prompt: 'Test prompt for debugging',
      negative_prompt: 'test negative',
      width: 1024,
      height: 1024,
      steps: 4,
      guidance_scale: 7.5,
      seed: 12345,
      style: 'photographic',
      created_at: new Date().toISOString()
    };

    const result = this.addGeneration(testGeneration);
    console.log('🧪 Test generation added:', result);
    return result;
  }
}

export default new HistoryStorageService();
