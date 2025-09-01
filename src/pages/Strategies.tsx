import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Play,
  Pause,
  Edit,
  Trash2,
  TrendingUp,
  TrendingDown,
  Activity,
  Settings,
  BarChart3,
  Target,
  Clock,
  Wrench
} from 'lucide-react';
import { useStrategies, useTradingStore } from '../store';
import { cn } from '../utils/cn';
import type { TradingStrategy } from '../types';

interface StrategyCardProps {
  strategy: TradingStrategy;
  onToggle: (id: string) => void;
  onEdit: (strategy: TradingStrategy) => void;
  onDelete: (id: string) => void;
}

const StrategyCard: React.FC<StrategyCardProps> = ({ strategy, onToggle, onEdit, onDelete }) => {
  const formatPercentage = (value: number) => {
    const sign = value >= 0 ? '+' : '';
    return `${sign}${value.toFixed(2)}%`;
  };

  return (
    <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-white">{strategy.name}</h3>
          <p className="text-sm text-gray-400 mt-1">{strategy.description}</p>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onToggle(strategy.id)}
            className={cn(
              'p-2 rounded-lg transition-colors',
              strategy.isActive
                ? 'bg-red-600 hover:bg-red-700 text-white'
                : 'bg-green-600 hover:bg-green-700 text-white'
            )}
            title={strategy.isActive ? 'Stop Strategy' : 'Start Strategy'}
          >
            {strategy.isActive ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </button>
          <button
            onClick={() => onEdit(strategy)}
            className="p-2 bg-gray-700 hover:bg-gray-600 rounded-lg text-gray-300 transition-colors"
            title="Edit Strategy"
          >
            <Edit className="h-4 w-4" />
          </button>
          <button
            onClick={() => onDelete(strategy.id)}
            className="p-2 bg-gray-700 hover:bg-red-600 rounded-lg text-gray-300 hover:text-white transition-colors"
            title="Delete Strategy"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div>
          <p className="text-xs text-gray-400">Total Return</p>
          <p className={cn(
            'text-lg font-semibold',
            strategy.performance.totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
          )}>
            {formatPercentage(strategy.performance.totalReturn)}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Win Rate</p>
          <p className="text-lg font-semibold text-white">
            {strategy.performance.winRate.toFixed(1)}%
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Total Trades</p>
          <p className="text-lg font-semibold text-white">
            {strategy.performance.totalTrades}
          </p>
        </div>
        <div>
          <p className="text-xs text-gray-400">Max Drawdown</p>
          <p className="text-lg font-semibold text-red-400">
            {formatPercentage(strategy.performance.maxDrawdown)}
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm">
        <div className="flex items-center space-x-4">
          <span className={cn(
            'px-2 py-1 rounded text-xs font-medium',
            strategy.isActive ? 'bg-green-900 text-green-300' : 'bg-gray-700 text-gray-300'
          )}>
            {strategy.isActive ? 'ACTIVE' : 'INACTIVE'}
          </span>
          <span className="text-gray-400">
            Risk: {strategy.riskLevel}
          </span>
        </div>
        <div className="text-gray-400">
          Symbols: {strategy.symbols.join(', ')}
        </div>
      </div>
    </div>
  );
};

