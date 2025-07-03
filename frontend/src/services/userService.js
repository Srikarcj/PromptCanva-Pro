import api, { apiEndpoints, handleApiError } from './api';

export const userService = {
  // Get user profile
  async getProfile() {
    try {
      const response = await api.get(apiEndpoints.user.profile);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Update user profile
  async updateProfile(profileData) {
    try {
      const response = await api.patch(apiEndpoints.user.profile, profileData);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get user statistics
  async getStats() {
    try {
      const response = await api.get(apiEndpoints.user.stats);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get user settings
  async getSettings() {
    try {
      const response = await api.get(apiEndpoints.user.settings);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Update user settings
  async updateSettings(settings) {
    try {
      const response = await api.patch(apiEndpoints.user.settings, settings);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get user generation history
  async getHistory(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
      });

      const response = await api.get(`${apiEndpoints.user.history}?${queryParams}`);

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Verify user authentication
  async verifyAuth() {
    try {
      const response = await api.get(apiEndpoints.auth.verify);
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },
};

export default userService;
