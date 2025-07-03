import React from 'react';
import { Shield, Eye, Lock, UserCheck, Database, Globe } from 'lucide-react';

const PrivacyPolicy = () => {
  const lastUpdated = "January 15, 2024";

  const sections = [
    {
      id: "information-collection",
      title: "Information We Collect",
      icon: <Database className="w-6 h-6 text-blue-600" />,
      content: [
        {
          subtitle: "Personal Information",
          text: "When you create an account, we collect your email address, name, and password. We may also collect billing information if you subscribe to a paid plan."
        },
        {
          subtitle: "Usage Data",
          text: "We automatically collect information about how you use our service, including your IP address, browser type, device information, and usage patterns."
        },
        {
          subtitle: "Generated Content",
          text: "We store the images you generate and the prompts you use to create them. This content is associated with your account and is private to you."
        }
      ]
    },
    {
      id: "information-use",
      title: "How We Use Your Information",
      icon: <Eye className="w-6 h-6 text-green-600" />,
      content: [
        {
          subtitle: "Service Provision",
          text: "We use your information to provide, maintain, and improve our AI image generation service, including processing your requests and managing your account."
        },
        {
          subtitle: "Communication",
          text: "We may use your email address to send you service-related notifications, updates, and promotional materials (which you can opt out of)."
        },
        {
          subtitle: "Analytics and Improvement",
          text: "We analyze usage patterns to improve our service, develop new features, and ensure optimal performance."
        }
      ]
    },
    {
      id: "information-sharing",
      title: "Information Sharing",
      icon: <UserCheck className="w-6 h-6 text-purple-600" />,
      content: [
        {
          subtitle: "No Sale of Personal Data",
          text: "We do not sell, rent, or trade your personal information to third parties for their commercial purposes."
        },
        {
          subtitle: "Service Providers",
          text: "We may share information with trusted service providers who help us operate our service, such as cloud hosting providers and payment processors."
        },
        {
          subtitle: "Legal Requirements",
          text: "We may disclose information if required by law, court order, or to protect our rights, property, or safety."
        }
      ]
    },
    {
      id: "data-security",
      title: "Data Security",
      icon: <Lock className="w-6 h-6 text-red-600" />,
      content: [
        {
          subtitle: "Encryption",
          text: "All data is encrypted in transit using TLS and at rest using industry-standard encryption methods."
        },
        {
          subtitle: "Access Controls",
          text: "We implement strict access controls and regularly audit our systems to ensure your data remains secure."
        },
        {
          subtitle: "Data Retention",
          text: "We retain your data only as long as necessary to provide our services or as required by law."
        }
      ]
    },
    {
      id: "your-rights",
      title: "Your Rights",
      icon: <Shield className="w-6 h-6 text-orange-600" />,
      content: [
        {
          subtitle: "Access and Portability",
          text: "You can access, download, or export your personal data and generated content at any time through your account settings."
        },
        {
          subtitle: "Correction and Deletion",
          text: "You can update your personal information or request deletion of your account and associated data."
        },
        {
          subtitle: "Opt-out",
          text: "You can opt out of promotional communications and certain data processing activities."
        }
      ]
    },
    {
      id: "international-transfers",
      title: "International Data Transfers",
      icon: <Globe className="w-6 h-6 text-teal-600" />,
      content: [
        {
          subtitle: "Global Service",
          text: "Our service operates globally, and your data may be processed in countries other than your own."
        },
        {
          subtitle: "Adequate Protection",
          text: "We ensure that international transfers are protected by appropriate safeguards, including standard contractual clauses."
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
            <Shield className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Your privacy is important to us. Learn how we collect, use, and protect your information.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Introduction</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            PromptCanvas Pro ("we," "our," or "us") is committed to protecting your privacy. This Privacy Policy 
            explains how we collect, use, disclose, and safeguard your information when you use our AI image 
            generation service.
          </p>
          <p className="text-gray-600 leading-relaxed">
            By using our service, you agree to the collection and use of information in accordance with this policy. 
            If you do not agree with our policies and practices, please do not use our service.
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
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">{item.subtitle}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.text}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Cookies Section */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Cookies and Tracking</h2>
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Essential Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                We use essential cookies to provide basic functionality, such as keeping you logged in and 
                remembering your preferences.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Analytics Cookies</h3>
              <p className="text-gray-600 leading-relaxed">
                We use analytics cookies to understand how you use our service and improve your experience. 
                You can opt out of these in your browser settings.
              </p>
            </div>
          </div>
        </div>

        {/* Children's Privacy */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Children's Privacy</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            Our service is not intended for children under 13 years of age. We do not knowingly collect 
            personal information from children under 13. If you are a parent or guardian and believe your 
            child has provided us with personal information, please contact us.
          </p>
          <p className="text-gray-600 leading-relaxed">
            If we discover that a child under 13 has provided us with personal information, we will delete 
            such information from our servers immediately.
          </p>
        </div>

        {/* Changes to Policy */}
        <div className="bg-white rounded-xl shadow-lg p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Changes to This Privacy Policy</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last Updated" date.
          </p>
          <p className="text-gray-600 leading-relaxed">
            You are advised to review this Privacy Policy periodically for any changes. Changes to this 
            Privacy Policy are effective when they are posted on this page.
          </p>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About This Policy?</h2>
            <p className="text-blue-100 mb-6">
              If you have any questions about this Privacy Policy, please contact us.
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

export default PrivacyPolicy;
