import { WebSocketMessage, WebSocketSubscription, WebSocketConfig } from '../types/api';
import { errorHandler } from './errorHandler';

interface QueuedMessage {
  id: string;
  message: any;
  timestamp: number;
  retries: number;
}

interface SubscriptionHandler {
  id: string;
  channel: string;
  handler: (message: WebSocketMessage) => void;
  filter?: (message: WebSocketMessage) => boolean;
}

class WebSocketManager {
  private ws: WebSocket | null = null;
  private config: WebSocketConfig;
  private connectionState: 'disconnected' | 'connecting' | 'connected' | 'error' = 'disconnected';
  private reconnectAttempts = 0;
  private reconnectTimeout: NodeJS.Timeout | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;
  private isManualDisconnect = false;
  
  // Message queuing
  private messageQueue: QueuedMessage[] = [];
  private maxQueueSize = 100;
  private maxRetries = 3;
  
  // Subscription management
  private subscriptions = new Map<string, SubscriptionHandler>();
  private channelSubscriptions = new Map<string, Set<string>>();
  
  // Event listeners
  private eventListeners = new Map<string, Set<Function>>();
  
  // Statistics
  private stats = {
    messagesReceived: 0,
    messagesSent: 0,
    reconnections: 0,
    lastActivity: null as string | null,
  };

  constructor(config: WebSocketConfig) {
    this.config = {
      reconnectInterval: 3000,
      maxReconnectAttempts: 5,
      heartbeatInterval: 30000,
      ...config,
    };
  }

