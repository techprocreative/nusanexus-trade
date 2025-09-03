import { Strategy, StrategyRecommendation, UserProfile, SimulationResult, UserFeedback } from '../store/useAIStrategyStore';

// Mock User Profile
export const mockUserProfile: UserProfile = {
  id: 'user-1',
  email: 'trader@example.com',
  name: 'John Trader',
  riskTolerance: 'medium',
  tradingExperience: {
    yearsTrading: 3,
    preferredMarkets: ['forex', 'stocks', 'crypto'],
    tradingStyle: 'swing_trading',
    averageTradeSize: 10000
  },
  preferences: {
    maxDrawdown: 15,
    targetReturn: 20,
    notificationSettings: {
      email: true,
      push: true,
      sms: false
    }
  },
  subscriptionTier: 'premium'
};

// Mock Strategies
export const mockStrategies: Strategy[] = [
  {
    id: 'strategy-1',
    name: 'AI-Enhanced Moving Average Crossover',
    category: 'trend_following',
    description: 'Advanced moving average crossover strategy enhanced with machine learning sentiment analysis and volume confirmation.',
    parameters: {
      shortPeriod: 10,
      longPeriod: 20,
      volumeThreshold: 1.5,
      sentimentWeight: 0.3
    },
    difficultyLevel: 'intermediate',
    expectedReturn: 18.5,
    maxDrawdown: 12.3,
    winRate: 65,
    sharpeRatio: 1.42,
    isActive: true,
    tags: ['AI', 'trend-following', 'volume-analysis']
  },
  {
    id: 'strategy-2',
    name: 'RSI Mean Reversion with ML Signals',
    category: 'mean_reversion',
    description: 'RSI-based mean reversion strategy with machine learning-powered entry and exit signals for improved accuracy.',
    parameters: {
      rsiPeriod: 14,
      oversoldLevel: 25,
      overboughtLevel: 75,
      mlConfidenceThreshold: 0.7
    },
    difficultyLevel: 'advanced',
    expectedReturn: 22.1,
    maxDrawdown: 8.7,
    winRate: 72,
    sharpeRatio: 1.68,
    isActive: true,
    tags: ['RSI', 'mean-reversion', 'machine-learning']
  },
  {
    id: 'strategy-3',
    name: 'Bollinger Band Volatility Breakout',
    category: 'volatility',
    description: 'Volatility breakout strategy using Bollinger Bands with dynamic position sizing based on market volatility.',
    parameters: {
      period: 20,
      standardDeviations: 2,
      volatilityLookback: 10,
      positionSizeMultiplier: 1.2
    },
    difficultyLevel: 'intermediate',
    expectedReturn: 16.8,
    maxDrawdown: 14.2,
    winRate: 58,
    sharpeRatio: 1.25,
    isActive: true,
    tags: ['bollinger-bands', 'volatility', 'breakout']
  },
  {
    id: 'strategy-4',
    name: 'Momentum Factor Model',
    category: 'momentum',
    description: 'Multi-factor momentum strategy combining price momentum, earnings momentum, and analyst revision momentum.',
    parameters: {
      priceMomentumPeriod: 12,
      earningsWeight: 0.4,
      analystWeight: 0.3,
      rebalanceFrequency: 'monthly'
    },
    difficultyLevel: 'expert',
    expectedReturn: 25.3,
    maxDrawdown: 18.5,
    winRate: 61,
    sharpeRatio: 1.55,
    isActive: true,
    tags: ['momentum', 'multi-factor', 'fundamental-analysis']
  },
  {
    id: 'strategy-5',
    name: 'Statistical Arbitrage Pairs',
    category: 'arbitrage',
    description: 'Statistical arbitrage strategy identifying and trading mean-reverting pairs with cointegration analysis.',
    parameters: {
      lookbackPeriod: 252,
      entryThreshold: 2.0,
      exitThreshold: 0.5,
      maxHoldingPeriod: 30
    },
    difficultyLevel: 'expert',
    expectedReturn: 14.2,
    maxDrawdown: 6.8,
    winRate: 78,
    sharpeRatio: 1.89,
    isActive: true,
    tags: ['arbitrage', 'pairs-trading', 'statistical']
  }
];

