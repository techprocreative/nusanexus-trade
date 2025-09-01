import { useQuery } from '@tanstack/react-query';
import type { MarketData, Symbol } from '../types';

// Mock API functions - replace with real API calls
const fetchMarketData = async (symbol: string): Promise<MarketData> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Mock data
  const mockData: MarketData = {
    symbol: symbol as Symbol,
    bid: 1.0850 + Math.random() * 0.01,
    ask: 1.0852 + Math.random() * 0.01,
    spread: 0.0002,
    change: (Math.random() - 0.5) * 0.02,
    changePercent: (Math.random() - 0.5) * 2,
    volume: Math.floor(Math.random() * 1000000),
    high: 1.0900,
    low: 1.0800,
    timestamp: new Date().toISOString(),
  };
  
  return mockData;
};

const fetchMultipleMarketData = async (symbols: string[]): Promise<MarketData[]> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 800));
  
  return Promise.all(symbols.map(symbol => fetchMarketData(symbol)));
};

// Custom hooks
export const useMarketData = (symbol: string) => {
  return useQuery({
    queryKey: ['marketData', symbol],
    queryFn: () => fetchMarketData(symbol),
    refetchInterval: 1000, // Refetch every second for real-time data
    enabled: !!symbol,
  });
};

export const useWatchlistData = (symbols: string[]) => {
  return useQuery({
    queryKey: ['watchlist', symbols],
    queryFn: () => fetchMultipleMarketData(symbols),
    refetchInterval: 2000, // Refetch every 2 seconds
    enabled: symbols.length > 0,
  });
};

export const useSymbolSearch = (searchTerm: string) => {
  const searchSymbols = async (term: string): Promise<Symbol[]> => {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const allSymbols: Symbol[] = [
      'EURUSD', 'GBPUSD', 'USDJPY', 'USDCHF', 'AUDUSD',
      'USDCAD', 'NZDUSD', 'EURJPY', 'GBPJPY', 'EURGBP'
    ];
    
    return allSymbols.filter(symbol => 
      symbol.toLowerCase().includes(term.toLowerCase())
    );
  };

  return useQuery({
    queryKey: ['symbolSearch', searchTerm],
    queryFn: () => searchSymbols(searchTerm),
    enabled: searchTerm.length > 0,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};