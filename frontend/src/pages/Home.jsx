import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';
import { 
  Sparkles, 
  Image, 
  Zap, 
  Shield, 
  Cloud, 
  ArrowRight,
  Check
} from 'lucide-react';
import { Button, Card, CardContent } from '../components/ui';
import { Footer } from '../components/layout';

const Home = () => {
  const { isSignedIn } = useAuth();

  const features = [
    {
      icon: Sparkles,
      title: '4K Image Generation',
      description: 'Create stunning high-resolution images using Flux.1-schnell-Free AI model'
    },
    {
      icon: Shield,
      title: 'Secure Authentication',
      description: 'Protected by Clerk authentication with enterprise-grade security'
    },
    {
      icon: Cloud,
      title: 'Cloud Storage',
      description: 'Your images are safely stored in the cloud with instant access'
    },
    {
      icon: Image,
      title: 'Personal Gallery',
      description: 'Organize and manage your creations in a beautiful gallery interface'
    },
    {
      icon: Zap,
      title: 'Fast Generation',
      description: 'Lightning-fast image generation powered by Together AI infrastructure'
    },
    {
      icon: Check,
      title: 'Free to Start',
      description: 'Try 1 image for free without signing up, or get 5 images per day with a free account'
    }
  ];

  const stats = [
    { label: 'Images Generated', value: '10,000+' },
    { label: 'Active Users', value: '1,000+' },
    { label: 'Uptime', value: '99.9%' },
    { label: 'Avg Generation Time', value: '3s' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
              Create Stunning AI Images with{' '}
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                PromptCanvas Pro
              </span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
              Transform your ideas into beautiful 4K images using the power of Flux.1-schnell-Free AI. 
              Professional tools, secure storage, and lightning-fast generation.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {isSignedIn ? (
                <Link to="/generate">
                  <Button size="lg" className="w-full sm:w-auto">
                    Start Creating
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              ) : (
                <>
                  <Link to="/generate">
                    <Button size="lg" className="w-full sm:w-auto">
                      Try Free (1 Image)
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </Link>
                  <Link to="/sign-up">
                    <Button variant="outline" size="lg" className="w-full sm:w-auto">
                      Sign Up (5 Images/Day)
                    </Button>
                  </Link>
                  <Link to="/sign-in">
                    <Button variant="ghost" size="lg" className="w-full sm:w-auto">
                      Sign In
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {stat.value}
                </div>
                <div className="text-gray-600">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create amazing images
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Professional-grade tools and infrastructure to bring your creative vision to life
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <Card key={index} className="text-center hover:shadow-xl transition-shadow duration-300">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                      <Icon className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-gray-600">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Ready to start creating?
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Join thousands of creators who are already using PromptCanvas Pro to bring their ideas to life
          </p>
          {!isSignedIn && (
            <Link to="/sign-up">
              <Button size="lg" variant="secondary" className="bg-white text-blue-600 hover:bg-gray-50">
                Start Your Free Trial
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>
          )}
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default Home;
