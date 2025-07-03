import React from 'react';
import { 
  Palette, 
  Zap, 
  Shield, 
  Users, 
  Download, 
  Clock, 
  Star, 
  Sparkles,
  Image as ImageIcon,
  Layers,
  Settings,
  BarChart3
} from 'lucide-react';

const Features = () => {
  const features = [
    {
      icon: <Zap className="w-8 h-8 text-blue-600" />,
      title: "Lightning Fast Generation",
      description: "Generate stunning images in under 5 seconds with 100% accuracy for your prompts.",
      highlight: "5 Second Generation"
    },
    {
      icon: <Sparkles className="w-8 h-8 text-purple-600" />,
      title: "AI-Powered Creativity",
      description: "Advanced AI models that understand context and create exactly what you envision.",
      highlight: "100% Accuracy"
    },
    {
      icon: <ImageIcon className="w-8 h-8 text-green-600" />,
      title: "High-Quality Images",
      description: "Professional-grade images with crisp details and vibrant colors for any use case.",
      highlight: "4K Resolution"
    },
    {
      icon: <Users className="w-8 h-8 text-orange-600" />,
      title: "User-Friendly Limits",
      description: "1 free image for guests, 5 images per day for registered users. Fair and accessible.",
      highlight: "Fair Usage"
    },
    {
      icon: <Download className="w-8 h-8 text-indigo-600" />,
      title: "Instant Downloads",
      description: "Download your generated images immediately in multiple formats and resolutions.",
      highlight: "Multiple Formats"
    },
    {
      icon: <Shield className="w-8 h-8 text-red-600" />,
      title: "Persistent Storage",
      description: "Your images and history are saved permanently, never lost between sessions.",
      highlight: "Never Lose Data"
    },
    {
      icon: <Layers className="w-8 h-8 text-teal-600" />,
      title: "Gallery Management",
      description: "Organize your creations with favorites, collections, and easy search functionality.",
      highlight: "Smart Organization"
    },
    {
      icon: <Settings className="w-8 h-8 text-gray-600" />,
      title: "Advanced Settings",
      description: "Fine-tune your generations with style controls, aspect ratios, and quality settings.",
      highlight: "Full Control"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-pink-600" />,
      title: "Usage Analytics",
      description: "Track your generation history, usage patterns, and creative progress over time.",
      highlight: "Detailed Insights"
    }
  ];

  const stats = [
    { number: "5s", label: "Average Generation Time" },
    { number: "100%", label: "Prompt Accuracy" },
    { number: "4K", label: "Maximum Resolution" },
    { number: "∞", label: "Storage Capacity" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Powerful Features for
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Creative Excellence
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Discover the advanced capabilities that make PromptCanvas Pro the ultimate AI image generation platform
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-yellow-400">{stat.number}</div>
                  <div className="text-blue-200 mt-1">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Everything You Need to Create
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Professional-grade features designed for creators, businesses, and AI enthusiasts
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                {feature.icon}
                <span className="bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  {feature.highlight}
                </span>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Creating?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Join thousands of creators who trust PromptCanvas Pro for their AI image generation needs
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Try Free Now
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Pricing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Features;
