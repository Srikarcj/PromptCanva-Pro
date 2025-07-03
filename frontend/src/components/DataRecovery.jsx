import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  Button
} from './ui';
import { useStats } from '../contexts/StatsContext';
import {
  Download,
  Upload,
  RefreshCw,
  Database,
  HardDrive,
  Cloud,
  AlertTriangle,
  CheckCircle,
  Search
} from 'lucide-react';
import persistentStorage from '../services/persistentStorage';
import localStorageManager from '../services/localStorageManager';

const DataRecovery = () => {
  const [storageReport, setStorageReport] = useState(null);
  const [loading, setLoading] = useState(false);
  const [recovered, setRecovered] = useState(0);
  const { fetchStats, incrementImageCount } = useStats();

  useEffect(() => {
    checkStorage();
  }, []);

  const checkStorage = async () => {
    setLoading(true);
    try {
      // Check all storage locations
      const report = {
        persistent: {
          images: await persistentStorage.getAllImages(),
          history: await persistentStorage.getAllHistory()
        },
        legacy: {
          images: localStorageManager.getGallery(),
          history: localStorageManager.getHistory(),
          favorites: localStorageManager.getFavorites(),
          stats: localStorageManager.getStats()
        },
        browser: {
          localStorage: checkLocalStorageKeys(),
          sessionStorage: checkSessionStorageKeys(),
          indexedDB: await checkIndexedDB()
        }
      };

      // Calculate totals
      report.totals = {
        images: report.persistent.images.length + report.legacy.images.length,
        history: report.persistent.history.length + report.legacy.history.length,
        favorites: report.legacy.favorites.length,
        hasData: false
      };

      report.totals.hasData = report.totals.images > 0 || report.totals.history > 0;

      setStorageReport(report);
      console.log('📊 Storage report:', report);
    } catch (error) {
      console.error('❌ Storage check failed:', error);
    } finally {
      setLoading(false);
    }
  };

  const checkLocalStorageKeys = () => {
    const keys = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.includes('promptcanvas')) {
        keys.push({
          key,
          size: localStorage.getItem(key)?.length || 0
        });
      }
    }
    return keys;
  };

  const checkSessionStorageKeys = () => {
    const keys = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.includes('promptcanvas')) {
        keys.push({
          key,
          size: sessionStorage.getItem(key)?.length || 0
        });
      }
    }
    return keys;
  };

  const checkIndexedDB = async () => {
    try {
      if (!window.indexedDB) return { available: false };
      
      const databases = await indexedDB.databases();
      const promptCanvasDBs = databases.filter(db => 
        db.name && db.name.toLowerCase().includes('promptcanvas')
      );
      
      return {
        available: true,
        databases: promptCanvasDBs
      };
    } catch (error) {
      return { available: false, error: error.message };
    }
  };

  const recoverAllData = async () => {
    setLoading(true);
    try {
      let recoveredCount = 0;
      let imageCount = 0;
      let favoriteCount = 0;

      console.log('🔄 Starting data recovery...');

      // Migrate legacy images to persistent storage
      if (storageReport.legacy.images.length > 0) {
        console.log(`📸 Recovering ${storageReport.legacy.images.length} images...`);

        for (const image of storageReport.legacy.images) {
          // Save with stats update disabled initially
          await persistentStorage.saveImage(image, false);
          recoveredCount++;
          imageCount++;

          // Count favorites
          if (image.is_favorite) {
            favoriteCount++;
          }
        }
      }

      // Migrate legacy history to persistent storage
      if (storageReport.legacy.history.length > 0) {
        console.log(`📜 Recovering ${storageReport.legacy.history.length} history items...`);

        for (const historyItem of storageReport.legacy.history) {
          await persistentStorage.saveToHistory(historyItem);
          recoveredCount++;
        }
      }

      // Migrate favorites
      if (storageReport.legacy.favorites.length > 0) {
        console.log(`⭐ Recovering ${storageReport.legacy.favorites.length} favorites...`);

        for (const favorite of storageReport.legacy.favorites) {
          await persistentStorage.addToFavorites(favorite);
        }
      }

      // Update stats in bulk
      if (imageCount > 0) {
        console.log(`📊 Updating stats for ${imageCount} images...`);

        const currentStats = persistentStorage.getStatsFromLocalStorage();
        const updatedStats = {
          ...currentStats,
          total_images: (currentStats.total_images || 0) + imageCount,
          this_month_count: (currentStats.this_month_count || 0) + imageCount,
          this_week_count: (currentStats.this_week_count || 0) + imageCount,
          favorites_count: favoriteCount,
          last_generation: new Date().toISOString()
        };

        localStorage.setItem('promptcanvas_stats_v2', JSON.stringify(updatedStats));

        // Trigger stats context refresh
        if (fetchStats) {
          await fetchStats();
        }
      }

      // Trigger gallery refresh by dispatching custom event
      window.dispatchEvent(new CustomEvent('galleryDataUpdated', {
        detail: { recoveredImages: imageCount, recoveredHistory: storageReport.legacy.history.length }
      }));

      // Trigger history refresh
      window.dispatchEvent(new CustomEvent('historyDataUpdated', {
        detail: { recoveredHistory: storageReport.legacy.history.length }
      }));

      setRecovered(recoveredCount);
      await checkStorage(); // Refresh report

      console.log('✅ Recovery completed:', {
        totalRecovered: recoveredCount,
        images: imageCount,
        favorites: favoriteCount,
        history: storageReport.legacy.history.length
      });

      alert(`✅ Successfully recovered ${recoveredCount} items!\n\n📸 Images: ${imageCount}\n📜 History: ${storageReport.legacy.history.length}\n⭐ Favorites: ${favoriteCount}\n\nYour data is now visible in Gallery, History, and Stats!`);

    } catch (error) {
      console.error('❌ Recovery failed:', error);
      alert('❌ Recovery failed. Please try exporting your data instead.');
    } finally {
      setLoading(false);
    }
  };

  const exportAllData = async () => {
    try {
      await persistentStorage.exportAllData();
      alert('✅ Data exported successfully! Keep this file safe as a backup.');
    } catch (error) {
      console.error('❌ Export failed:', error);
      alert('❌ Export failed. Please try again.');
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const data = JSON.parse(text);
          
          if (data.images && Array.isArray(data.images)) {
            for (const image of data.images) {
              await persistentStorage.saveImage(image);
            }
          }
          
          if (data.history && Array.isArray(data.history)) {
            for (const historyItem of data.history) {
              await persistentStorage.saveToHistory(historyItem);
            }
          }
          
          await checkStorage();
          alert('✅ Data imported successfully!');
        } catch (error) {
          console.error('❌ Import failed:', error);
          alert('❌ Import failed. Please check the file format.');
        }
      }
    };
    input.click();
  };

  if (loading && !storageReport) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p>Checking storage locations...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Database className="w-5 h-5 mr-2" />
            Data Recovery Center
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {storageReport && (
              <>
                {/* Storage Summary */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-blue-600">Images Found</p>
                        <p className="text-2xl font-bold text-blue-900">
                          {storageReport.totals.images}
                        </p>
                      </div>
                      <HardDrive className="w-8 h-8 text-blue-600" />
                    </div>
                  </div>
                  
                  <div className="bg-green-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-green-600">History Items</p>
                        <p className="text-2xl font-bold text-green-900">
                          {storageReport.totals.history}
                        </p>
                      </div>
                      <Database className="w-8 h-8 text-green-600" />
                    </div>
                  </div>
                  
                  <div className="bg-purple-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-purple-600">Storage Status</p>
                        <p className="text-lg font-bold text-purple-900">
                          {storageReport.totals.hasData ? 'Data Found' : 'No Data'}
                        </p>
                      </div>
                      {storageReport.totals.hasData ? (
                        <CheckCircle className="w-8 h-8 text-green-600" />
                      ) : (
                        <AlertTriangle className="w-8 h-8 text-orange-600" />
                      )}
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap gap-3">
                  <Button
                    onClick={checkStorage}
                    variant="outline"
                    disabled={loading}
                    className="flex items-center"
                  >
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh Check
                  </Button>
                  
                  {storageReport.totals.hasData && (
                    <>
                      <Button
                        onClick={recoverAllData}
                        disabled={loading}
                        className="flex items-center"
                      >
                        <Database className="w-4 h-4 mr-2" />
                        Recover All Data
                      </Button>
                      
                      <Button
                        onClick={exportAllData}
                        variant="outline"
                        className="flex items-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Export Backup
                      </Button>
                    </>
                  )}
                  
                  <Button
                    onClick={importData}
                    variant="outline"
                    className="flex items-center"
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import Data
                  </Button>
                </div>

                {recovered > 0 && (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <div className="flex items-center">
                      <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                      <p className="text-green-800">
                        Successfully recovered {recovered} items to persistent storage!
                      </p>
                    </div>
                  </div>
                )}

                {/* Storage Details */}
                <div className="space-y-3">
                  <h4 className="font-medium">Storage Locations:</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Persistent Storage</h5>
                      <p>Images: {storageReport.persistent.images.length}</p>
                      <p>History: {storageReport.persistent.history.length}</p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded">
                      <h5 className="font-medium mb-2">Legacy Storage</h5>
                      <p>Images: {storageReport.legacy.images.length}</p>
                      <p>History: {storageReport.legacy.history.length}</p>
                      <p>Favorites: {storageReport.legacy.favorites.length}</p>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DataRecovery;
