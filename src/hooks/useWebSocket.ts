import { useState, useEffect, useRef, useCallback } from 'react';
import { WebSocketConnectionState, WebSocketMessage, WebSocketConfig } from '../types';

interface UseWebSocketOptions {
  url: string;
  onMessage?: (message: WebSocketMessage) => void;
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Event) => void;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  heartbeatInterval?: number;
}

interface UseWebSocketReturn {
  connectionState: WebSocketConnectionState;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
  isConnected: boolean;
}

const DEFAULT_CONFIG: Omit<WebSocketConfig, 'url'> = {
  reconnectInterval: 3000,
  maxReconnectAttempts: 5,
  heartbeatInterval: 30000,
};

export const useWebSocket = (options: UseWebSocketOptions): UseWebSocketReturn => {
  const {
    url,
    onMessage,
    onConnect,
    onDisconnect,
    onError,
    reconnectInterval = DEFAULT_CONFIG.reconnectInterval,
    maxReconnectAttempts = DEFAULT_CONFIG.maxReconnectAttempts,
    heartbeatInterval = DEFAULT_CONFIG.heartbeatInterval,
  } = options;

  const [connectionState, setConnectionState] = useState<WebSocketConnectionState>({
    status: 'disconnected',
    reconnectAttempts: 0,
  });

  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const isManualDisconnectRef = useRef(false);
  
  // Store callbacks in refs to avoid dependency issues
  const onMessageRef = useRef(onMessage);
  const onConnectRef = useRef(onConnect);
  const onDisconnectRef = useRef(onDisconnect);
  const onErrorRef = useRef(onError);
  
  // Update refs when callbacks change
  useEffect(() => {
    onMessageRef.current = onMessage;
    onConnectRef.current = onConnect;
    onDisconnectRef.current = onDisconnect;
    onErrorRef.current = onError;
  });

  const clearTimeouts = () => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
      heartbeatIntervalRef.current = null;
    }
  };

  const startHeartbeat = useCallback(() => {
    if (heartbeatIntervalRef.current) {
      clearInterval(heartbeatIntervalRef.current);
    }
    
    heartbeatIntervalRef.current = setInterval(() => {
      if (wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(JSON.stringify({ type: 'ping', timestamp: new Date().toISOString() }));
      }
    }, heartbeatInterval);
  }, [heartbeatInterval]);

  const connectRef = useRef<() => void>();
  
  connectRef.current = () => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    // Skip connection if URL indicates mock mode
    if (url.includes('mock-disabled')) {
      setConnectionState({
        status: 'disconnected',
        reconnectAttempts: 0,
        error: 'WebSocket disabled in development mode',
      });
      return;
    }

    isManualDisconnectRef.current = false;
    setConnectionState(prev => ({ ...prev, status: 'connecting' }));

    try {
      wsRef.current = new WebSocket(url);

      wsRef.current.onopen = () => {
        console.log('WebSocket connected');
        reconnectAttemptsRef.current = 0;
        setConnectionState({
          status: 'connected',
          lastConnected: new Date().toISOString(),
          reconnectAttempts: 0,
        });
        startHeartbeat();
        onConnectRef.current?.();
      };

      wsRef.current.onmessage = (event) => {
        try {
          const message: WebSocketMessage = JSON.parse(event.data);
          onMessageRef.current?.(message);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      wsRef.current.onclose = (event) => {
        console.log('WebSocket disconnected:', event.code, event.reason);
        clearTimeouts();
        
        setConnectionState(prev => ({
          ...prev,
          status: 'disconnected',
          reconnectAttempts: reconnectAttemptsRef.current,
        }));
        
        onDisconnectRef.current?.();

        // Auto-reconnect if not manually disconnected and within retry limits
        if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, reconnectInterval);
        }
      };

      wsRef.current.onerror = (error) => {
        console.error('WebSocket error:', error);
        clearTimeouts();
        
        setConnectionState(prev => ({
          ...prev,
          status: 'error',
          error: 'Connection error occurred',
          reconnectAttempts: reconnectAttemptsRef.current,
        }));
        
        onErrorRef.current?.(error);
        
        // Auto-reconnect on error if not manually disconnected and within retry limits
        if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
          reconnectAttemptsRef.current += 1;
          reconnectTimeoutRef.current = setTimeout(() => {
            connectRef.current?.();
          }, reconnectInterval);
        }
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      setConnectionState(prev => ({
        ...prev,
        status: 'error',
        error: 'Failed to create connection',
        reconnectAttempts: reconnectAttemptsRef.current,
      }));
      
      // Auto-reconnect on connection creation failure if not manually disconnected and within retry limits
      if (!isManualDisconnectRef.current && reconnectAttemptsRef.current < maxReconnectAttempts) {
        reconnectAttemptsRef.current += 1;
        reconnectTimeoutRef.current = setTimeout(() => {
          connectRef.current?.();
        }, reconnectInterval);
      }
    }
  };
  
  const connect = useCallback(() => {
    connectRef.current?.();
  }, []);

  const disconnect = useCallback(() => {
    isManualDisconnectRef.current = true;
    clearTimeouts();
    
    if (wsRef.current) {
      wsRef.current.close(1000, 'Manual disconnect');
      wsRef.current = null;
    }
    
    setConnectionState({
      status: 'disconnected',
      reconnectAttempts: 0,
    });
  }, []);

  const sendMessage = useCallback((message: any) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        ...message,
        timestamp: new Date().toISOString(),
      }));
    } else {
      console.warn('WebSocket is not connected. Message not sent:', message);
    }
  }, []);

  // Auto-connect on mount
  useEffect(() => {
    connectRef.current?.();
    
    return () => {
      isManualDisconnectRef.current = true;
      clearTimeouts();
      
      if (wsRef.current) {
        wsRef.current.close(1000, 'Component unmount');
        wsRef.current = null;
      }
    };
  }, [url]); // Only depend on URL changes

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      clearTimeouts();
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  return {
    connectionState,
    sendMessage,
    connect,
    disconnect,
    isConnected: connectionState.status === 'connected',
  };
};

export default useWebSocket;