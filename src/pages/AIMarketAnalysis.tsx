import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  AlertTriangle,
  BarChart3,
  Brain,
  Zap,
  Eye,
  Settings,
  Star,
  Clock,
  DollarSign,
  Percent
} from 'lucide-react';

// Mock data for demonstration
const mockMarketData = {
  sentiment: {
    overall: 'bullish',
    confidence: 78,
    indicators: {
      technical: 82,
      fundamental: 74,
      news: 76
    }
  },
  keyLevels: [
    { type: 'resistance', level: 1.0850, strength: 85 },
    { type: 'support', level: 1.0720, strength: 92 },
    { type: 'resistance', level: 1.0920, strength: 67 }
  ],
  volatility: 45,
  trends: [
    { pair: 'EURUSD', direction: 'bullish', strength: 78, price: 1.0825 },
    { pair: 'GBPUSD', direction: 'bearish', strength: 65, price: 1.2654 },
    { pair: 'USDJPY', direction: 'bullish', strength: 82, price: 149.85 }
  ]
};

const mockSignals = [
  {
    id: '1',
    symbol: 'EURUSD',
    type: 'buy',
    strength: 4,
    entry: 1.0825,
    stopLoss: 1.0785,
    takeProfit: 1.0895,
    riskReward: 1.75,
    expiration: '2h 15m',
    confidence: 85
  },
  {
    id: '2',
    symbol: 'GBPUSD',
    type: 'sell',
    strength: 3,
    entry: 1.2654,
    stopLoss: 1.2694,
    takeProfit: 1.2584,
    riskReward: 1.75,
    expiration: '1h 45m',
    confidence: 72
  }
];

const mockPerformance = {
  successRate: 73.5,
  totalSignals: 156,
  profitLoss: 2847.50,
  bestPerforming: [
    { type: 'Trend Following', rate: 78.2 },
    { type: 'Mean Reversion', rate: 69.1 },
    { type: 'Breakout', rate: 71.8 }
  ]
};

