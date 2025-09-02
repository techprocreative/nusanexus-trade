import React, { useState, useEffect } from 'react';
import { useAIStrategyStore } from '../store/useAIStrategyStore';
import { mockImplementationSteps } from '../data/aiStrategyMockData';
import { 
  Settings, 
  CheckCircle, 
  Circle, 
  AlertTriangle, 
  Clock, 
  Play, 
  Pause, 
  RotateCcw, 
  Download, 
  Code, 
  FileText, 
  Monitor, 
  TrendingUp,
  ChevronRight,
  ChevronDown,
  Info,
  ExternalLink
} from 'lucide-react';

interface StepProgress {
  stepId: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  startTime?: Date;
  completedTime?: Date;
  notes?: string;
}

const ImplementationAssistant: React.FC = () => {
  const { implementationSteps, setImplementationSteps, strategies } = useAIStrategyStore();
  const [selectedStrategy, setSelectedStrategy] = useState<string>('');
  const [stepProgress, setStepProgress] = useState<StepProgress[]>([]);
  const [activeStep, setActiveStep] = useState<string | null>(null);
  const [expandedSteps, setExpandedSteps] = useState<string[]>([]);
  const [implementationMode, setImplementationMode] = useState<'guided' | 'manual'>('guided');
  const [showCode, setShowCode] = useState<string | null>(null);

  useEffect(() => {
    if (implementationSteps.length === 0) {
      setImplementationSteps(mockImplementationSteps);
    }
  }, [implementationSteps.length, setImplementationSteps]);

  useEffect(() => {
    if (selectedStrategy && implementationSteps && implementationSteps.length > 0) {
      const strategySteps = implementationSteps.filter(step => step.strategyId === selectedStrategy);
      const initialProgress = strategySteps.map(step => ({
        stepId: step.id,
        status: 'pending' as const
      }));
      setStepProgress(initialProgress);
    }
  }, [selectedStrategy, implementationSteps]);

  const getStepsByStrategy = (strategyId: string) => {
    return implementationSteps.filter(step => step.strategyId === strategyId);
  };

  const getStepProgress = (stepId: string) => {
    return stepProgress.find(p => p.stepId === stepId);
  };

  const updateStepProgress = (stepId: string, updates: Partial<StepProgress>) => {
    setStepProgress(prev => 
      prev.map(p => 
        p.stepId === stepId 
          ? { ...p, ...updates }
          : p
      )
    );
  };

  const startStep = (stepId: string) => {
    updateStepProgress(stepId, {
      status: 'in_progress',
      startTime: new Date()
    });
    setActiveStep(stepId);
  };

  const completeStep = (stepId: string) => {
    updateStepProgress(stepId, {
      status: 'completed',
      completedTime: new Date()
    });
    setActiveStep(null);
  };

  const failStep = (stepId: string, notes?: string) => {
    updateStepProgress(stepId, {
      status: 'failed',
      notes
    });
    setActiveStep(null);
  };

  const resetStep = (stepId: string) => {
    updateStepProgress(stepId, {
      status: 'pending',
      startTime: undefined,
      completedTime: undefined,
      notes: undefined
    });
  };

  const toggleStepExpansion = (stepId: string) => {
    setExpandedSteps(prev => 
      prev.includes(stepId)
        ? prev.filter(id => id !== stepId)
        : [...prev, stepId]
    );
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-600" />;
      case 'in_progress':
        return <Clock className="h-5 w-5 text-blue-600 animate-pulse" />;
      case 'failed':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      default:
        return <Circle className="h-5 w-5 text-slate-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'border-green-200 bg-green-50';
      case 'in_progress':
        return 'border-blue-200 bg-blue-50';
      case 'failed':
        return 'border-red-200 bg-red-50';
      default:
        return 'border-slate-200 bg-white';
    }
  };

  const getOverallProgress = () => {
    if (stepProgress.length === 0) return 0;
    const completed = stepProgress.filter(p => p.status === 'completed').length;
    return Math.round((completed / stepProgress.length) * 100);
  };

  const getEstimatedTime = () => {
    if (!selectedStrategy) return 0;
    const steps = getStepsByStrategy(selectedStrategy);
    return steps.reduce((total, step) => total + step.estimatedTime, 0);
  };

  const getCurrentStep = () => {
    const inProgress = stepProgress.find(p => p.status === 'in_progress');
    if (inProgress) {
      return implementationSteps.find(s => s.id === inProgress.stepId);
    }
    
    const nextPending = stepProgress.find(p => p.status === 'pending');
    if (nextPending) {
      return implementationSteps.find(s => s.id === nextPending.stepId);
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-4">
              <Settings className="h-8 w-8 text-blue-600" />
              <h1 className="text-2xl font-bold text-slate-900">Implementation Assistant</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setImplementationMode('guided')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    implementationMode === 'guided'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Guided
                </button>
                <button
                  onClick={() => setImplementationMode('manual')}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    implementationMode === 'manual'
                      ? 'bg-blue-100 text-blue-700'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Manual
                </button>
              </div>
              
              {selectedStrategy && (
                <div className="flex items-center space-x-2 px-3 py-1 bg-green-50 text-green-700 rounded-full text-sm font-medium">
                  <TrendingUp className="h-4 w-4" />
                  <span>{getOverallProgress()}% Complete</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Strategy Selection */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
          <h2 className="text-lg font-semibold text-slate-900 mb-4">Select Strategy to Implement</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {strategies.slice(0, 3).map(strategy => (
              <button
                key={strategy.id}
                onClick={() => setSelectedStrategy(strategy.id)}
                className={`p-4 rounded-lg border-2 text-left transition-all ${
                  selectedStrategy === strategy.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <h3 className="font-semibold text-slate-900 mb-2">{strategy.name}</h3>
                <p className="text-sm text-slate-600 mb-3">{strategy.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-500">
                    {getStepsByStrategy(strategy.id).length} steps
                  </span>
                  <span className="text-xs text-slate-500">
                    ~{getStepsByStrategy(strategy.id).reduce((total, step) => total + step.estimatedTime, 0)} min
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        {selectedStrategy && (
          <>
            {/* Progress Overview */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900">Implementation Progress</h2>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-slate-600">
                    {stepProgress.filter(p => p.status === 'completed').length} of {stepProgress.length} steps completed
                  </span>
                  <span className="text-sm text-slate-600">
                    Est. {getEstimatedTime()} minutes total
                  </span>
                </div>
              </div>
              
              <div className="w-full bg-slate-200 rounded-full h-3 mb-4">
                <div 
                  className="bg-blue-600 h-3 rounded-full transition-all duration-300" 
                  style={{ width: `${getOverallProgress()}%` }}
                ></div>
              </div>
              
              <div className="grid grid-cols-4 gap-4 text-center">
                <div>
                  <div className="text-2xl font-bold text-slate-900">
                    {stepProgress.filter(p => p.status === 'pending').length}
                  </div>
                  <div className="text-sm text-slate-600">Pending</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-blue-600">
                    {stepProgress.filter(p => p.status === 'in_progress').length}
                  </div>
                  <div className="text-sm text-slate-600">In Progress</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-green-600">
                    {stepProgress.filter(p => p.status === 'completed').length}
                  </div>
                  <div className="text-sm text-slate-600">Completed</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-red-600">
                    {stepProgress.filter(p => p.status === 'failed').length}
                  </div>
                  <div className="text-sm text-slate-600">Failed</div>
                </div>
              </div>
            </div>

            {/* Current Step Highlight */}
            {getCurrentStep() && (
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl border border-blue-200 p-6 mb-8">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">
                      Current Step: {getCurrentStep()?.title}
                    </h3>
                    <p className="text-slate-600 mb-4">{getCurrentStep()?.description}</p>
                    <div className="flex items-center space-x-4">
                      <button 
                        onClick={() => startStep(getCurrentStep()!.id)}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center space-x-2"
                      >
                        <Play className="h-4 w-4" />
                        <span>Start Step</span>
                      </button>
                      <span className="text-sm text-slate-600">
                        Est. {getCurrentStep()?.estimatedTime} minutes
                      </span>
                    </div>
                  </div>
                  <div className="hidden md:block">
                    <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                      <ChevronRight className="h-8 w-8 text-blue-600" />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Implementation Steps */}
            <div className="space-y-4">
              <h2 className="text-xl font-bold text-slate-900">Implementation Steps</h2>
              
              {getStepsByStrategy(selectedStrategy).map((step, index) => {
                const progress = getStepProgress(step.id);
                const isExpanded = expandedSteps.includes(step.id);
                const isActive = activeStep === step.id;
                
                return (
                  <div 
                    key={step.id} 
                    className={`rounded-xl border-2 transition-all ${
                      isActive ? 'border-blue-500 shadow-lg' : getStatusColor(progress?.status || 'pending')
                    }`}
                  >
                    <div className="p-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center space-x-2">
                            <span className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-sm font-medium">
                              {index + 1}
                            </span>
                            {getStatusIcon(progress?.status || 'pending')}
                          </div>
                          
                          <div>
                            <h3 className="font-semibold text-slate-900">{step.title}</h3>
                            <p className="text-sm text-slate-600">{step.description}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <span className="text-xs text-slate-500 px-2 py-1 bg-slate-100 rounded-full">
                            {step.estimatedTime} min
                          </span>
                          <span className={`text-xs px-2 py-1 rounded-full ${
                            step.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            step.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {step.difficulty}
                          </span>
                          <button
                            onClick={() => toggleStepExpansion(step.id)}
                            className="p-1 hover:bg-slate-100 rounded"
                          >
                            {isExpanded ? 
                              <ChevronDown className="h-4 w-4" /> : 
                              <ChevronRight className="h-4 w-4" />
                            }
                          </button>
                        </div>
                      </div>
                      
                      {/* Step Actions */}
                      <div className="flex items-center space-x-2 mt-4">
                        {progress?.status === 'pending' && (
                          <button
                            onClick={() => startStep(step.id)}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-blue-700 transition-colors"
                          >
                            Start
                          </button>
                        )}
                        
                        {progress?.status === 'in_progress' && (
                          <>
                            <button
                              onClick={() => completeStep(step.id)}
                              className="bg-green-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-green-700 transition-colors"
                            >
                              Complete
                            </button>
                            <button
                              onClick={() => failStep(step.id)}
                              className="bg-red-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-red-700 transition-colors"
                            >
                              Mark Failed
                            </button>
                          </>
                        )}
                        
                        {(progress?.status === 'completed' || progress?.status === 'failed') && (
                          <button
                            onClick={() => resetStep(step.id)}
                            className="bg-slate-600 text-white px-3 py-1 rounded text-sm font-medium hover:bg-slate-700 transition-colors flex items-center space-x-1"
                          >
                            <RotateCcw className="h-3 w-3" />
                            <span>Reset</span>
                          </button>
                        )}
                        
                        {step.codeExample && (
                          <button
                            onClick={() => setShowCode(showCode === step.id ? null : step.id)}
                            className="border border-slate-300 text-slate-700 px-3 py-1 rounded text-sm font-medium hover:bg-slate-50 transition-colors flex items-center space-x-1"
                          >
                            <Code className="h-3 w-3" />
                            <span>Code</span>
                          </button>
                        )}
                      </div>
                      
                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Instructions */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
                                <FileText className="h-4 w-4" />
                                <span>Instructions</span>
                              </h4>
                              <div className="space-y-2">
                                {step.instructions.map((instruction, idx) => (
                                  <div key={idx} className="flex items-start space-x-2">
                                    <span className="w-5 h-5 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-medium mt-0.5">
                                      {idx + 1}
                                    </span>
                                    <span className="text-sm text-slate-700">{instruction}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                            
                            {/* Resources */}
                            <div>
                              <h4 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
                                <Download className="h-4 w-4" />
                                <span>Resources</span>
                              </h4>
                              <div className="space-y-2">
                                {step.resources.map((resource, idx) => (
                                  <div key={idx} className="flex items-center space-x-2">
                                    <ExternalLink className="h-4 w-4 text-slate-400" />
                                    <a href="#" className="text-sm text-blue-600 hover:text-blue-700">
                                      {resource}
                                    </a>
                                  </div>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {/* Prerequisites */}
                          {step.prerequisites.length > 0 && (
                            <div className="mt-4">
                              <h4 className="font-medium text-slate-900 mb-2 flex items-center space-x-2">
                                <Info className="h-4 w-4" />
                                <span>Prerequisites</span>
                              </h4>
                              <div className="flex flex-wrap gap-2">
                                {step.prerequisites.map((prereq, idx) => (
                                  <span key={idx} className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs">
                                    {prereq}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}
                          
                          {/* Progress Notes */}
                          {progress?.notes && (
                            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                              <h4 className="font-medium text-yellow-800 mb-1">Notes</h4>
                              <p className="text-sm text-yellow-700">{progress.notes}</p>
                            </div>
                          )}
                        </div>
                      )}
                      
                      {/* Code Example */}
                      {showCode === step.id && step.codeExample && (
                        <div className="mt-6 pt-6 border-t border-slate-200">
                          <h4 className="font-medium text-slate-900 mb-3 flex items-center space-x-2">
                            <Code className="h-4 w-4" />
                            <span>Code Example</span>
                          </h4>
                          <div className="bg-slate-900 text-slate-100 p-4 rounded-lg overflow-x-auto">
                            <pre className="text-sm">
                              <code>{step.codeExample}</code>
                            </pre>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Completion Summary */}
            {getOverallProgress() === 100 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 rounded-xl border border-green-200 p-6 mt-8">
                <div className="text-center">
                  <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Implementation Complete!</h3>
                  <p className="text-slate-600 mb-6">
                    Congratulations! You have successfully implemented the {strategies.find(s => s.id === selectedStrategy)?.name} strategy.
                  </p>
                  <div className="flex items-center justify-center space-x-4">
                    <button className="bg-green-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-green-700 transition-colors">
                      Start Live Trading
                    </button>
                    <button className="border border-slate-300 text-slate-700 px-6 py-2 rounded-lg font-medium hover:bg-slate-50 transition-colors">
                      Run Backtest
                    </button>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* No Strategy Selected */}
        {!selectedStrategy && (
          <div className="text-center py-12">
            <Settings className="h-12 w-12 text-slate-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-slate-900 mb-2">Select a Strategy to Begin</h3>
            <p className="text-slate-600">Choose a strategy from above to start the guided implementation process.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImplementationAssistant;