import { 
  useQuery, 
  useMutation, 
  useQueryClient, 
  UseQueryOptions, 
  UseMutationOptions,
  useInfiniteQuery,
  UseInfiniteQueryOptions
} from '@tanstack/react-query';
import { apiClient } from '../lib/apiClient';
import { errorHandler } from '../lib/errorHandler';
import {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RefreshTokenResponse,
  CreateOrderRequest,
  Order,
  UpdateOrderRequest,
  CancelOrderRequest,
  Position,
  Portfolio,
  Strategy,
  CreateStrategyRequest,
  UpdateStrategyRequest,
  AIAnalysisRequest,
  AIAnalysisResponse,
  MarketDataRequest,
  MarketData,
  User,
  UpdateUserRequest
} from '../types/api';

// Query Keys Factory
export const queryKeys = {
  // Authentication
  auth: ['auth'] as const,
  user: (userId?: string) => ['auth', 'user', userId] as const,
  
  // Trading
  orders: ['orders'] as const,
  order: (orderId: string) => ['orders', orderId] as const,
  orderHistory: (filters?: any) => ['orders', 'history', filters] as const,
  
  // Positions & Portfolio
  positions: ['positions'] as const,
  position: (symbol: string) => ['positions', symbol] as const,
  portfolio: ['portfolio'] as const,
  portfolioHistory: (timeframe?: string) => ['portfolio', 'history', timeframe] as const,
  
  // Strategies
  strategies: ['strategies'] as const,
  strategy: (strategyId: string) => ['strategies', strategyId] as const,
  strategyPerformance: (strategyId: string, timeframe?: string) => 
    ['strategies', strategyId, 'performance', timeframe] as const,
  
  // Market Data
  marketData: ['market-data'] as const,
  symbol: (symbol: string) => ['market-data', 'symbol', symbol] as const,
  symbols: (filters?: any) => ['market-data', 'symbols', filters] as const,
  
  // AI Analysis
  aiAnalysis: ['ai-analysis'] as const,
  aiRecommendations: (filters?: any) => ['ai-analysis', 'recommendations', filters] as const,
} as const;

// Default query options
const defaultQueryOptions = {
  staleTime: 5 * 60 * 1000, // 5 minutes
  gcTime: 10 * 60 * 1000, // 10 minutes (formerly cacheTime)
  retry: (failureCount: number, error: any) => {
    if (error?.code === 'AUTHENTICATION_ERROR' || error?.code === 'AUTHORIZATION_ERROR') {
      return false;
    }
    return failureCount < 3;
  },
  retryDelay: (attemptIndex: number) => Math.min(1000 * 2 ** attemptIndex, 30000),
};

