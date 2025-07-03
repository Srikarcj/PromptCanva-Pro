import api, { apiEndpoints, handleApiError } from './api';

export const imageService = {
  // Generate a new image (authenticated users)
  async generateImage(params) {
    try {
      console.log('🚀 Making API request to:', apiEndpoints.images.generate);
      console.log('📤 Request payload:', JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '',
        width: params.width || 1024,
        height: params.height || 1024,
        steps: params.steps || 4,
        guidance_scale: params.guidance_scale || params.guidance || 7.5,
        seed: params.seed || -1,
        style: params.style || 'none',
      }, null, 2));

      // Filter parameters to only include Together AI supported ones
      const supportedParams = {
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '',
        width: params.width || 1024,
        height: params.height || 1024,
        steps: params.steps || 4,
        guidance_scale: params.guidance_scale || params.guidance || 7.5,
        seed: params.seed || -1,
        style: params.style || 'none',
      };

      const response = await api.post(apiEndpoints.images.generate, supportedParams);

      console.log('✅ API response received:', response.status);
      console.log('📥 Response data keys:', Object.keys(response.data || {}));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ API request failed:', error);
      console.error('❌ Error response:', error.response?.data);
      console.error('❌ Error status:', error.response?.status);
      console.error('❌ Error message:', error.message);

      const apiError = handleApiError(error);
      console.error('❌ Processed error:', JSON.stringify(apiError, null, 2));

      return {
        success: false,
        error: apiError,
      };
    }
  },

  // Generate a new image for anonymous users (1 per day limit)
  async generateImageAnonymous(params) {
    try {
      console.log('🚀 Making anonymous API request to: /images/generate-anonymous');
      console.log('📤 Request payload:', JSON.stringify({
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '',
        width: Math.min(params.width || 1024, 1024), // Max 1024 for anonymous
        height: Math.min(params.height || 1024, 1024), // Max 1024 for anonymous
        steps: Math.min(params.steps || 4, 4), // Max 4 steps for anonymous
        guidance_scale: Math.min(params.guidance_scale || params.guidance || 7.5, 7.5),
        seed: params.seed || -1,
      }, null, 2));

      const response = await api.post('/images/generate-anonymous', {
        prompt: params.prompt,
        negative_prompt: params.negative_prompt || '', // Fixed parameter name
        width: Math.min(params.width || 1024, 1024),
        height: Math.min(params.height || 1024, 1024),
        steps: Math.min(params.steps || 4, 4),
        guidance_scale: Math.min(params.guidance_scale || params.guidance || 7.5, 7.5),
        seed: params.seed || -1,
      });

      console.log('✅ Anonymous image generation successful');
      console.log('📥 Response data keys:', Object.keys(response.data.data || {}));

      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('❌ Anonymous image generation failed:', error);
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Get user's images
  async getUserImages(params = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (params.page) queryParams.append('page', params.page);
      if (params.limit) queryParams.append('limit', params.limit);
      if (params.sort) queryParams.append('sort', params.sort);
      if (params.filter) queryParams.append('filter', params.filter);
      if (params.search) queryParams.append('search', params.search);
      
      const url = `${apiEndpoints.images.list}?${queryParams.toString()}`;
      const response = await api.get(url);
      
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

  // Get a specific image
  async getImage(imageId) {
    try {
      const response = await api.get(apiEndpoints.images.get(imageId));
      
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

  // Delete an image
  async deleteImage(imageId) {
    try {
      await api.delete(apiEndpoints.images.delete(imageId));
      
      return {
        success: true,
      };
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Toggle favorite status
  async toggleFavorite(imageId, isFavorite) {
    try {
      const response = await api.patch(apiEndpoints.images.favorite(imageId), {
        is_favorite: isFavorite,
      });
      
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

  // Download image
  async downloadImage(imageId) {
    try {
      const response = await api.get(apiEndpoints.images.download(imageId));

      if (response.data.success) {
        return {
          success: true,
          data: response.data.data,
        };
      } else {
        return {
          success: false,
          error: response.data.error || 'Download failed',
        };
      }
    } catch (error) {
      return {
        success: false,
        error: handleApiError(error),
      };
    }
  },

  // Save generated image to gallery
  async saveToGallery(imageData, metadata) {
    try {
      const response = await api.post(apiEndpoints.images.saveToGallery, {
        image_data: imageData,
        metadata: metadata,
      });

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

  // Get user's favorite images
  async getFavorites(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
      });

      const response = await api.get(`${apiEndpoints.gallery.favorites}?${queryParams}`);

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

  // Get recent images
  async getRecentImages(params = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: params.page || 1,
        limit: params.limit || 20,
      });

      const response = await api.get(`${apiEndpoints.gallery.recent}?${queryParams}`);

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

  // Bulk operations
  async bulkDelete(imageIds) {
    try {
      const response = await api.delete(apiEndpoints.images.list, {
        data: { image_ids: imageIds },
      });
      
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

  async bulkToggleFavorite(imageIds, isFavorite) {
    try {
      const response = await api.patch(apiEndpoints.images.list, {
        image_ids: imageIds,
        is_favorite: isFavorite,
      });
      
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

export default imageService;
