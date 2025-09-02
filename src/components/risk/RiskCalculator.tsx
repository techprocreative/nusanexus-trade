import React, { useState, useEffect, useMemo } from 'react';
import { cn } from '@/lib/utils';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Label } from '@/components/ui/label';
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from '@/components/ui/select';
// import { Badge } from '@/components/ui/badge';
// import { Progress } from '@/components/ui/progress';
// import { Separator } from '@/components/ui/separator';
// import {
//   Tabs,
//   TabsContent,
//   TabsList,
//   TabsTrigger,
// } from '@/components/ui/tabs';

// Custom UI components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('bg-white border border-gray-200 rounded-lg shadow-sm', className)}>{children}</div>
);
const CardHeader = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-4 border-b border-gray-200', className)}>{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={cn('text-lg font-semibold text-gray-900', className)}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('p-4', className)}>{children}</div>
);
const Button = ({ children, onClick, className, variant = 'default' }: { children: React.ReactNode; onClick?: () => void; className?: string; variant?: string }) => (
  <button onClick={onClick} className={cn('px-4 py-2 rounded-lg font-medium transition-colors', variant === 'outline' ? 'border border-gray-300 text-gray-700 hover:bg-gray-50' : 'bg-blue-600 text-white hover:bg-blue-700', className)}>{children}</button>
);
const Input = ({ value, onChange, placeholder, type = 'text', className }: { value: any; onChange: (e: React.ChangeEvent<HTMLInputElement>) => void; placeholder?: string; type?: string; className?: string }) => (
  <input type={type} value={value} onChange={onChange} placeholder={placeholder} className={cn('w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500', className)} />
);
const Label = ({ children, htmlFor, className }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={cn('block text-sm font-medium text-gray-700 mb-1', className)}>{children}</label>
);
const Select = ({ children, value, onValueChange }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void }) => (
  <select value={value} onChange={(e) => onValueChange(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500">{children}</select>
);
const SelectTrigger = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectValue = ({ placeholder }: { placeholder?: string }) => <option value="" disabled>{placeholder}</option>;
const SelectContent = ({ children }: { children: React.ReactNode }) => <>{children}</>;
const SelectItem = ({ value, children }: { value: string; children: React.ReactNode }) => <option value={value}>{children}</option>;
const Badge = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <span className={cn('inline-flex items-center px-2 py-1 rounded-full text-xs font-medium', className)}>{children}</span>
);
const Progress = ({ value, className }: { value: number; className?: string }) => (
  <div className={cn('w-full bg-gray-200 rounded-full h-2', className)}>
    <div className="bg-blue-600 h-2 rounded-full transition-all duration-300" style={{ width: `${Math.min(100, Math.max(0, value))}%` }}></div>
  </div>
);
const Separator = ({ className }: { className?: string }) => (
  <hr className={cn('border-gray-200', className)} />
);
const Tabs = ({ children, value, onValueChange, className }: { children: React.ReactNode; value: string; onValueChange: (value: string) => void; className?: string }) => (
  <div data-value={value} data-onvaluechange={onValueChange} className={className}>{children}</div>
);
const TabsList = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cn('flex space-x-1 bg-gray-100 p-1 rounded-lg', className)}>{children}</div>
);
const TabsTrigger = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <button className={cn('px-3 py-1 rounded-md text-sm font-medium transition-colors hover:bg-white', className)}>{children}</button>
);
const TabsContent = ({ value, children, className }: { value: string; children: React.ReactNode; className?: string }) => (
  <div className={cn('mt-4', className)}>{children}</div>
);
import {
  AlertTriangle,
  Shield,
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  Activity,
  Info,
  CheckCircle,
  XCircle,
  AlertCircle,
} from 'lucide-react';
import { usePositionStore } from '@/store/usePositionStore';
import { useTradingStore } from '@/store/useTradingStore';
// import { RiskMetrics, PositionSizing } from '@/types/orderManagement';

// Define missing types
interface RiskMetrics {
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  riskAmount: number;
  potentialLoss: number;
  potentialProfit: number;
  riskRewardRatio: number;
  marginRequired: number;
}

