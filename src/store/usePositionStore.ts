import { create } from 'zustand';
import { devtools } from 'zustand/middleware';
import {
  Position,
  TrailingStop,
  BulkAction,
  PositionFilters,
  SortConfig,
  PaginationState,
  OrderSide,
  ExportOptions,
  PriceUpdate,
  PositionUpdate
} from '../types/orderManagement';

interface PositionState {
  // State
  positions: Position[];
  filteredPositions: Position[];
  selectedPositions: string[];
  filters: PositionFilters;
  sortConfig: SortConfig;
  pagination: PaginationState;
  isLoading: boolean;
  error: string | null;
  
  // Real-time data
  priceUpdates: Map<string, PriceUpdate>;
  lastUpdate: Date | null;
  
  // Actions
  fetchPositions: () => Promise<void>;
  closePosition: (positionId: string) => Promise<boolean>;
  modifyPosition: (positionId: string, updates: Partial<Position>) => Promise<boolean>;
  setTrailingStop: (positionId: string, trailingStop: TrailingStop) => Promise<boolean>;
  
  // Bulk Actions
  selectPosition: (positionId: string) => void;
  selectAllPositions: () => void;
  clearSelection: () => void;
  executeBulkAction: (action: BulkAction) => Promise<boolean>;
  
  // Filtering and Sorting
  setFilters: (filters: Partial<PositionFilters>) => void;
  clearFilters: () => void;
  setSortConfig: (config: SortConfig) => void;
  setPagination: (pagination: Partial<PaginationState>) => void;
  
  // Real-time Updates
  updatePrice: (update: PriceUpdate) => void;
  updatePosition: (update: PositionUpdate) => void;
  
  // Export
  exportPositions: (options: ExportOptions) => Promise<string>;
  
  // Utility
  clearError: () => void;
  refreshPositions: () => Promise<void>;
}

// Mock positions data
const mockPositions: Position[] = [
  {
    id: '1',
    symbol: 'EURUSD',
    side: 'BUY',
    volume: 0.1,
    openPrice: 1.0850,
    currentPrice: 1.0875,
    pnl: 25.0,
    pnlPercent: 2.3,
    swap: -0.5,
    commission: 2.0,
    stopLoss: 1.0800,
    takeProfit: 1.0950,
    trailingStop: {
      enabled: false,
      distance: 20,
      step: 5
    },
    openTime: new Date('2024-01-15T08:30:00Z'),
    comment: 'EUR strength trade'
  },
  {
    id: '2',
    symbol: 'GBPUSD',
    side: 'SELL',
    volume: 0.05,
    openPrice: 1.2650,
    currentPrice: 1.2625,
    pnl: 12.5,
    pnlPercent: 1.0,
    swap: 0.3,
    commission: 1.5,
    stopLoss: 1.2700,
    takeProfit: 1.2600,
    trailingStop: {
      enabled: true,
      distance: 25,
      step: 10,
      currentLevel: 1.2675
    },
    openTime: new Date('2024-01-15T09:15:00Z'),
    comment: 'Brexit concerns short'
  },
  {
    id: '3',
    symbol: 'USDJPY',
    side: 'BUY',
    volume: 0.2,
    openPrice: 148.50,
    currentPrice: 148.25,
    pnl: -33.6,
    pnlPercent: -1.1,
    swap: 1.2,
    commission: 3.0,
    stopLoss: 147.80,
    takeProfit: 149.20,
    trailingStop: {
      enabled: false,
      distance: 30,
      step: 10
    },
    openTime: new Date('2024-01-15T07:45:00Z'),
    comment: 'JPY weakness play'
  },
  {
    id: '4',
    symbol: 'AUDUSD',
    side: 'SELL',
    volume: 0.15,
    openPrice: 0.6750,
    currentPrice: 0.6735,
    pnl: 22.5,
    pnlPercent: 1.5,
    swap: -0.8,
    commission: 2.5,
    stopLoss: 0.6800,
    takeProfit: 0.6700,
    trailingStop: {
      enabled: true,
      distance: 15,
      step: 5,
      currentLevel: 0.6750
    },
    openTime: new Date('2024-01-15T06:20:00Z'),
    comment: 'AUD commodity weakness'
  }
];

// Utility functions
const applyFilters = (positions: Position[], filters: PositionFilters): Position[] => {
  return positions.filter(position => {
    if (filters.symbol && !position.symbol.toLowerCase().includes(filters.symbol.toLowerCase())) {
      return false;
    }
    if (filters.side && position.side !== filters.side) {
      return false;
    }
    if (filters.minVolume && position.volume < filters.minVolume) {
      return false;
    }
    if (filters.maxVolume && position.volume > filters.maxVolume) {
      return false;
    }
    if (filters.minPnL && position.pnl < filters.minPnL) {
      return false;
    }
    if (filters.maxPnL && position.pnl > filters.maxPnL) {
      return false;
    }
    if (filters.dateFrom && position.openTime < filters.dateFrom) {
      return false;
    }
    if (filters.dateTo && position.openTime > filters.dateTo) {
      return false;
    }
    return true;
  });
};