// Mock Strategy Recommendations
export const mockRecommendations: StrategyRecommendation[] = [
  {
    id: 'rec-1',
    userId: 'user-1',
    strategyId: 'strategy-2',
    strategy: mockStrategies[1],
    confidenceScore: 0.89,
    reasoning: [
      'High compatibility with your medium risk tolerance',
      'Strong performance in current market conditions',
      'Matches your swing trading style preference',
      'Excellent risk-adjusted returns with 1.68 Sharpe ratio'
    ],
    marketSuitability: {
      bullish: 0.75,
      bearish: 0.85,
      sideways: 0.92
    },
    riskAssessment: {
      riskScore: 6,
      volatilityRating: 'medium',
      complexityRating: 'complex'
    },
    implementationDifficulty: 7,
    status: 'pending',
    createdAt: new Date('2024-01-15T10:30:00Z')
  },
  {
    id: 'rec-2',
    userId: 'user-1',
    strategyId: 'strategy-1',
    strategy: mockStrategies[0],
    confidenceScore: 0.82,
    reasoning: [
      'Perfect match for intermediate traders',
      'AI enhancement aligns with modern trading preferences',
      'Good balance of returns and risk management',
      'Strong volume confirmation reduces false signals'
    ],
    marketSuitability: {
      bullish: 0.88,
      bearish: 0.45,
      sideways: 0.62
    },
    riskAssessment: {
      riskScore: 5,
      volatilityRating: 'medium',
      complexityRating: 'moderate'
    },
    implementationDifficulty: 5,
    status: 'viewed',
    createdAt: new Date('2024-01-14T14:20:00Z')
  },
  {
    id: 'rec-3',
    userId: 'user-1',
    strategyId: 'strategy-3',
    strategy: mockStrategies[2],
    confidenceScore: 0.76,
    reasoning: [
      'Suitable for current volatile market environment',
      'Dynamic position sizing helps manage risk',
      'Good entry-level strategy for volatility trading',
      'Reasonable drawdown expectations'
    ],
    marketSuitability: {
      bullish: 0.65,
      bearish: 0.70,
      sideways: 0.45
    },
    riskAssessment: {
      riskScore: 6,
      volatilityRating: 'high',
      complexityRating: 'moderate'
    },
    implementationDifficulty: 6,
    status: 'pending',
    createdAt: new Date('2024-01-13T09:15:00Z')
  }
];

// Mock Simulation Results
export const mockSimulationResults: SimulationResult[] = [
  {
    id: 'sim-1',
    strategyId: 'strategy-2',
    parameters: {
      rsiPeriod: 14,
      oversoldLevel: 25,
      overboughtLevel: 75,
      mlConfidenceThreshold: 0.7
    },
    results: {
      expectedReturn: 22.1,
      volatility: 15.8,
      var95: -12.5,
      var99: -18.3,
      expectedShortfall: -15.7,
      probabilityOfLoss: 0.23,
      outcomes: Array.from({ length: 1000 }, () => Math.random() * 50 - 10)
    },
    createdAt: new Date('2024-01-15T16:45:00Z')
  },
  {
    id: 'sim-2',
    strategyId: 'strategy-1',
    parameters: {
      shortPeriod: 10,
      longPeriod: 20,
      volumeThreshold: 1.5,
      sentimentWeight: 0.3
    },
    results: {
      expectedReturn: 18.5,
      volatility: 12.3,
      var95: -8.7,
      var99: -13.2,
      expectedShortfall: -11.1,
      probabilityOfLoss: 0.28,
      outcomes: Array.from({ length: 1000 }, () => Math.random() * 40 - 8)
    },
    createdAt: new Date('2024-01-14T11:30:00Z')
  }
];

