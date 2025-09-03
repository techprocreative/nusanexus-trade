import React, { useEffect, useState } from 'react';
import { X, Play, Pause, Copy, Heart, Share2, Download, Settings, TrendingUp, TrendingDown, BarChart3, Calendar, User, Tag, AlertTriangle, FileText } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { useStrategyBuilderStore } from '@/stores/strategyBuilderStore';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LineChart, Line, AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';
import type { Strategy, BacktestResult, StrategyDetailsModalProps } from '@/types/strategy';

export const StrategyDetailsModal: React.FC<StrategyDetailsModalProps> = () => {
  const {
    modal,
    strategies,
    closeStrategyModal,
    setModalTab,
    fetchStrategy,
    fetchBacktestResults,
    toggleFavorite,
    cloneStrategy,
    updateStrategy
  } = useStrategyStore();
  const navigate = useNavigate();

  const [strategy, setStrategy] = useState<Strategy | null>(null);
  const [backtestResults, setBacktestResults] = useState<BacktestResult[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (modal.isOpen && modal.strategyId) {
      loadStrategyData();
    }
  }, [modal.isOpen, modal.strategyId]);

  const loadStrategyData = async () => {
    if (!modal.strategyId) return;
    
    setLoading(true);
    try {
      // Try to find strategy in current list first
      let strategyData = strategies.find(s => s.id === modal.strategyId);
      
      // If not found, fetch from API
      if (!strategyData) {
        strategyData = await fetchStrategy(modal.strategyId);
      }
      
      if (strategyData) {
        setStrategy(strategyData);
        // Fetch backtest results
        const results = await fetchBacktestResults(modal.strategyId);
        setBacktestResults(results);
      }
    } catch (error) {
      toast.error('Failed to load strategy details');
    } finally {
      setLoading(false);
    }
  };

  const handleToggleFavorite = async () => {
    if (!strategy) return;
    await toggleFavorite(strategy.id);
    setStrategy(prev => prev ? { ...prev, isFavorite: !prev.isFavorite } : null);
    toast.success(strategy.isFavorite ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleToggleStatus = async () => {
    if (!strategy) return;
    const newStatus = strategy.status === 'active' ? 'inactive' : 'active';
    const result = await updateStrategy(strategy.id, { status: newStatus });
    if (result) {
      setStrategy(prev => prev ? { ...prev, status: newStatus } : null);
      toast.success(`Strategy ${newStatus === 'active' ? 'activated' : 'deactivated'}`);
    } else {
      toast.error('Failed to update strategy status');
    }
  };

  const handleClone = async () => {
    if (!strategy) return;
    const result = await cloneStrategy(strategy.id);
    if (result) {
      toast.success('Strategy cloned successfully');
    } else {
      toast.error('Failed to clone strategy');
    }
  };

  const handleUseAsTemplate = () => {
    if (!strategy) return;
    // Import the store function
    const { loadStrategyAsTemplate } = useStrategyBuilderStore.getState();
    
    // Load strategy as template in the builder store
    loadStrategyAsTemplate(strategy.id);
    
    // Close modal and navigate to strategy builder
    closeStrategyModal();
    navigate('/strategy-builder');
    toast.success('Loading strategy as template...');
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      case 'inactive': return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
      case 'draft': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'archived': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Mock chart data
  const equityCurveData = Array.from({ length: 30 }, (_, i) => ({
    date: `Day ${i + 1}`,
    equity: 10000 + (Math.random() - 0.3) * 1000 * (i + 1),
    drawdown: Math.random() * -500
  }));

  const monthlyReturnsData = [
    { month: 'Jan', return: 2.5 },
    { month: 'Feb', return: -1.2 },
    { month: 'Mar', return: 4.1 },
    { month: 'Apr', return: 1.8 },
    { month: 'May', return: -0.5 },
    { month: 'Jun', return: 3.2 }
  ];

  const tradeDistributionData = [
    { name: 'Winning Trades', value: 65, color: '#10b981' },
    { name: 'Losing Trades', value: 35, color: '#ef4444' }
  ];

  if (!modal.isOpen) return null;

  return (
    <Dialog open={modal.isOpen} onOpenChange={closeStrategyModal}>
      <DialogContent className="max-w-6xl max-h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <DialogTitle className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                  {strategy?.name || 'Loading...'}
                </DialogTitle>
                {strategy && (
                  <Badge className={getStatusColor(strategy.status)} variant="secondary">
                    {strategy.status}
                  </Badge>
                )}
              </div>
              {strategy?.description && (
                <p className="text-slate-600 dark:text-slate-400">
                  {strategy.description}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2">
              {strategy && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleToggleFavorite}
                  >
                    <Heart className={`h-4 w-4 mr-2 ${strategy.isFavorite ? 'fill-current text-red-500' : ''}`} />
                    {strategy.isFavorite ? 'Favorited' : 'Favorite'}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClone}
                  >
                    <Copy className="h-4 w-4 mr-2" />
                    Clone
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleUseAsTemplate}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Use as Template
                  </Button>
                  <Button
                    variant={strategy.status === 'active' ? 'default' : 'outline'}
                    size="sm"
                    onClick={handleToggleStatus}
                    className={strategy.status === 'active' ? 'bg-green-600 hover:bg-green-700' : ''}
                  >
                    {strategy.status === 'active' ? (
                      <><Pause className="h-4 w-4 mr-2" />Deactivate</>
                    ) : (
                      <><Play className="h-4 w-4 mr-2" />Activate</>
                    )}
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="px-6">
          <Tabs value={modal.activeTab} onValueChange={setModalTab} className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="performance">Performance</TabsTrigger>
              <TabsTrigger value="backtest">Backtest</TabsTrigger>
              <TabsTrigger value="configuration">Configuration</TabsTrigger>
            </TabsList>

            <ScrollArea className="h-[60vh] mt-4">
              <TabsContent value="overview" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : strategy ? (
                  <>
                    {/* Creator Info */}
                    {strategy.creator && (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <User className="h-5 w-5" />
                            Strategy Creator
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <div className="flex items-center gap-4">
                            <Avatar className="h-12 w-12">
                              <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${strategy.creator.name}`} />
                              <AvatarFallback>
                                {strategy.creator.name.charAt(0).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                {strategy.creator.name}
                              </h4>
                              <p className="text-sm text-slate-600 dark:text-slate-400">
                                {strategy.creator.email}
                              </p>
                              <div className="flex items-center gap-4 mt-2 text-sm text-slate-500 dark:text-slate-400">
                                <span>Rating: {strategy.creator.rating}/5</span>
                                <span>Strategies: {strategy.creator.totalStrategies}</span>
                                {strategy.creator.verified && (
                                  <Badge variant="secondary" className="text-xs">
                                    Verified
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    )}

                    {/* Key Metrics */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {strategy.performanceMetrics?.winRate ? formatPercentage(strategy.performanceMetrics.winRate) : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Win Rate</div>
                          <Progress value={strategy.performanceMetrics?.winRate || 0} className="mt-2 h-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className={`text-2xl font-bold mb-1 ${
                            (strategy.performanceMetrics?.totalPnL || 0) >= 0 
                              ? 'text-green-600 dark:text-green-400' 
                              : 'text-red-600 dark:text-red-400'
                          }`}>
                            {strategy.performanceMetrics?.totalPnL ? formatCurrency(strategy.performanceMetrics.totalPnL) : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Total P&L</div>
                          <div className="flex items-center justify-center mt-2">
                            {(strategy.performanceMetrics?.totalPnL || 0) >= 0 ? (
                              <TrendingUp className="h-4 w-4 text-green-500" />
                            ) : (
                              <TrendingDown className="h-4 w-4 text-red-500" />
                            )}
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            {strategy.performanceMetrics?.sharpeRatio ? strategy.performanceMetrics.sharpeRatio.toFixed(2) : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Sharpe Ratio</div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-red-600 dark:text-red-400 mb-1">
                            {strategy.performanceMetrics?.maxDrawdown ? formatPercentage(strategy.performanceMetrics.maxDrawdown) : 'N/A'}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Max Drawdown</div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Strategy Details */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <Tag className="h-5 w-5" />
                            Strategy Information
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Created</label>
                            <p className="text-slate-900 dark:text-slate-100">
                              {new Date(strategy.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Last Updated</label>
                            <p className="text-slate-900 dark:text-slate-100">
                              {new Date(strategy.updatedAt).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400">Visibility</label>
                            <p className="text-slate-900 dark:text-slate-100">
                              {strategy.isPublic ? 'Public' : 'Private'}
                            </p>
                          </div>
                          {strategy.tags && strategy.tags.length > 0 && (
                            <div>
                              <label className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-2 block">Tags</label>
                              <div className="flex flex-wrap gap-2">
                                {strategy.tags.map((tag, index) => (
                                  <Badge key={index} variant="outline">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </CardContent>
                      </Card>

                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <BarChart3 className="h-5 w-5" />
                            Additional Metrics
                          </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Total Trades</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {strategy.performanceMetrics?.totalTrades || 0}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Average Return</span>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {strategy.performanceMetrics?.averageReturn ? formatPercentage(strategy.performanceMetrics.averageReturn) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Best Trade</span>
                            <span className="font-semibold text-green-600 dark:text-green-400">
                              {strategy.performanceMetrics?.bestTrade ? formatPercentage(strategy.performanceMetrics.bestTrade.pnlPercentage) : 'N/A'}
                            </span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-600 dark:text-slate-400">Worst Trade</span>
                            <span className="font-semibold text-red-600 dark:text-red-400">
                              {strategy.performanceMetrics?.worstTrade ? formatPercentage(strategy.performanceMetrics.worstTrade.pnlPercentage) : 'N/A'}
                            </span>
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Rules Explanation */}
                    {strategy.rulesExplanation && (
                      <Card>
                        <CardHeader>
                          <CardTitle>Strategy Rules</CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
                            {strategy.rulesExplanation}
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                    <p className="text-slate-600 dark:text-slate-400">Strategy not found</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="performance" className="space-y-6">
                {/* Equity Curve */}
                <Card>
                  <CardHeader>
                    <CardTitle>Equity Curve</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={equityCurveData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="date" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="equity" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Monthly Returns */}
                <Card>
                  <CardHeader>
                    <CardTitle>Monthly Returns</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyReturnsData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Bar dataKey="return">
                            {monthlyReturnsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.return >= 0 ? '#10b981' : '#ef4444'} />
                            ))}
                          </Bar>
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Trade Distribution */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Win/Loss Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="h-48">
                        <ResponsiveContainer width="100%" height="100%">
                          <PieChart>
                            <Pie
                              data={tradeDistributionData}
                              cx="50%"
                              cy="50%"
                              innerRadius={40}
                              outerRadius={80}
                              dataKey="value"
                            >
                              {tradeDistributionData.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <Tooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Risk Metrics</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Volatility</span>
                        <span className="font-semibold">12.5%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Beta</span>
                        <span className="font-semibold">0.85</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Alpha</span>
                        <span className="font-semibold">2.3%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Sortino Ratio</span>
                        <span className="font-semibold">1.45</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="backtest" className="space-y-6">
                {backtestResults.length > 0 ? (
                  backtestResults.map((result) => (
                    <Card key={result.id}>
                      <CardHeader>
                        <CardTitle className="flex items-center justify-between">
                          <span>Backtest Results</span>
                          <Badge variant="outline">
                            {new Date(result.startDate).toLocaleDateString()} - {new Date(result.endDate).toLocaleDateString()}
                          </Badge>
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                              {formatPercentage(result.totalReturn)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Total Return</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                              {formatPercentage(result.maxDrawdown)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Max Drawdown</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                              {result.sharpeRatio.toFixed(2)}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Sharpe Ratio</div>
                          </div>
                          <div className="text-center">
                            <div className="text-2xl font-bold text-slate-900 dark:text-slate-100">
                              {new Date(result.createdAt).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-slate-600 dark:text-slate-400">Run Date</div>
                          </div>
                        </div>
                        
                        {/* Backtest chart would go here */}
                        <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                          <p className="text-slate-500 dark:text-slate-400">Backtest visualization coming soon</p>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="text-center py-12">
                      <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-slate-900 dark:text-slate-100 mb-2">
                        No Backtest Results
                      </h3>
                      <p className="text-slate-600 dark:text-slate-400 mb-6">
                        Run a backtest to see historical performance data
                      </p>
                      <Button>
                        <Play className="h-4 w-4 mr-2" />
                        Run Backtest
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="configuration" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Strategy Parameters
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {strategy?.parameters ? (
                      <div className="space-y-4">
                        {Object.entries(strategy.parameters).map(([key, value]) => (
                          <div key={key} className="flex justify-between items-center">
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 capitalize">
                              {key.replace(/([A-Z])/g, ' $1').trim()}
                            </label>
                            <span className="font-semibold text-slate-900 dark:text-slate-100">
                              {typeof value === 'object' ? JSON.stringify(value) : String(value)}
                            </span>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-slate-600 dark:text-slate-400">No parameters configured</p>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Risk Management</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Max Position Size</span>
                        <span className="font-semibold">10%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Stop Loss</span>
                        <span className="font-semibold">2%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Take Profit</span>
                        <span className="font-semibold">6%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-600 dark:text-slate-400">Max Daily Loss</span>
                        <span className="font-semibold">5%</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
};