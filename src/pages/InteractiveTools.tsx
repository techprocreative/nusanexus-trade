import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockStrategies, mockSimulationResults } from '../data/aiStrategyMockData';
import { Calculator, BarChart3, TrendingUp, Settings, Play, RefreshCw, Zap, Target, AlertTriangle } from 'lucide-react';

interface ComparisonStrategy {
  id: string;
  name: string;
  expectedReturn: number;
  winRate: number;
  maxDrawdown: number;
  sharpeRatio: number;
}

interface SimulationParams {
  initialCapital: number;
  timeHorizon: number;
  confidenceLevel: number;
  iterations: number;
}

const InteractiveTools: React.FC = () => {
  const { strategies, simulationResults, setStrategies, setSimulationResults } = useAIStrategyStore();
  const [activeTab, setActiveTab] = useState<'comparison' | 'simulation' | 'parameters'>('comparison');
  const [selectedStrategies, setSelectedStrategies] = useState<string[]>([]);
  const [simulationParams, setSimulationParams] = useState<SimulationParams>({
    initialCapital: 10000,
    timeHorizon: 12,
    confidenceLevel: 95,
    iterations: 1000
  });
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationComplete, setSimulationComplete] = useState(false);

  useEffect(() => {
    if (strategies.length === 0) {
      setStrategies(mockStrategies);
      setSimulationResults(mockSimulationResults);
    }
  }, [strategies, setStrategies, setSimulationResults]);

  const handleStrategyToggle = (strategyId: string) => {
    setSelectedStrategies(prev => 
      prev.includes(strategyId)
        ? prev.filter(id => id !== strategyId)
        : [...prev, strategyId].slice(0, 3) // Max 3 strategies
    );
  };

  const runMonteCarloSimulation = async () => {
    setIsSimulating(true);
    setSimulationComplete(false);
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    setIsSimulating(false);
    setSimulationComplete(true);
  };

  const getComparisonData = (): ComparisonStrategy[] => {
    return selectedStrategies.map(id => {
      const strategy = strategies.find(s => s.id === id);
      return {
        id: strategy?.id || '',
        name: strategy?.name || '',
        expectedReturn: strategy?.expectedReturn || 0,
        winRate: strategy?.winRate || 0,
        maxDrawdown: strategy?.maxDrawdown || 0,
        sharpeRatio: strategy?.sharpeRatio || 0
      };
    }).filter(s => s.id);
  };

  const getMetricColor = (value: number, metric: string) => {
    switch (metric) {
      case 'expectedReturn':
      case 'winRate':
      case 'sharpeRatio':
        return value > 0 ? 'text-green-600' : 'text-red-600';
      case 'maxDrawdown':
        return value < 10 ? 'text-green-600' : value < 20 ? 'text-yellow-600' : 'text-red-600';
      default:
        return 'text-slate-900';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Calculator className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Interactive Tools</h1>
            </div>
            
            <div className="flex items-center space-x-2">
              <div className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-sm font-medium">
                {strategies.length} Strategies Available
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tool Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-slate-100 p-1 rounded-lg w-fit">
            {[
              { key: 'comparison', label: 'Strategy Comparison', icon: BarChart3 },
              { key: 'simulation', label: 'Monte Carlo Simulation', icon: TrendingUp },
              { key: 'parameters', label: 'Parameter Analysis', icon: Settings }
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key as any)}
                className={`flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === key
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

        {/* Strategy Comparison Tab */}
        {activeTab === 'comparison' && (
          <div className="space-y-8">
            {/* Strategy Selection */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Select Strategies to Compare (Max 3)</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {strategies.slice(0, 6).map(strategy => (
                  <div
                    key={strategy.id}
                    className={`border-2 rounded-lg p-4 cursor-pointer transition-all ${
                      selectedStrategies.includes(strategy.id)
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                    onClick={() => handleStrategyToggle(strategy.id)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-medium text-slate-900">{strategy.name}</h4>
                      <div className={`w-4 h-4 rounded border-2 ${
                        selectedStrategies.includes(strategy.id)
                          ? 'bg-blue-500 border-blue-500'
                          : 'border-slate-300'
                      }`}>
                        {selectedStrategies.includes(strategy.id) && (
                          <div className="w-full h-full flex items-center justify-center">
                            <div className="w-2 h-2 bg-white rounded-full"></div>
                          </div>
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                    <div className="flex justify-between text-sm">
                      <span className="text-green-600 font-medium">+{strategy.expectedReturn}%</span>
                      <span className="text-slate-600">{strategy.winRate}% Win Rate</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Comparison Results */}
            {selectedStrategies.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Strategy Comparison</h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-4 font-medium text-slate-900">Strategy</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-900">Expected Return</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-900">Win Rate</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-900">Max Drawdown</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-900">Sharpe Ratio</th>
                        <th className="text-center py-3 px-4 font-medium text-slate-900">Overall Score</th>
                      </tr>
                    </thead>
                    <tbody>
                      {getComparisonData().map((strategy, index) => {
                        const overallScore = ((strategy.expectedReturn + strategy.winRate + strategy.sharpeRatio * 10 - strategy.maxDrawdown) / 4).toFixed(1);
                        return (
                          <tr key={strategy.id} className={`border-b border-slate-100 ${index % 2 === 0 ? 'bg-slate-50' : ''}`}>
                            <td className="py-4 px-4">
                              <div className="font-medium text-slate-900">{strategy.name}</div>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className={`font-semibold ${getMetricColor(strategy.expectedReturn, 'expectedReturn')}`}>
                                +{strategy.expectedReturn}%
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-semibold text-slate-900">{strategy.winRate}%</span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className={`font-semibold ${getMetricColor(strategy.maxDrawdown, 'maxDrawdown')}`}>
                                -{strategy.maxDrawdown}%
                              </span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <span className="font-semibold text-slate-900">{strategy.sharpeRatio}</span>
                            </td>
                            <td className="text-center py-4 px-4">
                              <div className="flex items-center justify-center">
                                <span className="font-bold text-blue-600 text-lg">{overallScore}</span>
                                <div className="ml-2 flex">
                                  {[...Array(5)].map((_, i) => (
                                    <div
                                      key={i}
                                      className={`w-2 h-2 rounded-full mr-1 ${
                                        i < Math.floor(parseFloat(overallScore) / 20)
                                          ? 'bg-yellow-400'
                                          : 'bg-slate-200'
                                      }`}
                                    ></div>
                                  ))}
                                </div>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Monte Carlo Simulation Tab */}
        {activeTab === 'simulation' && (
          <div className="space-y-8">
            {/* Simulation Parameters */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Monte Carlo Simulation Parameters</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Initial Capital</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-500">$</span>
                    <input
                      type="number"
                      value={simulationParams.initialCapital}
                      onChange={(e) => setSimulationParams(prev => ({ ...prev, initialCapital: parseInt(e.target.value) || 0 }))}
                      className="w-full pl-8 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Time Horizon (Months)</label>
                  <input
                    type="number"
                    value={simulationParams.timeHorizon}
                    onChange={(e) => setSimulationParams(prev => ({ ...prev, timeHorizon: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Confidence Level (%)</label>
                  <select
                    value={simulationParams.confidenceLevel}
                    onChange={(e) => setSimulationParams(prev => ({ ...prev, confidenceLevel: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={90}>90%</option>
                    <option value={95}>95%</option>
                    <option value={99}>99%</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Iterations</label>
                  <select
                    value={simulationParams.iterations}
                    onChange={(e) => setSimulationParams(prev => ({ ...prev, iterations: parseInt(e.target.value) }))}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value={1000}>1,000</option>
                    <option value={5000}>5,000</option>
                    <option value={10000}>10,000</option>
                  </select>
                </div>
              </div>
              
              <div className="mt-6 flex justify-center">
                <button
                  onClick={runMonteCarloSimulation}
                  disabled={isSimulating}
                  className="flex items-center space-x-2 bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSimulating ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Running Simulation...</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Run Monte Carlo Simulation</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Simulation Results */}
            {(isSimulating || simulationComplete) && (
              <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-6">Simulation Results</h3>
                
                {isSimulating ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-slate-600">Running {simulationParams.iterations.toLocaleString()} iterations...</p>
                    <div className="mt-4 w-64 mx-auto bg-slate-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full animate-pulse" style={{ width: '60%' }}></div>
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="text-center">
                      <div className="p-3 bg-green-50 rounded-lg w-fit mx-auto mb-2">
                        <TrendingUp className="h-6 w-6 text-green-600" />
                      </div>
                      <p className="text-2xl font-bold text-green-600">+{(simulationParams.initialCapital * 0.15).toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Expected Profit</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-blue-50 rounded-lg w-fit mx-auto mb-2">
                        <Target className="h-6 w-6 text-blue-600" />
                      </div>
                      <p className="text-2xl font-bold text-blue-600">78%</p>
                      <p className="text-sm text-slate-600">Success Rate</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-red-50 rounded-lg w-fit mx-auto mb-2">
                        <AlertTriangle className="h-6 w-6 text-red-600" />
                      </div>
                      <p className="text-2xl font-bold text-red-600">-{(simulationParams.initialCapital * 0.08).toLocaleString()}</p>
                      <p className="text-sm text-slate-600">Max Loss ({simulationParams.confidenceLevel}% VaR)</p>
                    </div>
                    
                    <div className="text-center">
                      <div className="p-3 bg-yellow-50 rounded-lg w-fit mx-auto mb-2">
                        <Zap className="h-6 w-6 text-yellow-600" />
                      </div>
                      <p className="text-2xl font-bold text-yellow-600">1.8</p>
                      <p className="text-sm text-slate-600">Risk-Reward Ratio</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Parameter Analysis Tab */}
        {activeTab === 'parameters' && (
          <div className="space-y-8">
            {/* Parameter Optimization */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-6">Parameter Optimization</h3>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Parameter Controls */}
                <div className="space-y-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Moving Average Period</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="5"
                        max="50"
                        defaultValue="20"
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-slate-900 w-12">20</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Stop Loss (%)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="10"
                        defaultValue="5"
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-slate-900 w-12">5%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Take Profit (%)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="5"
                        max="25"
                        defaultValue="15"
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-slate-900 w-12">15%</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Position Size (%)</label>
                    <div className="flex items-center space-x-4">
                      <input
                        type="range"
                        min="1"
                        max="20"
                        defaultValue="10"
                        className="flex-1"
                      />
                      <span className="text-sm font-medium text-slate-900 w-12">10%</span>
                    </div>
                  </div>
                </div>
                
                {/* Parameter Impact */}
                <div className="space-y-4">
                  <h4 className="font-medium text-slate-900">Parameter Impact Analysis</h4>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Expected Return</span>
                      <span className="font-semibold text-green-600">+12.5%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Win Rate</span>
                      <span className="font-semibold text-blue-600">68%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Max Drawdown</span>
                      <span className="font-semibold text-red-600">-8.2%</span>
                    </div>
                    
                    <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                      <span className="text-sm text-slate-600">Sharpe Ratio</span>
                      <span className="font-semibold text-slate-900">1.45</span>
                    </div>
                  </div>
                  
                  <button className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors">
                    Optimize Parameters
                  </button>
                </div>
              </div>
            </div>

            {/* Sensitivity Analysis */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
              <h3 className="text-lg font-semibold text-slate-900 mb-4">Sensitivity Analysis</h3>
              <div className="h-64 bg-slate-50 rounded-lg flex items-center justify-center">
                <div className="text-center">
                  <BarChart3 className="h-12 w-12 text-slate-400 mx-auto mb-2" />
                  <p className="text-slate-600">Parameter sensitivity heatmap</p>
                  <p className="text-sm text-slate-500">Shows how parameter changes affect performance</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InteractiveTools;