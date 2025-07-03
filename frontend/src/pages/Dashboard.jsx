import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import {
  Sparkles,
  Image,
  TrendingUp,
  Clock,
  ArrowRight,
  Plus,
  RefreshCw
} from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle, LoadingSpinner } from '../components/ui';
import { imageService } from '../services';
import { formatRelativeTime } from '../utils/helpers';
import { useStats } from '../contexts/StatsContext';
import usageLimitService from '../services/usageLimitService';

const Dashboard = () => {
  const { user } = useUser();
  const { stats, loading: statsLoading, refreshStats } = useStats();
  const [recentImages, setRecentImages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [usageData, setUsageData] = useState(null);

  const fetchDashboardData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      // Refresh stats
      refreshStats();

      // Fetch usage data
      const usageResult = await usageLimitService.getUsageLimits();
      if (usageResult.success) {
        setUsageData(usageResult.data);
      }

      // Fetch recent images
      const imagesResult = await imageService.getUserImages({
        page: 1,
        limit: 3,
        sort: 'newest'
      });

      if (imagesResult.success) {
        setRecentImages(imagesResult.data.images || []);
      }
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
      setError('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  }, [user, refreshStats]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  // Auto-refresh dashboard every 60 seconds to keep stats current
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      fetchDashboardData();
    }, 60000); // 60 seconds

    return () => clearInterval(interval);
  }, [user, fetchDashboardData]);

  const quickActions = [
    {
      title: 'Generate New Image',
      description: 'Create a new AI-generated image',
      href: '/generate',
      icon: Sparkles,
      color: 'bg-blue-500'
    },
    {
      title: 'View Gallery',
      description: 'Browse your image collection',
      href: '/gallery',
      icon: Image,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div className="mb-8 flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {user?.firstName || 'Creator'}! 👋
          </h1>
          <p className="text-gray-600">
            Ready to create something amazing today?
          </p>
        </div>
        <Button
          variant="outline"
          onClick={fetchDashboardData}
          disabled={loading || statsLoading}
          className="flex items-center gap-2"
        >
          <RefreshCw className={`h-4 w-4 ${(loading || statsLoading) ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        {quickActions.map((action, index) => {
          const Icon = action.icon;
          return (
            <Link key={index} to={action.href}>
              <Card className="hover:shadow-lg transition-shadow duration-200 cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-4">
                    <div className={`w-12 h-12 ${action.color} rounded-lg flex items-center justify-center`}>
                      <Icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {action.title}
                      </h3>
                      <p className="text-gray-600 text-sm">
                        {action.description}
                      </p>
                    </div>
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Images Created
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.total_images}
                  {!statsLoading && (
                    <span className="text-xs text-green-500 ml-1">
                      {stats.last_updated ? '●' : ''}
                    </span>
                  )}
                </p>
                <p className="text-sm text-gray-600">
                  Total generated
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Image className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  This Month
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {statsLoading ? '...' : stats.this_month_count}
                  {!statsLoading && (
                    <span className="text-xs text-green-500 ml-1">
                      {stats.last_updated ? '●' : ''}
                    </span>
                  )}
                </p>
                <p className="text-sm text-green-600">
                  Recent activity
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-gray-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">
                  Daily Usage
                </p>
                <p className="text-2xl font-bold text-gray-900">
                  {loading || !usageData ? '...' : `${usageData.current_usage}/${usageData.limit}`}
                </p>
                <p className="text-sm text-gray-600">
                  Images today
                </p>
              </div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-gray-600" />
              </div>
            </div>
            {/* Usage Progress Bar */}
            {usageData && (
              <div className="mt-4">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      usageData.remaining === 0 ? 'bg-red-500' :
                      usageData.remaining <= 1 ? 'bg-orange-500' :
                      'bg-green-500'
                    }`}
                    style={{ width: `${usageLimitService.getUsagePercentage(usageData)}%` }}
                  />
                </div>
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>{usageData.remaining} remaining</span>
                  {usageData.reset_time && (
                    <span>{usageLimitService.formatTimeUntilReset(usageData.reset_time)}</span>
                  )}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent Images */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Recent Creations</CardTitle>
            <Link to="/gallery">
              <Button variant="outline" size="sm">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" text="Loading recent images..." />
            </div>
          ) : error ? (
            <div className="text-center py-12">
              <div className="text-red-500 mb-4">
                <Image className="h-12 w-12 mx-auto mb-2" />
                <p>{error}</p>
              </div>
              <Button onClick={() => window.location.reload()} variant="outline">
                Try Again
              </Button>
            </div>
          ) : recentImages.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {recentImages.map((image) => (
                <Link key={image.id} to="/gallery" className="group cursor-pointer">
                  <div className="aspect-square bg-gray-200 rounded-lg overflow-hidden mb-3 group-hover:shadow-lg transition-shadow duration-200">
                    {image.url ? (
                      <img
                        src={image.thumbnail_url || image.url}
                        alt={image.prompt}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-200"
                        onError={(e) => {
                          e.target.src = `data:image/svg+xml;base64,${btoa(`
                            <svg width="300" height="300" xmlns="http://www.w3.org/2000/svg">
                              <rect width="100%" height="100%" fill="#f3f4f6"/>
                              <text x="50%" y="50%" text-anchor="middle" dy=".3em" fill="#9ca3af" font-family="Arial, sans-serif" font-size="16">
                                Image
                              </text>
                            </svg>
                          `)}`;
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                        <Image className="h-12 w-12 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <h4 className="font-medium text-gray-900 mb-1 line-clamp-2">
                    {image.prompt}
                  </h4>
                  <p className="text-sm text-gray-500">
                    {formatRelativeTime(image.created_at)}
                  </p>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Image className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                No images yet
              </h3>
              <p className="text-gray-600 mb-4">
                Start creating your first AI-generated image
              </p>
              <Link to="/generate">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create First Image
                </Button>
              </Link>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Dashboard;
