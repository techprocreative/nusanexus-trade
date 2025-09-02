import { NavigationHaptics, TradingHaptics, ChartHaptics } from './hapticFeedback';
import { mobileDataManager } from './mobileDataManager';
import { 
  batteryMonitor, 
  networkMonitor, 
  performanceMonitor,
  optimizeImageForConditions,
  measurePerformance
} from './mobilePerformance';

export interface TestResult {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  duration?: number;
  details?: any;
}

export interface TestSuite {
  name: string;
  tests: TestResult[];
  passed: number;
  failed: number;
  warnings: number;
  duration: number;
}

export class MobileTester {
  private results: TestSuite[] = [];
  private currentSuite: TestSuite | null = null;

  // Start a new test suite
  startSuite(name: string): void {
    this.currentSuite = {
      name,
      tests: [],
      passed: 0,
      failed: 0,
      warnings: 0,
      duration: Date.now()
    };
  }

  // End current test suite
  endSuite(): TestSuite | null {
    if (!this.currentSuite) return null;
    
    this.currentSuite.duration = Date.now() - this.currentSuite.duration;
    this.results.push(this.currentSuite);
    
    const suite = this.currentSuite;
    this.currentSuite = null;
    return suite;
  }

  // Add test result to current suite
  private addResult(result: TestResult): void {
    if (!this.currentSuite) {
      throw new Error('No active test suite. Call startSuite() first.');
    }
    
    this.currentSuite.tests.push(result);
    
    switch (result.status) {
      case 'pass':
        this.currentSuite.passed++;
        break;
      case 'fail':
        this.currentSuite.failed++;
        break;
      case 'warning':
        this.currentSuite.warnings++;
        break;
    }
  }

  // Test haptic feedback functionality
  async testHapticFeedback(): Promise<void> {
    this.startSuite('Haptic Feedback Tests');
    
    try {
      // Test navigation haptics
      const navStart = Date.now();
      await NavigationHaptics.buttonPress();
      this.addResult({
        name: 'Navigation Button Press',
        status: 'pass',
        message: 'Navigation haptic feedback executed successfully',
        duration: Date.now() - navStart
      });
      
      await NavigationHaptics.tap();
      this.addResult({
        name: 'Navigation Tap',
        status: 'pass',
        message: 'Navigation tap haptic executed successfully'
      });
      
      await NavigationHaptics.swipe();
      this.addResult({
        name: 'Navigation Swipe',
        status: 'pass',
        message: 'Navigation swipe haptic executed successfully'
      });
      
      // Test trading haptics
      await TradingHaptics.orderPlaced();
      this.addResult({
        name: 'Trading Order Placed',
        status: 'pass',
        message: 'Trading order placed haptic executed successfully'
      });
      
      await TradingHaptics.orderFilled();
      this.addResult({
        name: 'Trading Order Filled',
        status: 'pass',
        message: 'Trading order filled haptic executed successfully'
      });
      
      await TradingHaptics.orderRejected();
      this.addResult({
        name: 'Trading Order Rejected',
        status: 'pass',
        message: 'Trading order rejected haptic executed successfully'
      });
      
      // Test chart haptics
      await ChartHaptics.dataPoint();
      this.addResult({
        name: 'Chart Data Point',
        status: 'pass',
        message: 'Chart data point haptic executed successfully'
      });
      
      await ChartHaptics.priceAlert();
      this.addResult({
        name: 'Chart Price Alert',
        status: 'pass',
        message: 'Chart price alert haptic executed successfully'
      });
      
    } catch (error) {
      this.addResult({
        name: 'Haptic Feedback Error',
        status: 'fail',
        message: `Haptic feedback test failed: ${error}`,
        details: error
      });
    }
    
    this.endSuite();
  }

