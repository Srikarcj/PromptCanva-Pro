import React, { useState, useCallback } from 'react';
import { 
  Sparkles, 
  Wand2, 
  Lightbulb, 
  RefreshCw, 
  Copy, 
  Check,
  Loader2,
  ChevronDown,
  ChevronUp,
  Palette,
  Camera,
  Sun,
  Zap
} from 'lucide-react';
import Button from '../ui/Button';
import Textarea from '../ui/Textarea';

const PromptEnhancer = ({ 
  prompt, 
  onPromptChange, 
  onEnhancedPromptApply,
  className = "" 
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [enhancedPrompt, setEnhancedPrompt] = useState('');
  const [selectedSuggestionType, setSelectedSuggestionType] = useState('general');
  const [copiedIndex, setCopiedIndex] = useState(null);

  // Predefined enhancement categories
  const enhancementCategories = [
    {
      id: 'general',
      name: 'General Enhancement',
      icon: Sparkles,
      description: 'Overall prompt improvement'
    },
    {
      id: 'style',
      name: 'Style & Aesthetics',
      icon: Palette,
      description: 'Art style and visual aesthetics'
    },
    {
      id: 'lighting',
      name: 'Lighting & Mood',
      icon: Sun,
      description: 'Lighting conditions and atmosphere'
    },
    {
      id: 'composition',
      name: 'Composition',
      icon: Camera,
      description: 'Camera angles and framing'
    },
    {
      id: 'quality',
      name: 'Quality Boosters',
      icon: Zap,
      description: 'Technical quality improvements'
    }
  ];

  // Predefined suggestions for different categories
  const predefinedSuggestions = {
    general: [
      "Add 'highly detailed, professional photography' for better quality",
      "Include 'masterpiece, best quality' for enhanced results",
      "Specify 'ultra-realistic, photorealistic' for realism",
      "Add 'trending on artstation' for artistic appeal"
    ],
    style: [
      "Try 'digital art, concept art' for artistic style",
      "Add 'oil painting, classical art' for traditional look",
      "Include 'cyberpunk, neon colors' for futuristic vibe",
      "Specify 'minimalist, clean design' for simplicity"
    ],
    lighting: [
      "Add 'golden hour lighting, warm tones' for warmth",
      "Include 'dramatic lighting, chiaroscuro' for contrast",
      "Try 'soft diffused lighting, studio lighting' for portraits",
      "Specify 'volumetric lighting, god rays' for atmosphere"
    ],
    composition: [
      "Add 'rule of thirds, balanced composition' for better framing",
      "Include 'close-up portrait, shallow depth of field' for focus",
      "Try 'wide angle, establishing shot' for scope",
      "Specify 'macro photography, extreme close-up' for detail"
    ],
    quality: [
      "Add '8K resolution, ultra high definition' for clarity",
      "Include 'sharp focus, crystal clear' for sharpness",
      "Try 'professional photography, DSLR quality' for realism",
      "Specify 'award-winning photography' for excellence"
    ]
  };

  // Simulate LLM-powered prompt enhancement
  const enhancePrompt = useCallback(async () => {
    if (!prompt.trim()) return;
    
    setIsLoading(true);
    
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Generate enhanced prompt based on category
      const basePrompt = prompt.trim();
      let enhancement = '';
      
      switch (selectedSuggestionType) {
        case 'style':
          enhancement = `${basePrompt}, digital art, highly detailed, vibrant colors, professional artwork, trending on artstation`;
          break;
        case 'lighting':
          enhancement = `${basePrompt}, dramatic lighting, golden hour, volumetric lighting, cinematic atmosphere, professional photography`;
          break;
        case 'composition':
          enhancement = `${basePrompt}, rule of thirds, balanced composition, professional framing, sharp focus, depth of field`;
          break;
        case 'quality':
          enhancement = `${basePrompt}, 8K resolution, ultra high definition, masterpiece, best quality, award-winning photography, crystal clear`;
          break;
        default:
          enhancement = `${basePrompt}, highly detailed, professional quality, masterpiece, best quality, ultra-realistic, trending on artstation`;
      }
      
      setEnhancedPrompt(enhancement);
      
      // Generate category-specific suggestions
      const categorySuggestions = predefinedSuggestions[selectedSuggestionType] || predefinedSuggestions.general;
      setSuggestions(categorySuggestions);
      
    } catch (error) {
      console.error('Enhancement failed:', error);
    } finally {
      setIsLoading(false);
    }
  }, [prompt, selectedSuggestionType]);

  // Apply enhanced prompt
  const applyEnhancement = useCallback(() => {
    if (enhancedPrompt) {
      onPromptChange(enhancedPrompt);
      if (onEnhancedPromptApply) {
        onEnhancedPromptApply(enhancedPrompt);
      }
    }
  }, [enhancedPrompt, onPromptChange, onEnhancedPromptApply]);

  // Copy suggestion to clipboard
  const copySuggestion = useCallback(async (suggestion, index) => {
    try {
      await navigator.clipboard.writeText(suggestion);
      setCopiedIndex(index);
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  }, []);

  // Apply suggestion to current prompt
  const applySuggestion = useCallback((suggestion) => {
    const currentPrompt = prompt.trim();
    const newPrompt = currentPrompt ? `${currentPrompt}, ${suggestion}` : suggestion;
    onPromptChange(newPrompt);
  }, [prompt, onPromptChange]);

  return (
    <div className={`bg-white border border-gray-200 rounded-lg shadow-sm ${className}`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-gray-900">AI Prompt Assistant</h3>
            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full">
              Beta
            </span>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </Button>
        </div>
        
        {!isExpanded && (
          <p className="text-sm text-gray-600 mt-1">
            Get AI-powered suggestions to improve your prompts
          </p>
        )}
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="p-4 space-y-4">
          {/* Enhancement Categories */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Enhancement Type
            </label>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {enhancementCategories.map((category) => {
                const Icon = category.icon;
                return (
                  <button
                    key={category.id}
                    onClick={() => setSelectedSuggestionType(category.id)}
                    className={`p-3 text-left border rounded-lg transition-colors ${
                      selectedSuggestionType === category.id
                        ? 'border-purple-500 bg-purple-50 text-purple-700'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <Icon className="w-4 h-4" />
                      <span className="font-medium text-sm">{category.name}</span>
                    </div>
                    <p className="text-xs text-gray-600">{category.description}</p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Enhance Button */}
          <div className="flex gap-2">
            <Button
              onClick={enhancePrompt}
              disabled={!prompt.trim() || isLoading}
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Enhancing...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 mr-2" />
                  Enhance Prompt
                </>
              )}
            </Button>
            
            {enhancedPrompt && (
              <Button
                variant="outline"
                onClick={applyEnhancement}
              >
                <Check className="w-4 h-4 mr-2" />
                Apply
              </Button>
            )}
          </div>

          {/* Enhanced Prompt Result */}
          {enhancedPrompt && (
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-700">
                Enhanced Prompt
              </label>
              <div className="relative">
                <Textarea
                  value={enhancedPrompt}
                  onChange={(e) => setEnhancedPrompt(e.target.value)}
                  className="pr-10"
                  rows={3}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute top-2 right-2"
                  onClick={() => copySuggestion(enhancedPrompt, 'enhanced')}
                >
                  {copiedIndex === 'enhanced' ? (
                    <Check className="w-4 h-4 text-green-600" />
                  ) : (
                    <Copy className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          )}

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <Lightbulb className="w-4 h-4 text-yellow-600" />
                <label className="text-sm font-medium text-gray-700">
                  Suggestions for {enhancementCategories.find(c => c.id === selectedSuggestionType)?.name}
                </label>
              </div>
              
              <div className="space-y-2">
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                  >
                    <span className="text-sm text-gray-700 flex-1">{suggestion}</span>
                    <div className="flex gap-1 ml-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => applySuggestion(suggestion)}
                        title="Add to prompt"
                      >
                        <Sparkles className="w-3 h-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copySuggestion(suggestion, index)}
                        title="Copy suggestion"
                      >
                        {copiedIndex === index ? (
                          <Check className="w-3 h-3 text-green-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <Lightbulb className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-blue-900 mb-1">Pro Tips:</p>
                <ul className="text-blue-800 space-y-1 text-xs">
                  <li>• Be specific about what you want to see</li>
                  <li>• Include style references (e.g., "like Pixar", "photorealistic")</li>
                  <li>• Add quality modifiers for better results</li>
                  <li>• Experiment with different enhancement types</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PromptEnhancer;
