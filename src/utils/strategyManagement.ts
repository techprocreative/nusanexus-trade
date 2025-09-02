import { Strategy, StrategyTemplate } from '../types/strategy';

// Local Storage Keys
const STRATEGIES_KEY = 'trading_strategies';
const TEMPLATES_KEY = 'strategy_templates';
const SHARED_STRATEGIES_KEY = 'shared_strategies';

// Strategy Management Interface
export interface StrategyStorage {
  id: string;
  strategy: Strategy;
  savedAt: string;
  version: string;
  tags?: string[];
  isPublic?: boolean;
}

export interface SharedStrategy extends StrategyStorage {
  authorId: string;
  authorName: string;
  downloads: number;
  rating: number;
  reviews: number;
}

// Local Storage Management
export class StrategyManager {
  // Save strategy to localStorage
  static async saveStrategy(strategy: Strategy, tags: string[] = []): Promise<void> {
    try {
      const strategies = this.getAllStrategies();
      const strategyStorage: StrategyStorage = {
        id: strategy.id,
        strategy,
        savedAt: new Date().toISOString(),
        version: strategy.version,
        tags,
        isPublic: false,
      };
      
      // Update existing or add new
      const existingIndex = strategies.findIndex(s => s.id === strategy.id);
      if (existingIndex >= 0) {
        strategies[existingIndex] = strategyStorage;
      } else {
        strategies.push(strategyStorage);
      }
      
      localStorage.setItem(STRATEGIES_KEY, JSON.stringify(strategies));
    } catch (error) {
      console.error('Failed to save strategy:', error);
      throw new Error('Failed to save strategy to local storage');
    }
  }

  // Load strategy from localStorage
  static async loadStrategy(id: string): Promise<Strategy | null> {
    try {
      const strategies = this.getAllStrategies();
      const found = strategies.find(s => s.id === id);
      return found ? found.strategy : null;
    } catch (error) {
      console.error('Failed to load strategy:', error);
      return null;
    }
  }

