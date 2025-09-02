import React, { useState, useMemo, useEffect } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
// Custom UI Components
const Label: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <label className={className}>{children}</label>
);

const Select: React.FC<{ children: React.ReactNode; value?: string; onValueChange?: (value: string) => void }> = ({ children }) => (
  <div className="relative">{children}</div>
);

const SelectTrigger: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const SelectValue: React.FC<{ placeholder?: string }> = ({ placeholder }) => (
  <span>{placeholder}</span>
);

const SelectContent: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <div className={className}>{children}</div>
);

const SelectItem: React.FC<{ children: React.ReactNode; value: string }> = ({ children }) => (
  <div>{children}</div>
);

const Badge: React.FC<{ children: React.ReactNode; className?: string }> = ({ children, className }) => (
  <span className={className}>{children}</span>
);

const Progress: React.FC<{ value: number; className?: string }> = ({ value, className }) => (
  <div className={className}>
    <div className="bg-blue-500" style={{ width: `${value}%`, height: '100%' }} />
  </div>
);

const Separator: React.FC<{ className?: string }> = ({ className }) => (
  <div className={className} />
);
import {
  AlertTriangle,
  Shield,
  DollarSign,
  Percent,
  Activity,
  TrendingUp,
  TrendingDown,
  Calculator,
  Eye,
  EyeOff,
  RefreshCw,
  AlertCircle,
  CheckCircle,
  XCircle,
} from 'lucide-react';
import { usePositionStore } from '@/store/usePositionStore';
import { useTradingStore } from '@/store/useTradingStore';

interface MarginLevel {
  level: number;
  status: 'safe' | 'warning' | 'danger' | 'critical';
  color: string;
  bgColor: string;
  description: string;
}

interface MarginCalculatorProps {
  className?: string;
}