// Mock User Feedback
export const mockUserFeedback: UserFeedback[] = [
  {
    id: 'feedback-1',
    userId: 'user-1',
    userName: 'John Doe',
    userAvatar: '/api/placeholder/40/40',
    isVerified: true,
    recommendationId: 'rec-1',
    strategyName: 'ML Momentum Strategy',
    rating: 5,
    comment: 'Excellent strategy recommendation! The ML signals have been very accurate and the risk management is solid.',
    comments: 'Excellent strategy recommendation! The ML signals have been very accurate and the risk management is solid.',
    category: 'performance',
    implemented: true,
    performanceData: {
      totalReturn: 24.3,
      annualizedReturn: 23.8,
      volatility: 14.2,
      sharpeRatio: 1.72,
      maxDrawdown: 7.8,
      winRate: 74,
      profitFactor: 2.1,
      averageWin: 2.8,
      averageLoss: -1.3,
      totalTrades: 156
    },
    helpfulCount: 12,
    createdAt: new Date('2024-01-20T13:25:00Z')
  },
  {
    id: 'feedback-2',
    userId: 'user-1',
    userName: 'Jane Smith',
    userAvatar: '/api/placeholder/40/40',
    isVerified: false,
    recommendationId: 'rec-2',
    strategyName: 'Trend Following Strategy',
    rating: 4,
    comment: 'Good strategy but required some parameter tuning for my specific market conditions. Overall satisfied with the results.',
    comments: 'Good strategy but required some parameter tuning for my specific market conditions. Overall satisfied with the results.',
    category: 'usability',
    implemented: true,
    performanceData: {
      totalReturn: 19.7,
      annualizedReturn: 18.9,
      volatility: 11.8,
      sharpeRatio: 1.48,
      maxDrawdown: 11.2,
      winRate: 67,
      profitFactor: 1.8,
      averageWin: 2.1,
      averageLoss: -1.2,
      totalTrades: 89
    },
    helpfulCount: 8,
    createdAt: new Date('2024-01-18T10:15:00Z')
  }
];

// Educational Content Mock Data
export const mockEducationalContent = {
  strategies: [
    {
      id: 'edu-1',
      title: 'Understanding Moving Average Crossovers',
      category: 'trend_following',
      difficulty: 'beginner',
      duration: '15 min',
      description: 'Learn the fundamentals of moving average crossover strategies and how to identify trend changes.',
      content: {
        overview: 'Moving average crossovers are one of the most popular technical analysis tools...',
        keyPoints: [
          'Simple vs Exponential Moving Averages',
          'Golden Cross and Death Cross patterns',
          'Choosing optimal periods',
          'Avoiding whipsaws in sideways markets'
        ],
        examples: [],
        quiz: []
      }
    },
    {
      id: 'edu-2',
      title: 'RSI and Mean Reversion Trading',
      category: 'mean_reversion',
      difficulty: 'intermediate',
      duration: '25 min',
      description: 'Master RSI-based mean reversion strategies and learn to identify overbought/oversold conditions.',
      content: {
        overview: 'The Relative Strength Index (RSI) is a momentum oscillator...',
        keyPoints: [
          'RSI calculation and interpretation',
          'Divergence patterns',
          'Optimal entry and exit levels',
          'Combining RSI with other indicators'
        ],
        examples: [],
        quiz: []
      }
    }
  ],
  riskManagement: [
    {
      id: 'risk-1',
      title: 'Position Sizing Fundamentals',
      difficulty: 'beginner',
      duration: '20 min',
      description: 'Learn how to properly size your positions to manage risk and maximize long-term returns.',
      keyPoints: [
        'Fixed fractional position sizing',
        'Kelly Criterion application',
        'Risk per trade guidelines',
        'Portfolio heat management'
      ]
    },
    {
      id: 'risk-2',
      title: 'Drawdown Management',
      difficulty: 'intermediate',
      duration: '30 min',
      description: 'Understand different types of drawdowns and strategies to minimize their impact.',
      keyPoints: [
        'Maximum drawdown vs average drawdown',
        'Recovery time analysis',
        'Drawdown-based position scaling',
        'Psychological aspects of drawdowns'
      ]
    }
  ]
};

