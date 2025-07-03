import React from 'react';
import { 
  Calendar, 
  Plus, 
  Wrench, 
  Bug, 
  Shield, 
  Zap,
  Star,
  AlertTriangle
} from 'lucide-react';

const Changelog = () => {
  const releases = [
    {
      version: "2.1.0",
      date: "2024-01-15",
      type: "major",
      title: "Enhanced AI Models & Performance",
      description: "Major improvements to image generation quality and speed",
      changes: [
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "New AI Model v3.0",
          description: "50% faster generation with improved accuracy and detail"
        },
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Advanced Style Controls",
          description: "Fine-tune artistic styles with new parameter controls"
        },
        {
          type: "improvement",
          icon: <Wrench className="w-4 h-4" />,
          title: "Enhanced Admin Panel",
          description: "Real-time analytics and improved user management"
        },
        {
          type: "fix",
          icon: <Bug className="w-4 h-4" />,
          title: "Fixed Image Persistence",
          description: "Resolved issues with image history not saving properly"
        }
      ]
    },
    {
      version: "2.0.5",
      date: "2024-01-08",
      type: "patch",
      title: "Bug Fixes & Stability",
      description: "Critical bug fixes and performance improvements",
      changes: [
        {
          type: "fix",
          icon: <Bug className="w-4 h-4" />,
          title: "Rate Limiting Issues",
          description: "Fixed admin panel being affected by rate limits"
        },
        {
          type: "fix",
          icon: <Bug className="w-4 h-4" />,
          title: "Mobile Sidebar",
          description: "Resolved sidebar overlay issues on mobile devices"
        },
        {
          type: "improvement",
          icon: <Wrench className="w-4 h-4" />,
          title: "Error Handling",
          description: "Better error messages and user feedback"
        }
      ]
    },
    {
      version: "2.0.0",
      date: "2024-01-01",
      type: "major",
      title: "Complete Platform Redesign",
      description: "Major overhaul with new features and improved user experience",
      changes: [
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Modern UI/UX",
          description: "Complete redesign with improved navigation and aesthetics"
        },
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "User Authentication",
          description: "Secure login system with persistent user sessions"
        },
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Image Gallery",
          description: "Personal gallery with favorites and organization features"
        },
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Admin Dashboard",
          description: "Comprehensive admin panel for platform management"
        },
        {
          type: "security",
          icon: <Shield className="w-4 h-4" />,
          title: "Enhanced Security",
          description: "Improved authentication and data protection measures"
        }
      ]
    },
    {
      version: "1.5.2",
      date: "2023-12-15",
      type: "patch",
      title: "Performance Optimizations",
      description: "Speed improvements and bug fixes",
      changes: [
        {
          type: "improvement",
          icon: <Zap className="w-4 h-4" />,
          title: "Faster Image Generation",
          description: "Reduced average generation time from 8s to 5s"
        },
        {
          type: "improvement",
          icon: <Wrench className="w-4 h-4" />,
          title: "Better Caching",
          description: "Improved image caching for faster loading"
        },
        {
          type: "fix",
          icon: <Bug className="w-4 h-4" />,
          title: "Memory Leaks",
          description: "Fixed memory issues causing slow performance"
        }
      ]
    },
    {
      version: "1.5.0",
      date: "2023-12-01",
      type: "minor",
      title: "New Features & Improvements",
      description: "Added new functionality and enhanced existing features",
      changes: [
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Batch Generation",
          description: "Generate multiple images from a single prompt"
        },
        {
          type: "new",
          icon: <Plus className="w-4 h-4" />,
          title: "Export Options",
          description: "Multiple format support (PNG, JPG, WebP)"
        },
        {
          type: "improvement",
          icon: <Wrench className="w-4 h-4" />,
          title: "Prompt Suggestions",
          description: "AI-powered prompt enhancement suggestions"
        }
      ]
    }
  ];

  const getTypeColor = (type) => {
    switch (type) {
      case 'major': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'minor': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'patch': return 'bg-green-100 text-green-800 border-green-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getChangeTypeColor = (type) => {
    switch (type) {
      case 'new': return 'text-green-600 bg-green-50';
      case 'improvement': return 'text-blue-600 bg-blue-50';
      case 'fix': return 'text-orange-600 bg-orange-50';
      case 'security': return 'text-red-600 bg-red-50';
      default: return 'text-gray-600 bg-gray-50';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Calendar className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Changelog
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Stay updated with the latest features, improvements, and fixes to PromptCanvas Pro
            </p>
          </div>
        </div>
      </div>

      {/* Changelog Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="space-y-12">
          {releases.map((release, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg overflow-hidden">
              {/* Release Header */}
              <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-8 py-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <h2 className="text-2xl font-bold text-gray-900">
                      Version {release.version}
                    </h2>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${getTypeColor(release.type)}`}>
                      {release.type.charAt(0).toUpperCase() + release.type.slice(1)} Release
                    </span>
                  </div>
                  <div className="text-sm text-gray-500 flex items-center">
                    <Calendar className="w-4 h-4 mr-2" />
                    {new Date(release.date).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    })}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{release.title}</h3>
                  <p className="text-gray-600">{release.description}</p>
                </div>
              </div>

              {/* Changes List */}
              <div className="px-8 py-6">
                <div className="space-y-4">
                  {release.changes.map((change, changeIndex) => (
                    <div key={changeIndex} className="flex items-start space-x-4 p-4 rounded-lg border border-gray-100 hover:bg-gray-50 transition-colors">
                      <div className={`p-2 rounded-full ${getChangeTypeColor(change.type)}`}>
                        {change.icon}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{change.title}</h4>
                          <span className={`px-2 py-1 rounded text-xs font-medium ${getChangeTypeColor(change.type)}`}>
                            {change.type === 'new' ? 'New' :
                             change.type === 'improvement' ? 'Improved' :
                             change.type === 'fix' ? 'Fixed' :
                             change.type === 'security' ? 'Security' : change.type}
                          </span>
                        </div>
                        <p className="text-gray-600">{change.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Subscribe Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-12">
          <div className="text-center">
            <Star className="w-12 h-12 mx-auto mb-4 text-yellow-500" />
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-6">
              Get notified about new releases, features, and important updates
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Change Types</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-green-50 text-green-600">
                <Plus className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600">New Feature</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-blue-50 text-blue-600">
                <Wrench className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600">Improvement</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-orange-50 text-orange-600">
                <Bug className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600">Bug Fix</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-full bg-red-50 text-red-600">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-sm text-gray-600">Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Changelog;