const applySorting = (positions: Position[], sortConfig: SortConfig): Position[] => {
  return [...positions].sort((a, b) => {
    const aValue = (a as any)[sortConfig.key];
    const bValue = (b as any)[sortConfig.key];
    
    if (aValue < bValue) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (aValue > bValue) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });
};

const calculatePnL = (position: Position, currentPrice: number): { pnl: number; pnlPercent: number } => {
  const priceDiff = position.side === 'BUY' 
    ? currentPrice - position.openPrice
    : position.openPrice - currentPrice;
  
  const pnl = priceDiff * position.volume * 100000; // Standard lot calculation
  const pnlPercent = (priceDiff / position.openPrice) * 100;
  
  return { pnl, pnlPercent };
};

const generateCSV = (positions: Position[]): string => {
  const headers = [
    'Symbol', 'Side', 'Volume', 'Open Price', 'Current Price', 
    'P&L', 'P&L %', 'Swap', 'Commission', 'Open Time', 'Comment'
  ];
  
  const rows = positions.map(pos => [
    pos.symbol,
    pos.side,
    pos.volume.toString(),
    pos.openPrice.toString(),
    pos.currentPrice.toString(),
    pos.pnl.toFixed(2),
    pos.pnlPercent.toFixed(2),
    pos.swap.toFixed(2),
    pos.commission.toFixed(2),
    pos.openTime.toISOString(),
    pos.comment || ''
  ]);
  
  return [headers, ...rows].map(row => row.join(',')).join('\n');
};

