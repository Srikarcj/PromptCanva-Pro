import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { useUser } from '@clerk/clerk-react';
import { History as HistoryIcon, Plus, RefreshCw, Copy, Sparkles, Clock } from 'lucide-react';
import { Button, Card, CardContent, CardHeader, CardTitle } from '../components/ui';
import { userService } from '../services';
import { formatRelativeTime } from '../utils/helpers';
import localStorageManager from '../services/localStorageManager';
import persistentStorage from '../services/persistentStorage';

const History = () => {
  const { user } = useUser();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch generation history from local storage
  const fetchHistory = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('📜 Fetching history from persistent storage...');

      // Get history from persistent storage (multiple sources)
      const persistentHistory = await persistentStorage.getAllHistory();
      console.log(`✅ Persistent storage: ${persistentHistory.length} history items`);

      // Also get from legacy storage for compatibility
      const localHistory = localStorageManager.getHistory();
      console.log(`✅ Legacy storage: ${localHistory.length} history items`);

      // Merge and deduplicate history
      const allHistory = [...persistentHistory, ...localHistory];
      const uniqueHistory = allHistory.reduce((acc, current) => {
        const existing = acc.find(h => h.id === current.id);
        if (!existing) {
          acc.push(current);
        }
        return acc;
      }, []);

      // Sort by creation date (newest first)
      uniqueHistory.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      console.log(`🎉 Total unique history items loaded: ${uniqueHistory.length}`);
      setHistory(uniqueHistory);
      setError(null); // Never show error for empty history

    } catch (err) {
      console.error('❌ Error fetching history:', err);
      setError('Failed to load generation history');
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchHistory();
    }

    // Listen for data recovery events
    const handleHistoryUpdate = (event) => {
      console.log('🔄 History data updated, refreshing...', event.detail);
      fetchHistory();
    };

    window.addEventListener('historyDataUpdated', handleHistoryUpdate);

    return () => {
      window.removeEventListener('historyDataUpdated', handleHistoryUpdate);
    };
  }, [user, fetchHistory]);

  const handleCopyPrompt = (prompt) => {
    navigator.clipboard.writeText(prompt);
    // You could add a toast notification here
    alert('Prompt copied to clipboard!');
  };

  const handleUsePrompt = (historyItem) => {
    // Store the prompt in localStorage and redirect to generate page
    localStorage.setItem('promptcanvas_preset_prompt', historyItem.prompt);
    localStorage.setItem('promptcanvas_preset_negative_prompt', historyItem.negative_prompt || '');
    localStorage.setItem('promptcanvas_preset_parameters', JSON.stringify(historyItem.parameters));
    
    // Redirect to generate page
    window.location.href = '/generate';
  };

  const stats = React.useMemo(() => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const thisWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    
    return {
      total: history.length,
      today: history.filter(item => new Date(item.created_at) >= today).length,
      thisWeek: history.filter(item => new Date(item.created_at) >= thisWeek).length,
      avgGenerationTime: history.length > 0 
        ? (history.reduce((sum, item) => sum + item.generation_time, 0) / history.length).toFixed(1)
        : 0
    };
  }, [history]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Generation History
          </h1>
          <p className="text-gray-600">
            Your recent image generation prompts and settings
          </p>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={fetchHistory}
            disabled={loading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Link to="/generate">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Create New Image
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Generations</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <HistoryIcon className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Today</p>
                <p className="text-2xl font-bold text-gray-900">{stats.today}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Sparkles className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">This Week</p>
                <p className="text-2xl font-bold text-gray-900">{stats.thisWeek}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-purple-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Avg. Time</p>
                <p className="text-2xl font-bold text-gray-900">{stats.avgGenerationTime}s</p>
              </div>
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center">
                <Clock className="h-6 w-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* History List */}
      {loading ? (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-4">Loading history...</p>
        </div>
      ) : error ? (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-6 text-center">
            <div className="text-red-600 mb-4">
              <HistoryIcon className="h-12 w-12 mx-auto mb-2" />
              <p className="font-medium">Failed to load history</p>
              <p className="text-sm">{error}</p>
            </div>
            <Button
              onClick={fetchHistory}
              variant="outline"
              className="border-red-300 text-red-600 hover:bg-red-100"
            >
              Try Again
            </Button>
          </CardContent>
        </Card>
      ) : history.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <HistoryIcon className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No generation history yet
            </h3>
            <p className="text-gray-600 mb-6 max-w-md mx-auto">
              Start generating images to see your prompt history here. This helps you track and reuse successful prompts.
            </p>
            <Link to="/generate">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Generate Your First Image
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {history.map((item) => (
            <Card key={item.id} className="hover:shadow-md transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-sm text-gray-500">
                        {formatRelativeTime(item.created_at)}
                      </span>
                      <span className="text-sm text-green-600 font-medium">
                        ✓ Success ({item.generation_time}s)
                      </span>
                    </div>
                    <p className="text-lg font-medium text-gray-900 mb-2">
                      {item.prompt}
                    </p>
                    {item.negative_prompt && (
                      <p className="text-sm text-gray-600 mb-2">
                        <span className="font-medium">Negative:</span> {item.negative_prompt}
                      </p>
                    )}
                    <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                      <span>{item.width || item.parameters?.width || 1024}×{item.height || item.parameters?.height || 1024}</span>
                      <span>•</span>
                      <span>{item.steps || item.parameters?.steps || 4} steps</span>
                      <span>•</span>
                      <span>Guidance: {item.guidance_scale || item.parameters?.guidance_scale || 7.5}</span>
                    </div>
                  </div>
                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleCopyPrompt(item.prompt)}
                    >
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => handleUsePrompt(item)}
                    >
                      <Sparkles className="h-4 w-4 mr-1" />
                      Use Again
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default History;
