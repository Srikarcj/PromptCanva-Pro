import React from 'react';
import { SignIn as ClerkSignIn } from '@clerk/clerk-react';
import { Card } from '../ui';

const SignIn = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-white to-gray-50 px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to continue creating amazing images
          </p>
        </div>
        
        <Card className="p-0 overflow-hidden">
          <ClerkSignIn 
            appearance={{
              elements: {
                rootBox: "w-full",
                card: "shadow-none border-0 w-full",
                headerTitle: "hidden",
                headerSubtitle: "hidden",
                socialButtonsBlockButton: "w-full justify-center border border-gray-300 hover:bg-gray-50",
                formButtonPrimary: "w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200",
                formFieldInput: "w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                footerActionLink: "text-blue-600 hover:text-blue-700 font-medium",
              },
              layout: {
                socialButtonsPlacement: "top",
                showOptionalFields: false,
              },
            }}
            redirectUrl="/dashboard"
            signUpUrl="/sign-up"
          />
        </Card>
        
        <div className="text-center mt-6">
          <p className="text-sm text-gray-600">
            Don't have an account?{' '}
            <a 
              href="/sign-up" 
              className="text-blue-600 hover:text-blue-700 font-medium"
            >
              Sign up for free
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignIn;