export const usePositionStore = create<PositionState>()(devtools(
  (set, get) => ({
    // Initial state
    positions: mockPositions,
    filteredPositions: mockPositions,
    selectedPositions: [],
    filters: {},
    sortConfig: { key: 'openTime', direction: 'desc' },
    pagination: {
      page: 1,
      limit: 10,
      total: mockPositions.length,
      totalPages: Math.ceil(mockPositions.length / 10)
    },
    isLoading: false,
    error: null,
    priceUpdates: new Map(),
    lastUpdate: null,
    
    // Actions
    fetchPositions: async () => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const state = get();
        const filtered = applyFilters(mockPositions, state.filters);
        const sorted = applySorting(filtered, state.sortConfig);
        
        set({
          positions: mockPositions,
          filteredPositions: sorted,
          pagination: {
            ...state.pagination,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / state.pagination.limit)
          },
          isLoading: false
        });
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to fetch positions',
          isLoading: false 
        });
      }
    },
    
    closePosition: async (positionId: string) => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          positions: state.positions.filter(p => p.id !== positionId),
          filteredPositions: state.filteredPositions.filter(p => p.id !== positionId),
          selectedPositions: state.selectedPositions.filter(id => id !== positionId),
          isLoading: false
        }));
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to close position',
          isLoading: false 
        });
        return false;
      }
    },
    
    modifyPosition: async (positionId: string, updates: Partial<Position>) => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 500));
        
        set(state => ({
          positions: state.positions.map(p => 
            p.id === positionId ? { ...p, ...updates } : p
          ),
          filteredPositions: state.filteredPositions.map(p => 
            p.id === positionId ? { ...p, ...updates } : p
          ),
          isLoading: false
        }));
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Failed to modify position',
          isLoading: false 
        });
        return false;
      }
    },
    
    setTrailingStop: async (positionId: string, trailingStop: TrailingStop) => {
      return get().modifyPosition(positionId, { trailingStop });
    },
    
    // Selection management
    selectPosition: (positionId: string) => {
      set(state => {
        const isSelected = state.selectedPositions.includes(positionId);
        return {
          selectedPositions: isSelected
            ? state.selectedPositions.filter(id => id !== positionId)
            : [...state.selectedPositions, positionId]
        };
      });
    },
    
    selectAllPositions: () => {
      set(state => ({
        selectedPositions: state.filteredPositions.map(p => p.id)
      }));
    },
    
    clearSelection: () => {
      set({ selectedPositions: [] });
    },
    
    executeBulkAction: async (action: BulkAction) => {
      set({ isLoading: true, error: null });
      
      try {
        // Mock API call
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const state = get();
        
        switch (action.type) {
          case 'close':
            set({
              positions: state.positions.filter(p => !action.positionIds.includes(p.id)),
              filteredPositions: state.filteredPositions.filter(p => !action.positionIds.includes(p.id)),
              selectedPositions: [],
              isLoading: false
            });
            break;
            
          case 'modify':
            if (action.parameters) {
              set({
                positions: state.positions.map(p => 
                  action.positionIds.includes(p.id) 
                    ? { ...p, ...action.parameters }
                    : p
                ),
                filteredPositions: state.filteredPositions.map(p => 
                  action.positionIds.includes(p.id) 
                    ? { ...p, ...action.parameters }
                    : p
                ),
                selectedPositions: [],
                isLoading: false
              });
            }
            break;
            
          case 'export':
            const selectedPositions = state.positions.filter(p => 
              action.positionIds.includes(p.id)
            );
            const csv = generateCSV(selectedPositions);
            
            // Create and download file
            const blob = new Blob([csv], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `positions_${new Date().toISOString().split('T')[0]}.csv`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
            
            set({ selectedPositions: [], isLoading: false });
            break;
        }
        
        return true;
      } catch (error) {
        set({ 
          error: error instanceof Error ? error.message : 'Bulk action failed',
          isLoading: false 
        });
        return false;
      }
    },
    
    // Filtering and sorting
    setFilters: (newFilters: Partial<PositionFilters>) => {
      set(state => {
        const filters = { ...state.filters, ...newFilters };
        const filtered = applyFilters(state.positions, filters);
        const sorted = applySorting(filtered, state.sortConfig);
        
        return {
          filters,
          filteredPositions: sorted,
          pagination: {
            ...state.pagination,
            page: 1,
            total: filtered.length,
            totalPages: Math.ceil(filtered.length / state.pagination.limit)
          }
        };
      });
    },
    
    clearFilters: () => {
      set(state => {
        const sorted = applySorting(state.positions, state.sortConfig);
        return {
          filters: {},
          filteredPositions: sorted,
          pagination: {
            ...state.pagination,
            page: 1,
            total: state.positions.length,
            totalPages: Math.ceil(state.positions.length / state.pagination.limit)
          }
        };
      });
    },
    
    setSortConfig: (config: SortConfig) => {
      set(state => {
        const sorted = applySorting(state.filteredPositions, config);
        return {
          sortConfig: config,
          filteredPositions: sorted
        };
      });
    },
    
    setPagination: (newPagination: Partial<PaginationState>) => {
      set(state => ({
        pagination: { ...state.pagination, ...newPagination }
      }));
    },
    
    // Real-time updates
    updatePrice: (update: PriceUpdate) => {
      set(state => {
        const priceUpdates = new Map(state.priceUpdates);
        priceUpdates.set(update.symbol, update);
        
        // Update positions with new prices
        const updatedPositions = state.positions.map(position => {
          if (position.symbol === update.symbol) {
            const currentPrice = position.side === 'BUY' ? update.bid : update.ask;
            const { pnl, pnlPercent } = calculatePnL(position, currentPrice);
            
            return {
              ...position,
              currentPrice,
              pnl,
              pnlPercent
            };
          }
          return position;
        });
        
        const filtered = applyFilters(updatedPositions, state.filters);
        const sorted = applySorting(filtered, state.sortConfig);
        
        return {
          positions: updatedPositions,
          filteredPositions: sorted,
          priceUpdates,
          lastUpdate: update.timestamp
        };
      });
    },
    
    updatePosition: (update: PositionUpdate) => {
      set(state => {
        const updatedPositions = state.positions.map(position => 
          position.id === update.positionId
            ? {
                ...position,
                currentPrice: update.currentPrice,
                pnl: update.pnl,
                pnlPercent: update.pnlPercent
              }
            : position
        );
        
        const filtered = applyFilters(updatedPositions, state.filters);
        const sorted = applySorting(filtered, state.sortConfig);
        
        return {
          positions: updatedPositions,
          filteredPositions: sorted,
          lastUpdate: update.timestamp
        };
      });
    },
    
    // Export functionality
    exportPositions: async (options: ExportOptions) => {
      try {
        const state = get();
        let positionsToExport = state.filteredPositions;
        
        // Apply date range filter if specified
        if (options.dateRange) {
          positionsToExport = positionsToExport.filter(p => 
            p.openTime >= options.dateRange!.from && 
            p.openTime <= options.dateRange!.to
          );
        }
        
        const csv = generateCSV(positionsToExport);
        
        if (options.format === 'csv') {
          const blob = new Blob([csv], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = `positions_export_${new Date().toISOString().split('T')[0]}.csv`;
          document.body.appendChild(a);
          a.click();
          document.body.removeChild(a);
          URL.revokeObjectURL(url);
        }
        
        return csv;
      } catch (error) {
        set({ error: error instanceof Error ? error.message : 'Export failed' });
        throw error;
      }
    },
    
    // Utility
    clearError: () => set({ error: null }),
    
    refreshPositions: async () => {
      await get().fetchPositions();
    }
  }),
  { name: 'position-store' }
));