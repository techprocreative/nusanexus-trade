import React, { useState, useRef, useEffect } from 'react';
import { usePositionStore } from '@/store/usePositionStore';
import { cn } from '@/lib/utils';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
// Custom Alert Dialog components
const AlertDialog = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
    <div className="fixed inset-0 flex items-center justify-center p-4">
      <div className="bg-gray-900 rounded-lg shadow-lg max-w-md w-full">
        {children}
      </div>
    </div>
  </div>
);

const AlertDialogTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);

const AlertDialogContent = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
);

const AlertDialogHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const AlertDialogTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className || 'text-white'}`}>{children}</h2>
);

const AlertDialogDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm mt-2 ${className || 'text-gray-400'}`}>{children}</p>
);

const AlertDialogFooter = ({ children }: { children: React.ReactNode }) => (
  <div className="flex justify-end space-x-2 mt-6">{children}</div>
);

const AlertDialogAction = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button className={`px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 ${className || ''}`} onClick={onClick}>
    {children}
  </button>
);

const AlertDialogCancel = ({ children, onClick, className }: { children: React.ReactNode; onClick?: () => void; className?: string }) => (
  <button className={`px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 ${className || ''}`} onClick={onClick}>
    {children}
  </button>
);

// Custom Sheet components
const Sheet = ({ children, open, onOpenChange }: { children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
  <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
    <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange?.(false)} />
    <div className="fixed right-0 top-0 h-full w-80 bg-gray-900 shadow-lg">
      {children}
    </div>
  </div>
);

const SheetTrigger = ({ children, asChild }: { children: React.ReactNode; asChild?: boolean }) => (
  <div>{children}</div>
);

const SheetContent = ({ children, side, className }: { children: React.ReactNode; side?: string; className?: string }) => (
  <div className={`p-6 ${className || ''}`}>{children}</div>
);

const SheetHeader = ({ children }: { children: React.ReactNode }) => (
  <div className="mb-4">{children}</div>
);

const SheetTitle = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <h2 className={`text-lg font-semibold ${className || 'text-white'}`}>{children}</h2>
);

