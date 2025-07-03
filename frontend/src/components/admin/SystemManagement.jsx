import React, { useState, useEffect } from 'react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  Button 
} from '../ui';
import {
  Server,
  Database,
  Zap,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
  HardDrive,
  Cpu,
  MemoryStick,
  RefreshCw,
  Settings,
  Download,
  Upload
} from 'lucide-react';
import { adminService } from '../../services/adminService';

const SystemManagement = () => {
  const [systemHealth, setSystemHealth] = useState(null);
  const [systemLogs, setSystemLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('health'); // 'health', 'logs', 'settings'

  useEffect(() => {
    fetchSystemData();
    
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchSystemData, 30000);
    return () => clearInterval(interval);
  }, []);

  const fetchSystemData = async () => {
    setLoading(true);
    try {
      const [healthResult, logsResult] = await Promise.all([
        adminService.getSystemHealth(),
        adminService.getSystemLogs({ limit: 50 })
      ]);

      if (healthResult.success) {
        setSystemHealth(healthResult.data);
      }

      if (logsResult.success) {
        setSystemLogs(logsResult.data.logs || []);
      }
    } catch (error) {
      console.error('Failed to fetch system data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchSystemData();
  };

  const handleRestartService = async (serviceName) => {
    if (!confirm(`Are you sure you want to restart ${serviceName}?`)) return;
    
    try {
      const result = await adminService.restartService(serviceName);
      if (result.success) {
        alert(`${serviceName} restarted successfully`);
        fetchSystemData();
      }
    } catch (error) {
      console.error('Failed to restart service:', error);
      alert('Failed to restart service');
    }
  };

  const getStatusColor = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'active':
        return 'text-green-600 bg-green-100';
      case 'warning':
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'error':
      case 'offline':
      case 'failed':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status?.toLowerCase()) {
      case 'healthy':
      case 'online':
      case 'active':
        return <CheckCircle className="w-4 h-4" />;
      case 'warning':
      case 'degraded':
        return <AlertTriangle className="w-4 h-4" />;
      case 'error':
      case 'offline':
      case 'failed':
        return <AlertTriangle className="w-4 h-4" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const formatBytes = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatUptime = (seconds) => {
    if (!seconds) return '0s';
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (days > 0) return `${days}d ${hours}h ${minutes}m`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">System Management</h2>
          <p className="text-gray-600">Monitor and manage system health and performance</p>
        </div>
        <Button onClick={handleRefresh} disabled={loading} className="flex items-center">
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { id: 'health', label: 'System Health', icon: Activity },
            { id: 'logs', label: 'System Logs', icon: Database },
            { id: 'settings', label: 'Settings', icon: Settings }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <tab.icon className="w-4 h-4 mr-2" />
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {loading && activeTab === 'health' ? (
        <div className="flex items-center justify-center py-12">
          <RefreshCw className="w-8 h-8 animate-spin" />
          <span className="ml-3 text-lg">Loading system data...</span>
        </div>
      ) : (
        <>
          {/* System Health Tab */}
          {activeTab === 'health' && (
            <div className="space-y-6">
              {/* Service Status */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  { name: 'API Server', status: systemHealth?.api_status, icon: Server },
                  { name: 'Database', status: systemHealth?.database_status, icon: Database },
                  { name: 'AI Service', status: systemHealth?.ai_service_status, icon: Zap },
                  { name: 'Storage', status: systemHealth?.storage_status, icon: HardDrive }
                ].map((service) => (
                  <Card key={service.name}>
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm font-medium text-gray-600">{service.name}</p>
                          <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-2 ${getStatusColor(service.status)}`}>
                            {getStatusIcon(service.status)}
                            <span className="ml-1">{service.status || 'Unknown'}</span>
                          </div>
                        </div>
                        <service.icon className="w-8 h-8 text-gray-400" />
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full mt-4"
                        onClick={() => handleRestartService(service.name.toLowerCase())}
                      >
                        Restart
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Performance Metrics */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <Activity className="w-5 h-5 mr-2" />
                      Performance Metrics
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Clock className="w-4 h-4 mr-2" />
                          API Response Time
                        </span>
                        <span className="font-medium">
                          {systemHealth?.response_times?.api_avg_ms || 0}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Database className="w-4 h-4 mr-2" />
                          Database Response
                        </span>
                        <span className="font-medium">
                          {systemHealth?.response_times?.db_avg_ms || 0}ms
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600 flex items-center">
                          <Zap className="w-4 h-4 mr-2" />
                          AI Generation Time
                        </span>
                        <span className="font-medium">
                          {systemHealth?.response_times?.ai_avg_ms || 0}ms
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center">
                      <AlertTriangle className="w-5 h-5 mr-2" />
                      Error Rates
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">API Error Rate</span>
                        <span className={`font-medium ${
                          (systemHealth?.error_rates?.api_error_rate || 0) > 5 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {systemHealth?.error_rates?.api_error_rate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Generation Error Rate</span>
                        <span className={`font-medium ${
                          (systemHealth?.error_rates?.generation_error_rate || 0) > 2 
                            ? 'text-red-600' 
                            : 'text-green-600'
                        }`}>
                          {systemHealth?.error_rates?.generation_error_rate || 0}%
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Last Health Check</span>
                        <span className="font-medium text-xs">
                          {systemHealth?.last_health_check 
                            ? new Date(systemHealth.last_health_check).toLocaleTimeString()
                            : 'Never'
                          }
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* System Resources */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Cpu className="w-5 h-5 mr-2" />
                    System Resources
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div className="text-center">
                      <Cpu className="w-8 h-8 mx-auto text-blue-500 mb-2" />
                      <p className="text-sm text-gray-600">CPU Usage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth?.resources?.cpu_usage || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <MemoryStick className="w-8 h-8 mx-auto text-green-500 mb-2" />
                      <p className="text-sm text-gray-600">Memory Usage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth?.resources?.memory_usage || 0}%
                      </p>
                    </div>
                    <div className="text-center">
                      <HardDrive className="w-8 h-8 mx-auto text-purple-500 mb-2" />
                      <p className="text-sm text-gray-600">Disk Usage</p>
                      <p className="text-2xl font-bold text-gray-900">
                        {systemHealth?.resources?.disk_usage || 0}%
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* System Logs Tab */}
          {activeTab === 'logs' && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center">
                    <Database className="w-5 h-5 mr-2" />
                    System Logs
                  </div>
                  <Button variant="outline" size="sm" className="flex items-center">
                    <Download className="w-4 h-4 mr-2" />
                    Export Logs
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {systemLogs.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Database className="w-12 h-12 mx-auto mb-2 text-gray-300" />
                      <p>No system logs available</p>
                    </div>
                  ) : (
                    systemLogs.map((log, index) => (
                      <div
                        key={index}
                        className={`p-3 rounded-lg border-l-4 ${
                          log.level === 'error' 
                            ? 'border-red-500 bg-red-50' 
                            : log.level === 'warning'
                            ? 'border-yellow-500 bg-yellow-50'
                            : 'border-blue-500 bg-blue-50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">
                              {log.message || 'No message'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {log.source || 'System'} • {log.timestamp 
                                ? new Date(log.timestamp).toLocaleString()
                                : 'Unknown time'
                              }
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs rounded-full ${
                            log.level === 'error' 
                              ? 'bg-red-100 text-red-800'
                              : log.level === 'warning'
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'bg-blue-100 text-blue-800'
                          }`}>
                            {log.level || 'info'}
                          </span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Settings Tab */}
          {activeTab === 'settings' && (
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    System Configuration
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Max Concurrent Generations
                        </label>
                        <input
                          type="number"
                          defaultValue="10"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Rate Limit (per minute)
                        </label>
                        <input
                          type="number"
                          defaultValue="60"
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4 pt-4">
                      <Button className="flex items-center">
                        <Upload className="w-4 h-4 mr-2" />
                        Save Configuration
                      </Button>
                      <Button variant="outline">
                        Reset to Defaults
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Maintenance Actions</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Clear Cache</h4>
                        <p className="text-sm text-gray-600">Clear all cached data and temporary files</p>
                      </div>
                      <Button variant="outline">Clear Cache</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">Database Cleanup</h4>
                        <p className="text-sm text-gray-600">Remove old logs and optimize database</p>
                      </div>
                      <Button variant="outline">Run Cleanup</Button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">System Backup</h4>
                        <p className="text-sm text-gray-600">Create a full system backup</p>
                      </div>
                      <Button variant="outline">Create Backup</Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default SystemManagement;
