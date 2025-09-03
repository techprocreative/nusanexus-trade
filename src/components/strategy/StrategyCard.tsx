import React from 'react';
import { Heart, Play, Pause, Copy, MoreHorizontal, TrendingUp, TrendingDown, Star, Users, FileText } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { useStrategyBuilderStore } from '@/stores/strategyBuilderStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { StrategyCardProps } from '@/types/strategy';

export const StrategyCard: React.FC<StrategyCardProps> = ({
  strategy,
  isSelected,
  onSelect,
  showSelection = false
}) => {
  const { toggleFavorite, cloneStrategy, updateStrategy } = useStrategyStore();
  const navigate = useNavigate();

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.stopPropagation();
    await toggleFavorite(strategy.id);
    toast.success(strategy.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleToggleStatus = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const newStatus = strategy.status === 'active' ? 'inactive' : 'active';
    const result = await updateStrategy(strategy.id, { status: newStatus });
    if (result) {
      toast.success(`Strategy ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update strategy status');
    }
  };

  const handleClone = async (e: React.MouseEvent) => {
    e.stopPropagation();
    const result = await cloneStrategy(strategy.id);
    if (result) {
      toast.success('Strategy cloned successfully');
    } else {
      toast.error('Failed to clone strategy');
    }
  };

  const handleUseAsTemplate = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Import the store function
    const { loadStrategyAsTemplate } = useStrategyBuilderStore.getState();
    
    // Load strategy as template in the builder store
    loadStrategyAsTemplate(strategy.id);
    
    // Navigate to strategy builder
    navigate('/strategy-builder');
    toast.success('Loading strategy as template...');
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  const formatPercentage = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  return (
    <Card 
      className="group hover:shadow-xl transition-all duration-300 bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm border-slate-200/50 dark:border-slate-700/50 hover:border-blue-300 dark:hover:border-blue-600"
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-2">
            {showSelection && (
              <Checkbox
                checked={isSelected}
                onCheckedChange={(checked) => onSelect?.(strategy.id, checked as boolean)}
                onClick={(e) => e.stopPropagation()}
              />
            )}
            <Badge className={getStatusColor(strategy.status)} variant="secondary">
              {strategy.status}
            </Badge>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleToggleFavorite}
              className="opacity-0 group-hover:opacity-100 transition-opacity"
            >
              <Heart className={`h-4 w-4 ${strategy.isFavorite ? 'fill-current text-red-500' : 'text-slate-400'}`} />
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={handleToggleStatus}>
                  {strategy.status === 'active' ? (
                    <><Pause className="h-4 w-4 mr-2" />Deactivate</>
                  ) : (
                    <><Play className="h-4 w-4 mr-2" />Activate</>
                  )}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleClone}>
                  <Copy className="h-4 w-4 mr-2" />
                  Clone Strategy
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleUseAsTemplate}>
                  <FileText className="h-4 w-4 mr-2" />
                  Use as Template
                </DropdownMenuItem>
                <DropdownMenuSeparator />
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="mt-3">
          <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-2 line-clamp-1">
            {strategy.name}
          </h3>
          <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-3">
            {strategy.description}
          </p>

          {/* Creator Info */}
          {strategy.creator && (
            <div className="flex items-center gap-2 mb-3">
              <Avatar className="h-6 w-6">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${strategy.creator.name}`} />
                <AvatarFallback className="text-xs">
                  {strategy.creator.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm text-slate-600 dark:text-slate-400 truncate">
                {strategy.creator.name}
              </span>
              {strategy.creator.verified && (
                <Star className="h-3 w-3 text-yellow-500 fill-current" />
              )}
            </div>
          )}

          {/* Tags */}
          {strategy.tags && strategy.tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-4">
              {strategy.tags.slice(0, 2).map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
              {strategy.tags.length > 2 && (
                <Badge variant="outline" className="text-xs">
                  +{strategy.tags.length - 2}
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Performance Metrics */}
        <div className="space-y-4">
          {/* Win Rate with Progress Bar */}
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm text-slate-600 dark:text-slate-400">Win Rate</span>
              <span className="text-sm font-semibold text-slate-900 dark:text-slate-100">
                {strategy.performanceMetrics?.winRate ? formatPercentage(strategy.performanceMetrics.winRate) : 'N/A'}
              </span>
            </div>
            <Progress 
              value={strategy.performanceMetrics?.winRate || 0} 
              className="h-2"
            />
          </div>

          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Total P&L</p>
              <p className={`font-semibold text-sm ${
                (strategy.performanceMetrics?.totalPnL || 0) >= 0 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-red-600 dark:text-red-400'
              }`}>
                {strategy.performanceMetrics?.totalPnL ? formatCurrency(strategy.performanceMetrics.totalPnL) : 'N/A'}
              </p>
              <div className="flex items-center justify-center mt-1">
                {(strategy.performanceMetrics?.totalPnL || 0) >= 0 ? (
                  <TrendingUp className="h-3 w-3 text-green-500" />
                ) : (
                  <TrendingDown className="h-3 w-3 text-red-500" />
                )}
              </div>
            </div>

            <div className="text-center p-3 bg-slate-50 dark:bg-slate-700/50 rounded-lg">
              <p className="text-xs text-slate-500 dark:text-slate-400 mb-1">Sharpe Ratio</p>
              <p className="font-semibold text-sm text-slate-900 dark:text-slate-100">
                {strategy.performanceMetrics?.sharpeRatio ? strategy.performanceMetrics.sharpeRatio.toFixed(2) : 'N/A'}
              </p>
              <div className="flex items-center justify-center mt-1">
                <TrendingUp className="h-3 w-3 text-blue-500" />
              </div>
            </div>
          </div>

          {/* Max Drawdown */}
          <div className="text-center p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
            <p className="text-xs text-red-600 dark:text-red-400 mb-1">Max Drawdown</p>
            <p className="font-semibold text-sm text-red-700 dark:text-red-300">
              {strategy.performanceMetrics?.maxDrawdown ? formatPercentage(strategy.performanceMetrics.maxDrawdown) : 'N/A'}
            </p>
          </div>

          {/* Additional Stats */}
          {strategy.performanceMetrics && (
            <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 pt-2 border-t border-slate-200 dark:border-slate-700">
              <span>Trades: {strategy.performanceMetrics.totalTrades || 0}</span>
              <span>Avg: {strategy.performanceMetrics.averageReturn ? formatPercentage(strategy.performanceMetrics.averageReturn) : 'N/A'}</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 mt-4">
          <Button 
            variant={strategy.status === 'active' ? 'default' : 'outline'}
            size="sm"
            onClick={handleToggleStatus}
            className={`flex-1 ${strategy.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}`}
          >
            {strategy.status === 'active' ? (
              <><Pause className="h-4 w-4 mr-2" />Deactivate</>
            ) : (
              <><Play className="h-4 w-4 mr-2" />Activate</>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};