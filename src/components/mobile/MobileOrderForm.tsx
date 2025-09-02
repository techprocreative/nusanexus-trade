import React, { useState, useEffect, useRef } from 'react';
import { useOrderStore } from '@/store/useOrderStore';
import { useTradingStore } from '@/store/useTradingStore';
import { OrderType, OrderSide, OrderFormData } from '@/types/orderManagement';
import { cn } from '@/lib/utils';
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
// } from '@/components/ui/card';
// import { Button } from '@/components/ui/button';
// import { Input } from '@/components/ui/input';
// import { Badge } from '@/components/ui/badge';
// import {
//   Sheet,
//   SheetContent,
//   SheetDescription,
//   SheetHeader,
//   SheetTitle,
//   SheetTrigger,
// } from '@/components/ui/sheet';
// import {
//   Drawer,
//   DrawerClose,
//   DrawerContent,
//   DrawerDescription,
//   DrawerFooter,
//   DrawerHeader,
//   DrawerTitle,
//   DrawerTrigger,
// } from '@/components/ui/drawer';

// Custom UI components
const Card = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`rounded-lg border ${className}`}>{children}</div>
);
const CardHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-6 pb-4">{children}</div>
);
const CardTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold ${className}`}>{children}</h3>
);
const CardContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 pt-0 ${className}`}>{children}</div>
);
const Button = ({ children, onClick, variant, size, className, disabled }: {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: string;
  size?: string;
  className?: string;
  disabled?: boolean;
}) => (
  <button
    onClick={onClick}
    disabled={disabled}
    className={`px-4 py-2 rounded-md font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
      variant === 'outline' ? 'border border-gray-600 bg-transparent hover:bg-gray-700' : 
      variant === 'ghost' ? 'bg-transparent hover:bg-gray-700' :
      variant === 'destructive' ? 'bg-red-600 hover:bg-red-700' :
      'bg-blue-600 hover:bg-blue-700'
    } ${size === 'sm' ? 'px-2 py-1 text-sm' : ''} ${className}`}
  >
    {children}
  </button>
);
const Input = ({ type, value, onChange, className, placeholder, min, max, step }: {
  type?: string;
  value?: string | number;
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  className?: string;
  placeholder?: string;
  min?: number;
  max?: number;
  step?: number | string;
}) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    className={`w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 ${className}`}
    placeholder={placeholder}
    min={min}
    max={max}
    step={step}
  />
);
const Badge = ({ children, variant, className }: {
  children: React.ReactNode;
  variant?: string;
  className?: string;
}) => (
  <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
    variant === 'destructive' ? 'bg-red-500 text-white' :
    variant === 'outline' ? 'border' : 'bg-gray-700'
  } ${className}`}>
    {children}
  </span>
);
const Sheet = ({ children, open, onOpenChange }: {
  children: React.ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) => (
  <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
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
const SheetTrigger = ({ children }: { children: React.ReactNode }) => (
  <div>{children}</div>
);
const Drawer = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <div>{children}</div>
);
const DrawerClose = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);
const DrawerContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-gray-800 rounded-t-lg ${className || ''}`}>{children}</div>
);
const DrawerDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm ${className || 'text-gray-400'}`}>{children}</p>
);
const DrawerFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 border-t border-gray-700">{children}</div>
);
const DrawerHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="p-4 pb-0">{children}</div>
);
const DrawerTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className || 'text-white'}`}>{children}</h2>
);
const DrawerTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);
import {
  Plus,
  Minus,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Target,
  Shield,
  AlertTriangle,
  Check,
  X,
  ChevronUp,
  ChevronDown,
  Settings,
  Info,
} from 'lucide-react';


interface MobileOrderFormProps {
  symbol?: string;
  onOrderSubmit?: () => void;
  onClose?: () => void;
}

