import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  TrendingUp, 
  TrendingDown, 
  Eye, 
  EyeOff, 
  RefreshCw, 
  Filter,
  Search,
  MoreVertical,
  PieChart,
  BarChart3,
  DollarSign,
  Percent
} from 'lucide-react';
import { LazyImage } from './LazyImage';
import { usePerformanceMonitoring } from '../../utils/mobilePerformance';
import { useMobileData } from '../../utils/mobileDataManager';
import { NavigationHaptics } from '../../utils/hapticFeedback';

interface PortfolioAsset {
  id: string;
  symbol: string;
  name: string;
  amount: number;
  value: number;
  change24h: number;
  changePercent24h: number;
  icon?: string;
  color?: string;
}

interface PortfolioSummary {
  totalValue: number;
  totalChange24h: number;
  totalChangePercent24h: number;
  totalPnL: number;
  totalPnLPercent: number;
}

const MOCK_ASSETS: PortfolioAsset[] = [
  {
    id: '1',
    symbol: 'BTC',
    name: 'Bitcoin',
    amount: 0.5,
    value: 21500,
    change24h: 850,
    changePercent24h: 4.12,
    color: '#F7931A'
  },
  {
    id: '2',
    symbol: 'ETH',
    name: 'Ethereum',
    amount: 2.3,
    value: 3680,
    change24h: -120,
    changePercent24h: -3.15,
    color: '#627EEA'
  },
  {
    id: '3',
    symbol: 'ADA',
    name: 'Cardano',
    amount: 1500,
    value: 450,
    change24h: 15,
    changePercent24h: 3.45,
    color: '#0033AD'
  },
  {
    id: '4',
    symbol: 'SOL',
    name: 'Solana',
    amount: 10,
    value: 230,
    change24h: -8,
    changePercent24h: -3.36,
    color: '#9945FF'
  }
];