// Authentication Hooks
export const useLogin = (options?: UseMutationOptions<LoginResponse, ApiError, LoginRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.post<LoginResponse>('/auth/login', credentials);
      return response.data;
    },
    onSuccess: (data) => {
      // Store tokens
      apiClient.setAuthToken(data.accessToken);
      
      // Invalidate and refetch user data
      queryClient.invalidateQueries({ queryKey: queryKeys.auth });
      queryClient.setQueryData(queryKeys.user(data.user.id), data.user);
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

export const useLogout = (options?: UseMutationOptions<void, ApiError, void>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      await apiClient.post('/auth/logout');
    },
    onSuccess: () => {
      // Clear tokens and cache
      apiClient.clearAuthToken();
      queryClient.clear();
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

export const useUser = (options?: UseQueryOptions<User, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.user(),
    queryFn: async () => {
      const response = await apiClient.get<User>('/auth/me');
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 10 * 60 * 1000, // 10 minutes for user data
    ...options
  });
};

export const useUpdateUser = (options?: UseMutationOptions<User, ApiError, UpdateUserRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (userData: UpdateUserRequest) => {
      const response = await apiClient.put<User>('/auth/me', userData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData(queryKeys.user(data.id), data);
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

// Trading Hooks
export const useOrders = (options?: UseQueryOptions<Order[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.orders,
    queryFn: async () => {
      const response = await apiClient.get<Order[]>('/trading/orders');
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 30 * 1000, // 30 seconds for orders
    ...options
  });
};

export const useOrder = (orderId: string, options?: UseQueryOptions<Order, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.order(orderId),
    queryFn: async () => {
      const response = await apiClient.get<Order>(`/trading/orders/${orderId}`);
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 30 * 1000,
    enabled: !!orderId,
    ...options
  });
};

export const useCreateOrder = (options?: UseMutationOptions<Order, ApiError, CreateOrderRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: CreateOrderRequest) => {
      const response = await apiClient.post<Order>('/trading/orders', orderData);
      return response.data;
    },
    onSuccess: (data) => {
      // Optimistically update orders list
      queryClient.setQueryData<Order[]>(queryKeys.orders, (old) => 
        old ? [data, ...old] : [data]
      );
      
      // Invalidate related queries
      queryClient.invalidateQueries({ queryKey: queryKeys.positions });
      queryClient.invalidateQueries({ queryKey: queryKeys.portfolio });
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

export const useUpdateOrder = (options?: UseMutationOptions<Order, ApiError, UpdateOrderRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (orderData: UpdateOrderRequest) => {
      const response = await apiClient.put<Order>(`/trading/orders/${orderData.orderId}`, orderData);
      return response.data;
    },
    onSuccess: (data) => {
      // Update specific order
      queryClient.setQueryData(queryKeys.order(data.id), data);
      
      // Update orders list
      queryClient.setQueryData<Order[]>(queryKeys.orders, (old) => 
        old ? old.map(order => order.id === data.id ? data : order) : [data]
      );
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

export const useCancelOrder = (options?: UseMutationOptions<void, ApiError, CancelOrderRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (cancelData: CancelOrderRequest) => {
      await apiClient.delete(`/trading/orders/${cancelData.orderId}`);
    },
    onSuccess: (_, variables) => {
      // Remove from orders list
      queryClient.setQueryData<Order[]>(queryKeys.orders, (old) => 
        old ? old.filter(order => order.id !== variables.orderId) : []
      );
      
      // Remove specific order query
      queryClient.removeQueries({ queryKey: queryKeys.order(variables.orderId) });
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

// Order History with Infinite Query
export const useOrderHistory = (
  filters?: any,
  options?: UseInfiniteQueryOptions<PaginatedResponse<Order>, ApiError>
) => {
  return useInfiniteQuery({
    queryKey: queryKeys.orderHistory(filters),
    queryFn: async ({ pageParam = 1 }) => {
      const response = await apiClient.get<PaginatedResponse<Order>>('/trading/orders/history', {
        params: { page: pageParam, ...filters }
      });
      return response.data;
    },
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      return lastPage.hasNextPage ? lastPage.page + 1 : undefined;
    },
    ...defaultQueryOptions,
    staleTime: 2 * 60 * 1000, // 2 minutes for history
    ...options
  });
};

// Portfolio & Positions Hooks
export const usePositions = (options?: UseQueryOptions<Position[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.positions,
    queryFn: async () => {
      const response = await apiClient.get<Position[]>('/trading/positions');
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 30 * 1000, // 30 seconds for positions
    ...options
  });
};

export const usePortfolio = (options?: UseQueryOptions<Portfolio, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.portfolio,
    queryFn: async () => {
      const response = await apiClient.get<Portfolio>('/trading/portfolio');
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 60 * 1000, // 1 minute for portfolio
    ...options
  });
};

// Strategy Hooks
export const useStrategies = (options?: UseQueryOptions<Strategy[], ApiError>) => {
  return useQuery({
    queryKey: queryKeys.strategies,
    queryFn: async () => {
      const response = await apiClient.get<Strategy[]>('/strategies');
      return response.data;
    },
    ...defaultQueryOptions,
    ...options
  });
};

export const useStrategy = (strategyId: string, options?: UseQueryOptions<Strategy, ApiError>) => {
  return useQuery({
    queryKey: queryKeys.strategy(strategyId),
    queryFn: async () => {
      const response = await apiClient.get<Strategy>(`/strategies/${strategyId}`);
      return response.data;
    },
    ...defaultQueryOptions,
    enabled: !!strategyId,
    ...options
  });
};

export const useCreateStrategy = (options?: UseMutationOptions<Strategy, ApiError, CreateStrategyRequest>) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (strategyData: CreateStrategyRequest) => {
      const response = await apiClient.post<Strategy>('/strategies', strategyData);
      return response.data;
    },
    onSuccess: (data) => {
      queryClient.setQueryData<Strategy[]>(queryKeys.strategies, (old) => 
        old ? [data, ...old] : [data]
      );
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

// Market Data Hooks
export const useMarketData = (
  request: MarketDataRequest,
  options?: UseQueryOptions<MarketData[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.symbols(request),
    queryFn: async () => {
      const response = await apiClient.post<MarketData[]>('/market-data', request);
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 10 * 1000, // 10 seconds for market data
    enabled: !!request.symbols?.length,
    ...options
  });
};

// AI Analysis Hooks
export const useAIAnalysis = (options?: UseMutationOptions<AIAnalysisResponse, ApiError, AIAnalysisRequest>) => {
  return useMutation({
    mutationFn: async (analysisRequest: AIAnalysisRequest) => {
      const response = await apiClient.post<AIAnalysisResponse>('/ai/analyze', analysisRequest);
      return response.data;
    },
    onError: (error) => {
      errorHandler.handleApiError(error);
    },
    ...options
  });
};

export const useAIRecommendations = (
  filters?: any,
  options?: UseQueryOptions<AIAnalysisResponse[], ApiError>
) => {
  return useQuery({
    queryKey: queryKeys.aiRecommendations(filters),
    queryFn: async () => {
      const response = await apiClient.get<AIAnalysisResponse[]>('/ai/recommendations', {
        params: filters
      });
      return response.data;
    },
    ...defaultQueryOptions,
    staleTime: 2 * 60 * 1000, // 2 minutes for AI recommendations
    ...options
  });
};

// Utility Hooks
export const useInvalidateQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    invalidateOrders: () => queryClient.invalidateQueries({ queryKey: queryKeys.orders }),
    invalidatePositions: () => queryClient.invalidateQueries({ queryKey: queryKeys.positions }),
    invalidatePortfolio: () => queryClient.invalidateQueries({ queryKey: queryKeys.portfolio }),
    invalidateStrategies: () => queryClient.invalidateQueries({ queryKey: queryKeys.strategies }),
    invalidateMarketData: () => queryClient.invalidateQueries({ queryKey: queryKeys.marketData }),
    invalidateAll: () => queryClient.invalidateQueries()
  };
};

// Prefetch Hooks
export const usePrefetchQueries = () => {
  const queryClient = useQueryClient();
  
  return {
    prefetchOrders: () => queryClient.prefetchQuery({
      queryKey: queryKeys.orders,
      queryFn: async () => {
        const response = await apiClient.get<Order[]>('/trading/orders');
        return response.data;
      },
      staleTime: 30 * 1000
    }),
    prefetchPositions: () => queryClient.prefetchQuery({
      queryKey: queryKeys.positions,
      queryFn: async () => {
        const response = await apiClient.get<Position[]>('/trading/positions');
        return response.data;
      },
      staleTime: 30 * 1000
    }),
    prefetchPortfolio: () => queryClient.prefetchQuery({
      queryKey: queryKeys.portfolio,
      queryFn: async () => {
        const response = await apiClient.get<Portfolio>('/trading/portfolio');
        return response.data;
      },
      staleTime: 60 * 1000
    })
  };
};