import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button 
} from '../ui';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Activity,
  Users,
  Image,
  Calendar,
  RefreshCw,
  Download
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const AnalyticsDashboard = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7d'); // '24h', '7d', '30d', '90d'
  const [chartData, setChartData] = useState({});

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const result = await adminService.getAnalytics({
        timeRange: timeRange
      });

      if (result.success) {
        setAnalytics(result.data);
        setChartData(result.data.charts || {});
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchAnalytics();
  };

  const handleExportData = async () => {
    try {
      const result = await adminService.exportAnalytics({
        timeRange: timeRange,
        format: 'csv'
      });
      
      if (result.success) {
        // Create download link
        const blob = new Blob([result.data], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analytics-${timeRange}-${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Failed to export analytics:', error);
    }
  };

  const renderChart = (type, data, title) => {
    if (!data || !data.length) {
      return (
        <div className="h-64 flex items-center justify-center text-gray-500">
          <div className="text-center">
            <BarChart3 className="w-12 h-12 mx-auto mb-2 text-gray-300" />
            <p>No data available</p>
          </div>
        </div>
      );
    }

    // Simple bar chart representation
    const maxValue = Math.max(...data.map(d => d.value || 0));
    
    return (
      <div className="h-64 p-4">
        <h4 className="font-medium text-gray-900 mb-4">{title}</h4>
        <div className="flex items-end justify-between h-48 space-x-2">
          {data.map((item, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className="w-full bg-blue-500 rounded-t transition-all hover:bg-blue-600"
                style={{ 
                  height: `${maxValue > 0 ? (item.value / maxValue) * 100 : 0}%`,
                  minHeight: item.value > 0 ? '4px' : '0px'
                }}
                title={`${item.label}: ${item.value}`}
              ></div>
              <span className="text-xs text-gray-600 mt-2 text-center truncate w-full">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
          <p className="text-gray-600">Detailed platform analytics and insights</p>
        </div>
        <div className="flex items-center space-x-2">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="24h">Last 24 Hours</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <Button variant="outline" onClick={handleExportData} className="flex items-center">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
          <Button onClick={handleRefresh} disabled={loading} className="flex items-center">
            <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-3 text-lg">Loading analytics...</span>
        </div>
      ) : (
        <>
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Total Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.total_users || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{analytics?.metrics?.users_growth || 0}% from last period
                    </p>
                  </div>
                  <Users className="w-8 h-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Images Generated</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.total_images || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{analytics?.metrics?.images_growth || 0}% from last period
                    </p>
                  </div>
                  <Image className="w-8 h-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Active Users</p>
                    <p className="text-2xl font-bold text-gray-900">
                      {analytics?.metrics?.active_users || 0}
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                      {analytics?.metrics?.activity_rate || 0}% activity rate
                    </p>
                  </div>
                  <Activity className="w-8 h-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Revenue</p>
                    <p className="text-2xl font-bold text-gray-900">
                      ${analytics?.metrics?.total_revenue || 0}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      +{analytics?.metrics?.revenue_growth || 0}% from last period
                    </p>
                  </div>
                  <TrendingUp className="w-8 h-8 text-yellow-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Daily Image Generations
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart('bar', chartData.daily_generations, 'Images per Day')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Users className="w-5 h-5 mr-2" />
                  User Activity
                </CardTitle>
              </CardHeader>
              <CardContent>
                {renderChart('line', chartData.user_activity, 'Active Users')}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <PieChart className="w-5 h-5 mr-2" />
                  Popular Prompts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {analytics?.popular_prompts?.slice(0, 5).map((prompt, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {prompt.text || 'Unknown prompt'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {prompt.category || 'General'}
                        </p>
                      </div>
                      <div className="ml-4 text-right">
                        <p className="text-sm font-medium text-gray-900">
                          {prompt.count || 0}
                        </p>
                        <p className="text-xs text-gray-500">uses</p>
                      </div>
                    </div>
                  )) || (
                    <div className="text-center py-8 text-gray-500">
                      <PieChart className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No prompt data available</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="w-5 h-5 mr-2" />
                  Usage Patterns
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Peak Hours</h4>
                    <div className="space-y-2">
                      {analytics?.usage_patterns?.peak_hours?.map((hour, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">
                            {hour.time || `${index}:00`}
                          </span>
                          <div className="flex items-center space-x-2">
                            <div className="w-20 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-500 h-2 rounded-full"
                                style={{ width: `${(hour.usage || 0)}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                              {hour.count || 0}
                            </span>
                          </div>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">No usage pattern data available</p>
                      )}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Device Types</h4>
                    <div className="space-y-2">
                      {analytics?.device_stats?.map((device, index) => (
                        <div key={index} className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">{device.type}</span>
                          <span className="text-sm font-medium text-gray-900">
                            {device.percentage}%
                          </span>
                        </div>
                      )) || (
                        <p className="text-sm text-gray-500">No device data available</p>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Activity className="w-5 h-5 mr-2" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {analytics?.recent_activity?.map((activity, index) => (
                  <div key={index} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {activity.action || 'Unknown action'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {activity.user || 'Unknown user'} • {activity.timestamp 
                          ? new Date(activity.timestamp).toLocaleString()
                          : 'Unknown time'
                        }
                      </p>
                    </div>
                    <div className="text-xs text-gray-500">
                      {typeof activity.details === 'string'
                        ? activity.details
                        : activity.details?.prompt || activity.details?.image_id || ''
                      }
                    </div>
                  </div>
                )) || (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
};

export default AnalyticsDashboard;
