import React, { useState } from 'react';
import { 
  Code, 
  Key, 
  Send, 
  Download, 
  Shield, 
  Zap,
  Copy,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

const ApiDocs = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [copiedCode, setCopiedCode] = useState('');

  const copyToClipboard = (code, id) => {
    navigator.clipboard.writeText(code);
    setCopiedCode(id);
    setTimeout(() => setCopiedCode(''), 2000);
  };

  const endpoints = [
    {
      method: 'POST',
      path: '/api/images/generate',
      description: 'Generate a new image from a text prompt',
      auth: 'Required',
      rateLimit: '5 requests/day (Pro), 50 requests/day (Business)'
    },
    {
      method: 'GET',
      path: '/api/images',
      description: 'Retrieve user\'s generated images',
      auth: 'Required',
      rateLimit: '100 requests/hour'
    },
    {
      method: 'GET',
      path: '/api/images/{id}',
      description: 'Get specific image details',
      auth: 'Required',
      rateLimit: '100 requests/hour'
    },
    {
      method: 'DELETE',
      path: '/api/images/{id}',
      description: 'Delete a specific image',
      auth: 'Required',
      rateLimit: '50 requests/hour'
    },
    {
      method: 'GET',
      path: '/api/user/profile',
      description: 'Get user profile and usage statistics',
      auth: 'Required',
      rateLimit: '100 requests/hour'
    }
  ];

  const codeExamples = {
    curl: `curl -X POST "https://api.promptcanvaspro.com/api/images/generate" \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "prompt": "A beautiful sunset over mountains",
    "style": "realistic",
    "quality": "high",
    "aspect_ratio": "16:9"
  }'`,
    
    javascript: `const response = await fetch('https://api.promptcanvaspro.com/api/images/generate', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer YOUR_API_KEY',
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    prompt: 'A beautiful sunset over mountains',
    style: 'realistic',
    quality: 'high',
    aspect_ratio: '16:9'
  })
});

const data = await response.json();
console.log(data);`,

    python: `import requests

url = "https://api.promptcanvaspro.com/api/images/generate"
headers = {
    "Authorization": "Bearer YOUR_API_KEY",
    "Content-Type": "application/json"
}
data = {
    "prompt": "A beautiful sunset over mountains",
    "style": "realistic",
    "quality": "high",
    "aspect_ratio": "16:9"
}

response = requests.post(url, headers=headers, json=data)
result = response.json()
print(result)`
  };

  const responseExample = `{
  "success": true,
  "data": {
    "id": "img_abc123def456",
    "prompt": "A beautiful sunset over mountains",
    "image_url": "https://cdn.promptcanvaspro.com/images/abc123def456.jpg",
    "thumbnail_url": "https://cdn.promptcanvaspro.com/thumbs/abc123def456.jpg",
    "style": "realistic",
    "quality": "high",
    "aspect_ratio": "16:9",
    "created_at": "2024-01-15T10:30:00Z",
    "generation_time": 4.2
  },
  "usage": {
    "remaining_generations": 4,
    "daily_limit": 5,
    "resets_at": "2024-01-16T00:00:00Z"
  }
}`;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Code className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              API Documentation
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Integrate PromptCanvas Pro's powerful AI image generation into your applications
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Get API Key
              </button>
              <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                View Examples
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            {[
              { id: 'overview', label: 'Overview' },
              { id: 'authentication', label: 'Authentication' },
              { id: 'endpoints', label: 'Endpoints' },
              { id: 'examples', label: 'Examples' },
              { id: 'errors', label: 'Error Handling' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === tab.id
                    ? 'border-blue-500 text-blue-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {activeTab === 'overview' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">API Overview</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    The PromptCanvas Pro API allows you to integrate our AI image generation capabilities 
                    directly into your applications, websites, or workflows.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <Zap className="w-8 h-8 text-blue-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Fast & Reliable</h3>
                    <p className="text-gray-600">Generate images in under 5 seconds with 99.9% uptime</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <Shield className="w-8 h-8 text-green-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Secure</h3>
                    <p className="text-gray-600">Enterprise-grade security with API key authentication</p>
                  </div>
                  <div className="bg-white p-6 rounded-lg shadow-md">
                    <Code className="w-8 h-8 text-purple-600 mb-4" />
                    <h3 className="text-lg font-semibold mb-2">Developer Friendly</h3>
                    <p className="text-gray-600">RESTful API with comprehensive documentation</p>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Base URL</h3>
                  <code className="bg-gray-100 px-3 py-2 rounded text-sm">
                    https://api.promptcanvaspro.com
                  </code>
                </div>
              </div>
            )}

            {activeTab === 'authentication' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Authentication</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    All API requests require authentication using an API key in the Authorization header.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4 flex items-center">
                    <Key className="w-5 h-5 mr-2" />
                    Getting Your API Key
                  </h3>
                  <ol className="list-decimal list-inside space-y-2 text-gray-600">
                    <li>Sign up for a Pro or Business account</li>
                    <li>Navigate to your account settings</li>
                    <li>Click "Generate API Key" in the API section</li>
                    <li>Copy and securely store your API key</li>
                  </ol>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Authentication Header</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <code>Authorization: Bearer YOUR_API_KEY</code>
                    <button
                      onClick={() => copyToClipboard('Authorization: Bearer YOUR_API_KEY', 'auth-header')}
                      className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded"
                    >
                      {copiedCode === 'auth-header' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'endpoints' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">API Endpoints</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Complete list of available endpoints and their functionality.
                  </p>
                </div>

                <div className="space-y-4">
                  {endpoints.map((endpoint, index) => (
                    <div key={index} className="bg-white p-6 rounded-lg shadow-md">
                      <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            endpoint.method === 'GET' ? 'bg-green-100 text-green-800' :
                            endpoint.method === 'POST' ? 'bg-blue-100 text-blue-800' :
                            'bg-red-100 text-red-800'
                          }`}>
                            {endpoint.method}
                          </span>
                          <code className="text-sm font-mono">{endpoint.path}</code>
                        </div>
                        <span className="text-xs text-gray-500">{endpoint.auth}</span>
                      </div>
                      <p className="text-gray-600 mb-2">{endpoint.description}</p>
                      <p className="text-xs text-gray-500">Rate Limit: {endpoint.rateLimit}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'examples' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Code Examples</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Ready-to-use code examples in multiple programming languages.
                  </p>
                </div>

                {Object.entries(codeExamples).map(([language, code]) => (
                  <div key={language} className="bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold mb-4 capitalize">{language}</h3>
                    <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                      <pre className="text-sm overflow-x-auto">
                        <code>{code}</code>
                      </pre>
                      <button
                        onClick={() => copyToClipboard(code, language)}
                        className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded"
                      >
                        {copiedCode === language ? (
                          <CheckCircle className="w-4 h-4 text-green-400" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                ))}

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">Response Example</h3>
                  <div className="bg-gray-900 text-gray-100 p-4 rounded-lg relative">
                    <pre className="text-sm overflow-x-auto">
                      <code>{responseExample}</code>
                    </pre>
                    <button
                      onClick={() => copyToClipboard(responseExample, 'response')}
                      className="absolute top-2 right-2 p-2 hover:bg-gray-700 rounded"
                    >
                      {copiedCode === 'response' ? (
                        <CheckCircle className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'errors' && (
              <div className="space-y-8">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900 mb-4">Error Handling</h2>
                  <p className="text-lg text-gray-600 mb-6">
                    Understanding API errors and how to handle them properly.
                  </p>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-md">
                  <h3 className="text-xl font-semibold mb-4">HTTP Status Codes</h3>
                  <div className="space-y-3">
                    {[
                      { code: '200', description: 'Success - Request completed successfully' },
                      { code: '400', description: 'Bad Request - Invalid parameters or request format' },
                      { code: '401', description: 'Unauthorized - Invalid or missing API key' },
                      { code: '403', description: 'Forbidden - Insufficient permissions' },
                      { code: '429', description: 'Rate Limited - Too many requests' },
                      { code: '500', description: 'Server Error - Internal server error' }
                    ].map((status) => (
                      <div key={status.code} className="flex items-center space-x-3">
                        <span className="bg-gray-100 px-2 py-1 rounded text-sm font-mono">{status.code}</span>
                        <span className="text-gray-600">{status.description}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
              <div className="space-y-3">
                <a href="#" className="block text-blue-600 hover:text-blue-800">Get API Key</a>
                <a href="#" className="block text-blue-600 hover:text-blue-800">Rate Limits</a>
                <a href="#" className="block text-blue-600 hover:text-blue-800">SDKs & Libraries</a>
                <a href="#" className="block text-blue-600 hover:text-blue-800">Postman Collection</a>
                <a href="#" className="block text-blue-600 hover:text-blue-800">Support</a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ApiDocs;
