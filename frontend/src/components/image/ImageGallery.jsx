import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  Grid3X3, 
  Grid2X2, 
  List,
  Calendar,
  Heart,
  Download,
  Trash2
} from 'lucide-react';
import { Input, Select, Button, LoadingSpinner } from '../ui';
import ImageCard from './ImageCard';

const ImageGallery = ({ 
  images = [], 
  loading = false, 
  onDownload, 
  onDelete, 
  onToggleFavorite 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [filterBy, setFilterBy] = useState('all');
  const [viewMode, setViewMode] = useState('grid-3'); // grid-2, grid-3, list
  const [selectedImages, setSelectedImages] = useState([]);

  const sortOptions = [
    { value: 'newest', label: 'Newest First' },
    { value: 'oldest', label: 'Oldest First' },
    { value: 'prompt', label: 'Prompt A-Z' },
    { value: 'favorites', label: 'Favorites First' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Images' },
    { value: 'favorites', label: 'Favorites Only' },
    { value: 'recent', label: 'Last 7 Days' },
    { value: 'this-month', label: 'This Month' }
  ];

  const filteredAndSortedImages = useMemo(() => {
    let filtered = images;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(image =>
        image.prompt.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply category filter
    switch (filterBy) {
      case 'favorites':
        filtered = filtered.filter(image => image.isFavorite);
        break;
      case 'recent':
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        filtered = filtered.filter(image => new Date(image.createdAt) > weekAgo);
        break;
      case 'this-month':
        const monthStart = new Date();
        monthStart.setDate(1);
        filtered = filtered.filter(image => new Date(image.createdAt) > monthStart);
        break;
    }

    // Apply sorting
    switch (sortBy) {
      case 'newest':
        filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        break;
      case 'oldest':
        filtered.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
        break;
      case 'prompt':
        filtered.sort((a, b) => a.prompt.localeCompare(b.prompt));
        break;
      case 'favorites':
        filtered.sort((a, b) => (b.isFavorite ? 1 : 0) - (a.isFavorite ? 1 : 0));
        break;
    }

    return filtered;
  }, [images, searchTerm, sortBy, filterBy]);

  const handleSelectImage = (imageId) => {
    setSelectedImages(prev => 
      prev.includes(imageId) 
        ? prev.filter(id => id !== imageId)
        : [...prev, imageId]
    );
  };

  const handleSelectAll = () => {
    if (selectedImages.length === filteredAndSortedImages.length) {
      setSelectedImages([]);
    } else {
      setSelectedImages(filteredAndSortedImages.map(img => img.id));
    }
  };

  const handleBulkDownload = () => {
    selectedImages.forEach(imageId => {
      const image = images.find(img => img.id === imageId);
      if (image) onDownload?.(image);
    });
    setSelectedImages([]);
  };

  const handleBulkDelete = () => {
    selectedImages.forEach(imageId => {
      const image = images.find(img => img.id === imageId);
      if (image) onDelete?.(image);
    });
    setSelectedImages([]);
  };

  const getGridClasses = () => {
    switch (viewMode) {
      case 'grid-2':
        return 'grid-cols-1 md:grid-cols-2 gap-6';
      case 'grid-3':
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
      case 'list':
        return 'grid-cols-1 gap-4';
      default:
        return 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <LoadingSpinner size="lg" text="Loading your gallery..." />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Your Gallery
          </h2>
          <p className="text-gray-600">
            {filteredAndSortedImages.length} of {images.length} images
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center space-x-2 bg-gray-100 rounded-lg p-1">
          <Button
            variant={viewMode === 'grid-2' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid-2')}
            className="p-2"
          >
            <Grid2X2 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'grid-3' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid-3')}
            className="p-2"
          >
            <Grid3X3 className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="p-2"
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search by prompt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        
        <div className="flex gap-2">
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            options={sortOptions}
            className="w-40"
          />
          
          <Select
            value={filterBy}
            onChange={(e) => setFilterBy(e.target.value)}
            options={filterOptions}
            className="w-40"
          />
        </div>
      </div>

      {/* Bulk Actions */}
      {selectedImages.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-900">
              {selectedImages.length} image{selectedImages.length !== 1 ? 's' : ''} selected
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={handleSelectAll}>
                {selectedImages.length === filteredAndSortedImages.length ? 'Deselect All' : 'Select All'}
              </Button>
              <Button size="sm" variant="outline" onClick={handleBulkDownload}>
                <Download className="mr-2 h-4 w-4" />
                Download
              </Button>
              <Button size="sm" variant="danger" onClick={handleBulkDelete}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Grid */}
      {filteredAndSortedImages.length > 0 ? (
        <div className={`grid ${getGridClasses()}`}>
          {filteredAndSortedImages.map((image) => (
            <div key={image.id} className="relative">
              {/* Selection checkbox */}
              <div className="absolute top-2 left-2 z-10">
                <input
                  type="checkbox"
                  checked={selectedImages.includes(image.id)}
                  onChange={() => handleSelectImage(image.id)}
                  className="w-4 h-4 text-blue-600 bg-white border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              
              <ImageCard
                image={image}
                onDownload={onDownload}
                onDelete={onDelete}
                onToggleFavorite={onToggleFavorite}
                className={viewMode === 'list' ? 'flex flex-row' : ''}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="text-gray-400 mb-4">
            {searchTerm || filterBy !== 'all' ? (
              <>
                <Search className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No images found
                </h3>
                <p>Try adjusting your search or filter criteria</p>
              </>
            ) : (
              <>
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No images yet
                </h3>
                <p>Start creating your first AI-generated image</p>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageGallery;
