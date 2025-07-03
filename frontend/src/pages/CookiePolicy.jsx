import React, { useState } from 'react';
import { Cookie, Settings, Eye, BarChart3, Shield, CheckCircle } from 'lucide-react';

const CookiePolicy = () => {
  const [cookiePreferences, setCookiePreferences] = useState({
    essential: true,
    analytics: true,
    marketing: false,
    preferences: true
  });

  const lastUpdated = "January 15, 2024";

  const cookieTypes = [
    {
      id: "essential",
      title: "Essential Cookies",
      icon: <Shield className="w-6 h-6 text-green-600" />,
      description: "These cookies are necessary for the website to function and cannot be switched off.",
      required: true,
      examples: [
        "Authentication tokens to keep you logged in",
        "Session identifiers for security",
        "CSRF protection tokens",
        "Load balancing cookies"
      ]
    },
    {
      id: "analytics",
      title: "Analytics Cookies",
      icon: <BarChart3 className="w-6 h-6 text-blue-600" />,
      description: "These cookies help us understand how visitors interact with our website.",
      required: false,
      examples: [
        "Google Analytics for usage statistics",
        "Performance monitoring cookies",
        "Error tracking and reporting",
        "Feature usage analytics"
      ]
    },
    {
      id: "preferences",
      title: "Preference Cookies",
      icon: <Settings className="w-6 h-6 text-purple-600" />,
      description: "These cookies remember your choices and personalize your experience.",
      required: false,
      examples: [
        "Theme preferences (dark/light mode)",
        "Language settings",
        "Dashboard layout preferences",
        "Notification settings"
      ]
    },
    {
      id: "marketing",
      title: "Marketing Cookies",
      icon: <Eye className="w-6 h-6 text-orange-600" />,
      description: "These cookies track your activity to show you relevant advertisements.",
      required: false,
      examples: [
        "Social media tracking pixels",
        "Advertising network cookies",
        "Conversion tracking",
        "Retargeting cookies"
      ]
    }
  ];

  const handlePreferenceChange = (cookieType) => {
    if (cookieType === 'essential') return; // Essential cookies cannot be disabled
    
    setCookiePreferences(prev => ({
      ...prev,
      [cookieType]: !prev[cookieType]
    }));
  };

  const savePreferences = () => {
    // In a real implementation, this would save to localStorage and update cookie consent
    console.log('Saving cookie preferences:', cookiePreferences);
    alert('Cookie preferences saved successfully!');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Cookie className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Cookie Policy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Learn about how we use cookies and similar technologies on PromptCanvas Pro.
            </p>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 max-w-md mx-auto">
              <p className="text-blue-100">
                <strong>Last Updated:</strong> {lastUpdated}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Introduction */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">What Are Cookies?</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Cookies are small text files that are stored on your device when you visit our website. They help us 
            provide you with a better experience by remembering your preferences and understanding how you use our service.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We use both session cookies (which expire when you close your browser) and persistent cookies 
            (which remain on your device for a set period or until you delete them).
          </p>
        </div>

        {/* Cookie Types */}
        <div className="space-y-8">
          {cookieTypes.map((type) => (
            <div key={type.id} className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  {type.icon}
                  <h2 className="text-2xl font-bold text-gray-900 ml-3">{type.title}</h2>
                </div>
                <div className="flex items-center">
                  {type.required ? (
                    <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-full text-sm font-medium">
                      Required
                    </span>
                  ) : (
                    <label className="flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={cookiePreferences[type.id]}
                        onChange={() => handlePreferenceChange(type.id)}
                        className="sr-only"
                      />
                      <div className={`relative w-12 h-6 rounded-full transition-colors ${
                        cookiePreferences[type.id] ? 'bg-blue-600' : 'bg-gray-300'
                      }`}>
                        <div className={`absolute top-1 left-1 w-4 h-4 bg-white rounded-full transition-transform ${
                          cookiePreferences[type.id] ? 'translate-x-6' : 'translate-x-0'
                        }`} />
                      </div>
                    </label>
                  )}
                </div>
              </div>
              
              <p className="text-gray-600 leading-relaxed mb-6">{type.description}</p>
              
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Examples:</h3>
                <ul className="space-y-2">
                  {type.examples.map((example, index) => (
                    <li key={index} className="flex items-start">
                      <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <span className="text-gray-600">{example}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Cookie Preferences */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Manage Your Cookie Preferences</h2>
          <p className="text-gray-600 leading-relaxed mb-6">
            You can control which cookies we use by adjusting your preferences below. Note that disabling 
            certain cookies may affect the functionality of our website.
          </p>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Essential cookies cannot be disabled as they are necessary for the 
              website to function properly.
            </p>
          </div>

          <button
            onClick={savePreferences}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
          >
            Save Preferences
          </button>
        </div>

        {/* Third-Party Cookies */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Third-Party Cookies</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Google Analytics</h3>
              <p className="text-gray-600 leading-relaxed">
                We use Google Analytics to understand how visitors use our website. You can opt out of 
                Google Analytics by visiting the Google Analytics opt-out page.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Payment Processors</h3>
              <p className="text-gray-600 leading-relaxed">
                Our payment processors (Stripe, PayPal) may set cookies to facilitate secure transactions 
                and prevent fraud.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Social Media</h3>
              <p className="text-gray-600 leading-relaxed">
                Social media platforms may set cookies when you interact with their embedded content or 
                share buttons on our website.
              </p>
            </div>
          </div>
        </div>

        {/* Browser Controls */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Browser Cookie Controls</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Most web browsers allow you to control cookies through their settings. You can:
          </p>
          <ul className="space-y-2 mb-6">
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">View and delete existing cookies</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">Block cookies from specific websites</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">Block third-party cookies</span>
            </li>
            <li className="flex items-start">
              <CheckCircle className="w-4 h-4 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
              <span className="text-gray-600">Delete cookies when you close your browser</span>
            </li>
          </ul>
          <p className="text-gray-600 leading-relaxed">
            Please note that blocking or deleting cookies may affect your experience on our website and 
            limit the functionality available to you.
          </p>
        </div>

        {/* Updates to Policy */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Updates to This Policy</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may update this Cookie Policy from time to time to reflect changes in our practices or for 
            other operational, legal, or regulatory reasons.
          </p>
          <p className="text-gray-600 leading-relaxed">
            We will notify you of any material changes by posting the updated policy on our website and 
            updating the "Last Updated" date.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About Cookies?</h2>
            <p className="text-blue-100 mb-6">
              If you have any questions about our use of cookies, please contact us.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> privacy@promptcanvaspro.com</p>
              <p><strong>Address:</strong> 123 Tech Street, Suite 100, San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePolicy;
