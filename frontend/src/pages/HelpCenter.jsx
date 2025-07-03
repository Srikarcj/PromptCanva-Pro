import React, { useState } from 'react';
import { 
  HelpCircle, 
  Search, 
  ChevronDown, 
  ChevronUp, 
  MessageCircle, 
  Mail, 
  Phone,
  Book,
  Zap,
  Shield,
  CreditCard,
  Settings,
  Image as ImageIcon,
  Users
} from 'lucide-react';

const HelpCenter = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');
  const [expandedFaq, setExpandedFaq] = useState(null);

  const categories = [
    { id: 'all', label: 'All Topics', icon: <HelpCircle className="w-4 h-4" /> },
    { id: 'getting-started', label: 'Getting Started', icon: <Zap className="w-4 h-4" /> },
    { id: 'account', label: 'Account & Billing', icon: <CreditCard className="w-4 h-4" /> },
    { id: 'generation', label: 'Image Generation', icon: <ImageIcon className="w-4 h-4" /> },
    { id: 'technical', label: 'Technical Issues', icon: <Settings className="w-4 h-4" /> },
    { id: 'security', label: 'Security & Privacy', icon: <Shield className="w-4 h-4" /> }
  ];

  const faqs = [
    {
      id: 1,
      category: 'getting-started',
      question: "How do I get started with PromptCanvas Pro?",
      answer: "Getting started is easy! Simply visit our homepage and click 'Try Free' to generate your first image without creating an account. For more features like image history and favorites, sign up for a free account which gives you 5 images per day."
    },
    {
      id: 2,
      category: 'generation',
      question: "Why is my image generation taking longer than 5 seconds?",
      answer: "Image generation typically takes under 5 seconds. Delays can occur during high traffic periods or if you're using complex prompts. If you consistently experience longer wait times, please contact our support team."
    },
    {
      id: 3,
      category: 'account',
      question: "What's the difference between free and paid plans?",
      answer: "Free users get 1 image per session without an account, or 5 images per day with an account. Pro users get 5 images per day with high-quality 4K output, persistent history, and priority generation. Business users get 50 images per day plus API access."
    },
    {
      id: 4,
      category: 'generation',
      question: "How can I improve the quality of my generated images?",
      answer: "To get better results: 1) Be specific and descriptive in your prompts, 2) Include style keywords like 'photorealistic', 'artistic', or 'detailed', 3) Specify lighting and composition, 4) Use the advanced settings to fine-tune parameters."
    },
    {
      id: 5,
      category: 'technical',
      question: "My images aren't saving to my gallery. What should I do?",
      answer: "This usually happens if you're not logged in or if there's a temporary storage issue. Make sure you're signed into your account. If the problem persists, try clearing your browser cache or contact support."
    },
    {
      id: 6,
      category: 'account',
      question: "How do I upgrade or downgrade my subscription?",
      answer: "You can change your plan anytime from your account settings. Go to 'Billing' and select your new plan. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      id: 7,
      category: 'security',
      question: "Is my data and generated content secure?",
      answer: "Yes, we take security seriously. All data is encrypted in transit and at rest. Your generated images are private to your account unless you choose to share them. We never use your content for training or other purposes."
    },
    {
      id: 8,
      category: 'technical',
      question: "I'm getting an error message. What does it mean?",
      answer: "Common errors include: 'Rate limit exceeded' (you've reached your daily limit), 'Invalid prompt' (prompt contains restricted content), 'Server error' (temporary issue, try again). For persistent errors, contact support with the exact error message."
    },
    {
      id: 9,
      category: 'generation',
      question: "Can I generate images for commercial use?",
      answer: "Free and Pro users can use images for personal projects. Business and Enterprise users have full commercial usage rights. Check your plan details or upgrade to Business for commercial licensing."
    },
    {
      id: 10,
      category: 'account',
      question: "How do I cancel my subscription?",
      answer: "You can cancel anytime from your account settings under 'Billing'. Your subscription remains active until the end of your billing period. After cancellation, you'll revert to the free plan."
    }
  ];

  const contactOptions = [
    {
      icon: <MessageCircle className="w-8 h-8 text-blue-600" />,
      title: "Live Chat",
      description: "Get instant help from our support team",
      action: "Start Chat",
      available: "24/7"
    },
    {
      icon: <Mail className="w-8 h-8 text-green-600" />,
      title: "Email Support",
      description: "Send us a detailed message",
      action: "Send Email",
      available: "Response within 24h"
    },
    {
      icon: <Book className="w-8 h-8 text-purple-600" />,
      title: "Documentation",
      description: "Browse our comprehensive guides",
      action: "View Docs",
      available: "Self-service"
    }
  ];

  const filteredFaqs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory;
    const matchesSearch = faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const toggleFaq = (faqId) => {
    setExpandedFaq(expandedFaq === faqId ? null : faqId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <HelpCircle className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Help Center
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Find answers to common questions and get the help you need
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto relative">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 rounded-xl text-gray-900 text-lg focus:ring-2 focus:ring-yellow-400 focus:outline-none"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Contact Options */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          {contactOptions.map((option, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6 text-center hover:shadow-xl transition-shadow">
              <div className="flex justify-center mb-4">
                {option.icon}
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">{option.title}</h3>
              <p className="text-gray-600 mb-4">{option.description}</p>
              <p className="text-sm text-gray-500 mb-4">{option.available}</p>
              <button className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                {option.action}
              </button>
            </div>
          ))}
        </div>

        {/* FAQ Section */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar */}
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
            </div>
          </div>

          {/* FAQ Content */}
          <div className="lg:col-span-3">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Frequently Asked Questions
              </h2>
              <span className="text-sm text-gray-500">
                {filteredFaqs.length} {filteredFaqs.length === 1 ? 'question' : 'questions'}
              </span>
            </div>

            <div className="space-y-4">
              {filteredFaqs.map((faq) => (
                <div key={faq.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <button
                    onClick={() => toggleFaq(faq.id)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
                  >
                    <h3 className="text-lg font-semibold text-gray-900 pr-4">{faq.question}</h3>
                    {expandedFaq === faq.id ? (
                      <ChevronUp className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    ) : (
                      <ChevronDown className="w-5 h-5 text-gray-500 flex-shrink-0" />
                    )}
                  </button>
                  {expandedFaq === faq.id && (
                    <div className="px-6 pb-4">
                      <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredFaqs.length === 0 && (
              <div className="text-center py-12">
                <HelpCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">No questions found</h3>
                <p className="text-gray-600">Try adjusting your search or category filter</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Still Need Help Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Still Need Help?
            </h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Our support team is here to help you succeed with PromptCanvas Pro
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Contact Support
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                Schedule a Call
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HelpCenter;
