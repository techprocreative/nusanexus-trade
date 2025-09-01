import { Node, Edge } from '@xyflow/react';

// Component Categories
export type ComponentCategory = 'entry-exit' | 'risk-management' | 'time-filters' | 'technical-indicators';

// Component Types
export type ComponentType = 
  | 'ma-cross' | 'rsi-level' | 'price-level' | 'volume-spike'
  | 'take-profit' | 'stop-loss' | 'position-size' | 'risk-reward'
  | 'time-range' | 'day-filter' | 'session-filter'
  | 'bollinger-bands' | 'macd' | 'stochastic';

// Parameter Types
export interface ParameterDefinition {
  name: string;
  type: 'number' | 'string' | 'boolean' | 'select' | 'range';
  label: string;
  description?: string;
  required: boolean;
  defaultValue?: any;
  min?: number;
  max?: number;
  step?: number;
  options?: { value: string | number; label: string }[];
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    custom?: (value: any) => string | null;
  };
}

// Component Definition
export interface ComponentDefinition {
  id: string;
  type: ComponentType;
  category: ComponentCategory;
  name: string;
  description: string;
  icon: string;
  color: string;
  parameters: ParameterDefinition[];
  inputs: string[];
  outputs: string[];
  validation?: {
    requiredInputs?: string[];
    maxConnections?: number;
    allowedPrevious?: ComponentType[];
    allowedNext?: ComponentType[];
  };
}

// Strategy Component Instance
export interface StrategyComponent {
  id: string;
  type: ComponentType;
  position: { x: number; y: number };
  parameters: Record<string, any>;
  metadata?: {
    label?: string;
    notes?: string;
    created: string;
    modified: string;
  };
}

// Strategy Connection
export interface StrategyConnection {
  id: string;
  source: string;
  target: string;
  sourceHandle?: string;
  targetHandle?: string;
  type?: 'default' | 'smoothstep' | 'step' | 'straight';
  animated?: boolean;
  style?: Record<string, any>;
}

// Validation Result
export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  completeness: number; // 0-100
  suggestions?: string[];
}

export interface ValidationError {
  id: string;
  type: 'missing-connection' | 'invalid-parameter' | 'circular-dependency' | 'orphaned-component';
  componentId?: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationWarning {
  id: string;
  type: 'performance' | 'best-practice' | 'optimization';
  componentId?: string;
  message: string;
  suggestion?: string;
}

// Strategy Definition
export interface Strategy {
  id: string;
  name: string;
  description?: string;
  version: string;
  components: StrategyComponent[];
  connections: StrategyConnection[];
  metadata: {
    created: string;
    modified: string;
    author?: string;
    tags?: string[];
    isTemplate?: boolean;
    isPublic?: boolean;
    imported?: string;
    sharedFrom?: string;
    templateId?: string;
  };
  validation?: ValidationResult;
  performance?: {
    backtest?: {
      returns: number;
      sharpe: number;
      maxDrawdown: number;
      winRate: number;
    };
    optimization?: {
      bestParameters: Record<string, any>;
      score: number;
    };
  };
}

// Strategy Template
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

// React Flow Node Types
export interface StrategyNode extends Node {
  type: 'strategyNode';
  data: {
    component: StrategyComponent;
    definition: ComponentDefinition;
    isValid: boolean;
    errors?: ValidationError[];
    name: string;
    description: string;
    icon: string;
    color: string;
    category: ComponentCategory;
    inputs: string[];
    outputs: string[];
    parameters: Record<string, any>;
  };
}

export interface StrategyEdge extends Edge {
  data?: {
    connection: StrategyConnection;
    isValid: boolean;
  };
}

// State Management Types
export interface StrategyBuilderState {
  // Current Strategy
  currentStrategy: Strategy | null;
  
  // Canvas State
  nodes: StrategyNode[];
  edges: StrategyEdge[];
  
  // UI State
  selectedComponent: string | null;
  selectedConnection: string | null;
  selectedNodeId: string | null;
  draggedComponent: ComponentDefinition | null;
  
  // Validation
  validationResult: ValidationResult | null;
  isValidating: boolean;
  
  // Component Library
  componentDefinitions: ComponentDefinition[];
  componentCategories: { [key in ComponentCategory]: ComponentDefinition[] };
  
  // Templates
  templates: StrategyTemplate[];
  
  // Actions
  setCurrentStrategy: (strategy: Strategy | null) => void;
  addComponent: (component: StrategyComponent) => void;
  addComponentFromDefinition: (definition: ComponentDefinition, position: { x: number; y: number }) => void;
  updateComponent: (id: string, updates: Partial<StrategyComponent>) => void;
  updateNodeParameters: (id: string, parameters: Record<string, any>) => void;
  updateComponentPosition: (id: string, position: { x: number; y: number }) => void;
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
  resetBuilder: () => void;
  clearStrategy: () => void;
  
  // Enhanced Strategy Management
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
  getSharedStrategies: () => Strategy[];
  
  // Utility Methods
  generateStrategyStats: () => any;
  generateNewId: () => string;
}

// Export Types
export interface ExportFormat {
  format: 'json' | 'yaml' | 'pine-script';
  includeMetadata: boolean;
  includeValidation: boolean;
  minify: boolean;
}

export interface ExportResult {
  data: string;
  filename: string;
  mimeType: string;
}

// Backtesting Integration
export interface BacktestConfig {
  startDate: string;
  endDate: string;
  initialCapital: number;
  commission: number;
  slippage: number;
  timeframe: '1m' | '5m' | '15m' | '1h' | '4h' | '1d';
  symbol: string;
}

export interface BacktestResult {
  id: string;
  strategyId: string;
  config: BacktestConfig;
  results: {
    totalReturn: number;
    annualizedReturn: number;
    sharpeRatio: number;
    maxDrawdown: number;
    winRate: number;
    profitFactor: number;
    totalTrades: number;
    avgTrade: number;
  };
  equity: { date: string; value: number }[];
  trades: {
    entryDate: string;
    exitDate: string;
    side: 'long' | 'short';
    entryPrice: number;
    exitPrice: number;
    quantity: number;
    pnl: number;
    commission: number;
  }[];
  created: string;
}