export const OptimizedMobilePortfolio: React.FC<{
  className?: string;
  onAssetSelect?: (asset: PortfolioAsset) => void;
}> = ({ className = '', onAssetSelect }) => {
  const [assets, setAssets] = useState<PortfolioAsset[]>(MOCK_ASSETS);
  const [isBalanceVisible, setIsBalanceVisible] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'value' | 'change' | 'name'>('value');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [showFilters, setShowFilters] = useState(false);
  
  const { shouldOptimize, measurePerformance } = usePerformanceMonitoring();
  const { cacheData, getCachedData } = useMobileData();

  // Calculate portfolio summary
  const portfolioSummary = useMemo((): PortfolioSummary => {
    return measurePerformance('portfolio-calculation', () => {
      const totalValue = assets.reduce((sum, asset) => sum + asset.value, 0);
      const totalChange24h = assets.reduce((sum, asset) => sum + asset.change24h, 0);
      const totalChangePercent24h = totalValue > 0 ? (totalChange24h / (totalValue - totalChange24h)) * 100 : 0;
      
      return {
        totalValue,
        totalChange24h,
        totalChangePercent24h,
        totalPnL: totalChange24h, // Simplified for demo
        totalPnLPercent: totalChangePercent24h
      };
    });
  }, [assets]);

  // Filter and sort assets
  const filteredAssets = useMemo(() => {
    return measurePerformance('asset-filtering', () => {
      let filtered = assets;
      
      // Apply search filter
      if (searchQuery) {
        filtered = filtered.filter(asset => 
          asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
          asset.name.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
      
      // Apply sorting
      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'value':
            return b.value - a.value;
          case 'change':
            return b.changePercent24h - a.changePercent24h;
          case 'name':
            return a.name.localeCompare(b.name);
          default:
            return 0;
        }
      });
      
      return filtered;
    });
  }, [assets, searchQuery, sortBy]);

  // Load cached data on mount
  useEffect(() => {
    const loadCachedData = async () => {
      const cached = await getCachedData('portfolio-assets');
      if (cached) {
        setAssets(cached);
      }
    };
    loadCachedData();
  }, [getCachedData]);

  // Cache data when assets change
  useEffect(() => {
    cacheData('portfolio-assets', assets, { ttl: 300000 }); // 5 minutes
  }, [assets, cacheData]);

  const handleRefresh = async () => {
    await NavigationHaptics.buttonPress();
    setIsRefreshing(true);
    
    // Simulate API call
    setTimeout(() => {
      // In a real app, this would fetch fresh data
      const updatedAssets = assets.map(asset => ({
        ...asset,
        change24h: asset.change24h + (Math.random() - 0.5) * 100,
        changePercent24h: asset.changePercent24h + (Math.random() - 0.5) * 5
      }));
      setAssets(updatedAssets);
      setIsRefreshing(false);
    }, 1500);
  };

  const toggleBalanceVisibility = async () => {
    await NavigationHaptics.tap();
    setIsBalanceVisible(!isBalanceVisible);
  };

  const handleAssetPress = async (asset: PortfolioAsset) => {
    await NavigationHaptics.buttonPress();
    onAssetSelect?.(asset);
  };

  const formatCurrency = (value: number, showBalance: boolean = true) => {
    if (!showBalance) return '••••••';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const AssetItem: React.FC<{ asset: PortfolioAsset; index: number }> = ({ asset, index }) => (
    <motion.div
      className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      whileHover={{ scale: shouldOptimize ? 1 : 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={() => handleAssetPress(asset)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          {/* Asset Icon */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm"
            style={{ backgroundColor: asset.color || '#6B7280' }}
          >
            {asset.symbol.slice(0, 2)}
          </div>
          
          {/* Asset Info */}
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {asset.symbol}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              {asset.amount} {asset.symbol}
            </div>
          </div>
        </div>
        
        {/* Value and Change */}
        <div className="text-right">
          <div className="font-semibold text-gray-900 dark:text-white">
            {formatCurrency(asset.value, isBalanceVisible)}
          </div>
          <div className={`text-sm flex items-center justify-end space-x-1 ${
            asset.changePercent24h >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {asset.changePercent24h >= 0 ? (
              <TrendingUp className="w-3 h-3" />
            ) : (
              <TrendingDown className="w-3 h-3" />
            )}
            <span>{formatPercent(asset.changePercent24h)}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Portfolio Summary */}
      <motion.div
        className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl p-6 text-white"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Portfolio Value</h2>
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={toggleBalanceVisibility}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              {isBalanceVisible ? (
                <Eye className="w-4 h-4" />
              ) : (
                <EyeOff className="w-4 h-4" />
              )}
            </motion.button>
            
            <motion.button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2 rounded-full bg-white/20 hover:bg-white/30 transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-3xl font-bold">
            {formatCurrency(portfolioSummary.totalValue, isBalanceVisible)}
          </div>
          
          <div className={`flex items-center space-x-2 text-lg ${
            portfolioSummary.totalChangePercent24h >= 0 ? 'text-green-200' : 'text-red-200'
          }`}>
            {portfolioSummary.totalChangePercent24h >= 0 ? (
              <TrendingUp className="w-5 h-5" />
            ) : (
              <TrendingDown className="w-5 h-5" />
            )}
            <span>
              {formatCurrency(Math.abs(portfolioSummary.totalChange24h), isBalanceVisible)} 
              ({formatPercent(portfolioSummary.totalChangePercent24h)})
            </span>
          </div>
          
          <div className="text-sm text-white/80">
            24h Change
          </div>
        </div>
      </motion.div>

      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        {/* Filter Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setSortBy('value')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'value'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <DollarSign className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => setSortBy('change')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'change'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Percent className="w-4 h-4" />
            </motion.button>
            
            <motion.button
              onClick={() => setSortBy('name')}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                sortBy === 'name'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              ABC
            </motion.button>
          </div>
          
          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setViewMode(viewMode === 'list' ? 'grid' : 'list')}
              className="p-2 rounded-lg bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === 'list' ? (
                <BarChart3 className="w-4 h-4" />
              ) : (
                <PieChart className="w-4 h-4" />
              )}
            </motion.button>
          </div>
        </div>
      </div>

      {/* Assets List */}
      <div className="space-y-3">
        <AnimatePresence mode="popLayout">
          {filteredAssets.map((asset, index) => (
            <AssetItem key={asset.id} asset={asset} index={index} />
          ))}
        </AnimatePresence>
        
        {filteredAssets.length === 0 && (
          <motion.div
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Search className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>No assets found matching your search.</p>
          </motion.div>
        )}
      </div>
      
      {/* Performance Indicator */}
      {shouldOptimize && (
        <motion.div
          className="fixed bottom-20 right-4 bg-yellow-500 text-white p-2 rounded-full shadow-lg"
          initial={{ opacity: 0, scale: 0 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0 }}
        >
          <RefreshCw className="w-4 h-4" />
        </motion.div>
      )}
    </div>
  );
};

export default OptimizedMobilePortfolio;