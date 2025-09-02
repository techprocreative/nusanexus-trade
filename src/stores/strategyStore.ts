import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import { supabase } from '@/lib/supabase';
import type {
  Strategy,
  StrategyFilters,
  StrategySortOptions,
  StrategyListResponse,
  BulkOperation,
  BulkOperationResult,
  BacktestResult,
  Tag,
  Favorite,
  AIRecommendationsResponse,
  AIRecommendationsRequest,
  ExportOptions,
  ExportResult,
  StrategyLibraryState,
  StrategyModalState,
  BulkOperationsState,
  AIInsightsState
} from '@/types/strategy';

interface StrategyStore extends StrategyLibraryState {
  // Modal state
  modal: StrategyModalState;
  
  // Bulk operations state
  bulkOperations: BulkOperationsState;
  
  // AI insights state
  aiInsights: AIInsightsState;
  
  // Tags and favorites
  tags: Tag[];
  favorites: Favorite[];
  
  // Actions
  fetchStrategies: (filters?: StrategyFilters, reset?: boolean) => Promise<void>;
  fetchStrategy: (id: string) => Promise<Strategy | null>;
  createStrategy: (strategy: Omit<Strategy, 'id' | 'createdAt' | 'updatedAt'>) => Promise<Strategy | null>;
  updateStrategy: (id: string, updates: Partial<Strategy>) => Promise<Strategy | null>;
  deleteStrategy: (id: string) => Promise<boolean>;
  cloneStrategy: (id: string, name?: string) => Promise<Strategy | null>;
  
  // Filtering and sorting
  setFilters: (filters: Partial<StrategyFilters>) => void;
  setSortOptions: (sortOptions: StrategySortOptions) => void;
  clearFilters: () => void;
  
  // Selection
  toggleStrategySelection: (id: string) => void;
  selectAllStrategies: () => void;
  clearSelection: () => void;
  
  // Favorites
  toggleFavorite: (strategyId: string) => Promise<void>;
  fetchFavorites: () => Promise<void>;
  
  // Tags
  fetchTags: () => Promise<void>;
  
  // Bulk operations
  performBulkOperation: (operation: BulkOperation) => Promise<BulkOperationResult>;
  setBulkOperationsOpen: (isOpen: boolean) => void;
  
  // Modal management
  openStrategyModal: (strategyId: string, tab?: StrategyModalState['activeTab']) => void;
  closeStrategyModal: () => void;
  setModalTab: (tab: StrategyModalState['activeTab']) => void;
  
  // AI insights
  fetchAIRecommendations: (request?: AIRecommendationsRequest) => Promise<void>;
  
  // Export
  exportStrategies: (strategyIds: string[], options: ExportOptions) => Promise<ExportResult>;
  
  // Backtest
  fetchBacktestResults: (strategyId: string) => Promise<BacktestResult[]>;
  
  // View mode
  setViewMode: (mode: 'grid' | 'list') => void;
  
  // Pagination
  loadMore: () => Promise<void>;
  
  // Reset state
  reset: () => void;
}

const initialFilters: StrategyFilters = {
  search: '',
  status: [],
  tags: [],
  isPublic: undefined,
  isFavorite: false
};

const initialSortOptions: StrategySortOptions = {
  field: 'updatedAt',
  direction: 'desc'
};

const initialModalState: StrategyModalState = {
  isOpen: false,
  strategyId: null,
  activeTab: 'overview',
  loading: false,
  error: null
};

const initialBulkOperationsState: BulkOperationsState = {
  isOpen: false,
  selectedStrategies: [],
  operation: null,
  loading: false,
  results: null,
  error: null
};

const initialAIInsightsState: AIInsightsState = {
  recommendations: null,
  loading: false,
  error: null,
  lastUpdated: null
};

