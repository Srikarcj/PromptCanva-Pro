import { useState, useCallback } from 'react';
import { imageService } from '../services/imageService';

export const useImageGeneration = () => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [error, setError] = useState(null);
  const [generationHistory, setGenerationHistory] = useState([]);

  const generateImage = useCallback(async (params) => {
    setIsGenerating(true);
    setError(null);

    try {
      const result = await imageService.generateImage(params);
      
      if (result.success) {
        const newImage = result.data;
        setGeneratedImage(newImage);
        setGenerationHistory(prev => [newImage, ...prev.slice(0, 9)]); // Keep last 10
        return { success: true, data: newImage };
      } else {
        setError(result.error);
        return { success: false, error: result.error };
      }
    } catch (err) {
      const errorInfo = {
        status: 0,
        message: 'Failed to generate image',
        details: err.message,
      };
      setError(errorInfo);
      return { success: false, error: errorInfo };
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const clearGeneratedImage = useCallback(() => {
    setGeneratedImage(null);
  }, []);

  const clearHistory = useCallback(() => {
    setGenerationHistory([]);
  }, []);

  return {
    isGenerating,
    generatedImage,
    error,
    generationHistory,
    generateImage,
    clearError,
    clearGeneratedImage,
    clearHistory,
  };
};

export default useImageGeneration;
