import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockStrategies, mockSimulationResults } from '../data/aiStrategyMockData';
import { TrendingUp, TrendingDown, BarChart3, PieChart, AlertTriangle, CheckCircle, Clock, Target } from 'lucide-react';

const StrategyAnalysis: React.FC = () => {
  const { strategies, simulationResults, setStrategies, setSimulationResults } = useAIStrategyStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [analysisType, setAnalysisType] = useState<'performance' | 'risk' | 'market'>('performance');

  useEffect(() => {
    if (strategies.length === 0) {
      setStrategies(mockStrategies);
      setSimulationResults(mockSimulationResults);
    }
    if (!selectedStrategy && strategies.length > 0) {
      setSelectedStrategy(strategies[0].id);
    }
  }, [strategies, setStrategies, setSimulationResults, selectedStrategy]);

  const currentStrategy = strategies.find(s => s.id === selectedStrategy);
  const currentSimulation = simulationResults.find(s => s.strategyId === selectedStrategy);

  const getPerformanceColor = (value: number, isPositive: boolean = true) => {
    if (isPositive) {
      return value > 0 ? 'text-green-600' : 'text-red-600';
    }
    return value < 10 ? 'text-green-600' : value < 20 ? 'text-yellow-600' : 'text-red-600';
  };

  const getRiskLevel = (score: number) => {
    if (score <= 3) return { level: 'Low', color: 'text-green-600 bg-green-50' };
    if (score <= 6) return { level: 'Medium', color: 'text-yellow-600 bg-yellow-50' };
    return { level: 'High', color: 'text-red-600 bg-red-50' };
  };

  if (!currentStrategy) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Loading strategy analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <BarChart3 className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Strategy Analysis</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <select 
                value={selectedStrategy}
                onChange={(e) => setSelectedStrategy(e.target.value)}
                className="border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {strategies.map(strategy => (
                  <option key={strategy.id} value={strategy.id}>
                    {strategy.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Strategy Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{currentStrategy.name}</h2>
              <p className="text-slate-600 mb-4">{currentStrategy.description}</p>
              <div className="flex items-center space-x-4">
                <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium capitalize">
                  {currentStrategy.category.replace('_', ' ')}
                </span>
                <span className="px-3 py-1 bg-slate-100 text-slate-700 rounded-full text-sm font-medium capitalize">
                  {currentStrategy.difficultyLevel}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${currentStrategy.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                  {currentStrategy.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>
            
            <div className="text-right">
              <div className="flex items-center space-x-2 mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
                <span className="text-2xl font-bold text-green-600">+{currentStrategy.expectedReturn}%</span>
              </div>
              <p className="text-sm text-slate-600">Expected Annual Return</p>
            </div>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="p-3 bg-green-50 rounded-lg w-fit mx-auto mb-2">
                <Target className="h-6 w-6 text-green-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{currentStrategy.winRate}%</p>
              <p className="text-sm text-slate-600">Win Rate</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-lg w-fit mx-auto mb-2">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{currentStrategy.sharpeRatio}</p>
              <p className="text-sm text-slate-600">Sharpe Ratio</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-red-50 rounded-lg w-fit mx-auto mb-2">
                <TrendingDown className="h-6 w-6 text-red-600" />
              </div>
              <p className="text-2xl font-bold text-red-600">{currentStrategy.maxDrawdown}%</p>
              <p className="text-sm text-slate-600">Max Drawdown</p>
            </div>
            
            <div className="text-center">
              <div className="p-3 bg-yellow-50 rounded-lg w-fit mx-auto mb-2">
                <AlertTriangle className="h-6 w-6 text-yellow-600" />
              </div>
              <p className="text-2xl font-bold text-slate-900">{currentStrategy.tags.length}</p>
              <p className="text-sm text-slate-600">Strategy Tags</p>
            </div>
          </div>
        </div>

        {/* Analysis Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { key: 'performance', label: 'Performance', icon: TrendingUp },
              { key: 'risk', label: 'Risk Analysis', icon: AlertTriangle },
              { key: 'market', label: 'Market Conditions', icon: PieChart }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setAnalysisType(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  analysisType === key
                    ? 'bg-white text-blue-600 shadow-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Analysis Content */}
        {analysisType === 'performance' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Performance Chart */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Performance Over Time</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Performance chart visualization</p>
                  <p className="text-sm text-slate-500">Integration with charting library needed</p>
                </div>
              </div>
            </div>

            {/* Performance Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Detailed Metrics</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Annual Return</span>
                  <span className={`font-semibold ${getPerformanceColor(currentStrategy.expectedReturn)}`}>
                    +{currentStrategy.expectedReturn}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Volatility</span>
                  <span className="font-semibold text-slate-900">
                    {currentSimulation?.results.volatility.toFixed(1) || '12.5'}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Sharpe Ratio</span>
                  <span className="font-semibold text-slate-900">{currentStrategy.sharpeRatio}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Maximum Drawdown</span>
                  <span className={`font-semibold ${getPerformanceColor(currentStrategy.maxDrawdown, false)}`}>
                    -{currentStrategy.maxDrawdown}%
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-slate-100">
                  <span className="text-slate-600">Win Rate</span>
                  <span className="font-semibold text-green-600">{currentStrategy.winRate}%</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-slate-600">Profit Factor</span>
                  <span className="font-semibold text-slate-900">2.1</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisType === 'risk' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Risk Metrics */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Assessment</h3>
              <div className="space-y-6">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Overall Risk Level</span>
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRiskLevel(6).color}`}>
                      {getRiskLevel(6).level}
                    </span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '60%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Value at Risk (95%)</span>
                    <span className="font-semibold text-red-600">
                      {currentSimulation?.results.var95.toFixed(1) || '-12.5'}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Expected Shortfall</span>
                    <span className="font-semibold text-red-600">
                      {currentSimulation?.results.expectedShortfall.toFixed(1) || '-15.7'}%
                    </span>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Probability of Loss</span>
                    <span className="font-semibold text-yellow-600">
                      {((currentSimulation?.results.probabilityOfLoss || 0.23) * 100).toFixed(1)}%
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Risk Distribution */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Risk Distribution</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <PieChart className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Risk distribution chart</p>
                  <p className="text-sm text-slate-500">Monte Carlo simulation results</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {analysisType === 'market' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Market Conditions */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Market Suitability</h3>
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Bull Market</span>
                    <span className="font-semibold text-green-600">85%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-green-500 h-2 rounded-full" style={{ width: '85%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Bear Market</span>
                    <span className="font-semibold text-red-600">45%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-red-500 h-2 rounded-full" style={{ width: '45%' }}></div>
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-slate-600">Sideways Market</span>
                    <span className="font-semibold text-yellow-600">62%</span>
                  </div>
                  <div className="w-full bg-slate-200 rounded-full h-2">
                    <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '62%' }}></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Strategy Parameters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Strategy Parameters</h3>
              <div className="space-y-3">
                {Object.entries(currentStrategy.parameters).map(([key, value]) => (
                  <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100">
                    <span className="text-slate-600 capitalize">
                      {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
                    </span>
                    <span className="font-semibold text-slate-900">
                      {typeof value === 'number' ? value : String(value)}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Strategy Tags */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Strategy Tags</h3>
          <div className="flex flex-wrap gap-2">
            {currentStrategy.tags.map((tag, index) => (
              <span key={index} className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mt-8">
          <button className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors">
            Run Simulation
          </button>
          <button className="bg-green-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-green-700 transition-colors">
            Implement Strategy
          </button>
          <button className="border border-slate-300 text-slate-700 px-6 py-3 rounded-lg font-medium hover:bg-slate-50 transition-colors">
            Compare Strategies
          </button>
        </div>
      </div>
    </div>
  );
};

export default StrategyAnalysis;