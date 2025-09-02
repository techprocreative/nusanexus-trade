import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockUserProfile, mockRecommendations, mockStrategies } from '../data/aiStrategyMockData';
import { TrendingUp, Brain, Target, AlertCircle, Settings, Bell, Search, Filter } from 'lucide-react';

const Dashboard: React.FC = () => {
  const {
    userProfile,
    recommendations,
    strategies,
    setUserProfile,
    setRecommendations,
    setStrategies,
    getFilteredRecommendations
  } = useAIStrategyStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [showSettings, setShowSettings] = useState(false);

  // Initialize mock data
  useEffect(() => {
    if (!userProfile) {
      setUserProfile(mockUserProfile);
      setRecommendations(mockRecommendations);
      setStrategies(mockStrategies);
    }
  }, [userProfile, setUserProfile, setRecommendations, setStrategies]);

  const filteredRecommendations = getFilteredRecommendations(selectedFilter);
  const topRecommendations = filteredRecommendations.slice(0, 3);

  const getConfidenceColor = (score: number) => {
    if (score >= 0.8) return 'text-green-600 bg-green-50';
    if (score >= 0.6) return 'text-yellow-600 bg-yellow-50';
    return 'text-red-600 bg-red-50';
  };

  const getRiskColor = (score: number) => {
    if (score <= 3) return 'text-green-600';
    if (score <= 6) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Brain className="h-8 w-8 text-blue-600" />
                <h1 className="text-2xl font-bold text-slate-900">AI Strategy Hub</h1>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="h-5 w-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search strategies..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              
              <button className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors">
                <Bell className="h-5 w-5" />
              </button>
              
              <button 
                onClick={() => setShowSettings(!showSettings)}
                className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
              >
                <Settings className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-slate-900 mb-2">
            Welcome back, {userProfile?.name || 'Trader'}!
          </h2>
          <p className="text-slate-600">
            Here are your personalized AI-powered strategy recommendations based on current market conditions.
          </p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Active Strategies</p>
                <p className="text-2xl font-bold text-slate-900">{strategies.filter(s => s.isActive).length}</p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg">
                <Target className="h-6 w-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">New Recommendations</p>
                <p className="text-2xl font-bold text-slate-900">{recommendations.filter(r => r.status === 'pending').length}</p>
              </div>
              <div className="p-3 bg-green-50 rounded-lg">
                <Brain className="h-6 w-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Avg. Confidence</p>
                <p className="text-2xl font-bold text-slate-900">
                  {Math.round(recommendations.reduce((acc, r) => acc + r.confidenceScore, 0) / recommendations.length * 100)}%
                </p>
              </div>
              <div className="p-3 bg-yellow-50 rounded-lg">
                <TrendingUp className="h-6 w-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-slate-600">Risk Level</p>
                <p className="text-2xl font-bold text-slate-900 capitalize">{userProfile?.riskTolerance}</p>
              </div>
              <div className="p-3 bg-red-50 rounded-lg">
                <AlertCircle className="h-6 w-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="mb-6">
          <div className="flex items-center space-x-4">
            <Filter className="h-5 w-5 text-slate-600" />
            <div className="flex space-x-2">
              {['all', 'pending', 'viewed', 'implemented'].map((filter) => (
                <button
                  key={filter}
                  onClick={() => setSelectedFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedFilter === filter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Top Recommendations */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6">Top AI Recommendations</h3>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {topRecommendations.map((recommendation) => (
              <div key={recommendation.id} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h4 className="text-lg font-semibold text-slate-900 mb-1">
                        {recommendation.strategy.name}
                      </h4>
                      <p className="text-sm text-slate-600 capitalize">
                        {recommendation.strategy.category.replace('_', ' ')}
                      </p>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-medium ${getConfidenceColor(recommendation.confidenceScore)}`}>
                      {Math.round(recommendation.confidenceScore * 100)}% Confidence
                    </div>
                  </div>

                  <p className="text-sm text-slate-600 mb-4 line-clamp-2">
                    {recommendation.strategy.description}
                  </p>

                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <p className="text-xs text-slate-500">Expected Return</p>
                      <p className="text-sm font-semibold text-green-600">
                        +{recommendation.strategy.expectedReturn}%
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500">Risk Score</p>
                      <p className={`text-sm font-semibold ${getRiskColor(recommendation.riskAssessment.riskScore)}`}>
                        {recommendation.riskAssessment.riskScore}/10
                      </p>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Market Suitability</p>
                    <div className="space-y-1">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Bullish</span>
                        <div className="flex-1 mx-2 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-green-500 h-1.5 rounded-full" 
                            style={{ width: `${recommendation.marketSuitability.bullish * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">{Math.round(recommendation.marketSuitability.bullish * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Bearish</span>
                        <div className="flex-1 mx-2 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-red-500 h-1.5 rounded-full" 
                            style={{ width: `${recommendation.marketSuitability.bearish * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">{Math.round(recommendation.marketSuitability.bearish * 100)}%</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-600">Sideways</span>
                        <div className="flex-1 mx-2 bg-slate-200 rounded-full h-1.5">
                          <div 
                            className="bg-yellow-500 h-1.5 rounded-full" 
                            style={{ width: `${recommendation.marketSuitability.sideways * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-xs text-slate-600">{Math.round(recommendation.marketSuitability.sideways * 100)}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <p className="text-xs text-slate-500 mb-2">Key Reasons</p>
                    <ul className="space-y-1">
                      {recommendation.reasoning.slice(0, 2).map((reason, index) => (
                        <li key={index} className="text-xs text-slate-600 flex items-start">
                          <span className="w-1 h-1 bg-blue-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                          {reason}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="flex space-x-2">
                    <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                      View Details
                    </button>
                    <button className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors">
                      Simulate
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="p-3 bg-blue-50 rounded-lg w-fit mx-auto mb-4">
                <Brain className="h-8 w-8 text-blue-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Strategy Analysis</h4>
              <p className="text-sm text-slate-600 mb-4">Deep dive into strategy performance and risk metrics</p>
              <button className="w-full bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
                Analyze Now
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="p-3 bg-green-50 rounded-lg w-fit mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Interactive Tools</h4>
              <p className="text-sm text-slate-600 mb-4">Compare strategies and run Monte Carlo simulations</p>
              <button className="w-full bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                Explore Tools
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="p-3 bg-yellow-50 rounded-lg w-fit mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Educational Hub</h4>
              <p className="text-sm text-slate-600 mb-4">Learn trading strategies and risk management</p>
              <button className="w-full bg-yellow-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-yellow-700 transition-colors">
                Start Learning
              </button>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 hover:shadow-md transition-shadow cursor-pointer">
            <div className="text-center">
              <div className="p-3 bg-purple-50 rounded-lg w-fit mx-auto mb-4">
                <Settings className="h-8 w-8 text-purple-600" />
              </div>
              <h4 className="text-lg font-semibold text-slate-900 mb-2">Implementation</h4>
              <p className="text-sm text-slate-600 mb-4">Step-by-step guide to implement strategies</p>
              <button className="w-full bg-purple-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-purple-700 transition-colors">
                Get Started
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Settings Panel */}
      {showSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-slate-900">Dashboard Settings</h3>
              <button 
                onClick={() => setShowSettings(false)}
                className="text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Risk Tolerance
                </label>
                <select className="w-full border border-slate-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="low">Conservative</option>
                  <option value="medium" selected>Moderate</option>
                  <option value="high">Aggressive</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Notification Preferences
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600">Email notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" defaultChecked />
                    <span className="ml-2 text-sm text-slate-600">Push notifications</span>
                  </label>
                  <label className="flex items-center">
                    <input type="checkbox" className="rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <span className="ml-2 text-sm text-slate-600">SMS alerts</span>
                  </label>
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button 
                onClick={() => setShowSettings(false)}
                className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
              >
                Save Changes
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="px-4 py-2 border border-slate-300 text-slate-700 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;