// PWA utilities for service worker registration and installation

// Extend ServiceWorkerRegistration interface to include sync
declare global {
  interface ServiceWorkerRegistration {
    sync: SyncManager;
  }
  
  interface SyncManager {
    register(tag: string): Promise<void>;
    getTags(): Promise<string[]>;
  }
}

// Service worker registration
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });
      
      console.log('Service Worker registered successfully:', registration.scope);
      
      // Handle updates
      registration.addEventListener('updatefound', () => {
        const newWorker = registration.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New content is available, prompt user to refresh
              showUpdateAvailableNotification();
            }
          });
        }
      });
      
      return registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }
  
  console.log('Service Worker not supported');
  return null;
}

// PWA installation prompt
let deferredPrompt: BeforeInstallPromptEvent | null = null;

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
  prompt(): Promise<void>;
}

// Listen for install prompt
export function setupInstallPrompt(): void {
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    // Prevent the mini-infobar from appearing on mobile
    e.preventDefault();
    // Stash the event so it can be triggered later
    deferredPrompt = e as BeforeInstallPromptEvent;
    
    // Show install button or notification
    showInstallPrompt();
  });
  
  // Listen for app installed event
  window.addEventListener('appinstalled', () => {
    console.log('PWA was installed');
    deferredPrompt = null;
    hideInstallPrompt();
    
    // Track installation
    trackPWAInstallation();
  });
}

// Show PWA install prompt
export async function showPWAInstallPrompt(): Promise<boolean> {
  if (!deferredPrompt) {
    console.log('No install prompt available');
    return false;
  }
  
  try {
    // Show the install prompt
    await deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    
    console.log(`User response to install prompt: ${outcome}`);
    
    // Clear the deferred prompt
    deferredPrompt = null;
    
    return outcome === 'accepted';
  } catch (error) {
    console.error('Error showing install prompt:', error);
    return false;
  }
}

// Check if app is installed
export function isPWAInstalled(): boolean {
  // Check if running in standalone mode
  if (window.matchMedia('(display-mode: standalone)').matches) {
    return true;
  }
  
  // Check if running in PWA mode on iOS
  if ((window.navigator as any).standalone === true) {
    return true;
  }
  
  // Check if installed via Chrome
  if (document.referrer.includes('android-app://')) {
    return true;
  }
  
  return false;
}

// Check if PWA installation is available
export function isPWAInstallable(): boolean {
  return deferredPrompt !== null;
}

// Background sync registration
export async function registerBackgroundSync(tag: string): Promise<void> {
  if ('serviceWorker' in navigator && 'sync' in window.ServiceWorkerRegistration.prototype) {
    try {
      const registration = await navigator.serviceWorker.ready;
      await registration.sync.register(tag);
      console.log(`Background sync registered: ${tag}`);
    } catch (error) {
      console.error('Background sync registration failed:', error);
    }
  }
}

// Push notification setup
export async function setupPushNotifications(): Promise<PushSubscription | null> {
  if (!('Notification' in window) || !('serviceWorker' in navigator)) {
    console.log('Push notifications not supported');
    return null;
  }
  
  // Request notification permission
  const permission = await Notification.requestPermission();
  if (permission !== 'granted') {
    console.log('Notification permission denied');
    return null;
  }
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(getVAPIDPublicKey())
      });
      
      console.log('Push notification subscription created');
      
      // Send subscription to server
      await sendSubscriptionToServer(subscription);
    }
    
    return subscription;
  } catch (error) {
    console.error('Push notification setup failed:', error);
    return null;
  }
}

// Offline storage utilities
export class OfflineStorage {
  private dbName = 'nusanexus-offline';
  private version = 1;
  private db: IDBDatabase | null = null;
  
  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);
      
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };
      
      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        
        // Create object stores
        if (!db.objectStoreNames.contains('pendingOrders')) {
          const orderStore = db.createObjectStore('pendingOrders', { keyPath: 'id' });
          orderStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
        
        if (!db.objectStoreNames.contains('offlineData')) {
          const dataStore = db.createObjectStore('offlineData', { keyPath: 'key' });
          dataStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      };
    });
  }
  
  async storePendingOrder(order: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingOrders'], 'readwrite');
    const store = transaction.objectStore('pendingOrders');
    
    await store.add({
      ...order,
      id: `offline_${Date.now()}_${Math.random()}`,
      timestamp: Date.now(),
      offline: true
    });
  }
  
  async getPendingOrders(): Promise<any[]> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingOrders'], 'readonly');
    const store = transaction.objectStore('pendingOrders');
    
    return new Promise((resolve, reject) => {
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
  }
  
  async removePendingOrder(id: string): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['pendingOrders'], 'readwrite');
    const store = transaction.objectStore('pendingOrders');
    
    await store.delete(id);
  }
  
  async storeOfflineData(key: string, data: any): Promise<void> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['offlineData'], 'readwrite');
    const store = transaction.objectStore('offlineData');
    
    await store.put({
      key,
      data,
      timestamp: Date.now()
    });
  }
  
  async getOfflineData(key: string): Promise<any> {
    if (!this.db) await this.init();
    
    const transaction = this.db!.transaction(['offlineData'], 'readonly');
    const store = transaction.objectStore('offlineData');
    
    return new Promise((resolve, reject) => {
      const request = store.get(key);
      request.onsuccess = () => resolve(request.result?.data || null);
      request.onerror = () => reject(request.error);
    });
  }
}

// Network status utilities
export class NetworkStatus {
  private listeners: ((online: boolean) => void)[] = [];
  
  constructor() {
    window.addEventListener('online', () => this.notifyListeners(true));
    window.addEventListener('offline', () => this.notifyListeners(false));
  }
  
  isOnline(): boolean {
    return navigator.onLine;
  }
  
  addListener(callback: (online: boolean) => void): void {
    this.listeners.push(callback);
  }
  
  removeListener(callback: (online: boolean) => void): void {
    this.listeners = this.listeners.filter(listener => listener !== callback);
  }
  
  private notifyListeners(online: boolean): void {
    this.listeners.forEach(listener => listener(online));
  }
}

// Utility functions
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

function getVAPIDPublicKey(): string {
  // This should be your VAPID public key from your push service
  return process.env.REACT_APP_VAPID_PUBLIC_KEY || 'your-vapid-public-key';
}

async function sendSubscriptionToServer(subscription: PushSubscription): Promise<void> {
  try {
    await fetch('/api/push/subscribe', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(subscription)
    });
  } catch (error) {
    console.error('Failed to send subscription to server:', error);
  }
}

// UI notification functions (to be implemented in components)
function showUpdateAvailableNotification(): void {
  // This would show a toast or modal to inform user about updates
  console.log('New app version available! Please refresh.');
}

function showInstallPrompt(): void {
  // This would show install button or banner
  console.log('App can be installed!');
}

function hideInstallPrompt(): void {
  // This would hide install UI elements
  console.log('Install prompt hidden');
}

function trackPWAInstallation(): void {
  // This would track the installation event for analytics
  console.log('PWA installation tracked');
}

// Export singleton instances
export const offlineStorage = new OfflineStorage();
export const networkStatus = new NetworkStatus();

// Initialize PWA features
export async function initializePWA(): Promise<void> {
  try {
    // Register service worker
    await registerServiceWorker();
    
    // Setup install prompt
    setupInstallPrompt();
    
    // Initialize offline storage
    await offlineStorage.init();
    
    // Setup push notifications (optional)
    if (isPWAInstalled()) {
      await setupPushNotifications();
    }
    
    console.log('PWA initialization completed');
  } catch (error) {
    console.error('PWA initialization failed:', error);
  }
}