// Implementation Steps Mock Data
export const mockImplementationSteps = [
  {
    id: 'step-1',
    strategyId: 'strategy-1',
    title: 'Setup Moving Average Indicators',
    description: 'Configure the short-term and long-term moving averages on your trading platform.',
    order: 1,
    status: 'pending' as const,
    estimatedTime: 15,
    difficulty: 'easy' as const,
    instructions: [
      'Add 10-period EMA to your chart',
      'Add 20-period EMA to your chart',
      'Set different colors for easy identification',
      'Ensure both are applied to closing prices'
    ],
    resources: ['Trading platform documentation', 'EMA calculation guide'],
    prerequisites: ['Trading platform access'],
    dependencies: []
  },
  {
    id: 'step-2',
    strategyId: 'strategy-1',
    title: 'Configure Volume Analysis',
    description: 'Set up volume indicators to confirm breakout signals.',
    order: 2,
    status: 'pending' as const,
    estimatedTime: 20,
    difficulty: 'medium' as const,
    instructions: [
      'Add volume histogram to your chart',
      'Calculate 20-period volume moving average',
      'Set volume threshold at 1.5x average',
      'Configure volume alerts'
    ],
    resources: ['Volume analysis guide', 'Alert setup tutorial'],
    prerequisites: ['Step 1 completed'],
    dependencies: ['step-1']
  },
  {
    id: 'step-3',
    strategyId: 'strategy-1',
    title: 'Implement Entry Rules',
    description: 'Define precise entry conditions for the strategy.',
    order: 3,
    status: 'pending' as const,
    estimatedTime: 30,
    difficulty: 'medium' as const,
    instructions: [
      'Enter long when short MA crosses above long MA',
      'Confirm with volume > 1.5x average',
      'Check sentiment score > 0.3',
      'Set stop loss at 2% below entry'
    ],
    resources: ['Entry rules documentation', 'Risk management guide'],
    prerequisites: ['Steps 1-2 completed'],
    dependencies: ['step-1', 'step-2']
  },
  {
    id: 'step-4',
    strategyId: 'strategy-1',
    title: 'Set Exit Conditions',
    description: 'Configure exit rules and risk management.',
    order: 4,
    status: 'pending' as const,
    estimatedTime: 25,
    difficulty: 'medium' as const,
    instructions: [
      'Exit when short MA crosses below long MA',
      'Take profit at 3:1 risk-reward ratio',
      'Trail stop loss using 10-period low',
      'Maximum holding period: 30 days'
    ],
    resources: ['Exit strategy guide', 'Trailing stop tutorial'],
    prerequisites: ['Step 3 completed'],
    dependencies: ['step-3']
  },
  {
    id: 'step-5',
    strategyId: 'strategy-1',
    title: 'Backtesting and Optimization',
    description: 'Test the strategy on historical data before going live.',
    order: 5,
    status: 'pending' as const,
    estimatedTime: 60,
    difficulty: 'hard' as const,
    instructions: [
      'Run backtest on 2+ years of data',
      'Analyze key performance metrics',
      'Optimize parameters if needed',
      'Paper trade for 1 month minimum'
    ],
    resources: ['Backtesting software', 'Performance analysis guide'],
    prerequisites: ['All previous steps completed'],
    dependencies: ['step-1', 'step-2', 'step-3', 'step-4']
  },
  {
    id: 'step-6',
    strategyId: 'strategy-2',
    title: 'Setup RSI Indicator',
    description: 'Configure RSI indicator for mean reversion signals.',
    order: 1,
    status: 'pending' as const,
    estimatedTime: 10,
    difficulty: 'easy' as const,
    instructions: [
      'Add 14-period RSI to your chart',
      'Set overbought level at 70',
      'Set oversold level at 30',
      'Configure RSI alerts'
    ],
    resources: ['RSI indicator guide', 'Alert configuration tutorial'],
    prerequisites: ['Trading platform access'],
    dependencies: []
  },
  {
    id: 'step-7',
    strategyId: 'strategy-2',
    title: 'Implement Mean Reversion Logic',
    description: 'Set up entry and exit rules for mean reversion strategy.',
    order: 2,
    status: 'pending' as const,
    estimatedTime: 35,
    difficulty: 'medium' as const,
    instructions: [
      'Enter short when RSI > 70',
      'Enter long when RSI < 30',
      'Confirm with price action',
      'Set tight stop losses'
    ],
    resources: ['Mean reversion strategy guide', 'Price action analysis'],
    prerequisites: ['Step 6 completed'],
    dependencies: ['step-6']
  }
];