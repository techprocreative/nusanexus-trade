import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Order,
  OrderFormData,
  OrderValidationResult,
  RiskCalculation,
  OrderTemplate,
  ValidationError,
  OrderValidationError,
  InsufficientBalanceError,
  MarketClosedError,
  OrderResponse,
  ApiResponse,
  OrderType,
  OrderSide,
  OrderStatus
} from '../types/orderManagement';

interface OrderState {
  // State
  orders: Order[];
  pendingOrders: Order[];
  orderHistory: Order[];
  templates: OrderTemplate[];
  currentOrder: OrderFormData | null;
  validationResult: OrderValidationResult | null;
  riskCalculation: RiskCalculation | null;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setCurrentOrder: (order: OrderFormData) => void;
  validateOrder: (order: OrderFormData) => Promise<OrderValidationResult>;
  calculateRisk: (order: OrderFormData) => Promise<RiskCalculation>;
  submitOrder: (order: OrderFormData) => Promise<OrderResponse>;
  cancelOrder: (orderId: string) => Promise<boolean>;
  modifyOrder: (orderId: string, updates: Partial<OrderFormData>) => Promise<boolean>;
  
  // Template Management
  saveTemplate: (template: Omit<OrderTemplate, 'id' | 'createdAt'>) => void;
  deleteTemplate: (templateId: string) => void;
  loadTemplate: (templateId: string) => void;
  
  // Order Management
  fetchOrders: () => Promise<void>;
  fetchOrderHistory: () => Promise<void>;
  clearError: () => void;
  clearErrors: () => void;
  resetForm: () => void;
}

// Mock data for development
const mockOrders: Order[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    orderType: 'LIMIT',
    side: 'BUY',
    volume: 0.1,
    price: 1.0850,
    stopLoss: 1.0800,
    takeProfit: 1.0900,
    status: 'PENDING',
    createdAt: new Date('2024-01-15T10:30:00Z'),
    updatedAt: new Date('2024-01-15T10:30:00Z'),
    comment: 'EUR strength expected'
  },
  {
    id: '2',
    symbol: 'GBPUSD',
    orderType: 'MARKET',
    side: 'SELL',
    volume: 0.05,
    status: 'FILLED',
    createdAt: new Date('2024-01-15T09:15:00Z'),
    updatedAt: new Date('2024-01-15T09:16:00Z'),
    comment: 'Brexit concerns'
  }
];

const mockTemplates: OrderTemplate[] = [
  {
    id: '1',
    name: 'Conservative EUR Trade',
    symbol: 'EURUSD',
    orderType: 'LIMIT',
    side: 'BUY',
    volume: 0.1,
    stopLossDistance: 50,
    takeProfitDistance: 100,
    riskPercentage: 2,
    comment: 'Low risk EUR position',
    createdAt: new Date('2024-01-10T00:00:00Z')
  },
  {
    id: '2',
    name: 'Aggressive GBP Short',
    symbol: 'GBPUSD',
    orderType: 'MARKET',
    side: 'SELL',
    volume: 0.2,
    stopLossDistance: 30,
    takeProfitDistance: 60,
    riskPercentage: 5,
    comment: 'High conviction short',
    createdAt: new Date('2024-01-12T00:00:00Z')
  }
];

