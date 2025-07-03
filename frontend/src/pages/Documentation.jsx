import React, { useState } from 'react';
import { 
  Book, 
  Search, 
  Play, 
  Code, 
  Lightbulb, 
  Users, 
  Zap,
  ArrowRight,
  BookOpen,
  Video,
  FileText,
  HelpCircle,
  Star,
  Clock
} from 'lucide-react';

const Documentation = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  const categories = [
    { id: 'all', label: 'All Docs', icon: <Book className="w-4 h-4" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <Play className="w-4 h-4" /> },
    { id: 'guides', label: 'Guides', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'api', label: 'API Reference', icon: <Code className="w-4 h-4" /> },
    { id: 'tutorials', label: 'Tutorials', icon: <Video className="w-4 h-4" /> },
    { id: 'best-practices', label: 'Best Practices', icon: <Star className="w-4 h-4" /> }
  ];

  const docs = [
    {
      id: 1,
      title: "Quick Start Guide",
      description: "Get up and running with PromptCanvas Pro in under 5 minutes",
      category: "getting-started",
      type: "guide",
      readTime: "5 min",
      difficulty: "Beginner",
      popular: true,
      icon: <Zap className="w-6 h-6 text-green-600" />
    },
    {
      id: 2,
      title: "Writing Effective Prompts",
      description: "Master the art of prompt engineering for better image generation",
      category: "guides",
      type: "guide",
      readTime: "12 min",
      difficulty: "Intermediate",
      popular: true,
      icon: <Lightbulb className="w-6 h-6 text-yellow-600" />
    },
    {
      id: 3,
      title: "API Authentication",
      description: "Learn how to authenticate and make your first API call",
      category: "api",
      type: "reference",
      readTime: "8 min",
      difficulty: "Intermediate",
      popular: false,
      icon: <Code className="w-6 h-6 text-blue-600" />
    },
    {
      id: 4,
      title: "Image Generation Tutorial",
      description: "Step-by-step video tutorial on creating stunning images",
      category: "tutorials",
      type: "video",
      readTime: "15 min",
      difficulty: "Beginner",
      popular: true,
      icon: <Video className="w-6 h-6 text-purple-600" />
    },
    {
      id: 5,
      title: "Advanced Style Controls",
      description: "Deep dive into style parameters and artistic controls",
      category: "guides",
      type: "guide",
      readTime: "20 min",
      difficulty: "Advanced",
      popular: false,
      icon: <BookOpen className="w-6 h-6 text-indigo-600" />
    },
    {
      id: 6,
      title: "Rate Limits & Best Practices",
      description: "Optimize your usage and avoid common pitfalls",
      category: "best-practices",
      type: "guide",
      readTime: "10 min",
      difficulty: "Intermediate",
      popular: false,
      icon: <Star className="w-6 h-6 text-orange-600" />
    },
    {
      id: 7,
      title: "Batch Processing Images",
      description: "Generate multiple images efficiently using our API",
      category: "api",
      type: "tutorial",
      readTime: "18 min",
      difficulty: "Advanced",
      popular: false,
      icon: <Users className="w-6 h-6 text-teal-600" />
    },
    {
      id: 8,
      title: "Troubleshooting Common Issues",
      description: "Solutions to frequently encountered problems",
      category: "getting-started",
      type: "reference",
      readTime: "7 min",
      difficulty: "Beginner",
      popular: true,
      icon: <HelpCircle className="w-6 h-6 text-red-600" />
    }
  ];

  const quickLinks = [
    { title: "API Reference", description: "Complete API documentation", href: "/api-docs" },
    { title: "Changelog", description: "Latest updates and releases", href: "/changelog" },
    { title: "Help Center", description: "FAQs and support articles", href: "/help" },
    { title: "Contact Support", description: "Get help from our team", href: "/contact" }
  ];

  const filteredDocs = docs.filter(doc => {
    const matchesCategory = activeCategory === 'all' || doc.category === activeCategory;
    const matchesSearch = doc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         doc.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Book className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Documentation
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Everything you need to master PromptCanvas Pro - from quick starts to advanced techniques
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search documentation..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Categories</h3>
              <nav className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-blue-100 text-blue-700'
                        : 'text-gray-600 hover:bg-gray-100'
                    }`}
                  >
                    {category.icon}
                    <span>{category.label}</span>
                  </button>
                ))}
              </nav>

              <div className="mt-8">
                <h4 className="text-md font-semibold text-gray-900 mb-4">Quick Links</h4>
                <div className="space-y-3">
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.href}
                      className="block p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-colors"
                    >
                      <div className="font-medium text-gray-900">{link.title}</div>
                      <div className="text-sm text-gray-600">{link.description}</div>
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {/* Popular Docs */}
            {activeCategory === 'all' && (
              <div className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Popular Documentation</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {docs.filter(doc => doc.popular).slice(0, 4).map((doc) => (
                    <div key={doc.id} className="bg-white rounded-xl shadow-lg p-6 hover:shadow-xl transition-shadow cursor-pointer">
                      <div className="flex items-start space-x-4">
                        {doc.icon}
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-gray-900 mb-2">{doc.title}</h3>
                          <p className="text-gray-600 mb-4">{doc.description}</p>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(doc.difficulty)}`}>
                                {doc.difficulty}
                              </span>
                              <span className="text-sm text-gray-500 flex items-center">
                                <Clock className="w-4 h-4 mr-1" />
                                {doc.readTime}
                              </span>
                            </div>
                            <ArrowRight className="w-4 h-4 text-blue-600" />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* All Documentation */}
            <div>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {activeCategory === 'all' ? 'All Documentation' : 
                   categories.find(c => c.id === activeCategory)?.label}
                </h2>
                <span className="text-sm text-gray-500">
                  {filteredDocs.length} {filteredDocs.length === 1 ? 'article' : 'articles'}
                </span>
              </div>

              <div className="space-y-4">
                {filteredDocs.map((doc) => (
                  <div key={doc.id} className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer">
                    <div className="flex items-start space-x-4">
                      {doc.icon}
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-xl font-semibold text-gray-900 mb-2">{doc.title}</h3>
                            <p className="text-gray-600 mb-4">{doc.description}</p>
                          </div>
                          {doc.popular && (
                            <span className="bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                              Popular
                            </span>
                          )}
                        </div>
                        <div className="flex items-center space-x-4">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(doc.difficulty)}`}>
                            {doc.difficulty}
                          </span>
                          <span className="text-sm text-gray-500 flex items-center">
                            <Clock className="w-4 h-4 mr-1" />
                            {doc.readTime}
                          </span>
                          <span className="text-sm text-gray-500 capitalize">
                            {doc.type}
                          </span>
                        </div>
                      </div>
                      <ArrowRight className="w-5 h-5 text-blue-600" />
                    </div>
                  </div>
                ))}
              </div>

              {filteredDocs.length === 0 && (
                <div className="text-center py-12">
                  <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documentation found</h3>
                  <p className="text-gray-600">Try adjusting your search or category filter</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Need More Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Can't find what you're looking for? Our support team is here to help
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Join Community
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Documentation;