export const useStrategyStore = create<StrategyStore>()(devtools(
  (set, get) => ({
    // Initial state
    strategies: [],
    loading: false,
    error: null,
    filters: initialFilters,
    sortOptions: initialSortOptions,
    selectedStrategies: [],
    pagination: {
      page: 1,
      limit: 12,
      totalCount: 0,
      hasMore: false
    },
    viewMode: 'grid',
    modal: initialModalState,
    bulkOperations: initialBulkOperationsState,
    aiInsights: initialAIInsightsState,
    tags: [],
    favorites: [],

    // Fetch strategies with filtering and pagination
    fetchStrategies: async (filters, reset = false) => {
      const state = get();
      const currentFilters = filters || state.filters;
      const page = reset ? 1 : state.pagination.page;
      
      set({ loading: true, error: null });
      
      try {
        let query = supabase
          .from('strategies')
          .select(`
            *,
            creator:creator_id(
              id,
              email,
              raw_user_meta_data
            ),
            favorites!inner(user_id),
            strategy_tags!inner(
              tag:tag_id(
                id,
                name,
                color
              )
            )
          `);

        // Apply filters
        if (currentFilters.search) {
          query = query.or(`name.ilike.%${currentFilters.search}%,description.ilike.%${currentFilters.search}%`);
        }
        
        if (currentFilters.status && currentFilters.status.length > 0) {
          query = query.in('status', currentFilters.status);
        }
        
        if (currentFilters.isPublic !== undefined) {
          query = query.eq('is_public', currentFilters.isPublic);
        }
        
        if (currentFilters.tags && currentFilters.tags.length > 0) {
          query = query.in('strategy_tags.tag_id', currentFilters.tags);
        }
        
        if (currentFilters.isFavorite) {
          const { data: { user } } = await supabase.auth.getUser();
          if (user) {
            query = query.eq('favorites.user_id', user.id);
          }
        }

        // Apply sorting
        const sortField = state.sortOptions.field === 'winRate' 
          ? 'performance_metrics->winRate'
          : state.sortOptions.field === 'totalPnL'
          ? 'performance_metrics->totalPnL'
          : state.sortOptions.field === 'sharpeRatio'
          ? 'performance_metrics->sharpeRatio'
          : state.sortOptions.field === 'maxDrawdown'
          ? 'performance_metrics->maxDrawdown'
          : state.sortOptions.field;
          
        query = query.order(sortField, { ascending: state.sortOptions.direction === 'asc' });

        // Apply pagination
        const from = (page - 1) * state.pagination.limit;
        const to = from + state.pagination.limit - 1;
        query = query.range(from, to);

        const { data, error, count } = await query;
        
        if (error) throw error;

        const strategies = (data || []).map(item => ({
          id: item.id,
          name: item.name,
          description: item.description,
          status: item.status,
          parameters: item.parameters,
          performanceMetrics: item.performance_metrics,
          creatorId: item.creator_id,
          createdAt: item.created_at,
          updatedAt: item.updated_at,
          isPublic: item.is_public,
          rulesExplanation: item.rules_explanation,
          creator: item.creator ? {
            id: item.creator.id,
            name: item.creator.raw_user_meta_data?.name || item.creator.email,
            email: item.creator.email,
            rating: 4.5, // Mock rating
            totalStrategies: 0, // Would need separate query
            verified: false
          } : undefined,
          tags: item.strategy_tags?.map(st => st.tag?.name) || [],
          isFavorite: item.favorites?.length > 0
        }));

        set(state => ({
          strategies: reset ? strategies : [...state.strategies, ...strategies],
          pagination: {
            ...state.pagination,
            page,
            totalCount: count || 0,
            hasMore: strategies.length === state.pagination.limit
          },
          filters: currentFilters,
          loading: false
        }));
      } catch (error) {
        set({ error: error.message, loading: false });
      }
    },

    // Fetch single strategy
    fetchStrategy: async (id) => {
      try {
        const { data, error } = await supabase
          .from('strategies')
          .select(`
            *,
            creator:creator_id(
              id,
              email,
              raw_user_meta_data
            ),
            strategy_tags(
              tag:tag_id(
                id,
                name,
                color
              )
            )
          `)
          .eq('id', id)
          .single();
          
        if (error) throw error;
        
        return {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          parameters: data.parameters,
          performanceMetrics: data.performance_metrics,
          creatorId: data.creator_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isPublic: data.is_public,
          rulesExplanation: data.rules_explanation,
          creator: data.creator ? {
            id: data.creator.id,
            name: data.creator.raw_user_meta_data?.name || data.creator.email,
            email: data.creator.email,
            rating: 4.5,
            totalStrategies: 0,
            verified: false
          } : undefined,
          tags: data.strategy_tags?.map(st => st.tag?.name) || []
        };
      } catch (error) {
        console.error('Error fetching strategy:', error);
        return null;
      }
    },

    // Create strategy
    createStrategy: async (strategy) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data, error } = await supabase
          .from('strategies')
          .insert({
            name: strategy.name,
            description: strategy.description,
            status: strategy.status,
            parameters: strategy.parameters,
            performance_metrics: strategy.performanceMetrics,
            creator_id: user.id,
            is_public: strategy.isPublic,
            rules_explanation: strategy.rulesExplanation
          })
          .select()
          .single();
          
        if (error) throw error;
        
        const newStrategy = {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          parameters: data.parameters,
          performanceMetrics: data.performance_metrics,
          creatorId: data.creator_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isPublic: data.is_public,
          rulesExplanation: data.rules_explanation
        };
        
        set(state => ({
          strategies: [newStrategy, ...state.strategies]
        }));
        
        return newStrategy;
      } catch (error) {
        console.error('Error creating strategy:', error);
        return null;
      }
    },

    // Update strategy
    updateStrategy: async (id, updates) => {
      try {
        const { data, error } = await supabase
          .from('strategies')
          .update({
            name: updates.name,
            description: updates.description,
            status: updates.status,
            parameters: updates.parameters,
            performance_metrics: updates.performanceMetrics,
            is_public: updates.isPublic,
            rules_explanation: updates.rulesExplanation
          })
          .eq('id', id)
          .select()
          .single();
          
        if (error) throw error;
        
        const updatedStrategy = {
          id: data.id,
          name: data.name,
          description: data.description,
          status: data.status,
          parameters: data.parameters,
          performanceMetrics: data.performance_metrics,
          creatorId: data.creator_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          isPublic: data.is_public,
          rulesExplanation: data.rules_explanation
        };
        
        set(state => ({
          strategies: state.strategies.map(s => s.id === id ? updatedStrategy : s)
        }));
        
        return updatedStrategy;
      } catch (error) {
        console.error('Error updating strategy:', error);
        return null;
      }
    },

    // Delete strategy
    deleteStrategy: async (id) => {
      try {
        const { error } = await supabase
          .from('strategies')
          .delete()
          .eq('id', id);
          
        if (error) throw error;
        
        set(state => ({
          strategies: state.strategies.filter(s => s.id !== id),
          selectedStrategies: state.selectedStrategies.filter(sid => sid !== id)
        }));
        
        return true;
      } catch (error) {
        console.error('Error deleting strategy:', error);
        return false;
      }
    },

    // Clone strategy
    cloneStrategy: async (id, name) => {
      try {
        const original = await get().fetchStrategy(id);
        if (!original) throw new Error('Strategy not found');
        
        const clonedStrategy = {
          ...original,
          name: name || `${original.name} (Copy)`,
          isPublic: false
        };
        
        delete clonedStrategy.id;
        delete clonedStrategy.createdAt;
        delete clonedStrategy.updatedAt;
        delete clonedStrategy.creator;
        
        return await get().createStrategy(clonedStrategy);
      } catch (error) {
        console.error('Error cloning strategy:', error);
        return null;
      }
    },

    // Set filters
    setFilters: (filters) => {
      set(state => ({
        filters: { ...state.filters, ...filters },
        pagination: { ...state.pagination, page: 1 }
      }));
      get().fetchStrategies(undefined, true);
    },

    // Set sort options
    setSortOptions: (sortOptions) => {
      set(state => ({
        sortOptions,
        pagination: { ...state.pagination, page: 1 }
      }));
      get().fetchStrategies(undefined, true);
    },

    // Clear filters
    clearFilters: () => {
      set({
        filters: initialFilters,
        pagination: { ...get().pagination, page: 1 }
      });
      get().fetchStrategies(undefined, true);
    },

    // Toggle strategy selection
    toggleStrategySelection: (id) => {
      set(state => ({
        selectedStrategies: state.selectedStrategies.includes(id)
          ? state.selectedStrategies.filter(sid => sid !== id)
          : [...state.selectedStrategies, id]
      }));
    },

    // Select all strategies
    selectAllStrategies: () => {
      set(state => ({
        selectedStrategies: state.strategies.map(s => s.id)
      }));
    },

    // Clear selection
    clearSelection: () => {
      set({ selectedStrategies: [] });
    },

    // Toggle favorite
    toggleFavorite: async (strategyId) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const { data: existing } = await supabase
          .from('favorites')
          .select('id')
          .eq('user_id', user.id)
          .eq('strategy_id', strategyId)
          .single();

        if (existing) {
          await supabase
            .from('favorites')
            .delete()
            .eq('id', existing.id);
        } else {
          await supabase
            .from('favorites')
            .insert({
              user_id: user.id,
              strategy_id: strategyId
            });
        }

        set(state => ({
          strategies: state.strategies.map(s => 
            s.id === strategyId 
              ? { ...s, isFavorite: !s.isFavorite }
              : s
          )
        }));
      } catch (error) {
        console.error('Error toggling favorite:', error);
      }
    },

    // Fetch favorites
    fetchFavorites: async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;

        const { data, error } = await supabase
          .from('favorites')
          .select('*')
          .eq('user_id', user.id);
          
        if (error) throw error;
        
        set({ favorites: data || [] });
      } catch (error) {
        console.error('Error fetching favorites:', error);
      }
    },

    // Fetch tags
    fetchTags: async () => {
      try {
        const { data, error } = await supabase
          .from('tags')
          .select('*')
          .order('name');
          
        if (error) throw error;
        
        set({ tags: data || [] });
      } catch (error) {
        console.error('Error fetching tags:', error);
      }
    },

    // Perform bulk operation
    performBulkOperation: async (operation) => {
      set(state => ({
        bulkOperations: {
          ...state.bulkOperations,
          loading: true,
          error: null,
          operation
        }
      }));

      try {
        let processedCount = 0;
        let failedCount = 0;
        const errors: string[] = [];

        for (const strategyId of operation.strategyIds) {
          try {
            switch (operation.action) {
              case 'activate':
                await get().updateStrategy(strategyId, { status: 'active' });
                break;
              case 'deactivate':
                await get().updateStrategy(strategyId, { status: 'inactive' });
                break;
              case 'delete':
                await get().deleteStrategy(strategyId);
                break;
              case 'addToFavorites':
                await get().toggleFavorite(strategyId);
                break;
              // Add other operations as needed
            }
            processedCount++;
          } catch (error) {
            failedCount++;
            errors.push(`Strategy ${strategyId}: ${error.message}`);
          }
        }

        const result: BulkOperationResult = {
          success: failedCount === 0,
          processedCount,
          failedCount,
          errors: errors.length > 0 ? errors : undefined
        };

        set(state => ({
          bulkOperations: {
            ...state.bulkOperations,
            loading: false,
            results: result
          },
          selectedStrategies: []
        }));

        return result;
      } catch (error) {
        const result: BulkOperationResult = {
          success: false,
          processedCount: 0,
          failedCount: operation.strategyIds.length,
          errors: [error.message]
        };

        set(state => ({
          bulkOperations: {
            ...state.bulkOperations,
            loading: false,
            error: error.message,
            results: result
          }
        }));

        return result;
      }
    },

    // Set bulk operations open
    setBulkOperationsOpen: (isOpen) => {
      set(state => ({
        bulkOperations: {
          ...state.bulkOperations,
          isOpen,
          results: isOpen ? state.bulkOperations.results : null,
          error: isOpen ? state.bulkOperations.error : null
        }
      }));
    },

    // Open strategy modal
    openStrategyModal: (strategyId, tab = 'overview') => {
      set({
        modal: {
          isOpen: true,
          strategyId,
          activeTab: tab,
          loading: false,
          error: null
        }
      });
    },

    // Close strategy modal
    closeStrategyModal: () => {
      set({ modal: initialModalState });
    },

    // Set modal tab
    setModalTab: (tab) => {
      set(state => ({
        modal: { ...state.modal, activeTab: tab }
      }));
    },

    // Fetch AI recommendations
    fetchAIRecommendations: async (request) => {
      set(state => ({
        aiInsights: {
          ...state.aiInsights,
          loading: true,
          error: null
        }
      }));

      try {
        // Mock AI recommendations for now
        const mockRecommendations: AIRecommendationsResponse = {
          suggestions: [
            {
              id: '1',
              type: 'strategy',
              title: 'Consider Mean Reversion Strategy',
              description: 'Current market conditions favor mean reversion approaches',
              confidence: 0.85,
              impact: 'high',
              actionable: true,
              expectedImprovement: {
                metric: 'Sharpe Ratio',
                value: 0.3,
                unit: 'points'
              }
            }
          ],
          optimizations: [],
          marketCompatibility: [
            {
              marketRegime: 'ranging',
              score: 0.9,
              reasoning: 'Current low volatility environment'
            }
          ],
          riskAssessment: {
            overallRisk: 'medium',
            diversificationScore: 0.7,
            recommendations: ['Consider adding momentum strategies']
          }
        };

        set(state => ({
          aiInsights: {
            ...state.aiInsights,
            loading: false,
            recommendations: mockRecommendations,
            lastUpdated: new Date().toISOString()
          }
        }));
      } catch (error) {
        set(state => ({
          aiInsights: {
            ...state.aiInsights,
            loading: false,
            error: error.message
          }
        }));
      }
    },

    // Export strategies
    exportStrategies: async (strategyIds, options) => {
      try {
        // Mock export functionality
        const result: ExportResult = {
          success: true,
          downloadUrl: 'blob:mock-url',
          filename: `strategies_export_${Date.now()}.${options.format}`
        };
        return result;
      } catch (error) {
        return {
          success: false,
          error: error.message
        };
      }
    },

    // Fetch backtest results
    fetchBacktestResults: async (strategyId) => {
      try {
        const { data, error } = await supabase
          .from('backtest_results')
          .select('*')
          .eq('strategy_id', strategyId)
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        return (data || []).map(item => ({
          id: item.id,
          strategyId: item.strategy_id,
          resultsData: item.results_data,
          startDate: item.start_date,
          endDate: item.end_date,
          totalReturn: item.total_return,
          maxDrawdown: item.max_drawdown,
          sharpeRatio: item.sharpe_ratio,
          createdAt: item.created_at
        }));
      } catch (error) {
        console.error('Error fetching backtest results:', error);
        return [];
      }
    },

    // Set view mode
    setViewMode: (mode) => {
      set({ viewMode: mode });
    },

    // Load more strategies
    loadMore: async () => {
      const state = get();
      if (!state.pagination.hasMore || state.loading) return;
      
      set(state => ({
        pagination: { ...state.pagination, page: state.pagination.page + 1 }
      }));
      
      await get().fetchStrategies();
    },

    // Reset state
    reset: () => {
      set({
        strategies: [],
        loading: false,
        error: null,
        filters: initialFilters,
        sortOptions: initialSortOptions,
        selectedStrategies: [],
        pagination: {
          page: 1,
          limit: 12,
          totalCount: 0,
          hasMore: false
        },
        viewMode: 'grid',
        modal: initialModalState,
        bulkOperations: initialBulkOperationsState,
        aiInsights: initialAIInsightsState,
        tags: [],
        favorites: []
      });
    }
  }),
  {
    name: 'strategy-store'
  }
));