  // Test mobile data management
  async testDataManagement(): Promise<void> {
    this.startSuite('Data Management Tests');
    
    try {
      // Test cache operations
      const testData = { test: 'data', timestamp: Date.now() };
      const cacheStart = Date.now();
      
      await mobileDataManager.set('test-key', testData, { ttl: 60000 });
      this.addResult({
        name: 'Cache Set Operation',
        status: 'pass',
        message: 'Data cached successfully',
        duration: Date.now() - cacheStart
      });
      
      const retrieveStart = Date.now();
      const cachedData = await mobileDataManager.get('test-key');
      
      if (cachedData && JSON.stringify(cachedData) === JSON.stringify(testData)) {
        this.addResult({
          name: 'Cache Get Operation',
          status: 'pass',
          message: 'Data retrieved successfully from cache',
          duration: Date.now() - retrieveStart
        });
      } else {
        this.addResult({
          name: 'Cache Get Operation',
          status: 'fail',
          message: 'Retrieved data does not match cached data',
          details: { expected: testData, actual: cachedData }
        });
      }
      
      // Test cache expiration
      await mobileDataManager.set('expire-test', testData, { ttl: 1 });
      await new Promise(resolve => setTimeout(resolve, 10));
      
      const expiredData = await mobileDataManager.get('expire-test');
      if (expiredData === null) {
        this.addResult({
          name: 'Cache Expiration',
          status: 'pass',
          message: 'Cache expiration working correctly'
        });
      } else {
        this.addResult({
          name: 'Cache Expiration',
          status: 'warning',
          message: 'Cache expiration may not be working as expected',
          details: { expiredData }
        });
      }
      
      // Test storage quota
      const quota = await mobileDataManager.getStorageQuota();
      if (quota) {
        this.addResult({
          name: 'Storage Quota Check',
          status: 'pass',
          message: `Storage quota available: ${(quota.available / (1024 * 1024)).toFixed(2)} MB`,
          details: quota
        });
      } else {
        this.addResult({
          name: 'Storage Quota Check',
          status: 'warning',
          message: 'Storage quota information not available'
        });
      }
      
      // Test sync queue
      mobileDataManager.addToSyncQueue({
        action: 'create',
        table: 'test-sync',
        data: { data: 'sync-test' }
      });
      const queueLength = mobileDataManager.getSyncQueueLength();
      
      if (queueLength > 0) {
        this.addResult({
          name: 'Sync Queue Operation',
          status: 'pass',
          message: `Sync queue working, ${queueLength} items queued`
        });
      } else {
        this.addResult({
          name: 'Sync Queue Operation',
          status: 'warning',
          message: 'Sync queue may not be working correctly'
        });
      }
      
    } catch (error) {
      this.addResult({
        name: 'Data Management Error',
        status: 'fail',
        message: `Data management test failed: ${error}`,
        details: error
      });
    }
    
    this.endSuite();
  }

  // Test performance monitoring
  async testPerformanceMonitoring(): Promise<void> {
    this.startSuite('Performance Monitoring Tests');
    
    try {
      // Test performance measurement
      const testOperation = () => {
        // Simulate some work
        const start = Date.now();
        while (Date.now() - start < 10) {
          // Busy wait for 10ms
        }
        return 'test-result';
      };
      
      const result = await measurePerformance('test-operation', testOperation);
      
      if (result.result === 'test-result') {
        this.addResult({
          name: 'Performance Measurement',
          status: 'pass',
          message: 'Performance measurement working correctly'
        });
      } else {
        this.addResult({
          name: 'Performance Measurement',
          status: 'fail',
          message: 'Performance measurement returned unexpected result',
          details: { expected: 'test-result', actual: result }
        });
      }
      
      // Test battery monitoring
      const batteryInfo = await batteryMonitor.getBatteryInfo();
      if (batteryInfo) {
        this.addResult({
          name: 'Battery Monitoring',
          status: 'pass',
          message: `Battery level: ${(batteryInfo.level * 100).toFixed(0)}%, Charging: ${batteryInfo.charging}`,
          details: batteryInfo
        });
      } else {
        this.addResult({
          name: 'Battery Monitoring',
          status: 'warning',
          message: 'Battery API not supported on this device'
        });
      }
      
      // Test network monitoring
      const networkInfo = networkMonitor.getNetworkInfo();
      this.addResult({
        name: 'Network Monitoring',
        status: 'pass',
        message: `Network type: ${networkInfo.type}, Online: ${networkInfo.online}`,
        details: networkInfo
      });
      
      // Test image optimization
      const optimizedImage = optimizeImageForConditions(
        'https://example.com/test-image.jpg'
      );
      
      if (optimizedImage.includes('test-image')) {
        this.addResult({
          name: 'Image Optimization',
          status: 'pass',
          message: 'Image optimization working correctly',
          details: { optimizedUrl: optimizedImage }
        });
      } else {
        this.addResult({
          name: 'Image Optimization',
          status: 'warning',
          message: 'Image optimization may not be working as expected',
          details: { optimizedUrl: optimizedImage }
        });
      }
      
    } catch (error) {
      this.addResult({
        name: 'Performance Monitoring Error',
        status: 'fail',
        message: `Performance monitoring test failed: ${error}`,
        details: error
      });
    }
    
    this.endSuite();
  }

