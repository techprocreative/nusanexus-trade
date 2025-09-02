import { ComponentDefinition } from '../types/strategy';

export const componentLibrary: ComponentDefinition[] = [
  // Entry/Exit Conditions
  {
    id: 'ma-cross',
    type: 'ma-cross',
    category: 'entry-exit',
    name: 'MA Cross',
    description: 'Moving Average Crossover signal',
    icon: 'TrendingUp',
    color: '#10b981',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        label: 'Fast MA Period',
        description: 'Period for the fast moving average',
        required: true,
        defaultValue: 10,
        min: 1,
        max: 200,
        validation: { min: 1, max: 200 }
      },
      {
        name: 'slowPeriod',
        type: 'number',
        label: 'Slow MA Period',
        description: 'Period for the slow moving average',
        required: true,
        defaultValue: 20,
        min: 1,
        max: 200,
        validation: { min: 1, max: 200 }
      },
      {
        name: 'maType',
        type: 'select',
        label: 'MA Type',
        description: 'Type of moving average',
        required: true,
        defaultValue: 'sma',
        options: [
          { value: 'sma', label: 'Simple MA' },
          { value: 'ema', label: 'Exponential MA' },
          { value: 'wma', label: 'Weighted MA' }
        ]
      }
    ],
    inputs: [],
    outputs: ['signal'],
    validation: {
      maxConnections: 1
    }
  },
  {
    id: 'rsi-level',
    type: 'rsi-level',
    category: 'entry-exit',
    name: 'RSI Level',
    description: 'RSI overbought/oversold levels',
    icon: 'Activity',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'RSI Period',
        description: 'Period for RSI calculation',
        required: true,
        defaultValue: 14,
        min: 2,
        max: 100,
        validation: { min: 2, max: 100 }
      },
      {
        name: 'overbought',
        type: 'number',
        label: 'Overbought Level',
        description: 'RSI overbought threshold',
        required: true,
        defaultValue: 70,
        min: 50,
        max: 95,
        validation: { min: 50, max: 95 }
      },
      {
        name: 'oversold',
        type: 'number',
        label: 'Oversold Level',
        description: 'RSI oversold threshold',
        required: true,
        defaultValue: 30,
        min: 5,
        max: 50,
        validation: { min: 5, max: 50 }
      }
    ],
    inputs: [],
    outputs: ['signal'],
    validation: {
      maxConnections: 1
    }
  },
  {
    id: 'price-level',
    type: 'price-level',
    category: 'entry-exit',
    name: 'Price Level',
    description: 'Price breakout/breakdown signal',
    icon: 'Target',
    color: '#f59e0b',
    parameters: [
      {
        name: 'level',
        type: 'number',
        label: 'Price Level',
        description: 'Target price level',
        required: true,
        defaultValue: 0,
        validation: { min: 0 }
      },
      {
        name: 'direction',
        type: 'select',
        label: 'Direction',
        description: 'Breakout direction',
        required: true,
        defaultValue: 'above',
        options: [
          { value: 'above', label: 'Above Level' },
          { value: 'below', label: 'Below Level' }
        ]
      }
    ],
    inputs: [],
    outputs: ['signal']
  },
  {
    id: 'volume-spike',
    type: 'volume-spike',
    category: 'entry-exit',
    name: 'Volume Spike',
    description: 'Volume spike detection',
    icon: 'BarChart3',
    color: '#06b6d4',
    parameters: [
      {
        name: 'multiplier',
        type: 'number',
        label: 'Volume Multiplier',
        description: 'Volume spike multiplier',
        required: true,
        defaultValue: 2,
        min: 1.1,
        max: 10,
        step: 0.1,
        validation: { min: 1.1, max: 10 }
      },
      {
        name: 'lookback',
        type: 'number',
        label: 'Lookback Period',
        description: 'Period to compare volume against',
        required: true,
        defaultValue: 20,
        min: 5,
        max: 100,
        validation: { min: 5, max: 100 }
      }
    ],
    inputs: [],
    outputs: ['signal']
  },

  // Risk Management
  {
    id: 'take-profit',
    type: 'take-profit',
    category: 'risk-management',
    name: 'Take Profit',
    description: 'Take profit exit condition',
    icon: 'TrendingUp',
    color: '#22c55e',
    parameters: [
      {
        name: 'type',
        type: 'select',
        label: 'TP Type',
        description: 'Take profit type',
        required: true,
        defaultValue: 'percentage',
        options: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed Price' },
          { value: 'atr', label: 'ATR Multiple' }
        ]
      },
      {
        name: 'value',
        type: 'number',
        label: 'TP Value',
        description: 'Take profit value',
        required: true,
        defaultValue: 2,
        min: 0.1,
        validation: { min: 0.1 }
      }
    ],
    inputs: ['entry'],
    outputs: ['exit'],
    validation: {
      requiredInputs: ['entry']
    }
  },
  {
    id: 'stop-loss',
    type: 'stop-loss',
    category: 'risk-management',
    name: 'Stop Loss',
    description: 'Stop loss exit condition',
    icon: 'TrendingDown',
    color: '#ef4444',
    parameters: [
      {
        name: 'type',
        type: 'select',
        label: 'SL Type',
        description: 'Stop loss type',
        required: true,
        defaultValue: 'percentage',
        options: [
          { value: 'percentage', label: 'Percentage' },
          { value: 'fixed', label: 'Fixed Price' },
          { value: 'atr', label: 'ATR Multiple' },
          { value: 'trailing', label: 'Trailing Stop' }
        ]
      },
      {
        name: 'value',
        type: 'number',
        label: 'SL Value',
        description: 'Stop loss value',
        required: true,
        defaultValue: 1,
        min: 0.1,
        validation: { min: 0.1 }
      }
    ],
    inputs: ['entry'],
    outputs: ['exit'],
    validation: {
      requiredInputs: ['entry']
    }
  },
  {
    id: 'position-size',
    type: 'position-size',
    category: 'risk-management',
    name: 'Position Size',
    description: 'Position sizing calculation',
    icon: 'Calculator',
    color: '#6366f1',
    parameters: [
      {
        name: 'method',
        type: 'select',
        label: 'Sizing Method',
        description: 'Position sizing method',
        required: true,
        defaultValue: 'fixed',
        options: [
          { value: 'fixed', label: 'Fixed Amount' },
          { value: 'percentage', label: 'Portfolio %' },
          { value: 'risk', label: 'Risk-based' },
          { value: 'kelly', label: 'Kelly Criterion' }
        ]
      },
      {
        name: 'value',
        type: 'number',
        label: 'Size Value',
        description: 'Position size value',
        required: true,
        defaultValue: 1000,
        min: 0.01,
        validation: { min: 0.01 }
      }
    ],
    inputs: ['signal'],
    outputs: ['size'],
    validation: {
      requiredInputs: ['signal']
    }
  },
  {
    id: 'risk-reward',
    type: 'risk-reward',
    category: 'risk-management',
    name: 'Risk/Reward',
    description: 'Risk to reward ratio filter',
    icon: 'Scale',
    color: '#f97316',
    parameters: [
      {
        name: 'minRatio',
        type: 'number',
        label: 'Min R:R Ratio',
        description: 'Minimum risk to reward ratio',
        required: true,
        defaultValue: 2,
        min: 0.5,
        max: 10,
        step: 0.1,
        validation: { min: 0.5, max: 10 }
      }
    ],
    inputs: ['entry', 'takeProfit', 'stopLoss'],
    outputs: ['filter'],
    validation: {
      requiredInputs: ['entry', 'takeProfit', 'stopLoss']
    }
  },

  // Time Filters
  {
    id: 'time-range',
    type: 'time-range',
    category: 'time-filters',
    name: 'Time Range',
    description: 'Trading time window filter',
    icon: 'Clock',
    color: '#84cc16',
    parameters: [
      {
        name: 'startTime',
        type: 'string',
        label: 'Start Time',
        description: 'Trading start time (HH:MM)',
        required: true,
        defaultValue: '09:30',
        validation: {
          pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
        }
      },
      {
        name: 'endTime',
        type: 'string',
        label: 'End Time',
        description: 'Trading end time (HH:MM)',
        required: true,
        defaultValue: '16:00',
        validation: {
          pattern: '^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$'
        }
      },
      {
        name: 'timezone',
        type: 'select',
        label: 'Timezone',
        description: 'Trading timezone',
        required: true,
        defaultValue: 'UTC',
        options: [
          { value: 'UTC', label: 'UTC' },
          { value: 'EST', label: 'Eastern' },
          { value: 'PST', label: 'Pacific' },
          { value: 'GMT', label: 'GMT' }
        ]
      }
    ],
    inputs: ['signal'],
    outputs: ['filtered'],
    validation: {
      requiredInputs: ['signal']
    }
  },
  {
    id: 'day-filter',
    type: 'day-filter',
    category: 'time-filters',
    name: 'Day Filter',
    description: 'Trading days filter',
    icon: 'Calendar',
    color: '#a855f7',
    parameters: [
      {
        name: 'allowedDays',
        type: 'select',
        label: 'Allowed Days',
        description: 'Days when trading is allowed',
        required: true,
        defaultValue: 'weekdays',
        options: [
          { value: 'all', label: 'All Days' },
          { value: 'weekdays', label: 'Weekdays Only' },
          { value: 'weekends', label: 'Weekends Only' },
          { value: 'custom', label: 'Custom Selection' }
        ]
      }
    ],
    inputs: ['signal'],
    outputs: ['filtered']
  },
  {
    id: 'session-filter',
    type: 'session-filter',
    category: 'time-filters',
    name: 'Session Filter',
    description: 'Trading session filter',
    icon: 'Globe',
    color: '#06b6d4',
    parameters: [
      {
        name: 'session',
        type: 'select',
        label: 'Trading Session',
        description: 'Market session to trade',
        required: true,
        defaultValue: 'ny',
        options: [
          { value: 'sydney', label: 'Sydney Session' },
          { value: 'tokyo', label: 'Tokyo Session' },
          { value: 'london', label: 'London Session' },
          { value: 'ny', label: 'New York Session' }
        ]
      }
    ],
    inputs: ['signal'],
    outputs: ['filtered']
  },

  // Technical Indicators
  {
    id: 'bollinger-bands',
    type: 'bollinger-bands',
    category: 'technical-indicators',
    name: 'Bollinger Bands',
    description: 'Bollinger Bands indicator',
    icon: 'Waves',
    color: '#ec4899',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'Period',
        description: 'Moving average period',
        required: true,
        defaultValue: 20,
        min: 5,
        max: 100,
        validation: { min: 5, max: 100 }
      },
      {
        name: 'deviation',
        type: 'number',
        label: 'Standard Deviation',
        description: 'Standard deviation multiplier',
        required: true,
        defaultValue: 2,
        min: 0.5,
        max: 5,
        step: 0.1,
        validation: { min: 0.5, max: 5 }
      }
    ],
    inputs: [],
    outputs: ['upper', 'middle', 'lower']
  },
  {
    id: 'macd',
    type: 'macd',
    category: 'technical-indicators',
    name: 'MACD',
    description: 'MACD indicator',
    icon: 'TrendingUp',
    color: '#14b8a6',
    parameters: [
      {
        name: 'fastPeriod',
        type: 'number',
        label: 'Fast Period',
        description: 'Fast EMA period',
        required: true,
        defaultValue: 12,
        min: 1,
        max: 50,
        validation: { min: 1, max: 50 }
      },
      {
        name: 'slowPeriod',
        type: 'number',
        label: 'Slow Period',
        description: 'Slow EMA period',
        required: true,
        defaultValue: 26,
        min: 1,
        max: 100,
        validation: { min: 1, max: 100 }
      },
      {
        name: 'signalPeriod',
        type: 'number',
        label: 'Signal Period',
        description: 'Signal line EMA period',
        required: true,
        defaultValue: 9,
        min: 1,
        max: 50,
        validation: { min: 1, max: 50 }
      }
    ],
    inputs: [],
    outputs: ['macd', 'signal', 'histogram']
  },
  {
    id: 'stochastic',
    type: 'stochastic',
    category: 'technical-indicators',
    name: 'Stochastic',
    description: 'Stochastic oscillator',
    icon: 'Activity',
    color: '#f59e0b',
    parameters: [
      {
        name: 'kPeriod',
        type: 'number',
        label: '%K Period',
        description: '%K period',
        required: true,
        defaultValue: 14,
        min: 1,
        max: 100,
        validation: { min: 1, max: 100 }
      },
      {
        name: 'dPeriod',
        type: 'number',
        label: '%D Period',
        description: '%D smoothing period',
        required: true,
        defaultValue: 3,
        min: 1,
        max: 20,
        validation: { min: 1, max: 20 }
      },
      {
        name: 'smooth',
        type: 'number',
        label: 'Smoothing',
        description: 'Internal smoothing period',
        required: true,
        defaultValue: 3,
        min: 1,
        max: 10,
        validation: { min: 1, max: 10 }
      }
    ],
    inputs: [],
    outputs: ['k', 'd']
  },
  {
    id: 'cci',
    type: 'cci',
    category: 'technical-indicators',
    name: 'Commodity Channel Index',
    description: 'CCI oscillator for identifying cyclical trends',
    icon: 'BarChart3',
    color: '#8b5cf6',
    parameters: [
      {
        name: 'period',
        type: 'number',
        label: 'Period',
        description: 'CCI calculation period',
        required: true,
        defaultValue: 20,
        min: 5,
        max: 100,
        validation: { min: 5, max: 100 }
      }
    ],
    inputs: [],
    outputs: ['cci']
  }
];

// Helper function to get components by category
export const getComponentsByCategory = (category: string) => {
  return componentLibrary.filter(component => component.category === category);
};

// Helper function to get component by type
export const getComponentByType = (type: string) => {
  return componentLibrary.find(component => component.type === type);
};