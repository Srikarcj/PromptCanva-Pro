import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { adminService } from '../../services/adminService';
import {
  Sparkles,
  Image,
  User,
  Settings,
  History,
  Heart,
  TrendingUp,
  Shield,
  X,
  Star,
  DollarSign,
  Info,
  Book,
  HelpCircle,
  LogIn,
  UserPlus
} from 'lucide-react';
import { Button } from '../ui';
import { useStats } from '../../contexts/StatsContext';

const Sidebar = ({ isOpen, onClose }) => {
  const { user } = useUser();
  const { isSignedIn } = useAuth();
  const location = useLocation();
  const { stats } = useStats();
  const [isAdmin, setIsAdmin] = useState(false);

  // Check admin access
  useEffect(() => {
    const checkAdminAccess = async () => {
      if (user) {
        try {
          const result = await adminService.checkAdminAccess();
          setIsAdmin(result.success && result.isAdmin);
        } catch (error) {
          setIsAdmin(false);
        }
      }
    };

    checkAdminAccess();
  }, [user]);

  // Debug log to see stats updates
  console.log('🔧 Sidebar stats:', stats);

  // Navigation for authenticated users
  const authenticatedNavigation = [
    { name: 'Generate', href: '/generate', icon: Sparkles, description: 'Create new images' },
    { name: 'Gallery', href: '/gallery', icon: Image, description: 'Your creations' },
    { name: 'History', href: '/history', icon: History, description: 'Recent prompts' },
    { name: 'Favorites', href: '/favorites', icon: Heart, description: 'Saved images' },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield, description: 'Platform management' }] : []),
  ];

  // Navigation for non-authenticated users (basic features only)
  const publicNavigation = [
    { name: 'Features', href: '/features', icon: Star, description: 'Explore features' },
    { name: 'Pricing', href: '/pricing', icon: DollarSign, description: 'View pricing' },
    { name: 'About', href: '/about', icon: Info, description: 'About us' },
    { name: 'Generate', href: '/generate', icon: Sparkles, description: 'Try generation' },
    { name: 'Help', href: '/help', icon: HelpCircle, description: 'Get help' },
  ];

  // Bottom navigation based on auth status
  const authenticatedBottomNav = [
    { name: 'Profile', href: '/profile', icon: User, description: 'Account settings' },
    { name: 'Settings', href: '/settings', icon: Settings, description: 'App preferences' },
  ];

  const publicBottomNav = [
    { name: 'Sign In', href: '/sign-in', icon: LogIn, description: 'Sign in to account' },
    { name: 'Sign Up', href: '/sign-up', icon: UserPlus, description: 'Create account' },
  ];

  // Select navigation based on auth status
  const navigation = isSignedIn ? authenticatedNavigation : publicNavigation;
  const bottomNavigation = isSignedIn ? authenticatedBottomNav : publicBottomNav;



  const isActive = (path) => location.pathname === path;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden bg-gray-600 bg-opacity-75"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div className={`
        fixed top-16 bottom-0 left-0 z-40 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out
        ${isSignedIn ? 'lg:translate-x-0 lg:static lg:top-0' : 'lg:-translate-x-full'}
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        <div className="flex flex-col h-full">
          {/* Mobile close button */}
          <div className="flex items-center justify-between p-4 lg:hidden">
            <h2 className="text-lg font-semibold text-gray-900">Menu</h2>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User info */}
          {user && (
            <div className="p-4 border-b border-gray-200">
              <div className="flex items-center space-x-3">
                <img
                  src={user.imageUrl}
                  alt={user.fullName || user.emailAddresses[0]?.emailAddress}
                  className="w-10 h-10 rounded-full"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user.fullName || 'User'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user.emailAddresses[0]?.emailAddress}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Main navigation */}
          <nav className="flex-1 px-4 py-4 space-y-2">
            <div className="space-y-1">
              {navigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700 border-r-2 border-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Stats section - only for authenticated users */}
            {isSignedIn && (
              <div className="pt-6 mt-6 border-t border-gray-200">
                <div className="px-3 py-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Your Stats
                  </h3>
                  <div className="mt-2 space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Images Created</span>
                      <span className="font-medium text-gray-900">{stats?.total_images || 0}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium text-gray-900">{stats?.this_month_count || 0}</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </nav>

          {/* Secondary navigation */}
          <div className="border-t border-gray-200 p-4">
            <div className="space-y-1">
              {bottomNavigation.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    onClick={onClose}
                    className={`group flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors duration-200 ${
                      isActive(item.href)
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className={`mr-3 h-5 w-5 ${
                      isActive(item.href) ? 'text-blue-700' : 'text-gray-400 group-hover:text-gray-500'
                    }`} />
                    <div className="flex-1">
                      <div>{item.name}</div>
                      {item.description && (
                        <div className="text-xs text-gray-500">{item.description}</div>
                      )}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
