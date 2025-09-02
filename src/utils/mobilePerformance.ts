/**
 * Mobile Performance Optimization Utilities
 * Handles lazy loading, image optimization, and battery usage optimization
 */

import React from 'react';

// Battery API types
interface BatteryManager {
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
  level: number;
  addEventListener(type: string, listener: EventListener): void;
  removeEventListener(type: string, listener: EventListener): void;
}

interface NavigatorWithBattery extends Navigator {
  getBattery?(): Promise<BatteryManager>;
}

// Performance monitoring
class MobilePerformanceManager {
  private static instance: MobilePerformanceManager;
  private batteryManager: BatteryManager | null = null;
  private performanceObserver: PerformanceObserver | null = null;
  private isLowPowerMode = false;
  private networkType = 'unknown';
  private observers: IntersectionObserver[] = [];

  private constructor() {
    this.initializeBatteryMonitoring();
    this.initializeNetworkMonitoring();
    this.initializePerformanceMonitoring();
  }

  static getInstance(): MobilePerformanceManager {
    if (!MobilePerformanceManager.instance) {
      MobilePerformanceManager.instance = new MobilePerformanceManager();
    }
    return MobilePerformanceManager.instance;
  }

  // Battery monitoring
  private async initializeBatteryMonitoring() {
    try {
      const nav = navigator as NavigatorWithBattery;
      if (nav.getBattery) {
        this.batteryManager = await nav.getBattery();
        this.updatePowerMode();
        
        this.batteryManager.addEventListener('levelchange', () => this.updatePowerMode());
        this.batteryManager.addEventListener('chargingchange', () => this.updatePowerMode());
      }
    } catch (error) {
      console.warn('Battery API not supported:', error);
    }
  }

  private updatePowerMode() {
    if (!this.batteryManager) return;
    
    const { level, charging } = this.batteryManager;
    this.isLowPowerMode = !charging && level < 0.2; // Low power when below 20% and not charging
    
    // Dispatch custom event for components to react
    window.dispatchEvent(new CustomEvent('powerModeChange', {
      detail: { isLowPowerMode: this.isLowPowerMode, level, charging }
    }));
  }

  // Network monitoring
  private initializeNetworkMonitoring() {
    if ('connection' in navigator) {
      const connection = (navigator as any).connection;
      this.networkType = connection.effectiveType || 'unknown';
      
      connection.addEventListener('change', () => {
        this.networkType = connection.effectiveType || 'unknown';
        window.dispatchEvent(new CustomEvent('networkChange', {
          detail: { networkType: this.networkType }
        }));
      });
    }
  }

  // Performance monitoring
  private initializePerformanceMonitoring() {
    if ('PerformanceObserver' in window) {
      this.performanceObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          if (entry.entryType === 'measure' && entry.duration > 100) {
            console.warn(`Slow operation detected: ${entry.name} took ${entry.duration}ms`);
          }
        });
      });
      
      try {
        this.performanceObserver.observe({ entryTypes: ['measure', 'navigation'] });
      } catch (error) {
        console.warn('Performance Observer not fully supported:', error);
      }
    }
  }

  // Getters
  get isLowPower(): boolean {
    return this.isLowPowerMode;
  }

  get isSlowNetwork(): boolean {
    return ['slow-2g', '2g'].includes(this.networkType);
  }

  get shouldOptimize(): boolean {
    return this.isLowPowerMode || this.isSlowNetwork;
  }

  // Get network information
  getNetworkInfo() {
    return {
      type: this.networkType,
      isSlowNetwork: this.isSlowNetwork,
      effectiveType: this.networkType,
      online: navigator.onLine
    };
  }

  // Get battery information
  async getBatteryInfo() {
    if (this.batteryManager) {
      return {
        level: this.batteryManager.level,
        charging: this.batteryManager.charging,
        chargingTime: this.batteryManager.chargingTime,
        dischargingTime: this.batteryManager.dischargingTime
      };
    }
    return {
      level: 1,
      charging: true,
      chargingTime: Infinity,
      dischargingTime: Infinity
    };
  }

  // Cleanup
  cleanup() {
    this.observers.forEach(observer => observer.disconnect());
    this.observers = [];
    
    if (this.performanceObserver) {
      this.performanceObserver.disconnect();
    }
  }
}