  // Get all saved strategies
  static getAllStrategies(): StrategyStorage[] {
    try {
      const stored = localStorage.getItem(STRATEGIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get strategies:', error);
      return [];
    }
  }

  // Delete strategy
  static async deleteStrategy(id: string): Promise<void> {
    try {
      const strategies = this.getAllStrategies();
      const filtered = strategies.filter(s => s.id !== id);
      localStorage.setItem(STRATEGIES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete strategy:', error);
      throw new Error('Failed to delete strategy');
    }
  }

  // Duplicate strategy
  static async duplicateStrategy(id: string, newName?: string): Promise<Strategy | null> {
    try {
      const original = await this.loadStrategy(id);
      if (!original) return null;

      const duplicate: Strategy = {
        ...original,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: newName || `${original.name} (Copy)`,
        metadata: {
          ...original.metadata,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      };

      await this.saveStrategy(duplicate);
      return duplicate;
    } catch (error) {
      console.error('Failed to duplicate strategy:', error);
      return null;
    }
  }

  // Export strategy to JSON
  static exportStrategy(strategy: Strategy): string {
    return JSON.stringify({
      ...strategy,
      exportedAt: new Date().toISOString(),
      exportVersion: '1.0.0',
    }, null, 2);
  }

  // Import strategy from JSON
  static importStrategy(jsonData: string): Strategy {
    try {
      const parsed = JSON.parse(jsonData);
      
      // Validate required fields
      if (!parsed.id || !parsed.name || !parsed.components) {
        throw new Error('Invalid strategy format');
      }

      // Generate new ID to avoid conflicts
      const strategy: Strategy = {
        ...parsed,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        metadata: {
          ...parsed.metadata,
          imported: new Date().toISOString(),
          modified: new Date().toISOString(),
        },
      };

      return strategy;
    } catch (error) {
      console.error('Failed to import strategy:', error);
      throw new Error('Invalid strategy file format');
    }
  }

  // Search strategies
  static searchStrategies(query: string, tags?: string[]): StrategyStorage[] {
    const strategies = this.getAllStrategies();
    
    return strategies.filter(s => {
      const matchesQuery = !query || 
        s.strategy.name.toLowerCase().includes(query.toLowerCase()) ||
        s.strategy.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesTags = !tags || tags.length === 0 ||
        tags.some(tag => s.tags?.includes(tag));
      
      return matchesQuery && matchesTags;
    });
  }
}

// Template Management
export class TemplateManager {
  // Save strategy as template
  static async saveAsTemplate(strategy: Strategy, templateData: Partial<StrategyTemplate>): Promise<StrategyTemplate> {
    try {
      const template: StrategyTemplate = {
        id: `template-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: templateData.name || strategy.name,
        description: templateData.description || strategy.description || '',
        category: templateData.category || 'custom',
        difficulty: templateData.difficulty || 'intermediate',
        tags: templateData.tags || [],
        strategy: {
          ...strategy,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`, // New ID for template instance
        },
        metadata: {
          created: new Date().toISOString(),
          author: templateData.metadata?.author || 'User',
          version: '1.0.0',
          downloads: 0,
          rating: 0,
        },
      };

      const templates = this.getAllTemplates();
      templates.push(template);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(templates));
      
      return template;
    } catch (error) {
      console.error('Failed to save template:', error);
      throw new Error('Failed to save strategy template');
    }
  }

  // Get all templates
  static getAllTemplates(): StrategyTemplate[] {
    try {
      const stored = localStorage.getItem(TEMPLATES_KEY);
      return stored ? JSON.parse(stored) : this.getDefaultTemplates();
    } catch (error) {
      console.error('Failed to get templates:', error);
      return this.getDefaultTemplates();
    }
  }

  // Create strategy from template
  static createFromTemplate(templateId: string, customName?: string): Strategy | null {
    try {
      const templates = this.getAllTemplates();
      const template = templates.find(t => t.id === templateId);
      
      if (!template) return null;

      const strategy: Strategy = {
        ...template.strategy,
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: customName || `${template.name} - ${new Date().toLocaleDateString()}`,
        metadata: {
          ...template.strategy.metadata,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          templateId: template.id,
        },
      };

      return strategy;
    } catch (error) {
      console.error('Failed to create from template:', error);
      return null;
    }
  }

  // Delete template
  static async deleteTemplate(id: string): Promise<void> {
    try {
      const templates = this.getAllTemplates();
      const filtered = templates.filter(t => t.id !== id);
      localStorage.setItem(TEMPLATES_KEY, JSON.stringify(filtered));
    } catch (error) {
      console.error('Failed to delete template:', error);
      throw new Error('Failed to delete template');
    }
  }

  // Get default templates
  private static getDefaultTemplates(): StrategyTemplate[] {
    return [
      {
        id: 'template-scalping-basic',
        name: 'Basic Scalping Strategy',
        description: 'A simple scalping strategy using moving averages and RSI',
        category: 'scalping',
        difficulty: 'beginner',
        tags: ['scalping', 'moving-average', 'rsi'],
        strategy: {
          id: 'strategy-scalping-basic',
          name: 'Basic Scalping Strategy',
          description: 'A simple scalping strategy using moving averages and RSI',
          status: 'inactive' as const,
          parameters: {},
          performanceMetrics: {
            winRate: 0,
            totalPnL: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            totalTrades: 0,
            profitFactor: 0,
            averageWin: 0,
            averageLoss: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            volatility: 0,
            calmarRatio: 0,
            sortinoRatio: 0,
            returnOnInvestment: 0,
          },
          creatorId: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: true,
          version: '1.0.0',
          components: [],
          connections: [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        metadata: {
          created: new Date().toISOString(),
          author: 'System',
          version: '1.0.0',
          downloads: 0,
          rating: 4.5,
        },
      },
      {
        id: 'template-swing-basic',
        name: 'Basic Swing Trading',
        description: 'A swing trading strategy using trend following indicators',
        category: 'swing',
        difficulty: 'intermediate',
        tags: ['swing', 'trend-following', 'macd'],
        strategy: {
          id: 'strategy-swing-basic',
          name: 'Basic Swing Trading',
          description: 'A swing trading strategy using trend following indicators',
          status: 'inactive' as const,
          parameters: {},
          performanceMetrics: {
            winRate: 0,
            totalPnL: 0,
            sharpeRatio: 0,
            maxDrawdown: 0,
            totalTrades: 0,
            profitFactor: 0,
            averageWin: 0,
            averageLoss: 0,
            consecutiveWins: 0,
            consecutiveLosses: 0,
            volatility: 0,
            calmarRatio: 0,
            sortinoRatio: 0,
            returnOnInvestment: 0,
          },
          creatorId: 'system',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          isPublic: true,
          version: '1.0.0',
          components: [],
          connections: [],
          metadata: {
            created: new Date().toISOString(),
            modified: new Date().toISOString(),
            version: '1.0.0',
          },
        },
        metadata: {
          created: new Date().toISOString(),
          author: 'System',
          version: '1.0.0',
          downloads: 0,
          rating: 4.2,
        },
      },
    ];
  }
}

// Sharing and Collaboration
export class SharingManager {
  // Share strategy (mock implementation)
  static async shareStrategy(strategy: Strategy, isPublic: boolean = false): Promise<string> {
    try {
      // In a real implementation, this would upload to a server
      const shareId = `share-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const sharedStrategy: SharedStrategy = {
        id: shareId,
        strategy,
        savedAt: new Date().toISOString(),
        version: strategy.version,
        isPublic,
        authorId: 'current-user', // Would come from auth
        authorName: 'Current User', // Would come from auth
        downloads: 0,
        rating: 0,
        reviews: 0,
      };

      // Store in local shared strategies for demo
      const shared = this.getSharedStrategies();
      shared.push(sharedStrategy);
      localStorage.setItem(SHARED_STRATEGIES_KEY, JSON.stringify(shared));
      
      return shareId;
    } catch (error) {
      console.error('Failed to share strategy:', error);
      throw new Error('Failed to share strategy');
    }
  }

  // Get shared strategies
  static getSharedStrategies(): SharedStrategy[] {
    try {
      const stored = localStorage.getItem(SHARED_STRATEGIES_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Failed to get shared strategies:', error);
      return [];
    }
  }

  // Load shared strategy
  static async loadSharedStrategy(shareId: string): Promise<Strategy | null> {
    try {
      const shared = this.getSharedStrategies();
      const found = shared.find(s => s.id === shareId);
      
      if (found) {
        // Increment download count
        found.downloads += 1;
        localStorage.setItem(SHARED_STRATEGIES_KEY, JSON.stringify(shared));
        
        // Return a copy with new ID
        return {
          ...found.strategy,
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: `${found.strategy.name} (Shared)`,
          metadata: {
            ...found.strategy.metadata,
            imported: new Date().toISOString(),
            sharedFrom: shareId,
          },
        };
      }
      
      return null;
    } catch (error) {
      console.error('Failed to load shared strategy:', error);
      return null;
    }
  }

  // Generate share URL (mock)
  static generateShareUrl(shareId: string): string {
    return `${window.location.origin}/strategies/shared/${shareId}`;
  }
}

// Utility functions
export const strategyUtils = {
  // Generate strategy statistics
  generateStats: (strategy: Strategy) => {
    return {
      componentCount: strategy.components.length,
      connectionCount: strategy.connections.length,
      complexity: strategy.components.length + strategy.connections.length,
      lastModified: strategy.metadata.modified,
      hasValidation: !!strategy.validation,
      completeness: strategy.validation?.completeness || 0,
    };
  },

  // Validate strategy name
  validateStrategyName: (name: string): boolean => {
    return name.trim().length >= 3 && name.trim().length <= 50;
  },

  // Generate unique strategy ID
  generateId: (): string => {
    return `strategy-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  },

  // Format file size
  formatFileSize: (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  },
};