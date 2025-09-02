import React, { useState, useEffect, useRef } from 'react';
import { X, Activity, Network, Database, Settings, Trash2, Download, Eye, EyeOff } from 'lucide-react';
import { getApiMockInterceptor } from '../lib/apiMock';
import { getWebSocketManager } from '../lib/websocketManager';
import { apiClient } from '../lib/apiClient';

interface ApiRequest {
  id: string;
  method: string;
  url: string;
  timestamp: number;
  duration?: number;
  status?: number;
  error?: string;
  requestData?: any;
  responseData?: any;
  headers?: Record<string, string>;
}

interface DebugPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

const DebugPanel: React.FC<DebugPanelProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'requests' | 'websocket' | 'performance' | 'settings'>('requests');
  const [requests, setRequests] = useState<ApiRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<ApiRequest | null>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [autoScroll, setAutoScroll] = useState(true);
  const [maxRequests, setMaxRequests] = useState(100);
  const requestsRef = useRef<HTMLDivElement>(null);

  // WebSocket stats
  const [wsStats, setWsStats] = useState({
    connectionState: 'disconnected',
    messagesReceived: 0,
    messagesSent: 0,
    reconnections: 0,
    queueSize: 0,
    subscriptionCount: 0,
  });

  // Performance metrics
  const [performanceMetrics, setPerformanceMetrics] = useState({
    averageResponseTime: 0,
    successRate: 0,
    errorRate: 0,
    totalRequests: 0,
    requestsPerMinute: 0,
  });

  // Mock API stats
  const [mockStats, setMockStats] = useState({
    enabled: false,
    requestCount: 0,
    enabledEndpoints: [] as string[],
  });

  useEffect(() => {
    if (!isOpen) return;

    // Set up API request interceptor
    const originalFetch = window.fetch;
    window.fetch = async (...args) => {
      const startTime = Date.now();
      const requestId = `req_${startTime}_${Math.random().toString(36).substr(2, 9)}`;
      const [url, options = {}] = args;
      
      const request: ApiRequest = {
        id: requestId,
        method: options.method || 'GET',
        url: url.toString(),
        timestamp: startTime,
        requestData: options.body ? JSON.parse(options.body as string) : undefined,
        headers: options.headers as Record<string, string>,
      };

      try {
        const response = await originalFetch(...args);
        const duration = Date.now() - startTime;
        
        const responseData = response.headers.get('content-type')?.includes('application/json')
          ? await response.clone().json()
          : await response.clone().text();

        const completedRequest: ApiRequest = {
          ...request,
          duration,
          status: response.status,
          responseData,
        };

        setRequests(prev => {
          const updated = [...prev, completedRequest];
          return updated.slice(-maxRequests); // Keep only last N requests
        });

        return response;
      } catch (error) {
        const duration = Date.now() - startTime;
        const errorRequest: ApiRequest = {
          ...request,
          duration,
          error: error instanceof Error ? error.message : 'Unknown error',
        };

        setRequests(prev => {
          const updated = [...prev, errorRequest];
          return updated.slice(-maxRequests);
        });

        throw error;
      }
    };

    // Update WebSocket stats periodically
    const wsStatsInterval = setInterval(() => {
      const wsManager = getWebSocketManager();
      if (wsManager) {
        setWsStats({
          connectionState: wsManager.getConnectionState(),
          ...wsManager.getStats(),
          queueSize: wsManager.getQueueSize(),
          subscriptionCount: wsManager.getSubscriptionCount(),
        });
      }
    }, 1000);

    // Update mock stats
    const updateMockStats = () => {
      const mockInterceptor = getApiMockInterceptor();
      if (mockInterceptor) {
        const stats = mockInterceptor.getStats();
        setMockStats({
          enabled: stats.config.enabled,
          requestCount: stats.requestCount,
          enabledEndpoints: stats.enabledEndpoints,
        });
      }
    };

    updateMockStats();
    const mockStatsInterval = setInterval(updateMockStats, 2000);

    return () => {
      window.fetch = originalFetch;
      clearInterval(wsStatsInterval);
      clearInterval(mockStatsInterval);
    };
  }, [isOpen, maxRequests]);

  // Calculate performance metrics
  useEffect(() => {
    if (requests.length === 0) return;

    const successfulRequests = requests.filter(r => r.status && r.status >= 200 && r.status < 300);
    const errorRequests = requests.filter(r => r.error || (r.status && r.status >= 400));
    const totalDuration = requests.reduce((sum, r) => sum + (r.duration || 0), 0);
    
    const now = Date.now();
    const oneMinuteAgo = now - 60000;
    const recentRequests = requests.filter(r => r.timestamp > oneMinuteAgo);

    setPerformanceMetrics({
      averageResponseTime: Math.round(totalDuration / requests.length),
      successRate: Math.round((successfulRequests.length / requests.length) * 100),
      errorRate: Math.round((errorRequests.length / requests.length) * 100),
      totalRequests: requests.length,
      requestsPerMinute: recentRequests.length,
    });
  }, [requests]);

  // Auto-scroll to bottom
  useEffect(() => {
    if (autoScroll && requestsRef.current) {
      requestsRef.current.scrollTop = requestsRef.current.scrollHeight;
    }
  }, [requests, autoScroll]);

  const clearRequests = () => {
    setRequests([]);
    setSelectedRequest(null);
  };

  const exportRequests = () => {
    const dataStr = JSON.stringify(requests, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `api-requests-${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const getStatusColor = (status?: number, error?: string) => {
    if (error) return 'text-red-500';
    if (!status) return 'text-gray-500';
    if (status >= 200 && status < 300) return 'text-green-500';
    if (status >= 400) return 'text-red-500';
    return 'text-yellow-500';
  };

  const formatDuration = (duration?: number) => {
    if (!duration) return '-';
    return duration < 1000 ? `${duration}ms` : `${(duration / 1000).toFixed(2)}s`;
  };

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex items-end justify-end">
      <div className={`bg-white dark:bg-gray-900 border-l border-gray-200 dark:border-gray-700 transition-all duration-300 ${
        isCollapsed ? 'w-12' : 'w-96'
      } h-full flex flex-col`}>
        {/* Header */}
        <div className="flex items-center justify-between p-3 border-b border-gray-200 dark:border-gray-700">
          {!isCollapsed && (
            <>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Debug Panel</h3>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setIsCollapsed(true)}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <EyeOff className="w-4 h-4" />
                </button>
                <button
                  onClick={onClose}
                  className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </>
          )}
          {isCollapsed && (
            <button
              onClick={() => setIsCollapsed(false)}
              className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 mx-auto"
            >
              <Eye className="w-4 h-4" />
            </button>
          )}
        </div>

        {!isCollapsed && (
          <>
            {/* Tabs */}
            <div className="flex border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'requests', label: 'Requests', icon: Network },
                { id: 'websocket', label: 'WebSocket', icon: Activity },
                { id: 'performance', label: 'Performance', icon: Database },
                { id: 'settings', label: 'Settings', icon: Settings },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id as any)}
                  className={`flex items-center space-x-1 px-3 py-2 text-sm font-medium border-b-2 transition-colors ${
                    activeTab === id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Content */}
            <div className="flex-1 overflow-hidden">
              {activeTab === 'requests' && (
                <div className="h-full flex flex-col">
                  {/* Request controls */}
                  <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={clearRequests}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Clear requests"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={exportRequests}
                        className="p-1 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        title="Export requests"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <label className="flex items-center space-x-1 text-xs">
                        <input
                          type="checkbox"
                          checked={autoScroll}
                          onChange={(e) => setAutoScroll(e.target.checked)}
                          className="rounded"
                        />
                        <span>Auto-scroll</span>
                      </label>
                    </div>
                    <span className="text-xs text-gray-500">{requests.length} requests</span>
                  </div>

                  {/* Request list */}
                  <div ref={requestsRef} className="flex-1 overflow-y-auto">
                    {requests.map((request) => (
                      <div
                        key={request.id}
                        onClick={() => setSelectedRequest(request)}
                        className={`p-2 border-b border-gray-100 dark:border-gray-800 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 ${
                          selectedRequest?.id === request.id ? 'bg-blue-50 dark:bg-blue-900/20' : ''
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`text-xs font-mono ${getStatusColor(request.status, request.error)}`}>
                              {request.method}
                            </span>
                            <span className={`text-xs ${getStatusColor(request.status, request.error)}`}>
                              {request.status || 'ERR'}
                            </span>
                          </div>
                          <div className="flex items-center space-x-2 text-xs text-gray-500">
                            <span>{formatDuration(request.duration)}</span>
                            <span>{formatTimestamp(request.timestamp)}</span>
                          </div>
                        </div>
                        <div className="text-xs text-gray-600 dark:text-gray-400 truncate mt-1">
                          {request.url}
                        </div>
                        {request.error && (
                          <div className="text-xs text-red-500 truncate mt-1">
                            {request.error}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Request details */}
                  {selectedRequest && (
                    <div className="border-t border-gray-200 dark:border-gray-700 p-3 max-h-48 overflow-y-auto">
                      <h4 className="text-sm font-medium mb-2">Request Details</h4>
                      <div className="space-y-2 text-xs">
                        <div><strong>URL:</strong> {selectedRequest.url}</div>
                        <div><strong>Method:</strong> {selectedRequest.method}</div>
                        <div><strong>Status:</strong> {selectedRequest.status || 'Error'}</div>
                        <div><strong>Duration:</strong> {formatDuration(selectedRequest.duration)}</div>
                        {selectedRequest.requestData && (
                          <div>
                            <strong>Request Data:</strong>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                              {JSON.stringify(selectedRequest.requestData, null, 2)}
                            </pre>
                          </div>
                        )}
                        {selectedRequest.responseData && (
                          <div>
                            <strong>Response Data:</strong>
                            <pre className="mt-1 p-2 bg-gray-100 dark:bg-gray-800 rounded text-xs overflow-x-auto">
                              {JSON.stringify(selectedRequest.responseData, null, 2)}
                            </pre>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'websocket' && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Connection</div>
                      <div className={`text-sm font-medium ${
                        wsStats.connectionState === 'connected' ? 'text-green-500' :
                        wsStats.connectionState === 'connecting' ? 'text-yellow-500' :
                        'text-red-500'
                      }`}>
                        {wsStats.connectionState}
                      </div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Queue Size</div>
                      <div className="text-sm font-medium">{wsStats.queueSize}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Messages Received</div>
                      <div className="text-sm font-medium">{wsStats.messagesReceived}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Messages Sent</div>
                      <div className="text-sm font-medium">{wsStats.messagesSent}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Reconnections</div>
                      <div className="text-sm font-medium">{wsStats.reconnections}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Subscriptions</div>
                      <div className="text-sm font-medium">{wsStats.subscriptionCount}</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'performance' && (
                <div className="p-4 space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Avg Response Time</div>
                      <div className="text-sm font-medium">{performanceMetrics.averageResponseTime}ms</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Success Rate</div>
                      <div className="text-sm font-medium text-green-500">{performanceMetrics.successRate}%</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Error Rate</div>
                      <div className="text-sm font-medium text-red-500">{performanceMetrics.errorRate}%</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded">
                      <div className="text-xs text-gray-500 mb-1">Total Requests</div>
                      <div className="text-sm font-medium">{performanceMetrics.totalRequests}</div>
                    </div>
                    <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded col-span-2">
                      <div className="text-xs text-gray-500 mb-1">Requests/Minute</div>
                      <div className="text-sm font-medium">{performanceMetrics.requestsPerMinute}</div>
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Mock API Status</h4>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Enabled:</span>
                        <span className={`text-xs font-medium ${
                          mockStats.enabled ? 'text-green-500' : 'text-red-500'
                        }`}>
                          {mockStats.enabled ? 'Yes' : 'No'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs">Mock Requests:</span>
                        <span className="text-xs font-medium">{mockStats.requestCount}</span>
                      </div>
                      <div>
                        <span className="text-xs">Enabled Endpoints:</span>
                        <div className="mt-1 text-xs text-gray-600 dark:text-gray-400">
                          {mockStats.enabledEndpoints.length > 0 
                            ? mockStats.enabledEndpoints.join(', ')
                            : 'None'
                          }
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="p-4 space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Max Requests to Keep</label>
                    <input
                      type="number"
                      value={maxRequests}
                      onChange={(e) => setMaxRequests(Number(e.target.value))}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800"
                      min="10"
                      max="1000"
                    />
                  </div>
                  
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium mb-2">Debug Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={clearRequests}
                        className="w-full px-3 py-2 text-sm bg-red-500 text-white rounded hover:bg-red-600"
                      >
                        Clear All Requests
                      </button>
                      <button
                        onClick={exportRequests}
                        className="w-full px-3 py-2 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                      >
                        Export Requests
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default DebugPanel;