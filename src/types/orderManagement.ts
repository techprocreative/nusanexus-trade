// Advanced Order Management System - TypeScript Interfaces

// Core Order Types
export interface Order {
  id: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  volume: number;
  price?: number;
  stopLoss?: number;
  takeProfit?: number;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  expiration?: Date;
  comment?: string;
}

export type OrderType = 'MARKET' | 'LIMIT' | 'STOP' | 'STOP_LIMIT' | 'OCO';
export type OrderSide = 'BUY' | 'SELL';
export type OrderStatus = 'PENDING' | 'FILLED' | 'CANCELLED' | 'REJECTED' | 'EXPIRED';

// Enhanced Position Management
export interface Position {
  id: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  openPrice: number;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  swap: number;
  commission: number;
  stopLoss?: number;
  takeProfit?: number;
  trailingStop?: TrailingStop;
  openTime: Date;
  comment?: string;
}

export interface TrailingStop {
  enabled: boolean;
  distance: number;
  step: number;
  currentLevel?: number;
}

// Order Form Validation
export interface OrderFormData {
  symbol: string;
  orderType?: OrderType;
  type?: OrderType;
  side: OrderSide;
  volume: number;
  quantity?: number;
  price?: number;
  stopPrice?: number;
  stopLoss?: number;
  takeProfit?: number;
  riskPercentage?: number;
  expiration?: Date;
  comment?: string;
  trailingAmount?: number;
  reduceOnly?: boolean;
  postOnly?: boolean;
  timeInForce?: string;
  expiry?: Date;
  trailingStop?: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code: string;
}

export interface OrderValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: string[];
  marginRequired: number;
  riskAmount: number;
}

// Risk Management
export interface RiskCalculation {
  positionSize: number;
  riskAmount: number;
  riskPercentage: number;
  marginRequired: number;
  leverageUsed: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  positionValue: number;
  maxProfit: number;
  maxLoss: number;
  riskLevel: 'low' | 'medium' | 'high';
  requiredMargin: number;
  pipValue: number;
  maxRisk: number;
  accountRiskPercentage: number;
}

// Trade History & Analytics
export interface TradeHistory {
  id: string;
  orderId: string;
  symbol: string;
  side: OrderSide;
  volume: number;
  openPrice: number;
  closePrice: number;
  pnl: number;
  commission: number;
  swap: number;
  openTime: Date;
  closeTime: Date;
  duration: number;
  stopLoss?: number;
  takeProfit?: number;
  comment?: string;
}

export interface PerformanceMetrics {
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  totalPnL: number;
  averageWin: number;
  averageLoss: number;
  largestWin: number;
  largestLoss: number;
  profitFactor: number;
  sharpeRatio: number;
  maxDrawdown: number;
  recoveryFactor: number;
  mostTradedSymbol: string;
  maxConsecutiveWins: number;
  bestTrade: number;
  worstTrade: number;
  totalVolume: number;
  averageTradeDuration: number;
  totalCommission: number;
}

// Order Templates
export interface OrderTemplate {
  id: string;
  name: string;
  symbol: string;
  orderType: OrderType;
  side: OrderSide;
  volume: number;
  stopLossDistance?: number;
  takeProfitDistance?: number;
  riskPercentage?: number;
  comment?: string;
  createdAt: Date;
}

// Mobile Gesture Types
export interface SwipeAction {
  direction: 'left' | 'right' | 'up' | 'down';
  action: 'close' | 'modify' | 'details' | 'cancel';
  threshold: number;
}

export interface TouchGesture {
  type: 'tap' | 'long-press' | 'swipe' | 'pinch';
  target: string;
  callback: () => void;
}

// Filtering and Sorting
export interface SortConfig {
  key: string;
  direction: 'asc' | 'desc';
}