  // Test responsive design
  async testResponsiveDesign(): Promise<void> {
    this.startSuite('Responsive Design Tests');
    
    try {
      // Test viewport dimensions
      const viewport = {
        width: window.innerWidth,
        height: window.innerHeight,
        devicePixelRatio: window.devicePixelRatio || 1
      };
      
      this.addResult({
        name: 'Viewport Detection',
        status: 'pass',
        message: `Viewport: ${viewport.width}x${viewport.height}, DPR: ${viewport.devicePixelRatio}`,
        details: viewport
      });
      
      // Test breakpoint detection
      const breakpoints = {
        sm: viewport.width >= 640,
        md: viewport.width >= 768,
        lg: viewport.width >= 1024,
        xl: viewport.width >= 1280
      };
      
      const activeBreakpoint = Object.entries(breakpoints)
        .filter(([_, active]) => active)
        .map(([name]) => name)
        .pop() || 'xs';
      
      this.addResult({
        name: 'Breakpoint Detection',
        status: 'pass',
        message: `Active breakpoint: ${activeBreakpoint}`,
        details: breakpoints
      });
      
      // Test touch support
      const touchSupported = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      
      this.addResult({
        name: 'Touch Support Detection',
        status: touchSupported ? 'pass' : 'warning',
        message: touchSupported ? 'Touch events supported' : 'Touch events not supported',
        details: { maxTouchPoints: navigator.maxTouchPoints }
      });
      
      // Test orientation support
      const orientation = screen.orientation?.type || 'unknown';
      
      this.addResult({
        name: 'Orientation Detection',
        status: 'pass',
        message: `Current orientation: ${orientation}`,
        details: { orientation, angle: screen.orientation?.angle }
      });
      
    } catch (error) {
      this.addResult({
        name: 'Responsive Design Error',
        status: 'fail',
        message: `Responsive design test failed: ${error}`,
        details: error
      });
    }
    
    this.endSuite();
  }