// Lazy loading utilities
export class LazyLoader {
  private static intersectionObserver: IntersectionObserver | null = null;
  private static imageCache = new Map<string, HTMLImageElement>();

  static initializeObserver() {
    if (!this.intersectionObserver && 'IntersectionObserver' in window) {
      this.intersectionObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const element = entry.target as HTMLElement;
              this.loadElement(element);
              this.intersectionObserver?.unobserve(element);
            }
          });
        },
        {
          rootMargin: '50px',
          threshold: 0.1
        }
      );
    }
  }

  static observe(element: HTMLElement) {
    this.initializeObserver();
    if (this.intersectionObserver) {
      this.intersectionObserver.observe(element);
    } else {
      // Fallback for browsers without IntersectionObserver
      this.loadElement(element);
    }
  }

  private static loadElement(element: HTMLElement) {
    const dataSrc = element.getAttribute('data-src');
    const dataSrcSet = element.getAttribute('data-srcset');
    
    if (element.tagName === 'IMG' && dataSrc) {
      const img = element as HTMLImageElement;
      
      // Check cache first
      if (this.imageCache.has(dataSrc)) {
        const cachedImg = this.imageCache.get(dataSrc)!;
        img.src = cachedImg.src;
        if (dataSrcSet) img.srcset = dataSrcSet;
        img.classList.add('loaded');
        return;
      }
      
      // Load image
      const tempImg = new Image();
      tempImg.onload = () => {
        img.src = dataSrc;
        if (dataSrcSet) img.srcset = dataSrcSet;
        img.classList.add('loaded');
        this.imageCache.set(dataSrc, tempImg);
      };
      tempImg.onerror = () => {
        img.classList.add('error');
      };
      tempImg.src = dataSrc;
    }
  }

  static cleanup() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.imageCache.clear();
  }
}

// Image optimization utilities
export class ImageOptimizer {
  private static canvas: HTMLCanvasElement | null = null;
  private static ctx: CanvasRenderingContext2D | null = null;

  static initializeCanvas() {
    if (!this.canvas) {
      this.canvas = document.createElement('canvas');
      this.ctx = this.canvas.getContext('2d');
    }
  }

  static optimizeImageUrl(url: string, options: {
    width?: number;
    height?: number;
    quality?: number;
    format?: 'webp' | 'jpeg' | 'png';
  } = {}): string {
    const performanceManager = MobilePerformanceManager.getInstance();
    
    // Use lower quality on slow networks or low battery
    const quality = performanceManager.shouldOptimize 
      ? Math.min(options.quality || 0.7, 0.5)
      : options.quality || 0.8;
    
    // Reduce dimensions on slow networks
    const width = performanceManager.isSlowNetwork 
      ? Math.min(options.width || 800, 400)
      : options.width;
    
    const height = performanceManager.isSlowNetwork 
      ? Math.min(options.height || 600, 300)
      : options.height;
    
    // For demo purposes, return the original URL with query parameters
    // In a real implementation, this would integrate with an image CDN
    const params = new URLSearchParams();
    if (width) params.set('w', width.toString());
    if (height) params.set('h', height.toString());
    if (quality) params.set('q', Math.round(quality * 100).toString());
    if (options.format) params.set('f', options.format);
    
    return `${url}${url.includes('?') ? '&' : '?'}${params.toString()}`;
  }

