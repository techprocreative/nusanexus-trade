import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, X, Smartphone, Monitor, Wifi, WifiOff } from 'lucide-react';
import { 
  showPWAInstallPrompt, 
  isPWAInstalled, 
  isPWAInstallable,
  networkStatus,
  NetworkStatus
} from '../../utils/pwa';

interface PWAInstallPromptProps {
  onInstall?: () => void;
  onDismiss?: () => void;
}

export const PWAInstallPrompt: React.FC<PWAInstallPromptProps> = ({
  onInstall,
  onDismiss
}) => {
  const [showPrompt, setShowPrompt] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [installable, setInstallable] = useState(false);

  useEffect(() => {
    // Check if PWA is installable and not already installed
    const checkInstallability = () => {
      const canInstall = isPWAInstallable() && !isPWAInstalled();
      setInstallable(canInstall);
      
      // Show prompt after a delay if installable
      if (canInstall) {
        const timer = setTimeout(() => {
          setShowPrompt(true);
        }, 3000); // Show after 3 seconds
        
        return () => clearTimeout(timer);
      }
    };

    checkInstallability();
    
    // Listen for network status changes
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    networkStatus.addListener(handleNetworkChange);
    
    return () => {
      networkStatus.removeListener(handleNetworkChange);
    };
  }, []);

  const handleInstall = async () => {
    setIsInstalling(true);
    
    try {
      const installed = await showPWAInstallPrompt();
      
      if (installed) {
        setShowPrompt(false);
        onInstall?.();
        
        // Haptic feedback for successful installation
        if ('vibrate' in navigator) {
          navigator.vibrate([100, 50, 100]);
        }
      }
    } catch (error) {
      console.error('Installation failed:', error);
    } finally {
      setIsInstalling(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    onDismiss?.();
    
    // Don't show again for this session
    sessionStorage.setItem('pwa-prompt-dismissed', 'true');
  };

  // Don't show if already dismissed this session
  if (sessionStorage.getItem('pwa-prompt-dismissed')) {
    return null;
  }

  // Don't show if not installable or already installed
  if (!installable || isPWAInstalled()) {
    return null;
  }

  return (
    <AnimatePresence>
      {showPrompt && (
        <motion.div
          initial={{ opacity: 0, y: 100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 100 }}
          className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-3 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Smartphone className="w-5 h-5" />
                  <span className="font-semibold">Install NusaNexus</span>
                </div>
                <button
                  onClick={handleDismiss}
                  className="p-1 hover:bg-white/20 rounded transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="p-4">
              <div className="mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                  Get the full experience
                </h3>
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  Install NusaNexus for faster access, offline trading, and push notifications.
                </p>
              </div>

              {/* Features */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Monitor className="w-4 h-4 text-blue-500" />
                  <span>Works offline</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  <Download className="w-4 h-4 text-green-500" />
                  <span>Instant loading</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                  {isOnline ? (
                    <Wifi className="w-4 h-4 text-green-500" />
                  ) : (
                    <WifiOff className="w-4 h-4 text-red-500" />
                  )}
                  <span>{isOnline ? 'Connected' : 'Offline mode available'}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex space-x-2">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleInstall}
                  disabled={isInstalling}
                  className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2"
                >
                  {isInstalling ? (
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Download className="w-4 h-4" />
                  )}
                  <span>{isInstalling ? 'Installing...' : 'Install'}</span>
                </motion.button>
                
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleDismiss}
                  className="px-4 py-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Later
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

// PWA Status Indicator Component
export const PWAStatusIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(networkStatus.isOnline());
  const [isPWA, setIsPWA] = useState(isPWAInstalled());

  useEffect(() => {
    const handleNetworkChange = (online: boolean) => {
      setIsOnline(online);
    };
    
    networkStatus.addListener(handleNetworkChange);
    setIsPWA(isPWAInstalled());
    
    return () => {
      networkStatus.removeListener(handleNetworkChange);
    };
  }, []);

  return (
    <div className="flex items-center space-x-2">
      {/* Network Status */}
      <div className="flex items-center space-x-1">
        {isOnline ? (
          <Wifi className="w-4 h-4 text-green-500" />
        ) : (
          <WifiOff className="w-4 h-4 text-red-500" />
        )}
        <span className="text-xs text-gray-500 dark:text-gray-400">
          {isOnline ? 'Online' : 'Offline'}
        </span>
      </div>

      {/* PWA Status */}
      {isPWA && (
        <div className="flex items-center space-x-1">
          <div className="w-2 h-2 bg-blue-500 rounded-full" />
          <span className="text-xs text-gray-500 dark:text-gray-400">PWA</span>
        </div>
      )}
    </div>
  );
};

// Update Available Notification
export const PWAUpdateNotification: React.FC = () => {
  const [showUpdate, setShowUpdate] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setShowUpdate(true);
      });
    }
  }, []);

  const handleUpdate = async () => {
    setIsUpdating(true);
    
    try {
      // Refresh the page to load new version
      window.location.reload();
    } catch (error) {
      console.error('Update failed:', error);
      setIsUpdating(false);
    }
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  return (
    <AnimatePresence>
      {showUpdate && (
        <motion.div
          initial={{ opacity: 0, y: -100 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -100 }}
          className="fixed top-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96"
        >
          <div className="bg-blue-600 text-white rounded-lg shadow-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Update Available</h3>
              <button
                onClick={handleDismiss}
                className="p-1 hover:bg-white/20 rounded transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-blue-100 text-sm mb-3">
              A new version of NusaNexus is available with improvements and bug fixes.
            </p>
            
            <div className="flex space-x-2">
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-white text-blue-600 px-3 py-2 rounded font-medium transition-colors flex items-center justify-center space-x-2"
              >
                {isUpdating ? (
                  <div className="w-4 h-4 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                <span>{isUpdating ? 'Updating...' : 'Update Now'}</span>
              </motion.button>
              
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleDismiss}
                className="px-3 py-2 text-blue-100 hover:bg-white/20 rounded transition-colors"
              >
                Later
              </motion.button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};