const CreateStrategyModal: React.FC<{
  isOpen: boolean;
  onClose: () => void;
  onSave: (strategy: Omit<TradingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => void;
  editingStrategy?: TradingStrategy;
}> = ({ isOpen, onClose, onSave, editingStrategy }) => {
  const [formData, setFormData] = useState({
    userId: editingStrategy?.userId || 'user1',
    name: editingStrategy?.name || '',
    description: editingStrategy?.description || '',
    strategyType: editingStrategy?.strategyType || 'manual' as const,
    riskLevel: editingStrategy?.riskLevel || 'medium' as const,
    symbols: editingStrategy?.symbols || ['EURUSD'],
    parameters: editingStrategy?.parameters || {},
    riskSettings: editingStrategy?.riskSettings || { maxRiskPerTrade: 2, maxDailyLoss: 5, maxDrawdown: 10, positionSizing: 'percentage', stopLossType: 'percentage' },
    isActive: editingStrategy?.isActive || false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      ...formData,
      performance: editingStrategy?.performance || {
        totalReturn: 0,
        winRate: 0,
        totalTrades: 0,
        maxDrawdown: 0,
        sharpeRatio: 0,
        profitFactor: 1.0,
        totalProfit: 0,
      },
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-background-secondary rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">
          {editingStrategy ? 'Edit Strategy' : 'Create New Strategy'}
        </h2>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Strategy Name
            </label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
              required
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Description
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
              rows={3}
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Strategy Type
            </label>
            <select
              value={formData.strategyType}
              onChange={(e) => setFormData({ ...formData, strategyType: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="manual">Manual</option>
              <option value="ai_generated">AI Generated</option>
              <option value="template">Template</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Risk Level
            </label>
            <select
              value={formData.riskLevel}
              onChange={(e) => setFormData({ ...formData, riskLevel: e.target.value as any })}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-primary"
            >
              <option value="low">Low Risk</option>
              <option value="medium">Medium Risk</option>
              <option value="high">High Risk</option>
            </select>
          </div>
          
          <div className="flex items-center">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="mr-2"
            />
            <label htmlFor="isActive" className="text-sm text-gray-400">
              Start strategy immediately
            </label>
          </div>
          
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-primary hover:bg-primary-dark rounded-lg text-white transition-colors"
            >
              {editingStrategy ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const Strategies: React.FC = () => {
  const navigate = useNavigate();
  const strategies = useStrategies();
  const { addStrategy, updateStrategy, removeStrategy } = useTradingStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStrategy, setEditingStrategy] = useState<TradingStrategy | undefined>();

  // Mock strategies for demonstration
  const mockStrategies: TradingStrategy[] = [
    {
      id: '1',
      userId: 'user1',
      name: 'Moving Average Crossover',
      description: 'Buy when fast MA crosses above slow MA, sell when it crosses below',
      strategyType: 'manual',
      riskLevel: 'medium',
      symbols: ['EURUSD', 'GBPUSD'],
      parameters: { fastMA: 10, slowMA: 20 },
      riskSettings: { maxRiskPerTrade: 2, maxDailyLoss: 5, maxDrawdown: 10, positionSizing: 'percentage', stopLossType: 'percentage' },
      isActive: true,
      performance: {
        totalReturn: 12.5,
        winRate: 65.2,
        totalTrades: 45,
        maxDrawdown: -8.3,
        sharpeRatio: 1.2,
        profitFactor: 1.8,
        totalProfit: 2500,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: '2',
      userId: 'user1',
      name: 'RSI Reversal',
      description: 'Trade reversals based on RSI overbought/oversold levels',
      strategyType: 'template',
      riskLevel: 'high',
      symbols: ['USDJPY'],
      parameters: { rsiPeriod: 14, overbought: 70, oversold: 30 },
      riskSettings: { maxRiskPerTrade: 3, maxDailyLoss: 8, maxDrawdown: 15, positionSizing: 'fixed', stopLossType: 'atr' },
      isActive: false,
      performance: {
        totalReturn: -3.2,
        winRate: 58.7,
        totalTrades: 23,
        maxDrawdown: -12.1,
        sharpeRatio: 0.8,
        profitFactor: 0.9,
        totalProfit: -640,
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];

  const displayStrategies = strategies.length > 0 ? strategies : mockStrategies;

  const handleToggleStrategy = (id: string) => {
    const strategy = displayStrategies.find(s => s.id === id);
    if (strategy) {
      updateStrategy(id, { isActive: !strategy.isActive });
    }
  };

  const handleEditStrategy = (strategy: TradingStrategy) => {
    setEditingStrategy(strategy);
    setIsModalOpen(true);
  };

  const handleDeleteStrategy = (id: string) => {
    if (confirm('Are you sure you want to delete this strategy?')) {
      removeStrategy(id);
    }
  };

  const handleSaveStrategy = (strategyData: Omit<TradingStrategy, 'id' | 'createdAt' | 'updatedAt'>) => {
    if (editingStrategy) {
      updateStrategy(editingStrategy.id, strategyData);
    } else {
      const newStrategy: TradingStrategy = {
        ...strategyData,
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      addStrategy(newStrategy);
    }
    setEditingStrategy(undefined);
  };

  const activeStrategies = displayStrategies.filter(s => s.isActive).length;
  const totalReturn = displayStrategies.reduce((sum, s) => sum + s.performance.totalReturn, 0) / displayStrategies.length;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white">Trading Strategies</h1>
          <p className="text-gray-400 mt-2">Manage and monitor your automated trading strategies.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/strategies/builder')}
            className="flex items-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium transition-colors"
          >
            <Wrench className="h-4 w-4" />
            <span>Strategy Builder</span>
          </button>
          <button
            onClick={() => setIsModalOpen(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
          >
            <Plus className="h-4 w-4" />
            <span>New Strategy</span>
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Activity className="h-8 w-8 text-green-400" />
            <div>
              <p className="text-sm text-gray-400">Active Strategies</p>
              <p className="text-2xl font-bold text-white">{activeStrategies}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-8 w-8 text-blue-400" />
            <div>
              <p className="text-sm text-gray-400">Total Strategies</p>
              <p className="text-2xl font-bold text-white">{displayStrategies.length}</p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <TrendingUp className="h-8 w-8 text-purple-400" />
            <div>
              <p className="text-sm text-gray-400">Avg. Return</p>
              <p className={cn(
                'text-2xl font-bold',
                totalReturn >= 0 ? 'text-green-400' : 'text-red-400'
              )}>
                {totalReturn >= 0 ? '+' : ''}{totalReturn.toFixed(1)}%
              </p>
            </div>
          </div>
        </div>
        
        <div className="bg-background-secondary rounded-lg p-6 border border-gray-700">
          <div className="flex items-center space-x-3">
            <Target className="h-8 w-8 text-yellow-400" />
            <div>
              <p className="text-sm text-gray-400">Success Rate</p>
              <p className="text-2xl font-bold text-white">62.3%</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strategies Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {displayStrategies.map((strategy) => (
          <StrategyCard
            key={strategy.id}
            strategy={strategy}
            onToggle={handleToggleStrategy}
            onEdit={handleEditStrategy}
            onDelete={handleDeleteStrategy}
          />
        ))}
      </div>

      {displayStrategies.length === 0 && (
        <div className="bg-background-secondary rounded-lg p-12 border border-gray-700 text-center">
          <Settings className="h-16 w-16 text-gray-500 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">No Strategies Yet</h3>
          <p className="text-gray-400 mb-6">Create your first trading strategy to get started with automated trading.</p>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-primary hover:bg-primary-dark rounded-lg text-white font-medium transition-colors"
          >
            Create Strategy
          </button>
        </div>
      )}

      {/* Create/Edit Strategy Modal */}
      <CreateStrategyModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingStrategy(undefined);
        }}
        onSave={handleSaveStrategy}
        editingStrategy={editingStrategy}
      />
    </div>
  );
};