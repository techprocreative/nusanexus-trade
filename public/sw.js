// NusaNexus Trading Platform Service Worker
const CACHE_NAME = 'nusanexus-trading-v1.0.0';
const STATIC_CACHE_NAME = 'nusanexus-static-v1.0.0';
const DYNAMIC_CACHE_NAME = 'nusanexus-dynamic-v1.0.0';
const API_CACHE_NAME = 'nusanexus-api-v1.0.0';

// Assets to cache immediately
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/static/js/bundle.js',
  '/static/css/main.css',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png'
];

// API endpoints to cache with network-first strategy
const API_ENDPOINTS = [
  '/api/portfolio',
  '/api/positions',
  '/api/orders',
  '/api/market-data',
  '/api/user/profile'
];

// Critical trading data that should always be fresh
const CRITICAL_ENDPOINTS = [
  '/api/real-time-prices',
  '/api/order-execution',
  '/api/account/balance'
];

// Install event - cache static assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');
  
  event.waitUntil(
    Promise.all([
      caches.open(STATIC_CACHE_NAME).then((cache) => {
        console.log('[SW] Caching static assets');
        return cache.addAll(STATIC_ASSETS);
      }),
      // Skip waiting to activate immediately
      self.skipWaiting()
    ])
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');
  
  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME && 
                cacheName !== STATIC_CACHE_NAME && 
                cacheName !== DYNAMIC_CACHE_NAME &&
                cacheName !== API_CACHE_NAME) {
              console.log('[SW] Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim()
    ])
  );
});

// Fetch event - implement caching strategies
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }
  
  // Handle different types of requests
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
  } else if (isStaticAsset(request)) {
    event.respondWith(handleStaticAsset(request));
  } else {
    event.respondWith(handleNavigationRequest(request));
  }
});

// Handle API requests with appropriate caching strategy
async function handleApiRequest(request) {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Critical endpoints - always network first, no cache fallback
  if (CRITICAL_ENDPOINTS.some(endpoint => pathname.includes(endpoint))) {
    try {
      const response = await fetch(request);
      return response;
    } catch (error) {
      console.log('[SW] Critical API request failed:', pathname);
      return new Response(
        JSON.stringify({ error: 'Network unavailable', offline: true }),
        { 
          status: 503,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }
  }
  
  // Regular API endpoints - network first with cache fallback
  if (API_ENDPOINTS.some(endpoint => pathname.includes(endpoint))) {
    return networkFirstWithCache(request, API_CACHE_NAME, 300000); // 5 minutes TTL
  }
  
  // Market data - stale while revalidate
  if (pathname.includes('/api/market-data')) {
    return staleWhileRevalidate(request, API_CACHE_NAME);
  }
  
  // Default: network first
  return networkFirst(request);
}

// Handle static assets
async function handleStaticAsset(request) {
  return cacheFirst(request, STATIC_CACHE_NAME);
}

// Handle navigation requests
async function handleNavigationRequest(request) {
  return networkFirstWithCache(request, DYNAMIC_CACHE_NAME, 86400000); // 24 hours TTL
}

// Caching strategies
async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  if (cachedResponse) {
    return cachedResponse;
  }
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.log('[SW] Cache first failed:', request.url);
    return new Response('Offline', { status: 503 });
  }
}

async function networkFirst(request) {
  try {
    const response = await fetch(request);
    return response;
  } catch (error) {
    console.log('[SW] Network first failed:', request.url);
    return new Response('Network unavailable', { status: 503 });
  }
}

async function networkFirstWithCache(request, cacheName, ttl = 300000) {
  const cache = await caches.open(cacheName);
  
  try {
    const response = await fetch(request);
    if (response.status === 200) {
      // Add timestamp for TTL
      const responseToCache = response.clone();
      responseToCache.headers.set('sw-cache-timestamp', Date.now().toString());
      cache.put(request, responseToCache);
    }
    return response;
  } catch (error) {
    console.log('[SW] Network failed, trying cache:', request.url);
    
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      const cacheTimestamp = cachedResponse.headers.get('sw-cache-timestamp');
      const isExpired = cacheTimestamp && (Date.now() - parseInt(cacheTimestamp)) > ttl;
      
      if (!isExpired) {
        return cachedResponse;
      }
    }
    
    return new Response(
      JSON.stringify({ error: 'Offline and no cached data available' }),
      { 
        status: 503,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cachedResponse = await cache.match(request);
  
  // Fetch in background
  const fetchPromise = fetch(request).then((response) => {
    if (response.status === 200) {
      cache.put(request, response.clone());
    }
    return response;
  }).catch(() => null);
  
  // Return cached version immediately if available
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Otherwise wait for network
  return fetchPromise || new Response('Offline', { status: 503 });
}

// Utility functions
function isStaticAsset(request) {
  const url = new URL(request.url);
  return url.pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|woff|woff2|ttf|eot|ico)$/);
}

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('[SW] Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync-orders') {
    event.waitUntil(syncPendingOrders());
  } else if (event.tag === 'background-sync-data') {
    event.waitUntil(syncOfflineData());
  }
});

// Sync pending orders when back online
async function syncPendingOrders() {
  try {
    // Get pending orders from IndexedDB
    const pendingOrders = await getPendingOrders();
    
    for (const order of pendingOrders) {
      try {
        const response = await fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(order)
        });
        
        if (response.ok) {
          await removePendingOrder(order.id);
          console.log('[SW] Synced pending order:', order.id);
        }
      } catch (error) {
        console.log('[SW] Failed to sync order:', order.id, error);
      }
    }
  } catch (error) {
    console.log('[SW] Background sync failed:', error);
  }
}

// Sync offline data
async function syncOfflineData() {
  try {
    // Refresh critical data
    const criticalRequests = [
      '/api/portfolio',
      '/api/positions',
      '/api/market-data/summary'
    ];
    
    await Promise.all(
      criticalRequests.map(url => 
        fetch(url).then(response => {
          if (response.ok) {
            return caches.open(API_CACHE_NAME).then(cache => 
              cache.put(url, response.clone())
            );
          }
        }).catch(() => {})
      )
    );
    
    console.log('[SW] Background data sync completed');
  } catch (error) {
    console.log('[SW] Background data sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', (event) => {
  console.log('[SW] Push notification received');
  
  const options = {
    body: 'You have new trading updates',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Details',
        icon: '/icons/checkmark.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/icons/xmark.png'
      }
    ]
  };
  
  if (event.data) {
    const data = event.data.json();
    options.body = data.body || options.body;
    options.data = { ...options.data, ...data };
  }
  
  event.waitUntil(
    self.registration.showNotification('NusaNexus Trading', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', (event) => {
  console.log('[SW] Notification clicked:', event.action);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/dashboard')
    );
  }
});

// Placeholder functions for IndexedDB operations
// These would be implemented with a proper IndexedDB wrapper
async function getPendingOrders() {
  // Implementation would use IndexedDB to get pending orders
  return [];
}

async function removePendingOrder(orderId) {
  // Implementation would remove order from IndexedDB
  console.log('Removing pending order:', orderId);
}