import React, { useState } from 'react';
import { Check, Star, Zap, Crown, Users } from 'lucide-react';

const Pricing = () => {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      name: "Free",
      icon: <Users className="w-8 h-8 text-gray-600" />,
      price: { monthly: 0, annual: 0 },
      description: "Perfect for trying out our platform",
      features: [
        "1 image generation per session",
        "Standard quality images",
        "Basic image formats",
        "Community support",
        "No account required"
      ],
      limitations: [
        "No image history",
        "No favorites",
        "Limited resolution"
      ],
      buttonText: "Get Started Free",
      buttonStyle: "border-2 border-gray-300 text-gray-700 hover:bg-gray-50",
      popular: false
    },
    {
      name: "Pro",
      icon: <Star className="w-8 h-8 text-blue-600" />,
      price: { monthly: 9.99, annual: 7.99 },
      description: "Ideal for regular creators and professionals",
      features: [
        "5 images per day",
        "High-quality 4K images",
        "All image formats",
        "Persistent image history",
        "Favorites & collections",
        "Priority generation",
        "Email support",
        "Advanced settings"
      ],
      limitations: [],
      buttonText: "Start Pro Trial",
      buttonStyle: "bg-blue-600 text-white hover:bg-blue-700",
      popular: true
    },
    {
      name: "Business",
      icon: <Zap className="w-8 h-8 text-purple-600" />,
      price: { monthly: 29.99, annual: 24.99 },
      description: "For teams and high-volume users",
      features: [
        "50 images per day",
        "Ultra-high quality images",
        "Commercial usage rights",
        "Team collaboration",
        "API access",
        "Custom styles",
        "Priority support",
        "Usage analytics",
        "Bulk downloads"
      ],
      limitations: [],
      buttonText: "Start Business Trial",
      buttonStyle: "bg-purple-600 text-white hover:bg-purple-700",
      popular: false
    },
    {
      name: "Enterprise",
      icon: <Crown className="w-8 h-8 text-gold-600" />,
      price: { monthly: "Custom", annual: "Custom" },
      description: "Tailored solutions for large organizations",
      features: [
        "Unlimited generations",
        "Custom AI models",
        "White-label solution",
        "Dedicated support",
        "SLA guarantees",
        "Custom integrations",
        "Advanced analytics",
        "Training & onboarding",
        "Custom contracts"
      ],
      limitations: [],
      buttonText: "Contact Sales",
      buttonStyle: "bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600",
      popular: false
    }
  ];

  const faqs = [
    {
      question: "Can I upgrade or downgrade my plan anytime?",
      answer: "Yes, you can change your plan at any time. Changes take effect immediately, and we'll prorate any billing differences."
    },
    {
      question: "What happens to my images if I cancel?",
      answer: "Your images remain accessible for 30 days after cancellation. We recommend downloading them before the grace period ends."
    },
    {
      question: "Do you offer refunds?",
      answer: "We offer a 30-day money-back guarantee for all paid plans. No questions asked."
    },
    {
      question: "Is there a free trial for paid plans?",
      answer: "Yes, all paid plans come with a 7-day free trial. No credit card required to start."
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Simple, Transparent
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-orange-400">
                Pricing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Choose the perfect plan for your creative needs. Start free, upgrade when you're ready.
            </p>
            
            {/* Billing Toggle */}
            <div className="flex items-center justify-center mb-8">
              <span className={`mr-3 ${!isAnnual ? 'text-white' : 'text-blue-200'}`}>Monthly</span>
              <button
                onClick={() => setIsAnnual(!isAnnual)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  isAnnual ? 'bg-yellow-500' : 'bg-blue-400'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    isAnnual ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
              <span className={`ml-3 ${isAnnual ? 'text-white' : 'text-blue-200'}`}>
                Annual 
                <span className="ml-1 text-yellow-400 font-semibold">(Save 20%)</span>
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Cards */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {plans.map((plan, index) => (
            <div
              key={index}
              className={`relative bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-8 ${
                plan.popular ? 'ring-2 ring-blue-500 scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}
              
              <div className="text-center mb-6">
                {plan.icon}
                <h3 className="text-2xl font-bold text-gray-900 mt-4">{plan.name}</h3>
                <p className="text-gray-600 mt-2">{plan.description}</p>
              </div>

              <div className="text-center mb-6">
                <div className="text-4xl font-bold text-gray-900">
                  {typeof plan.price.monthly === 'number' ? '$' : ''}
                  {isAnnual ? plan.price.annual : plan.price.monthly}
                  {typeof plan.price.monthly === 'number' && plan.price.monthly > 0 && (
                    <span className="text-lg text-gray-600">/month</span>
                  )}
                </div>
                {isAnnual && typeof plan.price.monthly === 'number' && plan.price.monthly > 0 && (
                  <div className="text-sm text-gray-500 mt-1">
                    Billed annually (${(plan.price.annual * 12).toFixed(2)}/year)
                  </div>
                )}
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((feature, featureIndex) => (
                  <li key={featureIndex} className="flex items-start">
                    <Check className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-700">{feature}</span>
                  </li>
                ))}
              </ul>

              <button className={`w-full py-3 px-4 rounded-lg font-semibold transition-colors ${plan.buttonStyle}`}>
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* FAQ Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-gray-600">
              Everything you need to know about our pricing and plans
            </p>
          </div>

          <div className="space-y-8">
            {faqs.map((faq, index) => (
              <div key={index} className="border-b border-gray-200 pb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">{faq.question}</h3>
                <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
