import React, { useEffect, useState } from 'react';
import { Brain, TrendingUp, TrendingDown, Lightbulb, Target, AlertTriangle, Zap, BarChart3, Users, Clock, Star, ArrowRight, RefreshCw, X } from 'lucide-react';
import { useStrategyStore } from '@/stores/strategyStore';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { toast } from 'sonner';
import type { AIInsightsDashboardProps, AISuggestion, Optimization } from '@/types/strategy';

export const AIInsightsDashboard: React.FC<AIInsightsDashboardProps> = () => {
  const {
    aiInsights,
    strategies,
    closeAIInsightsDashboard,
    fetchAIRecommendations,
    applyOptimization
  } = useStrategyStore();

  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedSuggestion, setSelectedSuggestion] = useState<AISuggestion | null>(null);

  useEffect(() => {
    if (aiInsights.isOpen && !aiInsights.recommendations.length) {
      loadRecommendations();
    }
  }, [aiInsights.isOpen]);

  const loadRecommendations = async () => {
    setLoading(true);
    try {
      await fetchAIRecommendations({
        strategyIds: strategies.slice(0, 10).map(s => s.id), // Limit to first 10 for demo
        analysisType: 'comprehensive',
        includeOptimizations: true,
        includeRiskAnalysis: true
      });
    } catch (error) {
      toast.error('Failed to load AI recommendations');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyOptimization = async (optimization: Optimization) => {
    try {
      const result = await applyOptimization(optimization.strategyId, optimization);
      if (result) {
        toast.success('Optimization applied successfully');
      } else {
        toast.error('Failed to apply optimization');
      }
    } catch (error) {
      toast.error('An error occurred while applying optimization');
    }
  };

  const getSuggestionIcon = (type: string) => {
    switch (type) {
      case 'performance': return <TrendingUp className="h-4 w-4" />;
      case 'risk': return <AlertTriangle className="h-4 w-4" />;
      case 'optimization': return <Zap className="h-4 w-4" />;
      case 'diversification': return <BarChart3 className="h-4 w-4" />;
      case 'market_timing': return <Clock className="h-4 w-4" />;
      default: return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getSuggestionColor = (type: string) => {
    switch (type) {
      case 'performance': return 'text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/20';
      case 'risk': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'optimization': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      case 'diversification': return 'text-purple-600 dark:text-purple-400 bg-purple-100 dark:bg-purple-900/20';
      case 'market_timing': return 'text-orange-600 dark:text-orange-400 bg-orange-100 dark:bg-orange-900/20';
      default: return 'text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-900/20';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
    }
  };

  // Mock data for charts
  const portfolioHealthData = [
    { metric: 'Risk Management', current: 85, optimal: 95 },
    { metric: 'Diversification', current: 70, optimal: 90 },
    { metric: 'Performance', current: 78, optimal: 88 },
    { metric: 'Market Timing', current: 65, optimal: 80 },
    { metric: 'Position Sizing', current: 82, optimal: 92 },
    { metric: 'Entry/Exit Rules', current: 75, optimal: 85 }
  ];

  const optimizationImpactData = [
    { month: 'Jan', current: 2.5, optimized: 3.8 },
    { month: 'Feb', current: -1.2, optimized: 0.5 },
    { month: 'Mar', current: 4.1, optimized: 5.2 },
    { month: 'Apr', current: 1.8, optimized: 3.1 },
    { month: 'May', current: -0.5, optimized: 1.2 },
    { month: 'Jun', current: 3.2, optimized: 4.5 }
  ];

  if (!aiInsights.isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <Card className="w-full max-w-7xl max-h-[95vh] m-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              AI Strategy Insights
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={loadRecommendations}
                disabled={loading}
              >
                {loading ? (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mr-2" />
                ) : (
                  <RefreshCw className="h-4 w-4 mr-2" />
                )}
                Refresh
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={closeAIInsightsDashboard}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="overview">Overview</TabsTrigger>
                <TabsTrigger value="recommendations">Recommendations</TabsTrigger>
                <TabsTrigger value="optimizations">Optimizations</TabsTrigger>
                <TabsTrigger value="analytics">Analytics</TabsTrigger>
              </TabsList>
            </div>

            <ScrollArea className="h-[70vh] px-6 mt-4">
              <TabsContent value="overview" className="space-y-6">
                {loading ? (
                  <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                  </div>
                ) : (
                  <>
                    {/* Key Insights Summary */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                            {aiInsights.recommendations.filter(r => r.priority === 'high').length}
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">High Priority Actions</div>
                          <Progress value={75} className="mt-2 h-2" />
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                            +12.5%
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">Potential Improvement</div>
                          <div className="flex items-center justify-center mt-2">
                            <TrendingUp className="h-4 w-4 text-green-500" />
                          </div>
                        </CardContent>
                      </Card>
                      
                      <Card>
                        <CardContent className="p-4 text-center">
                          <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                            8.2
                          </div>
                          <div className="text-sm text-slate-600 dark:text-slate-400">AI Confidence Score</div>
                          <div className="flex justify-center mt-2">
                            {[...Array(5)].map((_, i) => (
                              <Star key={i} className={`h-3 w-3 ${i < 4 ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} />
                            ))}
                          </div>
                        </CardContent>
                      </Card>
                    </div>

                    {/* Portfolio Health Radar */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Portfolio Health Analysis</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="h-80">
                          <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={portfolioHealthData}>
                              <PolarGrid />
                              <PolarAngleAxis dataKey="metric" />
                              <PolarRadiusAxis angle={90} domain={[0, 100]} />
                              <Radar name="Current" dataKey="current" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} />
                              <Radar name="Optimal" dataKey="optimal" stroke="#10b981" fill="#10b981" fillOpacity={0.1} />
                              <Tooltip />
                            </RadarChart>
                          </ResponsiveContainer>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Top Recommendations Preview */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Top AI Recommendations</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {aiInsights.recommendations.slice(0, 3).map((suggestion) => (
                            <div key={suggestion.id} className="flex items-start gap-3 p-3 bg-slate-50 dark:bg-slate-800 rounded-lg">
                              <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                                {getSuggestionIcon(suggestion.type)}
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                    {suggestion.title}
                                  </h4>
                                  <Badge className={getPriorityColor(suggestion.priority)} variant="secondary">
                                    {suggestion.priority}
                                  </Badge>
                                </div>
                                <p className="text-sm text-slate-600 dark:text-slate-400 mb-2">
                                  {suggestion.description}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-sm font-medium text-green-600 dark:text-green-400">
                                    Expected Impact: +{suggestion.expectedImpact}%
                                  </span>
                                  <Button size="sm" variant="outline">
                                    View Details
                                    <ArrowRight className="h-3 w-3 ml-1" />
                                  </Button>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  </>
                )}
              </TabsContent>

              <TabsContent value="recommendations" className="space-y-4">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {aiInsights.recommendations.map((suggestion) => (
                    <Card key={suggestion.id} className="cursor-pointer hover:shadow-md transition-shadow"
                          onClick={() => setSelectedSuggestion(suggestion)}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <div className={`p-2 rounded-lg ${getSuggestionColor(suggestion.type)}`}>
                            {getSuggestionIcon(suggestion.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-slate-900 dark:text-slate-100">
                                {suggestion.title}
                              </h3>
                              <Badge className={getPriorityColor(suggestion.priority)} variant="secondary">
                                {suggestion.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-slate-600 dark:text-slate-400 mb-3">
                              {suggestion.description}
                            </p>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-4 text-sm">
                                <span className="text-green-600 dark:text-green-400 font-medium">
                                  +{suggestion.expectedImpact}% impact
                                </span>
                                <span className="text-slate-500 dark:text-slate-400">
                                  Confidence: {suggestion.confidence}%
                                </span>
                              </div>
                              <Button size="sm">
                                Apply
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="optimizations" className="space-y-6">
                {/* Optimization Impact Chart */}
                <Card>
                  <CardHeader>
                    <CardTitle>Projected Optimization Impact</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-64">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={optimizationImpactData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="month" />
                          <YAxis />
                          <Tooltip />
                          <Area type="monotone" dataKey="current" stackId="1" stroke="#6b7280" fill="#6b7280" fillOpacity={0.3} />
                          <Area type="monotone" dataKey="optimized" stackId="2" stroke="#10b981" fill="#10b981" fillOpacity={0.3} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Available Optimizations */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {aiInsights.optimizations.map((optimization) => (
                    <Card key={optimization.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h3 className="font-semibold text-slate-900 dark:text-slate-100 mb-1">
                              {optimization.name}
                            </h3>
                            <p className="text-sm text-slate-600 dark:text-slate-400">
                              {optimization.description}
                            </p>
                          </div>
                          <Badge className={getPriorityColor(optimization.priority)} variant="secondary">
                            {optimization.priority}
                          </Badge>
                        </div>
                        
                        <div className="space-y-2 mb-4">
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Expected Return</span>
                            <span className="font-medium text-green-600 dark:text-green-400">
                              +{optimization.expectedReturn}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Risk Reduction</span>
                            <span className="font-medium text-blue-600 dark:text-blue-400">
                              -{optimization.riskReduction}%
                            </span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-slate-600 dark:text-slate-400">Implementation Time</span>
                            <span className="font-medium text-slate-700 dark:text-slate-300">
                              {optimization.implementationTime}
                            </span>
                          </div>
                        </div>
                        
                        <Button 
                          className="w-full" 
                          onClick={() => handleApplyOptimization(optimization)}
                        >
                          <Zap className="h-4 w-4 mr-2" />
                          Apply Optimization
                        </Button>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="analytics" className="space-y-6">
                {/* Strategy Performance Comparison */}
                <Card>
                  <CardHeader>
                    <CardTitle>Strategy Performance Analytics</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-900 dark:text-slate-100 mb-1">
                          {strategies.length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Total Strategies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400 mb-1">
                          {strategies.filter(s => s.status === 'active').length}
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Active Strategies</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                          73%
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Avg Win Rate</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-purple-600 dark:text-purple-400 mb-1">
                          1.85
                        </div>
                        <div className="text-sm text-slate-600 dark:text-slate-400">Avg Sharpe Ratio</div>
                      </div>
                    </div>
                    
                    <div className="h-64 bg-slate-50 dark:bg-slate-800 rounded-lg flex items-center justify-center">
                      <p className="text-slate-500 dark:text-slate-400">Advanced analytics visualization coming soon</p>
                    </div>
                  </CardContent>
                </Card>

                {/* Market Insights */}
                <Card>
                  <CardHeader>
                    <CardTitle>Market Insights & Trends</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-start gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                            Bullish Market Trend Detected
                          </h4>
                          <p className="text-sm text-blue-700 dark:text-blue-300">
                            Current market conditions favor momentum-based strategies. Consider increasing allocation to trend-following algorithms.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                            Increased Volatility Warning
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-300">
                            Market volatility has increased by 23% this week. Review position sizing and risk management rules.
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <Target className="h-5 w-5 text-green-600 dark:text-green-400 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                            Optimization Opportunity
                          </h4>
                          <p className="text-sm text-green-700 dark:text-green-300">
                            3 strategies show potential for parameter optimization. Expected improvement: +8.5% annual return.
                          </p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
};