const AIMarketAnalysis: React.FC = () => {
  const [selectedTimeframe, setSelectedTimeframe] = useState('4h');
  const [selectedPair, setSelectedPair] = useState('EURUSD');
  const [showSettings, setShowSettings] = useState(false);

  const SentimentGauge = ({ value, label }: { value: number; label: string }) => (
    <div className="flex flex-col items-center space-y-2">
      <div className="relative w-20 h-20">
        <svg className="w-20 h-20 transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-gray-300"
            stroke="currentColor"
            strokeWidth="3"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={value >= 70 ? 'text-green-500' : value >= 40 ? 'text-yellow-500' : 'text-red-500'}
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            fill="none"
            strokeDasharray={`${value}, 100`}
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-sm font-bold">{value}%</span>
        </div>
      </div>
      <span className="text-xs text-gray-600">{label}</span>
    </div>
  );

  const SignalCard = ({ signal }: { signal: typeof mockSignals[0] }) => (
    <Card className="border-l-4 border-l-blue-500">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Badge variant={signal.type === 'buy' ? 'default' : 'destructive'}>
              {signal.type.toUpperCase()}
            </Badge>
            <span className="font-semibold">{signal.symbol}</span>
            <div className="flex items-center">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`w-4 h-4 ${
                    i < signal.strength ? 'text-yellow-400 fill-current' : 'text-gray-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <div className="flex items-center space-x-1 text-sm text-gray-600">
            <Clock className="w-4 h-4" />
            <span>{signal.expiration}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-600">Entry:</span>
            <span className="ml-2 font-semibold">{signal.entry}</span>
          </div>
          <div>
            <span className="text-gray-600">R/R:</span>
            <span className="ml-2 font-semibold">{signal.riskReward}</span>
          </div>
          <div>
            <span className="text-gray-600">Stop Loss:</span>
            <span className="ml-2 font-semibold">{signal.stopLoss}</span>
          </div>
          <div>
            <span className="text-gray-600">Take Profit:</span>
            <span className="ml-2 font-semibold">{signal.takeProfit}</span>
          </div>
        </div>
        <div className="mt-3">
          <div className="flex items-center justify-between text-sm mb-1">
            <span>AI Confidence</span>
            <span>{signal.confidence}%</span>
          </div>
          <Progress value={signal.confidence} className="h-2" />
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center space-x-2">
              <Brain className="w-8 h-8 text-blue-600" />
              <span>AI Market Analysis</span>
            </h1>
            <p className="text-gray-600 mt-1">AI-powered forex market insights and trading signals</p>
          </div>
          <div className="flex items-center space-x-3">
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1h">1H</option>
              <option value="4h">4H</option>
              <option value="1d">1D</option>
            </select>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </Button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <Card className="border-blue-200 bg-blue-50">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center space-x-2">
                  <Settings className="w-5 h-5" />
                  <span>AI Analysis Settings</span>
                </span>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => setShowSettings(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ×
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Analysis Preferences</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Technical Analysis</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Fundamental Analysis</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">News Sentiment</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Pattern Recognition</span>
                    </label>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Signal Settings</h4>
                  <div className="space-y-2">
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Minimum Confidence</label>
                      <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm" defaultValue="70">
                        <option value="60">60%</option>
                        <option value="70">70%</option>
                        <option value="80">80%</option>
                        <option value="90">90%</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm text-gray-600 mb-1">Risk Level</label>
                      <select className="w-full px-3 py-1 border border-gray-300 rounded text-sm" defaultValue="medium">
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h4 className="font-semibold text-sm text-gray-700">Notifications</h4>
                  <div className="space-y-2">
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">New Signals</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" defaultChecked className="rounded" />
                      <span className="text-sm">Market Alerts</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Email Notifications</span>
                    </label>
                    <label className="flex items-center space-x-2">
                      <input type="checkbox" className="rounded" />
                      <span className="text-sm">Push Notifications</span>
                    </label>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-end space-x-3 mt-6 pt-4 border-t border-gray-200">
                <Button variant="outline" size="sm" onClick={() => setShowSettings(false)}>
                  Cancel
                </Button>
                <Button size="sm" onClick={() => setShowSettings(false)}>
                  Save Settings
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Market Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Activity className="w-5 h-5" />
                <span>Market Sentiment</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around">
                <SentimentGauge value={mockMarketData.sentiment.indicators.technical} label="Technical" />
                <SentimentGauge value={mockMarketData.sentiment.indicators.fundamental} label="Fundamental" />
                <SentimentGauge value={mockMarketData.sentiment.indicators.news} label="News" />
              </div>
              <div className="mt-6 text-center">
                <Badge 
                  variant={mockMarketData.sentiment.overall === 'bullish' ? 'default' : 'destructive'}
                  className="text-lg px-4 py-2"
                >
                  {mockMarketData.sentiment.overall.toUpperCase()} - {mockMarketData.sentiment.confidence}%
                </Badge>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Target className="w-5 h-5" />
                <span>Key Levels</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {mockMarketData.keyLevels.map((level, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className={`w-3 h-3 rounded-full ${
                        level.type === 'resistance' ? 'bg-red-500' : 'bg-green-500'
                      }`} />
                      <span className="text-sm font-medium">{level.level}</span>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {level.strength}%
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <BarChart3 className="w-5 h-5" />
                <span>Market Volatility</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  {mockMarketData.volatility}%
                </div>
                <Progress value={mockMarketData.volatility} className="mb-3" />
                <Badge variant={mockMarketData.volatility > 60 ? 'destructive' : 'default'}>
                  {mockMarketData.volatility > 60 ? 'High' : mockMarketData.volatility > 30 ? 'Medium' : 'Low'}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="signals" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="signals" className="flex items-center space-x-2">
              <Zap className="w-4 h-4" />
              <span>Signals</span>
            </TabsTrigger>
            <TabsTrigger value="analysis" className="flex items-center space-x-2">
              <Brain className="w-4 h-4" />
              <span>AI Analysis</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Insights</span>
            </TabsTrigger>
            <TabsTrigger value="performance" className="flex items-center space-x-2">
              <BarChart3 className="w-4 h-4" />
              <span>Performance</span>
            </TabsTrigger>
          </TabsList>

          {/* Signals Tab */}
          <TabsContent value="signals" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {mockSignals.map((signal) => (
                <SignalCard key={signal.id} signal={signal} />
              ))}
            </div>
          </TabsContent>

          {/* AI Analysis Tab */}
          <TabsContent value="analysis" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Technical Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Trend Direction</span>
                      <Badge variant="default" className="flex items-center space-x-1">
                        <TrendingUp className="w-3 h-3" />
                        <span>Bullish</span>
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>RSI (14)</span>
                      <span className="font-semibold">67.8</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>MACD</span>
                      <Badge variant="default">Bullish Cross</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Moving Averages</span>
                      <Badge variant="default">Above 50/200</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Fundamental Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Economic Impact</span>
                      <Badge variant="default">Medium</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>News Sentiment</span>
                      <Badge variant="default">Positive</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Currency Strength</span>
                      <span className="font-semibold">EUR: +2.1%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Risk Sentiment</span>
                      <Badge variant="default">Risk-On</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Pattern Recognition</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Chart Pattern</span>
                      <Badge variant="default">Ascending Triangle</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Formation Probability</span>
                      <span className="font-semibold">78%</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Breakout Target</span>
                      <span className="font-semibold">1.0920</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span>Pattern Strength</span>
                      <Badge variant="default">Strong</Badge>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Insights Tab */}
          <TabsContent value="insights" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Daily AI Commentary</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="prose prose-sm max-w-none">
                    <p className="text-gray-700 leading-relaxed">
                      The EUR/USD pair is showing strong bullish momentum following the ECB's hawkish stance. 
                      Technical indicators align with fundamental drivers, suggesting continued upward pressure. 
                      Key resistance at 1.0850 remains the immediate target.
                    </p>
                    <p className="text-gray-700 leading-relaxed mt-3">
                      Market sentiment has shifted to risk-on mode, benefiting higher-yielding currencies. 
                      Watch for any dovish commentary from Fed officials that could further support the Euro.
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Key Events Today</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="w-5 h-5 text-yellow-600" />
                      <div>
                        <div className="font-semibold text-sm">US CPI Data</div>
                        <div className="text-xs text-gray-600">14:30 GMT - High Impact</div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3 p-3 bg-blue-50 rounded-lg">
                      <Activity className="w-5 h-5 text-blue-600" />
                      <div>
                        <div className="font-semibold text-sm">ECB Speech</div>
                        <div className="text-xs text-gray-600">16:00 GMT - Medium Impact</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Performance Tab */}
          <TabsContent value="performance" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Percent className="w-5 h-5" />
                    <span>Success Rate</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      {mockPerformance.successRate}%
                    </div>
                    <Progress value={mockPerformance.successRate} className="mb-3" />
                    <p className="text-sm text-gray-600">
                      {mockPerformance.totalSignals} signals analyzed
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <DollarSign className="w-5 h-5" />
                    <span>Total P&L</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center">
                    <div className="text-3xl font-bold text-green-600 mb-2">
                      +${mockPerformance.profitLoss.toLocaleString()}
                    </div>
                    <Badge variant="default" className="mb-3">
                      +12.4% This Month
                    </Badge>
                    <p className="text-sm text-gray-600">
                      Based on $10k account
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Best Performing Signals</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {mockPerformance.bestPerforming.map((item, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <span className="text-sm">{item.type}</span>
                        <Badge variant="outline">{item.rate}%</Badge>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AIMarketAnalysis;