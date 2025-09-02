/**
 * Mobile Data Manager
 * Handles caching, offline storage, and data synchronization with performance optimizations
 */

import React from 'react';
import { performanceManager } from './mobilePerformance';

// Types
interface CacheEntry<T> {
  data: T;
  timestamp: number;
  expiry: number;
  priority: 'high' | 'medium' | 'low';
  size: number;
}

interface SyncQueueItem {
  id: string;
  action: 'create' | 'update' | 'delete';
  table: string;
  data: any;
  timestamp: number;
  retryCount: number;
}

interface StorageQuota {
  usage: number;
  quota: number;
  available: number;
}

// Cache configuration
const CACHE_CONFIG = {
  MAX_SIZE: 50 * 1024 * 1024, // 50MB
  DEFAULT_TTL: 5 * 60 * 1000, // 5 minutes
  CLEANUP_INTERVAL: 10 * 60 * 1000, // 10 minutes
  LOW_POWER_TTL: 15 * 60 * 1000, // 15 minutes on low power
  SLOW_NETWORK_TTL: 30 * 60 * 1000, // 30 minutes on slow network
};

class MobileDataManager {
  private static instance: MobileDataManager;
  private cache = new Map<string, CacheEntry<any>>();
  private syncQueue: SyncQueueItem[] = [];
  private isOnline = navigator.onLine;
  private isSyncing = false;
  private cleanupInterval: NodeJS.Timeout | null = null;
  private compressionEnabled = true;

  private constructor() {
    this.initializeEventListeners();
    this.startCleanupInterval();
    this.loadSyncQueue();
  }

  static getInstance(): MobileDataManager {
    if (!MobileDataManager.instance) {
      MobileDataManager.instance = new MobileDataManager();
    }
    return MobileDataManager.instance;
  }