  static async compressImage(file: File, options: {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number;
  } = {}): Promise<Blob> {
    return new Promise((resolve, reject) => {
      this.initializeCanvas();
      if (!this.canvas || !this.ctx) {
        reject(new Error('Canvas not supported'));
        return;
      }

      const img = new Image();
      img.onload = () => {
        const { maxWidth = 1200, maxHeight = 800, quality = 0.8 } = options;
        
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }
        if (height > maxHeight) {
          width = (width * maxHeight) / height;
          height = maxHeight;
        }
        
        // Set canvas size and draw image
        this.canvas!.width = width;
        this.canvas!.height = height;
        this.ctx!.drawImage(img, 0, 0, width, height);
        
        // Convert to blob
        this.canvas!.toBlob(
          (blob) => {
            if (blob) {
              resolve(blob);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          'image/jpeg',
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  }
}

// Performance measurement utilities
export class PerformanceMeasurer {
  private static measurements = new Map<string, number>();

  static start(name: string) {
    this.measurements.set(name, performance.now());
  }

  static end(name: string): number {
    const startTime = this.measurements.get(name);
    if (!startTime) {
      console.warn(`No start time found for measurement: ${name}`);
      return 0;
    }
    
    const duration = performance.now() - startTime;
    this.measurements.delete(name);
    
    // Log slow operations
    if (duration > 100) {
      console.warn(`Slow operation: ${name} took ${duration.toFixed(2)}ms`);
    }
    
    return duration;
  }

  static measure(name: string, fn: () => void | Promise<void>): Promise<number> {
    return new Promise(async (resolve) => {
      this.start(name);
      try {
        await fn();
      } finally {
        const duration = this.end(name);
        resolve(duration);
      }
    });
  }
}

// React hook for performance monitoring
export function usePerformanceMonitoring() {
  const [isLowPower, setIsLowPower] = React.useState(false);
  const [isSlowNetwork, setIsSlowNetwork] = React.useState(false);
  
  React.useEffect(() => {
    const performanceManager = MobilePerformanceManager.getInstance();
    
    const handlePowerModeChange = (event: CustomEvent) => {
      setIsLowPower(event.detail.isLowPowerMode);
    };
    
    const handleNetworkChange = (event: CustomEvent) => {
      setIsSlowNetwork(['slow-2g', '2g'].includes(event.detail.networkType));
    };
    
    window.addEventListener('powerModeChange', handlePowerModeChange as EventListener);
    window.addEventListener('networkChange', handleNetworkChange as EventListener);
    
    // Initial state
    setIsLowPower(performanceManager.isLowPower);
    setIsSlowNetwork(performanceManager.isSlowNetwork);
    
    return () => {
      window.removeEventListener('powerModeChange', handlePowerModeChange as EventListener);
      window.removeEventListener('networkChange', handleNetworkChange as EventListener);
    };
  }, []);
  
  return {
    isLowPower,
    isSlowNetwork,
    shouldOptimize: isLowPower || isSlowNetwork
  };
}

// Export the performance manager instance
export const performanceManager = MobilePerformanceManager.getInstance();

// Export utilities
export { MobilePerformanceManager };

// Export aliases for backward compatibility
export const networkMonitor = performanceManager;
export const performanceMonitor = performanceManager;
export const batteryMonitor = performanceManager;

// Additional utility functions
export function optimizeImageForConditions(url: string, conditions?: {
  isLowPower?: boolean;
  isSlowNetwork?: boolean;
}) {
  const performanceManager = MobilePerformanceManager.getInstance();
  const isLowPower = conditions?.isLowPower ?? performanceManager.isLowPower;
  const isSlowNetwork = conditions?.isSlowNetwork ?? performanceManager.isSlowNetwork;
  
  return ImageOptimizer.optimizeImageUrl(url, {
    width: isSlowNetwork ? 400 : 800,
    height: isSlowNetwork ? 300 : 600,
    quality: isLowPower ? 0.5 : 0.8,
    format: 'webp'
  });
}

export function measurePerformance<T>(name: string, fn: () => T | Promise<T>): Promise<{ result: T; duration: number }> {
  return new Promise(async (resolve, reject) => {
    PerformanceMeasurer.start(name);
    try {
      const result = await fn();
      const duration = PerformanceMeasurer.end(name);
      resolve({ result, duration });
    } catch (error) {
      PerformanceMeasurer.end(name);
      reject(error);
    }
  });
}

// Cleanup function for app unmount
export function cleanupPerformanceMonitoring() {
  LazyLoader.cleanup();
  performanceManager.cleanup();
}