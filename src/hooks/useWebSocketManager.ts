import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketManager, createWebSocketManager, getWebSocketManager } from '../lib/websocketManager';
import { WebSocketMessage, WebSocketConfig } from '../types/api';

interface UseWebSocketManagerOptions {
  config: WebSocketConfig;
  autoConnect?: boolean;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: (event?: { code: number; reason: string }) => void;
  onError?: (error: Event) => void;
  onStateChange?: (state: { state: string; error?: any }) => void;
}

interface UseWebSocketManagerReturn {
  manager: WebSocketManager | null;
  connectionState: string;
  isConnected: boolean;
  stats: {
    messagesReceived: number;
    messagesSent: number;
    reconnections: number;
    lastActivity: string | null;
  };
  queueSize: number;
  subscriptionCount: number;
  connect: () => Promise<void>;
  disconnect: () => void;
  sendMessage: (message: any) => boolean;
  subscribe: (channel: string, handler: (message: WebSocketMessage) => void, filter?: (message: WebSocketMessage) => boolean) => string;
  unsubscribe: (subscriptionId: string) => void;
}

const defaultStats = {
  messagesReceived: 0,
  messagesSent: 0,
  reconnections: 0,
  lastActivity: null,
};

export const useWebSocketManager = (options: UseWebSocketManagerOptions): UseWebSocketManagerReturn => {
  const {
    config,
    autoConnect = true,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    onStateChange,
  } = options;

  const [connectionState, setConnectionState] = useState<string>('disconnected');
  const [stats, setStats] = useState(defaultStats);
  const [queueSize, setQueueSize] = useState(0);
  const [subscriptionCount, setSubscriptionCount] = useState(0);
  
  const managerRef = useRef<WebSocketManager | null>(null);
  const callbacksRef = useRef({ onMessage, onConnect, onDisconnect, onError, onStateChange });
  
  // Update callbacks ref when they change
  useEffect(() => {
    callbacksRef.current = { onMessage, onConnect, onDisconnect, onError, onStateChange };
  }, [onMessage, onConnect, onDisconnect, onError, onStateChange]);

  // Initialize manager
  useEffect(() => {
    // Check if there's already a manager with the same URL
    const existingManager = getWebSocketManager();
    if (existingManager && existingManager.getConnectionState() !== 'disconnected') {
      // Reuse existing manager if it's for the same URL
      managerRef.current = existingManager;
    } else {
      // Create new manager
      managerRef.current = createWebSocketManager(config);
    }

    const manager = managerRef.current;
    if (!manager) return;

    // Set up event listeners
    const handleMessage = (message: WebSocketMessage) => {
      callbacksRef.current.onMessage?.(message);
    };

    const handleConnect = () => {
      setConnectionState('connected');
      updateStats();
      callbacksRef.current.onConnect?.();
    };

    const handleDisconnect = (event?: { code: number; reason: string }) => {
      setConnectionState('disconnected');
      updateStats();
      callbacksRef.current.onDisconnect?.(event);
    };

    const handleError = (error: Event) => {
      setConnectionState('error');
      updateStats();
      callbacksRef.current.onError?.(error);
    };

    const handleStateChange = (state: { state: string; error?: any }) => {
      setConnectionState(state.state);
      updateStats();
      callbacksRef.current.onStateChange?.(state);
    };

    const updateStats = () => {
      if (manager) {
        setStats(manager.getStats());
        setQueueSize(manager.getQueueSize());
        setSubscriptionCount(manager.getSubscriptionCount());
      }
    };

    // Register event listeners
    manager.on('message', handleMessage);
    manager.on('connect', handleConnect);
    manager.on('disconnect', handleDisconnect);
    manager.on('error', handleError);
    manager.on('stateChange', handleStateChange);

    // Initial state update
    setConnectionState(manager.getConnectionState());
    updateStats();

    // Auto-connect if enabled
    if (autoConnect && manager.getConnectionState() === 'disconnected') {
      manager.connect().catch(error => {
        console.error('Auto-connect failed:', error);
      });
    }

    // Cleanup function
    return () => {
      if (manager) {
        manager.off('message', handleMessage);
        manager.off('connect', handleConnect);
        manager.off('disconnect', handleDisconnect);
        manager.off('error', handleError);
        manager.off('stateChange', handleStateChange);
      }
    };
  }, [config.url, autoConnect]); // Only recreate when URL changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      // Don't destroy the manager on unmount as it might be shared
      // Only clean up event listeners (handled in the previous effect)
    };
  }, []);

  // Memoized functions
  const connect = useCallback(async () => {
    if (managerRef.current) {
      await managerRef.current.connect();
    }
  }, []);

  const disconnect = useCallback(() => {
    if (managerRef.current) {
      managerRef.current.disconnect();
    }
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (managerRef.current) {
      const success = managerRef.current.sendMessage(message);
      // Update stats after sending
      setStats(managerRef.current.getStats());
      setQueueSize(managerRef.current.getQueueSize());
      return success;
    }
    return false;
  }, []);

  const subscribe = useCallback((channel: string, handler: (message: WebSocketMessage) => void, filter?: (message: WebSocketMessage) => boolean) => {
    if (managerRef.current) {
      const subscriptionId = managerRef.current.subscribe(channel, handler, filter);
      setSubscriptionCount(managerRef.current.getSubscriptionCount());
      return subscriptionId;
    }
    return '';
  }, []);

  const unsubscribe = useCallback((subscriptionId: string) => {
    if (managerRef.current) {
      managerRef.current.unsubscribe(subscriptionId);
      setSubscriptionCount(managerRef.current.getSubscriptionCount());
    }
  }, []);

  return {
    manager: managerRef.current,
    connectionState,
    isConnected: connectionState === 'connected',
    stats,
    queueSize,
    subscriptionCount,
    connect,
    disconnect,
    sendMessage,
    subscribe,
    unsubscribe,
  };
};

// Specialized hooks for common use cases
export const useMarketDataWebSocket = (config: WebSocketConfig) => {
  return useWebSocketManager({
    config,
    autoConnect: true,
    onMessage: (message) => {
      // Handle market data specific messages
      if (message.type === 'market_data') {
        console.log('Market data received:', message.data);
      }
    },
  });
};

export const useTradingWebSocket = (config: WebSocketConfig) => {
  return useWebSocketManager({
    config,
    autoConnect: true,
    onMessage: (message) => {
      // Handle trading specific messages
      if (message.type === 'order_update' || message.type === 'position_update') {
        console.log('Trading update received:', message.data);
      }
    },
  });
};

export const useNotificationWebSocket = (config: WebSocketConfig) => {
  return useWebSocketManager({
    config,
    autoConnect: true,
    onMessage: (message) => {
      // Handle notification messages
      if (message.type === 'notification') {
        console.log('Notification received:', message.data);
      }
    },
  });
};

export default useWebSocketManager;