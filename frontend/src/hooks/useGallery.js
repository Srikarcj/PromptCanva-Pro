import { useState, useEffect, useCallback } from 'react';
import { imageService } from '../services/imageService';
import galleryStorageService from '../services/galleryStorageService';

// Utility function to merge and filter images from multiple sources
const mergeImageSources = (apiImages, localImages, params) => {
  const allImages = [];
  const seenIds = new Set();

  // Priority: API images first (most up-to-date)
  for (const image of apiImages) {
    if (image && image.id && !seenIds.has(image.id)) {
      seenIds.add(image.id);
      allImages.push({ ...image, source: 'api' });
    }
  }

  // Then local images (fallback/offline)
  for (const image of localImages) {
    if (image && image.id && !seenIds.has(image.id)) {
      seenIds.add(image.id);
      allImages.push({ ...image, source: 'local' });
    }
  }

  // Apply filters
  let filteredImages = allImages;

  // Search filter
  if (params.search) {
    const searchTerm = params.search.toLowerCase();
    filteredImages = filteredImages.filter(img =>
      img.prompt?.toLowerCase().includes(searchTerm) ||
      img.negative_prompt?.toLowerCase().includes(searchTerm)
    );
  }

  // Type filter
  if (params.filter === 'favorites') {
    filteredImages = filteredImages.filter(img => img.is_favorite || img.isFavorite);
  } else if (params.filter === 'recent') {
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    filteredImages = filteredImages.filter(img =>
      new Date(img.created_at || img.timestamp) > weekAgo
    );
  }

  // Sort
  if (params.sort === 'newest') {
    filteredImages.sort((a, b) =>
      new Date(b.created_at || b.timestamp) - new Date(a.created_at || a.timestamp)
    );
  } else if (params.sort === 'oldest') {
    filteredImages.sort((a, b) =>
      new Date(a.created_at || a.timestamp) - new Date(b.created_at || b.timestamp)
    );
  }

  return filteredImages;
};

