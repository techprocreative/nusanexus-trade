import { ApiResponse, ApiError, LoginResponse, OrderResponse, MarketData, PortfolioResponse, StrategyResponse, AIAnalysis } from '../types/api';
import { Strategy } from '../types/strategy';

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

  private constructor(config: Partial<MockConfig> = {}) {
    this.config = { ...DEFAULT_MOCK_CONFIG, ...config };
  }

  static getInstance(config?: Partial<MockConfig>): MockDataGenerator {
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
      // requestId removed as not part of ApiResponse interface
    };
  }

  // Authentication mocks
  async mockLogin(credentials: { email: string; password: string }): Promise<ApiResponse<any>> {
    // Simulate authentication logic
    if (credentials.email === 'demo@example.com' && credentials.password === 'password') {
      const userData = {
        user: {
          id: this.generateId(),
          email: credentials.email,
          name: 'Demo User',
          role: 'trader' as const,
          subscriptionPlan: 'premium' as const,
          preferences: {
            language: 'en',
            timezone: 'UTC',
            theme: 'dark' as const,
            notifications: true,
          },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
        tokens: {
          accessToken: this.generateToken(),
          refreshToken: this.generateToken(),
        },
        expiresIn: 3600,
      };
      
      return this.mockResponse(userData, 'auth/login');
    }
    
    throw new Error('Invalid credentials');
  }

  private generateToken(): string {
    return 'mock_token_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }

  async mockRefreshToken(): Promise<ApiResponse<{ accessToken: string; expiresIn: number }>> {
    const tokenData = {
      accessToken: `mock_access_${this.generateId()}`,
      expiresIn: 3600,
    };
    
    return this.mockResponse(tokenData, 'auth/refresh');
  }

  // Trading mocks
  async mockCreateOrder(orderData: Partial<OrderResponse>): Promise<ApiResponse<OrderResponse>> {
    const order: OrderResponse = {
      id: this.generateId(),
      symbol: orderData.symbol || 'BTCUSD',
      side: orderData.side || 'buy',
      type: orderData.type || 'market',
      quantity: orderData.quantity || 1,
      price: orderData.price || this.randomPrice(50000),
      status: 'pending',
      filledQuantity: 0,
      averagePrice: orderData.price || this.randomPrice(50000),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    return this.mockResponse(order, 'trading/orders');
  }

  async mockGetOrders(): Promise<ApiResponse<OrderResponse[]>> {
    const orders: OrderResponse[] = [
      {
        id: this.generateId(),
        symbol: 'BTCUSD',
        side: 'buy',
        type: 'limit',
        quantity: 0.5,
        price: this.randomPrice(48000),
        status: 'filled',
        filledQuantity: 0.5,
        averagePrice: this.randomPrice(48000),
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        updatedAt: new Date(Date.now() - 3000000).toISOString(),
      },
      {
        id: this.generateId(),
        symbol: 'ETHUSD',
        side: 'sell',
        type: 'market',
        quantity: 2,
        price: this.randomPrice(3200),
        status: 'pending',
        filledQuantity: 0,
        averagePrice: this.randomPrice(3200),
        createdAt: new Date(Date.now() - 1800000).toISOString(),
        updatedAt: new Date(Date.now() - 1800000).toISOString(),
      },
    ];
    
    return this.mockResponse(orders, 'trading/orders');
  }

  // Market data mocks
  async mockGetMarketData(symbols?: string[]): Promise<ApiResponse<MarketData[]>> {
    const defaultSymbols = symbols || ['BTCUSD', 'ETHUSD', 'ADAUSD', 'SOLUSD'];
    
    const marketData: MarketData[] = defaultSymbols.map(symbol => {
      const basePrice = symbol.includes('BTC') ? 50000 : symbol.includes('ETH') ? 3200 : 1;
      const currentPrice = this.randomPrice(basePrice);
      return {
        symbol,
        timestamp: new Date().toISOString(),
        open: this.randomPrice(basePrice * 0.98),
        high: this.randomPrice(basePrice * 1.04),
        low: this.randomPrice(basePrice * 0.96),
        close: currentPrice,
        volume: Math.floor(Math.random() * 1000000),
        bid: this.randomPrice(currentPrice * 0.999),
        ask: this.randomPrice(currentPrice * 1.001),
        spread: 0.1,
      };
    });
    
    return this.mockResponse(marketData, 'market/data');
  }

  // Portfolio mocks
  async mockGetPortfolio(): Promise<ApiResponse<PortfolioResponse>> {
    const portfolio: PortfolioResponse = {
      totalValue: 125000,
      availableBalance: 50000,
      marginUsed: 25000,
      unrealizedPnL: this.randomPercentage(0, 1000),
      realizedPnL: this.randomPercentage(0, 500),
      totalPnL: 12500,
      dayPnL: this.randomPercentage(-200, 300),
      positions: [
        {
          id: 'pos_1',
          symbol: 'BTCUSD',
          side: 'long' as const,
          quantity: 0.5,
          averagePrice: this.randomPrice(48000),
          currentPrice: this.randomPrice(50000),
          unrealizedPnL: this.randomPercentage(0, 1000),
          unrealizedPnLPercent: this.randomPercentage(-5, 15),
          realizedPnL: this.randomPercentage(0, 200),
          marginUsed: 12000,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          updatedAt: new Date(Date.now() - 3600000).toISOString(),
        },
        {
          id: 'pos_2',
          symbol: 'ETHUSD',
          side: 'long' as const,
          quantity: 2,
          averagePrice: this.randomPrice(3100),
          currentPrice: this.randomPrice(3200),
          unrealizedPnL: this.randomPercentage(0, 200),
          unrealizedPnLPercent: this.randomPercentage(-3, 8),
          realizedPnL: this.randomPercentage(0, 100),
          marginUsed: 6200,
          createdAt: new Date(Date.now() - 43200000).toISOString(),
          updatedAt: new Date(Date.now() - 1800000).toISOString(),
        },
      ],
      openOrders: 3,
      performance: {
        daily: this.randomPercentage(-2, 5),
        weekly: this.randomPercentage(-5, 12),
        monthly: this.randomPercentage(-10, 25),
        yearly: this.randomPercentage(-15, 40),
      },
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
        status: 'active' as const,
        parameters: {
          lookbackPeriod: 20,
          momentumThreshold: 0.05,
          stopLoss: 0.02,
          takeProfit: 0.08,
        },
        performanceMetrics: {
          totalTrades: Math.floor(Math.random() * 100 + 50),
          winRate: Number((Math.random() * 0.3 + 0.5).toFixed(2)),
          profitFactor: Number((Math.random() * 1.5 + 1.1).toFixed(2)),
          totalPnL: this.randomPercentage(0, 30),
          returnOnInvestment: this.randomPercentage(0, 20),
          maxDrawdown: this.randomPercentage(-15, 5),
          sharpeRatio: Number((Math.random() * 1.5 + 0.5).toFixed(2)),
          averageWin: Number((Math.random() * 500 + 100).toFixed(2)),
          averageLoss: Number((Math.random() * 300 + 50).toFixed(2)),
          consecutiveWins: Math.floor(Math.random() * 10 + 1),
          consecutiveLosses: Math.floor(Math.random() * 5 + 1),
          volatility: Number((Math.random() * 0.3 + 0.1).toFixed(3)),
          calmarRatio: Number((Math.random() * 2 + 0.5).toFixed(2)),
          sortinoRatio: Number((Math.random() * 2 + 0.8).toFixed(2)),
        },
        creatorId: 'mock_creator_id',
        createdAt: new Date(Date.now() - 2592000000).toISOString(),
        updatedAt: new Date(Date.now() - 86400000).toISOString(),
        isPublic: true,
      },
      {
        id: this.generateId(),
        name: 'Mean Reversion',
        description: 'Buy oversold assets and sell overbought assets',
        status: 'active' as const,
        parameters: {
          rsiPeriod: 14,
          oversoldLevel: 30,
          overboughtLevel: 70,
          stopLoss: 0.03,
          takeProfit: 0.06,
        },
        performanceMetrics: {
          totalTrades: Math.floor(Math.random() * 80 + 30),
          winRate: Number((Math.random() * 0.2 + 0.6).toFixed(2)),
          profitFactor: Number((Math.random() * 1.5 + 1.1).toFixed(2)),
          totalPnL: this.randomPercentage(0, 25),
          returnOnInvestment: this.randomPercentage(0, 15),
          maxDrawdown: this.randomPercentage(-10, 3),
          sharpeRatio: Number((Math.random() * 1.2 + 0.3).toFixed(2)),
          averageWin: Number((Math.random() * 400 + 80).toFixed(2)),
          averageLoss: Number((Math.random() * 250 + 40).toFixed(2)),
          consecutiveWins: Math.floor(Math.random() * 8 + 1),
          consecutiveLosses: Math.floor(Math.random() * 4 + 1),
          volatility: Number((Math.random() * 0.25 + 0.08).toFixed(3)),
          calmarRatio: Number((Math.random() * 1.8 + 0.4).toFixed(2)),
          sortinoRatio: Number((Math.random() * 1.8 + 0.6).toFixed(2)),
        },
        creatorId: 'mock_creator_id',
        createdAt: new Date(Date.now() - 1296000000).toISOString(),
        updatedAt: new Date(Date.now() - 172800000).toISOString(),
        isPublic: true,
      },
    ];
    
    return this.mockResponse(strategies, 'strategies');
  }

  // AI Analysis mocks
  async mockGetAIAnalysis(symbol: string): Promise<ApiResponse<AIAnalysis>> {
    const analysis: AIAnalysis = {
      id: this.generateId(),
      symbol,
      timeframe: '1h',
      analysisType: 'technical',
      analysisData: {},
      recommendations: [{
        action: Math.random() > 0.5 ? 'buy' : Math.random() > 0.5 ? 'sell' : 'hold',
        reasoning: 'AI-generated analysis based on market conditions',
        confidence: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
        targetPrice: this.randomPrice(symbol.includes('BTC') ? 52000 : symbol.includes('ETH') ? 3400 : 1.1),
        stopLoss: this.randomPrice(symbol.includes('BTC') ? 47000 : symbol.includes('ETH') ? 2900 : 0.9),
        timeHorizon: Math.random() > 0.5 ? 'short' : Math.random() > 0.5 ? 'medium' : 'long'
      }],
      confidenceScore: Number((Math.random() * 0.4 + 0.6).toFixed(2)),
      createdAt: new Date().toISOString()
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
        return this.mockGenerator.mockLogin({ email: data?.email, password: data?.password });
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