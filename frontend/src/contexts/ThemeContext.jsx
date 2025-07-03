import React, { createContext, useContext, useEffect, useState } from 'react';
import { STORAGE_KEYS } from '../utils/constants';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('system');
  const [isDark, setIsDark] = useState(false);

  // Apply theme styles to the entire application
  const applyTheme = (newTheme) => {
    const root = document.documentElement;
    const body = document.body;
    
    // Remove existing theme classes
    root.classList.remove('dark', 'light');
    
    let shouldBeDark = false;
    
    if (newTheme === 'dark') {
      shouldBeDark = true;
    } else if (newTheme === 'light') {
      shouldBeDark = false;
    } else if (newTheme === 'system') {
      shouldBeDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    }
    
    // Apply theme classes and styles
    if (shouldBeDark) {
      root.classList.add('dark');
      body.style.backgroundColor = '#0f172a';
      body.style.color = '#f1f5f9';
      applyDarkModeStyles();
    } else {
      root.classList.add('light');
      body.style.backgroundColor = '#ffffff';
      body.style.color = '#0f172a';
      applyLightModeStyles();
    }
    
    setIsDark(shouldBeDark);
    setTheme(newTheme);
    
    // Store theme preference
    localStorage.setItem(STORAGE_KEYS.theme, newTheme);
    
    // Update CSS custom properties
    updateThemeVariables(shouldBeDark);
  };

  const applyDarkModeStyles = () => {
    const style = document.getElementById('global-theme-styles') || document.createElement('style');
    style.id = 'global-theme-styles';
    
    style.textContent = `
      /* Global Dark Mode Styles */
      .dark {
        color-scheme: dark;
      }
      
      .dark body {
        background-color: #0f172a !important;
        color: #f1f5f9 !important;
      }
      
      /* Cards and containers */
      .dark .bg-white {
        background-color: #1e293b !important;
        color: #f1f5f9 !important;
      }
      
      .dark .bg-gray-50 {
        background-color: #0f172a !important;
      }
      
      .dark .bg-gray-100 {
        background-color: #1e293b !important;
      }
      
      .dark .bg-gray-200 {
        background-color: #334155 !important;
      }
      
      /* Text colors */
      .dark .text-gray-900 {
        color: #f1f5f9 !important;
      }
      
      .dark .text-gray-800 {
        color: #e2e8f0 !important;
      }
      
      .dark .text-gray-700 {
        color: #cbd5e1 !important;
      }
      
      .dark .text-gray-600 {
        color: #94a3b8 !important;
      }
      
      .dark .text-gray-500 {
        color: #64748b !important;
      }
      
      .dark .text-gray-400 {
        color: #475569 !important;
      }
      
      /* Borders */
      .dark .border-gray-200 {
        border-color: #334155 !important;
      }
      
      .dark .border-gray-300 {
        border-color: #475569 !important;
      }
      
      .dark .border-gray-100 {
        border-color: #1e293b !important;
      }
      
      /* Hover states */
      .dark .hover\\:bg-gray-50:hover {
        background-color: #1e293b !important;
      }
      
      .dark .hover\\:bg-gray-100:hover {
        background-color: #334155 !important;
      }
      
      .dark .hover\\:text-gray-900:hover {
        color: #f1f5f9 !important;
      }
      
      /* Form elements */
      .dark input,
      .dark select,
      .dark textarea {
        background-color: #1e293b !important;
        color: #f1f5f9 !important;
        border-color: #475569 !important;
      }
      
      .dark input:focus,
      .dark select:focus,
      .dark textarea:focus {
        border-color: #3b82f6 !important;
        box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1) !important;
      }
      
      /* Shadows */
      .dark .shadow-sm {
        box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.3) !important;
      }
      
      .dark .shadow {
        box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px 0 rgba(0, 0, 0, 0.2) !important;
      }
      
      .dark .shadow-lg {
        box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -2px rgba(0, 0, 0, 0.2) !important;
      }
      
      /* Sidebar specific */
      .dark .bg-blue-50 {
        background-color: #1e3a8a !important;
      }
      
      .dark .text-blue-700 {
        color: #60a5fa !important;
      }
      
      .dark .border-blue-700 {
        border-color: #3b82f6 !important;
      }
      
      /* Header */
      .dark header {
        background-color: #1e293b !important;
        border-color: #334155 !important;
      }
      
      /* Buttons */
      .dark .bg-blue-600 {
        background-color: #2563eb !important;
      }
      
      .dark .hover\\:bg-blue-700:hover {
        background-color: #1d4ed8 !important;
      }
      
      /* Cards hover effects */
      .dark .hover\\:shadow-md:hover {
        box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2) !important;
      }
    `;
    
    if (!document.head.contains(style)) {
      document.head.appendChild(style);
    }
  };

  const applyLightModeStyles = () => {
    const style = document.getElementById('global-theme-styles');
    if (style) {
      style.textContent = `
        /* Light mode - minimal overrides */
        .light {
          color-scheme: light;
        }
      `;
    }
  };

  const updateThemeVariables = (shouldBeDark) => {
    const root = document.documentElement;
    
    if (shouldBeDark) {
      // Dark theme variables
      root.style.setProperty('--bg-primary', '#0f172a');
      root.style.setProperty('--bg-secondary', '#1e293b');
      root.style.setProperty('--bg-tertiary', '#334155');
      root.style.setProperty('--text-primary', '#f1f5f9');
      root.style.setProperty('--text-secondary', '#cbd5e1');
      root.style.setProperty('--text-tertiary', '#94a3b8');
      root.style.setProperty('--border-color', '#334155');
      root.style.setProperty('--border-light', '#1e293b');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.3)');
    } else {
      // Light theme variables
      root.style.setProperty('--bg-primary', '#ffffff');
      root.style.setProperty('--bg-secondary', '#f8fafc');
      root.style.setProperty('--bg-tertiary', '#f1f5f9');
      root.style.setProperty('--text-primary', '#0f172a');
      root.style.setProperty('--text-secondary', '#475569');
      root.style.setProperty('--text-tertiary', '#64748b');
      root.style.setProperty('--border-color', '#e2e8f0');
      root.style.setProperty('--border-light', '#f1f5f9');
      root.style.setProperty('--shadow-color', 'rgba(0, 0, 0, 0.1)');
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem(STORAGE_KEYS.theme) || 'system';
    applyTheme(savedTheme);
  }, []);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleSystemThemeChange = () => {
      if (theme === 'system') {
        applyTheme('system');
      }
    };
    
    mediaQuery.addEventListener('change', handleSystemThemeChange);
    
    return () => {
      mediaQuery.removeEventListener('change', handleSystemThemeChange);
    };
  }, [theme]);

  const value = {
    theme,
    isDark,
    setTheme: applyTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
