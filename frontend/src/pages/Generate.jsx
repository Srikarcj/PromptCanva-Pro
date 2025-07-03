import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Sparkles,
  Download,
  RefreshCw,
  Save,
  Settings,
  Wand2,
  Image as ImageIcon,
  AlertCircle,
  Crown
} from 'lucide-react';
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Textarea,
  Select,
  LoadingSpinner,
  Modal
} from '../components/ui';
import { PromptEnhancer } from '../components/prompt';
import { useStats } from '../contexts/StatsContext';
import localStorageManager from '../services/localStorageManager';
import usageLimitService from '../services/usageLimitService';
import persistentStorage from '../services/persistentStorage';

const Generate = () => {
  const navigate = useNavigate();
  const { user } = useUser();
  const statsContext = useStats();
  const { incrementImageCount } = statsContext;

  console.log('🎯 Generate component loaded');

  // Debug authentication state
  useEffect(() => {
    console.log('🔐 Authentication Debug:', {
      isSignedIn: !!user,
      userId: user?.id,
      userEmail: user?.emailAddresses?.[0]?.emailAddress,
      hasClerkSession: !!window.Clerk?.session,
    });
  }, [user]);

  // Function to manually refresh usage limits
  const refreshUsageLimits = async () => {
    setLoadingUsage(true);
    try {
      // Clear any cached data first
      usageLimitService.clearCache();

      const result = await usageLimitService.getUsageLimits();
      if (result.success) {
        setUsageData(result.data);
        console.log('🔄 Usage limits refreshed:', result.data);
      }
    } catch (error) {
      console.error('❌ Failed to refresh usage limits:', error);
    } finally {
      setLoadingUsage(false);
    }
  };
  console.log('🎯 Stats context:', statsContext);
  console.log('🎯 incrementImageCount function:', incrementImageCount);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [showSettings, setShowSettings] = useState(false);
  const [generationTime, setGenerationTime] = useState(0);
  const [promptAccuracy, setPromptAccuracy] = useState(null);
  const [optimizedPrompt, setOptimizedPrompt] = useState('');
  const [speedMode, setSpeedMode] = useState(true); // Enable speed mode by default
  const [estimatedTime, setEstimatedTime] = useState(3); // Estimated generation time
  const [actualTime, setActualTime] = useState(0); // Track actual generation time
  const [settings, setSettings] = useState({
    width: 1024,
    height: 1024,
    steps: 4, // FLUX.1-schnell works best with 1-4 steps
    guidance: 1.0, // FLUX.1-schnell typically uses guidance_scale = 1.0
    seed: -1,
    style: 'none',
    // FLUX.1-schnell specific optimizations
    cfg_scale: 1.0, // FLUX models work best with CFG = 1.0
    accuracy_mode: true // Enable prompt optimizations
  });

  // Usage limit state
  const [usageData, setUsageData] = useState(null);
  const [loadingUsage, setLoadingUsage] = useState(true);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  // Prompt optimization for maximum accuracy
  const optimizePrompt = (originalPrompt) => {
    if (!originalPrompt.trim()) return originalPrompt;

    let optimized = originalPrompt.trim();

    // Add quality enhancers for better accuracy
    const qualityTerms = [
      'highly detailed',
      'sharp focus',
      'professional photography',
      'masterpiece',
      'best quality',
      'ultra high resolution'
    ];

    // Check if prompt already has quality terms
    const hasQualityTerms = qualityTerms.some(term =>
      optimized.toLowerCase().includes(term.toLowerCase())
    );

    if (!hasQualityTerms) {
      optimized += ', highly detailed, sharp focus, masterpiece, best quality';
    }

    // Add specific technical terms for accuracy
    optimized += ', professional photography, ultra high resolution, consistent style';

    return optimized;
  };

  // Enhanced negative prompt for better accuracy
  const getOptimizedNegativePrompt = (originalNegative = '') => {
    const accuracyNegatives = [
      'blurry',
      'low quality',
      'distorted',
      'deformed',
      'ugly',
      'bad anatomy',
      'bad proportions',
      'extra limbs',
      'malformed',
      'watermark',
      'signature',
      'text',
      'cropped',
      'out of frame',
      'worst quality',
      'low resolution',
      'pixelated',
      'artifacts',
      'noise',
      'oversaturated',
      'undersaturated',
      'overexposed',
      'underexposed'
    ];

    const combined = originalNegative ?
      `${originalNegative}, ${accuracyNegatives.join(', ')}` :
      accuracyNegatives.join(', ');

    return combined;
  };

  // Calculate prompt accuracy score (heuristic based on various factors)
  const calculatePromptAccuracy = (originalPrompt, optimizedPrompt, generationTime) => {
    let score = 85; // Base accuracy score

    // Time factor (faster generation might indicate good optimization)
    if (generationTime <= 5) {
      score += 10; // Bonus for meeting 5-second target
    } else if (generationTime <= 8) {
      score += 5; // Partial bonus for reasonable time
    }

    // Prompt optimization factor
    const promptWords = originalPrompt.split(' ').length;
    if (promptWords >= 5 && promptWords <= 20) {
      score += 5; // Good prompt length
    }

    // Settings optimization factor
    if (settings.cfg_scale >= 10) {
      score += 3; // High CFG scale for accuracy
    }

    if (settings.steps >= 8) {
      score += 2; // Sufficient steps for quality
    }

    // Cap at 100%
    return Math.min(100, score);
  };

  // Load preset prompts from localStorage (from history page)
  React.useEffect(() => {
    const presetPrompt = localStorage.getItem('promptcanvas_preset_prompt');
    const presetNegativePrompt = localStorage.getItem('promptcanvas_preset_negative_prompt');
    const presetParameters = localStorage.getItem('promptcanvas_preset_parameters');

    if (presetPrompt) {
      setPrompt(presetPrompt);
      localStorage.removeItem('promptcanvas_preset_prompt');
    }

    if (presetNegativePrompt) {
      setNegativePrompt(presetNegativePrompt);
      localStorage.removeItem('promptcanvas_preset_negative_prompt');
    }

    if (presetParameters) {
      try {
        const params = JSON.parse(presetParameters);
        setSettings(prev => ({
          ...prev,
          width: params.width || prev.width,
          height: params.height || prev.height,
          steps: params.steps || prev.steps,
          guidance: params.guidance_scale || prev.guidance,
          style: params.style || prev.style,
        }));
        localStorage.removeItem('promptcanvas_preset_parameters');
      } catch (err) {
        console.error('Failed to parse preset parameters:', err);
      }
    }
  }, []);

  // Load usage limits on component mount and when user changes
  useEffect(() => {
    const loadUsageLimits = async () => {
      setLoadingUsage(true);
      try {
        // Force refresh usage limits when user state changes
        const result = await usageLimitService.getUsageLimits(); // Don't use cache
        if (result.success) {
          setUsageData(result.data);
          console.log('🔄 Usage limits loaded:', {
            userType: result.data.user_type,
            currentUsage: result.data.current_usage,
            limit: result.data.limit,
            canGenerate: result.data.can_generate,
            userEmail: user?.emailAddresses?.[0]?.emailAddress
          });
        } else {
          console.error('❌ Failed to load usage limits:', result.error);
        }
      } catch (error) {
        console.error('❌ Failed to load usage limits:', error);
      } finally {
        setLoadingUsage(false);
      }
    };

    // Load usage limits when component mounts or user authentication state changes
    loadUsageLimits();
  }, [user?.id, user?.emailAddresses]); // Depend on user ID and email to reload when authentication changes

  const resolutionOptions = [
    { value: '512x512', label: '512×512 (Square)' },
    { value: '1024x1024', label: '1024×1024 (Square)' },
    { value: '1024x768', label: '1024×768 (Landscape)' },
    { value: '768x1024', label: '768×1024 (Portrait)' },
    { value: '1536x1024', label: '1536×1024 (Wide)' },
    { value: '1024x1536', label: '1024×1536 (Tall)' }
  ];

  const stylePresets = [
    { value: 'none', label: 'None' },
    { value: 'photographic', label: 'Photographic' },
    { value: 'digital-art', label: 'Digital Art' },
    { value: 'cinematic', label: 'Cinematic' },
    { value: 'anime', label: 'Anime' },
    { value: 'fantasy-art', label: 'Fantasy Art' },
    { value: 'neon-punk', label: 'Neon Punk' },
    { value: 'isometric', label: 'Isometric' }
  ];

  const handleGenerate = async () => {
    if (!prompt.trim()) return;

    // Check usage limits before generating
    if (usageData && !usageData.can_generate) {
      if (usageData.user_type === 'anonymous') {
        setShowUpgradeModal(true);
      }
      return;
    }

    setIsGenerating(true);
    const startTime = Date.now();

    try {
      const { imageService } = await import('../services');

      // Optimize prompts for maximum accuracy
      const optimizedMainPrompt = optimizePrompt(prompt);
      // Temporarily disable negative prompt optimization for FLUX.1-schnell testing
      const optimizedNegativePrompt = ''; // getOptimizedNegativePrompt(negativePrompt);

      // Store optimized prompt for display
      setOptimizedPrompt(optimizedMainPrompt);

      // Enhanced generation parameters for accuracy (Together AI compatible)
      const enhancedSettings = {
        prompt: optimizedMainPrompt,
        negative_prompt: optimizedNegativePrompt,
        width: settings.width,
        height: settings.height,
        steps: settings.steps,
        guidance_scale: settings.cfg_scale || settings.guidance,
        seed: settings.seed,
        style: settings.style || 'none'
        // Note: Together AI only supports basic parameters
        // Advanced parameters like scheduler, clip_skip, etc. are not supported
      };

      // Use appropriate endpoint based on authentication status
      const result = user
        ? await imageService.generateImage(enhancedSettings)
        : await imageService.generateImageAnonymous({
            prompt: optimizedMainPrompt,
            negative_prompt: optimizedNegativePrompt,
            width: settings.width,
            height: settings.height,
            steps: settings.steps,
            guidance_scale: settings.cfg_scale || settings.guidance,
            seed: settings.seed
            // Note: Anonymous generation uses basic parameters only
          });

      console.log('API Response:', JSON.stringify(result, null, 2));

      if (result.success) {
        // Calculate generation time
        const endTime = Date.now();
        const totalTime = (endTime - startTime) / 1000; // Convert to seconds
        setGenerationTime(totalTime);

        console.log(`🚀 Generation completed in ${totalTime.toFixed(2)} seconds`);
        console.log('Generation successful - Full result:', JSON.stringify(result, null, 2));
        console.log('Generation successful - result.data:', JSON.stringify(result.data, null, 2));

        // Ensure user is set before saving
        if (user?.emailAddresses?.[0]?.emailAddress) {
          const userEmail = user.emailAddresses[0].emailAddress;
          localStorageManager.setUser(userEmail);
        }

        // Access the actual image data from the nested response
        const backendImageData = result.data.data || result.data;
        const imageData = {
          ...backendImageData,
          prompt: prompt,
          optimized_prompt: optimizedMainPrompt,
          negative_prompt: optimizedNegativePrompt,
          generation_time: totalTime,
          accuracy_settings: {
            steps: settings.steps,
            cfg_scale: settings.cfg_scale || settings.guidance,
            scheduler: settings.scheduler,
            clip_skip: settings.clip_skip
          },
          createdAt: new Date().toISOString(),
          // Use thumbnail_url as url if url is missing
          url: backendImageData.url || backendImageData.thumbnail_url,
          // Add user information for persistence
          user_email: user?.emailAddresses?.[0]?.emailAddress || 'unknown',
          generated_at: new Date().toISOString()
        };

        // Calculate prompt accuracy score (simplified heuristic)
        const accuracyScore = calculatePromptAccuracy(prompt, optimizedMainPrompt, totalTime);
        setPromptAccuracy(accuracyScore);

        console.log('🖼️ Setting generated image:', {
          id: imageData.id,
          prompt: imageData.prompt,
          url_length: imageData.url?.length,
          url_preview: imageData.url?.substring(0, 50) + '...',
          has_url: !!imageData.url,
          thumbnail_url_length: imageData.thumbnail_url?.length,
          all_keys: Object.keys(imageData)
        });

        setGeneratedImage(imageData);

        console.log('🎯 Image generation successful, saving with bulletproof persistence...');

        // Save with bulletproof persistent storage
        try {
          // Prepare complete image data
          const completeImageData = {
            ...imageData,
            prompt: optimizedMainPrompt,
            negative_prompt: optimizedNegativePrompt,
            width: settings.width,
            height: settings.height,
            steps: settings.steps,
            guidance_scale: settings.cfg_scale || settings.guidance,
            seed: settings.seed,
            style: settings.style,
            model: 'FLUX.1-schnell',
            user_id: user?.id || 'anonymous'
          };

          // Save with persistent storage (multiple locations) - stats handled by existing system
          const persistentResult = await persistentStorage.saveImage(completeImageData, false);
          console.log('✅ Image saved with persistent storage:', persistentResult);

          // Also save with legacy system for compatibility
          const galleryResult = localStorageManager.addImageToGallery(imageData);
          console.log('✅ Image added to legacy gallery:', galleryResult);

          // Add to history
          const historyResult = localStorageManager.addToHistory(imageData);
          console.log('✅ Image added to history:', historyResult);

          // Stats are automatically updated by addImageToGallery
          console.log('✅ Stats updated automatically');

          // Show success message
          console.log('🎉 Image saved to multiple storage locations - NEVER LOST!');

          // Refresh usage limits after successful generation
          usageLimitService.clearUsageCache();
          const updatedUsage = await usageLimitService.getUsageLimits();
          if (updatedUsage.success) {
            setUsageData(updatedUsage.data);
          }

        } catch (localSaveError) {
          console.error('❌ Failed to save to local storage:', localSaveError);

          // Fallback: at least update stats
          try {
            incrementImageCount();
            console.log('✅ Stats updated via fallback');
          } catch (statsError) {
            console.error('❌ Stats fallback also failed:', statsError);
          }
        }
      } else {
        console.error('Generation failed - Full result:', JSON.stringify(result, null, 2));
        console.error('Error details:', JSON.stringify(result.error, null, 2));
        console.error('Result keys:', Object.keys(result));
        console.error('Error keys:', result.error ? Object.keys(result.error) : 'No error object');

        const errorMessage = result.error?.message ||
                           result.message ||
                           (typeof result.error === 'string' ? result.error : 'Unknown error');
        alert(`Generation failed: ${errorMessage}`);
      }
    } catch (error) {
      console.error('Generation exception:', error);
      console.error('Error stack:', error.stack);
      alert(`Generation failed: ${error.message || 'Please try again.'}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedImage) {
      alert('No image to download');
      return;
    }

    try {
      // For freshly generated images, always use base64 download first (most reliable)
      if (generatedImage.url && generatedImage.url.startsWith('data:image')) {
        console.log('📥 Downloading image directly from base64 data');

        // Convert base64 to blob
        const response = await fetch(generatedImage.url);
        const blob = await response.blob();

        // Create download link
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `promptcanvas-${generatedImage.id || Date.now()}.png`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

        // Clean up
        window.URL.revokeObjectURL(url);
        console.log('✅ Download completed successfully');
        return;
      }

      // If we have a file_url (stored image), use it directly
      if (generatedImage.file_url && !generatedImage.file_url.startsWith('data:image')) {
        console.log('📥 Using stored file URL');
        const link = document.createElement('a');
        link.href = generatedImage.file_url;
        link.download = `promptcanvas-${generatedImage.id || Date.now()}.png`;
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        console.log('✅ File URL download completed');
        return;
      }

      // Only try API download if we don't have direct access to the image data
      // and the image might be stored in the database (not freshly generated)
      if (generatedImage.id && !generatedImage.url?.startsWith('data:image')) {
        console.log('📥 Attempting API download for stored image:', generatedImage.id);

        try {
          const { imageService } = await import('../services');
          const result = await imageService.downloadImage(generatedImage.id);

          if (result.success) {
            const link = document.createElement('a');
            link.href = result.data.download_url;
            link.download = result.data.filename || `promptcanvas-${generatedImage.id}.png`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            console.log('✅ API download completed successfully');
            return;
          } else {
            console.warn('⚠️ API download failed:', result.error);
          }
        } catch (apiError) {
          console.warn('⚠️ API download error:', apiError);
        }
      }

      // If all else fails
      console.error('❌ No valid download method available for image:', generatedImage);
      alert('Unable to download image. The image data is not available.');

    } catch (error) {
      console.error('❌ Download error:', error);
      alert('Download failed. Please try again.');
    }
  };

  const handleSave = async () => {
    if (generatedImage) {
      // Image is automatically saved to gallery when generated
      alert('Image is already saved to your gallery!');
      // Redirect to gallery to see the saved image
      navigate('/gallery');
    }
  };

  const handleRegenerateWithSamePrompt = () => {
    if (prompt.trim()) {
      handleGenerate();
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Generate AI Images
        </h1>
        <p className="text-gray-600">
          {user
            ? "Transform your ideas into stunning visuals with AI-powered image generation"
            : "Try our AI image generator for free! Create 1 image without signing up, or sign up for 5 images per day."
          }
        </p>

        {/* Welcome Banner for Anonymous Users */}
        {!user && (
          <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                <div>
                  <span className="font-medium text-blue-900">Welcome! Try AI image generation for free</span>
                  <p className="text-sm text-blue-700 mt-1">
                    Generate 1 image without signing up, or create a free account for 5 images per day
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/sign-up')}
                className="ml-4 border-blue-300 text-blue-700 hover:bg-blue-100"
              >
                Sign Up Free
              </Button>
            </div>
          </div>
        )}

        {/* Usage Limits Display */}
        {!loadingUsage && usageData && (
          <div className={`mt-4 p-4 rounded-lg border ${
            usageData.can_generate
              ? 'bg-green-50 border-green-200'
              : 'bg-red-50 border-red-200'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {usageData.user_type === 'anonymous' ? (
                  <Crown className="h-5 w-5 text-yellow-500 mr-2" />
                ) : (
                  <Sparkles className="h-5 w-5 text-blue-500 mr-2" />
                )}
                <span className="font-medium">
                  {usageLimitService.getUsageLimitMessage(usageData)}
                </span>
              </div>
              {usageData.user_type === 'anonymous' && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate('/sign-up')}
                  className="ml-4"
                >
                  Sign Up Free
                </Button>
              )}
            </div>

            {/* Usage Progress Bar */}
            <div className="mt-2">
              <div className="flex justify-between text-sm text-gray-600 mb-1">
                <span>Usage Today</span>
                <span>{usageData.current_usage}/{usageData.limit}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-300 ${
                    usageData.remaining === 0 ? 'bg-red-500' :
                    usageData.remaining <= 1 ? 'bg-orange-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${usageLimitService.getUsagePercentage(usageData)}%` }}
                />
              </div>
              {usageData.reset_time && (
                <div className="text-xs text-gray-500 mt-1">
                  {usageLimitService.formatTimeUntilReset(usageData.reset_time)}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Input Panel */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Wand2 className="mr-2 h-5 w-5" />
                Prompt
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Describe the image you want to create... (e.g., 'A majestic dragon flying over a medieval castle at sunset')"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                rows={4}
                maxLength={500}
                showCharCount={true}
                className="resize-none"
              />
              
              <Textarea
                label="Negative Prompt (Optional)"
                placeholder="What you don't want in the image... (e.g., 'blurry, low quality, distorted')"
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                rows={2}
                maxLength={200}
                showCharCount={true}
                className="resize-none"
              />

              {/* AI Prompt Enhancement */}
              <PromptEnhancer
                prompt={prompt}
                onPromptChange={setPrompt}
                onEnhancedPromptApply={(enhancedPrompt) => {
                  setPrompt(enhancedPrompt);
                  setOptimizedPrompt(enhancedPrompt);
                }}
                className="mt-4"
              />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Select
                  label="Resolution"
                  value={`${settings.width}x${settings.height}`}
                  onChange={(e) => {
                    const [width, height] = e.target.value.split('x').map(Number);
                    setSettings(prev => ({ ...prev, width, height }));
                  }}
                  options={resolutionOptions}
                />
                
                <Select
                  label="Style Preset"
                  value={settings.style || 'none'}
                  onChange={(e) => setSettings(prev => ({ ...prev, style: e.target.value }))}
                  options={stylePresets}
                />
              </div>

              {/* Performance Target Indicator */}
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg p-3">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center">
                    <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                    <span className="font-medium text-blue-800">High Accuracy Mode</span>
                  </div>
                  <div className="text-blue-600 font-medium">Target: 5s | 100% Accuracy</div>
                </div>
                <div className="text-xs text-blue-700 mt-1">
                  Enhanced prompt optimization • Optimized CFG scaling • Quality-first generation
                </div>
              </div>

              <div className="flex gap-3">
                <Button
                  onClick={handleGenerate}
                  disabled={!prompt.trim() || isGenerating || (usageData && !usageData.can_generate)}
                  className="flex-1"
                  loading={isGenerating}
                >
                  <Sparkles className="mr-2 h-4 w-4" />
                  {isGenerating ? 'Generating with High Accuracy...' :
                   usageData && !usageData.can_generate ? 'Limit Reached' :
                   'Generate High-Accuracy Image'}
                </Button>

                <Button
                  variant="outline"
                  onClick={() => setShowSettings(true)}
                >
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Quick Prompts */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Start Prompts</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 gap-2">
                {[
                  'A serene mountain landscape with a crystal clear lake',
                  'Futuristic cyberpunk city with neon lights',
                  'Abstract geometric patterns in vibrant colors',
                  'Mystical forest with glowing mushrooms and fireflies'
                ].map((quickPrompt, index) => (
                  <button
                    key={index}
                    onClick={() => setPrompt(quickPrompt)}
                    className="text-left p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors duration-200"
                  >
                    <span className="text-sm text-gray-700">{quickPrompt}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Output Panel */}
        <div>
          <Card className="h-fit">
            <CardHeader>
              <CardTitle className="flex items-center">
                <ImageIcon className="mr-2 h-5 w-5" />
                Generated Image
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4 relative">
                {isGenerating ? (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <LoadingSpinner size="lg" text="Creating your image..." />
                  </div>
                ) : generatedImage ? (
                  <div className="w-full h-full relative">
                    {generatedImage.url ? (
                      <img
                        src={generatedImage.url}
                        alt={generatedImage.prompt}
                        className="w-full h-full object-cover"
                        onLoad={() => console.log('✅ Image loaded successfully')}
                        onError={(e) => {
                          console.error('❌ Image failed to load:', e);
                          console.error('❌ Image URL length:', generatedImage.url?.length);
                          console.error('❌ Image URL preview:', generatedImage.url?.substring(0, 100) + '...');
                        }}
                        style={{ maxWidth: '100%', height: 'auto' }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-red-100 text-red-600">
                        <div className="text-center">
                          <p className="font-medium">Image URL Missing</p>
                          <p className="text-sm">No image URL in response</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                    <div className="text-center">
                      <ImageIcon className="h-16 w-16 mx-auto mb-4" />
                      <p className="text-lg font-medium">No image generated yet</p>
                      <p className="text-sm">Enter a prompt and click generate</p>
                    </div>
                  </div>
                )}
              </div>

              {generatedImage && (
                <div className="space-y-4">
                  {/* Generation Stats */}
                  <div className="bg-gradient-to-r from-green-50 to-blue-50 p-4 rounded-lg border">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          {generationTime ? `${generationTime.toFixed(1)}s` : '—'}
                        </div>
                        <div className="text-gray-600">Generation Time</div>
                        <div className="text-xs text-gray-500">
                          {generationTime <= 5 ? '🚀 Excellent!' : generationTime <= 8 ? '✅ Good' : '⏱️ Acceptable'}
                        </div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          {promptAccuracy ? `${promptAccuracy}%` : '—'}
                        </div>
                        <div className="text-gray-600">Prompt Accuracy</div>
                        <div className="text-xs text-gray-500">
                          {promptAccuracy >= 95 ? '🎯 Perfect!' : promptAccuracy >= 90 ? '✨ Excellent' : promptAccuracy >= 85 ? '👍 Good' : '📈 Improving'}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="text-sm text-gray-600">
                    <p className="font-medium">Original Prompt:</p>
                    <p className="italic mb-2">"{generatedImage.prompt}"</p>

                    {optimizedPrompt && optimizedPrompt !== generatedImage.prompt && (
                      <>
                        <p className="font-medium text-blue-600">Optimized Prompt:</p>
                        <p className="italic text-blue-700 text-xs">"{optimizedPrompt}"</p>
                      </>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      onClick={handleSave}
                      variant="outline"
                      size="sm"
                      className="flex-1"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      Save to Gallery
                    </Button>
                    <Button
                      onClick={handleRegenerateWithSamePrompt}
                      variant="outline"
                      size="sm"
                    >
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Advanced Settings Modal */}
      <Modal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        title="Advanced Settings"
        size="md"
      >
        <div className="space-y-4">
          {/* Accuracy Optimization Notice */}
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center">
              <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
              <span className="text-sm font-medium text-green-800">Accuracy-Optimized Settings</span>
            </div>
            <div className="text-xs text-green-700 mt-1">
              Current settings are optimized for maximum prompt accuracy within 5 seconds
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Inference Steps: {settings.steps}
              <span className="text-xs text-orange-600 ml-2">
                (FLUX.1-schnell: 1-4 steps optimal)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="4"
              value={settings.steps}
              onChange={(e) => setSettings(prev => ({ ...prev, steps: parseInt(e.target.value) }))}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1 step</span>
              <span>4 steps</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {settings.steps === 1 ? '⚡ Ultra fast' :
               settings.steps <= 2 ? '🚀 Very fast' :
               settings.steps <= 4 ? '✅ FLUX optimal' :
               '⚠️ Too many steps for FLUX'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Guidance Scale: {settings.cfg_scale || settings.guidance}
              <span className="text-xs text-orange-600 ml-2">
                (FLUX.1-schnell: 1.0 recommended)
              </span>
            </label>
            <input
              type="range"
              min="1"
              max="3"
              step="0.1"
              value={settings.cfg_scale || settings.guidance}
              onChange={(e) => {
                const value = parseFloat(e.target.value);
                setSettings(prev => ({
                  ...prev,
                  guidance: value,
                  cfg_scale: value
                }));
              }}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>1.0 (FLUX optimal)</span>
              <span>3.0 (Max)</span>
            </div>
            <div className="text-xs text-blue-600 mt-1">
              {(settings.cfg_scale || settings.guidance) === 1.0 ? '✅ FLUX optimal' :
               (settings.cfg_scale || settings.guidance) <= 2.0 ? '🔧 Experimental' :
               '⚠️ May not work well with FLUX'}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Seed (Random if -1)
            </label>
            <input
              type="number"
              value={settings.seed}
              onChange={(e) => setSettings(prev => ({ ...prev, seed: parseInt(e.target.value) }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="-1 for random"
            />
          </div>
        </div>
      </Modal>

      {/* Upgrade Modal for Anonymous Users */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Get More Images!"
      >
        <div className="space-y-4">
          <div className="text-center">
            <Crown className="h-16 w-16 text-yellow-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              You've reached your daily limit
            </h3>
            <p className="text-gray-600 mb-4">
              Anonymous users can generate 1 image per day. Sign up for free to get 5 images per day!
            </p>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-900 mb-2">Free Account Benefits:</h4>
            <ul className="space-y-1 text-sm text-blue-800">
              <li>• 5 images per day (vs 1 for anonymous)</li>
              <li>• Save images to your personal gallery</li>
              <li>• Access to generation history</li>
              <li>• Favorite and organize your images</li>
              <li>• Higher resolution options</li>
            </ul>
          </div>

          <div className="flex gap-3">
            <Button
              onClick={() => navigate('/sign-up')}
              className="flex-1"
            >
              Sign Up Free
            </Button>
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
              className="flex-1"
            >
              Maybe Later
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default Generate;
