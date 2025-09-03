/**
 * Haptic Feedback System for Mobile Trading Platform
 * Provides tactile feedback for user interactions, order execution, and alerts
 */

export interface HapticPattern {
  pattern: number[]; // Vibration pattern in milliseconds [vibrate, pause, vibrate, pause, ...]
  intensity?: 'light' | 'medium' | 'heavy';
}

export interface HapticConfig {
  enabled: boolean;
  intensity: 'light' | 'medium' | 'heavy';
  patterns: {
    [key: string]: HapticPattern;
  };
}

// Default haptic patterns for different interactions
const DEFAULT_PATTERNS: { [key: string]: HapticPattern } = {
  // Navigation feedback
  tap: { pattern: [10], intensity: 'light' },
  buttonPress: { pattern: [15], intensity: 'light' },
  swipe: { pattern: [8], intensity: 'light' },
  pullToRefresh: { pattern: [20, 50, 20], intensity: 'medium' },
  
  // Trading actions
  orderPlaced: { pattern: [50, 100, 50], intensity: 'medium' },
  orderFilled: { pattern: [100, 50, 100, 50, 100], intensity: 'heavy' },
  orderCancelled: { pattern: [200], intensity: 'medium' },
  orderRejected: { pattern: [300, 100, 300], intensity: 'heavy' },
  
  // Alerts and notifications
  priceAlert: { pattern: [100, 200, 100, 200, 100], intensity: 'heavy' },
  marginCall: { pattern: [500, 200, 500, 200, 500], intensity: 'heavy' },
  notification: { pattern: [50, 100, 50], intensity: 'medium' },
  warning: { pattern: [200, 100, 200], intensity: 'heavy' },
  error: { pattern: [300, 150, 300, 150, 300], intensity: 'heavy' },
  
  // UI feedback
  success: { pattern: [30, 50, 30], intensity: 'medium' },
  selection: { pattern: [5], intensity: 'light' },
  longPress: { pattern: [50], intensity: 'medium' },
  dragStart: { pattern: [20], intensity: 'light' },
  dragEnd: { pattern: [30], intensity: 'medium' },
  
  // Chart interactions
  chartZoom: { pattern: [8], intensity: 'light' },
  chartPan: { pattern: [5], intensity: 'light' },
  crosshairMove: { pattern: [3], intensity: 'light' },
  
  // Biometric authentication
  biometricSuccess: { pattern: [50, 100, 50], intensity: 'medium' },
  biometricFailure: { pattern: [200, 100, 200, 100, 200], intensity: 'heavy' },
};

class HapticFeedbackManager {
  private config: HapticConfig;
  private isSupported: boolean;
  private lastVibration: number = 0;
  private minInterval: number = 50; // Minimum time between vibrations (ms)

  constructor() {
    this.isSupported = this.checkHapticSupport();
    this.config = this.loadConfig();
  }

  /**
   * Check if haptic feedback is supported on the current device
   */
  private checkHapticSupport(): boolean {
    // Check for Vibration API support
    if ('vibrate' in navigator) {
      return true;
    }

    // Check for iOS haptic feedback (requires user gesture)
    if ('DeviceMotionEvent' in window && /iPhone|iPad|iPod/.test((navigator as any).userAgent)) {
      return true;
    }

    return false;
  }

  /**
   * Load haptic configuration from localStorage or use defaults
   */
  private loadConfig(): HapticConfig {
    try {
      const stored = localStorage.getItem('haptic-config');
      if (stored) {
        const config = JSON.parse(stored);
        return {
          enabled: config.enabled ?? true,
          intensity: config.intensity ?? 'medium',
          patterns: { ...DEFAULT_PATTERNS, ...config.patterns }
        };
      }
    } catch (error) {
      console.warn('Failed to load haptic config:', error);
    }

    return {
      enabled: true,
      intensity: 'medium',
      patterns: DEFAULT_PATTERNS
    };
  }

  /**
   * Save haptic configuration to localStorage
   */
  private saveConfig(): void {
    try {
      localStorage.setItem('haptic-config', JSON.stringify(this.config));
    } catch (error) {
      console.warn('Failed to save haptic config:', error);
    }
  }

  /**
   * Adjust vibration pattern based on intensity setting
   */
  private adjustPatternIntensity(pattern: number[], targetIntensity?: 'light' | 'medium' | 'heavy'): number[] {
    const intensity = targetIntensity || this.config.intensity;
    const multiplier = {
      light: 0.5,
      medium: 1.0,
      heavy: 1.5
    }[intensity];

    return pattern.map((duration, index) => {
      // Only adjust vibration durations (odd indices), not pauses (even indices)
      if (index % 2 === 0) {
        return Math.max(1, Math.round(duration * multiplier));
      }
      return duration;
    });
  }

  /**
   * Execute haptic feedback with the given pattern
   */
  private executeVibration(pattern: number[]): void {
    if (!this.isSupported || !this.config.enabled) {
      return;
    }

    // Throttle vibrations to prevent overwhelming the user
    const now = Date.now();
    if (now - this.lastVibration < this.minInterval) {
      return;
    }
    this.lastVibration = now;

    try {
      // Use Vibration API if available
      if ('vibrate' in navigator) {
        navigator.vibrate(pattern);
        return;
      }

      // Fallback for iOS devices (requires AudioContext for haptic simulation)
      if (/iPhone|iPad|iPod/.test((navigator as any).userAgent)) {
        this.simulateIOSHaptic(pattern);
      }
    } catch (error) {
      console.warn('Haptic feedback failed:', error);
    }
  }

