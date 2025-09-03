export interface Strategy {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'testing';
  parameters: Record<string, any>;
  performanceMetrics: PerformanceMetrics;
  creatorId: string;
  createdAt: string;
  updatedAt: string;
  isPublic: boolean;
  rulesExplanation?: string;
  creator?: StrategyCreator;
  tags?: string[];
  isFavorite?: boolean;
  version?: string;
  metadata?: {
    created: string;
    modified: string;
    version: string;
    [key: string]: any;
  };
  components?: StrategyNode[];
  connections?: StrategyConnection[];
  validation?: ValidationResult;
}

export interface StrategyTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  tags: string[];
  strategy: Strategy;
  metadata: {
    created: string;
    author: string;
    version: string;
    downloads: number;
    rating: number;
  };
}

export interface PerformanceMetrics {
  winRate: number;
  totalPnL: number;
  sharpeRatio: number;
  maxDrawdown: number;
  totalTrades: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  consecutiveWins: number;
  consecutiveLosses: number;
  volatility: number;
  calmarRatio: number;
  sortinoRatio: number;
  returnOnInvestment: number;
  averageReturn?: number;
  bestTrade?: TradeResult;
  worstTrade?: TradeResult;
}

export interface StrategyCreator {
  id: string;
  name: string;
  email: string;
  rating: number;
  totalStrategies: number;
  verified: boolean;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  resultsData: BacktestData;
  startDate: string;
  endDate: string;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio: number;
  createdAt: string;
}

export interface BacktestData {
  equityCurve: ChartDataPoint[];
  drawdownCurve: ChartDataPoint[];
  monthlyReturns: MonthlyReturn[];
  tradeHistory: TradeResult[];
  riskMetrics: RiskMetrics;
  benchmarkComparison?: BenchmarkData;
}

export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
  priceChange?: number;
}

export interface MonthlyReturn {
  month: string;
  return: number;
  trades: number;
}

export interface TradeResult {
  id: string;
  entryDate: string;
  exitDate: string;
  symbol: string;
  side: 'long' | 'short';
  entryPrice: number;
  exitPrice: number;
  quantity: number;
  pnl: number;
  pnlPercentage: number;
  duration: number;
  commission: number;
}

export interface RiskMetrics {
  valueAtRisk: number;
  conditionalVaR: number;
  beta: number;
  alpha: number;
  correlation: number;
  informationRatio: number;
  trackingError: number;
  downside_deviation: number;
}

export interface BenchmarkData {
  name: string;
  returns: ChartDataPoint[];
  correlation: number;
  beta: number;
  alpha: number;
}

export interface StrategyParameter {
  id: string;
  strategyId: string;
  parameterName: string;
  parameterType: 'number' | 'string' | 'boolean' | 'select' | 'range';
  parameterValue: any;
  constraints: ParameterConstraints;
  description?: string;
  displayName?: string;
}

export interface ParameterConstraints {
  min?: number;
  max?: number;
  step?: number;
  options?: string[];
  required?: boolean;
  validation?: string;
}

export interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  defaultValue: any;
  constraints?: ParameterConstraints;
  description?: string;
  label?: string;
  displayName?: string;
  min?: number;
  max?: number;
  step?: number;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
  };
  options?: Array<{ label: string; value: any }>;
  required?: boolean;
}

export interface Favorite {
  id: string;
  userId: string;
  strategyId: string;
  createdAt: string;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  description?: string;
}

export interface StrategyTag {
  strategyId: string;
  tagId: string;
}

// Filter and Search Types
export interface StrategyFilters {
  search?: string;
  status?: ('active' | 'inactive' | 'testing')[];
  tags?: string[];
  creatorId?: string;
  minWinRate?: number;
  maxDrawdown?: number;
  minSharpeRatio?: number;
  dateRange?: {
    start: string;
    end: string;
  };
  isPublic?: boolean;
  isFavorite?: boolean;
}

export interface StrategySortOptions {
  field: 'name' | 'createdAt' | 'updatedAt' | 'winRate' | 'totalPnL' | 'sharpeRatio' | 'maxDrawdown';
  direction: 'asc' | 'desc';
}

export interface StrategyListResponse {
  strategies: Strategy[];
  totalCount: number;
  hasMore: boolean;
  page: number;
  limit: number;
}

// Bulk Operations Types
export interface BulkOperation {
  id: string;
  type: 'delete' | 'duplicate' | 'export' | 'activate' | 'deactivate' | 'tag' | 'archive' | 'clone';
  action: string;
  strategyIds: string[];
  data?: any;
  status?: string;
  createdAt?: string;
  progress?: number;
}

