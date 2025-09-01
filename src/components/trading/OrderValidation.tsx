import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Shield, 
  TrendingUp, 
  DollarSign,
  Clock,
  Target,
  AlertCircle
} from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useTradingStore } from '@/store/useTradingStore';
import { 
  OrderFormData, 
  ValidationError, 
  OrderValidationResult, 
  RiskCalculation 
} from '@/types/orderManagement';
import { cn } from '@/lib/utils';

interface OrderValidationProps {
  order: OrderFormData;
  className?: string;
  showRiskAnalysis?: boolean;
  showMarketConditions?: boolean;
}

export const OrderValidation: React.FC<OrderValidationProps> = ({
  order,
  className,
  showRiskAnalysis = true,
  showMarketConditions = true
}) => {
  const { validationResult, riskCalculation, validateOrder, calculateRisk } = useOrderStore();
  const { symbols, account } = useTradingStore();
  const [marketConditions, setMarketConditions] = useState({
    volatility: 'MEDIUM',
    spread: 2.5,
    liquidity: 'HIGH',
    marketHours: true
  });

  // Real-time validation
  useEffect(() => {
    if (order.symbol && order.quantity > 0) {
      validateOrder(order);
      calculateRisk(order);
    }
  }, [order, validateOrder, calculateRisk]);

  const getValidationIcon = (isValid: boolean) => {
    return isValid ? (
      <CheckCircle className="h-4 w-4 text-green-600" />
    ) : (
      <XCircle className="h-4 w-4 text-red-600" />
    );
  };

  const getRiskLevelColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'bg-green-100 text-green-800 border-green-200';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'HIGH': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRiskProgress = (level: string) => {
    switch (level) {
      case 'LOW': return 25;
      case 'MEDIUM': return 60;
      case 'HIGH': return 90;
      default: return 0;
    }
  };

  const getMarketConditionColor = (condition: string) => {
    switch (condition) {
      case 'HIGH':
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      default: return 'text-gray-600';
    }
  };

  const currentSymbol = symbols.find(s => s.symbol === order.symbol);
  const accountBalance = account?.balance || 10000;
  const usedMargin = account?.usedMargin || 0;
  const freeMargin = accountBalance - usedMargin;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Validation Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <Shield className="h-5 w-5" />
            Order Validation
            {validationResult && getValidationIcon(validationResult.isValid)}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {validationResult ? (
            <>
              {/* Overall Status */}
              <div className="flex items-center justify-between">
                <span className="font-medium">
                  {validationResult.isValid ? 'Order Valid' : 'Validation Failed'}
                </span>
                <Badge 
                  variant={validationResult.isValid ? 'default' : 'destructive'}
                  className="flex items-center gap-1"
                >
                  {validationResult.isValid ? (
                    <CheckCircle className="h-3 w-3" />
                  ) : (
                    <AlertTriangle className="h-3 w-3" />
                  )}
                  {validationResult.isValid ? 'VALID' : 'INVALID'}
                </Badge>
              </div>

              {/* Validation Errors */}
              {!validationResult.isValid && validationResult.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Please fix the following issues:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.errors.map((error, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{error.field}:</span> {error.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Validation Warnings */}
              {validationResult.warnings && validationResult.warnings.length > 0 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">Warnings:</p>
                      <ul className="list-disc list-inside space-y-1">
                        {validationResult.warnings.map((warning, index) => (
                          <li key={index} className="text-sm">
                            <span className="font-medium">{warning.field}:</span> {warning.message}
                          </li>
                        ))}
                      </ul>
                    </div>
                  </AlertDescription>
                </Alert>
              )}

              {/* Account Checks */}
              <div className="space-y-3">
                <h4 className="font-medium flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Account Status
                </h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Balance:</span>
                    <span className="font-medium">${accountBalance.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Free Margin:</span>
                    <span className={cn(
                      'font-medium',
                      freeMargin > 1000 ? 'text-green-600' : 'text-red-600'
                    )}>
                      ${freeMargin.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Used Margin:</span>
                    <span className="font-medium">${usedMargin.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Margin Level:</span>
                    <span className={cn(
                      'font-medium',
                      (accountBalance / usedMargin * 100) > 200 ? 'text-green-600' : 'text-yellow-600'
                    )}>
                      {usedMargin > 0 ? `${(accountBalance / usedMargin * 100).toFixed(1)}%` : '∞'}
                    </span>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Enter order details to validate</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      {showRiskAnalysis && riskCalculation && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Target className="h-5 w-5" />
              Risk Analysis
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Risk Level */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-medium">Risk Level</span>
                <Badge className={getRiskLevelColor(riskCalculation.riskLevel)}>
                  {riskCalculation.riskLevel}
                </Badge>
              </div>
              <Progress 
                value={getRiskProgress(riskCalculation.riskLevel)} 
                className="h-2"
              />
            </div>

            <Separator />

            {/* Risk Metrics */}
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Position Value:</span>
                  <span className="font-medium">${riskCalculation.positionValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Required Margin:</span>
                  <span className="font-medium">${riskCalculation.requiredMargin.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Leverage:</span>
                  <span className="font-medium">{riskCalculation.leverage}:1</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Loss:</span>
                  <span className="font-medium text-red-600">${riskCalculation.maxLoss.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Max Profit:</span>
                  <span className="font-medium text-green-600">${riskCalculation.maxProfit.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Risk/Reward:</span>
                  <span className="font-medium">
                    {riskCalculation.riskRewardRatio ? `1:${riskCalculation.riskRewardRatio.toFixed(2)}` : 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Risk Warnings */}
            {riskCalculation.riskLevel === 'HIGH' && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Risk Warning:</strong> This order carries significant risk. 
                  Consider reducing position size or adjusting stop loss levels.
                </AlertDescription>
              </Alert>
            )}

            {riskCalculation.requiredMargin > freeMargin && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Insufficient Margin:</strong> Required margin (${riskCalculation.requiredMargin.toFixed(2)}) 
                  exceeds available free margin (${freeMargin.toFixed(2)}).
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}

      {/* Market Conditions */}
      {showMarketConditions && currentSymbol && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-lg">
              <TrendingUp className="h-5 w-5" />
              Market Conditions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Current Price:</span>
                  <span className="font-medium">{currentSymbol.bid}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Spread:</span>
                  <span className="font-medium">{marketConditions.spread} pips</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Volatility:</span>
                  <span className={cn('font-medium', getMarketConditionColor(marketConditions.volatility))}>
                    {marketConditions.volatility}
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Liquidity:</span>
                  <span className={cn('font-medium', getMarketConditionColor(marketConditions.liquidity))}>
                    {marketConditions.liquidity}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Market Hours:</span>
                  <span className={cn(
                    'font-medium flex items-center gap-1',
                    marketConditions.marketHours ? 'text-green-600' : 'text-red-600'
                  )}>
                    <Clock className="h-3 w-3" />
                    {marketConditions.marketHours ? 'OPEN' : 'CLOSED'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Daily Change:</span>
                  <span className={cn(
                    'font-medium',
                    currentSymbol.change >= 0 ? 'text-green-600' : 'text-red-600'
                  )}>
                    {currentSymbol.change >= 0 ? '+' : ''}{currentSymbol.change}%
                  </span>
                </div>
              </div>
            </div>

            {/* Market Warnings */}
            {!marketConditions.marketHours && (
              <Alert>
                <Clock className="h-4 w-4" />
                <AlertDescription>
                  <strong>Market Closed:</strong> Trading outside market hours may result in wider spreads and limited liquidity.
                </AlertDescription>
              </Alert>
            )}

            {marketConditions.volatility === 'HIGH' && (
              <Alert>
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <strong>High Volatility:</strong> Market conditions are highly volatile. Consider adjusting position size and stop loss levels.
                </AlertDescription>
              </Alert>
            )}

            {marketConditions.spread > 5 && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  <strong>Wide Spread:</strong> Current spread is wider than usual ({marketConditions.spread} pips). This may impact order execution.
                </AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default OrderValidation;