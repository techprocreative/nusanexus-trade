// User and Account Types
export interface User {
  id: string;
  email: string;
  name: string;
  fullName: string;
  avatar?: string;
  mt5Account?: string;
  subscriptionPlan: 'free' | 'premium' | 'pro';
  isActive: boolean;
  createdAt: string;
}

export interface AccountBalance {
  balance: number;
  equity: number;
  margin: number;
  freeMargin: number;
  marginLevel: number;
  currency: string;
  dailyPnL: number;
  totalPnL: number;
  totalPnLPercentage: number;
}

export interface ConnectionStatus {
  isConnected: boolean;
  server?: string;
  lastUpdate: string;
  ping?: number;
}

// Trading Types
export interface TradingSymbol {
  symbol: string;
  description: string;
  bid: number;
  ask: number;
  spread: number;
  change: number;
  changePercent: number;
}

export interface Trade {
  id: string;
  userId: string;
  strategyId?: string;
  symbol: string;
  tradeType: 'buy' | 'sell';
  volume: number;
  openPrice: number;
  closePrice?: number;
  currentPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  profitLoss?: number;
  currentPnL?: number;
  status: 'open' | 'closed' | 'cancelled';
  openedAt: string;
  openTime?: string;
  closedAt?: string;
}

// Strategy Types
export interface TradingStrategy {
  id: string;
  userId: string;
  name: string;
  description: string;
  strategyType: 'manual' | 'ai_generated' | 'template';
  symbols: string[];
  riskLevel: 'low' | 'medium' | 'high';
  parameters: Record<string, any>;
  riskSettings: RiskSettings;
  isActive: boolean;
  performance?: StrategyPerformance;
  createdAt: string;
  updatedAt: string;
}

export interface RiskSettings {
  maxRiskPerTrade: number; // percentage
  maxDailyLoss: number; // percentage
  maxDrawdown: number; // percentage
  positionSizing: 'fixed' | 'percentage' | 'kelly';
  stopLossType: 'fixed' | 'atr' | 'percentage';
}

export interface StrategyPerformance {
  totalTrades: number;
  winRate: number;
  profitFactor: number;
  totalProfit: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

// AI Analysis Types
export interface AIAnalysis {
  id: string;
  userId: string;
  symbol: string;
  timeframe: string;
  analysisType: 'trend' | 'support_resistance' | 'pattern' | 'sentiment';
  analysisData: Record<string, any>;
  confidenceScore: number;
  recommendations: AIRecommendation[];
  createdAt: string;
}

export interface AIRecommendation {
  action: 'buy' | 'sell' | 'hold';
  confidence: number;
  reasoning: string;
  targetPrice?: number;
  stopLoss?: number;
  timeHorizon: 'short' | 'medium' | 'long';
}

// Navigation Types
export interface NavigationItem {
  id: string;
  label: string;
  path: string;
  icon: string;
  badge?: number;
}

// Notification Types
export interface Notification {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

// Portfolio Types
export interface PortfolioItem {
  symbol: string;
  position: number;
  averagePrice: number;
  currentPrice: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
}

export interface PortfolioSummary {
  totalValue: number;
  totalPnL: number;
  totalPnLPercent: number;
  positions: PortfolioItem[];
}

// Market Data Types
export interface MarketData {
  symbol: string;
  timestamp?: string;
  bid: number;
  ask: number;
  spread: number;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  change?: number;
  changePercent?: number;
}

export type Symbol = string;

export interface AccountInfo {
  balance: number;
  equity: number;
  freeMargin: number;
  usedMargin: number;
  dailyPnL: number;
  totalReturn: number;
  currency: string;
}

export interface ChartData {
  symbol: string;
  timeframe: string;
  data: MarketData[];
}

// Settings Types
export interface UserSettings {
  theme: 'dark' | 'light';
  language: string;
  timezone: string;
  notifications: NotificationSettings;
  trading: TradingSettings;
}

export interface NotificationSettings {
  email: boolean;
  push: boolean;
  tradeAlerts: boolean;
  newsAlerts: boolean;
  priceAlerts: boolean;
}

export interface TradingSettings {
  defaultLotSize: number;
  confirmOrders: boolean;
  oneClickTrading: boolean;
  showSpread: boolean;
  soundAlerts: boolean;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasNext: boolean;
  hasPrev: boolean;
}

// Form Types
export interface LoginForm {
  email: string;
  password: string;
}

export interface ProfileForm {
  fullName: string;
  email: string;
  phone?: string;
  timezone: string;
  language: string;
}

export interface StrategyForm {
  name: string;
  description: string;
  strategyType: 'manual' | 'ai_generated' | 'template';
  parameters: Record<string, any>;
  riskSettings: RiskSettings;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  children?: React.ReactNode;
}

export interface CardProps extends BaseComponentProps {
  title?: string;
  subtitle?: string;
  loading?: boolean;
}

export interface ButtonProps extends BaseComponentProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  onClick?: () => void;
}

// Dashboard Types
export interface DashboardStats {
  winRate: number;
  totalTrades: number;
  bestPerformingPair: string;
  currentDrawdown: number;
}

export interface ActivityItem {
  id: string;
  type: 'trade' | 'strategy' | 'ai_recommendation' | 'news';
  title: string;
  description: string;
  amount?: number;
  symbol?: string;
  timestamp: string;
  status?: 'profit' | 'loss' | 'neutral';
}

export interface EquityPoint {
  timestamp: string;
  value: number;
}

export interface EquityCurveData {
  period: '1D' | '1W' | '1M';
  data: EquityPoint[];
}

export interface NewsItem {
  id: string;
  headline: string;
  summary: string;
  impact: 'high' | 'medium' | 'low';
  currency: string;
  timestamp: string;
  source: string;
}

export interface QuickStats {
  openPositions: number;
  activeStrategies: number;
  todayPnL: number;
  accountBalance: number;
}

// Store Types
export interface AppState {
  user: User | null;
  accountBalance: AccountBalance | null;
  connectionStatus: ConnectionStatus;
  notifications: Notification[];
  isLoading: boolean;
  error: string | null;
}

export interface TradingState {
  symbols: TradingSymbol[];
  activeTrades: Trade[];
  strategies: TradingStrategy[];
  selectedSymbol: string | null;
  chartData: ChartData | null;
}

export interface UIState {
  sidebarCollapsed: boolean;
  theme: 'dark' | 'light';
  activeModal: string | null;
  notifications: Notification[];
}

// WebSocket Types
export interface WebSocketMessage {
  type: 'price_update' | 'balance_update' | 'trade_update' | 'position_update' | 'positions_update' | 'single_price' | 'heartbeat' | 'pong';
  data: any;
  symbol?: string;
  timestamp: string;
}

export interface WebSocketConnectionState {
  status: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnected?: string;
  reconnectAttempts: number;
  error?: string;
}

export interface RealTimeData {
  prices: Record<string, MarketData>;
  balance: AccountBalance;
  positions: Trade[];
  lastUpdate: string;
}

export interface WebSocketConfig {
  url: string;
  reconnectInterval: number;
  maxReconnectAttempts: number;
  heartbeatInterval: number;
}