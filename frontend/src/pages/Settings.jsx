import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import DataRecovery from '../components/DataRecovery';
import { useTheme } from '../contexts/ThemeContext';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button,
  Select,
  LoadingSpinner
} from '../components/ui';
import {
  Settings as SettingsIcon,
  Image,
  Bell,
  Shield,
  Palette,
  Download,
  Globe,
  Save,
  RotateCcw,
  Monitor,
  Moon,
  Sun,
  Smartphone,
  Mail,
  Lock,
  Eye,
  EyeOff,
  Zap,
  HardDrive,
  Clock
} from 'lucide-react';
import { userService } from '../services';
import { RESOLUTION_OPTIONS, STYLE_PRESETS, THEMES, STORAGE_KEYS } from '../utils/constants';

const Settings = () => {
  const { user } = useUser();
  const { theme: currentTheme, setTheme } = useTheme();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // Generation Defaults
    default_resolution: '1024x1024',
    default_steps: 4,
    default_guidance_scale: 7.5,
    default_style: 'none',
    auto_save_to_gallery: true,
    
    // Privacy & Security
    public_gallery: false,
    show_in_community: false,
    allow_downloads: true,
    watermark_images: false,
    
    // Notifications
    email_notifications: true,
    generation_complete: true,
    weekly_summary: true,
    feature_updates: true,
    security_alerts: true,
    
    // Interface
    theme: 'system',
    compact_mode: false,
    show_advanced_options: false,
    auto_expand_settings: false,
    
    // Performance
    image_quality: 'high',
    auto_optimize: true,
    preload_images: true,
    cache_generations: true,
    
    // Storage
    auto_cleanup: false,
    cleanup_after_days: 30,
    max_storage_mb: 500,
  });

  const [originalSettings, setOriginalSettings] = useState({});
  const [hasChanges, setHasChanges] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Load from localStorage first for immediate application
        const localSettings = loadLocalSettings();

        // Merge with defaults
        const mergedSettings = { ...settings, ...localSettings };

        // Try to load from backend
        const result = await userService.getSettings();
        if (result.success) {
          const loadedSettings = { ...mergedSettings, ...result.data, theme: currentTheme };
          setSettings(loadedSettings);
          setOriginalSettings(loadedSettings);

          // Apply settings immediately (except theme which is handled by ThemeContext)
          applyAllSettings(loadedSettings);
        } else {
          // Use local settings if backend fails
          const fallbackSettings = { ...mergedSettings, theme: currentTheme };
          setSettings(fallbackSettings);
          setOriginalSettings(fallbackSettings);
          applyAllSettings(fallbackSettings);
        }
      } catch (error) {
        console.error('Failed to load settings:', error);
        // Fallback to local settings
        const localSettings = loadLocalSettings();
        const mergedSettings = { ...settings, ...localSettings, theme: currentTheme };
        setSettings(mergedSettings);
        setOriginalSettings(mergedSettings);
        applyAllSettings(mergedSettings);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadLocalSettings = () => {
    const localSettings = {};

    // Load theme
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme);
    if (savedTheme) {
      localSettings.theme = savedTheme;
    }

    // Load other settings from localStorage
    const settingsKeys = [
      'compact_mode',
      'show_advanced_options',
      'auto_save_to_gallery',
      'image_quality',
      'generation_default_resolution',
      'generation_default_style',
      'generation_default_steps',
      'generation_default_guidance_scale'
    ];

    settingsKeys.forEach(key => {
      const value = localStorage.getItem(key);
      if (value !== null) {
        try {
          localSettings[key.replace('generation_', '')] = JSON.parse(value);
        } catch {
          localSettings[key.replace('generation_', '')] = value;
        }
      }
    });

    return localSettings;
  };

  const applyAllSettings = (settingsToApply) => {
    // Apply compact mode
    if (settingsToApply.compact_mode) {
      applyCompactMode(settingsToApply.compact_mode);
    }

    // Apply other visual settings (excluding theme which is handled by ThemeContext)
    Object.entries(settingsToApply).forEach(([key, value]) => {
      if (key !== 'theme' && key !== 'compact_mode') {
        applyRealTimeChanges(key, value);
      }
    });
  };

  // Check for changes
  useEffect(() => {
    const changed = JSON.stringify(settings) !== JSON.stringify(originalSettings);
    setHasChanges(changed);
  }, [settings, originalSettings]);

  // Initialize settings with current theme
  useEffect(() => {
    if (currentTheme && settings.theme !== currentTheme) {
      setSettings(prev => ({ ...prev, theme: currentTheme }));
    }
  }, [currentTheme]);

  // Cleanup function
  useEffect(() => {
    return () => {
      // Remove any toast notifications
      const toasts = document.querySelectorAll('.settings-toast');
      toasts.forEach(toast => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      });
    };
  }, []);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({
      ...prev,
      [key]: value
    }));

    // Apply real-time changes
    applyRealTimeChanges(key, value);
  };

  const applyRealTimeChanges = (key, value) => {
    switch (key) {
      case 'theme':
        setTheme(value);
        showNotification(`Theme changed to ${value}`);
        break;
      case 'compact_mode':
        applyCompactMode(value);
        break;
      case 'show_advanced_options':
        // Store in localStorage for immediate use
        localStorage.setItem('show_advanced_options', JSON.stringify(value));
        break;
      case 'email_notifications':
        // Show notification about email preference change
        showNotification(`Email notifications ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'public_gallery':
        showNotification(`Gallery is now ${value ? 'public' : 'private'}`);
        break;
      case 'auto_save_to_gallery':
        localStorage.setItem('auto_save_to_gallery', JSON.stringify(value));
        showNotification(`Auto-save ${value ? 'enabled' : 'disabled'}`);
        break;
      case 'image_quality':
        localStorage.setItem('image_quality', value);
        showNotification(`Image quality set to ${value}`);
        break;
      case 'default_resolution':
      case 'default_style':
      case 'default_steps':
      case 'default_guidance_scale':
        // Store generation defaults for immediate use
        localStorage.setItem(`generation_${key}`, JSON.stringify(value));
        break;
      default:
        break;
    }
  };



  const applyCompactMode = (enabled) => {
    const root = document.documentElement;

    if (enabled) {
      root.classList.add('compact-mode');
      // Apply compact styles
      root.style.setProperty('--spacing-unit', '0.75rem');
      root.style.setProperty('--text-size-base', '0.875rem');
      root.style.setProperty('--component-height', '2rem');
    } else {
      root.classList.remove('compact-mode');
      // Apply normal styles
      root.style.setProperty('--spacing-unit', '1rem');
      root.style.setProperty('--text-size-base', '1rem');
      root.style.setProperty('--component-height', '2.5rem');
    }

    localStorage.setItem('compact_mode', JSON.stringify(enabled));

    if (enabled !== settings.compact_mode) {
      showNotification(`Compact mode ${enabled ? 'enabled' : 'disabled'}`);
    }
  };

  const showNotification = (message, type = 'success') => {
    // Remove existing notifications
    const existingToasts = document.querySelectorAll('.settings-toast');
    existingToasts.forEach(toast => {
      if (document.body.contains(toast)) {
        document.body.removeChild(toast);
      }
    });

    // Create a toast notification
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-green-600' : type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600';
    toast.className = `settings-toast fixed top-4 right-4 ${bgColor} text-white px-4 py-2 rounded-lg shadow-lg z-50 transition-all duration-300 transform translate-x-full opacity-0`;

    // Add icon based on type
    const icon = type === 'success' ? '✓' : type === 'warning' ? '⚠' : 'ℹ';
    toast.innerHTML = `<span class="mr-2">${icon}</span>${message}`;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
      toast.style.transform = 'translateX(0)';
      toast.style.opacity = '1';
    }, 100);

    // Remove after 3 seconds
    setTimeout(() => {
      toast.style.transform = 'translateX(100%)';
      toast.style.opacity = '0';
      setTimeout(() => {
        if (document.body.contains(toast)) {
          document.body.removeChild(toast);
        }
      }, 300);
    }, 3000);
  };

  // Add real-time preview for image quality
  const getQualityDescription = (quality) => {
    switch (quality) {
      case 'standard':
        return 'Faster generation, good for previews';
      case 'high':
        return 'Balanced quality and speed (recommended)';
      case 'ultra':
        return 'Best quality, slower generation';
      default:
        return '';
    }
  };

  // Add real-time feedback for generation settings
  const getStepsDescription = (steps) => {
    if (steps < 10) return 'Very fast, lower quality';
    if (steps < 20) return 'Fast, good quality';
    if (steps < 35) return 'Balanced speed and quality';
    return 'Slow, highest quality';
  };

  const getGuidanceDescription = (guidance) => {
    if (guidance < 5) return 'More creative, less precise';
    if (guidance < 10) return 'Balanced creativity and precision';
    if (guidance < 15) return 'More precise, less creative';
    return 'Very precise, may be rigid';
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const result = await userService.updateSettings(settings);
      if (result.success) {
        setOriginalSettings(settings);
        setHasChanges(false);
        // Show success message
      }
    } catch (error) {
      console.error('Failed to save settings:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setSettings(originalSettings);
    setHasChanges(false);
  };

  const resolutionOptions = RESOLUTION_OPTIONS.map(res => ({
    value: res.value,
    label: res.label
  }));

  const styleOptions = STYLE_PRESETS.map(style => ({
    value: style.value,
    label: style.label
  }));

  const themeOptions = [
    { value: 'light', label: 'Light', icon: Sun },
    { value: 'dark', label: 'Dark', icon: Moon },
    { value: 'system', label: 'System', icon: Monitor }
  ];

  const qualityOptions = [
    { value: 'standard', label: 'Standard (Faster)' },
    { value: 'high', label: 'High (Recommended)' },
    { value: 'ultra', label: 'Ultra (Slower)' }
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Loading settings..." />
      </div>
    );
  }

  return (
    <div className="w-full h-screen bg-gray-50 flex flex-col overflow-hidden">
      <div className="max-w-4xl mx-auto px-4 py-6 sm:px-6 lg:px-8 flex flex-col h-full">
        {/* Fixed Header */}
        <div className="flex-shrink-0 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <SettingsIcon className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
                <p className="text-gray-600 mt-1">Customize your experience</p>
              </div>
            </div>

            {/* Action Buttons */}
            {hasChanges && (
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-y-auto pr-2 -mr-2">
          <div className="space-y-6 pb-20">
          {/* Generation Defaults */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Image className="w-5 h-5 mr-2" />
                Generation Defaults
              </CardTitle>
              <p className="text-sm text-gray-600">
                Set your preferred defaults for image generation
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Resolution
                  </label>
                  <Select
                    value={settings.default_resolution}
                    onChange={(e) => handleSettingChange('default_resolution', e.target.value)}
                    options={resolutionOptions}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Default Style
                  </label>
                  <Select
                    value={settings.default_style}
                    onChange={(e) => handleSettingChange('default_style', e.target.value)}
                    options={styleOptions}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Inference Steps: {settings.default_steps}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="50"
                    value={settings.default_steps}
                    onChange={(e) => handleSettingChange('default_steps', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Faster</span>
                    <span>Higher Quality</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {getStepsDescription(settings.default_steps)}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Guidance Scale: {settings.default_guidance_scale}
                  </label>
                  <input
                    type="range"
                    min="1"
                    max="20"
                    step="0.5"
                    value={settings.default_guidance_scale}
                    onChange={(e) => handleSettingChange('default_guidance_scale', parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>Creative</span>
                    <span>Precise</span>
                  </div>
                  <p className="text-xs text-blue-600 mt-1 font-medium">
                    {getGuidanceDescription(settings.default_guidance_scale)}
                  </p>
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <HardDrive className="w-5 h-5 text-gray-600 mr-3" />
                  <div>
                    <p className="font-medium text-gray-900">Auto-save to Gallery</p>
                    <p className="text-sm text-gray-600">Automatically save generated images</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.auto_save_to_gallery}
                    onChange={(e) => handleSettingChange('auto_save_to_gallery', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          {/* Privacy & Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Shield className="w-5 h-5 mr-2" />
                Privacy & Security
              </CardTitle>
              <p className="text-sm text-gray-600">
                Control who can see your content and how it's shared
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Globe className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Public Gallery</p>
                      <p className="text-sm text-gray-600">Allow others to see your images</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.public_gallery}
                      onChange={(e) => handleSettingChange('public_gallery', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Eye className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Show in Community</p>
                      <p className="text-sm text-gray-600">Feature your best images in community showcase</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_in_community}
                      onChange={(e) => handleSettingChange('show_in_community', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Download className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Allow Downloads</p>
                      <p className="text-sm text-gray-600">Let others download your public images</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.allow_downloads}
                      onChange={(e) => handleSettingChange('allow_downloads', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                Notifications
              </CardTitle>
              <p className="text-sm text-gray-600">
                Choose what notifications you'd like to receive
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Mail className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Email Notifications</p>
                      <p className="text-sm text-gray-600">Receive notifications via email</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.email_notifications}
                      onChange={(e) => handleSettingChange('email_notifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Generation Complete</p>
                      <p className="text-sm text-gray-600">Notify when image generation finishes</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.generation_complete}
                      onChange={(e) => handleSettingChange('generation_complete', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Weekly Summary</p>
                      <p className="text-sm text-gray-600">Weekly report of your activity</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.weekly_summary}
                      onChange={(e) => handleSettingChange('weekly_summary', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Lock className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Security Alerts</p>
                      <p className="text-sm text-gray-600">Important security notifications</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.security_alerts}
                      onChange={(e) => handleSettingChange('security_alerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Interface & Appearance */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="w-5 h-5 mr-2" />
                Interface & Appearance
              </CardTitle>
              <p className="text-sm text-gray-600">
                Customize how the app looks and feels
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Theme
                </label>
                <div className="grid grid-cols-3 gap-3">
                  {themeOptions.map((theme) => {
                    const Icon = theme.icon;
                    return (
                      <button
                        key={theme.value}
                        onClick={() => handleSettingChange('theme', theme.value)}
                        className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                          settings.theme === theme.value
                            ? 'border-blue-500 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-gray-300 text-gray-700'
                        }`}
                      >
                        <Icon className="w-5 h-5 mx-auto mb-2" />
                        <div className="text-sm font-medium">{theme.label}</div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Smartphone className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Compact Mode</p>
                      <p className="text-sm text-gray-600">Use smaller interface elements</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.compact_mode}
                      onChange={(e) => handleSettingChange('compact_mode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <SettingsIcon className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Show Advanced Options</p>
                      <p className="text-sm text-gray-600">Display advanced generation settings by default</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.show_advanced_options}
                      onChange={(e) => handleSettingChange('show_advanced_options', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Performance & Storage */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Zap className="w-5 h-5 mr-2" />
                Performance & Storage
              </CardTitle>
              <p className="text-sm text-gray-600">
                Optimize app performance and manage storage
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Image Quality
                </label>
                <Select
                  value={settings.image_quality}
                  onChange={(e) => handleSettingChange('image_quality', e.target.value)}
                  options={qualityOptions}
                />
                <p className="text-xs text-blue-600 mt-1 font-medium">
                  {getQualityDescription(settings.image_quality)}
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Zap className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Auto-optimize</p>
                      <p className="text-sm text-gray-600">Automatically optimize images for faster loading</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_optimize}
                      onChange={(e) => handleSettingChange('auto_optimize', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <HardDrive className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Cache Generations</p>
                      <p className="text-sm text-gray-600">Store recent generations for faster access</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.cache_generations}
                      onChange={(e) => handleSettingChange('cache_generations', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-5 h-5 text-gray-600 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">Auto-cleanup</p>
                      <p className="text-sm text-gray-600">Automatically delete old images after {settings.cleanup_after_days} days</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.auto_cleanup}
                      onChange={(e) => handleSettingChange('auto_cleanup', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              </div>

              {settings.auto_cleanup && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cleanup after: {settings.cleanup_after_days} days
                  </label>
                  <input
                    type="range"
                    min="7"
                    max="365"
                    value={settings.cleanup_after_days}
                    onChange={(e) => handleSettingChange('cleanup_after_days', parseInt(e.target.value))}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-1">
                    <span>7 days</span>
                    <span>1 year</span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Data Recovery Section */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <HardDrive className="w-5 h-5 mr-2" />
                Data Recovery & Backup
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-4">
                  Recover lost images and history, or create backups of your data.
                  Your data is now saved to multiple storage locations to prevent loss.
                </p>
              </div>
              <DataRecovery />
            </CardContent>
          </Card>
          </div>
        </div>

        {/* Sticky Save Bar */}
        {hasChanges && (
          <div className="flex-shrink-0 bg-white border-t border-gray-200 p-4 shadow-lg">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600">You have unsaved changes</p>
              <div className="flex space-x-3">
                <Button
                  variant="outline"
                  onClick={handleReset}
                  className="flex items-center"
                >
                  <RotateCcw className="w-4 h-4 mr-2" />
                  Reset
                </Button>
                <Button
                  onClick={handleSave}
                  loading={saving}
                  className="flex items-center"
                >
                  <Save className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Settings;