export interface BulkOperationResult {
  success: boolean;
  processedCount: number;
  failedCount: number;
  errors?: string[];
  results?: any[];
}

// AI Integration Types
export interface AISuggestion {
  id: string;
  type: 'strategy' | 'optimization' | 'risk' | 'market';
  title: string;
  description: string;
  confidence: number;
  impact: 'low' | 'medium' | 'high';
  actionable: boolean;
  priority: 'low' | 'medium' | 'high';
  expectedImpact: number;
  parameters?: Record<string, any>;
  expectedImprovement?: {
    metric: string;
    value: number;
    unit: string;
  };
}

export interface Optimization {
  id: string;
  strategyId: string;
  parameterName: string;
  currentValue: any;
  suggestedValue: any;
  expectedImprovement: number;
  confidence: number;
  reasoning: string;
  name: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  expectedReturn: number;
  riskReduction: number;
  implementationTime: string;
}

export interface CompatibilityScore {
  marketRegime: 'trending' | 'ranging' | 'volatile' | 'calm';
  score: number;
  reasoning: string;
  recommendations?: string[];
}

export interface AIRecommendationsRequest {
  marketConditions?: {
    trend: 'bullish' | 'bearish' | 'sideways';
    volatility: 'low' | 'medium' | 'high';
    volume: 'low' | 'medium' | 'high';
  };
  userPreferences?: {
    riskTolerance: 'conservative' | 'moderate' | 'aggressive';
    tradingStyle: 'scalping' | 'day-trading' | 'swing-trading' | 'position-trading';
    preferredAssets: string[];
  };
  riskTolerance?: 'low' | 'medium' | 'high';
  strategyIds?: string[];
  analysisType?: string;
}

export interface AIRecommendationsResponse {
  suggestions: AISuggestion[];
  recommendations: AISuggestion[];
  optimizations: Optimization[];
  marketCompatibility: CompatibilityScore[];
  riskAssessment: {
    overallRisk: 'low' | 'medium' | 'high';
    diversificationScore: number;
    recommendations: string[];
  };
}

// Export Types
export interface ExportOptions {
  format: 'json' | 'csv' | 'xlsx';
  fields: string[];
  includeBacktestData: boolean;
  includeParameters: boolean;
  dateRange?: {
    start: string;
    end: string;
  };
}

export interface ExportResult {
  success: boolean;
  downloadUrl?: string;
  filename?: string;
  error?: string;
}

// UI State Types
export interface StrategyLibraryState {
  strategies: Strategy[];
  loading: boolean;
  error: string | null;
  filters: StrategyFilters;
  sortOptions: StrategySortOptions;
  selectedStrategies: string[];
  pagination: {
    page: number;
    limit: number;
    totalCount: number;
    hasMore: boolean;
  };
  viewMode: 'grid' | 'list';
}

export interface StrategyModalState {
  isOpen: boolean;
  strategyId: string | null;
  activeTab: 'overview' | 'analytics' | 'parameters' | 'backtest' | 'rules';
  loading: boolean;
  error: string | null;
}

export interface BulkOperationsState {
  isOpen: boolean;
  selectedStrategies: string[];
  operation: BulkOperation | null;
  loading: boolean;
  results: BulkOperationResult | null;
  error: string | null;
}

export interface AIInsightsState {
  recommendations: AIRecommendationsResponse | null;
  optimizations: Optimization[];
  loading: boolean;
  error: string | null;
  lastUpdated: string | null;
  isOpen: boolean;
}

// Component Props Types
export interface StrategyCardProps {
  strategy: Strategy;
  onEdit?: (strategy: Strategy) => void;
  onClone?: (strategy: Strategy) => void;
  onDelete?: (strategy: Strategy) => void;
  onToggleFavorite?: (strategy: Strategy) => void;
  onSelect?: (strategyId: string, selected: boolean) => void;
  isSelected?: boolean;
  showSelection?: boolean;
}

export interface StrategyDetailsModalProps {
  isOpen: boolean;
  strategyId: string | null;
  onClose: () => void;
  onEdit?: (strategy: Strategy) => void;
  onClone?: (strategy: Strategy) => void;
  onDelete?: (strategy: Strategy) => void;
}

export interface BulkOperationsPanelProps {
  isOpen: boolean;
  selectedStrategies: string[];
  onClose: () => void;
  onOperationComplete?: (result: BulkOperationResult) => void;
}

export interface AIInsightsDashboardProps {
  strategies: Strategy[];
  onApplyOptimization?: (optimization: Optimization) => void;
  onImplementSuggestion?: (suggestion: AISuggestion) => void;
}

// API Response Types
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  totalCount: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Strategy Builder Types
export interface StrategyNode {
  id: string;
  type: string;
  position: { x: number; y: number };
  data: {
    label: string;
    [key: string]: any;
  };
  parameters?: Record<string, any>;
}

