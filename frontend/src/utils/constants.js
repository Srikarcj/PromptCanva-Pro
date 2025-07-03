// Application constants

export const APP_CONFIG = {
  name: 'PromptCanvas Pro',
  version: '1.0.0',
  description: 'AI-powered image generation platform',
  author: 'PromptCanvas Pro Team',
};

export const API_CONFIG = {
  timeout: 30000, // 30 seconds
  retryAttempts: 3,
  retryDelay: 1000, // 1 second
};

export const IMAGE_CONFIG = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  supportedFormats: ['jpg', 'jpeg', 'png', 'webp'],
  defaultResolution: { width: 1024, height: 1024 },
  maxPromptLength: 500,
  maxNegativePromptLength: 200,
};

export const RESOLUTION_OPTIONS = [
  { value: '512x512', label: '512×512 (Square)', width: 512, height: 512 },
  { value: '1024x1024', label: '1024×1024 (Square)', width: 1024, height: 1024 },
  { value: '1024x768', label: '1024×768 (Landscape)', width: 1024, height: 768 },
  { value: '768x1024', label: '768×1024 (Portrait)', width: 768, height: 1024 },
  { value: '1536x1024', label: '1536×1024 (Wide)', width: 1536, height: 1024 },
  { value: '1024x1536', label: '1024×1536 (Tall)', width: 1024, height: 1536 },
];

export const STYLE_PRESETS = [
  { value: 'none', label: 'None' },
  { value: 'photographic', label: 'Photographic' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'cinematic', label: 'Cinematic' },
  { value: 'anime', label: 'Anime' },
  { value: 'fantasy-art', label: 'Fantasy Art' },
  { value: 'neon-punk', label: 'Neon Punk' },
  { value: 'isometric', label: 'Isometric' },
  { value: 'line-art', label: 'Line Art' },
  { value: 'low-poly', label: 'Low Poly' },
];

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'prompt', label: 'Prompt A-Z' },
  { value: 'favorites', label: 'Favorites First' },
  { value: 'resolution', label: 'Resolution' },
];

export const FILTER_OPTIONS = [
  { value: 'all', label: 'All Images' },
  { value: 'favorites', label: 'Favorites Only' },
  { value: 'recent', label: 'Last 7 Days' },
  { value: 'this-month', label: 'This Month' },
  { value: 'square', label: 'Square Images' },
  { value: 'landscape', label: 'Landscape Images' },
  { value: 'portrait', label: 'Portrait Images' },
];

export const GENERATION_SETTINGS = {
  steps: {
    min: 1,
    max: 50,
    default: 4,
    description: 'Number of inference steps',
  },
  guidance: {
    min: 1,
    max: 20,
    default: 7.5,
    step: 0.5,
    description: 'How closely to follow the prompt',
  },
  seed: {
    min: -1,
    max: 2147483647,
    default: -1,
    description: 'Random seed (-1 for random)',
  },
};

export const QUICK_PROMPTS = [
  'A serene mountain landscape with a crystal clear lake',
  'Futuristic cyberpunk city with neon lights and flying cars',
  'Abstract geometric patterns in vibrant colors',
  'Mystical forest with glowing mushrooms and fireflies',
  'Majestic dragon flying over a medieval castle at sunset',
  'Steampunk airship floating above Victorian city',
  'Underwater coral reef with tropical fish',
  'Space station orbiting a distant planet',
  'Ancient temple ruins covered in jungle vines',
  'Northern lights dancing over snowy mountains',
];

export const ERROR_MESSAGES = {
  network: 'Network error - please check your connection',
  unauthorized: 'Please sign in to continue',
  forbidden: 'You do not have permission to perform this action',
  notFound: 'The requested resource was not found',
  serverError: 'Server error - please try again later',
  timeout: 'Request timed out - please try again',
  unknown: 'An unexpected error occurred',
};

export const SUCCESS_MESSAGES = {
  imageGenerated: 'Image generated successfully!',
  imageSaved: 'Image saved to gallery',
  imageDeleted: 'Image deleted successfully',
  favoriteAdded: 'Added to favorites',
  favoriteRemoved: 'Removed from favorites',
  profileUpdated: 'Profile updated successfully',
  settingsUpdated: 'Settings updated successfully',
};

export const ROUTES = {
  home: '/',
  signIn: '/sign-in',
  signUp: '/sign-up',
  dashboard: '/dashboard',
  generate: '/generate',
  gallery: '/gallery',
  profile: '/profile',
  settings: '/settings',
  history: '/history',
  favorites: '/favorites',
};

export const STORAGE_KEYS = {
  theme: 'promptcanvas_theme',
  settings: 'promptcanvas_settings',
  recentPrompts: 'promptcanvas_recent_prompts',
  generationHistory: 'promptcanvas_generation_history',
};

export const THEMES = {
  light: 'light',
  dark: 'dark',
  system: 'system',
};

export const PAGINATION = {
  defaultLimit: 20,
  maxLimit: 100,
  defaultPage: 1,
};

export const RATE_LIMITS = {
  generation: {
    perMinute: 5,
    perHour: 5,
    perDay: 5,  // Updated to match new authenticated user limit
    anonymous: 1,  // Anonymous users get 1 per day
  },
  download: {
    perMinute: 10,
    perHour: 100,
  },
};

export default {
  APP_CONFIG,
  API_CONFIG,
  IMAGE_CONFIG,
  RESOLUTION_OPTIONS,
  STYLE_PRESETS,
  SORT_OPTIONS,
  FILTER_OPTIONS,
  GENERATION_SETTINGS,
  QUICK_PROMPTS,
  ERROR_MESSAGES,
  SUCCESS_MESSAGES,
  ROUTES,
  STORAGE_KEYS,
  THEMES,
  PAGINATION,
  RATE_LIMITS,
};