// Validation functions
const validateOrderData = async (order: OrderFormData): Promise<OrderValidationResult> => {
  const errors: ValidationError[] = [];
  const warnings: string[] = [];
  
  // Basic validation
  if (!order.symbol) {
    errors.push({ field: 'symbol', message: 'Symbol is required', code: 'REQUIRED' });
  }
  
  if (!order.volume || order.volume <= 0) {
    errors.push({ field: 'volume', message: 'Volume must be greater than 0', code: 'INVALID_VOLUME' });
  }
  
  if (order.volume && order.volume > 10) {
    warnings.push('Large position size detected. Consider risk management.');
  }
  
  if (order.orderType === 'LIMIT' && !order.price) {
    errors.push({ field: 'price', message: 'Price is required for limit orders', code: 'REQUIRED' });
  }
  
  // Risk validation
  if (order.riskPercentage && order.riskPercentage > 10) {
    errors.push({ field: 'riskPercentage', message: 'Risk percentage cannot exceed 10%', code: 'EXCESSIVE_RISK' });
  }
  
  // Stop loss validation
  if (order.stopLoss && order.price) {
    const isValidSL = order.side === 'BUY' ? order.stopLoss < order.price : order.stopLoss > order.price;
    if (!isValidSL) {
      errors.push({ field: 'stopLoss', message: 'Invalid stop loss level', code: 'INVALID_SL' });
    }
  }
  
  // Take profit validation
  if (order.takeProfit && order.price) {
    const isValidTP = order.side === 'BUY' ? order.takeProfit > order.price : order.takeProfit < order.price;
    if (!isValidTP) {
      errors.push({ field: 'takeProfit', message: 'Invalid take profit level', code: 'INVALID_TP' });
    }
  }
  
  // Mock margin calculation
  const marginRequired = (order.volume || 0) * 1000 * 0.01; // 1% margin
  const riskAmount = order.riskPercentage ? (10000 * order.riskPercentage / 100) : 0;
  
  return {
    isValid: errors.length === 0,
    errors,
    warnings,
    marginRequired,
    riskAmount
  };
};

const calculateRiskMetrics = async (order: OrderFormData): Promise<RiskCalculation> => {
  const accountBalance = 10000; // Mock account balance
  const leverage = 100;
  const price = order.price || 1.1000; // Default price
  
  const positionValue = (order.volume || 0) * 100000; // Standard lot size
  const marginRequired = positionValue / leverage;
  const riskPercentage = order.riskPercentage || 2;
  const riskAmount = accountBalance * (riskPercentage / 100);
  
  let potentialLoss = 0;
  let potentialProfit = 0;
  
  if (order.stopLoss && order.takeProfit) {
    const slDistance = Math.abs(price - order.stopLoss);
    const tpDistance = Math.abs(order.takeProfit - price);
    
    potentialLoss = slDistance * (order.volume || 0) * 100000;
    potentialProfit = tpDistance * (order.volume || 0) * 100000;
  }
  
  const riskRewardRatio = potentialLoss > 0 ? potentialProfit / potentialLoss : 0;
  
  // Determine risk level based on risk percentage and position size
  let riskLevel: 'low' | 'medium' | 'high' = 'low';
  if (riskPercentage > 5 || marginRequired > accountBalance * 0.5) {
    riskLevel = 'high';
  } else if (riskPercentage > 2 || marginRequired > accountBalance * 0.2) {
    riskLevel = 'medium';
  }

  // Calculate additional risk metrics
  const pipValue = 10; // Mock pip value for standard lot
  const maxRisk = accountBalance * 0.1; // 10% max risk
  const accountRiskPercentage = (riskAmount / accountBalance) * 100;

  return {
    positionSize: order.volume || 0,
    riskAmount,
    riskPercentage,
    marginRequired,
    leverageUsed: leverage,
    potentialProfit,
    potentialLoss,
    riskRewardRatio,
    positionValue,
    maxProfit: potentialProfit,
    maxLoss: potentialLoss,
    riskLevel,
    requiredMargin: marginRequired,
    pipValue,
    maxRisk,
    accountRiskPercentage
  };
};

// Error handler
const handleTradingError = (error: any): string => {
  if (error instanceof OrderValidationError) {
    return `Validation Error: ${error.message}`;
  }
  if (error instanceof InsufficientBalanceError) {
    return `Insufficient Balance: Required ${error.required}, Available ${error.available}`;
  }
  if (error instanceof MarketClosedError) {
    return `Market Closed: ${error.symbol} is not available for trading`;
  }
  return error.message || 'An unexpected error occurred';
};

