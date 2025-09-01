import React from 'react';
import { 
  Activity, 
  Clock, 
  Server, 
  Zap
} from 'lucide-react';
import { useConnectionStatus, useSidebarCollapsed } from '../../store';
import { cn } from '../../utils/cn';

export const Footer: React.FC = () => {
  const connectionStatus = useConnectionStatus();
  const sidebarCollapsed = useSidebarCollapsed();

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  const getCurrentTime = () => {
    return new Date().toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <footer
      className={cn(
        'fixed bottom-0 right-0 z-20 h-12 bg-background-secondary border-t border-gray-700 transition-all duration-300',
        sidebarCollapsed ? 'left-16' : 'left-60'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left Section - Platform Info */}
        <div className="flex items-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Activity className="h-3 w-3" />
            <span>NusaNexus Trading Platform v1.0.0</span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Server className={cn(
              'h-3 w-3',
              connectionStatus.isConnected ? 'text-green-400' : 'text-red-400'
            )} />
            <span>
              Server: {connectionStatus.isConnected ? 'Online' : 'Offline'}
            </span>
          </div>
          
          <div className="flex items-center space-x-2">
            <Zap className="h-3 w-3 text-yellow-400" />
            <span>Market: Open</span>
          </div>
        </div>

        {/* Right Section - Time and Status */}
        <div className="flex items-center space-x-6 text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Clock className="h-3 w-3" />
            <span>Local: {getCurrentTime()}</span>
          </div>
          
          {connectionStatus.lastUpdate && (
            <div className="flex items-center space-x-2">
              <span>Last Update: {formatTime(connectionStatus.lastUpdate)}</span>
            </div>
          )}
          
          <div className="text-gray-500">
            © 2024 NusaNexus Technologies
          </div>
        </div>
      </div>
    </footer>
  );
};