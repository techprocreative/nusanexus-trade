import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import type { TradingSymbol, Trade, TradingStrategy, ChartData } from '../types';

interface TradingState {
  // State
  symbols: TradingSymbol[];
  activeTrades: Trade[];
  strategies: TradingStrategy[];
  selectedSymbol: string | null;
  chartData: ChartData | null;
  watchlist: string[];
  isTrading: boolean;

  // Actions
  setSymbols: (symbols: TradingSymbol[]) => void;
  updateSymbol: (symbol: TradingSymbol) => void;
  setActiveTrades: (trades: Trade[]) => void;
  addTrade: (trade: Trade) => void;
  updateTrade: (tradeId: string, updates: Partial<Trade>) => void;
  removeTrade: (tradeId: string) => void;
  setStrategies: (strategies: TradingStrategy[]) => void;
  addStrategy: (strategy: TradingStrategy) => void;
  updateStrategy: (strategyId: string, updates: Partial<TradingStrategy>) => void;
  removeStrategy: (strategyId: string) => void;
  setSelectedSymbol: (symbol: string | null) => void;
  setChartData: (data: ChartData | null) => void;
  addToWatchlist: (symbol: string) => void;
  removeFromWatchlist: (symbol: string) => void;
  setIsTrading: (isTrading: boolean) => void;
}

export const useTradingStore = create<TradingState>()(
  devtools(
    (set, get) => ({
      // Initial state
      symbols: [],
      activeTrades: [],
      strategies: [],
      selectedSymbol: null,
      chartData: null,
      watchlist: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'],
      isTrading: false,

      // Actions
      setSymbols: (symbols) => set({ symbols }, false, 'setSymbols'),
      
      updateSymbol: (symbol) => {
        set(
          (state) => ({
            symbols: state.symbols.map((s) =>
              s.symbol === symbol.symbol ? symbol : s
            ),
          }),
          false,
          'updateSymbol'
        );
      },
      
      setActiveTrades: (trades) => set({ activeTrades: trades }, false, 'setActiveTrades'),
      
      addTrade: (trade) => {
        set(
          (state) => ({
            activeTrades: [trade, ...state.activeTrades],
          }),
          false,
          'addTrade'
        );
      },
      
      updateTrade: (tradeId, updates) => {
        set(
          (state) => ({
            activeTrades: state.activeTrades.map((trade) =>
              trade.id === tradeId ? { ...trade, ...updates } : trade
            ),
          }),
          false,
          'updateTrade'
        );
      },
      
      removeTrade: (tradeId) => {
        set(
          (state) => ({
            activeTrades: state.activeTrades.filter((trade) => trade.id !== tradeId),
          }),
          false,
          'removeTrade'
        );
      },
      
      setStrategies: (strategies) => set({ strategies }, false, 'setStrategies'),
      
      addStrategy: (strategy) => {
        set(
          (state) => ({
            strategies: [strategy, ...state.strategies],
          }),
          false,
          'addStrategy'
        );
      },
      
      updateStrategy: (strategyId, updates) => {
        set(
          (state) => ({
            strategies: state.strategies.map((strategy) =>
              strategy.id === strategyId ? { ...strategy, ...updates } : strategy
            ),
          }),
          false,
          'updateStrategy'
        );
      },
      
      removeStrategy: (strategyId) => {
        set(
          (state) => ({
            strategies: state.strategies.filter((strategy) => strategy.id !== strategyId),
          }),
          false,
          'removeStrategy'
        );
      },
      
      setSelectedSymbol: (symbol) => set({ selectedSymbol: symbol }, false, 'setSelectedSymbol'),
      
      setChartData: (data) => set({ chartData: data }, false, 'setChartData'),
      
      addToWatchlist: (symbol) => {
        set(
          (state) => ({
            watchlist: state.watchlist.includes(symbol)
              ? state.watchlist
              : [...state.watchlist, symbol],
          }),
          false,
          'addToWatchlist'
        );
      },
      
      removeFromWatchlist: (symbol) => {
        set(
          (state) => ({
            watchlist: state.watchlist.filter((s) => s !== symbol),
          }),
          false,
          'removeFromWatchlist'
        );
      },
      
      setIsTrading: (isTrading) => set({ isTrading }, false, 'setIsTrading'),
    }),
    {
      name: 'trading-store',
    }
  )
);

// Selectors
export const useSymbols = () => useTradingStore((state) => state.symbols);
export const useActiveTrades = () => useTradingStore((state) => state.activeTrades);
export const useStrategies = () => useTradingStore((state) => state.strategies);
export const useSelectedSymbol = () => useTradingStore((state) => state.selectedSymbol);
export const useChartData = () => useTradingStore((state) => state.chartData);
export const useWatchlist = () => useTradingStore((state) => state.watchlist);
export const useIsTrading = () => useTradingStore((state) => state.isTrading);