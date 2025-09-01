import React from 'react';
import { Wifi, WifiOff, AlertCircle, Loader2 } from 'lucide-react';
import { useConnectionState } from '../../store/useWebSocketStore';
import { cn } from '../../lib/utils';

interface ConnectionStatusProps {
  className?: string;
  showText?: boolean;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ 
  className,
  showText = true 
}) => {
  const connectionState = useConnectionState();
  
  const getStatusConfig = () => {
    switch (connectionState.status) {
      case 'connected':
        return {
          icon: Wifi,
          text: 'Connected',
          color: 'text-green-500',
          bgColor: 'bg-green-500/10',
          borderColor: 'border-green-500/20',
          pulse: false,
        };
      case 'connecting':
        return {
          icon: Loader2,
          text: 'Connecting...',
          color: 'text-yellow-500',
          bgColor: 'bg-yellow-500/10',
          borderColor: 'border-yellow-500/20',
          pulse: true,
        };
      case 'error':
        return {
          icon: AlertCircle,
          text: connectionState.error || 'Connection Error',
          color: 'text-red-500',
          bgColor: 'bg-red-500/10',
          borderColor: 'border-red-500/20',
          pulse: false,
        };
      default:
        return {
          icon: WifiOff,
          text: connectionState.reconnectAttempts > 0 
            ? `Reconnecting... (${connectionState.reconnectAttempts})` 
            : 'Disconnected',
          color: 'text-gray-500',
          bgColor: 'bg-gray-500/10',
          borderColor: 'border-gray-500/20',
          pulse: connectionState.reconnectAttempts > 0,
        };
    }
  };
  
  const config = getStatusConfig();
  const Icon = config.icon;
  
  return (
    <div className={cn(
      'flex items-center gap-2 px-3 py-1.5 rounded-lg border backdrop-blur-sm transition-all duration-300',
      config.bgColor,
      config.borderColor,
      className
    )}>
      <Icon 
        className={cn(
          'h-4 w-4 transition-colors duration-300',
          config.color,
          config.pulse && 'animate-spin',
          connectionState.status === 'connected' && 'animate-pulse'
        )} 
      />
      {showText && (
        <span className={cn(
          'text-sm font-medium transition-colors duration-300',
          config.color
        )}>
          {config.text}
        </span>
      )}
      {connectionState.lastConnected && connectionState.status === 'connected' && (
        <div className="flex items-center gap-1">
          <div className={cn(
            'h-2 w-2 rounded-full animate-pulse',
            'bg-green-500'
          )} />
        </div>
      )}
    </div>
  );
};

export default ConnectionStatus;