export const useGallery = (initialParams = {}) => {
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  });
  const [filters, setFilters] = useState({
    search: '',
    sort: 'newest',
    filter: 'all',
    ...initialParams,
  });

  // Multi-source image fetching with fallbacks
  const fetchImages = useCallback(async (params = {}) => {
    setLoading(true);
    setError(null);

    try {
      console.log('🔍 Fetching images from multiple sources...');

      const queryParams = {
        ...filters,
        ...params,
        page: pagination.page,
        limit: pagination.limit,
      };

      // Method 1: Try API first
      let apiImages = [];
      let apiSuccess = false;
      let apiPagination = {};

      try {
        console.log('📡 Attempting API fetch...');
        const result = await imageService.getUserImages(queryParams);

        if (result.success) {
          apiImages = result.data.images || [];
          apiPagination = result.data.pagination || {};
          apiSuccess = true;
          console.log(`✅ API fetch successful: ${apiImages.length} images`);
        } else {
          console.warn('⚠️ API fetch failed:', result.error);
        }
      } catch (apiError) {
        console.warn('⚠️ API fetch error:', apiError);
      }

      // Method 2: Get local storage images as fallback/supplement
      let localImages = [];
      try {
        console.log('💾 Fetching from local storage...');
        localImages = await galleryStorageService.getAllImages();
        console.log(`✅ Local storage fetch: ${localImages.length} images`);
      } catch (localError) {
        console.warn('⚠️ Local storage fetch failed:', localError);
      }

      // Method 3: Merge and deduplicate images
      const allImages = mergeImageSources(apiImages, localImages, queryParams);

      console.log(`🎯 Final result: ${allImages.length} images (API: ${apiImages.length}, Local: ${localImages.length})`);

      setImages(allImages);

      // Update pagination (prefer API data, fallback to calculated)
      if (apiSuccess) {
        setPagination(prev => ({
          ...prev,
          total: apiPagination.total || allImages.length,
          totalPages: apiPagination.totalPages || Math.ceil(allImages.length / queryParams.limit),
        }));
      } else {
        setPagination(prev => ({
          ...prev,
          total: allImages.length,
          totalPages: Math.ceil(allImages.length / queryParams.limit),
        }));
      }

      // Set appropriate error/warning messages
      if (!apiSuccess && localImages.length > 0) {
        setError('Using offline data - some images may be missing');
      } else if (!apiSuccess && localImages.length === 0) {
        setError('Unable to load images - please check your connection');
      }

    } catch (err) {
      console.error('❌ Complete fetch failure:', err);
      setError({
        status: 0,
        message: 'Failed to load images from all sources',
        details: err.message,
      });
    } finally {
      setLoading(false);
    }
  }, [filters, pagination.page, pagination.limit]);

  // Save image to local storage (called when image is generated)
  const saveImageLocally = useCallback(async (imageData) => {
    try {
      console.log('💾 Saving image to local storage:', imageData.id);
      await galleryStorageService.saveImage(imageData);

      // Refresh the gallery to show the new image
      fetchImages();

      return { success: true };
    } catch (error) {
      console.error('❌ Failed to save image locally:', error);
      return { success: false, error };
    }
  }, [fetchImages]);

  // Load images on mount and when dependencies change
  useEffect(() => {
    fetchImages();
  }, [fetchImages]);

  // Update filters
  const updateFilters = useCallback((newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setPagination(prev => ({ ...prev, page: 1 })); // Reset to first page
  }, []);

  // Change page
  const changePage = useCallback((page) => {
    setPagination(prev => ({ ...prev, page }));
  }, []);

  // Delete image
  const deleteImage = useCallback(async (imageId) => {
    try {
      const result = await imageService.deleteImage(imageId);
      
      if (result.success) {
        setImages(prev => prev.filter(img => img.id !== imageId));
        setPagination(prev => ({ ...prev, total: prev.total - 1 }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to delete image',
          details: err.message,
        },
      };
    }
  }, []);

  // Toggle favorite
  const toggleFavorite = useCallback(async (imageId, isFavorite) => {
    try {
      const result = await imageService.toggleFavorite(imageId, isFavorite);
      
      if (result.success) {
        setImages(prev => prev.map(img => 
          img.id === imageId 
            ? { ...img, isFavorite }
            : img
        ));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to update favorite',
          details: err.message,
        },
      };
    }
  }, []);

  // Download image
  const downloadImage = useCallback(async (imageId, filename) => {
    try {
      const result = await imageService.downloadImage(imageId);

      if (result.success) {
        // Create download link
        const link = document.createElement('a');
        link.href = result.data.download_url;
        link.download = filename || result.data.filename || `image-${imageId}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to download image',
          details: err.message,
        },
      };
    }
  }, []);

  // Bulk operations
  const bulkDelete = useCallback(async (imageIds) => {
    try {
      const result = await imageService.bulkDelete(imageIds);
      
      if (result.success) {
        setImages(prev => prev.filter(img => !imageIds.includes(img.id)));
        setPagination(prev => ({ ...prev, total: prev.total - imageIds.length }));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to delete images',
          details: err.message,
        },
      };
    }
  }, []);

  const bulkToggleFavorite = useCallback(async (imageIds, isFavorite) => {
    try {
      const result = await imageService.bulkToggleFavorite(imageIds, isFavorite);
      
      if (result.success) {
        setImages(prev => prev.map(img => 
          imageIds.includes(img.id) 
            ? { ...img, isFavorite }
            : img
        ));
        return { success: true };
      } else {
        return { success: false, error: result.error };
      }
    } catch (err) {
      return {
        success: false,
        error: {
          status: 0,
          message: 'Failed to update favorites',
          details: err.message,
        },
      };
    }
  }, []);

  // Refresh gallery
  const refresh = useCallback(() => {
    fetchImages();
  }, [fetchImages]);

  return {
    images,
    loading,
    error,
    pagination,
    filters,
    updateFilters,
    changePage,
    deleteImage,
    toggleFavorite,
    downloadImage,
    bulkDelete,
    bulkToggleFavorite,
    refresh,
    saveImageLocally,
  };
};

export default useGallery;
