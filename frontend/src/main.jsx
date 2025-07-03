import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { ClerkProvider, ClerkLoading, ClerkLoaded } from '@clerk/clerk-react';
import { BrowserRouter } from 'react-router-dom';
import './index.css';
import App from './App.jsx';

const publishableKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
const frontendApi = import.meta.env.VITE_CLERK_FRONTEND_API;

if (!publishableKey || !frontendApi) {
  throw new Error('Missing required Clerk environment variables');
}

console.log('Initializing Clerk with:', { publishableKey, frontendApi });

const clerkConfig = {
  publishableKey,
  frontendApi,
  appearance: {
    elements: {
      formButtonPrimary: 'bg-blue-600 hover:bg-blue-700 text-sm normal-case',
      footerActionLink: 'text-blue-600 hover:text-blue-700',
      card: 'shadow-lg',
      headerTitle: 'text-2xl font-bold text-gray-900',
      headerSubtitle: 'text-gray-600',
    },
    variables: {
      colorPrimary: '#2563eb',
    },
  },
  signInUrl: '/sign-in',
  signUpUrl: '/sign-up',
  afterSignInUrl: '/dashboard',
  afterSignUpUrl: '/dashboard',
};

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <ClerkProvider {...clerkConfig}>
        <ClerkLoading>
          <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        </ClerkLoading>
        <ClerkLoaded>
          <App />
        </ClerkLoaded>
      </ClerkProvider>
    </BrowserRouter>
  </StrictMode>
);
