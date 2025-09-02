// API Base Types
export interface ApiResponse<T = any> {
  data: T;
  message?: string;
  success: boolean;
  timestamp: string;
}

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, any>;
  timestamp: string;
  status?: number; // HTTP status code
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  };
}

// Authentication Types
export interface LoginRequest {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    avatar?: string;
    subscriptionPlan: 'free' | 'premium' | 'pro';
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
    expiresIn: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  expiresIn: number;
}

// Trading API Types
export interface CreateOrderRequest {
  symbol: string;
  type: 'market' | 'limit' | 'stop';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  stopLoss?: number;
  takeProfit?: number;
}

export interface OrderResponse {
  id: string;
  symbol: string;
  type: string;
  side: string;
  quantity: number;
  price?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  createdAt: string;
  updatedAt: string;
}

export interface ModifyOrderRequest {
  orderId: string;
  quantity?: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
}

export interface CancelOrderRequest {
  orderId: string;
}

// Market Data Types
export interface MarketDataRequest {
  symbols: string[];
  timeframe?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  limit?: number;
}

export interface MarketDataResponse {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
}

export interface SymbolInfoResponse {
  symbol: string;
  description: string;
  type: 'forex' | 'crypto' | 'stock' | 'commodity';
  minQuantity: number;
  maxQuantity: number;
  tickSize: number;
  contractSize: number;
  currency: string;
  isActive: boolean;
}

// Portfolio Types
export interface PortfolioRequest {
  includeHistory?: boolean;
  dateFrom?: string;
  dateTo?: string;
}

export interface PositionResponse {
  id: string;
  symbol: string;
  side: 'long' | 'short';
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  openedAt: string;
}

export interface PortfolioResponse {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  availableBalance: number;
  usedMargin: number;
  freeMargin: number;
  positions: PositionResponse[];
}

// Strategy Types
export interface CreateStrategyRequest {
  name: string;
  description: string;
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  riskSettings: {
    maxRiskPerTrade: number;
    maxDailyLoss: number;
    maxDrawdown: number;
    positionSizing: 'fixed' | 'percentage' | 'kelly';
    stopLossType: 'fixed' | 'atr' | 'percentage';
  };
}

export interface StrategyResponse {
  id: string;
  name: string;
  description: string;
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  riskSettings: Record<string, any>;
  isActive: boolean;
  performance?: {
    totalTrades: number;
    winRate: number;
    profitFactor: number;
    totalProfit: number;
    totalReturn: number;
    maxDrawdown: number;
    sharpeRatio: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface UpdateStrategyRequest extends Partial<CreateStrategyRequest> {
  id: string;
  isActive?: boolean;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  symbol: string;
  timeframe: string;
  analysisType: 'trend' | 'support_resistance' | 'pattern' | 'sentiment';
}

export interface AIAnalysisResponse {
  id: string;
  symbol: string;
  timeframe: string;
  analysisType: string;
  analysisData: Record<string, any>;
  confidenceScore: number;
  recommendations: {
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    targetPrice?: number;
    stopLoss?: number;
    timeHorizon: 'short' | 'medium' | 'long';
  }[];
  createdAt: string;
}

// WebSocket Message Types
export interface WebSocketMessage<T = any> {
  type: string;
  data: T;
  timestamp: string;
  id?: string;
}

export interface WebSocketSubscription {
  channel: string;
  symbol?: string;
  timeframe?: string;
}

export interface WebSocketPriceUpdate {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: string;
}

export interface WebSocketOrderUpdate {
  orderId: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity?: number;
  averagePrice?: number;
  timestamp: string;
}

export interface WebSocketPositionUpdate {
  positionId: string;
  symbol: string;
  unrealizedPnL: number;
  currentPrice: number;
  timestamp: string;
}

// API Client Configuration
export interface ApiClientConfig {
  baseURL: string;
  timeout: number;
  retryAttempts: number;
  retryDelay: number;
  enableOfflineQueue: boolean;
  enableLogging: boolean;
}

// Request/Response Interceptor Types
export interface RequestInterceptorConfig {
  onRequest?: (config: any) => any;
  onRequestError?: (error: any) => any;
}

export interface ResponseInterceptorConfig {
  onResponse?: (response: any) => any;
  onResponseError?: (error: any) => any;
}

// Offline Queue Types
export interface QueuedRequest {
  id: string;
  url: string;
  method: string;
  data?: any;
  headers?: Record<string, string>;
  timestamp: string;
  retryCount: number;
}

// Error Types
export interface ApiErrorResponse {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
  timestamp: string;
}

export type ApiErrorCode = 
  | 'NETWORK_ERROR'
  | 'TIMEOUT_ERROR'
  | 'AUTHENTICATION_ERROR'
  | 'AUTHORIZATION_ERROR'
  | 'VALIDATION_ERROR'
  | 'SERVER_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'OFFLINE_ERROR'
  | 'UNKNOWN_ERROR';

// React Query Types
export interface QueryConfig {
  staleTime?: number;
  cacheTime?: number;
  refetchOnWindowFocus?: boolean;
  refetchOnReconnect?: boolean;
  retry?: number | boolean;
  retryDelay?: number;
}

export interface MutationConfig {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onSettled?: () => void;
}

// Development Tools Types
export interface ApiDebugInfo {
  requestId: string;
  method: string;
  url: string;
  requestData?: any;
  responseData?: any;
  duration: number;
  status: number;
  timestamp: string;
  error?: string;
}

export interface ApiMetrics {
  totalRequests: number;
  successfulRequests: number;
  failedRequests: number;
  averageResponseTime: number;
  cacheHitRate: number;
  errorRate: number;
}

// Additional type aliases for compatibility
export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  subscriptionPlan: 'free' | 'premium' | 'pro';
}

export interface MarketData {
  symbol: string;
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  bid: number;
  ask: number;
  spread: number;
}

export interface AIAnalysis {
  id: string;
  symbol: string;
  timeframe: string;
  analysisType: string;
  analysisData: Record<string, any>;
  confidenceScore: number;
  recommendations: {
    action: 'buy' | 'sell' | 'hold';
    confidence: number;
    reasoning: string;
    targetPrice?: number;
    stopLoss?: number;
    timeHorizon: 'short' | 'medium' | 'long';
  }[];
  createdAt: string;
}

// Type aliases for existing interfaces
export type Order = OrderResponse;
export type Position = PositionResponse;
export type Portfolio = PortfolioResponse;
export type Strategy = StrategyResponse;
export type UpdateOrderRequest = ModifyOrderRequest;
export type UpdateUserRequest = {
  id: string;
  name?: string;
  email?: string;
  avatar?: string;
};