const SheetDescription = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm ${className || 'text-gray-400'}`}>{children}</p>
);
import {
  TrendingUp,
  TrendingDown,
  X,
  Edit3,
  DollarSign,
  Clock,
  Target,
  Shield,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';
import { Position } from '@/types/orderManagement';

interface MobilePositionCardProps {
  position: Position;
  onSwipeAction?: (action: 'close' | 'modify', position: Position) => void;
}

const MobilePositionCard: React.FC<MobilePositionCardProps> = ({
  position,
  onSwipeAction,
}) => {
  const { closePosition, modifyPosition } = usePositionStore();
  
  const [swipeOffset, setSwipeOffset] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [showCloseDialog, setShowCloseDialog] = useState(false);
  const [showModifySheet, setShowModifySheet] = useState(false);
  const [touchStart, setTouchStart] = useState<{ x: number; y: number; time: number } | null>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const animationRef = useRef<number>();

  // Swipe thresholds
  const SWIPE_THRESHOLD = 80;
  const MAX_SWIPE = 120;

  // Touch handlers for swipe gestures
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    setTouchStart({
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    });
    setIsDragging(true);
    
    // Cancel any ongoing animation
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart || !isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - touchStart.x;
    const deltaY = touch.clientY - touchStart.y;

    // Only allow horizontal swipes
    if (Math.abs(deltaY) > Math.abs(deltaX)) {
      return;
    }

    // Prevent vertical scrolling during horizontal swipe
    e.preventDefault();

    // Limit swipe distance
    const clampedOffset = Math.max(-MAX_SWIPE, Math.min(MAX_SWIPE, deltaX));
    setSwipeOffset(clampedOffset);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !isDragging) return;

    const swipeDistance = Math.abs(swipeOffset);
    const swipeDirection = swipeOffset > 0 ? 'right' : 'left';

    setIsDragging(false);
    setTouchStart(null);

    // Trigger action if swipe threshold is met
    if (swipeDistance >= SWIPE_THRESHOLD) {
      if (swipeDirection === 'right') {
        // Swipe right to modify
        onSwipeAction?.('modify', position);
        setShowModifySheet(true);
      } else {
        // Swipe left to close
        onSwipeAction?.('close', position);
        setShowCloseDialog(true);
      }
    }

    // Animate back to center
    animateToCenter();
  };

  const animateToCenter = () => {
    const animate = () => {
      setSwipeOffset(prev => {
        const newOffset = prev * 0.8;
        if (Math.abs(newOffset) < 1) {
          return 0;
        }
        animationRef.current = requestAnimationFrame(animate);
        return newOffset;
      });
    };
    animationRef.current = requestAnimationFrame(animate);
  };

  // Cleanup animation on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  const handleClosePosition = async () => {
    try {
      await closePosition(position.id);
      setShowCloseDialog(false);
    } catch (error) {
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

  const formatTime = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getPnLColor = (pnl: number) => {
    if (pnl > 0) return 'text-green-400';
    if (pnl < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const getPnLBgColor = (pnl: number) => {
    if (pnl > 0) return 'bg-green-500/10 border-green-500/20';
    if (pnl < 0) return 'bg-red-500/10 border-red-500/20';
    return 'bg-gray-500/10 border-gray-500/20';
  };

  // Calculate swipe action visibility
  const showModifyAction = swipeOffset > 20;
  const showCloseAction = swipeOffset < -20;

  return (
    <>
      <div className="relative overflow-hidden rounded-lg">
        {/* Swipe Action Backgrounds */}
        <div className="absolute inset-0 flex">
          {/* Modify Action (Right Swipe) */}
          <div 
            className={cn(
              "flex items-center justify-start pl-4 bg-blue-500/20 transition-opacity duration-200",
              showModifyAction ? "opacity-100" : "opacity-0"
            )}
            style={{ width: Math.max(0, swipeOffset) }}
          >
            <div className="flex items-center space-x-2 text-blue-400">
              <Edit3 className="h-5 w-5" />
              <span className="text-sm font-medium">Modify</span>
            </div>
          </div>
          
          {/* Close Action (Left Swipe) */}
          <div className="flex-1" />
          <div 
            className={cn(
              "flex items-center justify-end pr-4 bg-red-500/20 transition-opacity duration-200",
              showCloseAction ? "opacity-100" : "opacity-0"
            )}
            style={{ width: Math.max(0, -swipeOffset) }}
          >
            <div className="flex items-center space-x-2 text-red-400">
              <span className="text-sm font-medium">Close</span>
              <X className="h-5 w-5" />
            </div>
          </div>
        </div>

        {/* Position Card */}
        <Card 
          ref={cardRef}
          className={cn(
            "relative bg-gray-800/50 border-gray-700 transition-transform duration-100",
            isDragging ? "shadow-lg" : ""
          )}
          style={{
            transform: `translateX(${swipeOffset}px)`,
            zIndex: 10,
          }}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <CardContent className="p-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-3">
                <div className={cn(
                  "p-2 rounded-full",
                  position.side === 'BUY' ? "bg-green-500/20" : "bg-red-500/20"
                )}>
                  {position.side === 'BUY' ? (
                    <TrendingUp className="h-4 w-4 text-green-400" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-red-400" />
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-white">{position.symbol}</h3>
                  <p className="text-xs text-gray-400">
                    {position.volume} lots • {formatTime(position.openTime.getTime())}
                  </p>
                </div>
              </div>
              <Badge 
                variant="outline"
                className={cn(
                  "text-xs font-medium",
                  position.side === 'BUY' 
                    ? "border-green-500 text-green-400" 
                    : "border-red-500 text-red-400"
                )}
              >
                {position.side}
              </Badge>
            </div>

            {/* P&L and Prices */}
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div className={cn(
                "p-3 rounded-lg border",
                getPnLBgColor(position.pnl)
              )}>
                <div className="flex items-center space-x-2">
                  <DollarSign className={cn("h-4 w-4", getPnLColor(position.pnl))} />
                  <div>
                    <p className="text-xs text-gray-400">P&L</p>
                    <p className={cn("text-sm font-bold", getPnLColor(position.pnl))}>
                      {formatCurrency(position.pnl)}
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-gray-700/50 border border-gray-600">
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-blue-400" />
                  <div>
                    <p className="text-xs text-gray-400">Current</p>
                    <p className="text-sm font-bold text-white">
                      {position.currentPrice.toFixed(5)}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Price Details */}
            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="text-center">
                <p className="text-gray-400">Open</p>
                <p className="text-white font-medium">{position.openPrice.toFixed(5)}</p>
              </div>
              {position.stopLoss && (
                <div className="text-center">
                  <p className="text-gray-400">SL</p>
                  <p className="text-red-400 font-medium">{position.stopLoss.toFixed(5)}</p>
                </div>
              )}
              {position.takeProfit && (
                <div className="text-center">
                  <p className="text-gray-400">TP</p>
                  <p className="text-green-400 font-medium">{position.takeProfit.toFixed(5)}</p>
                </div>
              )}
            </div>

            {/* Swipe Hint */}
            {!isDragging && swipeOffset === 0 && (
              <div className="flex items-center justify-center mt-3 pt-3 border-t border-gray-700">
                <div className="flex items-center space-x-2 text-gray-500 text-xs">
                  <span>Swipe</span>
                  <ChevronRight className="h-3 w-3" />
                  <span>Modify</span>
                  <span>•</span>
                  <span>Close</span>
                  <ChevronRight className="h-3 w-3 rotate-180" />
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Close Position Dialog */}
      <AlertDialog open={showCloseDialog} onOpenChange={setShowCloseDialog}>
        <AlertDialogContent className="bg-gray-900 border-gray-700">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Close Position
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-400">
              Are you sure you want to close this {position.symbol} position?
              <br />
              <span className="font-medium">
                Current P&L: {formatCurrency(position.pnl)}
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-gray-600 text-gray-300 hover:bg-gray-700">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleClosePosition}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              Close Position
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modify Position Sheet */}
      <Sheet open={showModifySheet} onOpenChange={setShowModifySheet}>
        <SheetContent side="bottom" className="bg-gray-900 border-gray-700">
          <SheetHeader>
            <SheetTitle className="text-white">Modify Position</SheetTitle>
            <SheetDescription className="text-gray-400">
              Update stop loss and take profit for {position.symbol}
            </SheetDescription>
          </SheetHeader>
          <div className="py-6 space-y-4">
            {/* Current Position Info */}
            <div className="bg-gray-800/50 rounded-lg p-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-400">Symbol</p>
                  <p className="text-white font-medium">{position.symbol}</p>
                </div>
                <div>
                  <p className="text-gray-400">Volume</p>
                  <p className="text-white font-medium">{position.volume} lots</p>
                </div>
                <div>
                  <p className="text-gray-400">Open Price</p>
                  <p className="text-white font-medium">{position.openPrice.toFixed(5)}</p>
                </div>
                <div>
                  <p className="text-gray-400">Current P&L</p>
                  <p className={getPnLColor(position.pnl)}>
                    {formatCurrency(position.pnl)}
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="h-12 border-red-600 text-red-400 hover:bg-red-500/10"
                onClick={() => {
                  // Remove stop loss
                  modifyPosition(position.id, { stopLoss: undefined });
                  setShowModifySheet(false);
                }}
              >
                Remove SL
              </Button>
              <Button
                variant="outline"
                className="h-12 border-green-600 text-green-400 hover:bg-green-500/10"
                onClick={() => {
                  // Remove take profit
                  modifyPosition(position.id, { takeProfit: undefined });
                  setShowModifySheet(false);
                }}
              >
                Remove TP
              </Button>
            </div>

            {/* Close Button */}
            <Button
              onClick={() => setShowModifySheet(false)}
              className="w-full bg-gray-700 hover:bg-gray-600 text-white"
            >
              Done
            </Button>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
};

export default MobilePositionCard;