  // Connection management
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        resolve();
        return;
      }

      // Skip connection if URL indicates mock mode
      if (this.config.url.includes('mock-disabled')) {
        this.connectionState = 'disconnected';
        this.emit('stateChange', { state: 'disconnected', error: 'WebSocket disabled in development mode' });
        reject(new Error('WebSocket disabled in development mode'));
        return;
      }

      this.isManualDisconnect = false;
      this.connectionState = 'connecting';
      this.emit('stateChange', { state: 'connecting' });

      try {
        this.ws = new WebSocket(this.config.url);

        this.ws.onopen = () => {
          console.log('WebSocket connected to:', this.config.url);
          this.connectionState = 'connected';
          this.reconnectAttempts = 0;
          this.stats.lastActivity = new Date().toISOString();
          
          this.startHeartbeat();
          this.processMessageQueue();
          this.resubscribeChannels();
          
          this.emit('connect');
          this.emit('stateChange', { state: 'connected' });
          resolve();
        };

        this.ws.onmessage = (event) => {
          this.handleMessage(event);
        };

        this.ws.onclose = (event) => {
          this.handleDisconnect(event);
        };

        this.ws.onerror = (error) => {
          this.handleError(error);
          reject(error);
        };
      } catch (error) {
        this.handleError(error as Event);
        reject(error);
      }
    });
  }

  disconnect(): void {
    this.isManualDisconnect = true;
    this.clearTimeouts();
    
    if (this.ws) {
      this.ws.close(1000, 'Manual disconnect');
      this.ws = null;
    }
    
    this.connectionState = 'disconnected';
    this.emit('disconnect');
    this.emit('stateChange', { state: 'disconnected' });
  }

  // Message handling
  private handleMessage(event: MessageEvent): void {
    try {
      const message: WebSocketMessage = JSON.parse(event.data);
      this.stats.messagesReceived++;
      this.stats.lastActivity = new Date().toISOString();
      
      // Handle system messages
      if (message.type === 'pong') {
        return; // Heartbeat response
      }
      
      if (message.type === 'error') {
        errorHandler.handleApiError({
          code: 'WEBSOCKET_ERROR',
          message: message.data?.message || 'WebSocket error',
          timestamp: new Date().toISOString()
        }, {
          context: 'websocket',
          severity: 'medium',
        });
        return;
      }
      
      // Route message to subscribers
      this.routeMessage(message);
      
      // Emit global message event
      this.emit('message', message);
    } catch (error) {
      console.error('Failed to parse WebSocket message:', error);
      errorHandler.handleApiError({
        code: 'WEBSOCKET_PARSE_ERROR',
        message: (error as Error).message,
        timestamp: new Date().toISOString()
      }, {
        context: 'websocket_parse',
        severity: 'low',
      });
    }
  }

  private routeMessage(message: WebSocketMessage): void {
    const channel = message.type;
    const channelSubs = this.channelSubscriptions.get(channel);
    
    if (channelSubs) {
      channelSubs.forEach(subId => {
        const subscription = this.subscriptions.get(subId);
        if (subscription) {
          // Apply filter if exists
          if (!subscription.filter || subscription.filter(message)) {
            try {
              subscription.handler(message);
            } catch (error) {
              console.error(`Error in subscription handler ${subId}:`, error);
            }
          }
        }
      });
    }
  }

  // Message sending with queuing
  sendMessage(message: any): boolean {
    const messageWithId = {
      ...message,
      id: this.generateId(),
      timestamp: new Date().toISOString(),
    };

    if (this.ws?.readyState === WebSocket.OPEN) {
      try {
        this.ws.send(JSON.stringify(messageWithId));
        this.stats.messagesSent++;
        this.stats.lastActivity = new Date().toISOString();
        return true;
      } catch (error) {
        console.error('Failed to send WebSocket message:', error);
        this.queueMessage(messageWithId);
        return false;
      }
    } else {
      this.queueMessage(messageWithId);
      return false;
    }
  }

  private queueMessage(message: any): void {
    if (this.messageQueue.length >= this.maxQueueSize) {
      // Remove oldest message
      this.messageQueue.shift();
    }
    
    this.messageQueue.push({
      id: message.id || this.generateId(),
      message,
      timestamp: Date.now(),
      retries: 0,
    });
  }

  private processMessageQueue(): void {
    if (this.ws?.readyState !== WebSocket.OPEN) {
      return;
    }

    const messagesToRetry: QueuedMessage[] = [];
    
    while (this.messageQueue.length > 0) {
      const queuedMessage = this.messageQueue.shift()!;
      
      try {
        this.ws.send(JSON.stringify(queuedMessage.message));
        this.stats.messagesSent++;
      } catch (error) {
        console.error('Failed to send queued message:', error);
        
        if (queuedMessage.retries < this.maxRetries) {
          queuedMessage.retries++;
          messagesToRetry.push(queuedMessage);
        }
      }
    }
    
    // Re-queue failed messages
    this.messageQueue.unshift(...messagesToRetry);
  }

  // Subscription management
  subscribe(channel: string, handler: (message: WebSocketMessage) => void, filter?: (message: WebSocketMessage) => boolean): string {
    const subscriptionId = this.generateId();
    
    const subscription: SubscriptionHandler = {
      id: subscriptionId,
      channel,
      handler,
      filter,
    };
    
    this.subscriptions.set(subscriptionId, subscription);
    
    // Add to channel subscriptions
    if (!this.channelSubscriptions.has(channel)) {
      this.channelSubscriptions.set(channel, new Set());
    }
    this.channelSubscriptions.get(channel)!.add(subscriptionId);
    
    // Send subscription message if connected
    if (this.connectionState === 'connected') {
      this.sendMessage({
        type: 'subscribe',
        channel,
        subscriptionId,
      });
    }
    
    return subscriptionId;
  }

  unsubscribe(subscriptionId: string): void {
    const subscription = this.subscriptions.get(subscriptionId);
    if (!subscription) {
      return;
    }
    
    // Remove from subscriptions
    this.subscriptions.delete(subscriptionId);
    
    // Remove from channel subscriptions
    const channelSubs = this.channelSubscriptions.get(subscription.channel);
    if (channelSubs) {
      channelSubs.delete(subscriptionId);
      if (channelSubs.size === 0) {
        this.channelSubscriptions.delete(subscription.channel);
        
        // Send unsubscribe message if connected
        if (this.connectionState === 'connected') {
          this.sendMessage({
            type: 'unsubscribe',
            channel: subscription.channel,
          });
        }
      }
    }
  }

  private resubscribeChannels(): void {
    for (const channel of this.channelSubscriptions.keys()) {
      this.sendMessage({
        type: 'subscribe',
        channel,
      });
    }
  }

  // Event system
  on(event: string, listener: Function): void {
    if (!this.eventListeners.has(event)) {
      this.eventListeners.set(event, new Set());
    }
    this.eventListeners.get(event)!.add(listener);
  }

  off(event: string, listener: Function): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.delete(listener);
    }
  }

  private emit(event: string, data?: any): void {
    const listeners = this.eventListeners.get(event);
    if (listeners) {
      listeners.forEach(listener => {
        try {
          listener(data);
        } catch (error) {
          console.error(`Error in event listener for ${event}:`, error);
        }
      });
    }
  }

  // Connection state and error handling
  private handleDisconnect(event: CloseEvent): void {
    console.log('WebSocket disconnected:', event.code, event.reason);
    this.clearTimeouts();
    this.connectionState = 'disconnected';
    
    this.emit('disconnect', { code: event.code, reason: event.reason });
    this.emit('stateChange', { state: 'disconnected' });
    
    // Auto-reconnect if not manually disconnected
    if (!this.isManualDisconnect && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
      this.scheduleReconnect();
    }
  }

  private handleError(error: Event): void {
    console.error('WebSocket error:', error);
    this.clearTimeouts();
    this.connectionState = 'error';
    
    this.emit('error', error);
    this.emit('stateChange', { state: 'error', error });
    
    errorHandler.handleApiError({
      code: 'WEBSOCKET_CONNECTION_ERROR',
      message: 'WebSocket connection error',
      timestamp: new Date().toISOString()
    }, {
      context: 'websocket_connection',
      severity: 'high',
    });
    
    // Auto-reconnect on error if not manually disconnected
    if (!this.isManualDisconnect && this.reconnectAttempts < this.config.maxReconnectAttempts!) {
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect(): void {
    this.reconnectAttempts++;
    this.stats.reconnections++;
    
    const delay = Math.min(
      this.config.reconnectInterval! * Math.pow(2, this.reconnectAttempts - 1),
      30000 // Max 30 seconds
    );
    
    console.log(`Scheduling reconnect attempt ${this.reconnectAttempts} in ${delay}ms`);
    
    this.reconnectTimeout = setTimeout(() => {
      this.connect().catch(error => {
        console.error('Reconnect failed:', error);
      });
    }, delay);
  }

  // Heartbeat
  private startHeartbeat(): void {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
    }
    
    this.heartbeatInterval = setInterval(() => {
      if (this.ws?.readyState === WebSocket.OPEN) {
        this.sendMessage({ type: 'ping' });
      }
    }, this.config.heartbeatInterval);
  }

  private clearTimeouts(): void {
    if (this.reconnectTimeout) {
      clearTimeout(this.reconnectTimeout);
      this.reconnectTimeout = null;
    }
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Utility methods
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public getters
  getConnectionState(): string {
    return this.connectionState;
  }

  isConnected(): boolean {
    return this.connectionState === 'connected';
  }

  getStats(): typeof this.stats {
    return { ...this.stats };
  }

  getQueueSize(): number {
    return this.messageQueue.length;
  }

  getSubscriptionCount(): number {
    return this.subscriptions.size;
  }

  // Cleanup
  destroy(): void {
    this.disconnect();
    this.subscriptions.clear();
    this.channelSubscriptions.clear();
    this.eventListeners.clear();
    this.messageQueue.length = 0;
  }
}

// Singleton instance
let wsManager: WebSocketManager | null = null;

export const createWebSocketManager = (config: WebSocketConfig): WebSocketManager => {
  if (wsManager) {
    wsManager.destroy();
  }
  wsManager = new WebSocketManager(config);
  return wsManager;
};

export const getWebSocketManager = (): WebSocketManager | null => {
  return wsManager;
};

export { WebSocketManager };
export default WebSocketManager;