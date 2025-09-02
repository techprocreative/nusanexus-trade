import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import React from 'react';
import {
  useLogin,
  useLogout,
  useUser,
  useCreateOrder,
  useOrders,
  usePositions,
  usePortfolio,
  useMarketData,
  useStrategies,
  useCreateStrategy,
  useAIAnalysis,
  queryKeys,
} from '../hooks/useApiQueries';
import { apiClient } from '../lib/apiClient';
import { LoginRequest, User, Order, Position, Portfolio, MarketData, Strategy, AIAnalysis } from '../types/api';

// Mock the API client
vi.mock('../lib/apiClient', () => ({
  apiClient: {
    post: vi.fn(),
    get: vi.fn(),
    put: vi.fn(),
    patch: vi.fn(),
    delete: vi.fn(),
  },
}));

const mockedApiClient = apiClient as any;

// Test data
const mockUser: User = {
  id: '1',
  email: 'test@example.com',
  name: 'Test User',
  subscriptionPlan: 'free'
};

const mockOrder: Order = {
  id: '1',
  symbol: 'AAPL',
  type: 'market',
  side: 'buy',
  quantity: 100,
  price: 150.00,
  status: 'filled',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPosition: Position = {
  id: '1',
  symbol: 'AAPL',
  side: 'long',
  quantity: 100,
  averagePrice: 150.00,
  currentPrice: 155.00,
  unrealizedPnL: 500.00,
  unrealizedPnLPercent: 3.33,
  openedAt: '2024-01-01T00:00:00Z',
};

const mockPortfolio: Portfolio = {
  totalValue: 100000,
  totalPnL: 5000,
  totalPnLPercent: 5.0,
  availableBalance: 50000,
  usedMargin: 50000,
  freeMargin: 50000,
  positions: [mockPosition],
};

const mockMarketData: MarketData = {
  symbol: 'AAPL',
  bid: 155.00,
  ask: 155.50,
  spread: 0.5,
  volume: 1000000,
  high: 156.00,
  low: 150.00,
  open: 152.00,
  close: 155.00,
  timestamp: '2024-01-01T00:00:00Z',
};

const mockStrategy: Strategy = {
  id: '1',
  name: 'Test Strategy',
  description: 'A test trading strategy',
  symbols: ['AAPL'],
  riskLevel: 'low',
  parameters: { rsi_period: 14, ma_period: 20 },
  riskSettings: {
    maxRiskPerTrade: 10,
    maxDailyLoss: 100,
    maxDrawdown: 20,
    positionSizing: 'percentage',
    stopLossType: 'fixed'
  },
  isActive: true,
  performance: {
    totalTrades: 100,
    winRate: 0.65,
    profitFactor: 1.2,
    totalProfit: 5000,
    totalReturn: 0.15,
    maxDrawdown: 0.05,
    sharpeRatio: 1.2,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockAIAnalysis: AIAnalysis = {
  id: '1',
  symbol: 'AAPL',
  timeframe: '1d',
  analysisType: 'trend',
  analysisData: { signal: 'buy', strength: 0.85 },
  confidenceScore: 0.85,
  recommendations: [{
    action: 'buy',
    confidence: 0.85,
    reasoning: 'Strong buy signal',
    targetPrice: 160.00,
    stopLoss: 145.00,
    timeHorizon: 'short'
  }],
  createdAt: '2024-01-01T00:00:00Z',
};

// Test wrapper with QueryClient
const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
      },
      mutations: {
        retry: false,
      },
    },
  });

  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useApiQueries', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Authentication Hooks', () => {
    describe('useLogin', () => {
      it('should login successfully', async () => {
        const loginData: LoginRequest = {
          email: 'test@example.com',
          password: 'password123',
        };

        const mockResponse = {
          user: mockUser,
          token: 'auth-token',
          refreshToken: 'refresh-token',
        };

        mockedApiClient.post.mockResolvedValue(mockResponse);

        const { result } = renderHook(() => useLogin(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(loginData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/login', loginData);
        expect(result.current.data).toEqual(mockResponse);
      });

      it('should handle login error', async () => {
        const loginData: LoginRequest = {
          email: 'test@example.com',
          password: 'wrongpassword',
        };

        const mockError = new Error('Invalid credentials');
        mockedApiClient.post.mockRejectedValue(mockError);

        const { result } = renderHook(() => useLogin(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(loginData);

        await waitFor(() => {
          expect(result.current.isError).toBe(true);
        });

        expect(result.current.error).toEqual(mockError);
      });
    });

    describe('useLogout', () => {
      it('should logout successfully', async () => {
        mockedApiClient.post.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useLogout(), {
          wrapper: createWrapper(),
        });

        result.current.mutate();

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/auth/logout');
      });
    });

    describe('useUser', () => {
      it('should fetch user data', async () => {
        mockedApiClient.get.mockResolvedValue(mockUser);

        const { result } = renderHook(() => useUser(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/auth/me');
        expect(result.current.data).toEqual(mockUser);
      });
    });
  });

  describe('Trading Hooks', () => {
    describe('useCreateOrder', () => {
      it('should create order successfully', async () => {
        const orderData = {
          symbol: 'AAPL',
          type: 'market' as const,
          side: 'buy' as const,
          quantity: 100,
        };

        mockedApiClient.post.mockResolvedValue(mockOrder);

        const { result } = renderHook(() => useCreateOrder(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(orderData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/trading/orders', orderData);
        expect(result.current.data).toEqual(mockOrder);
      });
    });

    describe('useOrders', () => {
      it('should fetch orders', async () => {
        const mockOrders = [mockOrder];
        mockedApiClient.get.mockResolvedValue(mockOrders);

        const { result } = renderHook(() => useOrders(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/trading/orders', { params: {} });
        expect(result.current.data).toEqual(mockOrders);
      });

      it('should fetch orders with options', async () => {
        const mockOrders = [mockOrder];
        mockedApiClient.get.mockResolvedValue(mockOrders);

        const { result } = renderHook(() => useOrders(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/trading/orders');
      });
    });

    describe('usePositions', () => {
      it('should fetch positions', async () => {
        const mockPositions = [mockPosition];
        mockedApiClient.get.mockResolvedValue(mockPositions);

        const { result } = renderHook(() => usePositions(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/trading/positions');
        expect(result.current.data).toEqual(mockPositions);
      });
    });

    describe('usePortfolio', () => {
      it('should fetch portfolio', async () => {
        mockedApiClient.get.mockResolvedValue(mockPortfolio);

        const { result } = renderHook(() => usePortfolio(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/trading/portfolio');
        expect(result.current.data).toEqual(mockPortfolio);
      });
    });
  });

  describe('Market Data Hooks', () => {
    describe('useMarketData', () => {
      it('should fetch market data for symbol', async () => {
        mockedApiClient.post.mockResolvedValue([mockMarketData]);

        const request = { symbols: ['AAPL'] };
        const { result } = renderHook(() => useMarketData(request), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/market-data', request);
        expect(result.current.data).toEqual([mockMarketData]);
      });

      it('should not fetch when symbols are not provided', () => {
        const { result } = renderHook(() => useMarketData({ symbols: [] }), {
          wrapper: createWrapper(),
        });

        expect(result.current.isLoading).toBe(false); // Should not be enabled
        expect(mockedApiClient.post).not.toHaveBeenCalled();
      });
    });
  });

  describe('Strategy Hooks', () => {
    describe('useStrategies', () => {
      it('should fetch strategies', async () => {
        const mockStrategies = [mockStrategy];
        mockedApiClient.get.mockResolvedValue(mockStrategies);

        const { result } = renderHook(() => useStrategies(), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/strategies', { params: {} });
        expect(result.current.data).toEqual(mockStrategies);
      });
    });

    describe('useCreateStrategy', () => {
      it('should create strategy successfully', async () => {
        const strategyData = {
          name: 'Test Strategy',
          description: 'A test strategy',
          symbols: ['AAPL'],
          riskLevel: 'low' as const,
          parameters: { rsi_period: {} },
          riskSettings: {
            maxRiskPerTrade: 10,
            maxDailyLoss: 100,
            maxDrawdown: 20,
            positionSizing: 'percentage' as const,
            stopLossType: 'fixed' as const
          }
        };

        mockedApiClient.post.mockResolvedValue(mockStrategy);

        const { result } = renderHook(() => useCreateStrategy(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(strategyData);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/strategies', strategyData);
        expect(result.current.data).toEqual(mockStrategy);
      });
    });
  });

  describe('AI Analysis Hooks', () => {
    describe('useAIAnalysis', () => {
      it('should fetch AI analysis for symbol', async () => {
        const analysisRequest = {
          symbol: 'AAPL',
          timeframe: '1d' as const,
          analysisType: 'trend' as const
        };
        mockedApiClient.post.mockResolvedValue(mockAIAnalysis);

        const { result } = renderHook(() => useAIAnalysis(), {
          wrapper: createWrapper(),
        });

        result.current.mutate(analysisRequest);

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.post).toHaveBeenCalledWith('/ai/analyze', analysisRequest);
        expect(result.current.data).toEqual(mockAIAnalysis);
      });
    });
  });

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(queryKeys.user()).toEqual(['auth', 'user']);
      expect(queryKeys.orders).toEqual(['orders']);
      expect(queryKeys.orderHistory({ status: 'filled' })).toEqual(['orders', 'history', { status: 'filled' }]);
      expect(queryKeys.positions).toEqual(['positions']);
      expect(queryKeys.portfolio).toEqual(['portfolio']);
      expect(queryKeys.symbol('AAPL')).toEqual(['market-data', 'symbol', 'AAPL']);
      expect(queryKeys.strategies).toEqual(['strategies']);
      expect(queryKeys.aiAnalysis).toEqual(['ai-analysis']);
      expect(queryKeys.aiRecommendations({ strategy: 'momentum' })).toEqual(['ai-analysis', 'recommendations', { strategy: 'momentum' }]);
    });
  });

  describe('Error Handling', () => {
    it('should handle query errors gracefully', async () => {
      const mockError = new Error('Network error');
      mockedApiClient.get.mockRejectedValue(mockError);

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });

    it('should handle mutation errors gracefully', async () => {
      const mockError = new Error('Validation error');
      mockedApiClient.post.mockRejectedValue(mockError);

      const { result } = renderHook(() => useLogin(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        email: 'test@example.com',
        password: 'password',
      });

      await waitFor(() => {
        expect(result.current.isError).toBe(true);
      });

      expect(result.current.error).toEqual(mockError);
    });
  });

  describe('Loading States', () => {
    it('should show loading state during query', async () => {
      // Mock a delayed response
      mockedApiClient.get.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockUser), 100))
      );

      const { result } = renderHook(() => useUser(), {
        wrapper: createWrapper(),
      });

      expect(result.current.isLoading).toBe(true);
      expect(result.current.data).toBeUndefined();

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.data).toEqual(mockUser);
    });

    it('should show loading state during mutation', async () => {
      // Mock a delayed response
      mockedApiClient.post.mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve(mockOrder), 100))
      );

      const { result } = renderHook(() => useCreateOrder(), {
        wrapper: createWrapper(),
      });

      result.current.mutate({
        symbol: 'AAPL',
        type: 'market',
        side: 'buy',
        quantity: 100,
      });

      expect(result.current.isPending).toBe(true);

      await waitFor(() => {
        expect(result.current.isSuccess).toBe(true);
      });

      expect(result.current.isPending).toBe(false);
    });
  });
});