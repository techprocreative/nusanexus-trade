import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, Star, TrendingUp, TrendingDown } from 'lucide-react';
import { motion } from 'framer-motion';
import MobileTradingInterface from '../../components/mobile/MobileTradingInterface';

interface Asset {
  symbol: string;
  name: string;
  price: number;
  change: number;
  changePercent: number;
  volume: string;
  isFavorite: boolean;
}

interface MobileTradingPageProps {
  onBack?: () => void;
}

const MobileTradingPage: React.FC<MobileTradingPageProps> = ({ onBack }) => {
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [assets] = useState<Asset[]>([
    {
      symbol: 'AAPL',
      name: 'Apple Inc.',
      price: 175.43,
      change: 2.15,
      changePercent: 1.24,
      volume: '52.3M',
      isFavorite: true
    },
    {
      symbol: 'GOOGL',
      name: 'Alphabet Inc.',
      price: 2847.63,
      change: -15.42,
      changePercent: -0.54,
      volume: '28.7M',
      isFavorite: true
    },
    {
      symbol: 'MSFT',
      name: 'Microsoft Corp.',
      price: 378.85,
      change: 4.23,
      changePercent: 1.13,
      volume: '31.2M',
      isFavorite: false
    },
    {
      symbol: 'TSLA',
      name: 'Tesla Inc.',
      price: 248.42,
      change: -8.15,
      changePercent: -3.18,
      volume: '89.4M',
      isFavorite: true
    },
    {
      symbol: 'AMZN',
      name: 'Amazon.com Inc.',
      price: 3342.88,
      change: 12.45,
      changePercent: 0.37,
      volume: '42.1M',
      isFavorite: false
    }
  ]);

  const filteredAssets = assets.filter(asset => 
    asset.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAssetSelect = (asset: Asset) => {
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([15]);
    }
    setSelectedAsset(asset);
  };

  const handlePlaceOrder = async (order: {
    type: 'buy' | 'sell';
    amount: number;
    orderType: 'market' | 'limit';
    limitPrice?: number;
  }) => {
    console.log('Placing order:', order, 'for asset:', selectedAsset?.symbol);
    
    // Simulate order processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Success haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([100, 50, 100]);
    }
    
    // Show success message or navigate back
    alert(`${order.type.toUpperCase()} order placed successfully for ${selectedAsset?.symbol}!`);
  };

  const toggleFavorite = (symbol: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Haptic feedback
    if ('vibrate' in navigator) {
      navigator.vibrate([10]);
    }
    // In a real app, this would update the backend
    console.log('Toggle favorite for:', symbol);
  };

  if (selectedAsset) {
    return (
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-800 safe-top">
          <div className="flex items-center justify-between p-4">
            <button
              onClick={() => setSelectedAsset(null)}
              className="touch-button p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
            <h1 className="text-lg font-semibold text-white">Trade {selectedAsset.symbol}</h1>
            <button
              onClick={(e) => toggleFavorite(selectedAsset.symbol, e)}
              className="touch-button p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            >
              <Star 
                size={20} 
                className={selectedAsset.isFavorite ? 'fill-yellow-400 text-yellow-400' : ''} 
              />
            </button>
          </div>
        </div>

        {/* Trading Interface */}
        <MobileTradingInterface
          symbol={selectedAsset.symbol}
          currentPrice={selectedAsset.price}
          priceChange={selectedAsset.change}
          priceChangePercent={selectedAsset.changePercent}
          onPlaceOrder={handlePlaceOrder}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-gray-800 safe-top">
        <div className="flex items-center justify-between p-4">
          {onBack && (
            <button
              onClick={onBack}
              className="touch-button p-2 rounded-lg bg-gray-800 text-white hover:bg-gray-700"
            >
              <ArrowLeft size={20} />
            </button>
          )}
          <h1 className="text-lg font-semibold text-white">Trading</h1>
          <div className="w-10" /> {/* Spacer */}
        </div>
        
        {/* Search Bar */}
        <div className="px-4 pb-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search assets..."
              className="mobile-input w-full pl-10 bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            />
          </div>
        </div>
      </div>

      {/* Asset List */}
      <div className="mobile-container pb-safe-bottom">
        <div className="space-y-2">
          {filteredAssets.map((asset, index) => {
            const isPositive = asset.change >= 0;
            
            return (
              <motion.div
                key={asset.symbol}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
                onClick={() => handleAssetSelect(asset)}
                className="glass-card p-4 cursor-pointer hover:bg-gray-800/50 transition-all duration-200 active:scale-[0.98]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {asset.symbol.charAt(0)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-white font-semibold">{asset.symbol}</h3>
                      <p className="text-gray-400 text-sm">{asset.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <div className="text-white font-semibold">
                        ${asset.price.toFixed(2)}
                      </div>
                      <div className={`flex items-center space-x-1 text-sm ${
                        isPositive ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                        <span>
                          {isPositive ? '+' : ''}{asset.change.toFixed(2)} ({asset.changePercent.toFixed(2)}%)
                        </span>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => toggleFavorite(asset.symbol, e)}
                      className="touch-button p-2 rounded-lg hover:bg-gray-700 transition-colors"
                    >
                      <Star 
                        size={16} 
                        className={asset.isFavorite ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'} 
                      />
                    </button>
                  </div>
                </div>
                
                <div className="mt-3 flex justify-between items-center text-sm text-gray-400">
                  <span>Volume: {asset.volume}</span>
                  <span className="text-blue-400 font-medium">Trade →</span>
                </div>
              </motion.div>
            );
          })}
        </div>
        
        {filteredAssets.length === 0 && (
          <div className="text-center py-12">
            <Search className="mx-auto text-gray-500 mb-4" size={48} />
            <p className="text-gray-400">No assets found matching "{searchQuery}"</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MobileTradingPage;