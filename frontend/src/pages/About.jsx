import React from 'react';
import { 
  Palette, 
  Sparkles, 
  Users, 
  Award, 
  Target, 
  Heart,
  Zap,
  Shield,
  Globe,
  Code,
  Lightbulb,
  Rocket
} from 'lucide-react';

const About = () => {


  const values = [
    {
      icon: Lightbulb,
      title: "Innovation",
      description: "We push the boundaries of what's possible with AI-powered creativity."
    },
    {
      icon: Users,
      title: "Community",
      description: "Building tools that empower creators and artists worldwide."
    },
    {
      icon: Shield,
      title: "Trust",
      description: "Committed to ethical AI development and user privacy protection."
    },
    {
      icon: Heart,
      title: "Passion",
      description: "Driven by our love for art, technology, and human creativity."
    }
  ];



  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-pink-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 bg-white bg-opacity-20 rounded-2xl flex items-center justify-center">
                <Palette className="w-8 h-8" />
              </div>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              About PromptCanvas Pro
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Empowering creators with cutting-edge AI technology to transform imagination into stunning visual reality.
            </p>
          </div>
        </div>
      </div>

      {/* Mission Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Our Mission
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                We believe that everyone should have access to powerful creative tools. Our mission is to democratize 
                AI-powered image generation, making it accessible, intuitive, and inspiring for creators of all skill levels.
              </p>
              <p className="text-lg text-gray-600 leading-relaxed">
                From professional artists to hobbyist creators, we're building the future of digital creativity where 
                human imagination meets artificial intelligence.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
                <Target className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Our Vision</h3>
                <p className="text-blue-100">
                  To become the world's leading platform for AI-powered creative expression, 
                  fostering a global community of digital artists and innovators.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Values Section */}
      <div className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Values
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              The principles that guide everything we do at PromptCanvas Pro.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {values.map((value, index) => {
              const Icon = value.icon;
              return (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Icon className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{value.title}</h3>
                  <p className="text-gray-600">{value.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </div>



      {/* Technology Section */}
      <div className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                Cutting-Edge Technology
              </h2>
              <p className="text-lg text-gray-600 mb-6 leading-relaxed">
                Built on the latest advances in artificial intelligence and machine learning, 
                PromptCanvas Pro leverages state-of-the-art models to deliver exceptional results.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Zap className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">FLUX.1-schnell-Free AI Model</span>
                </div>
                <div className="flex items-center">
                  <Code className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">React + Flask Architecture</span>
                </div>
                <div className="flex items-center">
                  <Globe className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Cloud-Native Infrastructure</span>
                </div>
                <div className="flex items-center">
                  <Shield className="w-6 h-6 text-blue-600 mr-3" />
                  <span className="text-gray-700">Enterprise-Grade Security</span>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl p-8 text-white">
                <Rocket className="w-12 h-12 mb-4" />
                <h3 className="text-2xl font-bold mb-4">Innovation First</h3>
                <p className="text-purple-100 mb-4">
                  We're constantly pushing the boundaries of what's possible with AI-powered creativity.
                </p>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold">50K+</div>
                    <div className="text-purple-200 text-sm">Active Users</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold">1M+</div>
                    <div className="text-purple-200 text-sm">Images Generated</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="py-20 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Join Our Creative Community
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
            Ready to transform your ideas into stunning visuals? Start creating with PromptCanvas Pro today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
              Get Started Free
            </button>
            <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
              View Pricing
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default About;
