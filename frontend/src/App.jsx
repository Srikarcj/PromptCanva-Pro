import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '@clerk/clerk-react';

// Components
import { ProtectedRoute } from './components/auth';
import { Layout } from './components/layout';
import { StatsProvider } from './contexts/StatsContext';
import { ThemeProvider } from './contexts/ThemeContext';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Generate from './pages/Generate';
import Gallery from './pages/Gallery';

import History from './pages/History';
import Favorites from './pages/Favorites';
import Settings from './pages/Settings';
import AdminDashboard from './pages/AdminDashboard';
import Features from './pages/Features';
import Pricing from './pages/Pricing';
import About from './pages/About';
import ApiDocs from './pages/ApiDocs';
import Changelog from './pages/Changelog';
import Documentation from './pages/Documentation';
import HelpCenter from './pages/HelpCenter';
import Contact from './pages/Contact';
import Status from './pages/Status';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import CookiePolicy from './pages/CookiePolicy';
import DMCA from './pages/DMCA';
import { SignIn, SignUp, UserProfile } from './components/auth';

// Profile component - UserProfile already has its own layout
const Profile = () => <UserProfile />;

function AppRoutes() {
  const { isSignedIn } = useAuth();

  return (
    <ThemeProvider>
      <StatsProvider>
        <Layout>
          <Routes>
        {/* Public Routes */}
        <Route path="/" element={<Home />} />
        <Route path="/features" element={<Features />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/about" element={<About />} />
        <Route path="/api-docs" element={<ApiDocs />} />
        <Route path="/changelog" element={<Changelog />} />
        <Route path="/documentation" element={<Documentation />} />
        <Route path="/help" element={<HelpCenter />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/status" element={<Status />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms" element={<TermsOfService />} />
        <Route path="/cookies" element={<CookiePolicy />} />
        <Route path="/dmca" element={<DMCA />} />
        <Route path="/sign-in" element={<SignIn />} />
        <Route path="/sign-up" element={<SignUp />} />

        {/* Protected Routes */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/generate"
          element={<Generate />}
        />
        <Route
          path="/gallery"
          element={
            <ProtectedRoute>
              <Gallery />
            </ProtectedRoute>
          }
        />

        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/history"
          element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <ProtectedRoute>
              <Favorites />
            </ProtectedRoute>
          }
        />
        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* Redirect authenticated users from auth pages */}
        <Route
          path="/sign-in"
          element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignIn />}
        />
        <Route
          path="/sign-up"
          element={isSignedIn ? <Navigate to="/dashboard" replace /> : <SignUp />}
        />

        {/* Catch all route */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        </Layout>
      </StatsProvider>
    </ThemeProvider>
  );
}

function App() {
  return <AppRoutes />;
}

export default App;
