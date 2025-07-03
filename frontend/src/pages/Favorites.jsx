import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { Heart, Plus, RefreshCw, Image as ImageIcon } from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { ImageGallery } from '../components/image';
import { imageService } from '../services';
import { useStats } from '../contexts/StatsContext';
import localStorageManager from '../services/localStorageManager';

const Favorites = () => {
  const { user } = useUser();
  const { updateFavoriteCount, decrementImageCount } = useStats();
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch favorites from local storage
  const fetchFavorites = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('💖 Fetching favorites from local storage...');

      // Get favorite images from local storage
      const favoriteImages = localStorageManager.getFavoriteImages();

      console.log(`✅ Found ${favoriteImages.length} favorite images`);

      setImages(favoriteImages);
      setError(null); // Never show error for empty favorites

    } catch (err) {
      console.error('❌ Error fetching favorites:', err);
      setError('Failed to load favorites');
      setImages([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user, fetchFavorites]);

  // Auto-refresh favorites every 30 seconds
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchFavorites();
    }, 30000);

    return () => clearInterval(interval);
  }, [user, fetchFavorites]);

  const handleDownload = async (image) => {
    try {
      console.log('📥 Downloading favorite image:', image.id);

      // First try the API download
      const result = await imageService.downloadImage(image.id);

      if (result.success) {
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
    if (!confirm('Are you sure you want to delete this image?')) return;

    try {
      console.log('🗑️ Deleting favorite image:', image.id);

      // Remove from local storage (this will also update stats)
      const result = localStorageManager.removeImageFromGallery(image.id);

      if (result.success) {
        console.log('✅ Image deleted from local storage');

        // Remove from favorites list
        localStorageManager.toggleFavorite(image.id, false);

        // Refresh favorites to show updated data
        fetchFavorites();

        console.log('✅ Image deleted successfully');
      } else {
        console.error('❌ Delete failed:', result.error);
        alert('Failed to delete image. Please try again.');
      }
    } catch (err) {
      console.error('❌ Delete error:', err);
      alert('Failed to delete image. Please try again.');
    }
  };

  const handleToggleFavorite = async (image) => {
    const currentStatus = image.isFavorite || image.is_favorite;
    const newFavoriteStatus = !currentStatus;

    try {
      console.log(`💖 Toggling favorite for ${image.id}: ${currentStatus} → ${newFavoriteStatus}`);

      // Update local storage
      const result = localStorageManager.toggleFavorite(image.id, newFavoriteStatus);

      if (result.success) {
        console.log('✅ Favorite toggled successfully');

        // Refresh favorites list to show updated data
        fetchFavorites();

      } else {
        console.error('❌ Toggle favorite failed:', result.error);
        alert('Failed to update favorite status. Please try again.');
      }
    } catch (err) {
      console.error('❌ Toggle favorite error:', err);
      alert('Failed to update favorite status. Please try again.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Your Favorites
          </h1>
          <p className="text-gray-600">
            Images you've marked as favorites
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchFavorites}
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

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Favorites</p>
                <p className="text-2xl font-bold text-gray-900">{images.length}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <Heart className="h-6 w-6 text-red-600" />
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
              <p className="font-medium">Failed to load favorites</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              onClick={fetchFavorites}
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

      {/* Empty State */}
      {!loading && images.length === 0 && !error && (
        <Card className="text-center py-12">
          <CardContent>
            <Heart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No favorites yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start marking images as favorites to see them here. Click the heart icon on any image to add it to your favorites.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/generate">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create New Image
                </Button>
              </Link>
              <Link to="/gallery">
                <Button variant="outline">
                  <ImageIcon className="mr-2 h-4 w-4" />
                  Browse Gallery
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Favorites;