export const useOrderStore = create<OrderState>()(devtools(
  (set, get) => ({
    // Initial state
    orders: mockOrders,
    pendingOrders: mockOrders.filter(o => o.status === 'PENDING'),
    orderHistory: [],
    templates: mockTemplates,
    currentOrder: null,
    validationResult: null,
    riskCalculation: null,
    isLoading: false,
    error: null,
    
    // Actions
    setCurrentOrder: (order: OrderFormData) => {
      set({ currentOrder: order });
      
      // Auto-validate when order changes
      get().validateOrder(order);
      get().calculateRisk(order);
    },
    
    validateOrder: async (order: OrderFormData) => {
      try {
        const result = await validateOrderData(order);
        set({ validationResult: result });
        return result;
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage });
        throw error;
      }
    },
    
    calculateRisk: async (order: OrderFormData) => {
      try {
        const calculation = await calculateRiskMetrics(order);
        set({ riskCalculation: calculation });
        return calculation;
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage });
        throw error;
      }
    },
    
    submitOrder: async (order: OrderFormData) => {
      set({ isLoading: true, error: null });
      
      try {
        // Validate before submission
        const validation = await get().validateOrder(order);
        if (!validation.isValid) {
          throw new OrderValidationError('form', 'VALIDATION_FAILED', 'Order validation failed');
        }
        
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Simulate random success/failure
        if (Math.random() > 0.1) {
          const newOrder: Order = {
            id: Date.now().toString(),
            ...order,
            orderType: order.orderType || order.type || 'MARKET',
            status: (order.orderType || order.type) === 'MARKET' ? 'FILLED' : 'PENDING',
            createdAt: new Date(),
            updatedAt: new Date()
          };
          
          set(state => ({
            orders: [...state.orders, newOrder],
            pendingOrders: newOrder.status === 'PENDING' 
              ? [...state.pendingOrders, newOrder]
              : state.pendingOrders,
            currentOrder: null,
            validationResult: null,
            riskCalculation: null,
            isLoading: false
          }));
          
          return {
            orderId: newOrder.id,
            status: newOrder.status,
            message: 'Order submitted successfully'
          };
        } else {
          throw new Error('Order rejected by broker');
        }
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage, isLoading: false });
        throw error;
      }
    },
    
    cancelOrder: async (orderId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          orders: state.orders.map(order => 
            order.id === orderId 
              ? { ...order, status: 'CANCELLED' as OrderStatus, updatedAt: new Date() }
              : order
          ),
          pendingOrders: state.pendingOrders.filter(order => order.id !== orderId),
          isLoading: false
        }));
        
        return true;
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },
    
    modifyOrder: async (orderId: string, updates: Partial<OrderFormData>) => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          orders: state.orders.map(order => 
            order.id === orderId 
              ? { ...order, ...updates, updatedAt: new Date() }
              : order
          ),
          pendingOrders: state.pendingOrders.map(order => 
            order.id === orderId 
              ? { ...order, ...updates, updatedAt: new Date() }
              : order
          ),
          isLoading: false
        }));
        
        return true;
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage, isLoading: false });
        return false;
      }
    },
    
    // Template Management
    saveTemplate: (template: Omit<OrderTemplate, 'id' | 'createdAt'>) => {
      const newTemplate: OrderTemplate = {
        ...template,
        id: Date.now().toString(),
        createdAt: new Date()
      };
      
      set(state => ({
        templates: [...state.templates, newTemplate]
      }));
    },
    
    deleteTemplate: (templateId: string) => {
      set(state => ({
        templates: state.templates.filter(t => t.id !== templateId)
      }));
    },
    
    loadTemplate: (templateId: string) => {
      const template = get().templates.find(t => t.id === templateId);
      if (template) {
        const orderData: OrderFormData = {
          symbol: template.symbol,
          orderType: template.orderType,
          side: template.side,
          volume: template.volume,
          riskPercentage: template.riskPercentage,
          comment: template.comment
        };
        
        set({ currentOrder: orderData });
        get().validateOrder(orderData);
        get().calculateRisk(orderData);
      }
    },
    
    // Data fetching
    fetchOrders: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        set({
          orders: mockOrders,
          pendingOrders: mockOrders.filter(o => o.status === 'PENDING'),
          isLoading: false
        });
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage, isLoading: false });
      }
    },
    
    fetchOrderHistory: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const historyOrders = mockOrders.filter(o => o.status === 'FILLED' || o.status === 'CANCELLED');
        set({ orderHistory: historyOrders, isLoading: false });
      } catch (error) {
        const errorMessage = handleTradingError(error);
        set({ error: errorMessage, isLoading: false });
      }
    },
    
    // Utility actions
    clearError: () => set({ error: null }),
    
    clearErrors: () => set({ error: null, validationResult: null }),
    
    resetForm: () => set({ 
      currentOrder: null, 
      validationResult: null, 
      riskCalculation: null 
    })
  }),
  { name: 'order-store' }
));