  // Initialize event listeners
  private initializeEventListeners() {
    // Online/offline detection
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processSyncQueue();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
    });

    // Page visibility for cache management
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.saveSyncQueue();
        this.optimizeCache();
      }
    });

    // Before unload cleanup
    window.addEventListener('beforeunload', () => {
      this.saveSyncQueue();
    });
  }

  // Cache management
  async set<T>(
    key: string, 
    data: T, 
    options: {
      ttl?: number;
      priority?: 'high' | 'medium' | 'low';
      compress?: boolean;
    } = {}
  ): Promise<void> {
    const {
      ttl = this.getOptimalTTL(),
      priority = 'medium',
      compress = this.compressionEnabled
    } = options;

    let processedData = data;
    let size = this.estimateSize(data);

    // Compress data if enabled and beneficial
    if (compress && size > 1024) {
      try {
        processedData = await this.compressData(data);
        size = this.estimateSize(processedData);
      } catch (error) {
        console.warn('Data compression failed:', error);
      }
    }

    const entry: CacheEntry<T> = {
      data: processedData,
      timestamp: Date.now(),
      expiry: Date.now() + ttl,
      priority,
      size
    };

    // Check cache size and cleanup if necessary
    await this.ensureCacheSpace(size);
    
    this.cache.set(key, entry);
    
    // Persist high priority items to IndexedDB
    if (priority === 'high') {
      await this.persistToIndexedDB(key, entry);
    }
  }

  async get<T>(key: string): Promise<T | null> {
    const entry = this.cache.get(key);
    
    if (entry) {
      // Check if expired
      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        await this.removeFromIndexedDB(key);
        return null;
      }
      
      // Decompress if needed
      if (this.isCompressed(entry.data)) {
        try {
          return await this.decompressData(entry.data);
        } catch (error) {
          console.warn('Data decompression failed:', error);
          return null;
        }
      }
      
      return entry.data;
    }

    // Try to load from IndexedDB
    const persistedEntry = await this.loadFromIndexedDB(key);
    if (persistedEntry && Date.now() <= persistedEntry.expiry) {
      this.cache.set(key, persistedEntry);
      return this.isCompressed(persistedEntry.data) 
        ? await this.decompressData(persistedEntry.data)
        : persistedEntry.data;
    }

    return null;
  }

  async remove(key: string): Promise<void> {
    this.cache.delete(key);
    await this.removeFromIndexedDB(key);
  }

  async clear(): Promise<void> {
    this.cache.clear();
    await this.clearIndexedDB();
  }

  // Sync queue management
  addToSyncQueue(item: Omit<SyncQueueItem, 'id' | 'timestamp' | 'retryCount'>): void {
    const syncItem: SyncQueueItem = {
      ...item,
      id: this.generateId(),
      timestamp: Date.now(),
      retryCount: 0
    };
    
    this.syncQueue.push(syncItem);
    
    if (this.isOnline) {
      this.processSyncQueue();
    }
  }

  private async processSyncQueue(): Promise<void> {
    if (this.isSyncing || this.syncQueue.length === 0) return;
    
    this.isSyncing = true;
    
    try {
      const itemsToProcess = [...this.syncQueue];
      
      for (const item of itemsToProcess) {
        try {
          await this.syncItem(item);
          this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
        } catch (error) {
          console.warn('Sync failed for item:', item.id, error);
          
          // Increment retry count
          const queueItem = this.syncQueue.find(i => i.id === item.id);
          if (queueItem) {
            queueItem.retryCount++;
            
            // Remove items that have failed too many times
            if (queueItem.retryCount > 3) {
              this.syncQueue = this.syncQueue.filter(i => i.id !== item.id);
            }
          }
        }
      }
    } finally {
      this.isSyncing = false;
      this.saveSyncQueue();
    }
  }

  private async syncItem(item: SyncQueueItem): Promise<void> {
    // This would integrate with your actual API
    // For now, we'll simulate the sync operation
    const delay = performanceManager.isSlowNetwork ? 2000 : 500;
    await new Promise(resolve => setTimeout(resolve, delay));
    
    // Simulate API call based on action
    switch (item.action) {
      case 'create':
        console.log(`Creating ${item.table}:`, item.data);
        break;
      case 'update':
        console.log(`Updating ${item.table}:`, item.data);
        break;
      case 'delete':
        console.log(`Deleting ${item.table}:`, item.data);
        break;
    }
  }

  // Storage management
  async getStorageQuota(): Promise<StorageQuota> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        usage: estimate.usage || 0,
        quota: estimate.quota || 0,
        available: (estimate.quota || 0) - (estimate.usage || 0)
      };
    }
    
    // Fallback estimation
    return {
      usage: this.estimateCacheSize(),
      quota: CACHE_CONFIG.MAX_SIZE,
      available: CACHE_CONFIG.MAX_SIZE - this.estimateCacheSize()
    };
  }

  async clearExpiredData(): Promise<number> {
    const now = Date.now();
    let clearedCount = 0;
    
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
        await this.removeFromIndexedDB(key);
        clearedCount++;
      }
    }
    
    return clearedCount;
  }

  async optimizeStorage(): Promise<void> {
    const quota = await this.getStorageQuota();
    const usagePercent = (quota.usage / quota.quota) * 100;
    
    if (usagePercent > 80) {
      // Clear expired data first
      await this.clearExpiredData();
      
      // If still over 70%, remove low priority items
      const updatedQuota = await this.getStorageQuota();
      const updatedUsagePercent = (updatedQuota.usage / updatedQuota.quota) * 100;
      
      if (updatedUsagePercent > 70) {
        await this.clearLowPriorityData();
      }
    }
  }

  // Alias for optimizeStorage
  async optimizeCache(): Promise<void> {
    return this.optimizeStorage();
  }

  // Private helper methods
  private getOptimalTTL(): number {
    if (performanceManager.isLowPower) {
      return CACHE_CONFIG.LOW_POWER_TTL;
    }
    if (performanceManager.isSlowNetwork) {
      return CACHE_CONFIG.SLOW_NETWORK_TTL;
    }
    return CACHE_CONFIG.DEFAULT_TTL;
  }

  private async ensureCacheSpace(requiredSize: number): Promise<void> {
    const currentSize = this.estimateCacheSize();
    
    if (currentSize + requiredSize > CACHE_CONFIG.MAX_SIZE) {
      await this.clearLowPriorityData();
    }
  }

  private async clearLowPriorityData(): Promise<void> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, ...entry }))
      .sort((a, b) => {
        // Sort by priority (low first) then by age (oldest first)
        const priorityOrder = { low: 0, medium: 1, high: 2 };
        if (priorityOrder[a.priority] !== priorityOrder[b.priority]) {
          return priorityOrder[a.priority] - priorityOrder[b.priority];
        }
        return a.timestamp - b.timestamp;
      });
    
    // Remove up to 30% of cache
    const itemsToRemove = Math.ceil(entries.length * 0.3);
    
    for (let i = 0; i < itemsToRemove && i < entries.length; i++) {
      const key = entries[i].key;
      this.cache.delete(key);
      await this.removeFromIndexedDB(key);
    }
  }

  private estimateSize(data: any): number {
    return JSON.stringify(data).length * 2; // Rough estimation
  }

  private estimateCacheSize(): number {
    return Array.from(this.cache.values())
      .reduce((total, entry) => total + entry.size, 0);
  }

  private async compressData(data: any): Promise<any> {
    // Simple compression using JSON stringification
    // In a real implementation, you might use a compression library
    const jsonString = JSON.stringify(data);
    return {
      __compressed: true,
      data: jsonString
    };
  }

  private async decompressData(compressedData: any): Promise<any> {
    if (compressedData.__compressed) {
      return JSON.parse(compressedData.data);
    }
    return compressedData;
  }

  private isCompressed(data: any): boolean {
    return data && typeof data === 'object' && data.__compressed === true;
  }

  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private startCleanupInterval(): void {
    this.cleanupInterval = setInterval(() => {
      this.clearExpiredData();
    }, CACHE_CONFIG.CLEANUP_INTERVAL);
  }

  private async loadSyncQueue(): Promise<void> {
    try {
      const stored = localStorage.getItem('mobile-sync-queue');
      if (stored) {
        this.syncQueue = JSON.parse(stored);
      }
    } catch (error) {
      console.warn('Failed to load sync queue:', error);
    }
  }

  private saveSyncQueue(): void {
    try {
      localStorage.setItem('mobile-sync-queue', JSON.stringify(this.syncQueue));
    } catch (error) {
      console.warn('Failed to save sync queue:', error);
    }
  }

  // IndexedDB operations (simplified)
  private async persistToIndexedDB(key: string, entry: CacheEntry<any>): Promise<void> {
    // Simplified IndexedDB implementation
    // In a real app, you'd use a proper IndexedDB wrapper
    try {
      localStorage.setItem(`idb-${key}`, JSON.stringify(entry));
    } catch (error) {
      console.warn('Failed to persist to IndexedDB:', error);
    }
  }

  private async loadFromIndexedDB(key: string): Promise<CacheEntry<any> | null> {
    try {
      const stored = localStorage.getItem(`idb-${key}`);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.warn('Failed to load from IndexedDB:', error);
      return null;
    }
  }

  private async removeFromIndexedDB(key: string): Promise<void> {
    try {
      localStorage.removeItem(`idb-${key}`);
    } catch (error) {
      console.warn('Failed to remove from IndexedDB:', error);
    }
  }

  private async clearIndexedDB(): Promise<void> {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('idb-'));
      keys.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.warn('Failed to clear IndexedDB:', error);
    }
  }

  // Public API methods
  getSyncQueueLength(): number {
    return this.syncQueue.length;
  }

  getCacheStats(): {
    size: number;
    itemCount: number;
    hitRate: number;
  } {
    return {
      size: this.estimateCacheSize(),
      itemCount: this.cache.size,
      hitRate: 0 // Would need to track hits/misses for real implementation
    };
  }

  isOnlineStatus(): boolean {
    return this.isOnline;
  }

  // Cleanup
  cleanup(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.saveSyncQueue();
  }
}

// Export singleton instance
export const mobileDataManager = MobileDataManager.getInstance();

// React hook for data management
export function useMobileData() {
  const [isOnline, setIsOnline] = React.useState(navigator.onLine);
  const [syncQueueLength, setSyncQueueLength] = React.useState(0);
  const [storageQuota, setStorageQuota] = React.useState<StorageQuota | null>(null);

  React.useEffect(() => {
    const updateOnlineStatus = () => setIsOnline(navigator.onLine);
    const updateSyncQueue = () => setSyncQueueLength(mobileDataManager.getSyncQueueLength());
    
    window.addEventListener('online', updateOnlineStatus);
    window.addEventListener('offline', updateOnlineStatus);
    
    // Update sync queue length periodically
    const interval = setInterval(updateSyncQueue, 1000);
    
    // Get initial storage quota
    mobileDataManager.getStorageQuota().then(setStorageQuota);
    
    return () => {
      window.removeEventListener('online', updateOnlineStatus);
      window.removeEventListener('offline', updateOnlineStatus);
      clearInterval(interval);
    };
  }, []);

  return {
    isOnline,
    syncQueueLength,
    storageQuota,
    dataManager: mobileDataManager
  };
}

export default MobileDataManager;