  // Test PWA features
  async testPWAFeatures(): Promise<void> {
    this.startSuite('PWA Features Tests');
    
    try {
      // Test service worker
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.getRegistration();
        
        if (registration) {
          this.addResult({
            name: 'Service Worker Registration',
            status: 'pass',
            message: 'Service worker is registered and active',
            details: { scope: registration.scope, state: registration.active?.state }
          });
        } else {
          this.addResult({
            name: 'Service Worker Registration',
            status: 'warning',
            message: 'Service worker not registered'
          });
        }
      } else {
        this.addResult({
          name: 'Service Worker Support',
          status: 'warning',
          message: 'Service worker not supported'
        });
      }
      
      // Test web app manifest
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      
      if (manifestLink) {
        this.addResult({
          name: 'Web App Manifest',
          status: 'pass',
          message: 'Web app manifest linked',
          details: { href: manifestLink.href }
        });
      } else {
        this.addResult({
          name: 'Web App Manifest',
          status: 'warning',
          message: 'Web app manifest not found'
        });
      }
      
      // Test offline capability
      const isOnline = navigator.onLine;
      
      this.addResult({
        name: 'Online Status Detection',
        status: 'pass',
        message: `Device is ${isOnline ? 'online' : 'offline'}`,
        details: { online: isOnline }
      });
      
      // Test notification support
      if ('Notification' in window) {
        const permission = Notification.permission;
        
        this.addResult({
          name: 'Push Notification Support',
          status: 'pass',
          message: `Notification permission: ${permission}`,
          details: { permission }
        });
      } else {
        this.addResult({
          name: 'Push Notification Support',
          status: 'warning',
          message: 'Push notifications not supported'
        });
      }
      
    } catch (error) {
      this.addResult({
        name: 'PWA Features Error',
        status: 'fail',
        message: `PWA features test failed: ${error}`,
        details: error
      });
    }
    
    this.endSuite();
  }

  // Run all tests
  async runAllTests(): Promise<TestSuite[]> {
    console.log('🧪 Starting mobile optimization tests...');
    
    await this.testHapticFeedback();
    await this.testDataManagement();
    await this.testPerformanceMonitoring();
    await this.testResponsiveDesign();
    await this.testPWAFeatures();
    
    return this.getResults();
  }

  // Get all test results
  getResults(): TestSuite[] {
    return [...this.results];
  }

  // Generate test report
  generateReport(): string {
    const totalTests = this.results.reduce((sum, suite) => sum + suite.tests.length, 0);
    const totalPassed = this.results.reduce((sum, suite) => sum + suite.passed, 0);
    const totalFailed = this.results.reduce((sum, suite) => sum + suite.failed, 0);
    const totalWarnings = this.results.reduce((sum, suite) => sum + suite.warnings, 0);
    const totalDuration = this.results.reduce((sum, suite) => sum + suite.duration, 0);
    
    let report = `
📱 Mobile Optimization Test Report
${'='.repeat(50)}
`;
    report += `Total Tests: ${totalTests}\n`;
    report += `✅ Passed: ${totalPassed}\n`;
    report += `❌ Failed: ${totalFailed}\n`;
    report += `⚠️  Warnings: ${totalWarnings}\n`;
    report += `⏱️  Duration: ${totalDuration}ms\n\n`;
    
    this.results.forEach(suite => {
      report += `📋 ${suite.name}\n`;
      report += `${'─'.repeat(30)}\n`;
      report += `Tests: ${suite.tests.length} | Passed: ${suite.passed} | Failed: ${suite.failed} | Warnings: ${suite.warnings}\n`;
      report += `Duration: ${suite.duration}ms\n\n`;
      
      suite.tests.forEach(test => {
        const icon = test.status === 'pass' ? '✅' : test.status === 'fail' ? '❌' : '⚠️';
        report += `  ${icon} ${test.name}: ${test.message}\n`;
        if (test.duration) {
          report += `     Duration: ${test.duration}ms\n`;
        }
      });
      
      report += '\n';
    });
    
    return report;
  }

  // Clear all results
  clearResults(): void {
    this.results = [];
    this.currentSuite = null;
  }
}

// Export singleton instance
export const mobileTester = new MobileTester();

// Utility functions for quick testing
export const runQuickTest = async (): Promise<void> => {
  const results = await mobileTester.runAllTests();
  console.log(mobileTester.generateReport());
  return;
};

export const testHapticsOnly = async (): Promise<TestSuite | null> => {
  await mobileTester.testHapticFeedback();
  const results = mobileTester.getResults();
  return results[results.length - 1] || null;
};

export const testPerformanceOnly = async (): Promise<TestSuite | null> => {
  await mobileTester.testPerformanceMonitoring();
  const results = mobileTester.getResults();
  return results[results.length - 1] || null;
};

export default mobileTester;