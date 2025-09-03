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
    role: 'admin' | 'trader' | 'viewer';
    avatar?: string;
    subscriptionPlan?: 'free' | 'premium' | 'pro';
    preferences: {
      language: string;
      timezone: string;
      theme: 'light' | 'dark';
      notifications: boolean;
    };
    createdAt: string;
    updatedAt: string;
  };
  tokens: {
    accessToken: string;
    refreshToken: string;
  };
  expiresIn: number;
}

export interface LogoutRequest {
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

export interface UserProfileResponse {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'trader' | 'viewer';
  preferences: {
    language: string;
    timezone: string;
    theme: 'light' | 'dark';
    notifications: boolean;
  };
  createdAt: string;
  updatedAt: string;
}

// Trading API Types
export interface CreateOrderRequest {
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  clientOrderId?: string;
}

export interface OrderResponse {
  id: string;
  symbol: string;
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;
  stopPrice?: number;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  averagePrice?: number;
  timeInForce?: 'GTC' | 'IOC' | 'FOK';
  clientOrderId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ModifyOrderRequest {
  orderId: string;
  quantity?: number;
  price?: number;
  stopPrice?: number;
}

export interface CancelOrderRequest {
  orderId: string;
  reason?: string;
}

export interface CancelOrderResponse {
  id: string;
  status: 'cancelled';
  cancelledAt: string;
  message: string;
}

// Market Data Types
export interface MarketDataRequest {
  symbol?: string;
  symbols?: string[];
  interval?: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  limit?: number;
  startTime?: string;
  endTime?: string;
}

export interface MarketDataResponse {
  symbol: string;
  interval: string;
  data: {
    timestamp: string;
    open: number;
    high: number;
    low: number;
    close: number;
    volume: number;
  }[];
}

export interface PriceTickResponse {
  symbol: string;
  bid: number;
  ask: number;
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface SymbolInfoResponse {
  symbol: string;
  name: string;
  type: 'forex' | 'crypto' | 'stock' | 'commodity';
  baseAsset: string;
  quoteAsset: string;
  minQuantity: number;
  maxQuantity: number;
  tickSize: number;
  active: boolean;
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
  realizedPnL: number;
  marginUsed: number;
  createdAt: string;
  updatedAt: string;
}

export interface PortfolioResponse {
  totalValue: number;
  availableBalance: number;
  marginUsed: number;
  unrealizedPnL: number;
  realizedPnL: number;
  totalPnL: number;
  dayPnL: number;
  positions: PositionResponse[];
  openOrders: number;
  performance: {
    daily: number;
    weekly: number;
    monthly: number;
    yearly: number;
  };
}

// Strategy Types
// News and Notifications Types
export interface NewsResponse {
  id: string;
  title: string;
  content: string;
  source: string;
  category: 'market' | 'economic' | 'company' | 'crypto';
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
  publishedAt: string;
  url?: string;
}

export interface NotificationResponse {
  id: string;
  type: 'price_alert' | 'order_filled' | 'margin_call' | 'news' | 'system';
  title: string;
  message: string;
  read: boolean;
  priority: 'high' | 'medium' | 'low';
  data?: Record<string, any>;
  createdAt: string;
}

// Settings Types
export interface UserSettingsResponse {
  notifications: {
    email: boolean;
    push: boolean;
    priceAlerts: boolean;
    orderUpdates: boolean;
    newsUpdates: boolean;
  };
  trading: {
    defaultLeverage: number;
    riskLevel: 'conservative' | 'moderate' | 'aggressive';
    autoStopLoss: boolean;
    autoTakeProfit: boolean;
  };
  display: {
    theme: 'light' | 'dark';
    language: string;
    timezone: string;
    currency: string;
  };
}

export interface UpdateUserSettingsRequest {
  notifications?: {
    email?: boolean;
    push?: boolean;
    priceAlerts?: boolean;
    orderUpdates?: boolean;
    newsUpdates?: boolean;
  };
  trading?: {
    defaultLeverage?: number;
    riskLevel?: 'conservative' | 'moderate' | 'aggressive';
    autoStopLoss?: boolean;
    autoTakeProfit?: boolean;
  };
  display?: {
    theme?: 'light' | 'dark';
    language?: string;
    timezone?: string;
    currency?: string;
  };
}

export interface TradingStrategyResponse {
  id: string;
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'copy_trading';
  status: 'active' | 'inactive' | 'paused';
  symbols: string[];
  timeframes: string[];
  parameters: {
    entryConditions: Record<string, any>;
    exitConditions: Record<string, any>;
    riskManagement: {
      maxPositionSize: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      maxDailyLoss: number;
      maxDrawdown: number;
    };
  };
  performance: {
    totalTrades: number;
    winningTrades: number;
    losingTrades: number;
    winRate: number;
    totalPnL: number;
    averageWin: number;
    averageLoss: number;
    maxDrawdown: number;
    sharpeRatio: number;
    profitFactor: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface CreateStrategyRequest {
  name: string;
  description: string;
  type: 'manual' | 'automated' | 'copy_trading';
  symbols: string[];
  timeframes: string[];
  parameters: {
    entryConditions: Record<string, any>;
    exitConditions: Record<string, any>;
    riskManagement: {
      maxPositionSize: number;
      stopLossPercent: number;
      takeProfitPercent: number;
      maxDailyLoss: number;
      maxDrawdown: number;
    };
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
  status?: 'active' | 'inactive' | 'paused';
  isActive?: boolean;
}

// AI Analysis Types
export interface AIAnalysisRequest {
  symbol: string;
  analysisType: 'trend' | 'support_resistance' | 'pattern' | 'sentiment';
  timeframe: '1h' | '4h' | '1d' | '1w';
  parameters?: Record<string, any>;
}

export interface AIAnalysisResponse {
  symbol: string;
  analysisType: 'trend' | 'support_resistance' | 'pattern' | 'sentiment';
  timeframe: string;
  confidence: number;
  signal: 'buy' | 'sell' | 'hold';
  analysis: {
    trend?: {
      direction: 'bullish' | 'bearish' | 'sideways';
      strength: number;
    };
    supportResistance?: {
      support: number[];
      resistance: number[];
    };
    patterns?: string[];
    sentiment?: {
      score: number;
      label: 'positive' | 'negative' | 'neutral';
    };
  };
  recommendations: {
    action: 'buy' | 'sell' | 'hold';
    price: number;
    confidence: number;
    reasoning: string;
  }[];
  generatedAt: string;
}

export interface AIRecommendationResponse {
  id: string;
  symbol: string;
  action: 'buy' | 'sell' | 'hold';
  price: number;
  confidence: number;
  reasoning: string;
  status: 'active' | 'executed' | 'expired';
  createdAt: string;
  expiresAt: string;
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
  last: number;
  change: number;
  changePercent: number;
  volume: number;
  timestamp: string;
}

export interface WebSocketOrderUpdate {
  id: string;
  symbol: string;
  status: 'pending' | 'filled' | 'cancelled' | 'rejected';
  filledQuantity: number;
  averagePrice?: number;
  updatedAt: string;
}

export interface WebSocketPositionUpdate {
  id: string;
  symbol: string;
  quantity: number;
  currentPrice: number;
  unrealizedPnL: number;
  updatedAt: string;
}

export interface WebSocketPortfolioUpdate {
  totalValue: number;
  availableBalance: number;
  unrealizedPnL: number;
  dayPnL: number;
  updatedAt: string;
}

export interface WebSocketMarketNews {
  id: string;
  title: string;
  content: string;
  source: string;
  impact: 'high' | 'medium' | 'low';
  symbols: string[];
  publishedAt: string;
}

export interface WebSocketAISignal {
  symbol: string;
  signal: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  price: number;
  generatedAt: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
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