import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Battery, 
  Wifi, 
  WifiOff, 
  HardDrive, 
  Zap, 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Database,
  Trash2,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { usePerformanceMonitoring } from '../../utils/mobilePerformance';
import { useMobileData } from '../../utils/mobileDataManager';

interface PerformanceMetrics {
  fps: number;
  memoryUsage: number;
  loadTime: number;
  cacheHitRate: number;
}

export const MobilePerformanceDashboard: React.FC<{
  className?: string;
  onOptimize?: () => void;
}> = ({ className = '', onOptimize }) => {
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    fps: 60,
    memoryUsage: 0,
    loadTime: 0,
    cacheHitRate: 85
  });
  const [batteryLevel, setBatteryLevel] = useState<number | null>(null);
  const [isCharging, setIsCharging] = useState<boolean>(false);
  const [networkType, setNetworkType] = useState<string>('unknown');
  const [isOptimizing, setIsOptimizing] = useState(false);
  
  const { isLowPower, isSlowNetwork, shouldOptimize } = usePerformanceMonitoring();
  const { isOnline, syncQueueLength, storageQuota, dataManager } = useMobileData();

  // Battery monitoring
  useEffect(() => {
    const updateBatteryInfo = (event: CustomEvent) => {
      const { level, charging } = event.detail;
      setBatteryLevel(Math.round(level * 100));
      setIsCharging(charging);
    };

    window.addEventListener('powerModeChange', updateBatteryInfo as EventListener);
    return () => window.removeEventListener('powerModeChange', updateBatteryInfo as EventListener);
  }, []);

  // Network monitoring
  useEffect(() => {
    const updateNetworkInfo = (event: CustomEvent) => {
      setNetworkType(event.detail.networkType);
    };

    window.addEventListener('networkChange', updateNetworkInfo as EventListener);
    return () => window.removeEventListener('networkChange', updateNetworkInfo as EventListener);
  }, []);

  // Performance metrics monitoring
  useEffect(() => {
    const updateMetrics = () => {
      // Simulate performance metrics
      // In a real app, these would come from actual performance monitoring
      setMetrics({
        fps: shouldOptimize ? Math.floor(Math.random() * 20) + 30 : Math.floor(Math.random() * 10) + 55,
        memoryUsage: Math.floor(Math.random() * 30) + (shouldOptimize ? 60 : 40),
        loadTime: shouldOptimize ? Math.floor(Math.random() * 1000) + 1500 : Math.floor(Math.random() * 500) + 200,
        cacheHitRate: Math.floor(Math.random() * 15) + 80
      });
    };

    updateMetrics();
    const interval = setInterval(updateMetrics, 5000);
    return () => clearInterval(interval);
  }, [shouldOptimize]);

  const handleOptimize = async () => {
    setIsOptimizing(true);
    
    try {
      // Clear expired data
      await dataManager.clearExpiredData();
      
      // Optimize storage
      await dataManager.optimizeStorage();
      
      // Trigger custom optimization callback
      onOptimize?.();
      
      // Simulate optimization time
      await new Promise(resolve => setTimeout(resolve, 2000));
    } finally {
      setIsOptimizing(false);
    }
  };

  const handleClearCache = async () => {
    await dataManager.clear();
  };

  const getBatteryColor = (level: number | null) => {
    if (level === null) return 'text-gray-500';
    if (level > 50) return 'text-green-500';
    if (level > 20) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getNetworkColor = (type: string) => {
    switch (type) {
      case '4g':
      case '5g':
        return 'text-green-500';
      case '3g':
        return 'text-yellow-500';
      case 'slow-2g':
      case '2g':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  const getPerformanceStatus = () => {
    if (shouldOptimize) {
      return {
        status: 'warning',
        message: isLowPower ? 'Low Battery Mode' : 'Slow Network Detected',
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
        borderColor: 'border-yellow-200 dark:border-yellow-800'
      };
    }
    
    return {
      status: 'good',
      message: 'Performance Optimal',
      color: 'text-green-600',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800'
    };
  };

  const performanceStatus = getPerformanceStatus();

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Performance Status */}
      <motion.div
        className={`p-4 rounded-lg border ${performanceStatus.bgColor} ${performanceStatus.borderColor}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            {performanceStatus.status === 'warning' ? (
              <AlertTriangle className={`w-5 h-5 ${performanceStatus.color}`} />
            ) : (
              <CheckCircle className={`w-5 h-5 ${performanceStatus.color}`} />
            )}
            <div>
              <h3 className={`font-semibold ${performanceStatus.color}`}>
                {performanceStatus.message}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {shouldOptimize ? 'Optimizations are active' : 'All systems running smoothly'}
              </p>
            </div>
          </div>
          
          <motion.button
            onClick={handleOptimize}
            disabled={isOptimizing}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isOptimizing ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Zap className="w-4 h-4" />
            )}
          </motion.button>
        </div>
      </motion.div>

      {/* System Status Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Battery Status */}
        <motion.div
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex items-center justify-between mb-2">
            <Battery className={`w-5 h-5 ${getBatteryColor(batteryLevel)}`} />
            <span className="text-sm text-gray-500 dark:text-gray-400">
              {isCharging ? 'Charging' : 'Battery'}
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {batteryLevel !== null ? `${batteryLevel}%` : 'N/A'}
          </div>
          {batteryLevel !== null && (
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  batteryLevel > 50 ? 'bg-green-500' : batteryLevel > 20 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${batteryLevel}%` }}
              />
            </div>
          )}
        </motion.div>

        {/* Network Status */}
        <motion.div
          className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-2">
            {isOnline ? (
              <Wifi className={`w-5 h-5 ${getNetworkColor(networkType)}`} />
            ) : (
              <WifiOff className="w-5 h-5 text-red-500" />
            )}
            <span className="text-sm text-gray-500 dark:text-gray-400">
              Network
            </span>
          </div>
          <div className="text-2xl font-bold text-gray-900 dark:text-white">
            {isOnline ? networkType.toUpperCase() : 'Offline'}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {syncQueueLength > 0 ? `${syncQueueLength} pending` : 'Synced'}
          </div>
        </motion.div>
      </div>

      {/* Performance Metrics */}
      <motion.div
        className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.3 }}
      >
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          Performance Metrics
        </h3>
        
        <div className="grid grid-cols-2 gap-4">
          {/* FPS */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.fps}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">FPS</div>
            <div className="flex items-center justify-center mt-1">
              {metrics.fps >= 50 ? (
                <TrendingUp className="w-4 h-4 text-green-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-red-500" />
              )}
            </div>
          </div>

          {/* Memory Usage */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.memoryUsage}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Memory</div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div
                className={`h-2 rounded-full transition-all duration-300 ${
                  metrics.memoryUsage < 60 ? 'bg-green-500' : metrics.memoryUsage < 80 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${metrics.memoryUsage}%` }}
              />
            </div>
          </div>

          {/* Load Time */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.loadTime}ms
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Load Time</div>
            <div className="flex items-center justify-center mt-1">
              <Clock className={`w-4 h-4 ${
                metrics.loadTime < 1000 ? 'text-green-500' : metrics.loadTime < 2000 ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
          </div>

          {/* Cache Hit Rate */}
          <div className="text-center">
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {metrics.cacheHitRate}%
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">Cache Hit</div>
            <div className="flex items-center justify-center mt-1">
              <Database className={`w-4 h-4 ${
                metrics.cacheHitRate > 80 ? 'text-green-500' : metrics.cacheHitRate > 60 ? 'text-yellow-500' : 'text-red-500'
              }`} />
            </div>
          </div>
        </div>
      </motion.div>

      {/* Storage Information */}
      {storageQuota && (
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Storage Usage
            </h3>
            <motion.button
              onClick={handleClearCache}
              className="p-2 text-gray-500 hover:text-red-500 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <Trash2 className="w-4 h-4" />
            </motion.button>
          </div>
          
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Used</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(storageQuota.usage / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-600 dark:text-gray-400">Available</span>
              <span className="font-medium text-gray-900 dark:text-white">
                {(storageQuota.available / (1024 * 1024)).toFixed(1)} MB
              </span>
            </div>
            
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div
                className={`h-3 rounded-full transition-all duration-300 ${
                  (storageQuota.usage / storageQuota.quota) < 0.7 
                    ? 'bg-green-500' 
                    : (storageQuota.usage / storageQuota.quota) < 0.9 
                    ? 'bg-yellow-500' 
                    : 'bg-red-500'
                }`}
                style={{ width: `${(storageQuota.usage / storageQuota.quota) * 100}%` }}
              />
            </div>
            
            <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
              {((storageQuota.usage / storageQuota.quota) * 100).toFixed(1)}% of quota used
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default MobilePerformanceDashboard;