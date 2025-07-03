import React from 'react';
import { ClerkProvider as BaseClerkProvider } from '@clerk/clerk-react';

const ClerkProvider = ({ children }) => {
  const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

  if (!publishableKey) {
    console.error('Missing Clerk Publishable Key');
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Configuration Error</h1>
          <p className="text-gray-600">
            Missing Clerk Publishable Key. Please check your environment variables.
          </p>
        </div>
      </div>
    );
  }

  return (
    <BaseClerkProvider publishableKey={publishableKey}>
      {children}
    </BaseClerkProvider>
  );
};

export default ClerkProvider;
