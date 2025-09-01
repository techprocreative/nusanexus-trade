import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import { WebSocketConnectionState, RealTimeData, MarketData, AccountBalance, Trade } from '../types';

interface WebSocketState {
  // Connection state
  connectionState: WebSocketConnectionState;
  
  // Real-time data
  realTimeData: RealTimeData;
  
  // Throttling
  lastUpdateTime: Record<string, number>;
  updateThrottle: number; // milliseconds
  
  // Actions
  setConnectionState: (state: WebSocketConnectionState) => void;
  updatePrices: (prices: Record<string, MarketData>) => void;
  updateBalance: (balance: AccountBalance) => void;
  updatePositions: (positions: Trade[]) => void;
  updateSinglePrice: (symbol: string, price: MarketData) => void;
  
  // Optimistic updates
  addOptimisticTrade: (trade: Trade) => void;
  removeOptimisticTrade: (tradeId: string) => void;
  
  // Throttling helpers
  shouldUpdate: (key: string) => boolean;
  markUpdated: (key: string) => void;
  
  // Reset
  reset: () => void;
}

const initialRealTimeData: RealTimeData = {
  prices: {},
  balance: {
    balance: 0,
    equity: 0,
    margin: 0,
    freeMargin: 0,
    marginLevel: 0,
    currency: 'USD',
    dailyPnL: 0,
    totalPnL: 0,
    totalPnLPercentage: 0,
  },
  positions: [],
  lastUpdate: new Date().toISOString(),
};

const initialConnectionState: WebSocketConnectionState = {
  status: 'disconnected',
  reconnectAttempts: 0,
};

export const useWebSocketStore = create<WebSocketState>()(subscribeWithSelector((set, get) => ({
  connectionState: initialConnectionState,
  realTimeData: initialRealTimeData,
  lastUpdateTime: {},
  updateThrottle: 1000, // 1 second throttle
  
  setConnectionState: (connectionState) => {
    set({ connectionState });
  },
  
  updatePrices: (prices) => {
    const state = get();
    if (!state.shouldUpdate('prices')) return;
    
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        prices: { ...state.realTimeData.prices, ...prices },
        lastUpdate: new Date().toISOString(),
      },
    }));
    
    state.markUpdated('prices');
  },
  
  updateBalance: (balance) => {
    const state = get();
    if (!state.shouldUpdate('balance')) return;
    
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        balance,
        lastUpdate: new Date().toISOString(),
      },
    }));
    
    state.markUpdated('balance');
  },
  
  updatePositions: (positions) => {
    const state = get();
    if (!state.shouldUpdate('positions')) return;
    
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        positions,
        lastUpdate: new Date().toISOString(),
      },
    }));
    
    state.markUpdated('positions');
  },
  
  updateSinglePrice: (symbol, price) => {
    const state = get();
    const key = `price_${symbol}`;
    if (!state.shouldUpdate(key)) return;
    
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        prices: {
          ...state.realTimeData.prices,
          [symbol]: price,
        },
        lastUpdate: new Date().toISOString(),
      },
    }));
    
    state.markUpdated(key);
  },
  
  addOptimisticTrade: (trade) => {
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        positions: [...state.realTimeData.positions, trade],
        lastUpdate: new Date().toISOString(),
      },
    }));
  },
  
  removeOptimisticTrade: (tradeId) => {
    set((state) => ({
      realTimeData: {
        ...state.realTimeData,
        positions: state.realTimeData.positions.filter(trade => trade.id !== tradeId),
        lastUpdate: new Date().toISOString(),
      },
    }));
  },
  
  shouldUpdate: (key) => {
    const state = get();
    const now = Date.now();
    const lastUpdate = state.lastUpdateTime[key] || 0;
    return now - lastUpdate >= state.updateThrottle;
  },
  
  markUpdated: (key) => {
    set((state) => ({
      lastUpdateTime: {
        ...state.lastUpdateTime,
        [key]: Date.now(),
      },
    }));
  },
  
  reset: () => {
    set({
      connectionState: initialConnectionState,
      realTimeData: initialRealTimeData,
      lastUpdateTime: {},
    });
  },
})));

// Selectors for better performance
export const useConnectionState = () => useWebSocketStore(state => state.connectionState);
export const useRealTimeData = () => useWebSocketStore(state => state.realTimeData);
export const useRealTimePrices = () => useWebSocketStore((state) => state.realTimeData.prices);
export const useRealTimeBalance = () => useWebSocketStore((state) => state.realTimeData.balance);
export const useRealTimePositions = () => useWebSocketStore((state) => state.realTimeData.positions);
export const useIsWebSocketConnected = () => useWebSocketStore(state => state.connectionState.status === 'connected');

// Price selectors for specific symbols
export const useRealTimePrice = (symbol: string) => 
  useWebSocketStore(state => state.realTimeData.prices[symbol]);

export const useMajorPairs = () => 
  useWebSocketStore(state => {
    const { prices } = state.realTimeData;
    return {
      EURUSD: prices['EURUSD'],
      GBPUSD: prices['GBPUSD'],
      USDJPY: prices['USDJPY'],
    };
  });