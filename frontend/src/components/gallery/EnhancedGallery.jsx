import React, { useState, useMemo, useCallback } from 'react';
import { 
  Search, 
  Filter, 
  Tag, 
  Calendar,
  Grid3X3,
  List,
  SortAsc,
  SortDesc,
  Star,
  Heart,
  Download,
  Eye,
  X,
  Hash
} from 'lucide-react';
import Button from '../ui/Button';
import Input from '../ui/Input';
import Select from '../ui/Select';

const EnhancedGallery = ({ 
  images = [], 
  onImageSelect,
  onImageDownload,
  onImageFavorite,
  className = "" 
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState(new Set());
  const [sortBy, setSortBy] = useState('date-desc');
  const [viewMode, setViewMode] = useState('grid');
  const [filterBy, setFilterBy] = useState('all');
  const [showFilters, setShowFilters] = useState(false);

  // Auto-generate tags from image metadata
  const allTags = useMemo(() => {
    const tagSet = new Set();
    
    images.forEach(image => {
      // Extract tags from prompt
      if (image.prompt) {
        const words = image.prompt.toLowerCase().split(/[,\s]+/);
        words.forEach(word => {
          const cleaned = word.replace(/[^\w]/g, '');
          if (cleaned.length > 2 && !['the', 'and', 'with', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'had', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'man', 'men', 'put', 'say', 'she', 'too', 'use'].includes(cleaned)) {
            tagSet.add(cleaned);
          }
        });
      }
      
      // Add style tags
      if (image.style && image.style !== 'none') {
        tagSet.add(image.style);
      }
      
      // Add resolution tags
      if (image.width && image.height) {
        tagSet.add(`${image.width}x${image.height}`);
      }
      
      // Add quality indicators
      if (image.is_favorite) {
        tagSet.add('favorite');
      }
      
      // Add date-based tags
      if (image.created_at) {
        const date = new Date(image.created_at);
        tagSet.add(date.toLocaleDateString('en-US', { month: 'long' }).toLowerCase());
        tagSet.add(date.getFullYear().toString());
      }
    });
    
    return Array.from(tagSet).sort();
  }, [images]);

  // Filter and sort images
  const filteredImages = useMemo(() => {
    let filtered = images;

    // Search filter
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(image => 
        image.prompt?.toLowerCase().includes(query) ||
        image.negative_prompt?.toLowerCase().includes(query) ||
        image.id?.toLowerCase().includes(query)
      );
    }

    // Tag filter
    if (selectedTags.size > 0) {
      filtered = filtered.filter(image => {
        const imageTags = new Set();
        
        // Add prompt words as tags
        if (image.prompt) {
          const words = image.prompt.toLowerCase().split(/[,\s]+/);
          words.forEach(word => {
            const cleaned = word.replace(/[^\w]/g, '');
            if (cleaned.length > 2) imageTags.add(cleaned);
          });
        }
        
        // Add metadata tags
        if (image.style && image.style !== 'none') imageTags.add(image.style);
        if (image.is_favorite) imageTags.add('favorite');
        if (image.width && image.height) imageTags.add(`${image.width}x${image.height}`);
        
        // Check if image has any selected tags
        return Array.from(selectedTags).some(tag => imageTags.has(tag));
      });
    }

    // Category filter
    if (filterBy !== 'all') {
      filtered = filtered.filter(image => {
        switch (filterBy) {
          case 'favorites':
            return image.is_favorite;
          case 'recent':
            const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
            return new Date(image.created_at) > weekAgo;
          case 'high-res':
            return (image.width || 0) >= 1024 && (image.height || 0) >= 1024;
          default:
            return true;
        }
      });
    }

    // Sort images
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.created_at) - new Date(a.created_at);
        case 'date-asc':
          return new Date(a.created_at) - new Date(b.created_at);
        case 'prompt-asc':
          return (a.prompt || '').localeCompare(b.prompt || '');
        case 'prompt-desc':
          return (b.prompt || '').localeCompare(a.prompt || '');
        case 'resolution-desc':
          return ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0));
        case 'resolution-asc':
          return ((a.width || 0) * (a.height || 0)) - ((b.width || 0) * (b.height || 0));
        default:
          return 0;
      }
    });

    return filtered;
  }, [images, searchQuery, selectedTags, filterBy, sortBy]);

  // Toggle tag selection
  const toggleTag = useCallback((tag) => {
    setSelectedTags(prev => {
      const newSet = new Set(prev);
      if (newSet.has(tag)) {
        newSet.delete(tag);
      } else {
        newSet.add(tag);
      }
      return newSet;
    });
  }, []);

  // Clear all filters
  const clearFilters = useCallback(() => {
    setSearchQuery('');
    setSelectedTags(new Set());
    setFilterBy('all');
  }, []);

  const sortOptions = [
    { value: 'date-desc', label: 'Newest First' },
    { value: 'date-asc', label: 'Oldest First' },
    { value: 'prompt-asc', label: 'Prompt A-Z' },
    { value: 'prompt-desc', label: 'Prompt Z-A' },
    { value: 'resolution-desc', label: 'Highest Resolution' },
    { value: 'resolution-asc', label: 'Lowest Resolution' }
  ];

  const filterOptions = [
    { value: 'all', label: 'All Images' },
    { value: 'favorites', label: 'Favorites Only' },
    { value: 'recent', label: 'Recent (7 days)' },
    { value: 'high-res', label: 'High Resolution' }
  ];

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Hash className="w-5 h-5 text-blue-600" />
            <h3 className="font-semibold text-gray-900">Smart Gallery</h3>
            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full">
              {filteredImages.length} images
            </span>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="w-4 h-4" />
            </Button>
            
            <Button
              variant={viewMode === 'grid' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            
            <Button
              variant={viewMode === 'list' ? 'primary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
          <Input
            placeholder="Search by prompt, tags, or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="p-4 border-b border-gray-200 bg-gray-50">
          <div className="space-y-4">
            {/* Quick Filters */}
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">Filter:</label>
              <Select
                value={filterBy}
                onChange={(e) => setFilterBy(e.target.value)}
                options={filterOptions}
                className="text-sm"
              />
              
              <label className="text-sm font-medium text-gray-700 ml-4">Sort:</label>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                options={sortOptions}
                className="text-sm"
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tags ({allTags.length} available)
              </label>
              <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                {allTags.slice(0, 50).map(tag => (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-2 py-1 text-xs rounded-full border transition-colors ${
                      selectedTags.has(tag)
                        ? 'bg-blue-500 text-white border-blue-500'
                        : 'bg-white text-gray-700 border-gray-300 hover:border-blue-400'
                    }`}
                  >
                    <Tag className="w-3 h-3 inline mr-1" />
                    {tag}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(searchQuery || selectedTags.size > 0 || filterBy !== 'all') && (
              <Button
                variant="outline"
                size="sm"
                onClick={clearFilters}
              >
                <X className="w-4 h-4 mr-2" />
                Clear Filters
              </Button>
            )}
          </div>
        </div>
      )}

      {/* Results */}
      <div className="p-4">
        {filteredImages.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p className="text-lg font-medium">No images found</p>
            <p className="text-sm">Try adjusting your search or filters</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredImages.map(image => (
              <div
                key={image.id}
                className="group relative aspect-square bg-gray-100 rounded-lg overflow-hidden cursor-pointer hover:shadow-lg transition-shadow"
                onClick={() => onImageSelect && onImageSelect(image)}
              >
                <img
                  src={image.thumbnail_url || image.url}
                  alt={image.prompt}
                  className="w-full h-full object-cover"
                />
                
                {/* Overlay */}
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-200">
                  <div className="absolute top-2 right-2 flex gap-1">
                    {image.is_favorite && (
                      <div className="bg-red-500 text-white p-1 rounded">
                        <Heart className="w-3 h-3" />
                      </div>
                    )}
                    <div className="bg-black bg-opacity-50 text-white px-2 py-1 rounded text-xs">
                      {image.width}×{image.height}
                    </div>
                  </div>
                  
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-2">
                    <p className="text-white text-xs truncate">
                      {image.prompt}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            {filteredImages.map(image => (
              <div
                key={image.id}
                className="flex items-center gap-4 p-3 border border-gray-200 rounded-lg hover:border-gray-300 cursor-pointer"
                onClick={() => onImageSelect && onImageSelect(image)}
              >
                <img
                  src={image.thumbnail_url || image.url}
                  alt={image.prompt}
                  className="w-16 h-16 object-cover rounded"
                />
                
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-gray-900 truncate">
                    {image.prompt}
                  </p>
                  <p className="text-sm text-gray-600">
                    {image.width}×{image.height} • {new Date(image.created_at).toLocaleDateString()}
                  </p>
                </div>
                
                <div className="flex items-center gap-2">
                  {image.is_favorite && (
                    <Heart className="w-4 h-4 text-red-500" />
                  )}
                  <Button variant="ghost" size="sm">
                    <Eye className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EnhancedGallery;
