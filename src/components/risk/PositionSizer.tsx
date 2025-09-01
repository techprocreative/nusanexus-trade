import React, { useState, useMemo } from 'react';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Calculator,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Percent,
  Target,
  AlertTriangle,
  CheckCircle,
  Info,
} from 'lucide-react';
import { PositionSizing } from '@/types/orderManagement';

interface PositionSizerProps {
  symbol?: string;
  currentPrice?: number;
  accountBalance?: number;
  onSizeCalculated?: (sizing: PositionSizing) => void;
  className?: string;
}

const PositionSizer: React.FC<PositionSizerProps> = ({
  symbol = 'EURUSD',
  currentPrice = 1.0850,
  accountBalance = 10000,
  onSizeCalculated,
  className,
}) => {
  const [riskPercentage, setRiskPercentage] = useState([2]);
  const [stopLossDistance, setStopLossDistance] = useState(50); // pips
  const [takeProfitDistance, setTakeProfitDistance] = useState(100); // pips
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [calculationMethod, setCalculationMethod] = useState<'percentage' | 'fixed' | 'lots'>('percentage');
  const [fixedAmount, setFixedAmount] = useState(200);
  const [desiredLots, setDesiredLots] = useState(0.1);

  // Quick risk presets
  const riskPresets = [
    { label: 'Conservative', value: 1, color: 'bg-green-500' },
    { label: 'Moderate', value: 2, color: 'bg-yellow-500' },
    { label: 'Aggressive', value: 3, color: 'bg-orange-500' },
    { label: 'High Risk', value: 5, color: 'bg-red-500' },
  ];

  // Calculate position sizing
  const sizing = useMemo(() => {
    const pipValue = symbol.includes('JPY') ? 0.01 : 0.0001;
    const pipValueInUSD = symbol.includes('JPY') ? 0.91 : 1; // Simplified calculation
    
    let positionSize = 0;
    let riskAmount = 0;
    
    if (calculationMethod === 'percentage') {
      riskAmount = (accountBalance * riskPercentage[0]) / 100;
      positionSize = stopLossDistance > 0 ? riskAmount / (stopLossDistance * pipValueInUSD) : 0;
    } else if (calculationMethod === 'fixed') {
      riskAmount = fixedAmount;
      positionSize = stopLossDistance > 0 ? riskAmount / (stopLossDistance * pipValueInUSD) : 0;
    } else {
      positionSize = desiredLots * 100000;
      riskAmount = stopLossDistance * pipValueInUSD * desiredLots;
    }
    
    const lotSize = positionSize / 100000;
    const entryPrice = currentPrice;
    const stopLoss = side === 'BUY' 
      ? entryPrice - (stopLossDistance * pipValue)
      : entryPrice + (stopLossDistance * pipValue);
    const takeProfit = side === 'BUY'
      ? entryPrice + (takeProfitDistance * pipValue)
      : entryPrice - (takeProfitDistance * pipValue);
    
    const potentialProfit = takeProfitDistance * pipValueInUSD * lotSize;
    const riskRewardRatio = stopLossDistance > 0 ? takeProfitDistance / stopLossDistance : 0;
    const marginRequired = (positionSize * entryPrice) / 100; // Assuming 1:100 leverage
    
    return {
      symbol,
      side,
      entryPrice,
      stopLoss,
      takeProfit,
      positionSize: lotSize,
      riskAmount,
      potentialProfit,
      potentialLoss: riskAmount,
      riskRewardRatio,
      marginRequired,
      stopLossPips: stopLossDistance,
      takeProfitPips: takeProfitDistance,
      pipValue: pipValueInUSD,
    } as PositionSizing;
  }, [
    symbol, currentPrice, accountBalance, riskPercentage, stopLossDistance,
    takeProfitDistance, side, calculationMethod, fixedAmount, desiredLots
  ]);

  // Risk assessment
  const riskAssessment = useMemo(() => {
    const riskPercent = (sizing.riskAmount / accountBalance) * 100;
    const marginPercent = (sizing.marginRequired / accountBalance) * 100;
    
    let riskLevel: 'low' | 'medium' | 'high' | 'extreme';
    let riskColor: string;
    let riskBg: string;
    
    if (riskPercent <= 1) {
      riskLevel = 'low';
      riskColor = 'text-green-400';
      riskBg = 'bg-green-500/10';
    } else if (riskPercent <= 3) {
      riskLevel = 'medium';
      riskColor = 'text-yellow-400';
      riskBg = 'bg-yellow-500/10';
    } else if (riskPercent <= 5) {
      riskLevel = 'high';
      riskColor = 'text-orange-400';
      riskBg = 'bg-orange-500/10';
    } else {
      riskLevel = 'extreme';
      riskColor = 'text-red-400';
      riskBg = 'bg-red-500/10';
    }
    
    const warnings = [];
    if (riskPercent > 5) warnings.push('Risk exceeds 5% of account');
    if (sizing.riskRewardRatio < 1) warnings.push('Poor risk/reward ratio');
    if (marginPercent > 50) warnings.push('High margin usage');
    if (sizing.positionSize < 0.01) warnings.push('Position size too small');
    
    return {
      riskLevel,
      riskColor,
      riskBg,
      riskPercent,
      marginPercent,
      warnings,
      isAcceptable: warnings.length === 0 && riskLevel !== 'extreme',
    };
  }, [sizing, accountBalance]);

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

  const handlePresetClick = (value: number) => {
    setRiskPercentage([value]);
  };

  const handleApplySize = () => {
    if (onSizeCalculated) {
      onSizeCalculated(sizing);
    }
  };

  return (
    <div className={cn("space-y-4", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Calculator className="h-5 w-5 text-blue-400" />
          <h3 className="text-lg font-semibold text-white">Position Sizer</h3>
        </div>
        <Badge className={cn("text-xs", riskAssessment.riskBg, riskAssessment.riskColor)}>
          {riskAssessment.riskLevel.toUpperCase()} RISK
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Input Controls */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300">Parameters</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Symbol and Side */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Symbol</Label>
                <div className="mt-1 p-2 bg-gray-700 rounded text-sm text-white font-mono">
                  {symbol}
                </div>
              </div>
              <div>
                <Label className="text-xs text-gray-400">Side</Label>
                <Select value={side} onValueChange={(value: 'BUY' | 'SELL') => setSide(value)}>
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
            </div>

            {/* Calculation Method */}
            <div>
              <Label className="text-xs text-gray-400">Calculation Method</Label>
              <Select value={calculationMethod} onValueChange={(value: 'percentage' | 'fixed' | 'lots') => setCalculationMethod(value)}>
                <SelectTrigger className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  <SelectItem value="percentage">Risk Percentage</SelectItem>
                  <SelectItem value="fixed">Fixed Amount</SelectItem>
                  <SelectItem value="lots">Desired Lot Size</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Risk Input */}
            {calculationMethod === 'percentage' && (
              <div>
                <div className="flex items-center justify-between mb-2">
                  <Label className="text-xs text-gray-400">Risk Percentage</Label>
                  <span className="text-xs text-white font-medium">{riskPercentage[0]}%</span>
                </div>
                <Slider
                  value={riskPercentage}
                  onValueChange={setRiskPercentage}
                  max={10}
                  min={0.1}
                  step={0.1}
                  className="mb-2"
                />
                <div className="flex space-x-1">
                  {riskPresets.map((preset) => (
                    <Button
                      key={preset.value}
                      variant="outline"
                      size="sm"
                      className={cn(
                        "h-6 px-2 text-xs border-gray-600",
                        riskPercentage[0] === preset.value
                          ? "bg-blue-500/20 border-blue-500 text-blue-400"
                          : "bg-gray-700 text-gray-300 hover:bg-gray-600"
                      )}
                      onClick={() => handlePresetClick(preset.value)}
                    >
                      {preset.label}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {calculationMethod === 'fixed' && (
              <div>
                <Label className="text-xs text-gray-400">Fixed Risk Amount</Label>
                <Input
                  type="number"
                  value={fixedAmount}
                  onChange={(e) => setFixedAmount(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="200"
                />
              </div>
            )}

            {calculationMethod === 'lots' && (
              <div>
                <Label className="text-xs text-gray-400">Desired Lot Size</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={desiredLots}
                  onChange={(e) => setDesiredLots(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="0.10"
                />
              </div>
            )}

            {/* Stop Loss and Take Profit */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs text-gray-400">Stop Loss (pips)</Label>
                <Input
                  type="number"
                  value={stopLossDistance}
                  onChange={(e) => setStopLossDistance(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="50"
                />
              </div>
              <div>
                <Label className="text-xs text-gray-400">Take Profit (pips)</Label>
                <Input
                  type="number"
                  value={takeProfitDistance}
                  onChange={(e) => setTakeProfitDistance(parseFloat(e.target.value) || 0)}
                  className="mt-1 h-8 bg-gray-700 border-gray-600 text-white text-sm"
                  placeholder="100"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card className="bg-gray-800/50 border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm text-gray-300">Calculation Results</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Position Size */}
            <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Position Size</span>
                <Target className="h-3 w-3 text-blue-400" />
              </div>
              <p className="text-xl font-bold text-white">
                {formatNumber(sizing.positionSize, 2)} lots
              </p>
              <p className="text-xs text-gray-400">
                {formatNumber(sizing.positionSize * 100000, 0)} units
              </p>
            </div>

            {/* Risk and Reward */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingDown className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-gray-400">Risk</span>
                </div>
                <p className="text-sm font-bold text-red-400">
                  {formatCurrency(sizing.riskAmount)}
                </p>
                <p className="text-xs text-gray-400">
                  {formatNumber(riskAssessment.riskPercent, 1)}% of account
                </p>
              </div>
              <div className="p-3 bg-green-500/10 border border-green-500/20 rounded-lg">
                <div className="flex items-center space-x-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-green-400" />
                  <span className="text-xs text-gray-400">Reward</span>
                </div>
                <p className="text-sm font-bold text-green-400">
                  {formatCurrency(sizing.potentialProfit)}
                </p>
                <p className="text-xs text-gray-400">
                  1:{formatNumber(sizing.riskRewardRatio, 1)} R:R
                </p>
              </div>
            </div>

            {/* Additional Metrics */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Entry Price</span>
                <span className="text-white font-mono">{formatNumber(sizing.entryPrice, 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Stop Loss</span>
                <span className="text-red-400 font-mono">{formatNumber(sizing.stopLoss, 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Take Profit</span>
                <span className="text-green-400 font-mono">{formatNumber(sizing.takeProfit, 5)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Margin Required</span>
                <span className="text-white">{formatCurrency(sizing.marginRequired)}</span>
              </div>
            </div>

            {/* Warnings */}
            {riskAssessment.warnings.length > 0 && (
              <div className="p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="h-3 w-3 text-yellow-400" />
                  <span className="text-xs text-yellow-400 font-medium">Warnings</span>
                </div>
                <div className="space-y-1">
                  {riskAssessment.warnings.map((warning, index) => (
                    <p key={index} className="text-xs text-yellow-400">
                      • {warning}
                    </p>
                  ))}
                </div>
              </div>
            )}

            {/* Apply Button */}
            <Button
              onClick={handleApplySize}
              disabled={!riskAssessment.isAcceptable}
              className={cn(
                "w-full h-8 text-sm",
                riskAssessment.isAcceptable
                  ? "bg-blue-600 hover:bg-blue-700 text-white"
                  : "bg-gray-600 text-gray-400 cursor-not-allowed"
              )}
            >
              {riskAssessment.isAcceptable ? (
                <>
                  <CheckCircle className="h-3 w-3 mr-2" />
                  Apply Position Size
                </>
              ) : (
                <>
                  <AlertTriangle className="h-3 w-3 mr-2" />
                  Review Warnings
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Quick Info */}
      <Card className="bg-gray-800/30 border-gray-700">
        <CardContent className="p-3">
          <div className="flex items-center space-x-2 text-xs text-gray-400">
            <Info className="h-3 w-3" />
            <span>
              Position sizing based on {calculationMethod === 'percentage' ? `${riskPercentage[0]}% account risk` : 
              calculationMethod === 'fixed' ? `$${fixedAmount} fixed risk` : `${desiredLots} lot size`}.
              Always verify calculations before trading.
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PositionSizer;