const MarginCalculator: React.FC<MarginCalculatorProps> = ({ className }) => {
  const { positions } = usePositionStore();
  // const { marketData } = useTradingStore(); // marketData property doesn't exist

  // Account settings
  const [accountBalance, setAccountBalance] = useState(10000);
  const [leverage, setLeverage] = useState(100);
  const [marginCallLevel, setMarginCallLevel] = useState(100);
  const [stopOutLevel, setStopOutLevel] = useState(50);
  const [showDetails, setShowDetails] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(true);

  // Simulated position for calculation
  const [testSymbol, setTestSymbol] = useState('EURUSD');
  const [testVolume, setTestVolume] = useState(0.1);
  const [testPrice, setTestPrice] = useState(1.0850);
  const [testSide, setTestSide] = useState<'BUY' | 'SELL'>('BUY');

  // Calculate current margin status
  const marginStatus = useMemo(() => {
    const openPositions = positions.filter(p => (p as any).status === 'open' || p.side); // fallback check
    
    // Calculate total margin used
    const totalMarginUsed = openPositions.reduce((sum, position) => {
      const notionalValue = position.volume * 100000 * position.currentPrice;
      return sum + (notionalValue / leverage);
    }, 0);

    // Calculate total unrealized P&L
    const totalUnrealizedPnL = openPositions.reduce((sum, position) => {
      return sum + ((position as any).unrealizedPnL || (position as any).pnl || 0);
    }, 0);

    // Calculate equity and free margin
    const equity = accountBalance + totalUnrealizedPnL;
    const freeMargin = equity - totalMarginUsed;
    const marginLevel = totalMarginUsed > 0 ? (equity / totalMarginUsed) * 100 : 0;

    // Determine margin status
    let status: MarginLevel['status'];
    let color: string;
    let bgColor: string;
    let description: string;

    if (marginLevel >= 200 || totalMarginUsed === 0) {
      status = 'safe';
      color = 'text-green-400';
      bgColor = 'bg-green-500/10';
      description = 'Healthy margin level';
    } else if (marginLevel >= marginCallLevel) {
      status = 'warning';
      color = 'text-yellow-400';
      bgColor = 'bg-yellow-500/10';
      description = 'Approaching margin call';
    } else if (marginLevel >= stopOutLevel) {
      status = 'danger';
      color = 'text-orange-400';
      bgColor = 'bg-orange-500/10';
      description = 'Margin call level reached';
    } else {
      status = 'critical';
      color = 'text-red-400';
      bgColor = 'bg-red-500/10';
      description = 'Stop out level reached';
    }

    return {
      totalMarginUsed,
      totalUnrealizedPnL,
      equity,
      freeMargin,
      marginLevel,
      status,
      color,
      bgColor,
      description,
      positionCount: openPositions.length,
    };
  }, [positions, accountBalance, leverage, marginCallLevel, stopOutLevel]);

  // Calculate test position margin
  const testMargin = useMemo(() => {
    const notionalValue = testVolume * 100000 * testPrice;
    const marginRequired = notionalValue / leverage;
    const marginPercent = (marginRequired / accountBalance) * 100;
    
    // Calculate what margin level would be after adding this position
    const newTotalMargin = marginStatus.totalMarginUsed + marginRequired;
    const newMarginLevel = newTotalMargin > 0 ? (marginStatus.equity / newTotalMargin) * 100 : 0;
    
    return {
      notionalValue,
      marginRequired,
      marginPercent,
      newMarginLevel,
      canOpen: marginRequired <= marginStatus.freeMargin && newMarginLevel >= marginCallLevel,
    };
  }, [testSymbol, testVolume, testPrice, testSide, leverage, accountBalance, marginStatus, marginCallLevel]);

  // Margin level thresholds for progress bar
  const getMarginProgress = (level: number) => {
    if (level >= 200) return 100;
    if (level >= marginCallLevel) return 75;
    if (level >= stopOutLevel) return 50;
    return 25;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  const formatNumber = (value: number, decimals = 2) => {
    return value.toLocaleString('en-US', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  // Auto refresh effect
  useEffect(() => {
    if (!autoRefresh) return;
    
    const interval = setInterval(() => {
      // Trigger recalculation by updating a timestamp
      // In real implementation, this would fetch latest market data
    }, 5000);

    return () => clearInterval(interval);
  }, [autoRefresh]);

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Shield className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Margin Calculator</h3>
        </div>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={cn(
              "h-8 px-3 border-gray-600",
              autoRefresh ? "bg-blue-500/20 border-blue-500 text-blue-400" : "bg-gray-700 text-gray-300"
            )}
          >
            <RefreshCw className={cn("h-3 w-3 mr-1", autoRefresh && "animate-spin")} />
            Auto Refresh
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDetails(!showDetails)}
            className="h-8 px-3 border-gray-600 bg-gray-700 text-gray-300 hover:bg-gray-600"
          >
            {showDetails ? <EyeOff className="h-3 w-3 mr-1" /> : <Eye className="h-3 w-3 mr-1" />}
            {showDetails ? 'Hide' : 'Show'} Details
          </Button>
        </div>
      </div>

      {/* Current Margin Status */}
      <Card className={cn("border-2", 
        marginStatus.status === 'safe' ? "border-green-500/20 bg-green-500/5" :
        marginStatus.status === 'warning' ? "border-yellow-500/20 bg-yellow-500/5" :
        marginStatus.status === 'danger' ? "border-orange-500/20 bg-orange-500/5" :
        "border-red-500/20 bg-red-500/5"
      )}>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-white flex items-center space-x-2">
              <Activity className="h-4 w-4" />
              <span>Current Margin Status</span>
            </CardTitle>
            <Badge className={cn("text-xs", marginStatus.bgColor, marginStatus.color)}>
              {marginStatus.status.toUpperCase()}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Margin Level Display */}
          <div className="text-center">
            <p className="text-3xl font-bold text-white mb-1">
              {marginStatus.marginLevel > 0 ? formatNumber(marginStatus.marginLevel, 0) : '∞'}%
            </p>
            <p className="text-sm text-gray-400 mb-3">{marginStatus.description}</p>
            <Progress 
              value={getMarginProgress(marginStatus.marginLevel)} 
              className="h-3"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>Stop Out ({stopOutLevel}%)</span>
              <span>Margin Call ({marginCallLevel}%)</span>
              <span>Safe (200%+)</span>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Equity</p>
              <p className="text-sm font-bold text-white">
                {formatCurrency(marginStatus.equity)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Margin Used</p>
              <p className="text-sm font-bold text-white">
                {formatCurrency(marginStatus.totalMarginUsed)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Free Margin</p>
              <p className={cn(
                "text-sm font-bold",
                marginStatus.freeMargin >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(marginStatus.freeMargin)}
              </p>
            </div>
            <div className="text-center p-3 bg-gray-700/30 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Unrealized P&L</p>
              <p className={cn(
                "text-sm font-bold",
                marginStatus.totalUnrealizedPnL >= 0 ? "text-green-400" : "text-red-400"
              )}>
                {formatCurrency(marginStatus.totalUnrealizedPnL)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Account Settings */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Account Settings</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Account Balance</Label>
                <Input
                  type="number"
                  value={accountBalance}
                  onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Leverage</Label>
                <Select value={leverage.toString()} onValueChange={(value) => setLeverage(parseInt(value))}>
                  <SelectTrigger className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="1">1:1</SelectItem>
                    <SelectItem value="10">1:10</SelectItem>
                    <SelectItem value="50">1:50</SelectItem>
                    <SelectItem value="100">1:100</SelectItem>
                    <SelectItem value="200">1:200</SelectItem>
                    <SelectItem value="500">1:500</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Margin Call Level (%)</Label>
                <Input
                  type="number"
                  value={marginCallLevel}
                  onChange={(e) => setMarginCallLevel(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Stop Out Level (%)</Label>
                <Input
                  type="number"
                  value={stopOutLevel}
                  onChange={(e) => setStopOutLevel(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Position Margin Calculator */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Test Position Margin</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Symbol</Label>
                <Select value={testSymbol} onValueChange={setTestSymbol}>
                  <SelectTrigger className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="EURUSD">EUR/USD</SelectItem>
                    <SelectItem value="GBPUSD">GBP/USD</SelectItem>
                    <SelectItem value="USDJPY">USD/JPY</SelectItem>
                    <SelectItem value="AUDUSD">AUD/USD</SelectItem>
                    <SelectItem value="USDCAD">USD/CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Side</Label>
                <Select value={testSide} onValueChange={(value: 'BUY' | 'SELL') => setTestSide(value)}>
                  <SelectTrigger className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-gray-800 border-gray-700">
                    <SelectItem value="BUY">
                      <div className="flex items-center space-x-2">
                        <TrendingUp className="h-3 w-3 text-green-400" />
                        <span>BUY</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="SELL">
                      <div className="flex items-center space-x-2">
                        <TrendingDown className="h-3 w-3 text-red-400" />
                        <span>SELL</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Volume (lots)</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={testVolume}
                  onChange={(e) => setTestVolume(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Price</Label>
                <Input
                  type="number"
                  step="0.00001"
                  value={testPrice}
                  onChange={(e) => setTestPrice(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                />
              </div>
            </div>

            <Separator className="bg-gray-600" />

            {/* Test Results */}
            <div className="space-y-3">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Notional Value</span>
                <span className="text-white font-mono">{formatCurrency(testMargin.notionalValue)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Margin Required</span>
                <span className="text-white font-mono">{formatCurrency(testMargin.marginRequired)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">% of Balance</span>
                <span className="text-white">{formatNumber(testMargin.marginPercent, 1)}%</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">New Margin Level</span>
                <span className={cn(
                  "font-medium",
                  testMargin.newMarginLevel >= marginCallLevel ? "text-green-400" : "text-red-400"
                )}>
                  {formatNumber(testMargin.newMarginLevel, 0)}%
                </span>
              </div>
            </div>

            {/* Can Open Status */}
            <div className={cn(
              "p-3 rounded-lg border",
              testMargin.canOpen 
                ? "bg-green-500/10 border-green-500/20" 
                : "bg-red-500/10 border-red-500/20"
            )}>
              <div className="flex items-center space-x-2">
                {testMargin.canOpen ? (
                  <CheckCircle className="h-4 w-4 text-green-400" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-400" />
                )}
                <span className={cn(
                  "text-sm font-medium",
                  testMargin.canOpen ? "text-green-400" : "text-red-400"
                )}>
                  {testMargin.canOpen ? 'Position can be opened' : 'Insufficient margin'}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Information */}
      {showDetails && (
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white text-sm">Detailed Margin Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Margin Levels</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between p-2 bg-green-500/10 rounded">
                    <span className="text-xs text-gray-400">Safe Level</span>
                    <span className="text-xs text-green-400 font-medium">≥ 200%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-yellow-500/10 rounded">
                    <span className="text-xs text-gray-400">Warning Level</span>
                    <span className="text-xs text-yellow-400 font-medium">{marginCallLevel}% - 199%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-orange-500/10 rounded">
                    <span className="text-xs text-gray-400">Margin Call</span>
                    <span className="text-xs text-orange-400 font-medium">{stopOutLevel}% - {marginCallLevel - 1}%</span>
                  </div>
                  <div className="flex items-center justify-between p-2 bg-red-500/10 rounded">
                    <span className="text-xs text-gray-400">Stop Out</span>
                    <span className="text-xs text-red-400 font-medium">&lt; {stopOutLevel}%</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h4 className="text-sm font-medium text-gray-300 mb-3">Position Summary</h4>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Open Positions</span>
                    <span className="text-white">{marginStatus.positionCount}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Total Exposure</span>
                    <span className="text-white">
                      {formatCurrency(marginStatus.totalMarginUsed * leverage)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Leverage Ratio</span>
                    <span className="text-white">1:{leverage}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-400">Margin Utilization</span>
                    <span className="text-white">
                      {formatNumber((marginStatus.totalMarginUsed / accountBalance) * 100, 1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MarginCalculator;