export interface PositionFilters {
  symbol?: string;
  side?: OrderSide;
  minVolume?: number;
  maxVolume?: number;
  minPnL?: number;
  maxPnL?: number;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface HistoryFilters {
  symbol?: string;
  side?: OrderSide;
  dateFrom?: Date;
  dateTo?: Date;
  minPnL?: number;
  maxPnL?: number;
  orderType?: OrderType;
  profitability?: 'all' | 'profitable' | 'losing';
  dateRange?: '7d' | '30d' | '90d' | '1y' | 'all';
}

export interface PaginationState {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// Local Storage Schema
export const STORAGE_KEYS = {
  ORDER_TEMPLATES: 'trading_order_templates',
  USER_PREFERENCES: 'trading_user_preferences',
  TABLE_SETTINGS: 'trading_table_settings',
  MOBILE_SETTINGS: 'trading_mobile_settings'
} as const;

export interface StoredUserPreferences {
  defaultRiskPercentage: number;
  defaultOrderType: OrderType;
  autoCalculatePositionSize: boolean;
  showAdvancedOptions: boolean;
  mobileGesturesEnabled: boolean;
  notificationsEnabled: boolean;
}

export interface StoredTableSettings {
  sortColumn: string;
  sortDirection: 'asc' | 'desc';
  visibleColumns: string[];
  pageSize: number;
  filters: Record<string, any>;
}

// Error Types
export class OrderValidationError extends Error {
  constructor(
    public field: string,
    public code: string,
    message: string
  ) {
    super(message);
    this.name = 'OrderValidationError';
  }
}

export class InsufficientBalanceError extends Error {
  constructor(
    public required: number,
    public available: number
  ) {
    super(`Insufficient balance. Required: ${required}, Available: ${available}`);
    this.name = 'InsufficientBalanceError';
  }
}

export class MarketClosedError extends Error {
  constructor(public symbol: string) {
    super(`Market is closed for ${symbol}`);
    this.name = 'MarketClosedError';
  }
}

// Bulk Actions
export interface BulkAction {
  type: 'close' | 'modify' | 'export';
  positionIds: string[];
  parameters?: Record<string, any>;
}

// Export Options
export interface ExportOptions {
  format: 'csv' | 'excel';
  dateRange?: {
    from: Date;
    to: Date;
  };
  columns?: string[];
  filters?: Record<string, any>;
}

// Position Sizing Types
export interface PositionSizing {
  symbol: string;
  side: OrderSide;
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskAmount: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  marginRequired: number;
  stopLossPips: number;
  takeProfitPips: number;
  pipValue: number;
}

// Chart Data Types
export interface ChartDataPoint {
  date: Date;
  value: number;
  label?: string;
}

export interface PerformanceChartData {
  equity: ChartDataPoint[];
  drawdown: ChartDataPoint[];
  monthlyReturns: ChartDataPoint[];
  winRate: ChartDataPoint[];
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: ValidationError[];
}

export interface OrderResponse {
  orderId: string;
  status: OrderStatus;
  message: string;
  validationErrors?: ValidationError[];
}

// Real-time Updates
export interface PriceUpdate {
  symbol: string;
  bid: number;
  ask: number;
  timestamp: Date;
}

export interface PositionUpdate {
  positionId: string;
  currentPrice: number;
  pnl: number;
  pnlPercent: number;
  timestamp: Date;
}

// Mobile Specific Types
export interface MobileViewport {
  width: number;
  height: number;
  orientation: 'portrait' | 'landscape';
}

export interface TouchEvent {
  type: 'start' | 'move' | 'end';
  x: number;
  y: number;
  timestamp: number;
}

// Component Props Types
export interface BaseComponentProps {
  className?: string;
  isLoading?: boolean;
  error?: string | null;
}

export interface TableProps extends BaseComponentProps {
  sortConfig?: SortConfig;
  onSort?: (key: string) => void;
  pagination?: PaginationState;
  onPageChange?: (page: number) => void;
}

export interface FormProps extends BaseComponentProps {
  onSubmit?: (data: any) => void;
  onCancel?: () => void;
  initialData?: any;
}

// Utility Types
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;

export type OptionalFields<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;