const MobileOrderForm: React.FC<MobileOrderFormProps> = ({
  symbol = 'EURUSD',
  onOrderSubmit,
  onClose,
}) => {
  const {
    currentOrder,
    validationResult: validation,
    riskCalculation: riskAnalysis,
    isLoading: loading,
    error,
    setCurrentOrder,
    validateOrder,
    calculateRisk,
    submitOrder,
    resetForm,
    clearError,
  } = useOrderStore();

  const { symbols } = useTradingStore();

  // Helper function to update order fields
  const updateOrderField = (field: keyof OrderFormData, value: any) => {
    const updatedOrder = { ...currentOrder, [field]: value } as OrderFormData;
    setCurrentOrder(updatedOrder);
  };

  const [isAdvancedOpen, setIsAdvancedOpen] = useState(false);
  const [showRiskDetails, setShowRiskDetails] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const volumeSliderRef = useRef<HTMLDivElement>(null);

  // Initialize order with symbol
  useEffect(() => {
    if (!currentOrder) {
      setCurrentOrder({
        symbol,
        side: 'BUY',
        orderType: 'MARKET',
        volume: 0.01,
        price: 0,
        stopLoss: undefined,
        takeProfit: undefined,
        comment: '',
        riskPercentage: 2
      });
    } else {
      updateOrderField('symbol', symbol);
    }
  }, [symbol, currentOrder, setCurrentOrder]);

  // Real-time validation and risk calculation
  useEffect(() => {
    if (currentOrder && currentOrder.volume > 0) {
      validateOrder(currentOrder);
      calculateRisk(currentOrder);
    }
  }, [currentOrder, validateOrder, calculateRisk]);

  // Clear errors after 5 seconds
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => clearError(), 5000);
      return () => clearTimeout(timer);
    }
  }, [error, clearError]);

  // Touch handlers for volume slider
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({ x: touch.clientX, y: touch.clientY });
    setIsDragging(true);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging || !volumeSliderRef.current) return;

    const touch = e.touches[0];
    const rect = volumeSliderRef.current.getBoundingClientRect();
    const percentage = Math.max(0, Math.min(1, (touch.clientX - rect.left) / rect.width));
    const newVolume = Math.round(percentage * 10 * 100) / 100; // Max 10 lots
    
    updateOrderField('volume', Math.max(0.01, newVolume));
  };

  const handleTouchEnd = () => {
    setTouchStart(null);
    setIsDragging(false);
  };

  // Quick volume buttons
  const quickVolumeButtons = [0.01, 0.1, 0.5, 1.0, 2.0];

  const handleSubmit = async () => {
    if (!currentOrder) return;
    
    try {
      await submitOrder(currentOrder);
      onOrderSubmit?.();
    } catch (err) {
      // Error handled by store
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value);
  };

  // Mock market data - in real app, this would come from market data store
  const currentPrice = 1.0850; // Mock price
  const spread = 0.0002; // Mock spread

  return (
    <div className="space-y-4 p-4 max-w-md mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-white">{symbol}</h2>
          <p className="text-sm text-gray-400">
            {currentPrice.toFixed(5)} • Spread: {(spread * 10000).toFixed(1)} pips
          </p>
        </div>
        <Badge 
          variant={validation.isValid ? "default" : "destructive"}
          className={cn(
            "text-xs",
            validation.isValid ? "bg-green-500/20 text-green-400" : "bg-red-500/20 text-red-400"
          )}
        >
          {validation.isValid ? 'Valid' : 'Invalid'}
        </Badge>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-3">
          <p className="text-red-400 text-sm">{error}</p>
        </div>
      )}

      {/* Order Type Selection */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="grid grid-cols-2 gap-2 mb-4">
            <Button
              variant={currentOrder?.orderType === 'MARKET' ? "default" : "outline"}
              onClick={() => updateOrderField('orderType', 'MARKET')}
              className={cn(
                "h-12 text-sm font-medium",
                currentOrder?.orderType === 'MARKET'
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              )}
            >
              Market
            </Button>
            <Button
              variant={currentOrder?.orderType === 'LIMIT' ? "default" : "outline"}
              onClick={() => updateOrderField('orderType', 'LIMIT')}
              className={cn(
                "h-12 text-sm font-medium",
                currentOrder?.orderType === 'LIMIT'
                  ? "bg-blue-500 hover:bg-blue-600 text-white"
                  : "border-gray-600 text-gray-300 hover:bg-gray-700"
              )}
            >
              Limit
            </Button>
          </div>

          {/* Buy/Sell Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <Button
              size="lg"
              onClick={() => updateOrderField('side', 'BUY')}
              className={cn(
                "h-16 flex flex-col items-center justify-center space-y-1",
                currentOrder?.side === 'BUY'
                  ? "bg-green-500 hover:bg-green-600 text-white font-bold"
                  : "bg-green-500/20 hover:bg-green-500 text-green-400 hover:text-white font-bold border border-green-500/30",
                "active:scale-95 transition-transform"
              )}
            >
              <TrendingUp className="h-5 w-5" />
              <span>BUY</span>
              <span className="text-xs opacity-90">{(currentPrice + spread).toFixed(5)}</span>
            </Button>
            <Button
              size="lg"
              onClick={() => updateOrderField('side', 'SELL')}
              className={cn(
                "h-16 flex flex-col items-center justify-center space-y-1",
                currentOrder?.side === 'SELL'
                  ? "bg-red-500 hover:bg-red-600 text-white font-bold"
                  : "bg-red-500/20 hover:bg-red-500 text-red-400 hover:text-white font-bold border border-red-500/30",
                "active:scale-95 transition-transform"
              )}
            >
              <TrendingDown className="h-5 w-5" />
              <span>SELL</span>
              <span className="text-xs opacity-90">{currentPrice.toFixed(5)}</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Volume Selection */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <label className="text-sm font-medium text-gray-300">Volume</label>
            <span className="text-lg font-bold text-white">{currentOrder?.volume || 0} lots</span>
          </div>

          {/* Touch Slider */}
          <div 
            ref={volumeSliderRef}
            className="relative h-12 bg-gray-700 rounded-lg mb-4 overflow-hidden"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-blue-500 to-blue-600 transition-all duration-150"
              style={{ width: `${Math.min(100, ((currentOrder?.volume || 0) / 10) * 100)}%` }}
            />
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-white text-sm font-medium z-10">
                Drag to adjust volume
              </span>
            </div>
          </div>

          {/* Quick Volume Buttons */}
          <div className="grid grid-cols-5 gap-2">
            {quickVolumeButtons.map((vol) => (
              <Button
                key={vol}
                variant="outline"
                size="sm"
                onClick={() => updateOrderField('volume', vol)}
                className={cn(
                  "h-8 text-xs border-gray-600 text-gray-300 hover:bg-gray-700",
                  currentOrder?.volume === vol && "bg-blue-500/20 border-blue-500 text-blue-400"
                )}
              >
                {vol}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Risk Analysis */}
      <Card className="bg-gray-800/50 border-gray-700">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-medium text-gray-300">Risk Analysis</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowRiskDetails(!showRiskDetails)}
              className="h-6 w-6 p-0 text-gray-400 hover:text-white"
            >
              {showRiskDetails ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </div>

          <div className="grid grid-cols-2 gap-4 mb-3">
            <div className="text-center">
              <p className="text-xs text-gray-400">Margin Required</p>
              <p className="text-sm font-semibold text-white">
                {formatCurrency(riskAnalysis.marginRequired)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-400">Risk Level</p>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs",
                  riskAnalysis.riskLevel === 'low' && "border-green-500 text-green-400",
                  riskAnalysis.riskLevel === 'medium' && "border-yellow-500 text-yellow-400",
                  riskAnalysis.riskLevel === 'high' && "border-red-500 text-red-400"
                )}
              >
                {riskAnalysis.riskLevel.toUpperCase()}
              </Badge>
            </div>
          </div>

          {showRiskDetails && (
            <div className="space-y-2 pt-3 border-t border-gray-700">
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Pip Value</span>
                <span className="text-white">{formatCurrency(riskAnalysis.pipValue)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Max Risk</span>
                <span className="text-white">{formatCurrency(riskAnalysis.maxRisk)}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-gray-400">Account Risk %</span>
                <span className={cn(
                  "font-medium",
                  riskAnalysis.accountRiskPercentage > 5 ? "text-red-400" : "text-green-400"
                )}>
                  {riskAnalysis.accountRiskPercentage.toFixed(2)}%
                </span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Drawer open={isAdvancedOpen} onOpenChange={setIsAdvancedOpen}>
        <DrawerTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
          >
            <Settings className="h-4 w-4 mr-2" />
            Advanced Settings
          </Button>
        </DrawerTrigger>
        <DrawerContent className="bg-gray-900 border-gray-700">
          <DrawerHeader>
            <DrawerTitle className="text-white">Advanced Order Settings</DrawerTitle>
            <DrawerDescription className="text-gray-400">
              Configure stop loss, take profit, and other advanced options
            </DrawerDescription>
          </DrawerHeader>
          <div className="p-4 space-y-4">
            {/* Limit Price (for limit orders) */}
            {currentOrder?.orderType === 'LIMIT' && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Limit Price
                </label>
                <Input
                  type="number"
                  step="0.00001"
                  value={currentOrder?.price || ''}
                onChange={(e) => updateOrderField('price', parseFloat(e.target.value) || 0)}
                  className="bg-gray-800 border-gray-600 text-white"
                  placeholder="Enter limit price"
                />
              </div>
            )}

            {/* Stop Loss */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Stop Loss
              </label>
              <Input
                type="number"
                step="0.00001"
                value={currentOrder?.stopLoss || ''}
                onChange={(e) => updateOrderField('stopLoss', parseFloat(e.target.value) || undefined)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Optional stop loss price"
              />
            </div>

            {/* Take Profit */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Take Profit
              </label>
              <Input
                type="number"
                step="0.00001"
                value={currentOrder?.takeProfit || ''}
                onChange={(e) => updateOrderField('takeProfit', parseFloat(e.target.value) || undefined)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Optional take profit price"
              />
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Comment
              </label>
              <Input
                value={currentOrder?.comment || ''}
                onChange={(e) => updateOrderField('comment', e.target.value)}
                className="bg-gray-800 border-gray-600 text-white"
                placeholder="Optional comment"
              />
            </div>
          </div>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline" className="border-gray-600 text-gray-300">
                Done
              </Button>
            </DrawerClose>
          </DrawerFooter>
        </DrawerContent>
      </Drawer>

      {/* Validation Errors */}
      {!validation.isValid && validation.errors.length > 0 && (
        <Card className="bg-red-500/10 border-red-500/20">
          <CardContent className="p-3">
            <div className="flex items-start space-x-2">
              <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 flex-shrink-0" />
              <div className="space-y-1">
                {validation.errors.map((error, index) => (
                  <p key={index} className="text-red-400 text-xs">{error.message}</p>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={!validation.isValid || loading}
        className={cn(
          "w-full h-14 text-lg font-bold",
          "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-95 transition-transform"
        )}
      >
        {loading ? (
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            <span>Placing Order...</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <Check className="h-5 w-5" />
            <span>Place {currentOrder?.side} Order</span>
          </div>
        )}
      </Button>

      {/* Reset Button */}
      <Button
          onClick={resetForm}
          variant="outline"
          className="w-full border-gray-600 text-gray-300 hover:bg-gray-700"
        >
          <X className="h-4 w-4 mr-2" />
          Reset Form
        </Button>
    </div>
  );
};

export default MobileOrderForm;