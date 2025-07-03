import React from 'react';
import { FileText, Users, Shield, AlertTriangle, CreditCard, Scale } from 'lucide-react';

const TermsOfService = () => {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "acceptance",
      title: "Acceptance of Terms",
      icon: <FileText className="w-6 h-6 text-blue-600" />,
      content: [
        {
          text: "By accessing and using PromptCanvas Pro, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
        }
      ]
    },
    {
      id: "service-description",
      title: "Service Description",
      icon: <Users className="w-6 h-6 text-green-600" />,
      content: [
        {
          subtitle: "AI Image Generation",
          text: "PromptCanvas Pro provides AI-powered image generation services that create images based on text prompts provided by users."
        },
        {
          subtitle: "Service Availability",
          text: "We strive to maintain 99.9% uptime but do not guarantee uninterrupted service. Maintenance windows and technical issues may temporarily affect availability."
        },
        {
          subtitle: "Service Modifications",
          text: "We reserve the right to modify, suspend, or discontinue any part of our service at any time with reasonable notice."
        }
      ]
    },
    {
      id: "user-accounts",
      title: "User Accounts and Responsibilities",
      icon: <Shield className="w-6 h-6 text-purple-600" />,
      content: [
        {
          subtitle: "Account Creation",
          text: "You must provide accurate and complete information when creating an account. You are responsible for maintaining the confidentiality of your account credentials."
        },
        {
          subtitle: "Account Security",
          text: "You are responsible for all activities that occur under your account. Notify us immediately of any unauthorized use of your account."
        },
        {
          subtitle: "Age Requirements",
          text: "You must be at least 13 years old to use our service. Users under 18 must have parental consent."
        }
      ]
    },
    {
      id: "acceptable-use",
      title: "Acceptable Use Policy",
      icon: <AlertTriangle className="w-6 h-6 text-red-600" />,
      content: [
        {
          subtitle: "Prohibited Content",
          text: "You may not generate content that is illegal, harmful, threatening, abusive, defamatory, pornographic, or violates intellectual property rights."
        },
        {
          subtitle: "System Integrity",
          text: "You may not attempt to interfere with, compromise, or disrupt our service, servers, or networks."
        },
        {
          subtitle: "Commercial Use",
          text: "Commercial use of generated images requires a Business or Enterprise plan. Free and Pro users may only use images for personal projects."
        }
      ]
    },
    {
      id: "billing-payments",
      title: "Billing and Payments",
      icon: <CreditCard className="w-6 h-6 text-orange-600" />,
      content: [
        {
          subtitle: "Subscription Plans",
          text: "Paid plans are billed monthly or annually in advance. All fees are non-refundable except as required by law or our refund policy."
        },
        {
          subtitle: "Payment Methods",
          text: "We accept major credit cards and other payment methods as displayed during checkout. You authorize us to charge your payment method for all fees."
        },
        {
          subtitle: "Price Changes",
          text: "We may change our pricing with 30 days' notice. Changes will not affect your current billing cycle."
        }
      ]
    },
    {
      id: "intellectual-property",
      title: "Intellectual Property",
      icon: <Scale className="w-6 h-6 text-teal-600" />,
      content: [
        {
          subtitle: "Generated Images",
          text: "You retain ownership of images you generate using our service, subject to these terms and applicable law."
        },
        {
          subtitle: "Service Content",
          text: "Our service, including software, algorithms, and documentation, is protected by intellectual property laws and remains our property."
        },
        {
          subtitle: "User Content",
          text: "By using our service, you grant us a license to process your prompts and store your generated images to provide the service."
        }
      ]
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <FileText className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Terms of Service
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Please read these terms carefully before using PromptCanvas Pro.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Agreement Overview</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            These Terms of Service ("Terms") govern your use of PromptCanvas Pro's AI image generation service 
            operated by PromptCanvas Pro Inc. ("Company," "we," "our," or "us").
          </p>
          <p className="text-gray-600 leading-relaxed">
            These Terms constitute a legally binding agreement between you and PromptCanvas Pro. By using our 
            service, you agree to comply with and be bound by these Terms.
          </p>
        </div>

        {/* Sections */}
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={section.id} className="bg-white rounded-xl shadow-lg p-8">
              <div className="flex items-center mb-6">
                {section.icon}
                <h2 className="text-2xl font-bold text-gray-900 ml-3">{section.title}</h2>
              </div>
              <div className="space-y-6">
                {section.content.map((item, itemIndex) => (
                  <div key={itemIndex}>
                    {item.subtitle && (
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                    )}
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Privacy and Data */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Privacy and Data Protection</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Your privacy is important to us. Our collection and use of personal information is governed by 
              our Privacy Policy, which is incorporated into these Terms by reference.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We implement appropriate security measures to protect your personal information and generated content.
            </p>
          </div>
        </div>

        {/* Disclaimers */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Disclaimers and Limitations</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Service "As Is"</h3>
              <p className="text-gray-600 leading-relaxed">
                Our service is provided "as is" without warranties of any kind, either express or implied, 
                including but not limited to merchantability, fitness for a particular purpose, or non-infringement.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Limitation of Liability</h3>
              <p className="text-gray-600 leading-relaxed">
                In no event shall PromptCanvas Pro be liable for any indirect, incidental, special, consequential, 
                or punitive damages, including without limitation, loss of profits, data, or use.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">AI-Generated Content</h3>
              <p className="text-gray-600 leading-relaxed">
                We do not guarantee the accuracy, quality, or appropriateness of AI-generated images. Users are 
                responsible for reviewing and validating generated content before use.
              </p>
            </div>
          </div>
        </div>

        {/* Termination */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Termination</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">By You</h3>
              <p className="text-gray-600 leading-relaxed">
                You may terminate your account at any time by contacting us or using the account deletion feature 
                in your settings.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">By Us</h3>
              <p className="text-gray-600 leading-relaxed">
                We may terminate or suspend your account immediately if you violate these Terms or engage in 
                prohibited activities.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Effect of Termination</h3>
              <p className="text-gray-600 leading-relaxed">
                Upon termination, your right to use the service ceases immediately. We may delete your account 
                and data after a reasonable grace period.
              </p>
            </div>
          </div>
        </div>

        {/* Governing Law */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Governing Law and Disputes</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              These Terms are governed by the laws of the State of California, United States, without regard to 
              conflict of law principles.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Any disputes arising from these Terms or your use of the service will be resolved through binding 
              arbitration in accordance with the rules of the American Arbitration Association.
            </p>
          </div>
        </div>

        {/* Changes to Terms */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to Terms</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We reserve the right to modify these Terms at any time. We will notify users of material changes 
            via email or through our service.
          </p>
          <p className="text-gray-600 leading-relaxed">
            Your continued use of the service after changes become effective constitutes acceptance of the new Terms.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About These Terms?</h2>
            <p className="text-blue-100 mb-6">
              If you have any questions about these Terms of Service, please contact us.
            </p>
            <div className="space-y-2">
              <p><strong>Email:</strong> legal@promptcanvaspro.com</p>
              <p><strong>Address:</strong> 123 Tech Street, Suite 100, San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TermsOfService;
