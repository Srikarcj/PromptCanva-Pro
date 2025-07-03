import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  timeout: 120000, // 2 minutes for image generation (AI can take time)
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    // Check if this is an anonymous endpoint
    const isAnonymousEndpoint = config.url?.includes('/generate-anonymous') ||
                               config.url?.includes('/usage-limits');

    // For anonymous endpoints, don't require authentication but still try to add token if available
    if (isAnonymousEndpoint) {
      // Try to get Clerk token if available (for usage tracking)
      if (window.Clerk?.session) {
        try {
          const token = await window.Clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          // Ignore auth errors for anonymous endpoints
          console.debug('No auth token for anonymous request (this is normal)');
        }
      }
      return config;
    }

    // For authenticated endpoints, require token
    if (import.meta.env.DEV) {
      // Try to get Clerk token first
      if (window.Clerk?.session) {
        try {
          const token = await window.Clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            return config;
          }
        } catch (error) {
          console.warn('Failed to get Clerk token, using test token:', error);
        }
      }

      // Fallback to test token for development
      config.headers.Authorization = 'Bearer dev-test-token';
    } else {
      // Production: require Clerk token
      if (window.Clerk?.session) {
        try {
          const token = await window.Clerk.session.getToken();
          if (token) {
            config.headers.Authorization = `Bearer ${token}`;
          }
        } catch (error) {
          console.error('Failed to get auth token:', error);
        }
      }
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Check if this was an anonymous endpoint
      const isAnonymousEndpoint = error.config?.url?.includes('/generate-anonymous') ||
                                 error.config?.url?.includes('/usage-limits');

      if (!isAnonymousEndpoint) {
        // Only redirect to login for authenticated endpoints
        window.location.href = '/sign-in';
      }
    }
    return Promise.reject(error);
  }
);

// API endpoints
export const apiEndpoints = {
  // Authentication
  auth: {
    verify: '/auth/verify',
    profile: '/auth/profile',
  },
  
  // Image generation
  images: {
    generate: '/images/generate',
    generateAnonymous: '/images/generate-anonymous',
    usageLimits: '/images/usage-limits',
    saveToGallery: '/images/save-to-gallery',
    list: '/images',
    get: (id) => `/images/${id}`,
    delete: (id) => `/images/${id}`,
    favorite: (id) => `/images/${id}/favorite`,
    download: (id) => `/images/${id}/download`,
  },
  
  // User management
  user: {
    profile: '/user/profile',
    stats: '/user/stats',
    settings: '/user/settings',
    history: '/user/history',
  },
  
  // Gallery
  gallery: {
    list: '/gallery',
    create: '/gallery',
    update: (id) => `/gallery/${id}`,
    delete: (id) => `/gallery/${id}`,
    favorites: '/gallery/favorites',
    recent: '/gallery/recent',
    search: '/gallery/search',
  }
};

// Helper function to handle API errors
export const handleApiError = (error) => {
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    return {
      status,
      message: data.message || data.error || 'An error occurred',
      details: data.details || null,
    };
  } else if (error.request) {
    // Request was made but no response received
    return {
      status: 0,
      message: 'Network error - please check your connection',
      details: null,
    };
  } else {
    // Something else happened
    return {
      status: 0,
      message: error.message || 'An unexpected error occurred',
      details: null,
    };
  }
};

// Helper function to create form data for file uploads
export const createFormData = (data) => {
  const formData = new FormData();
  Object.keys(data).forEach(key => {
    if (data[key] !== null && data[key] !== undefined) {
      formData.append(key, data[key]);
    }
  });
  return formData;
};

export default api;
