import React, { useState, useEffect } from 'react';
import { 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  Clock, 
  TrendingUp,
  Server,
  Database,
  Globe,
  Zap,
  Shield,
  RefreshCw
} from 'lucide-react';

const Status = () => {
  const [lastUpdated, setLastUpdated] = useState(new Date());

  const systemStatus = {
    overall: 'operational', // operational, degraded, outage
    uptime: '99.98%',
    responseTime: '245ms'
  };

  const services = [
    {
      name: 'Image Generation API',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '4.2s',
      description: 'Core AI image generation service',
      icon: <Zap className="w-5 h-5" />
    },
    {
      name: 'Web Application',
      status: 'operational',
      uptime: '99.97%',
      responseTime: '180ms',
      description: 'Main web interface and dashboard',
      icon: <Globe className="w-5 h-5" />
    },
    {
      name: 'Authentication Service',
      status: 'operational',
      uptime: '99.98%',
      responseTime: '95ms',
      description: 'User login and account management',
      icon: <Shield className="w-5 h-5" />
    },
    {
      name: 'Database',
      status: 'operational',
      uptime: '99.99%',
      responseTime: '12ms',
      description: 'Data storage and retrieval',
      icon: <Database className="w-5 h-5" />
    },
    {
      name: 'CDN & Storage',
      status: 'operational',
      uptime: '99.95%',
      responseTime: '85ms',
      description: 'Image delivery and storage',
      icon: <Server className="w-5 h-5" />
    },
    {
      name: 'Admin Panel',
      status: 'operational',
      uptime: '99.96%',
      responseTime: '220ms',
      description: 'Administrative interface',
      icon: <Activity className="w-5 h-5" />
    }
  ];

  const incidents = [
    {
      id: 1,
      title: 'Resolved: Intermittent API Timeouts',
      status: 'resolved',
      severity: 'minor',
      startTime: '2024-01-14 14:30 UTC',
      endTime: '2024-01-14 15:45 UTC',
      duration: '1h 15m',
      description: 'Some users experienced slower than normal image generation times. The issue has been resolved.',
      updates: [
        {
          time: '2024-01-14 15:45 UTC',
          message: 'Issue resolved. All services are operating normally.',
          status: 'resolved'
        },
        {
          time: '2024-01-14 15:20 UTC',
          message: 'We have identified the cause and are implementing a fix.',
          status: 'investigating'
        },
        {
          time: '2024-01-14 14:30 UTC',
          message: 'We are investigating reports of slower image generation times.',
          status: 'investigating'
        }
      ]
    },
    {
      id: 2,
      title: 'Scheduled Maintenance: Database Optimization',
      status: 'completed',
      severity: 'maintenance',
      startTime: '2024-01-10 02:00 UTC',
      endTime: '2024-01-10 04:00 UTC',
      duration: '2h',
      description: 'Scheduled database maintenance to improve performance. No service interruption expected.',
      updates: [
        {
          time: '2024-01-10 04:00 UTC',
          message: 'Maintenance completed successfully. All systems operating normally.',
          status: 'completed'
        },
        {
          time: '2024-01-10 02:00 UTC',
          message: 'Maintenance window started. Monitoring all services.',
          status: 'in-progress'
        }
      ]
    }
  ];

  const metrics = [
    {
      name: 'API Response Time',
      value: '245ms',
      trend: 'down',
      change: '-12ms',
      status: 'good'
    },
    {
      name: 'Success Rate',
      value: '99.97%',
      trend: 'up',
      change: '+0.02%',
      status: 'excellent'
    },
    {
      name: 'Active Users',
      value: '2,847',
      trend: 'up',
      change: '+156',
      status: 'good'
    },
    {
      name: 'Images Generated',
      value: '45,231',
      trend: 'up',
      change: '+2,891',
      status: 'excellent'
    }
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case 'operational':
        return 'text-green-600 bg-green-100';
      case 'degraded':
        return 'text-yellow-600 bg-yellow-100';
      case 'outage':
        return 'text-red-600 bg-red-100';
      case 'maintenance':
        return 'text-blue-600 bg-blue-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'operational':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'degraded':
        return <AlertTriangle className="w-4 h-4 text-yellow-600" />;
      case 'outage':
        return <XCircle className="w-4 h-4 text-red-600" />;
      case 'maintenance':
        return <Clock className="w-4 h-4 text-blue-600" />;
      default:
        return <CheckCircle className="w-4 h-4 text-gray-600" />;
    }
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical':
        return 'bg-red-100 text-red-800';
      case 'major':
        return 'bg-orange-100 text-orange-800';
      case 'minor':
        return 'bg-yellow-100 text-yellow-800';
      case 'maintenance':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setLastUpdated(new Date());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="text-center">
            <Activity className="w-16 h-16 mx-auto mb-6 text-yellow-400" />
            <h1 className="text-4xl md:text-6xl font-bold mb-6">
              System Status
            </h1>
            <p className="text-xl md:text-2xl text-blue-100 mb-8 max-w-3xl mx-auto">
              Real-time status and performance metrics for PromptCanvas Pro
            </p>
            
            {/* Overall Status */}
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-2xl mx-auto">
              <div className="flex items-center justify-center space-x-4 mb-4">
                {getStatusIcon(systemStatus.overall)}
                <span className="text-2xl font-semibold">
                  {systemStatus.overall === 'operational' ? 'All Systems Operational' : 
                   systemStatus.overall === 'degraded' ? 'Degraded Performance' : 
                   'Service Outage'}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold">{systemStatus.uptime}</div>
                  <div className="text-blue-200">Uptime (30 days)</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{systemStatus.responseTime}</div>
                  <div className="text-blue-200">Avg Response Time</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Last Updated */}
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gray-900">Service Status</h2>
          <div className="flex items-center text-sm text-gray-500">
            <RefreshCw className="w-4 h-4 mr-2" />
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>

        {/* Services Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {services.map((service, index) => (
            <div key={index} className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                  {service.icon}
                  <h3 className="font-semibold text-gray-900">{service.name}</h3>
                </div>
                <div className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(service.status)}`}>
                  {getStatusIcon(service.status)}
                  <span className="capitalize">{service.status}</span>
                </div>
              </div>
              <p className="text-gray-600 text-sm mb-4">{service.description}</p>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <div className="text-gray-500">Uptime</div>
                  <div className="font-semibold">{service.uptime}</div>
                </div>
                <div>
                  <div className="text-gray-500">Response</div>
                  <div className="font-semibold">{service.responseTime}</div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Performance Metrics */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-12">
          <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center">
            <TrendingUp className="w-6 h-6 mr-3 text-blue-600" />
            Performance Metrics (Last 24 Hours)
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {metrics.map((metric, index) => (
              <div key={index} className="text-center">
                <div className="text-3xl font-bold text-gray-900 mb-1">{metric.value}</div>
                <div className="text-gray-600 mb-2">{metric.name}</div>
                <div className={`flex items-center justify-center space-x-1 text-sm ${
                  metric.trend === 'up' ? 'text-green-600' : 'text-red-600'
                }`}>
                  <TrendingUp className={`w-4 h-4 ${metric.trend === 'down' ? 'rotate-180' : ''}`} />
                  <span>{metric.change}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Incidents */}
        <div className="bg-white rounded-xl shadow-lg p-8">
          <h3 className="text-xl font-bold text-gray-900 mb-6">Recent Incidents</h3>
          <div className="space-y-6">
            {incidents.map((incident) => (
              <div key={incident.id} className="border border-gray-200 rounded-lg p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">{incident.title}</h4>
                    <div className="flex items-center space-x-4 text-sm text-gray-600">
                      <span>{incident.startTime} - {incident.endTime}</span>
                      <span>Duration: {incident.duration}</span>
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${getSeverityColor(incident.severity)}`}>
                    {incident.severity.charAt(0).toUpperCase() + incident.severity.slice(1)}
                  </span>
                </div>
                <p className="text-gray-600 mb-4">{incident.description}</p>
                
                {/* Incident Updates */}
                <div className="space-y-3">
                  <h5 className="font-medium text-gray-900">Updates:</h5>
                  {incident.updates.map((update, updateIndex) => (
                    <div key={updateIndex} className="flex items-start space-x-3 text-sm">
                      <div className="text-gray-500 min-w-0 flex-shrink-0">{update.time}</div>
                      <div className="text-gray-700">{update.message}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Subscribe to Updates */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl p-8 mt-12">
          <div className="text-center">
            <h3 className="text-2xl font-bold mb-4">Stay Informed</h3>
            <p className="text-blue-100 mb-6">
              Get notified about service updates and maintenance windows
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:ring-2 focus:ring-yellow-400 focus:outline-none"
              />
              <button className="bg-white text-blue-600 px-6 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Status;
