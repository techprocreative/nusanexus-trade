import React, { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Badge } from '@/components/ui/badge';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
// } from '@/components/ui/sheet';

// Custom UI components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border ${className}`}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pb-4 ${className || ''}`}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant, size, className }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  size?: string;
  className?: string;
}) => (
  <button
    onClick={onClick}
    className={`px-4 py-2 rounded-md font-medium transition-colors ${
      variant === 'outline' ? 'border border-gray-600 bg-transparent hover:bg-gray-700' : 
      variant === 'ghost' ? 'bg-transparent hover:bg-gray-700' :
      'bg-blue-600 hover:bg-blue-700'
    } ${size === 'sm' ? 'px-2 py-1 text-sm' : ''} ${className}`}
  >
    {children}
  </button>
);
const Badge = ({ children, variant, className }: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'outline' ? 'border' : 'bg-gray-700'
  } ${className}`}>
    {children}
  </span>
);
const Sheet = ({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) => (
  <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
    {children}
  </div>
);
const SheetContent = ({ children, side, className }: {
  children: React.ReactNode;
  side?: string;
  className?: string;
}) => (
  <div className={`fixed ${side === 'bottom' ? 'bottom-0 left-0 right-0' : 'right-0 top-0 bottom-0'} ${className}`}>
    {children}
  </div>
);
const SheetHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-b border-gray-700">{children}</div>
);
const SheetTitle = ({ children }: { children: React.ReactNode }) => (
  <h2 className="text-lg font-semibold">{children}</h2>
);
const SheetDescription = ({ children }: { children: React.ReactNode }) => (
  <p className="text-sm text-gray-400">{children}</p>
);
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Clock,
  Target,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  ChevronRight,
  Zap,
  Shield,
  BarChart3,
  Plus,
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { usePositionStore } from '@/store/usePositionStore';
import { useHistoryStore } from '@/store/useHistoryStore';
import { useTradingStore } from '@/store/useTradingStore';
import MobileNavigation, { MobileStatusBar, QuickActionButton } from './MobileNavigation';
import MobileOrderForm from './MobileOrderForm';
import MobilePositionCard from './MobilePositionCard';
import MobileTradeHistory from './MobileTradeHistory';

const MobileDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showOrderForm, setShowOrderForm] = useState(false);
  const [showBalanceDetails, setShowBalanceDetails] = useState(false);
  const [balanceVisible, setBalanceVisible] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const { pendingOrders, fetchOrders } = useOrderStore();
  const { positions, fetchPositions } = usePositionStore();
  const { tradeHistory, fetchTradeHistory } = useHistoryStore();
  const { selectedSymbol } = useTradingStore();

  useEffect(() => {
    // Initial data fetch
    fetchOrders();
    fetchPositions();
    fetchTradeHistory();
  }, [fetchOrders, fetchPositions, fetchTradeHistory]);

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        fetchOrders(),
        fetchPositions(),
        fetchTradeHistory(),
      ]);
    } finally {
      setRefreshing(false);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardContent />;
      case 'positions':
        return <PositionsContent />;
      case 'orders':
        return <OrdersContent />;
      case 'history':
        return <MobileTradeHistory />;
      case 'analytics':
        return <AnalyticsContent />;
      default:
        return <DashboardContent />;
    }
  };

  return (
    <div className="flex flex-col h-screen bg-gray-900 text-white">
      {/* Status Bar */}
      <MobileStatusBar />

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        {renderContent()}
      </div>

      {/* Navigation */}
      <MobileNavigation 
        activeTab={activeTab} 
        onTabChange={setActiveTab}
      />

      {/* Quick Action Button */}
      <QuickActionButton onNewOrder={() => setShowOrderForm(true)} />

      {/* Order Form Sheet */}
      <Sheet open={showOrderForm} onOpenChange={setShowOrderForm}>
        <SheetContent 
          side="bottom" 
          className="h-[90vh] bg-gray-900 border-gray-700 p-0"
        >
          <MobileOrderForm onClose={() => setShowOrderForm(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

// Dashboard Content Component
const DashboardContent: React.FC = () => {
  const { positions } = usePositionStore();
  const { pendingOrders } = useOrderStore();
  const { tradeHistory } = useHistoryStore();
  const [balanceVisible, setBalanceVisible] = useState(true);

  // Calculate summary statistics
  const openPositions = positions;
  const totalPnL = openPositions.reduce((sum, p) => sum + p.pnl, 0);
  const totalEquity = 10000 + totalPnL; // Mock account balance
  const marginUsed = openPositions.reduce((sum, p) => sum + (p.volume * 1000), 0);
  const freeMargin = totalEquity - marginUsed;
  const marginLevel = marginUsed > 0 ? (totalEquity / marginUsed) * 100 : 0;

  // Recent trades for quick view
  const recentTrades = tradeHistory.slice(0, 3);
  const todayTrades = tradeHistory.filter(t => {
    const today = new Date();
    const tradeDate = new Date(t.closeTime);
    return tradeDate.toDateString() === today.toDateString();
  });
  const todayPnL = todayTrades.reduce((sum, t) => sum + t.pnl, 0);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
      {/* Account Balance Card */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 border-0">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium text-blue-100">Account Balance</h3>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setBalanceVisible(!balanceVisible)}
              className="h-6 w-6 p-0 text-blue-100 hover:bg-white/10"
            >
              {balanceVisible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
            </Button>
          </div>
          <div className="space-y-1">
            <p className="text-2xl font-bold text-white">
              {balanceVisible ? formatCurrency(totalEquity) : '••••••'}
            </p>
            <div className="flex items-center space-x-4 text-sm">
              <span className={cn(
                "flex items-center space-x-1",
                totalPnL >= 0 ? "text-green-200" : "text-red-200"
              )}>
                {totalPnL >= 0 ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                <span>{balanceVisible ? formatCurrency(totalPnL) : '••••'}</span>
              </span>
              <span className="text-blue-200">
                {balanceVisible ? formatPercentage((totalPnL / 10000) * 100) : '••••'}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-green-500/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Open Positions</p>
                <p className="text-lg font-bold text-white">{openPositions.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-blue-500/20 rounded-full">
                <Clock className="h-4 w-4 text-blue-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Pending Orders</p>
                <p className="text-lg font-bold text-white">{pendingOrders.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className="p-2 bg-purple-500/20 rounded-full">
                <BarChart3 className="h-4 w-4 text-purple-400" />
              </div>
              <div>
                <p className="text-xs text-gray-400">Today's P&L</p>
                <p className={cn(
                  "text-lg font-bold",
                  todayPnL >= 0 ? "text-green-400" : "text-red-400"
                )}>
                  {formatCurrency(todayPnL)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="flex items-center space-x-2">
              <div className={cn(
                "p-2 rounded-full",
                marginLevel > 200 ? "bg-green-500/20" : 
                marginLevel > 100 ? "bg-yellow-500/20" : "bg-red-500/20"
              )}>
                <Shield className={cn(
                  "h-4 w-4",
                  marginLevel > 200 ? "text-green-400" : 
                  marginLevel > 100 ? "text-yellow-400" : "text-red-400"
                )} />
              </div>
              <div>
                <p className="text-xs text-gray-400">Margin Level</p>
                <p className={cn(
                  "text-lg font-bold",
                  marginLevel > 200 ? "text-green-400" : 
                  marginLevel > 100 ? "text-yellow-400" : "text-red-400"
                )}>
                  {marginLevel.toFixed(0)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Positions */}
      {openPositions.length > 0 && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-medium text-white">Recent Positions</CardTitle>
              <Button variant="ghost" size="sm" className="h-6 text-xs text-gray-400">
                View All <ChevronRight className="h-3 w-3 ml-1" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2">
              {openPositions.slice(0, 3).map((position) => (
                <div key={position.id} className="px-4 py-3 border-b border-gray-700 last:border-b-0">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={cn(
                        "p-1.5 rounded-full",
                        position.side === 'BUY' ? "bg-green-500/20" : "bg-red-500/20"
                      )}>
                        {position.side === 'BUY' ? (
                          <TrendingUp className="h-3 w-3 text-green-400" />
                        ) : (
                          <TrendingDown className="h-3 w-3 text-red-400" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-white">{position.symbol}</p>
                        <p className="text-xs text-gray-400">{position.volume} lots</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={cn(
                        "text-sm font-bold",
                        position.pnl >= 0 ? "text-green-400" : "text-red-400"
                      )}>
                        {formatCurrency(position.pnl)}
                      </p>
                      <p className="text-xs text-gray-400">{position.currentPrice.toFixed(5)}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Market Overview */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-white">Market Overview</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">EUR/USD</p>
              <p className="text-sm font-bold text-white">1.0845</p>
              <p className="text-xs text-green-400">+0.12%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">GBP/USD</p>
              <p className="text-sm font-bold text-white">1.2634</p>
              <p className="text-xs text-red-400">-0.08%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">USD/JPY</p>
              <p className="text-sm font-bold text-white">149.82</p>
              <p className="text-xs text-green-400">+0.24%</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">XAU/USD</p>
              <p className="text-sm font-bold text-white">2018.45</p>
              <p className="text-xs text-red-400">-0.15%</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Positions Content Component
const PositionsContent: React.FC = () => {
  const { positions, filteredPositions } = usePositionStore();
  const openPositions = positions;

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Positions</h1>
        <Badge variant="outline" className="border-gray-600 text-gray-300">
          {openPositions.length} open
        </Badge>
      </div>
      
      {openPositions.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <TrendingUp className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No open positions</h3>
          <p className="text-sm text-gray-500">Your positions will appear here when you open trades</p>
        </div>
      ) : (
        openPositions.map((position) => (
          <MobilePositionCard key={position.id} position={position} />
        ))
      )}
    </div>
  );
};

// Orders Content Component
const OrdersContent: React.FC = () => {
  const { pendingOrders } = useOrderStore();

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-white">Orders</h1>
        <Badge variant="outline" className="border-gray-600 text-gray-300">
          {pendingOrders.length} pending
        </Badge>
      </div>
      
      {pendingOrders.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Clock className="h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-medium text-gray-400 mb-2">No pending orders</h3>
          <p className="text-sm text-gray-500">Your pending orders will appear here</p>
        </div>
      ) : (
        <div className="space-y-3">
          {pendingOrders.map((order) => (
            <Card key={order.id} className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Badge 
                      variant="outline"
                      className={cn(
                        "text-xs",
                        order.side === 'BUY' 
                          ? "border-green-500 text-green-400" 
                          : "border-red-500 text-red-400"
                      )}
                    >
                      {order.side}
                    </Badge>
                    <span className="text-sm font-medium text-white">{order.symbol}</span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {order.orderType}
                  </Badge>
                </div>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-400">Volume</p>
                    <p className="text-white font-medium">{order.volume} lots</p>
                  </div>
                  <div>
                    <p className="text-gray-400">Price</p>
                    <p className="text-white font-medium">{order.price?.toFixed(5) || 'Market'}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

// Analytics Content Component
const AnalyticsContent: React.FC = () => {
  const { tradeHistory } = useHistoryStore();
  const { positions } = usePositionStore();

  // Calculate analytics
  const totalTrades = tradeHistory.length;
  const winningTrades = tradeHistory.filter(t => t.pnl > 0).length;
  const winRate = totalTrades > 0 ? (winningTrades / totalTrades) * 100 : 0;
  const totalPnL = tradeHistory.reduce((sum, t) => sum + t.pnl, 0);
  const avgPnL = totalTrades > 0 ? totalPnL / totalTrades : 0;
  const bestTrade = tradeHistory.length > 0 ? Math.max(...tradeHistory.map(t => t.pnl)) : 0;
  const worstTrade = tradeHistory.length > 0 ? Math.min(...tradeHistory.map(t => t.pnl)) : 0;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
      <h1 className="text-xl font-bold text-white mb-4">Analytics</h1>
      
      {/* Performance Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Total P&L</p>
              <p className={cn(
                "text-lg font-bold",
                totalPnL >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(totalPnL)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Win Rate</p>
              <p className="text-lg font-bold text-white">{winRate.toFixed(1)}%</p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Avg P&L</p>
              <p className={cn(
                "text-lg font-bold",
                avgPnL >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(avgPnL)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gray-800/50 border-gray-700">
          <CardContent className="p-3">
            <div className="text-center">
              <p className="text-xs text-gray-400 mb-1">Total Trades</p>
              <p className="text-lg font-bold text-white">{totalTrades}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Best/Worst Trades */}
      <div className="space-y-3">
        <Card className="bg-green-500/10 border-green-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-500/20 rounded-full">
                <TrendingUp className="h-4 w-4 text-green-400" />
              </div>
              <div>
                <p className="text-sm text-green-400 font-medium">Best Trade</p>
                <p className="text-lg font-bold text-green-400">{formatCurrency(bestTrade)}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-500/20 rounded-full">
                <TrendingDown className="h-4 w-4 text-red-400" />
              </div>
              <div>
                <p className="text-sm text-red-400 font-medium">Worst Trade</p>
                <p className="text-lg font-bold text-red-400">{formatCurrency(worstTrade)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Trading Activity */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardHeader>
          <CardTitle className="text-sm font-medium text-white">Trading Activity</CardTitle>
        </CardHeader>
        <CardContent className="p-4 pt-0">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Winning Trades</span>
              <span className="text-sm text-green-400 font-medium">{winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Losing Trades</span>
              <span className="text-sm text-red-400 font-medium">{totalTrades - winningTrades}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-400">Open Positions</span>
              <span className="text-sm text-white font-medium">{positions.length}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default MobileDashboard;