interface PositionSizing {
  symbol: string;
  side: 'BUY' | 'SELL';
  entryPrice: number;
  stopLoss: number;
  takeProfit: number;
  positionSize: number;
  riskAmount: number;
  potentialProfit: number;
  potentialLoss: number;
  riskRewardRatio: number;
  marginRequired: number;
  stopLossPips: number;
  takeProfitPips: number;
  pipValue: number;
}

interface RiskCalculatorProps {
  symbol?: string;
  side?: 'BUY' | 'SELL';
  onCalculationChange?: (calculation: PositionSizing) => void;
  className?: string;
}

const RiskCalculator: React.FC<RiskCalculatorProps> = ({
  symbol = 'EURUSD',
  side = 'BUY',
  onCalculationChange,
  className,
}) => {
  const { positions } = usePositionStore();
  const tradingStore = useTradingStore();
  // const { marketData } = useTradingStore(); // marketData property doesn't exist

  // Risk calculation inputs
  const [accountBalance, setAccountBalance] = useState(10000);
  const [riskPercentage, setRiskPercentage] = useState(2);
  const [entryPrice, setEntryPrice] = useState(1.0850);
  const [stopLoss, setStopLoss] = useState(1.0800);
  const [takeProfit, setTakeProfit] = useState(1.0950);
  const [riskMethod, setRiskMethod] = useState<'percentage' | 'fixed'>('percentage');
  const [fixedRiskAmount, setFixedRiskAmount] = useState(200);
  const [leverage, setLeverage] = useState(100);

  // Portfolio risk inputs
  const [maxPositions, setMaxPositions] = useState(5);
  const [maxRiskPerTrade, setMaxRiskPerTrade] = useState(2);
  const [maxPortfolioRisk, setMaxPortfolioRisk] = useState(10);
  const [correlationLimit, setCorrelationLimit] = useState(0.7);

  // Calculate position sizing and risk metrics
  const calculation = useMemo(() => {
    const riskAmount = riskMethod === 'percentage' 
      ? (accountBalance * riskPercentage) / 100
      : fixedRiskAmount;

    const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
    const stopLossPips = Math.abs(entryPrice - stopLoss) / pipValue;
    const takeProfitPips = Math.abs(takeProfit - entryPrice) / pipValue;
    
    // Position size calculation
    const pipValueInUSD = symbol.includes('JPY') ? 0.91 : 1; // Simplified
    const positionSize = stopLossPips > 0 ? riskAmount / (stopLossPips * pipValueInUSD) : 0;
    const lotSize = positionSize / 100000; // Standard lot = 100,000 units
    
    // Margin calculation
    const notionalValue = positionSize * entryPrice;
    const marginRequired = notionalValue / leverage;
    
    // Risk/Reward ratio
    const riskRewardRatio = stopLossPips > 0 ? takeProfitPips / stopLossPips : 0;
    
    // Potential profit/loss
    const potentialLoss = riskAmount;
    const potentialProfit = takeProfitPips * pipValueInUSD * (lotSize * 100000);
    
    return {
      symbol,
      side,
      entryPrice,
      stopLoss,
      takeProfit,
      positionSize: lotSize,
      riskAmount,
      potentialProfit,
      potentialLoss,
      riskRewardRatio,
      marginRequired,
      stopLossPips,
      takeProfitPips,
      pipValue: pipValueInUSD,
    } as PositionSizing;
  }, [
    symbol, side, entryPrice, stopLoss, takeProfit, accountBalance,
    riskPercentage, riskMethod, fixedRiskAmount, leverage
  ]);

  // Portfolio risk analysis
  const portfolioRisk = useMemo(() => {
    const openPositions = positions.filter(p => (p as any).status === 'open' || p.side); // fallback to check if position exists
    const totalExposure = openPositions.reduce((sum, p) => sum + (p.volume * 100000 * (p.currentPrice || 1)), 0);
    const totalMarginUsed = openPositions.reduce((sum, p) => sum + (p.volume * 100000 * (p.currentPrice || 1) / leverage), 0);
    const totalUnrealizedPnL = openPositions.reduce((sum, p) => sum + ((p as any).unrealizedPnL || p.pnl || 0), 0);
    const currentPortfolioRisk = Math.abs(totalUnrealizedPnL) / accountBalance * 100;
    
    const marginLevel = totalMarginUsed > 0 ? ((accountBalance + totalUnrealizedPnL) / totalMarginUsed) * 100 : 0;
    const freeMargin = accountBalance + totalUnrealizedPnL - totalMarginUsed;
    
    return {
      totalExposure,
      totalMarginUsed,
      totalUnrealizedPnL,
      currentPortfolioRisk,
      marginLevel,
      freeMargin,
      positionCount: openPositions.length,
      maxPositionsReached: openPositions.length >= maxPositions,
      portfolioRiskExceeded: currentPortfolioRisk > maxPortfolioRisk,
    };
  }, [positions, accountBalance, leverage, maxPositions, maxPortfolioRisk]);

  // Risk warnings
  const riskWarnings = useMemo(() => {
    const warnings = [];
    
    if (calculation.riskRewardRatio < 1) {
      warnings.push({
        type: 'warning' as const,
        message: 'Risk/Reward ratio is less than 1:1',
        icon: AlertTriangle,
      });
    }
    
    if (calculation.riskAmount > accountBalance * 0.05) {
      warnings.push({
        type: 'error' as const,
        message: 'Risk amount exceeds 5% of account balance',
        icon: XCircle,
      });
    }
    
    if (calculation.marginRequired > portfolioRisk.freeMargin) {
      warnings.push({
        type: 'error' as const,
        message: 'Insufficient margin for this position',
        icon: XCircle,
      });
    }
    
    if (portfolioRisk.marginLevel < 200 && portfolioRisk.marginLevel > 0) {
      warnings.push({
        type: 'warning' as const,
        message: 'Margin level is below 200%',
        icon: AlertTriangle,
      });
    }
    
    if (portfolioRisk.portfolioRiskExceeded) {
      warnings.push({
        type: 'error' as const,
        message: 'Portfolio risk limit exceeded',
        icon: XCircle,
      });
    }
    
    return warnings;
  }, [calculation, portfolioRisk, accountBalance]);

  useEffect(() => {
    if (onCalculationChange) {
      onCalculationChange(calculation);
    }
  }, [calculation, onCalculationChange]);

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

  const getRiskLevel = (percentage: number) => {
    if (percentage <= 1) return { level: 'Low', color: 'text-green-400', bg: 'bg-green-500/10' };
    if (percentage <= 3) return { level: 'Medium', color: 'text-yellow-400', bg: 'bg-yellow-500/10' };
    return { level: 'High', color: 'text-red-400', bg: 'bg-red-500/10' };
  };

  const riskLevel = getRiskLevel(riskPercentage);

  return (
    <div className={cn("space-y-6", className)}>
      <Tabs value="calculator" onValueChange={() => {}} className="w-full">
        <TabsList className="grid w-full grid-cols-3 bg-gray-800">
          <TabsTrigger value="calculator" className="data-[state=active]:bg-gray-700">
            <Calculator className="h-4 w-4 mr-2" />
            Calculator
          </TabsTrigger>
          <TabsTrigger value="portfolio" className="data-[state=active]:bg-gray-700">
            <Shield className="h-4 w-4 mr-2" />
            Portfolio
          </TabsTrigger>
          <TabsTrigger value="analysis" className="data-[state=active]:bg-gray-700">
            <Activity className="h-4 w-4 mr-2" />
            Analysis
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calculator" className="space-y-4">
          {/* Risk Warnings */}
          {riskWarnings.length > 0 && (
            <Card className="border-yellow-500/20 bg-yellow-500/5">
              <CardContent className="p-4">
                <div className="space-y-2">
                  {riskWarnings.map((warning, index) => {
                    const Icon = warning.icon;
                    return (
                      <div key={index} className="flex items-center space-x-2">
                        <Icon className={cn(
                          "h-4 w-4",
                          warning.type === 'error' ? "text-red-400" : "text-yellow-400"
                        )} />
                        <span className={cn(
                          "text-sm",
                          warning.type === 'error' ? "text-red-400" : "text-yellow-400"
                        )}>
                          {warning.message}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Input Parameters */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Calculator className="h-5 w-5" />
                  <span>Position Parameters</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-gray-300">Symbol</Label>
                    <Input
                      value={symbol}
                      onChange={() => {}}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Side</Label>
                    <Select value={side} onValueChange={(value: 'BUY' | 'SELL') => {}}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="BUY">BUY</SelectItem>
                        <SelectItem value="SELL">SELL</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <Label className="text-gray-300">Entry Price</Label>
                    <Input
                      type="number"
                      value={entryPrice}
                      onChange={(e) => setEntryPrice(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Stop Loss</Label>
                    <Input
                      type="number"
                      value={stopLoss}
                      onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                  <div>
                    <Label className="text-gray-300">Take Profit</Label>
                    <Input
                      type="number"
                      value={takeProfit}
                      onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>
                </div>

                <Separator className="bg-gray-600" />

                <div className="space-y-4">
                  <div>
                    <Label className="text-gray-300">Account Balance</Label>
                    <Input
                      type="number"
                      value={accountBalance}
                      onChange={(e) => setAccountBalance(parseFloat(e.target.value) || 0)}
                      className="bg-gray-700 border-gray-600 text-white"
                    />
                  </div>

                  <div>
                    <Label className="text-gray-300">Risk Method</Label>
                    <Select value={riskMethod} onValueChange={(value: 'percentage' | 'fixed') => setRiskMethod(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="percentage">Percentage of Balance</SelectItem>
                        <SelectItem value="fixed">Fixed Amount</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {riskMethod === 'percentage' ? (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <Label className="text-gray-300">Risk Percentage</Label>
                        <Badge className={cn("text-xs", riskLevel.bg, riskLevel.color)}>
                          {riskLevel.level} Risk
                        </Badge>
                      </div>
                      <Input
                        type="number"
                        value={riskPercentage}
                        onChange={(e) => setRiskPercentage(parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-gray-300">Fixed Risk Amount</Label>
                      <Input
                        type="number"
                        value={fixedRiskAmount}
                        onChange={(e) => setFixedRiskAmount(parseFloat(e.target.value) || 0)}
                        className="bg-gray-700 border-gray-600 text-white"
                      />
                    </div>
                  )}

                  <div>
                    <Label className="text-gray-300">Leverage</Label>
                    <Select value={leverage.toString()} onValueChange={(value) => setLeverage(parseInt(value))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="1">1:1</SelectItem>
                        <SelectItem value="10">1:10</SelectItem>
                        <SelectItem value="50">1:50</SelectItem>
                        <SelectItem value="100">1:100</SelectItem>
                        <SelectItem value="200">1:200</SelectItem>
                        <SelectItem value="500">1:500</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Calculation Results */}
            <Card className="bg-gray-800/50 border-gray-700">
              <CardHeader>
                <CardTitle className="text-white flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Calculation Results</span>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Position Size */}
                <div className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Position Size</span>
                    <Badge className="border-blue-500 text-blue-400 border">
                      Recommended
                    </Badge>
                  </div>
                  <p className="text-2xl font-bold text-white">
                    {formatNumber(calculation.positionSize, 2)} lots
                  </p>
                  <p className="text-xs text-gray-400">
                    {formatNumber(calculation.positionSize * 100000, 0)} units
                  </p>
                </div>

                {/* Risk/Reward */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Risk Amount</p>
                    <p className="text-lg font-bold text-red-400">
                      {formatCurrency(calculation.riskAmount)}
                    </p>
                  </div>
                  <div className="text-center p-3 bg-gray-700/50 rounded-lg">
                    <p className="text-xs text-gray-400 mb-1">Potential Profit</p>
                    <p className="text-lg font-bold text-green-400">
                      {formatCurrency(calculation.potentialProfit)}
                    </p>
                  </div>
                </div>

                {/* Risk/Reward Ratio */}
                <div className="p-4 bg-gray-700/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm text-gray-300">Risk/Reward Ratio</span>
                    <Badge className={cn(
                      "text-xs",
                      calculation.riskRewardRatio >= 2 ? "bg-green-500/20 text-green-400" :
                      calculation.riskRewardRatio >= 1 ? "bg-yellow-500/20 text-yellow-400" :
                      "bg-red-500/20 text-red-400"
                    )}>
                      {calculation.riskRewardRatio >= 2 ? 'Excellent' :
                       calculation.riskRewardRatio >= 1 ? 'Good' : 'Poor'}
                    </Badge>
                  </div>
                  <p className="text-xl font-bold text-white">
                    1:{formatNumber(calculation.riskRewardRatio, 2)}
                  </p>
                </div>

                {/* Additional Metrics */}
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Margin Required</span>
                    <span className="text-sm text-white font-medium">
                      {formatCurrency(calculation.marginRequired)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Stop Loss (pips)</span>
                    <span className="text-sm text-white font-medium">
                      {formatNumber(calculation.stopLossPips, 1)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-400">Take Profit (pips)</span>
                    <span className="text-sm text-white font-medium">
                      {formatNumber(calculation.takeProfitPips, 1)}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="portfolio" className="space-y-4">
          {/* Portfolio Overview */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-500/20 rounded-full">
                    <Shield className="h-4 w-4 text-blue-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Portfolio Risk</p>
                    <p className={cn(
                      "text-lg font-bold",
                      portfolioRisk.currentPortfolioRisk <= 5 ? "text-green-400" :
                      portfolioRisk.currentPortfolioRisk <= 10 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {formatNumber(portfolioRisk.currentPortfolioRisk, 1)}%
                    </p>
                  </div>
                </div>
                <Progress 
                  value={Math.min(portfolioRisk.currentPortfolioRisk, 20)} 
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-purple-500/20 rounded-full">
                    <Activity className="h-4 w-4 text-purple-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Margin Level</p>
                    <p className={cn(
                      "text-lg font-bold",
                      portfolioRisk.marginLevel >= 200 ? "text-green-400" :
                      portfolioRisk.marginLevel >= 100 ? "text-yellow-400" : "text-red-400"
                    )}>
                      {formatNumber(portfolioRisk.marginLevel, 0)}%
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gray-800/50 border-gray-700">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-green-500/20 rounded-full">
                    <DollarSign className="h-4 w-4 text-green-400" />
                  </div>
                  <div>
                    <p className="text-xs text-gray-400">Free Margin</p>
                    <p className="text-lg font-bold text-white">
                      {formatCurrency(portfolioRisk.freeMargin)}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Portfolio Settings */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Risk Management Settings</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-gray-300">Max Positions</Label>
                  <Input
                    type="number"
                    value={maxPositions}
                    onChange={(e) => setMaxPositions(parseInt(e.target.value) || 1)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                  <p className="text-xs text-gray-400 mt-1">
                    Current: {portfolioRisk.positionCount}/{maxPositions}
                  </p>
                </div>
                <div>
                  <Label className="text-gray-300">Max Risk per Trade (%)</Label>
                  <Input
                    type="number"
                    value={maxRiskPerTrade}
                    onChange={(e) => setMaxRiskPerTrade(parseFloat(e.target.value) || 0.1)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Max Portfolio Risk (%)</Label>
                  <Input
                    type="number"
                    value={maxPortfolioRisk}
                    onChange={(e) => setMaxPortfolioRisk(parseFloat(e.target.value) || 1)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
                <div>
                  <Label className="text-gray-300">Correlation Limit</Label>
                  <Input
                    type="number"
                    value={correlationLimit}
                    onChange={(e) => setCorrelationLimit(parseFloat(e.target.value) || 0.1)}
                    className="bg-gray-700 border-gray-600 text-white"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis" className="space-y-4">
          {/* Risk Analysis */}
          <Card className="bg-gray-800/50 border-gray-700">
            <CardHeader>
              <CardTitle className="text-white">Risk Analysis</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-300">Position Analysis</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Win Probability</span>
                      <span className="text-sm text-white font-medium">65%</span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Expected Value</span>
                      <span className="text-sm text-green-400 font-medium">
                        {formatCurrency(calculation.potentialProfit * 0.65 - calculation.riskAmount * 0.35)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Kelly Criterion</span>
                      <span className="text-sm text-white font-medium">2.3%</span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h4 className="text-sm font-medium text-gray-300">Market Conditions</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Volatility</span>
                      <Badge className="bg-yellow-500/20 text-yellow-400">Medium</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Trend Strength</span>
                      <Badge className="bg-green-500/20 text-green-400">Strong</Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <span className="text-sm text-gray-400">Support/Resistance</span>
                      <Badge className="bg-blue-500/20 text-blue-400">Near Support</Badge>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default RiskCalculator;