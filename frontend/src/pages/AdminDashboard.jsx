import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button, 
  LoadingSpinner 
} from '../components/ui';
import {
  Shield,
  Users,
  Image,
  Activity,
  TrendingUp,
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Download,
  Search,
  Eye,
  BarChart3,
  RefreshCw
} from 'lucide-react';
import { adminService } from '../services/adminService';
import UsersManagement from '../components/admin/UsersManagement';
import ImagesManagement from '../components/admin/ImagesManagement';
import AnalyticsDashboard from '../components/admin/AnalyticsDashboard';
import SystemManagement from '../components/admin/SystemManagement';

const AdminDashboard = () => {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [dashboardData, setDashboardData] = useState(null);
  const [systemHealth, setSystemHealth] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Initialize admin service and setup real-time updates
  useEffect(() => {
    const initializeAdmin = async () => {
      setLoading(true);
      try {
        console.log('🚀 Initializing admin dashboard...');

        // Initialize admin service
        const initResult = await adminService.initialize();

        if (initResult.success && initResult.isAdmin) {
          setIsAdmin(true);
          console.log('✅ Admin access confirmed');

          // Load initial data
          const [dashboardResult, healthResult] = await Promise.all([
            adminService.getDashboard(),
            adminService.getSystemHealth()
          ]);

          if (dashboardResult.success) {
            setDashboardData(dashboardResult.data);
            console.log('📊 Dashboard data loaded');
          } else {
            console.error('❌ Dashboard load failed:', dashboardResult.error);
          }

          if (healthResult.success) {
            setSystemHealth(healthResult.data);
            console.log('🏥 System health loaded');
          } else {
            console.error('❌ System health load failed:', healthResult.error);
          }

          // Setup real-time event listeners
          adminService.addEventListener('dashboardUpdated', (data) => {
            console.log('⚡ Dashboard updated in real-time');
            setDashboardData(data);
          });

          adminService.addEventListener('userActivity', (activity) => {
            console.log('👤 User activity:', activity);
            // Refresh dashboard to show latest activity
            adminService.refreshDashboardData();
          });

          adminService.addEventListener('imageGenerated', (imageData) => {
            console.log('🖼️ New image generated:', imageData);
            // Update dashboard stats in real-time
            setDashboardData(prev => prev ? {
              ...prev,
              platform_stats: {
                ...prev.platform_stats,
                total_images_generated: (prev.platform_stats.total_images_generated || 0) + 1,
                active_users_today: prev.platform_stats.active_users_today || 1
              }
            } : null);
          });

        } else {
          setIsAdmin(false);
          console.log('❌ Admin access denied:', initResult.error);
        }
      } catch (error) {
        console.error('❌ Admin initialization failed:', error);
        setIsAdmin(false);
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      initializeAdmin();
    }

    // Cleanup on unmount
    return () => {
      adminService.cleanup();
    };
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" text="Checking admin access..." />
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="max-w-md">
          <CardContent className="p-8 text-center">
            <Shield className="w-16 h-16 text-red-500 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
            <p className="text-gray-600 mb-4">
              You don't have permission to access the admin dashboard.
            </p>
            <p className="text-sm text-gray-500">
              Only platform administrators can view this page.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'images', label: 'Images', icon: Image },
    { id: 'analytics', label: 'Analytics', icon: TrendingUp },
    { id: 'system', label: 'System', icon: Server },
  ];

  // Manual refresh function
  const handleRefresh = async () => {
    setLoading(true);
    try {
      console.log('🔄 Manual refresh triggered');

      const [dashboardResult, healthResult] = await Promise.all([
        adminService.getDashboard(),
        adminService.getSystemHealth()
      ]);

      if (dashboardResult.success) {
        setDashboardData(dashboardResult.data);
      }

      if (healthResult.success) {
        setSystemHealth(healthResult.data);
      }

      console.log('✅ Manual refresh completed');
    } catch (error) {
      console.error('❌ Manual refresh failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const stats = dashboardData?.platform_stats || {};

  return (
    <div className="w-full min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-gradient-to-br from-purple-600 to-blue-600 rounded-full flex items-center justify-center shadow-lg">
                <Shield className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600 mt-1">Platform management and analytics</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button
                onClick={handleRefresh}
                variant="outline"
                size="sm"
                disabled={loading}
                className="flex items-center"
              >
                <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>

              <div className="text-sm text-gray-600">
                Welcome, <span className="font-medium">{user?.fullName || 'Admin'}</span>
              </div>

              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-green-600 font-medium">Real-time</span>
              </div>

              <div className="text-xs text-gray-500">
                Last updated: {dashboardData ? new Date().toLocaleTimeString() : 'Never'}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center space-x-2 ${
                      activeTab === tab.id
                        ? 'border-blue-500 text-blue-600'
                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Users className="w-8 h-8 text-blue-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Total Users</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_users || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Image className="w-8 h-8 text-green-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Images Generated</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_images_generated || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Activity className="w-8 h-8 text-purple-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Active Today</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.active_users_today || 0}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center">
                    <div className="flex-shrink-0">
                      <Database className="w-8 h-8 text-orange-600" />
                    </div>
                    <div className="ml-4">
                      <p className="text-sm font-medium text-gray-600">Storage Used</p>
                      <p className="text-2xl font-bold text-gray-900">{stats.total_storage_used_mb || 0} MB</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* System Health */}
            {systemHealth && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Server className="w-5 h-5 mr-2" />
                    System Health
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    {Object.entries(systemHealth.services || {}).map(([service, data]) => (
                      <div key={service} className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                        <div className={`w-3 h-3 rounded-full ${
                          data.status === 'healthy' ? 'bg-green-500' : 'bg-red-500'
                        }`}></div>
                        <div>
                          <p className="font-medium text-gray-900 capitalize">{service}</p>
                          <p className="text-sm text-gray-600">{data.status}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                    onClick={() => setActiveTab('users')}
                  >
                    <Users className="w-4 h-4" />
                    <span>Manage Users</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                    onClick={() => setActiveTab('images')}
                  >
                    <Image className="w-4 h-4" />
                    <span>View All Images</span>
                  </Button>
                  
                  <Button
                    variant="outline"
                    className="flex items-center justify-center space-x-2 h-12"
                    onClick={() => setActiveTab('analytics')}
                  >
                    <TrendingUp className="w-4 h-4" />
                    <span>View Analytics</span>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Users Management Tab */}
        {activeTab === 'users' && (
          <UsersManagement />
        )}

        {/* Images Management Tab */}
        {activeTab === 'images' && (
          <ImagesManagement />
        )}

        {/* Analytics Tab */}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}

        {/* System Management Tab */}
        {activeTab === 'system' && (
          <SystemManagement />
        )}
      </div>
    </div>
  );
};

export default AdminDashboard;
