import React, { createContext, useContext, useEffect, ReactNode } from 'react';
import { useWebSocket } from '../../hooks/useWebSocket';
import { useWebSocketStore } from '../../store/useWebSocketStore';
import { WebSocketMessage, MarketData, AccountBalance, Trade } from '../../types';

interface WebSocketContextType {
  isConnected: boolean;
  sendMessage: (message: any) => void;
  connect: () => void;
  disconnect: () => void;
}

const WebSocketContext = createContext<WebSocketContextType | null>(null);

interface WebSocketProviderProps {
  children: ReactNode;
  url?: string;
}

// Mock WebSocket URL - in production, this would come from environment variables
// Using a non-existent URL to simulate development mode without WebSocket server
const DEFAULT_WS_URL = process.env.NODE_ENV === 'production' ? 'wss://api.example.com/ws' : null;

export const WebSocketProvider: React.FC<WebSocketProviderProps> = ({ 
  children, 
  url = DEFAULT_WS_URL 
}) => {
  const {
    setConnectionState,
    updatePrices,
    updateBalance,
    updatePositions,
    updateSinglePrice,
  } = useWebSocketStore();

  const handleMessage = (message: WebSocketMessage) => {
    console.log('Received WebSocket message:', message);
    
    switch (message.type) {
      case 'price_update':
        if (message.data && typeof message.data === 'object') {
          const priceData = message.data as Record<string, MarketData>;
          updatePrices(priceData);
        }
        break;
        
      case 'single_price':
        if (message.data && message.symbol) {
          const priceData = message.data as MarketData;
          updateSinglePrice(message.symbol, priceData);
        }
        break;
        
      case 'balance_update':
        if (message.data) {
          const balanceData = message.data as AccountBalance;
          updateBalance(balanceData);
        }
        break;
        
      case 'positions_update':
        if (message.data && Array.isArray(message.data)) {
          const positionsData = message.data as Trade[];
          updatePositions(positionsData);
        }
        break;
        
      case 'pong':
        // Handle heartbeat response
        console.log('Received pong from server');
        break;
        
      default:
        console.log('Unknown message type:', message.type);
    }
  };

  const handleConnect = () => {
    console.log('WebSocket connected successfully');
    // Request initial data
    sendMessage({ type: 'subscribe', channels: ['prices', 'balance', 'positions'] });
  };

  const handleDisconnect = () => {
    console.log('WebSocket disconnected');
  };

  const handleError = (error: Event) => {
    console.warn('WebSocket connection failed - using mock data mode');
    // In development, we expect WebSocket to fail, so we don't treat it as an error
  };

  // Only attempt WebSocket connection if URL is provided and valid
  const shouldUseWebSocket = url && url !== 'null' && DEFAULT_WS_URL;
  
  const { connectionState, sendMessage, connect, disconnect, isConnected } = useWebSocket({
    url: shouldUseWebSocket ? url : 'ws://mock-disabled',
    onMessage: handleMessage,
    onConnect: handleConnect,
    onDisconnect: handleDisconnect,
    onError: handleError,
    reconnectInterval: shouldUseWebSocket ? 3000 : 10000, // Longer interval for mock mode
    maxReconnectAttempts: shouldUseWebSocket ? 5 : 1, // Fewer attempts for mock mode
    heartbeatInterval: 30000,
  });

  // Update connection state in store with deep comparison to prevent infinite loops
  useEffect(() => {
    const currentState = useWebSocketStore.getState().connectionState;
    
    // Only update if the status or reconnectAttempts actually changed
    if (currentState.status !== connectionState.status || 
        currentState.reconnectAttempts !== connectionState.reconnectAttempts ||
        currentState.error !== connectionState.error) {
      setConnectionState(connectionState);
    }
  }, [connectionState.status, connectionState.reconnectAttempts, connectionState.error, setConnectionState]);

  // Mock data simulation when WebSocket is not available
  useEffect(() => {
    if (!isConnected) {
      // Simulate real-time data for development
      const mockDataInterval = setInterval(() => {
        // Mock price updates
        const mockPrices = {
          EURUSD: {
            symbol: 'EURUSD',
            bid: 1.0850 + (Math.random() - 0.5) * 0.01,
            ask: 1.0852 + (Math.random() - 0.5) * 0.01,
            spread: 0.0002,
            timestamp: new Date().toISOString(),
            change: (Math.random() - 0.5) * 0.002,
            changePercent: (Math.random() - 0.5) * 0.2,
          },
          GBPUSD: {
            symbol: 'GBPUSD',
            bid: 1.2650 + (Math.random() - 0.5) * 0.01,
            ask: 1.2652 + (Math.random() - 0.5) * 0.01,
            spread: 0.0002,
            timestamp: new Date().toISOString(),
            change: (Math.random() - 0.5) * 0.002,
            changePercent: (Math.random() - 0.5) * 0.2,
          },
          USDJPY: {
            symbol: 'USDJPY',
            bid: 148.50 + (Math.random() - 0.5) * 1.0,
            ask: 148.52 + (Math.random() - 0.5) * 1.0,
            spread: 0.02,
            timestamp: new Date().toISOString(),
            change: (Math.random() - 0.5) * 0.5,
            changePercent: (Math.random() - 0.5) * 0.3,
          },
        };
        
        updatePrices(mockPrices);
        
        // Mock balance update
        const mockBalance: AccountBalance = {
          balance: 10000 + (Math.random() - 0.5) * 1000,
          equity: 10500 + (Math.random() - 0.5) * 1000,
          margin: 2000 + (Math.random() - 0.5) * 500,
          freeMargin: 8500 + (Math.random() - 0.5) * 500,
          marginLevel: 525 + (Math.random() - 0.5) * 50,
          currency: 'USD',
          dailyPnL: (Math.random() - 0.5) * 500,
          totalPnL: (Math.random() - 0.5) * 2000,
          totalPnLPercentage: (Math.random() - 0.5) * 20,
        };
        
        updateBalance(mockBalance);
      }, 2000); // Update every 2 seconds
      
      return () => clearInterval(mockDataInterval);
    }
  }, [isConnected]); // Removed updatePrices and updateBalance from dependencies

  const contextValue: WebSocketContextType = {
    isConnected,
    sendMessage,
    connect,
    disconnect,
  };

  return (
    <WebSocketContext.Provider value={contextValue}>
      {children}
    </WebSocketContext.Provider>
  );
};

export const useWebSocketContext = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useWebSocketContext must be used within a WebSocketProvider');
  }
  return context;
};

export default WebSocketProvider;