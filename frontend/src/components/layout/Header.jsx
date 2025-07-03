import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth, useUser } from '@clerk/clerk-react';
import { adminService } from '../../services/adminService';
import { Palette, Sparkles, Image, User, Settings, Shield, Menu, X, Book, HelpCircle, DollarSign, Star, Info } from 'lucide-react';
import { Button } from '../ui';
import { UserButton } from '../auth';

const Header = ({ sidebarOpen, setSidebarOpen }) => {
  const { isSignedIn } = useAuth();
  const { user } = useUser();
  const location = useLocation();
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

  const publicNavigation = [
    { name: 'Features', href: '/features', icon: Star },
    { name: 'Pricing', href: '/pricing', icon: DollarSign },
    { name: 'About', href: '/about', icon: Info },
    { name: 'Generate', href: '/generate', icon: Sparkles },
    { name: 'Docs', href: '/documentation', icon: Book },
    { name: 'Help', href: '/help', icon: HelpCircle },
  ];

  const authenticatedNavigation = [
    { name: 'Generate', href: '/generate', icon: Sparkles },
    { name: 'Gallery', href: '/gallery', icon: Image },
    { name: 'Profile', href: '/profile', icon: User },
    { name: 'Settings', href: '/settings', icon: Settings },
    ...(isAdmin ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <header className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-[60]">
      <div className="w-full px-0">
        <div className="flex justify-between items-center h-16">
          {/* Mobile Menu Button - positioned at top left corner */}
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              className={`mr-3 ${isSignedIn ? 'lg:hidden' : 'lg:hidden'}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </Button>

            {/* Logo moved a little bit to the right */}
            <Link to="/" className="flex items-center space-x-2 pl-8 lg:pl-8">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">
                PromptCanvas Pro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex space-x-8">
            {(isSignedIn ? authenticatedNavigation : publicNavigation).map((item) => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors duration-200 ${
                    isActive(item.href)
                      ? 'bg-blue-50 text-blue-700'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{item.name}</span>
                </Link>
              );
            })}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isSignedIn ? (
              <UserButton />
            ) : (
              <div className="flex items-center space-x-2">
                <Link to="/sign-in">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/sign-up">
                  <Button size="sm">
                    Get Started
                  </Button>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
