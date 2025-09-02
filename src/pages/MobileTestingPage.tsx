import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Play, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Clock, 
  RefreshCw, 
  Download, 
  Eye, 
  EyeOff,
  Smartphone,
  Wifi,
  Battery,
  Zap,
  Database,
  Settings
} from 'lucide-react';
import { mobileTester, TestSuite, TestResult, runQuickTest } from '../utils/mobileTestingUtils';
import { MobilePerformanceDashboard } from '../components/mobile/MobilePerformanceDashboard';
import { NavigationHaptics } from '../utils/hapticFeedback';

interface TestCategory {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  testFunction: () => Promise<void>;
}

export const MobileTestingPage: React.FC = () => {
  const [testResults, setTestResults] = useState<TestSuite[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [currentTest, setCurrentTest] = useState<string | null>(null);
  const [showDetails, setShowDetails] = useState<{ [key: string]: boolean }>({});
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [showPerformanceDashboard, setShowPerformanceDashboard] = useState(false);

  const testCategories: TestCategory[] = [
    {
      id: 'haptics',
      name: 'Haptic Feedback',
      description: 'Test vibration patterns and haptic responses',
      icon: <Smartphone className="w-5 h-5" />,
      testFunction: () => mobileTester.testHapticFeedback()
    },
    {
      id: 'data',
      name: 'Data Management',
      description: 'Test caching, storage, and sync functionality',
      icon: <Database className="w-5 h-5" />,
      testFunction: () => mobileTester.testDataManagement()
    },
    {
      id: 'performance',
      name: 'Performance Monitoring',
      description: 'Test battery, network, and performance optimization',
      icon: <Zap className="w-5 h-5" />,
      testFunction: () => mobileTester.testPerformanceMonitoring()
    },
    {
      id: 'responsive',
      name: 'Responsive Design',
      description: 'Test viewport, breakpoints, and touch support',
      icon: <Settings className="w-5 h-5" />,
      testFunction: () => mobileTester.testResponsiveDesign()
    },
    {
      id: 'pwa',
      name: 'PWA Features',
      description: 'Test service worker, manifest, and offline capabilities',
      icon: <Wifi className="w-5 h-5" />,
      testFunction: () => mobileTester.testPWAFeatures()
    }
  ];

  useEffect(() => {
    // Load any existing test results
    const savedResults = localStorage.getItem('mobile-test-results');
    if (savedResults) {
      try {
        setTestResults(JSON.parse(savedResults));
      } catch (error) {
        console.error('Failed to load saved test results:', error);
      }
    }
  }, []);

  const saveResults = (results: TestSuite[]) => {
    localStorage.setItem('mobile-test-results', JSON.stringify(results));
  };

  const runAllTests = async () => {
    await NavigationHaptics.buttonPress();
    setIsRunning(true);
    setCurrentTest('all');
    mobileTester.clearResults();
    
    try {
      const results = await mobileTester.runAllTests();
      setTestResults(results);
      saveResults(results);
      console.log(mobileTester.generateReport());
    } catch (error) {
      console.error('Test execution failed:', error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const runSingleTest = async (category: TestCategory) => {
    await NavigationHaptics.buttonPress();
    setIsRunning(true);
    setCurrentTest(category.id);
    
    try {
      await category.testFunction();
      const allResults = mobileTester.getResults();
      setTestResults(allResults);
      saveResults(allResults);
    } catch (error) {
      console.error(`Test ${category.name} failed:`, error);
    } finally {
      setIsRunning(false);
      setCurrentTest(null);
    }
  };

  const toggleDetails = async (suiteId: string) => {
    await NavigationHaptics.tap();
    setShowDetails(prev => ({
      ...prev,
      [suiteId]: !prev[suiteId]
    }));
  };

  const downloadReport = async () => {
    await NavigationHaptics.buttonPress();
    const report = mobileTester.generateReport();
    const blob = new Blob([report], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `mobile-test-report-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const clearResults = async () => {
    await NavigationHaptics.buttonPress();
    mobileTester.clearResults();
    setTestResults([]);
    localStorage.removeItem('mobile-test-results');
  };

  const getStatusIcon = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'fail':
        return <XCircle className="w-4 h-4 text-red-500" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
    }
  };

  const getStatusColor = (status: 'pass' | 'fail' | 'warning') => {
    switch (status) {
      case 'pass':
        return 'text-green-600 bg-green-50 border-green-200 dark:bg-green-900/20 dark:border-green-800';
      case 'fail':
        return 'text-red-600 bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-800';
      case 'warning':
        return 'text-yellow-600 bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-800';
    }
  };

  const getTotalStats = () => {
    const total = testResults.reduce((sum, suite) => sum + suite.tests.length, 0);
    const passed = testResults.reduce((sum, suite) => sum + suite.passed, 0);
    const failed = testResults.reduce((sum, suite) => sum + suite.failed, 0);
    const warnings = testResults.reduce((sum, suite) => sum + suite.warnings, 0);
    const duration = testResults.reduce((sum, suite) => sum + suite.duration, 0);
    
    return { total, passed, failed, warnings, duration };
  };

  const stats = getTotalStats();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <motion.div
          className="text-center space-y-4"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            📱 Mobile Optimization Testing
          </h1>
          <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
            Comprehensive testing suite for mobile optimization features including haptic feedback, 
            performance monitoring, data management, responsive design, and PWA capabilities.
          </p>
        </motion.div>

        {/* Control Panel */}
        <motion.div
          className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-2">
              <motion.button
                onClick={runAllTests}
                disabled={isRunning}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                {isRunning && currentTest === 'all' ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                <span>Run All Tests</span>
              </motion.button>
              
              <motion.button
                onClick={() => setShowPerformanceDashboard(!showPerformanceDashboard)}
                className="px-4 py-3 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Battery className="w-4 h-4" />
                <span>Performance</span>
              </motion.button>
            </div>
            
            <div className="flex gap-2">
              {testResults.length > 0 && (
                <>
                  <motion.button
                    onClick={downloadReport}
                    className="px-4 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors flex items-center space-x-2"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <Download className="w-4 h-4" />
                    <span>Export</span>
                  </motion.button>
                  
                  <motion.button
                    onClick={clearResults}
                    className="px-4 py-3 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Clear
                  </motion.button>
                </>
              )}
            </div>
          </div>
        </motion.div>

        {/* Performance Dashboard */}
        <AnimatePresence>
          {showPerformanceDashboard && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <MobilePerformanceDashboard className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700" />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Test Categories */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {testCategories.map((category, index) => (
            <motion.div
              key={category.id}
              className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.2 + index * 0.05 }}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                    {category.icon}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
                
                {isRunning && currentTest === category.id && (
                  <RefreshCw className="w-4 h-4 animate-spin text-blue-500" />
                )}
              </div>
              
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                {category.description}
              </p>
              
              <motion.button
                onClick={() => runSingleTest(category)}
                disabled={isRunning}
                className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Run Test
              </motion.button>
            </motion.div>
          ))}
        </div>

        {/* Test Results Summary */}
        {testResults.length > 0 && (
          <motion.div
            className="bg-white dark:bg-gray-800 rounded-xl p-6 border border-gray-200 dark:border-gray-700"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
              Test Results Summary
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 dark:text-white">
                  {stats.total}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tests</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {stats.passed}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Passed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {stats.failed}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Failed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">
                  {stats.warnings}
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Warnings</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {stats.duration}ms
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Duration</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-6">
              <div
                className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-500"
                style={{ width: `${stats.total > 0 ? (stats.passed / stats.total) * 100 : 0}%` }}
              />
            </div>
          </motion.div>
        )}

        {/* Detailed Test Results */}
        {testResults.map((suite, suiteIndex) => (
          <motion.div
            key={`${suite.name}-${suiteIndex}`}
            className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: suiteIndex * 0.1 }}
          >
            <div 
              className="p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              onClick={() => toggleDetails(suite.name)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {suite.name}
                  </h3>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm text-green-600">{suite.passed} passed</span>
                    {suite.failed > 0 && (
                      <span className="text-sm text-red-600">{suite.failed} failed</span>
                    )}
                    {suite.warnings > 0 && (
                      <span className="text-sm text-yellow-600">{suite.warnings} warnings</span>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-gray-400">
                    <Clock className="w-4 h-4" />
                    <span>{suite.duration}ms</span>
                  </div>
                  
                  {showDetails[suite.name] ? (
                    <EyeOff className="w-4 h-4 text-gray-400" />
                  ) : (
                    <Eye className="w-4 h-4 text-gray-400" />
                  )}
                </div>
              </div>
            </div>
            
            <AnimatePresence>
              {showDetails[suite.name] && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  className="border-t border-gray-200 dark:border-gray-700"
                >
                  <div className="p-4 space-y-3">
                    {suite.tests.map((test, testIndex) => (
                      <div
                        key={`${test.name}-${testIndex}`}
                        className={`p-3 rounded-lg border ${getStatusColor(test.status)}`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start space-x-3">
                            {getStatusIcon(test.status)}
                            <div>
                              <div className="font-medium">{test.name}</div>
                              <div className="text-sm opacity-80">{test.message}</div>
                              {test.duration && (
                                <div className="text-xs opacity-60 mt-1">
                                  Duration: {test.duration}ms
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {test.details && (
                          <details className="mt-2">
                            <summary className="text-xs cursor-pointer opacity-60 hover:opacity-80">
                              Show Details
                            </summary>
                            <pre className="text-xs mt-2 p-2 bg-gray-100 dark:bg-gray-700 rounded overflow-x-auto">
                              {JSON.stringify(test.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        ))}
        
        {/* Empty State */}
        {testResults.length === 0 && !isRunning && (
          <motion.div
            className="text-center py-12 text-gray-500 dark:text-gray-400"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <Smartphone className="w-16 h-16 mx-auto mb-4 opacity-50" />
            <p className="text-lg mb-2">No test results yet</p>
            <p>Run some tests to see the results here</p>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default MobileTestingPage;