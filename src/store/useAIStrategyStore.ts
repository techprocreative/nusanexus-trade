import { create } from 'zustand';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  riskTolerance: 'low' | 'medium' | 'high';
  tradingExperience: {
    yearsTrading: number;
    preferredMarkets: string[];
    tradingStyle: 'scalping' | 'day_trading' | 'swing_trading' | 'position_trading';
    averageTradeSize: number;
  };
  preferences: {
    maxDrawdown: number;
    targetReturn: number;
    notificationSettings: {
      email: boolean;
      push: boolean;
      sms: boolean;
    };
  };
  subscriptionTier: 'free' | 'premium' | 'professional';
}

export interface Strategy {
  id: string;
  name: string;
  category: 'trend_following' | 'mean_reversion' | 'volatility' | 'momentum' | 'arbitrage';
  description: string;
  parameters: Record<string, any>;
  difficultyLevel: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  expectedReturn: number;
  maxDrawdown: number;
  winRate: number;
  sharpeRatio: number;
  isActive: boolean;
  tags: string[];
}

export interface StrategyRecommendation {
  id: string;
  userId: string;
  strategyId: string;
  strategy: Strategy;
  confidenceScore: number;
  reasoning: string[];
  marketSuitability: {
    bullish: number;
    bearish: number;
    sideways: number;
  };
  riskAssessment: {
    riskScore: number;
    volatilityRating: 'low' | 'medium' | 'high';
    complexityRating: 'simple' | 'moderate' | 'complex';
  };
  implementationDifficulty: number;
  status: 'pending' | 'viewed' | 'implemented' | 'dismissed';
  createdAt: Date;
}

export interface PerformanceMetrics {
  totalReturn: number;
  annualizedReturn: number;
  volatility: number;
  sharpeRatio: number;
  maxDrawdown: number;
  winRate: number;
  profitFactor: number;
  averageWin: number;
  averageLoss: number;
  totalTrades: number;
}

export interface SimulationResult {
  id: string;
  strategyId: string;
  parameters: Record<string, any>;
  results: {
    expectedReturn: number;
    volatility: number;
    var95: number;
    var99: number;
    expectedShortfall: number;
    probabilityOfLoss: number;
    outcomes: number[];
  };
  createdAt: Date;
}

export interface UserFeedback {
  id: string;
  userId: string;
  recommendationId: string;
  rating: number;
  comments: string;
  implemented: boolean;
  performanceData?: PerformanceMetrics;
  createdAt: Date;
}

export interface ImplementationStep {
  id: string;
  strategyId: string;
  title: string;
  description: string;
  estimatedTime: number;
  completed: boolean;
  details: string[];
  order: number;
}

export interface EducationalContent {
  strategies: {
    id: string;
    title: string;
    category: string;
    difficulty: string;
    duration: string;
    description: string;
    content: {
      overview: string;
      keyPoints: string[];
      examples: any[];
      quiz: any[];
    };
  }[];
  riskManagement: {
    id: string;
    title: string;
    difficulty: string;
    duration: string;
    description: string;
    keyPoints: string[];
  }[];
}

interface AIStrategyState {
  // User Profile
  userProfile: UserProfile | null;
  setUserProfile: (profile: UserProfile) => void;
  updateUserProfile: (updates: Partial<UserProfile>) => void;
  
  // Strategies
  strategies: Strategy[];
  setStrategies: (strategies: Strategy[]) => void;
  addStrategy: (strategy: Strategy) => void;
  updateStrategy: (id: string, updates: Partial<Strategy>) => void;
  
  // Recommendations
  recommendations: StrategyRecommendation[];
  setRecommendations: (recommendations: StrategyRecommendation[]) => void;
  addRecommendation: (recommendation: StrategyRecommendation) => void;
  updateRecommendationStatus: (id: string, status: StrategyRecommendation['status']) => void;
  getFilteredRecommendations: (filter: string) => StrategyRecommendation[];
  
  // Simulation Results
  simulationResults: SimulationResult[];
  setSimulationResults: (results: SimulationResult[]) => void;
  addSimulationResult: (result: SimulationResult) => void;
  
  // User Feedback
  userFeedback: UserFeedback[];
  setUserFeedback: (feedback: UserFeedback[]) => void;
  addUserFeedback: (feedback: UserFeedback) => void;
  
  // Educational Content
  educationalContent: EducationalContent | null;
  setEducationalContent: (content: EducationalContent) => void;
  
  // Implementation Steps
  implementationSteps: ImplementationStep[];
  setImplementationSteps: (steps: ImplementationStep[]) => void;
  addImplementationStep: (step: ImplementationStep) => void;
  updateImplementationStep: (id: string, updates: Partial<ImplementationStep>) => void;
  
  // UI State
  selectedStrategy: Strategy | null;
  setSelectedStrategy: (strategy: Strategy | null) => void;
  
  selectedRecommendation: StrategyRecommendation | null;
  setSelectedRecommendation: (recommendation: StrategyRecommendation | null) => void;
  
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  
  error: string | null;
  setError: (error: string | null) => void;
  
  // Filters and Search
  filters: {
    category: string[];
    difficultyLevel: string[];
    riskLevel: string[];
    minConfidence: number;
  };
  setFilters: (filters: Partial<AIStrategyState['filters']>) => void;
  
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Onboarding
  onboardingCompleted: boolean;
  setOnboardingCompleted: (completed: boolean) => void;
  
  currentOnboardingStep: number;
  setCurrentOnboardingStep: (step: number) => void;
}

export const useAIStrategyStore = create<AIStrategyState>((set, get) => ({
  // User Profile
  userProfile: null,
  setUserProfile: (profile) => set({ userProfile: profile }),
  updateUserProfile: (updates) => set((state) => ({
    userProfile: state.userProfile ? { ...state.userProfile, ...updates } : null
  })),
  
  // Strategies
  strategies: [],
  setStrategies: (strategies) => set({ strategies }),
  addStrategy: (strategy) => set((state) => ({
    strategies: [...state.strategies, strategy]
  })),
  updateStrategy: (id, updates) => set((state) => ({
    strategies: state.strategies.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  
  // Recommendations
  recommendations: [],
  setRecommendations: (recommendations) => set({ recommendations }),
  addRecommendation: (recommendation) => set((state) => ({
    recommendations: [...state.recommendations, recommendation]
  })),
  updateRecommendationStatus: (id, status) => set((state) => ({
    recommendations: state.recommendations.map(r => 
      r.id === id ? { ...r, status } : r
    )
  })),
  getFilteredRecommendations: (filter) => {
    const state = get();
    if (filter === 'all') return state.recommendations;
    return state.recommendations.filter(rec => {
      switch (filter) {
        case 'high-confidence':
          return rec.confidenceScore >= 80;
        case 'low-risk':
          return rec.riskAssessment.riskScore <= 4;
        case 'trending':
          return rec.strategy.category === 'trend-following';
        default:
          return true;
      }
    });
  },
  
  // Simulation Results
  simulationResults: [],
  setSimulationResults: (results) => set({ simulationResults: results }),
  addSimulationResult: (result) => set((state) => ({
    simulationResults: [...state.simulationResults, result]
  })),
  
  // User Feedback
  userFeedback: [],
  setUserFeedback: (feedback) => set({ userFeedback: feedback }),
  addUserFeedback: (feedback) => set((state) => ({
    userFeedback: [...state.userFeedback, feedback]
  })),
  
  // Educational Content
  educationalContent: null,
  setEducationalContent: (content) => set({ educationalContent: content }),
  
  // Implementation Steps
  implementationSteps: [],
  setImplementationSteps: (steps) => set({ implementationSteps: steps }),
  addImplementationStep: (step) => set((state) => ({
    implementationSteps: [...state.implementationSteps, step]
  })),
  updateImplementationStep: (id, updates) => set((state) => ({
    implementationSteps: state.implementationSteps.map(s => s.id === id ? { ...s, ...updates } : s)
  })),
  
  // UI State
  selectedStrategy: null,
  setSelectedStrategy: (strategy) => set({ selectedStrategy: strategy }),
  
  selectedRecommendation: null,
  setSelectedRecommendation: (recommendation) => set({ selectedRecommendation: recommendation }),
  
  isLoading: false,
  setIsLoading: (loading) => set({ isLoading: loading }),
  
  error: null,
  setError: (error) => set({ error }),
  
  // Filters and Search
  filters: {
    category: [],
    difficultyLevel: [],
    riskLevel: [],
    minConfidence: 0
  },
  setFilters: (filters) => set((state) => ({
    filters: { ...state.filters, ...filters }
  })),
  
  searchQuery: '',
  setSearchQuery: (query) => set({ searchQuery: query }),
  
  // Onboarding
  onboardingCompleted: false,
  setOnboardingCompleted: (completed) => set({ onboardingCompleted: completed }),
  
  currentOnboardingStep: 0,
  setCurrentOnboardingStep: (step) => set({ currentOnboardingStep: step })
}));

// Selectors
export const useFilteredRecommendations = () => {
  const { recommendations, filters, searchQuery } = useAIStrategyStore();
  
  return recommendations.filter(rec => {
    // Category filter
    if (filters.category.length > 0 && !filters.category.includes(rec.strategy.category)) {
      return false;
    }
    
    // Difficulty filter
    if (filters.difficultyLevel.length > 0 && !filters.difficultyLevel.includes(rec.strategy.difficultyLevel)) {
      return false;
    }
    
    // Risk level filter
    if (filters.riskLevel.length > 0) {
      const riskLevel = rec.riskAssessment.riskScore > 7 ? 'high' : 
                       rec.riskAssessment.riskScore > 4 ? 'medium' : 'low';
      if (!filters.riskLevel.includes(riskLevel)) {
        return false;
      }
    }
    
    // Confidence filter
    if (rec.confidenceScore < filters.minConfidence) {
      return false;
    }
    
    // Search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      return rec.strategy.name.toLowerCase().includes(query) ||
             rec.strategy.description.toLowerCase().includes(query) ||
             rec.reasoning.some(reason => reason.toLowerCase().includes(query));
    }
    
    return true;
  });
};

export const useStrategyById = (id: string) => {
  const { strategies } = useAIStrategyStore();
  return strategies.find(strategy => strategy.id === id);
};

export const useRecommendationById = (id: string) => {
  const { recommendations } = useAIStrategyStore();
  return recommendations.find(rec => rec.id === id);
};