import React from 'react';
import { AlertTriangle, Mail, FileText, Clock, Shield, CheckCircle } from 'lucide-react';

const DMCA = () => {
  const lastUpdated = "January 15, 2024";

  const requiredInfo = [
    "A physical or electronic signature of the copyright owner or authorized agent",
    "Identification of the copyrighted work claimed to have been infringed",
    "Identification of the material that is claimed to be infringing and location information",
    "Your contact information (address, telephone number, and email address)",
    "A statement that you have a good faith belief that the use is not authorized",
    "A statement that the information is accurate and you are authorized to act on behalf of the owner"
  ];

  const counterNoticeInfo = [
    "Your physical or electronic signature",
    "Identification of the material that was removed and its location",
    "A statement under penalty of perjury that you have a good faith belief the material was removed by mistake",
    "Your name, address, and telephone number",
    "A statement that you consent to jurisdiction of the federal court in your district"
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Shield className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              DMCA Policy
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Digital Millennium Copyright Act compliance and takedown procedures.
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
          <h2 className="text-2xl font-bold text-gray-900 mb-4">DMCA Compliance</h2>
          <p className="text-gray-600 leading-relaxed mb-4">
            PromptCanvas Pro respects the intellectual property rights of others and expects our users to do the same. 
            In accordance with the Digital Millennium Copyright Act (DMCA), we will respond to valid takedown notices 
            and remove infringing content when properly notified.
          </p>
          <p className="text-gray-600 leading-relaxed">
            This policy outlines our procedures for handling copyright infringement claims and counter-notifications 
            under the DMCA.
          </p>
        </div>

        {/* Reporting Infringement */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <AlertTriangle className="w-6 h-6 text-red-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Reporting Copyright Infringement</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            If you believe that your copyrighted work has been copied and is accessible on our service in a way 
            that constitutes copyright infringement, please provide our DMCA agent with the following information:
          </p>

          <div className="space-y-4 mb-6">
            {requiredInfo.map((info, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{info}</span>
              </div>
            ))}
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-yellow-800 text-sm">
              <strong>Important:</strong> Under Section 512(f) of the DMCA, any person who knowingly materially 
              misrepresents that material is infringing may be subject to liability for damages.
            </p>
          </div>
        </div>

        {/* DMCA Agent Contact */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Mail className="w-6 h-6 text-blue-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">DMCA Agent Contact Information</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            Please send your DMCA takedown notice to our designated agent:
          </p>

          <div className="bg-gray-50 rounded-lg p-6">
            <div className="space-y-2">
              <p><strong>DMCA Agent:</strong> Legal Department</p>
              <p><strong>Company:</strong> PromptCanvas Pro Inc.</p>
              <p><strong>Email:</strong> dmca@promptcanvaspro.com</p>
              <p><strong>Address:</strong> 123 Tech Street, Suite 100, San Francisco, CA 94105</p>
              <p><strong>Phone:</strong> +1 (555) 123-4567</p>
            </div>
          </div>

          <p className="text-gray-600 leading-relaxed mt-4 text-sm">
            For fastest processing, please send notices via email. Physical mail may result in longer response times.
          </p>
        </div>

        {/* Our Response Process */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <Clock className="w-6 h-6 text-purple-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Our Response Process</h2>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">1. Notice Review</h3>
              <p className="text-gray-600 leading-relaxed">
                We will review your notice within 24-48 hours to ensure it meets DMCA requirements.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">2. Content Removal</h3>
              <p className="text-gray-600 leading-relaxed">
                If the notice is valid, we will promptly remove or disable access to the allegedly infringing material.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">3. User Notification</h3>
              <p className="text-gray-600 leading-relaxed">
                We will notify the user who posted the content about the removal and provide them with a copy of the notice.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">4. Counter-Notice Process</h3>
              <p className="text-gray-600 leading-relaxed">
                The user may file a counter-notice if they believe the content was removed in error.
              </p>
            </div>
          </div>
        </div>

        {/* Counter-Notice */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex items-center mb-6">
            <FileText className="w-6 h-6 text-green-600 mr-3" />
            <h2 className="text-2xl font-bold text-gray-900">Filing a Counter-Notice</h2>
          </div>
          
          <p className="text-gray-600 leading-relaxed mb-6">
            If you believe your content was removed in error, you may file a counter-notice. Your counter-notice 
            must include the following information:
          </p>

          <div className="space-y-4 mb-6">
            {counterNoticeInfo.map((info, index) => (
              <div key={index} className="flex items-start">
                <CheckCircle className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                <span className="text-gray-600">{info}</span>
              </div>
            ))}
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
            <p className="text-blue-800 text-sm">
              <strong>Note:</strong> Upon receiving a valid counter-notice, we will forward it to the original 
              complainant. If they do not file a court action within 10 business days, we may restore the content.
            </p>
          </div>

          <p className="text-gray-600 leading-relaxed text-sm">
            Send counter-notices to the same DMCA agent contact information listed above.
          </p>
        </div>

        {/* Repeat Infringers */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Repeat Infringer Policy</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              PromptCanvas Pro has a policy of terminating, in appropriate circumstances, the accounts of users 
              who are repeat infringers of intellectual property rights.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We may terminate a user's account if they receive multiple valid DMCA takedown notices or if we 
              determine they are repeatedly infringing on others' intellectual property rights.
            </p>
          </div>
        </div>

        {/* AI-Generated Content */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">AI-Generated Content Considerations</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Our service uses AI to generate images based on text prompts. While we strive to ensure our AI 
              models are trained responsibly, we recognize that copyright concerns may arise with AI-generated content.
            </p>
            <p className="text-gray-600 leading-relaxed">
              If you believe our AI has generated content that infringes on your copyright, please follow the 
              DMCA notice procedures outlined above. We will investigate and take appropriate action.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We are committed to working with copyright holders to address legitimate concerns about AI-generated 
              content while supporting innovation in artificial intelligence.
            </p>
          </div>
        </div>

        {/* False Claims */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">False Claims and Misuse</h2>
          <div className="space-y-4">
            <p className="text-gray-600 leading-relaxed">
              Making false claims of copyright infringement is a serious matter. Under Section 512(f) of the DMCA, 
              any person who knowingly materially misrepresents that material is infringing may be liable for damages.
            </p>
            <p className="text-gray-600 leading-relaxed">
              We reserve the right to seek damages from any party that submits a false or bad faith DMCA notice 
              or counter-notice.
            </p>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Questions About DMCA?</h2>
            <p className="text-blue-100 mb-6">
              If you have questions about our DMCA policy or procedures, please contact us.
            </p>
            <div className="space-y-2">
              <p><strong>DMCA Agent:</strong> dmca@promptcanvaspro.com</p>
              <p><strong>General Inquiries:</strong> legal@promptcanvaspro.com</p>
              <p><strong>Address:</strong> 123 Tech Street, Suite 100, San Francisco, CA 94105</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DMCA;
