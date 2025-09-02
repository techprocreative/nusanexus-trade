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
  role: 'trader',
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockOrder: Order = {
  id: '1',
  userId: '1',
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
  userId: '1',
  symbol: 'AAPL',
  quantity: 100,
  averagePrice: 150.00,
  currentPrice: 155.00,
  unrealizedPnL: 500.00,
  realizedPnL: 0,
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockPortfolio: Portfolio = {
  id: '1',
  userId: '1',
  totalValue: 100000,
  availableCash: 50000,
  totalPnL: 5000,
  dayPnL: 500,
  positions: [mockPosition],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockMarketData: MarketData = {
  symbol: 'AAPL',
  price: 155.00,
  change: 5.00,
  changePercent: 3.33,
  volume: 1000000,
  high: 156.00,
  low: 150.00,
  open: 152.00,
  timestamp: '2024-01-01T00:00:00Z',
};

const mockStrategy: Strategy = {
  id: '1',
  userId: '1',
  name: 'Test Strategy',
  description: 'A test trading strategy',
  type: 'momentum',
  status: 'active',
  parameters: { rsi_period: 14, ma_period: 20 },
  performance: {
    totalReturn: 0.15,
    sharpeRatio: 1.2,
    maxDrawdown: 0.05,
    winRate: 0.65,
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const mockAIAnalysis: AIAnalysis = {
  id: '1',
  symbol: 'AAPL',
  analysis: 'Strong buy signal based on technical indicators',
  recommendation: 'buy',
  confidence: 0.85,
  factors: ['RSI oversold', 'Moving average crossover'],
  targetPrice: 160.00,
  stopLoss: 145.00,
  timeframe: '1d',
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

      it('should fetch orders with filters', async () => {
        const filters = { status: 'filled' as const, symbol: 'AAPL' };
        const mockOrders = [mockOrder];
        mockedApiClient.get.mockResolvedValue(mockOrders);

        const { result } = renderHook(() => useOrders(filters), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/trading/orders', { params: filters });
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
        mockedApiClient.get.mockResolvedValue(mockMarketData);

        const { result } = renderHook(() => useMarketData('AAPL'), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/market/data/AAPL');
        expect(result.current.data).toEqual(mockMarketData);
      });

      it('should not fetch when symbol is not provided', () => {
        const { result } = renderHook(() => useMarketData(''), {
          wrapper: createWrapper(),
        });

        expect(result.current.isIdle).toBe(true);
        expect(mockedApiClient.get).not.toHaveBeenCalled();
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
          type: 'momentum' as const,
          parameters: { rsi_period: 14 },
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
        mockedApiClient.get.mockResolvedValue(mockAIAnalysis);

        const { result } = renderHook(() => useAIAnalysis('AAPL'), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/ai/analysis/AAPL', { params: {} });
        expect(result.current.data).toEqual(mockAIAnalysis);
      });

      it('should fetch AI analysis with timeframe', async () => {
        mockedApiClient.get.mockResolvedValue(mockAIAnalysis);

        const { result } = renderHook(() => useAIAnalysis('AAPL', '1h'), {
          wrapper: createWrapper(),
        });

        await waitFor(() => {
          expect(result.current.isSuccess).toBe(true);
        });

        expect(mockedApiClient.get).toHaveBeenCalledWith('/ai/analysis/AAPL', {
          params: { timeframe: '1h' },
        });
      });
    });
  });

  describe('Query Keys', () => {
    it('should generate correct query keys', () => {
      expect(queryKeys.user()).toEqual(['user']);
      expect(queryKeys.orders()).toEqual(['orders']);
      expect(queryKeys.orders({ status: 'filled' })).toEqual(['orders', { status: 'filled' }]);
      expect(queryKeys.positions()).toEqual(['positions']);
      expect(queryKeys.portfolio()).toEqual(['portfolio']);
      expect(queryKeys.marketData('AAPL')).toEqual(['marketData', 'AAPL']);
      expect(queryKeys.strategies()).toEqual(['strategies']);
      expect(queryKeys.strategies({ status: 'active' })).toEqual(['strategies', { status: 'active' }]);
      expect(queryKeys.aiAnalysis('AAPL')).toEqual(['aiAnalysis', 'AAPL']);
      expect(queryKeys.aiAnalysis('AAPL', '1h')).toEqual(['aiAnalysis', 'AAPL', '1h']);
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