import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Globe,
  Calendar,
  Clock,
  AlertTriangle,
  Star,
  Eye,
  Activity,
  Wifi,
  WifiOff
} from 'lucide-react';
import { cn } from '../../utils/cn';

interface MarketPrice {
  symbol: string;
  bid: number;
  ask: number;
  change: number;
  changePercent: number;
  volume: number;
  high24h: number;
  low24h: number;
  lastUpdate: Date;
}

interface EconomicEvent {
  id: string;
  time: string;
  currency: string;
  event: string;
  impact: 'low' | 'medium' | 'high';
  forecast?: string;
  previous?: string;
  actual?: string;
}

interface MarketDataFeedProps {
  className?: string;
}

export const MarketDataFeed: React.FC<MarketDataFeedProps> = ({ className }) => {
  const [marketPrices, setMarketPrices] = useState<MarketPrice[]>([]);
  const [economicEvents, setEconomicEvents] = useState<EconomicEvent[]>([]);
  const [activeTab, setActiveTab] = useState<'prices' | 'calendar'>('prices');
  const [isConnected, setIsConnected] = useState(true);
  const [watchlist, setWatchlist] = useState<string[]>(['EURUSD', 'GBPUSD', 'USDJPY']);

  // Mock market data
  useEffect(() => {
    const mockPrices: MarketPrice[] = [
      {
        symbol: 'EURUSD',
        bid: 1.08420,
        ask: 1.08422,
        change: 0.00085,
        changePercent: 0.078,
        volume: 125000,
        high24h: 1.08567,
        low24h: 1.08234,
        lastUpdate: new Date()
      },
      {
        symbol: 'GBPUSD',
        bid: 1.26850,
        ask: 1.26853,
        change: -0.00123,
        changePercent: -0.097,
        volume: 98000,
        high24h: 1.27045,
        low24h: 1.26721,
        lastUpdate: new Date()
      },
      {
        symbol: 'USDJPY',
        bid: 149.250,
        ask: 149.253,
        change: 0.125,
        changePercent: 0.084,
        volume: 87000,
        high24h: 149.456,
        low24h: 148.987,
        lastUpdate: new Date()
      },
      {
        symbol: 'AUDUSD',
        bid: 0.65420,
        ask: 0.65423,
        change: -0.00045,
        changePercent: -0.069,
        volume: 54000,
        high24h: 0.65567,
        low24h: 0.65234,
        lastUpdate: new Date()
      },
      {
        symbol: 'USDCAD',
        bid: 1.36850,
        ask: 1.36853,
        change: 0.00234,
        changePercent: 0.171,
        volume: 43000,
        high24h: 1.36945,
        low24h: 1.36621,
        lastUpdate: new Date()
      },
      {
        symbol: 'USDCHF',
        bid: 0.88420,
        ask: 0.88423,
        change: -0.00067,
        changePercent: -0.076,
        volume: 38000,
        high24h: 0.88567,
        low24h: 0.88234,
        lastUpdate: new Date()
      }
    ];
    setMarketPrices(mockPrices);
  }, []);

  // Mock economic events
  useEffect(() => {
    const mockEvents: EconomicEvent[] = [
      {
        id: '1',
        time: '09:30',
        currency: 'USD',
        event: 'Non-Farm Payrolls',
        impact: 'high',
        forecast: '180K',
        previous: '175K'
      },
      {
        id: '2',
        time: '10:00',
        currency: 'EUR',
        event: 'ECB Interest Rate Decision',
        impact: 'high',
        forecast: '4.50%',
        previous: '4.50%'
      },
      {
        id: '3',
        time: '11:30',
        currency: 'GBP',
        event: 'GDP Growth Rate',
        impact: 'medium',
        forecast: '0.2%',
        previous: '0.1%'
      },
      {
        id: '4',
        time: '14:00',
        currency: 'USD',
        event: 'Federal Reserve Speech',
        impact: 'medium',
        previous: '-'
      },
      {
        id: '5',
        time: '15:30',
        currency: 'CAD',
        event: 'Employment Change',
        impact: 'low',
        forecast: '15K',
        previous: '12K'
      }
    ];
    setEconomicEvents(mockEvents);
  }, []);

  // Simulate real-time price updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMarketPrices(prevPrices => 
        prevPrices.map(price => {
          const priceChange = (Math.random() - 0.5) * 0.0002;
          const newBid = price.bid + priceChange;
          const newAsk = price.ask + priceChange;
          const newChange = newBid - (price.bid - price.change);
          const newChangePercent = (newChange / price.bid) * 100;
          
          return {
            ...price,
            bid: Number(newBid.toFixed(price.symbol.includes('JPY') ? 3 : 5)),
            ask: Number(newAsk.toFixed(price.symbol.includes('JPY') ? 3 : 5)),
            change: Number(newChange.toFixed(price.symbol.includes('JPY') ? 3 : 5)),
            changePercent: Number(newChangePercent.toFixed(3)),
            lastUpdate: new Date()
          };
        })
      );
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  // Simulate connection status
  useEffect(() => {
    const interval = setInterval(() => {
      // Randomly simulate connection issues (5% chance)
      if (Math.random() < 0.05) {
        setIsConnected(false);
        setTimeout(() => setIsConnected(true), 3000);
      }
    }, 10000);

    return () => clearInterval(interval);
  }, []);

  const toggleWatchlist = (symbol: string) => {
    setWatchlist(prev => 
      prev.includes(symbol)
        ? prev.filter(s => s !== symbol)
        : [...prev, symbol]
    );
  };

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case 'high': return 'text-red-400 bg-red-600/20';
      case 'medium': return 'text-yellow-400 bg-yellow-600/20';
      case 'low': return 'text-green-400 bg-green-600/20';
      default: return 'text-gray-400 bg-gray-600/20';
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', {
      hour12: false,
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  };

  return (
    <div className={cn('bg-gray-800 rounded-lg border border-gray-700 p-2 md:p-4 flex flex-col h-full', className)}>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-2 md:mb-4 space-y-2 md:space-y-0">
        <div className="flex items-center space-x-3">
          <h3 className="text-base md:text-lg font-semibold text-white">Market Data</h3>
          <div className={cn(
            'flex items-center space-x-1 px-2 py-1 rounded-full text-xs',
            isConnected
              ? 'bg-green-600/20 text-green-400'
              : 'bg-red-600/20 text-red-400'
          )}>
            {isConnected ? (
              <Wifi className="h-3 w-3" />
            ) : (
              <WifiOff className="h-3 w-3" />
            )}
            <span>{isConnected ? 'Live' : 'Disconnected'}</span>
          </div>
        </div>
        
        <div className="flex bg-gray-700 rounded-lg p-1">
          <button
            onClick={() => setActiveTab('prices')}
            className={cn(
              'px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors touch-manipulation',
              activeTab === 'prices'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white active:bg-gray-600'
            )}
          >
            Prices
          </button>
          <button
            onClick={() => setActiveTab('calendar')}
            className={cn(
              'px-2 md:px-3 py-1 text-xs md:text-sm font-medium rounded transition-colors touch-manipulation',
              activeTab === 'calendar'
                ? 'bg-blue-600 text-white'
                : 'text-gray-400 hover:text-white active:bg-gray-600'
            )}
          >
            Calendar
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {activeTab === 'prices' ? (
          <div className="space-y-1 p-1 md:p-2">
            {marketPrices.map((price) => (
              <div
                key={price.symbol}
                className={cn(
                  'flex items-center justify-between p-2 md:p-3 rounded-lg border transition-colors hover:bg-gray-700/50 active:bg-gray-700/70 touch-manipulation',
                  watchlist.includes(price.symbol)
                    ? 'border-blue-500/50 bg-blue-900/10'
                    : 'border-gray-600'
                )}
              >
                <div className="flex items-center space-x-2 md:space-x-3">
                  <button
                    onClick={() => toggleWatchlist(price.symbol)}
                    className={cn(
                      'p-1 rounded transition-colors touch-manipulation',
                      watchlist.includes(price.symbol)
                        ? 'text-yellow-400 hover:text-yellow-300 active:text-yellow-200'
                        : 'text-gray-500 hover:text-gray-400 active:text-gray-300'
                    )}
                  >
                    <Star className={cn(
                      'h-3 md:h-4 w-3 md:w-4',
                      watchlist.includes(price.symbol) && 'fill-current'
                    )} />
                  </button>
                  <div>
                    <p className="text-white font-medium text-sm md:text-base">{price.symbol}</p>
                    <p className="text-xs text-gray-400">
                      Vol: {(price.volume / 1000).toFixed(0)}K
                    </p>
                  </div>
                </div>

                <div className="text-right">
                  <div className="flex items-center space-x-1 md:space-x-2">
                    <div className="text-right">
                      <p className="text-white font-mono text-xs md:text-sm">
                        {price.bid.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
                      </p>
                      <p className="text-gray-400 font-mono text-xs">
                        {price.ask.toFixed(price.symbol.includes('JPY') ? 3 : 5)}
                      </p>
                    </div>
                    <div className={cn(
                      'flex items-center space-x-1 px-1 md:px-2 py-1 rounded text-xs font-medium',
                      price.change >= 0
                        ? 'bg-green-600/20 text-green-400'
                        : 'bg-red-600/20 text-red-400'
                    )}>
                      {price.change >= 0 ? (
                        <TrendingUp className="h-3 w-3" />
                      ) : (
                        <TrendingDown className="h-3 w-3" />
                      )}
                      <span className="hidden md:inline">
                        {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(2)}%
                      </span>
                      <span className="md:hidden">
                        {price.changePercent >= 0 ? '+' : ''}{price.changePercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {formatTime(price.lastUpdate)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2 p-2 md:p-4">
            <div className="flex items-center space-x-2 mb-2 md:mb-3">
              <Calendar className="h-3 md:h-4 w-3 md:w-4 text-blue-400" />
              <span className="text-xs md:text-sm text-gray-400">Today's Economic Events</span>
            </div>
            
            {economicEvents.map((event) => (
              <div
                key={event.id}
                className="p-2 md:p-3 bg-gray-900 rounded-lg border border-gray-600"
              >
                {/* Mobile Layout */}
                <div className="md:hidden">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-xs text-white font-mono">{event.time}</span>
                      <div className={cn(
                        'px-1 py-0.5 rounded text-xs font-medium',
                        getImpactColor(event.impact)
                      )}>
                        {event.impact.charAt(0).toUpperCase()}
                      </div>
                    </div>
                    <span className="px-1 py-0.5 bg-gray-700 text-white text-xs font-medium rounded">
                      {event.currency}
                    </span>
                  </div>
                  
                  <p className="text-white text-xs font-medium mb-1">{event.event}</p>
                  <div className="grid grid-cols-2 gap-1 text-xs text-gray-400">
                    {event.forecast && (
                      <span>F: {event.forecast}</span>
                    )}
                    {event.previous && (
                      <span>P: {event.previous}</span>
                    )}
                    {event.actual && (
                      <span className="text-yellow-400 col-span-2">A: {event.actual}</span>
                    )}
                  </div>
                </div>
                
                {/* Desktop Layout */}
                <div className="hidden md:flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-3 w-3 text-gray-400" />
                      <span className="text-sm text-white font-mono">{event.time}</span>
                    </div>
                    
                    <div className={cn(
                      'px-2 py-1 rounded text-xs font-medium',
                      getImpactColor(event.impact)
                    )}>
                      {event.impact.toUpperCase()}
                    </div>
                    
                    <span className="px-2 py-1 bg-gray-700 text-white text-xs font-medium rounded">
                      {event.currency}
                    </span>
                  </div>

                  <div className="text-right">
                    <p className="text-white text-sm font-medium">{event.event}</p>
                    <div className="flex items-center space-x-2 text-xs text-gray-400 mt-1">
                      {event.forecast && (
                        <span>F: {event.forecast}</span>
                      )}
                      {event.previous && (
                        <span>P: {event.previous}</span>
                      )}
                      {event.actual && (
                        <span className="text-yellow-400">A: {event.actual}</span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-3 border-t border-gray-700">
        <div className="flex items-center justify-between text-xs text-gray-400">
          <div className="flex items-center space-x-2">
            <Activity className="h-3 w-3" />
            <span>Last update: {formatTime(new Date())}</span>
          </div>
          <div className="flex items-center space-x-2">
            <Globe className="h-3 w-3" />
            <span>Market: {isConnected ? 'Open' : 'Closed'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};