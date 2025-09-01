import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { AlertTriangle, Calculator, TrendingUp, TrendingDown, Clock, Target } from 'lucide-react';
import { useOrderStore } from '@/store/useOrderStore';
import { useTradingStore } from '@/store/useTradingStore';
import { OrderType, OrderSide, OrderFormData, ValidationError } from '@/types/orderManagement';
import { cn } from '@/lib/utils';

interface DynamicOrderFormProps {
  className?: string;
  onOrderSubmit?: (order: OrderFormData) => void;
  defaultSymbol?: string;
}

export const DynamicOrderForm: React.FC<DynamicOrderFormProps> = ({
  className,
  onOrderSubmit,
  defaultSymbol
}) => {
  const {
    currentOrder,
    validationResult,
    riskCalculation,
    isLoading,
    setCurrentOrder,
    validateOrder,
    calculateRisk,
    submitOrder,
    clearErrors
  } = useOrderStore();

  const { selectedSymbol, symbols } = useTradingStore();

  const [activeTab, setActiveTab] = useState<OrderSide>('BUY');
  const [advancedMode, setAdvancedMode] = useState(false);

  // Initialize form with default values
  useEffect(() => {
    const symbol = defaultSymbol || selectedSymbol || 'EURUSD';
    setCurrentOrder({
      symbol,
      type: 'MARKET',
      side: 'BUY',
      quantity: 0.01,
      price: 0,
      stopLoss: 0,
      takeProfit: 0,
      timeInForce: 'GTC',
      expiry: undefined,
      trailingStop: false,
      trailingAmount: 0,
      reduceOnly: false,
      postOnly: false
    });
  }, [defaultSymbol, selectedSymbol, setCurrentOrder]);

  // Real-time validation and risk calculation
  useEffect(() => {
    if (currentOrder.symbol && currentOrder.quantity > 0) {
      validateOrder(currentOrder);
      calculateRisk(currentOrder);
    }
  }, [currentOrder, validateOrder, calculateRisk]);

  const handleFieldChange = (field: keyof OrderFormData, value: any) => {
    setCurrentOrder({ ...currentOrder, [field]: value });
    clearErrors();
  };

  const handleSubmit = async () => {
    if (validationResult?.isValid) {
      await submitOrder(currentOrder);
      onOrderSubmit?.(currentOrder);
    }
  };

  const currentSymbolData = useMemo(() => {
    return symbols.find(s => s.symbol === currentOrder.symbol);
  }, [symbols, currentOrder.symbol]);

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'LOW': return 'text-green-600';
      case 'MEDIUM': return 'text-yellow-600';
      case 'HIGH': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getOrderTypeFields = () => {
    switch (currentOrder.type) {
      case 'LIMIT':
      case 'STOP':
      case 'STOP_LIMIT':
        return (
          <div className="space-y-4">
            <div>
              <Label htmlFor="price">Price</Label>
              <Input
                id="price"
                type="number"
                step="0.00001"
                value={currentOrder.price || ''}
                onChange={(e) => handleFieldChange('price', parseFloat(e.target.value) || 0)}
                placeholder="Enter price"
              />
            </div>
            {currentOrder.type === 'STOP_LIMIT' && (
              <div>
                <Label htmlFor="stopPrice">Stop Price</Label>
                <Input
                  id="stopPrice"
                  type="number"
                  step="0.00001"
                  value={currentOrder.stopPrice || ''}
                  onChange={(e) => handleFieldChange('stopPrice', parseFloat(e.target.value) || 0)}
                  placeholder="Enter stop price"
                />
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <Card className={cn('w-full max-w-2xl', className)}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Dynamic Order Form
          </CardTitle>
          <div className="flex items-center gap-2">
            <Label htmlFor="advanced-mode" className="text-sm">Advanced</Label>
            <Switch
              id="advanced-mode"
              checked={advancedMode}
              onCheckedChange={setAdvancedMode}
            />
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Order Side Tabs */}
        <Tabs value={activeTab} onValueChange={(value) => {
          setActiveTab(value as OrderSide);
          handleFieldChange('side', value);
        }}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="BUY" className="text-green-600 data-[state=active]:bg-green-100">
              <TrendingUp className="h-4 w-4 mr-2" />
              BUY
            </TabsTrigger>
            <TabsTrigger value="SELL" className="text-red-600 data-[state=active]:bg-red-100">
              <TrendingDown className="h-4 w-4 mr-2" />
              SELL
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            {/* Symbol Selection */}
            <div>
              <Label htmlFor="symbol">Symbol</Label>
              <Select value={currentOrder.symbol} onValueChange={(value) => handleFieldChange('symbol', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select symbol" />
                </SelectTrigger>
                <SelectContent>
                  {symbols.map((symbol) => (
                    <SelectItem key={symbol.symbol} value={symbol.symbol}>
                      <div className="flex items-center justify-between w-full">
                        <span>{symbol.symbol}</span>
                        <span className="text-sm text-gray-500 ml-2">{symbol.bid}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Order Type */}
            <div>
              <Label htmlFor="orderType">Order Type</Label>
              <Select value={currentOrder.type} onValueChange={(value) => handleFieldChange('type', value as OrderType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="MARKET">Market Order</SelectItem>
                  <SelectItem value="LIMIT">Limit Order</SelectItem>
                  <SelectItem value="STOP">Stop Order</SelectItem>
                  <SelectItem value="STOP_LIMIT">Stop Limit</SelectItem>
                  <SelectItem value="TRAILING_STOP">Trailing Stop</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Quantity */}
            <div>
              <Label htmlFor="quantity">Quantity (Lots)</Label>
              <div className="space-y-2">
                <Input
                  id="quantity"
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={currentOrder.quantity}
                  onChange={(e) => handleFieldChange('quantity', parseFloat(e.target.value) || 0)}
                  placeholder="0.01"
                />
                <Slider
                  value={[currentOrder.quantity]}
                  onValueChange={([value]) => handleFieldChange('quantity', value)}
                  max={10}
                  min={0.01}
                  step={0.01}
                  className="w-full"
                />
              </div>
            </div>

            {/* Dynamic Order Type Fields */}
            {getOrderTypeFields()}

            {/* Advanced Options */}
            {advancedMode && (
              <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
                <h4 className="font-medium">Advanced Options</h4>
                
                {/* Stop Loss & Take Profit */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="stopLoss">Stop Loss</Label>
                    <Input
                      id="stopLoss"
                      type="number"
                      step="0.00001"
                      value={currentOrder.stopLoss || ''}
                      onChange={(e) => handleFieldChange('stopLoss', parseFloat(e.target.value) || 0)}
                      placeholder="Optional"
                    />
                  </div>
                  <div>
                    <Label htmlFor="takeProfit">Take Profit</Label>
                    <Input
                      id="takeProfit"
                      type="number"
                      step="0.00001"
                      value={currentOrder.takeProfit || ''}
                      onChange={(e) => handleFieldChange('takeProfit', parseFloat(e.target.value) || 0)}
                      placeholder="Optional"
                    />
                  </div>
                </div>

                {/* Time in Force */}
                <div>
                  <Label htmlFor="timeInForce">Time in Force</Label>
                  <Select value={currentOrder.timeInForce} onValueChange={(value) => handleFieldChange('timeInForce', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="GTC">Good Till Cancelled</SelectItem>
                      <SelectItem value="IOC">Immediate or Cancel</SelectItem>
                      <SelectItem value="FOK">Fill or Kill</SelectItem>
                      <SelectItem value="GTD">Good Till Date</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Trailing Stop */}
                {currentOrder.type === 'TRAILING_STOP' && (
                  <div>
                    <Label htmlFor="trailingAmount">Trailing Amount</Label>
                    <Input
                      id="trailingAmount"
                      type="number"
                      step="0.00001"
                      value={currentOrder.trailingAmount || ''}
                      onChange={(e) => handleFieldChange('trailingAmount', parseFloat(e.target.value) || 0)}
                      placeholder="Enter trailing amount"
                    />
                  </div>
                )}

                {/* Order Flags */}
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="reduceOnly"
                      checked={currentOrder.reduceOnly}
                      onCheckedChange={(checked) => handleFieldChange('reduceOnly', checked)}
                    />
                    <Label htmlFor="reduceOnly" className="text-sm">Reduce Only</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="postOnly"
                      checked={currentOrder.postOnly}
                      onCheckedChange={(checked) => handleFieldChange('postOnly', checked)}
                    />
                    <Label htmlFor="postOnly" className="text-sm">Post Only</Label>
                  </div>
                </div>
              </div>
            )}

            {/* Risk Calculation Display */}
            {riskCalculation && (
              <Card className="bg-blue-50">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Calculator className="h-4 w-4" />
                    <h4 className="font-medium">Risk Analysis</h4>
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Position Value:</span>
                      <span className="ml-2 font-medium">${riskCalculation.positionValue.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Required Margin:</span>
                      <span className="ml-2 font-medium">${riskCalculation.requiredMargin.toFixed(2)}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Risk Level:</span>
                      <Badge variant="outline" className={getRiskColor(riskCalculation.riskLevel)}>
                        {riskCalculation.riskLevel}
                      </Badge>
                    </div>
                    <div>
                      <span className="text-gray-600">Max Loss:</span>
                      <span className="ml-2 font-medium text-red-600">${riskCalculation.maxLoss.toFixed(2)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Validation Errors */}
            {validationResult && !validationResult.isValid && (
              <Alert variant="destructive">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  <ul className="list-disc list-inside space-y-1">
                    {validationResult.errors.map((error, index) => (
                      <li key={index}>{error.message}</li>
                    ))}
                  </ul>
                </AlertDescription>
              </Alert>
            )}

            {/* Submit Button */}
            <Button
              onClick={handleSubmit}
              disabled={!validationResult?.isValid || isLoading}
              className={cn(
                'w-full',
                activeTab === 'BUY' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              )}
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 animate-spin" />
                  Processing...
                </div>
              ) : (
                `${activeTab} ${currentOrder.quantity} ${currentOrder.symbol}`
              )}
            </Button>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};

export default DynamicOrderForm;