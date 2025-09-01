import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Trade, TradingStrategy, AccountInfo } from '../types';

// Mock API functions - replace with real API calls
const fetchAccountInfo = async (): Promise<AccountInfo> => {
  await new Promise(resolve => setTimeout(resolve, 500));
  
  return {
    balance: 10000 + Math.random() * 5000,
    equity: 10500 + Math.random() * 5000,
    freeMargin: 8000 + Math.random() * 3000,
    usedMargin: 2000 + Math.random() * 1000,
    dailyPnL: (Math.random() - 0.5) * 1000,
    totalReturn: (Math.random() - 0.3) * 20,
    currency: 'USD',
  };
};

const fetchActiveTrades = async (): Promise<Trade[]> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  
  const mockTrades: Trade[] = [
    {
      id: '1',
      userId: 'user-1',
      symbol: 'EURUSD',
      tradeType: 'buy',
      volume: 0.1,
      openPrice: 1.0850,

      stopLoss: 1.0800,
      takeProfit: 1.0950,


      status: 'open',
        openedAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
      },
    {
      id: '2',
      userId: 'user-1',
      symbol: 'GBPUSD',
      tradeType: 'sell',
      volume: 0.05,
      openPrice: 1.2650,

      stopLoss: 1.2700,
      takeProfit: 1.2550,


      status: 'open',
        openedAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
      },
  ];
  
  return mockTrades;
};

const fetchTradeHistory = async (limit = 50): Promise<Trade[]> => {
  await new Promise(resolve => setTimeout(resolve, 700));
  
  const mockHistory: Trade[] = Array.from({ length: limit }, (_, i) => ({
    id: `hist-${i + 1}`,
    userId: 'user-1',
    symbol: ['EURUSD', 'GBPUSD', 'USDJPY', 'AUDUSD'][i % 4],
    tradeType: i % 2 === 0 ? 'buy' : 'sell',
    volume: 0.1 + Math.random() * 0.5,
    openPrice: 1.0850 + Math.random() * 0.1,
    closePrice: 1.0850 + (Math.random() - 0.5) * 0.02,
    profitLoss: (Math.random() - 0.5) * 200,
    status: 'closed' as const,
    openedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    closedAt: new Date(Date.now() - Math.random() * 24 * 60 * 60 * 1000).toISOString(),
  }));
  
  return mockHistory;
};

const executeTrade = async (tradeData: {
  symbol: string;
  type: 'buy' | 'sell';
  volume: number;
  stopLoss?: number;
  takeProfit?: number;
}): Promise<Trade> => {
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Simulate trade execution
  const newTrade: Trade = {
    id: Date.now().toString(),
    userId: 'user-1',
    symbol: tradeData.symbol,
    tradeType: tradeData.type,
    volume: tradeData.volume,
    openPrice: 1.0850 + (Math.random() - 0.5) * 0.001, // Simulate slippage

    stopLoss: tradeData.stopLoss,
    takeProfit: tradeData.takeProfit,

    
    status: 'open',
      openedAt: new Date().toISOString(),
    };
  
  return newTrade;
};

const closeTrade = async (tradeId: string): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 800));
  // Simulate trade closure
};

const modifyTrade = async (tradeId: string, modifications: {
  stopLoss?: number;
  takeProfit?: number;
}): Promise<void> => {
  await new Promise(resolve => setTimeout(resolve, 600));
  // Simulate trade modification
};

// Custom hooks
export const useAccountInfo = () => {
  return useQuery({
    queryKey: ['accountInfo'],
    queryFn: fetchAccountInfo,
    refetchInterval: 5000, // Refetch every 5 seconds
  });
};

export const useActiveTrades = () => {
  return useQuery({
    queryKey: ['activeTrades'],
    queryFn: fetchActiveTrades,
    refetchInterval: 2000, // Refetch every 2 seconds
  });
};

export const useTradeHistory = (limit?: number) => {
  return useQuery({
    queryKey: ['tradeHistory', limit],
    queryFn: () => fetchTradeHistory(limit),
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

export const useExecuteTrade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: executeTrade,
    onSuccess: () => {
      // Invalidate and refetch active trades and account info
      queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
      queryClient.invalidateQueries({ queryKey: ['accountInfo'] });
    },
  });
};

export const useCloseTrade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: closeTrade,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
      queryClient.invalidateQueries({ queryKey: ['accountInfo'] });
      queryClient.invalidateQueries({ queryKey: ['tradeHistory'] });
    },
  });
};

export const useModifyTrade = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ tradeId, modifications }: {
      tradeId: string;
      modifications: { stopLoss?: number; takeProfit?: number; };
    }) => modifyTrade(tradeId, modifications),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activeTrades'] });
    },
  });
};