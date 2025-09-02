import { ApiResponse, ApiError, AuthResponse, TradingOrder, MarketData, Portfolio, Strategy, AIAnalysis } from '../types/api';

// Mock configuration
interface MockConfig {
  enabled: boolean;
  delay: { min: number; max: number };
  errorRate: number; // 0-1, probability of returning an error
  networkErrorRate: number; // 0-1, probability of network error
}

const DEFAULT_MOCK_CONFIG: MockConfig = {
  enabled: process.env.NODE_ENV === 'development',
  delay: { min: 100, max: 800 },
  errorRate: 0.1,
  networkErrorRate: 0.05,
};

// Mock data generators
class MockDataGenerator {
  private static instance: MockDataGenerator;
  private config: MockConfig;
  private requestCount = 0;

  private constructor(config: MockConfig = DEFAULT_MOCK_CONFIG) {
    this.config = config;
  }

  static getInstance(config?: MockConfig): MockDataGenerator {
    if (!MockDataGenerator.instance) {
      MockDataGenerator.instance = new MockDataGenerator(config);
    }
    return MockDataGenerator.instance;
  }

  updateConfig(config: Partial<MockConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // Utility methods
  private randomDelay(): number {
    return Math.random() * (this.config.delay.max - this.config.delay.min) + this.config.delay.min;
  }

  private shouldReturnError(): boolean {
    return Math.random() < this.config.errorRate;
  }

  private shouldReturnNetworkError(): boolean {
    return Math.random() < this.config.networkErrorRate;
  }

  private generateId(): string {
    return `mock_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private randomPrice(base: number = 100, variance: number = 0.1): number {
    return Number((base * (1 + (Math.random() - 0.5) * variance)).toFixed(2));
  }

  private randomPercentage(base: number = 0, variance: number = 10): number {
    return Number((base + (Math.random() - 0.5) * variance).toFixed(2));
  }

  // Mock response wrapper
  private async mockResponse<T>(data: T, endpoint: string): Promise<ApiResponse<T>> {
    this.requestCount++;
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, this.randomDelay()));
    
    // Simulate network errors
    if (this.shouldReturnNetworkError()) {
      throw new Error('Network error: Connection timeout');
    }
    
    // Simulate API errors
    if (this.shouldReturnError()) {
      const error: ApiError = {
        code: 'MOCK_ERROR',
        message: `Mock error for ${endpoint}`,
        details: { endpoint, requestCount: this.requestCount },
        timestamp: new Date().toISOString(),
      };
      throw error;
    }
    
    return {
      data,
      success: true,
      message: `Mock response for ${endpoint}`,
      timestamp: new Date().toISOString(),
      requestId: this.generateId(),
    };
  }

  // Authentication mocks
  async mockLogin(email: string, password: string): Promise<ApiResponse<AuthResponse>> {
    const authData: AuthResponse = {
      user: {
        id: this.generateId(),
        email,
        name: 'Mock User',
        role: 'trader',
        preferences: {
          theme: 'dark',
          language: 'en',
          notifications: true,
        },
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      },
      tokens: {
        accessToken: `mock_access_${this.generateId()}`,
        refreshToken: `mock_refresh_${this.generateId()}`,
        expiresIn: 3600,
        tokenType: 'Bearer',
      },
      permissions: ['trade', 'view_portfolio', 'manage_strategies'],
    };
    
    return this.mockResponse(authData, 'auth/login');
  }

  async mockRefreshToken(): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    const tokenData = {
      accessToken: `mock_access_${this.generateId()}`,
      expiresIn: 3600,
    };
    
    return this.mockResponse(tokenData, 'auth/refresh');
  }

  // Trading mocks
  async mockCreateOrder(orderData: Partial<TradingOrder>): Promise<ApiResponse<TradingOrder>> {
    const order: TradingOrder = {
      id: this.generateId(),
      symbol: orderData.symbol || 'BTCUSD',
      side: orderData.side || 'buy',
      type: orderData.type || 'market',
      quantity: orderData.quantity || 1,
      price: orderData.price || this.randomPrice(50000),
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'mock_user_id',
      timeInForce: orderData.timeInForce || 'GTC',
      executedQuantity: 0,
      averagePrice: 0,
      commission: 0,
      commissionAsset: 'USD',
    };
    
    return this.mockResponse(order, 'trading/orders');
  }

  async mockGetOrders(): Promise<ApiResponse<TradingOrder[]>> {
    const orders: TradingOrder[] = [
      {
        id: this.generateId(),
        symbol: 'BTCUSD',
        side: 'buy',
        type: 'limit',
        quantity: 0.5,
        price: this.randomPrice(48000),
        status: 'filled',
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3000000).toISOString(),
        userId: 'mock_user_id',
        timeInForce: 'GTC',
        executedQuantity: 0.5,
        averagePrice: this.randomPrice(48000),
        commission: 2.4,
        commissionAsset: 'USD',
      },
      {
        id: this.generateId(),
        symbol: 'ETHUSD',
        side: 'sell',
        type: 'market',
        quantity: 2,
        price: this.randomPrice(3200),
        status: 'pending',
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
        userId: 'mock_user_id',
        timeInForce: 'IOC',
        executedQuantity: 0,
        averagePrice: 0,
        commission: 0,
        commissionAsset: 'USD',
      },
    ];
    
    return this.mockResponse(orders, 'trading/orders');
  }

  // Market data mocks
  async mockGetMarketData(symbols?: string[]): Promise<ApiResponse<MarketData[]>> {
    const defaultSymbols = symbols || ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD'];
    
    const marketData: MarketData[] = defaultSymbols.map(symbol => ({
      symbol,
      price: this.randomPrice(symbol.includes('BTC') ? 50000 : symbol.includes('ETH') ? 3200 : 1),
      change24h: this.randomPercentage(0, 10),
      volume24h: Math.floor(Math.random() * 1000000),
      high24h: this.randomPrice(symbol.includes('BTC') ? 52000 : symbol.includes('ETH') ? 3400 : 1.1),
      low24h: this.randomPrice(symbol.includes('BTC') ? 48000 : symbol.includes('ETH') ? 3000 : 0.9),
      timestamp: new Date().toISOString(),
      bid: this.randomPrice(symbol.includes('BTC') ? 49950 : symbol.includes('ETH') ? 3195 : 0.995),
      ask: this.randomPrice(symbol.includes('BTC') ? 50050 : symbol.includes('ETH') ? 3205 : 1.005),
      spread: 0.1,
    }));
    
    return this.mockResponse(marketData, 'market/data');
  }

  // Portfolio mocks
  async mockGetPortfolio(): Promise<ApiResponse<Portfolio>> {
    const portfolio: Portfolio = {
      id: this.generateId(),
      userId: 'mock_user_id',
      totalValue: this.randomPrice(100000, 0.2),
      availableBalance: this.randomPrice(25000, 0.3),
      positions: [
        {
          symbol: 'BTCUSD',
          quantity: 0.5,
          averagePrice: this.randomPrice(48000),
          currentPrice: this.randomPrice(50000),
          unrealizedPnL: this.randomPercentage(0, 1000),
          realizedPnL: this.randomPercentage(0, 500),
          side: 'long',
          openTime: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          symbol: 'ETHUSD',
          quantity: 2,
          averagePrice: this.randomPrice(3100),
          currentPrice: this.randomPrice(3200),
          unrealizedPnL: this.randomPercentage(0, 200),
          realizedPnL: this.randomPercentage(0, 100),
          side: 'long',
          openTime: new Date(Date.now() - 43200000).toISOString(),
        },
      ],
      performance: {
        totalReturn: this.randomPercentage(0, 20),
        totalReturnPercentage: this.randomPercentage(0, 15),
        dayReturn: this.randomPercentage(0, 5),
        dayReturnPercentage: this.randomPercentage(0, 3),
        maxDrawdown: this.randomPercentage(-10, 5),
        sharpeRatio: Number((Math.random() * 2).toFixed(2)),
        winRate: Number((Math.random() * 0.4 + 0.4).toFixed(2)),
      },
      lastUpdated: new Date().toISOString(),
    };
    
    return this.mockResponse(portfolio, 'portfolio');
  }

  // Strategy mocks
  async mockGetStrategies(): Promise<ApiResponse<Strategy[]>> {
    const strategies: Strategy[] = [
      {
        id: this.generateId(),
        name: 'Momentum Trading',
        description: 'Buy high momentum stocks and sell when momentum decreases',
        type: 'momentum',
        status: 'active',
        parameters: {
          lookbackPeriod: 20,
          momentumThreshold: 0.05,
          stopLoss: 0.02,
          takeProfit: 0.08,
        },
        performance: {
          totalReturn: this.randomPercentage(0, 25),
          winRate: Number((Math.random() * 0.3 + 0.5).toFixed(2)),
          maxDrawdown: this.randomPercentage(-15, 5),
          sharpeRatio: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
          tradesCount: Math.floor(Math.random() * 100 + 50),
        },
        riskManagement: {
          maxPositionSize: 0.1,
          maxDailyLoss: 0.05,
          maxDrawdown: 0.15,
          riskPerTrade: 0.02,
        },
        createdAt: new Date(Date.now() - 2592000000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        userId: 'mock_user_id',
      },
      {
        id: this.generateId(),
        name: 'Mean Reversion',
        description: 'Buy oversold assets and sell overbought assets',
        type: 'mean_reversion',
        status: 'paused',
        parameters: {
          rsiPeriod: 14,
          oversoldLevel: 30,
          overboughtLevel: 70,
          stopLoss: 0.03,
          takeProfit: 0.06,
        },
        performance: {
          totalReturn: this.randomPercentage(0, 15),
          winRate: Number((Math.random() * 0.2 + 0.6).toFixed(2)),
          maxDrawdown: this.randomPercentage(-10, 3),
          sharpeRatio: Number((Math.random() * 1.2 + 0.3).toFixed(2)),
          tradesCount: Math.floor(Math.random() * 80 + 30),
        },
        riskManagement: {
          maxPositionSize: 0.08,
          maxDailyLoss: 0.03,
          maxDrawdown: 0.12,
          riskPerTrade: 0.015,
        },
        createdAt: new Date(Date.now() - 1296000000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        userId: 'mock_user_id',
      },
    ];
    
    return this.mockResponse(strategies, 'strategies');
  }

  // AI Analysis mocks
  async mockGetAIAnalysis(symbol: string): Promise<ApiResponse<AIAnalysis>> {
    const analysis: AIAnalysis = {
      id: this.generateId(),
      symbol,
      recommendation: Math.random() > 0.5 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold',
      confidence: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
      targetPrice: this.randomPrice(symbol.includes('BTC') ? 52000 : symbol.includes('ETH') ? 3400 : 1.1),
      stopLoss: this.randomPrice(symbol.includes('BTC') ? 47000 : symbol.includes('ETH') ? 2900 : 0.9),
      timeHorizon: Math.random() > 0.5 ? 'short' : Math.random() > 0.5 ? 'medium' : 'long',
      factors: [
        {
          name: 'Technical Analysis',
          weight: 0.4,
          score: Number((Math.random() * 0.6 + 0.2).toFixed(2)),
          description: 'RSI indicates oversold conditions, MACD showing bullish divergence',
        },
        {
          name: 'Market Sentiment',
          weight: 0.3,
          score: Number((Math.random() * 0.6 + 0.2).toFixed(2)),
          description: 'Social media sentiment is positive, institutional buying detected',
        },
        {
          name: 'Fundamental Analysis',
          weight: 0.3,
          score: Number((Math.random() * 0.6 + 0.2).toFixed(2)),
          description: 'Strong adoption metrics, positive regulatory developments',
        },
      ],
      risks: [
        'Market volatility remains high',
        'Regulatory uncertainty in key markets',
        'Potential for profit-taking at resistance levels',
      ],
      createdAt: new Date().toISOString(),
      modelVersion: '2.1.0',
      dataQuality: Number((Math.random() * 0.2 + 0.8).toFixed(2)),
    };
    
    return this.mockResponse(analysis, `ai/analysis/${symbol}`);
  }

  // Statistics
  getRequestCount(): number {
    return this.requestCount;
  }

  resetRequestCount(): void {
    this.requestCount = 0;
  }

  getConfig(): MockConfig {
    return { ...this.config };
  }
}

// API Mock interceptor
export class ApiMockInterceptor {
  private mockGenerator: MockDataGenerator;
  private enabledEndpoints: Set<string> = new Set();

  constructor(config?: Partial<MockConfig>) {
    this.mockGenerator = MockDataGenerator.getInstance(config);
    
    // Enable all endpoints by default in development
    if (process.env.NODE_ENV === 'development') {
      this.enableAllEndpoints();
    }
  }

  enableEndpoint(endpoint: string): void {
    this.enabledEndpoints.add(endpoint);
  }

  disableEndpoint(endpoint: string): void {
    this.enabledEndpoints.delete(endpoint);
  }

  enableAllEndpoints(): void {
    const endpoints = [
      'auth/login',
      'auth/refresh',
      'trading/orders',
      'market/data',
      'portfolio',
      'strategies',
      'ai/analysis',
    ];
    endpoints.forEach(endpoint => this.enabledEndpoints.add(endpoint));
  }

  disableAllEndpoints(): void {
    this.enabledEndpoints.clear();
  }

  isEndpointEnabled(endpoint: string): boolean {
    return this.enabledEndpoints.has(endpoint);
  }

  async handleRequest(method: string, url: string, data?: any): Promise<any> {
    const endpoint = this.extractEndpoint(url);
    
    if (!this.isEndpointEnabled(endpoint)) {
      return null; // Let the real API handle it
    }

    console.log(`🎭 Mock API: ${method} ${endpoint}`);

    // Route to appropriate mock method
    switch (endpoint) {
      case 'auth/login':
        return this.mockGenerator.mockLogin(data?.email, data?.password);
      case 'auth/refresh':
        return this.mockGenerator.mockRefreshToken();
      case 'trading/orders':
        if (method === 'POST') {
          return this.mockGenerator.mockCreateOrder(data);
        }
        return this.mockGenerator.mockGetOrders();
      case 'market/data':
        return this.mockGenerator.mockGetMarketData(data?.symbols);
      case 'portfolio':
        return this.mockGenerator.mockGetPortfolio();
      case 'strategies':
        return this.mockGenerator.mockGetStrategies();
      case 'ai/analysis':
        const symbol = this.extractSymbolFromUrl(url);
        return this.mockGenerator.mockGetAIAnalysis(symbol);
      default:
        return null;
    }
  }

  private extractEndpoint(url: string): string {
    // Extract endpoint from full URL
    const urlObj = new URL(url, 'http://localhost');
    return urlObj.pathname.replace(/^\/api\//, '').replace(/\/[^/]*$/, '').replace(/\/$/, '');
  }

  private extractSymbolFromUrl(url: string): string {
    const match = url.match(/\/([A-Z]+USD?)$/i);
    return match ? match[1].toUpperCase() : 'BTCUSD';
  }

  updateConfig(config: Partial<MockConfig>): void {
    this.mockGenerator.updateConfig(config);
  }

  getStats(): { requestCount: number; config: MockConfig; enabledEndpoints: string[] } {
    return {
      requestCount: this.mockGenerator.getRequestCount(),
      config: this.mockGenerator.getConfig(),
      enabledEndpoints: Array.from(this.enabledEndpoints),
    };
  }
}

// Singleton instance
let mockInterceptor: ApiMockInterceptor | null = null;

export const createApiMockInterceptor = (config?: Partial<MockConfig>): ApiMockInterceptor => {
  if (!mockInterceptor) {
    mockInterceptor = new ApiMockInterceptor(config);
  }
  return mockInterceptor;
};

export const getApiMockInterceptor = (): ApiMockInterceptor | null => {
  return mockInterceptor;
};

export { MockDataGenerator };
export default ApiMockInterceptor;