  /**
   * Simulate haptic feedback on iOS devices using audio
   */
  private simulateIOSHaptic(pattern: number[]): void {
    try {
      // Create a brief, silent audio pulse to trigger iOS haptic feedback
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(20, audioContext.currentTime); // Very low frequency
      gainNode.gain.setValueAtTime(0.001, audioContext.currentTime); // Very low volume
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + pattern[0] / 1000);
      
      // Clean up
      setTimeout(() => {
        audioContext.close();
      }, pattern[0] + 100);
    } catch (error) {
      console.warn('iOS haptic simulation failed:', error);
    }
  }

  /**
   * Trigger haptic feedback for a specific interaction type
   */
  public trigger(type: string, customPattern?: HapticPattern): void {
    const pattern = customPattern || this.config.patterns[type];
    if (!pattern) {
      console.warn(`Unknown haptic pattern: ${type}`);
      return;
    }

    const adjustedPattern = this.adjustPatternIntensity(pattern.pattern, pattern.intensity);
    this.executeVibration(adjustedPattern);
  }

  /**
   * Trigger haptic feedback with a custom vibration pattern
   */
  public vibrate(pattern: number | number[]): void {
    if (!this.config.enabled) return;
    
    const vibrationPattern = Array.isArray(pattern) ? pattern : [pattern];
    const adjustedPattern = this.adjustPatternIntensity(vibrationPattern);
    this.executeVibration(adjustedPattern);
  }

  /**
   * Enable or disable haptic feedback
   */
  public setEnabled(enabled: boolean): void {
    this.config.enabled = enabled;
    this.saveConfig();
  }

  /**
   * Set haptic feedback intensity
   */
  public setIntensity(intensity: 'light' | 'medium' | 'heavy'): void {
    this.config.intensity = intensity;
    this.saveConfig();
  }

  /**
   * Add or update a haptic pattern
   */
  public setPattern(type: string, pattern: HapticPattern): void {
    this.config.patterns[type] = pattern;
    this.saveConfig();
  }

  /**
   * Get current haptic configuration
   */
  public getConfig(): HapticConfig {
    return { ...this.config };
  }

  /**
   * Check if haptic feedback is supported and enabled
   */
  public isEnabled(): boolean {
    return this.isSupported && this.config.enabled;
  }

  /**
   * Test haptic feedback with a sample pattern
   */
  public test(): void {
    this.trigger('tap');
    setTimeout(() => this.trigger('success'), 200);
  }
}

// Create singleton instance
const hapticFeedback = new HapticFeedbackManager();

// Export convenience functions
export const triggerHaptic = (type: string, customPattern?: HapticPattern) => {
  hapticFeedback.trigger(type, customPattern);
};

export const vibrate = (pattern: number | number[]) => {
  hapticFeedback.vibrate(pattern);
};

export const setHapticEnabled = (enabled: boolean) => {
  hapticFeedback.setEnabled(enabled);
};

export const setHapticIntensity = (intensity: 'light' | 'medium' | 'heavy') => {
  hapticFeedback.setIntensity(intensity);
};

export const isHapticEnabled = () => {
  return hapticFeedback.isEnabled();
};

export const testHaptic = () => {
  hapticFeedback.test();
};

// Export haptic patterns for reference
export const HAPTIC_PATTERNS = DEFAULT_PATTERNS;

// Export the manager instance for advanced usage
export default hapticFeedback;

// React hook for haptic feedback
export const useHapticFeedback = () => {
  return {
    trigger: triggerHaptic,
    vibrate,
    setEnabled: setHapticEnabled,
    setIntensity: setHapticIntensity,
    isEnabled: isHapticEnabled,
    test: testHaptic,
    patterns: HAPTIC_PATTERNS
  };
};

// Trading-specific haptic helpers
export const TradingHaptics = {
  orderPlaced: () => triggerHaptic('orderPlaced'),
  orderFilled: () => triggerHaptic('orderFilled'),
  orderCancelled: () => triggerHaptic('orderCancelled'),
  orderRejected: () => triggerHaptic('orderRejected'),
  priceAlert: () => triggerHaptic('priceAlert'),
  marginCall: () => triggerHaptic('marginCall'),
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error'),
  warning: () => triggerHaptic('warning')
};

// Navigation haptic helpers
export const NavigationHaptics = {
  tap: () => triggerHaptic('tap'),
  buttonPress: () => triggerHaptic('buttonPress'),
  swipe: () => triggerHaptic('swipe'),
  pullToRefresh: () => triggerHaptic('pullToRefresh'),
  selection: () => triggerHaptic('selection'),
  longPress: () => triggerHaptic('longPress'),
  success: () => triggerHaptic('success'),
  error: () => triggerHaptic('error')
};

// Chart interaction haptics
export const ChartHaptics = {
  zoom: () => triggerHaptic('chartZoom'),
  pan: () => triggerHaptic('chartPan'),
  crosshair: () => triggerHaptic('crosshairMove'),
  dataPoint: () => triggerHaptic('selection'),
  priceAlert: () => triggerHaptic('priceAlert'),
  zoomIn: () => triggerHaptic('chartZoom'),
  dataPointSelect: () => triggerHaptic('selection')
};