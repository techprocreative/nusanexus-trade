import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { 
  User, 
  TrendingUp, 
  Target, 
  Shield, 
  Brain, 
  CheckCircle, 
  ChevronRight, 
  ChevronLeft, 
  Star, 
  DollarSign, 
  Calendar, 
  BarChart3, 
  AlertTriangle,
  Info,
  Lightbulb,
  Rocket
} from 'lucide-react';

interface OnboardingData {
  personalInfo: {
    name: string;
    email: string;
    experience: 'beginner' | 'intermediate' | 'advanced';
    tradingYears: number;
  };
  tradingGoals: {
    primaryGoal: 'income' | 'growth' | 'preservation' | 'learning';
    timeHorizon: 'short' | 'medium' | 'long';
    targetReturn: number;
    riskTolerance: 'low' | 'medium' | 'high';
  };
  preferences: {
    tradingStyle: 'day' | 'swing' | 'position' | 'scalping';
    markets: string[];
    maxDrawdown: number;
    capitalAmount: number;
  };
  aiPreferences: {
    automationLevel: 'manual' | 'semi' | 'full';
    signalFrequency: 'low' | 'medium' | 'high';
    analysisDepth: 'basic' | 'detailed' | 'comprehensive';
  };
}

const OnboardingFlow: React.FC = () => {
  const navigate = useNavigate();
  const { setUserProfile } = useAIStrategyStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [onboardingData, setOnboardingData] = useState<OnboardingData>({
    personalInfo: {
      name: '',
      email: '',
      experience: 'beginner',
      tradingYears: 0
    },
    tradingGoals: {
      primaryGoal: 'learning',
      timeHorizon: 'medium',
      targetReturn: 10,
      riskTolerance: 'medium'
    },
    preferences: {
      tradingStyle: 'swing',
      markets: [],
      maxDrawdown: 10,
      capitalAmount: 10000
    },
    aiPreferences: {
      automationLevel: 'semi',
      signalFrequency: 'medium',
      analysisDepth: 'detailed'
    }
  });
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [isCompleting, setIsCompleting] = useState(false);

  const steps = [
    {
      id: 'welcome',
      title: 'Welcome to AI Strategy Hub',
      subtitle: 'Let\'s get you started with personalized trading strategies',
      icon: <Rocket className="h-8 w-8" />
    },
    {
      id: 'personal',
      title: 'Personal Information',
      subtitle: 'Tell us about your trading background',
      icon: <User className="h-8 w-8" />
    },
    {
      id: 'goals',
      title: 'Trading Goals',
      subtitle: 'Define your investment objectives',
      icon: <Target className="h-8 w-8" />
    },
    {
      id: 'preferences',
      title: 'Trading Preferences',
      subtitle: 'Set your trading style and risk parameters',
      icon: <TrendingUp className="h-8 w-8" />
    },
    {
      id: 'ai-setup',
      title: 'AI Configuration',
      subtitle: 'Customize your AI assistant settings',
      icon: <Brain className="h-8 w-8" />
    },
    {
      id: 'complete',
      title: 'Setup Complete',
      subtitle: 'You\'re ready to start trading with AI assistance',
      icon: <CheckCircle className="h-8 w-8" />
    }
  ];

  const updateOnboardingData = (section: keyof OnboardingData, data: any) => {
    setOnboardingData(prev => ({
      ...prev,
      [section]: { ...prev[section], ...data }
    }));
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCompletedSteps(prev => [...prev, currentStep]);
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const completeOnboarding = async () => {
    setIsCompleting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // Update user profile in store
    setUserProfile({
      id: '1',
      name: onboardingData.personalInfo.name,
      email: onboardingData.personalInfo.email,
      riskTolerance: onboardingData.tradingGoals.riskTolerance,
      tradingExperience: {
        yearsTrading: onboardingData.personalInfo.tradingYears,
        preferredMarkets: onboardingData.preferences.markets,
        tradingStyle: 'day_trading',
        averageTradeSize: onboardingData.preferences.capitalAmount
      },
      preferences: {
        maxDrawdown: 0.1,
        targetReturn: onboardingData.tradingGoals.targetReturn / 100,
        notificationSettings: {
          email: true,
          push: true,
          sms: false
        }
      },
      subscriptionTier: 'free'
    });
    
    setIsCompleting(false);
    navigate('/dashboard');
  };

  const isStepValid = () => {
    switch (currentStep) {
      case 1: // Personal Info
        return onboardingData.personalInfo.name && onboardingData.personalInfo.email;
      case 2: // Goals
        return onboardingData.tradingGoals.targetReturn > 0;
      case 3: // Preferences
        return onboardingData.preferences.markets.length > 0 && onboardingData.preferences.capitalAmount > 0;
      case 4: // AI Setup
        return true;
      default:
        return true;
    }
  };

  const getProgressPercentage = () => {
    return Math.round((completedSteps.length / (steps.length - 1)) * 100);
  };

  const renderWelcomeStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto">
        <Rocket className="h-12 w-12 text-blue-600" />
      </div>
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Welcome to AI Strategy Hub</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Get personalized trading strategies powered by advanced AI. We'll help you set up your profile 
          and preferences to provide the most relevant recommendations.
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
        <div className="bg-blue-50 p-6 rounded-xl">
          <Brain className="h-8 w-8 text-blue-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">AI-Powered Analysis</h3>
          <p className="text-sm text-slate-600">Advanced algorithms analyze market conditions and generate personalized strategies.</p>
        </div>
        <div className="bg-green-50 p-6 rounded-xl">
          <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">Real-time Signals</h3>
          <p className="text-sm text-slate-600">Get instant notifications for trading opportunities based on your preferences.</p>
        </div>
        <div className="bg-purple-50 p-6 rounded-xl">
          <Shield className="h-8 w-8 text-purple-600 mx-auto mb-3" />
          <h3 className="font-semibold text-slate-900 mb-2">Risk Management</h3>
          <p className="text-sm text-slate-600">Built-in risk controls help protect your capital and optimize position sizing.</p>
        </div>
      </div>
      
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 max-w-2xl mx-auto">
        <div className="flex items-start space-x-3">
          <Lightbulb className="h-5 w-5 text-yellow-600 mt-0.5" />
          <div className="text-left">
            <h4 className="font-medium text-yellow-800">Quick Setup</h4>
            <p className="text-sm text-yellow-700">This setup takes about 5 minutes and helps us personalize your experience.</p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPersonalInfoStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <User className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Personal Information</h2>
        <p className="text-slate-600">Help us understand your trading background</p>
      </div>
      
      <div className="max-w-md mx-auto space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
          <input
            type="text"
            value={onboardingData.personalInfo.name}
            onChange={(e) => updateOnboardingData('personalInfo', { name: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your full name"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
          <input
            type="email"
            value={onboardingData.personalInfo.email}
            onChange={(e) => updateOnboardingData('personalInfo', { email: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Enter your email"
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Trading Experience</label>
          <select
            value={onboardingData.personalInfo.experience}
            onChange={(e) => updateOnboardingData('personalInfo', { experience: e.target.value })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="beginner">Beginner (0-1 years)</option>
            <option value="intermediate">Intermediate (1-5 years)</option>
            <option value="advanced">Advanced (5+ years)</option>
          </select>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Years of Trading Experience</label>
          <input
            type="number"
            min="0"
            max="50"
            value={onboardingData.personalInfo.tradingYears}
            onChange={(e) => updateOnboardingData('personalInfo', { tradingYears: parseInt(e.target.value) || 0 })}
            className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="0"
          />
        </div>
      </div>
    </div>
  );

  const renderGoalsStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Target className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trading Goals</h2>
        <p className="text-slate-600">Define your investment objectives and risk tolerance</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Primary Trading Goal</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'income', label: 'Generate Income', icon: <DollarSign className="h-5 w-5" /> },
              { value: 'growth', label: 'Capital Growth', icon: <TrendingUp className="h-5 w-5" /> },
              { value: 'preservation', label: 'Preserve Capital', icon: <Shield className="h-5 w-5" /> },
              { value: 'learning', label: 'Learn Trading', icon: <Brain className="h-5 w-5" /> }
            ].map(goal => (
              <button
                key={goal.value}
                onClick={() => updateOnboardingData('tradingGoals', { primaryGoal: goal.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  onboardingData.tradingGoals.primaryGoal === goal.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`p-2 rounded-lg ${
                    onboardingData.tradingGoals.primaryGoal === goal.value
                      ? 'bg-blue-100 text-blue-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {goal.icon}
                  </div>
                  <span className="font-medium">{goal.label}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Time Horizon</label>
          <div className="flex space-x-3">
            {[
              { value: 'short', label: 'Short-term (< 1 year)' },
              { value: 'medium', label: 'Medium-term (1-5 years)' },
              { value: 'long', label: 'Long-term (5+ years)' }
            ].map(horizon => (
              <button
                key={horizon.value}
                onClick={() => updateOnboardingData('tradingGoals', { timeHorizon: horizon.value })}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  onboardingData.tradingGoals.timeHorizon === horizon.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {horizon.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Target Annual Return: {onboardingData.tradingGoals.targetReturn}%
          </label>
          <input
            type="range"
            min="5"
            max="50"
            step="5"
            value={onboardingData.tradingGoals.targetReturn}
            onChange={(e) => updateOnboardingData('tradingGoals', { targetReturn: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Conservative (5%)</span>
            <span>Aggressive (50%)</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Risk Tolerance</label>
          <div className="flex space-x-3">
            {[
              { value: 'low', label: 'Low Risk', color: 'green' },
              { value: 'medium', label: 'Medium Risk', color: 'yellow' },
              { value: 'high', label: 'High Risk', color: 'red' }
            ].map(risk => (
              <button
                key={risk.value}
                onClick={() => updateOnboardingData('tradingGoals', { riskTolerance: risk.value })}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  onboardingData.tradingGoals.riskTolerance === risk.value
                    ? `border-${risk.color}-500 bg-${risk.color}-50 text-${risk.color}-700`
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {risk.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderPreferencesStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <TrendingUp className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">Trading Preferences</h2>
        <p className="text-slate-600">Set your trading style and market preferences</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Trading Style</label>
          <div className="grid grid-cols-2 gap-3">
            {[
              { value: 'scalping', label: 'Scalping', desc: 'Very short-term (minutes)' },
              { value: 'day', label: 'Day Trading', desc: 'Intraday positions' },
              { value: 'swing', label: 'Swing Trading', desc: 'Days to weeks' },
              { value: 'position', label: 'Position Trading', desc: 'Weeks to months' }
            ].map(style => (
              <button
                key={style.value}
                onClick={() => updateOnboardingData('preferences', { tradingStyle: style.value })}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  onboardingData.preferences.tradingStyle === style.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium text-slate-900">{style.label}</div>
                <div className="text-sm text-slate-600">{style.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Preferred Markets</label>
          <div className="grid grid-cols-2 gap-2">
            {[
              'Stocks', 'Forex', 'Crypto', 'Commodities', 
              'Indices', 'Options', 'Futures', 'ETFs'
            ].map(market => (
              <button
                key={market}
                onClick={() => {
                  const markets = onboardingData.preferences.markets;
                  const newMarkets = markets.includes(market)
                    ? markets.filter(m => m !== market)
                    : [...markets, market];
                  updateOnboardingData('preferences', { markets: newMarkets });
                }}
                className={`p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  onboardingData.preferences.markets.includes(market)
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {market}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Maximum Drawdown: {onboardingData.preferences.maxDrawdown}%
          </label>
          <input
            type="range"
            min="5"
            max="30"
            step="5"
            value={onboardingData.preferences.maxDrawdown}
            onChange={(e) => updateOnboardingData('preferences', { maxDrawdown: parseInt(e.target.value) })}
            className="w-full"
          />
          <div className="flex justify-between text-xs text-slate-500 mt-1">
            <span>Conservative (5%)</span>
            <span>Aggressive (30%)</span>
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">Trading Capital</label>
          <div className="relative">
            <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="number"
              min="1000"
              step="1000"
              value={onboardingData.preferences.capitalAmount}
              onChange={(e) => updateOnboardingData('preferences', { capitalAmount: parseInt(e.target.value) || 0 })}
              className="w-full pl-10 pr-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="10000"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderAISetupStep = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <Brain className="h-12 w-12 text-blue-600 mx-auto mb-4" />
        <h2 className="text-2xl font-bold text-slate-900 mb-2">AI Configuration</h2>
        <p className="text-slate-600">Customize how AI assists your trading</p>
      </div>
      
      <div className="max-w-2xl mx-auto space-y-6">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Automation Level</label>
          <div className="space-y-3">
            {[
              { value: 'manual', label: 'Manual', desc: 'AI provides analysis and suggestions only' },
              { value: 'semi', label: 'Semi-Automated', desc: 'AI generates signals, you execute trades' },
              { value: 'full', label: 'Fully Automated', desc: 'AI executes trades automatically' }
            ].map(level => (
              <button
                key={level.value}
                onClick={() => updateOnboardingData('aiPreferences', { automationLevel: level.value })}
                className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                  onboardingData.aiPreferences.automationLevel === level.value
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <div className="font-medium text-slate-900">{level.label}</div>
                <div className="text-sm text-slate-600">{level.desc}</div>
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Signal Frequency</label>
          <div className="flex space-x-3">
            {[
              { value: 'low', label: 'Low (1-3/day)' },
              { value: 'medium', label: 'Medium (3-10/day)' },
              { value: 'high', label: 'High (10+/day)' }
            ].map(freq => (
              <button
                key={freq.value}
                onClick={() => updateOnboardingData('aiPreferences', { signalFrequency: freq.value })}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  onboardingData.aiPreferences.signalFrequency === freq.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {freq.label}
              </button>
            ))}
          </div>
        </div>
        
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-3">Analysis Depth</label>
          <div className="flex space-x-3">
            {[
              { value: 'basic', label: 'Basic' },
              { value: 'detailed', label: 'Detailed' },
              { value: 'comprehensive', label: 'Comprehensive' }
            ].map(depth => (
              <button
                key={depth.value}
                onClick={() => updateOnboardingData('aiPreferences', { analysisDepth: depth.value })}
                className={`flex-1 p-3 rounded-lg border-2 text-sm font-medium transition-all ${
                  onboardingData.aiPreferences.analysisDepth === depth.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 hover:border-slate-300 text-slate-700'
                }`}
              >
                {depth.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Info className="h-5 w-5 text-blue-600 mt-0.5" />
            <div>
              <h4 className="font-medium text-blue-800">AI Configuration Summary</h4>
              <div className="text-sm text-blue-700 mt-2 space-y-1">
                <p>• Automation: {onboardingData.aiPreferences.automationLevel}</p>
                <p>• Signal Frequency: {onboardingData.aiPreferences.signalFrequency}</p>
                <p>• Analysis Depth: {onboardingData.aiPreferences.analysisDepth}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center space-y-6">
      <div className="w-24 h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-12 w-12 text-green-600" />
      </div>
      
      <div>
        <h2 className="text-3xl font-bold text-slate-900 mb-4">Setup Complete!</h2>
        <p className="text-lg text-slate-600 mb-8 max-w-2xl mx-auto">
          Your AI trading assistant is now configured and ready to help you achieve your trading goals.
        </p>
      </div>
      
      <div className="bg-slate-50 rounded-xl p-6 max-w-2xl mx-auto">
        <h3 className="font-semibold text-slate-900 mb-4">Your Configuration Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Experience:</span>
              <span className="font-medium">{onboardingData.personalInfo.experience}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Primary Goal:</span>
              <span className="font-medium">{onboardingData.tradingGoals.primaryGoal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Risk Tolerance:</span>
              <span className="font-medium">{onboardingData.tradingGoals.riskTolerance}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Trading Style:</span>
              <span className="font-medium">{onboardingData.preferences.tradingStyle}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between">
              <span className="text-slate-600">Target Return:</span>
              <span className="font-medium">{onboardingData.tradingGoals.targetReturn}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Max Drawdown:</span>
              <span className="font-medium">{onboardingData.preferences.maxDrawdown}%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Automation:</span>
              <span className="font-medium">{onboardingData.aiPreferences.automationLevel}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-600">Markets:</span>
              <span className="font-medium">{onboardingData.preferences.markets.length} selected</span>
            </div>
          </div>
        </div>
      </div>
      
      <div className="space-y-4">
        <button
          onClick={completeOnboarding}
          disabled={isCompleting}
          className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2 mx-auto"
        >
          {isCompleting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Setting up your account...</span>
            </>
          ) : (
            <>
              <span>Start Trading with AI</span>
              <ChevronRight className="h-4 w-4" />
            </>
          )}
        </button>
        
        <p className="text-sm text-slate-500">
          You can always modify these settings later in your profile.
        </p>
      </div>
    </div>
  );

  const renderCurrentStep = () => {
    switch (currentStep) {
      case 0: return renderWelcomeStep();
      case 1: return renderPersonalInfoStep();
      case 2: return renderGoalsStep();
      case 3: return renderPreferencesStep();
      case 4: return renderAISetupStep();
      case 5: return renderCompleteStep();
      default: return renderWelcomeStep();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Progress Header */}
      <div className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-sm font-bold text-blue-600">{currentStep + 1}</span>
              </div>
              <div>
                <h1 className="text-lg font-semibold text-slate-900">{steps[currentStep].title}</h1>
                <p className="text-sm text-slate-600">{steps[currentStep].subtitle}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-sm text-slate-600">
                Step {currentStep + 1} of {steps.length}
              </div>
              <div className="w-32 bg-slate-200 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                  style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Step Indicators */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-center mb-12">
          {steps.map((step, index) => (
            <div key={step.id} className="flex items-center">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all ${
                index <= currentStep
                  ? 'border-blue-500 bg-blue-500 text-white'
                  : 'border-slate-300 bg-white text-slate-400'
              }`}>
                {completedSteps.includes(index) ? (
                  <CheckCircle className="h-5 w-5" />
                ) : (
                  <span className="text-sm font-medium">{index + 1}</span>
                )}
              </div>
              {index < steps.length - 1 && (
                <div className={`w-16 h-0.5 mx-2 transition-all ${
                  index < currentStep ? 'bg-blue-500' : 'bg-slate-300'
                }`}></div>
              )}
            </div>
          ))}
        </div>

        {/* Step Content */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 mb-8">
          {renderCurrentStep()}
        </div>

        {/* Navigation */}
        {currentStep < steps.length - 1 && (
          <div className="flex items-center justify-between">
            <button
              onClick={prevStep}
              disabled={currentStep === 0}
              className="flex items-center space-x-2 px-6 py-2 border border-slate-300 text-slate-700 rounded-lg font-medium hover:bg-slate-50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
              <span>Previous</span>
            </button>
            
            <button
              onClick={nextStep}
              disabled={!isStepValid()}
              className="flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{currentStep === 0 ? 'Get Started' : 'Continue'}</span>
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default OnboardingFlow;