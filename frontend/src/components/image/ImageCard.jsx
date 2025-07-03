import React, { useState } from 'react';
import {
  Download,
  Heart,
  MoreVertical,
  Copy,
  Trash2,
  ExternalLink,
  Calendar,
  Eye
} from 'lucide-react';
import { Button, Card, Modal, PlaceholderImage } from '../ui';

const ImageCard = ({ 
  image, 
  onDownload, 
  onDelete, 
  onToggleFavorite, 
  showActions = true,
  className = '' 
}) => {
  const [showModal, setShowModal] = useState(false);
  const [showMenu, setShowMenu] = useState(false);

  const handleCopyPrompt = () => {
    navigator.clipboard.writeText(image.prompt);
    setShowMenu(false);
    // TODO: Show toast notification
  };

  const handleDownload = () => {
    onDownload?.(image);
    setShowMenu(false);
  };

  const handleDelete = () => {
    onDelete?.(image);
    setShowMenu(false);
  };

  const handleToggleFavorite = () => {
    onToggleFavorite?.(image);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  return (
    <>
      <Card className={`group overflow-hidden hover:shadow-xl transition-all duration-300 ${className}`}>
        <div className="relative aspect-square overflow-hidden">
          <PlaceholderImage
            src={image.thumbnail_url || image.url}
            alt={image.prompt}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 cursor-pointer"
            onClick={() => setShowModal(true)}
            text="AI Image"
          />
          
          {/* Overlay with actions */}
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setShowModal(true)}
              className="bg-white bg-opacity-90 hover:bg-opacity-100"
            >
              <Eye className="mr-2 h-4 w-4" />
              View
            </Button>
          </div>

          {/* Top right actions */}
          {showActions && (
            <div className="absolute top-2 right-2 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
              <Button
                variant="secondary"
                size="sm"
                onClick={handleToggleFavorite}
                className={`p-2 ${image.isFavorite ? 'text-red-500' : 'text-gray-600'}`}
              >
                <Heart className={`h-4 w-4 ${image.isFavorite ? 'fill-current' : ''}`} />
              </Button>
              
              <div className="relative">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowMenu(!showMenu)}
                  className="p-2"
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
                
                {showMenu && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
                    <button
                      onClick={handleDownload}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </button>
                    <button
                      onClick={handleCopyPrompt}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <Copy className="mr-2 h-4 w-4" />
                      Copy Prompt
                    </button>
                    <button
                      onClick={() => setShowModal(true)}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <ExternalLink className="mr-2 h-4 w-4" />
                      View Full Size
                    </button>
                    <hr className="my-1" />
                    <button
                      onClick={handleDelete}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center"
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Image info */}
        <div className="p-4">
          <p className="text-sm text-gray-900 font-medium line-clamp-2 mb-2">
            {image.prompt}
          </p>
          
          <div className="flex items-center justify-between text-xs text-gray-500">
            <div className="flex items-center">
              <Calendar className="mr-1 h-3 w-3" />
              {formatDate(image.createdAt)}
            </div>
            
            {image.resolution && (
              <span className="bg-gray-100 px-2 py-1 rounded">
                {image.resolution}
              </span>
            )}
          </div>
        </div>
      </Card>

      {/* Full size modal */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Image Details"
        size="xl"
      >
        <div className="space-y-4">
          <div className="aspect-square max-h-96 overflow-hidden rounded-lg">
            <PlaceholderImage
              src={image.url}
              alt={image.prompt}
              className="w-full h-full object-contain bg-gray-100"
              text="AI Image"
            />
          </div>
          
          <div className="space-y-3">
            <div>
              <h4 className="font-medium text-gray-900 mb-1">Prompt</h4>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {image.prompt}
              </p>
            </div>
            
            {image.negativePrompt && (
              <div>
                <h4 className="font-medium text-gray-900 mb-1">Negative Prompt</h4>
                <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                  {image.negativePrompt}
                </p>
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-900">Created:</span>
                <span className="ml-2 text-gray-600">{formatDate(image.createdAt)}</span>
              </div>
              {image.resolution && (
                <div>
                  <span className="font-medium text-gray-900">Resolution:</span>
                  <span className="ml-2 text-gray-600">{image.resolution}</span>
                </div>
              )}
              {image.model && (
                <div>
                  <span className="font-medium text-gray-900">Model:</span>
                  <span className="ml-2 text-gray-600">{image.model}</span>
                </div>
              )}
              {image.seed && (
                <div>
                  <span className="font-medium text-gray-900">Seed:</span>
                  <span className="ml-2 text-gray-600">{image.seed}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 pt-4 border-t">
            <Button onClick={handleDownload} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button onClick={handleCopyPrompt} variant="outline" className="flex-1">
              <Copy className="mr-2 h-4 w-4" />
              Copy Prompt
            </Button>
          </div>
        </div>
      </Modal>
    </>
  );
};

export default ImageCard;