export interface StrategyEdge {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: Record<string, any>;
  data?: {
    connection: StrategyConnection;
    isValid: boolean;
  };
}

export interface StrategyBuilderState {
  currentStrategy: Strategy | null;
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  selectedComponent: string | null;
  selectedConnection: string | null;
  selectedNodeId: string | null;
  draggedComponent: ComponentDefinition | null;
  validationResult: ValidationResult | null;
  isValidating: boolean;
  componentDefinitions: ComponentDefinition[];
  componentCategories: Record<string, ComponentDefinition[]>;
  templates: StrategyTemplate[];
  
  // Actions
  setCurrentStrategy: (strategy: Strategy | null) => void;
  addComponent: (component: any) => void; // StrategyComponent will be defined elsewhere
  updateComponent: (id: string, updates: any) => void; // Partial<StrategyComponent> will be defined elsewhere
  removeComponent: (id: string) => void;
  addConnection: (connection: StrategyConnection) => void;
  removeConnection: (id: string) => void;
  setSelectedComponent: (id: string | null) => void;
  setSelectedConnection: (id: string | null) => void;
  setSelectedNodeId: (id: string | null) => void;
  validateStrategy: () => Promise<ValidationResult>;
  saveStrategy: () => Promise<void>;
  loadStrategy: (id: string) => Promise<void>;
  exportStrategy: () => string;
  importStrategy: (data: string) => void;
  clearStrategy: () => void;
  
  // Strategy Management
  duplicateStrategy: (id: string, newName?: string) => Promise<Strategy | null>;
  deleteStrategy: (id: string) => Promise<void>;
  getAllStrategies: () => Strategy[];
  searchStrategies: (query: string, tags?: string[]) => Strategy[];
  
  // Template Management
  saveAsTemplate: (templateData: Partial<StrategyTemplate>) => Promise<StrategyTemplate | null>;
  createFromTemplate: (templateId: string, customName?: string) => void;
  getAllTemplates: () => StrategyTemplate[];
  deleteTemplate: (id: string) => Promise<void>;
  
  // Sharing Features
  shareStrategy: (isPublic?: boolean) => Promise<string | null>;
  loadSharedStrategy: (shareId: string) => Promise<void>;
  getSharedStrategies: () => any[];
  
  // Utility Methods
  generateStrategyStats: () => any;
  addComponentFromDefinition: (definition: any, position: { x: number; y: number }) => void;
  updateComponentPosition: (nodeId: string, position: { x: number; y: number }) => void;
  loadStrategyAsTemplate: (strategyId: string) => Promise<void>;
  updateNodeParameters: (nodeId: string, parameters: Record<string, any>) => void;
}

export interface StrategyConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: string;
  animated?: boolean;
  style?: any;
}

export type ComponentType = string;

// Validation Types
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completeness: number;
  suggestions: string[];
}

export interface ValidationError {
  id: string;
  type: 'invalid-parameter' | 'missing-connection' | 'circular-dependency' | 'logic-error' | 'orphaned-component';
  componentId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  id: string;
  type: 'best-practice' | 'performance' | 'compatibility';
  componentId?: string;
  message: string;
  suggestion: string;
}

// Component definitions
export interface ComponentDefinition {
  id: string;
  name: string;
  type: ComponentType;
  description: string;
  category: string;
  parameters: ParameterDefinition[];
  inputs: string[];
  outputs: string[];
  icon?: any;
  color?: any;
}

export interface StrategyComponent {
  id: string;
  name: string;
  type: ComponentType;
  parameters: Record<string, any>;
  position?: { x: number; y: number };
}

export interface ComponentCategory {
  id: string;
  name: string;
  description: string;
  components: ComponentDefinition[];
}

// Utility Types
export type StrategyStatus = Strategy['status'];
export type ParameterType = StrategyParameter['parameterType'];
export type BulkActionType = BulkOperation['action'];
export type AISuggestionType = AISuggestion['type'];
export type MarketRegime = CompatibilityScore['marketRegime'];
export type RiskLevel = 'low' | 'medium' | 'high';
export type TradingSide = TradeResult['side'];
export type ViewMode = StrategyLibraryState['viewMode'];
export type ModalTab = StrategyModalState['activeTab'];

// Additional utility type aliases
export type ValidationSeverity = 'error' | 'warning' | 'info';
export type ValidationErrorType = 'missing-connection' | 'invalid-parameter' | 'circular-dependency' | 'missing-component';
export type BulkOperationType = 'delete' | 'archive' | 'duplicate' | 'export';
export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'performance';
export type SortOrder = 'asc' | 'desc';