import React, { useState, useEffect, useCallback } from 'react';
import { useUser } from '@clerk/clerk-react';
import { ImageGallery } from '../components/image';
import { EnhancedGallery } from '../components/gallery';
import { Button, Card, CardContent } from '../components/ui';
import { Upload, Plus, Image as ImageIcon, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { imageService } from '../services';
import { useStats } from '../contexts/StatsContext';
import localStorageManager from '../services/localStorageManager';
import persistentStorage from '../services/persistentStorage';

const Gallery = () => {
  const { user } = useUser();
  const { updateFavoriteCount, decrementImageCount } = useStats();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch images from local storage (primary source)
  const fetchImages = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔍 Fetching images from persistent storage...');

      // Get images from persistent storage (multiple sources)
      const persistentImages = await persistentStorage.getAllImages();
      console.log(`✅ Persistent storage: ${persistentImages.length} images`);

      // Also get from legacy storage for compatibility
      const localImages = localStorageManager.getGallery();
      console.log(`✅ Legacy storage: ${localImages.length} images`);

      // Merge and deduplicate images
      const allImages = [...persistentImages, ...localImages];
      const uniqueImages = allImages.reduce((acc, current) => {
        const existing = acc.find(img => img.id === current.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort by creation date (newest first)
      uniqueImages.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      console.log(`🎉 Total unique images loaded: ${uniqueImages.length}`);
      setImages(uniqueImages);
      setError(null); // Never show error for empty gallery

    } catch (err) {
      console.error('❌ Gallery fetch failed:', err);
      setImages([]);
      setError('Failed to load gallery');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchImages();
    }

    // Listen for data recovery events
    const handleGalleryUpdate = (event) => {
      console.log('🔄 Gallery data updated, refreshing...', event.detail);
      fetchImages();
    };

    window.addEventListener('galleryDataUpdated', handleGalleryUpdate);

    return () => {
      window.removeEventListener('galleryDataUpdated', handleGalleryUpdate);
    };
  }, [user, fetchImages]);

  // Auto-refresh gallery every 30 seconds to catch new images
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchImages();
    }, 30000); // 30 seconds

    return () => clearInterval(interval);
  }, [user, fetchImages]);

  // Refresh gallery when window gains focus (user returns from generate page)
  useEffect(() => {
    if (!user) return;

    const handleFocus = () => {
      fetchImages();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [user, fetchImages]);

  const handleDownload = async (image) => {
    try {
      console.log('📥 Downloading image:', image.id);

      // First try the API download
      const result = await imageService.downloadImage(image.id);

      if (result.success) {
        // Create a temporary link to download the image
        const link = document.createElement('a');
        link.href = result.data.download_url;
        link.download = result.data.filename || `promptcanvas-${image.id}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ Download completed successfully');
        return;
      }

      // Fallback: try using the image's file_url or thumbnail_url
      const downloadUrl = image.file_url || image.thumbnail_url || image.url;
      if (downloadUrl) {
        console.log('📥 Using fallback download URL');

        if (downloadUrl.startsWith('data:image')) {
          // Handle base64 data URLs
          const response = await fetch(downloadUrl);
          const blob = await response.blob();

          const url = window.URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `promptcanvas-${image.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);

          window.URL.revokeObjectURL(url);
        } else {
          // Handle regular URLs
          const link = document.createElement('a');
          link.href = downloadUrl;
          link.download = `promptcanvas-${image.id}.png`;
          link.target = '_blank';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        }

        console.log('✅ Fallback download completed');
        return;
      }

      // If all else fails
      console.error('❌ No download URL available for image:', image);
      alert('Failed to download image. No download URL available.');

    } catch (err) {
      console.error('❌ Download error:', err);
      alert('Failed to download image. Please try again.');
    }
  };

  const handleDelete = async (image) => {
    if (window.confirm('Are you sure you want to delete this image? This action cannot be undone.')) {
      try {
        console.log('🗑️ Deleting image:', image.id);

        // Remove from local storage
        const result = localStorageManager.removeImageFromGallery(image.id);

        if (result.success) {
          console.log('✅ Image deleted from local storage');

          // Remove from favorites if it was favorited
          if (image.is_favorite || image.isFavorite) {
            localStorageManager.toggleFavorite(image.id, false);
          }

          // Refresh gallery to show updated data
          fetchImages();

          console.log('✅ Image deleted successfully');
        } else {
          console.error('❌ Delete failed:', result.error);
          alert('Failed to delete image. Please try again.');
        }
      } catch (err) {
        console.error('❌ Delete error:', err);
        alert('Failed to delete image. Please try again.');
      }
    }
  };

  const handleToggleFavorite = async (image) => {
    const currentFavoriteStatus = image.isFavorite || image.is_favorite;
    const newFavoriteStatus = !currentFavoriteStatus;

    try {
      console.log(`💖 Toggling favorite for ${image.id}: ${currentFavoriteStatus} → ${newFavoriteStatus}`);

      // Update local storage
      const result = localStorageManager.toggleFavorite(image.id, newFavoriteStatus);

      if (result.success) {
        // Update UI immediately
        setImages(prev => prev.map(img =>
          img.id === image.id
            ? { ...img, isFavorite: newFavoriteStatus, is_favorite: newFavoriteStatus }
            : img
        ));

        // Stats are automatically updated by localStorageManager.toggleFavorite
        console.log('✅ Favorite toggled successfully');

        // Refresh gallery to show updated data
        fetchImages();

      } else {
        console.error('❌ Toggle favorite failed:', result.error);
        alert('Failed to update favorite status. Please try again.');
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  // Calculate dynamic stats
  const stats = React.useMemo(() => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    return {
      total: images.length,
      favorites: images.filter(img => img.isFavorite).length,
      thisMonth: images.filter(img => {
        const imageDate = new Date(img.createdAt || img.created_at);
        return imageDate.getMonth() === currentMonth && imageDate.getFullYear() === currentYear;
      }).length,
      thisWeek: images.filter(img => {
        const imageDate = new Date(img.createdAt || img.created_at);
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        return imageDate >= weekAgo;
      }).length
    };
  }, [images]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Gallery
          </h1>
          <p className="text-gray-600">
            Manage and organize your AI-generated images
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchImages}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/generate">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Image
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Images</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{stats.favorites}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Month</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisMonth}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <ImageIcon className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Error Display */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <ImageIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Failed to load gallery</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              onClick={() => window.location.reload()}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Gallery */}
      {!error && (
        <ImageGallery
          images={images}
          loading={loading}
          onDownload={handleDownload}
          onDelete={handleDelete}
          onToggleFavorite={handleToggleFavorite}
        />
      )}

      {/* Empty State for New Users */}
      {!loading && images.length === 0 && (
        <Card className="text-center py-12">
          <CardContent>
            <ImageIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Welcome to your gallery!
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              You haven't created any images yet. Start generating amazing AI artwork to build your collection.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/generate">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Your First Image
                </Button>
              </Link>
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Images
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Gallery;
