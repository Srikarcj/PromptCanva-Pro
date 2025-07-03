import api from './api';

// Real-time admin service with WebSocket support
class AdminService {
  constructor() {
    this.isAdmin = false;
    this.adminData = null;
    this.wsConnection = null;
    this.eventListeners = new Map();
    this.retryCount = 0;
    this.maxRetries = 3;
  }

  // Initialize real-time admin connection
  async initialize() {
    try {
      console.log('🚀 Initializing admin service...');

      // Check admin access first
      const accessCheck = await this.checkAdminAccess();
      if (accessCheck.success) {
        this.isAdmin = true;
        console.log('✅ Admin access confirmed, setting up real-time connection...');

        // Setup real-time updates
        this.setupRealTimeUpdates();

        return { success: true, isAdmin: true };
      } else {
        this.isAdmin = false;
        return accessCheck;
      }
    } catch (error) {
      console.error('❌ Admin service initialization failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Check if current user is admin with enhanced error handling
  async checkAdminAccess() {
    try {
      console.log('🔐 Checking admin access...');

      // Add retry logic for network issues
      for (let attempt = 1; attempt <= this.maxRetries; attempt++) {
        try {
          const response = await api.get('/admin/test'); // Use test endpoint first
          console.log('✅ Admin test endpoint successful:', response.data);

          // Now try dashboard
          const dashboardResponse = await api.get('/admin/dashboard');
          console.log('✅ Admin dashboard access confirmed');

          this.isAdmin = true;
          this.retryCount = 0; // Reset retry count on success

          return {
            success: true,
            isAdmin: true,
            data: dashboardResponse.data
          };

        } catch (error) {
          console.warn(`❌ Admin access attempt ${attempt} failed:`, error.response?.status, error.response?.data?.message);

          if (attempt === this.maxRetries) {
            throw error; // Throw on final attempt
          }

          // Wait before retry
          await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }
    } catch (error) {
      console.error('❌ Admin access denied after all retries:', error.response?.status);
      this.isAdmin = false;

      return {
        success: false,
        isAdmin: false,
        error: error.response?.data?.message || 'Access denied',
        status: error.response?.status || 500
      };
    }
  }

  // Setup real-time updates using polling and events
  setupRealTimeUpdates() {
    try {
      console.log('⚡ Setting up real-time admin updates...');

      // Poll for updates every 10 seconds
      this.pollInterval = setInterval(async () => {
        if (this.isAdmin) {
          await this.refreshDashboardData();
        }
      }, 10000);

      // Listen for user activity events
      window.addEventListener('userActivity', this.handleUserActivity.bind(this));
      window.addEventListener('imageGenerated', this.handleImageGenerated.bind(this));
      window.addEventListener('beforeunload', this.cleanup.bind(this));

      console.log('✅ Real-time updates configured');
    } catch (error) {
      console.error('❌ Failed to setup real-time updates:', error);
    }
  }

  // Handle user activity events
  handleUserActivity(event) {
    if (this.isAdmin) {
      console.log('👤 User activity detected:', event.detail);
      this.notifyListeners('userActivity', event.detail);
    }
  }

  // Handle image generation events
  handleImageGenerated(event) {
    if (this.isAdmin) {
      console.log('🖼️ Image generated:', event.detail);
      this.notifyListeners('imageGenerated', event.detail);
      // Refresh dashboard data
      this.refreshDashboardData();
    }
  }

  // Notify event listeners
  notifyListeners(eventType, data) {
    const listeners = this.eventListeners.get(eventType) || [];
    listeners.forEach(callback => {
      try {
        callback(data);
      } catch (error) {
        console.error(`❌ Event listener error for ${eventType}:`, error);
      }
    });
  }

  // Add event listener
  addEventListener(eventType, callback) {
    if (!this.eventListeners.has(eventType)) {
      this.eventListeners.set(eventType, []);
    }
    this.eventListeners.get(eventType).push(callback);
  }

  // Remove event listener
  removeEventListener(eventType, callback) {
    const listeners = this.eventListeners.get(eventType) || [];
    const index = listeners.indexOf(callback);
    if (index > -1) {
      listeners.splice(index, 1);
    }
  }

  // Cleanup resources
  cleanup() {
    if (this.pollInterval) {
      clearInterval(this.pollInterval);
    }
    if (this.wsConnection) {
      this.wsConnection.close();
    }
    this.eventListeners.clear();
  }

  // Get admin dashboard data with caching
  async getDashboard() {
    try {
      console.log('📊 Fetching admin dashboard...');

      if (!this.isAdmin) {
        throw new Error('Admin access required');
      }

      const response = await api.get('/admin/dashboard');
      console.log('✅ Admin dashboard data received:', response.data);

      // Cache the data
      this.adminData = response.data.data;

      return {
        success: true,
        data: response.data.data,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('❌ Failed to fetch admin dashboard:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch dashboard data',
        status: error.response?.status
      };
    }
  }

  // Refresh dashboard data
  async refreshDashboardData() {
    try {
      const result = await this.getDashboard();
      if (result.success) {
        this.notifyListeners('dashboardUpdated', result.data);
      }
      return result;
    } catch (error) {
      console.error('❌ Failed to refresh dashboard:', error);
      return { success: false, error: error.message };
    }
  }

  // Get all users
  async getAllUsers(params = {}) {
    try {
      const { page = 1, limit = 50, search = '' } = params;
      console.log(`👥 Fetching all users (page ${page}, limit ${limit})...`);
      
      const response = await api.get('/admin/users', {
        params: { page, limit, search }
      });
      
      console.log('✅ Users data received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch users:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch users'
      };
    }
  }

  // Get specific user details
  async getUserDetails(userId) {
    try {
      console.log(`👤 Fetching details for user ${userId}...`);
      const response = await api.get(`/admin/users/${userId}`);
      console.log('✅ User details received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(`❌ Failed to fetch user details for ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user details'
      };
    }
  }

  // Get all images across platform
  async getAllImages(params = {}) {
    try {
      const { page = 1, limit = 50, user_id = '' } = params;
      console.log(`🖼️ Fetching all images (page ${page}, limit ${limit})...`);
      
      const response = await api.get('/admin/images', {
        params: { page, limit, user_id }
      });
      
      console.log('✅ Images data received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch images:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch images'
      };
    }
  }

  // Get user's images
  async getUserImages(userId, params = {}) {
    try {
      const { page = 1, limit = 20 } = params;
      console.log(`🖼️ Fetching images for user ${userId}...`);
      
      const response = await api.get(`/admin/users/${userId}/images`, {
        params: { page, limit }
      });
      
      console.log('✅ User images received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error(`❌ Failed to fetch images for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch user images'
      };
    }
  }

  // Get platform analytics
  async getAnalytics(timeframe = '30d') {
    try {
      console.log(`📈 Fetching analytics for timeframe ${timeframe}...`);
      const response = await api.get('/admin/analytics', {
        params: { timeframe }
      });
      
      console.log('✅ Analytics data received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch analytics'
      };
    }
  }

  // Get system health
  async getSystemHealth() {
    try {
      console.log('🏥 Fetching system health...');
      const response = await api.get('/admin/system/health');
      console.log('✅ System health received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch system health:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system health'
      };
    }
  }

  // Export user data (for GDPR compliance)
  async exportUserData(userId) {
    try {
      console.log(`📤 Exporting data for user ${userId}...`);
      const response = await api.get(`/admin/users/${userId}/export`, {
        responseType: 'blob'
      });
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `user_${userId}_data.json`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ User data exported successfully');
      return { success: true };
    } catch (error) {
      console.error(`❌ Failed to export data for user ${userId}:`, error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export user data'
      };
    }
  }

  // Search across platform
  async search(query, type = 'all') {
    try {
      console.log(`🔍 Searching for "${query}" in ${type}...`);
      const response = await api.get('/admin/search', {
        params: { query, type }
      });
      
      console.log('✅ Search results received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Search failed:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Search failed'
      };
    }
  }

  // Get platform statistics summary
  async getPlatformStats() {
    try {
      console.log('📊 Fetching platform statistics...');
      const response = await api.get('/admin/stats');
      console.log('✅ Platform stats received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch platform stats:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch platform stats'
      };
    }
  }

  // Delete image (admin)
  async deleteImage(imageId) {
    try {
      console.log('🗑️ Deleting image:', imageId);
      const response = await api.delete(`/admin/images/${imageId}`);
      console.log('✅ Image deleted:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to delete image:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to delete image'
      };
    }
  }

  // Export analytics data
  async exportAnalytics(params = {}) {
    try {
      console.log('📥 Exporting analytics...');
      const response = await api.get('/admin/analytics/export', {
        params: params,
        responseType: 'blob'
      });

      console.log('✅ Analytics export received');
      return {
        success: true,
        data: response.data
      };
    } catch (error) {
      console.error('❌ Failed to export analytics:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to export analytics'
      };
    }
  }

  // Get system logs
  async getSystemLogs(params = {}) {
    try {
      console.log('📋 Fetching system logs...');
      const response = await api.get('/admin/logs', {
        params: params
      });
      console.log('✅ System logs received:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to fetch system logs:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to fetch system logs'
      };
    }
  }

  // Restart service
  async restartService(serviceName) {
    try {
      console.log('🔄 Restarting service:', serviceName);
      const response = await api.post(`/admin/services/${serviceName}/restart`);
      console.log('✅ Service restarted:', response.data);
      return {
        success: true,
        data: response.data.data
      };
    } catch (error) {
      console.error('❌ Failed to restart service:', error);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to restart service'
      };
    }
  }
}

// Create and export singleton instance
export const adminService = new AdminService();
export default adminService;
