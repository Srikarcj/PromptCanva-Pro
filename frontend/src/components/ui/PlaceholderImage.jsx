import React, { useState } from 'react';
import { Image as ImageIcon } from 'lucide-react';

const PlaceholderImage = ({ 
  src, 
  alt, 
  className = '', 
  width = 300, 
  height = 300,
  text = 'Image',
  ...props 
}) => {
  const [imageError, setImageError] = useState(false);
  const [imageLoading, setImageLoading] = useState(true);

  // Create SVG placeholder
  const createPlaceholder = (text, width, height) => {
    const svg = `
      <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f3f4f6"/>
        <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
          ${text}
        </text>
      </svg>
    `;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
  };

  const handleImageError = () => {
    setImageError(true);
    setImageLoading(false);
  };

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  if (!src || imageError) {
    return (
      <div className={`bg-gray-200 flex items-center justify-center ${className}`} {...props}>
        <div className="text-center">
          <ImageIcon className="h-8 w-8 text-gray-400 mx-auto mb-2" />
          <span className="text-sm text-gray-500">{text}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`}>
      {imageLoading && (
        <div className="absolute inset-0 bg-gray-200 flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={`${className} ${imageLoading ? 'opacity-0' : 'opacity-100'} transition-opacity duration-200`}
        onError={handleImageError}
        onLoad={handleImageLoad}
        {...props}
      />
    </div>
  );
};

export default PlaceholderImage;
