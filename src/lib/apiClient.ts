import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse, AxiosError } from 'axios';
import axiosRetry from 'axios-retry';
import { 
  ApiClientConfig, 
  ApiResponse, 
  ApiError, 
  QueuedRequest, 
  ApiErrorCode,
  RefreshTokenRequest,
  RefreshTokenResponse
} from '../types/api';

class ApiClient {
  private instance: AxiosInstance;
  private config: ApiClientConfig;
  private offlineQueue: QueuedRequest[] = [];
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (value: any) => void;
    reject: (error: any) => void;
  }> = [];
  private debugMode = false;
  private requestCounter = 0;

  constructor(config: Partial<ApiClientConfig> = {}) {
    this.config = {
      baseURL: import.meta.env.VITE_API_BASE_URL || 'https://api.nusanexus.com',
      timeout: 30000,
      retryAttempts: 3,
      retryDelay: 1000,
      enableOfflineQueue: true,
      enableLogging: import.meta.env.DEV,
      ...config
    };

    this.instance = axios.create({
      baseURL: this.config.baseURL,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    this.setupInterceptors();
    this.setupRetry();
    this.setupOfflineDetection();
  }

  private setupInterceptors(): void {
    // Request interceptor
    this.instance.interceptors.request.use(
      (config) => {
        const requestId = `req_${++this.requestCounter}_${Date.now()}`;
        config.metadata = { requestId, startTime: Date.now() };

        // Add authentication token
        const token = this.getAccessToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }

        // Log request in debug mode
        if (this.config.enableLogging) {
          console.log(`[API Request] ${config.method?.toUpperCase()} ${config.url}`, {
            requestId,
            data: config.data,
            params: config.params
          });
        }

        return config;
      },
      (error) => {
        if (this.config.enableLogging) {
          console.error('[API Request Error]', error);
        }
        return Promise.reject(this.transformError(error));
      }
    );

    // Response interceptor
    this.instance.interceptors.response.use(
      (response) => {
        const duration = Date.now() - response.config.metadata?.startTime;
        
        if (this.config.enableLogging) {
          console.log(`[API Response] ${response.status} ${response.config.url}`, {
            requestId: response.config.metadata?.requestId,
            duration: `${duration}ms`,
            data: response.data
          });
        }

        // Emit debug event for development tools
        if (this.debugMode) {
          this.emitDebugEvent({
            requestId: response.config.metadata?.requestId,
            method: response.config.method?.toUpperCase() || 'GET',
            url: response.config.url || '',
            requestData: response.config.data,
            responseData: response.data,
            duration,
            status: response.status,
            timestamp: new Date().toISOString()
          });
        }

        return response;
      },
      async (error: AxiosError) => {
        const originalRequest = error.config as any;
        
        // Handle token refresh
        if (error.response?.status === 401 && !originalRequest._retry) {
          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            }).then(token => {
              originalRequest.headers.Authorization = `Bearer ${token}`;
              return this.instance(originalRequest);
            }).catch(err => {
              return Promise.reject(err);
            });
          }

          originalRequest._retry = true;
          this.isRefreshing = true;

          try {
            const newToken = await this.refreshToken();
            this.processQueue(null, newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return this.instance(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError, null);
            this.handleAuthenticationError();
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        // Handle offline requests
        if (!navigator.onLine && this.config.enableOfflineQueue) {
          this.queueRequest(originalRequest);
          return Promise.reject(this.createError('OFFLINE_ERROR', 'Request queued for when online'));
        }

        const transformedError = this.transformError(error);
        
        if (this.config.enableLogging) {
          console.error('[API Response Error]', {
            requestId: originalRequest?.metadata?.requestId,
            error: transformedError
          });
        }

        // Emit debug event for errors
        if (this.debugMode && originalRequest?.metadata) {
          this.emitDebugEvent({
            requestId: originalRequest.metadata.requestId,
            method: originalRequest.method?.toUpperCase() || 'GET',
            url: originalRequest.url || '',
            requestData: originalRequest.data,
            duration: Date.now() - originalRequest.metadata.startTime,
            status: error.response?.status || 0,
            timestamp: new Date().toISOString(),
            error: transformedError.message
          });
        }

        return Promise.reject(transformedError);
      }
    );
  }

  private setupRetry(): void {
    axiosRetry(this.instance, {
      retries: this.config.retryAttempts,
      retryDelay: (retryCount) => {
        return retryCount * this.config.retryDelay;
      },
      retryCondition: (error) => {
        return axiosRetry.isNetworkOrIdempotentRequestError(error) ||
               error.response?.status === 429 ||
               (error.response?.status || 0) >= 500;
      }
    });
  }

  private setupOfflineDetection(): void {
    window.addEventListener('online', () => {
      this.processOfflineQueue();
    });
  }

  private getAccessToken(): string | null {
    return localStorage.getItem('accessToken');
  }

  private getRefreshToken(): string | null {
    return localStorage.getItem('refreshToken');
  }

  private setTokens(accessToken: string, refreshToken?: string): void {
    localStorage.setItem('accessToken', accessToken);
    if (refreshToken) {
      localStorage.setItem('refreshToken', refreshToken);
    }
  }

  private async refreshToken(): Promise<string> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw this.createError('AUTHENTICATION_ERROR', 'No refresh token available');
    }

    try {
      const response = await axios.post<ApiResponse<RefreshTokenResponse>>(
        `${this.config.baseURL}/auth/refresh`,
        { refreshToken } as RefreshTokenRequest
      );

      const { accessToken } = response.data.data;
      this.setTokens(accessToken);
      return accessToken;
    } catch (error) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      throw this.createError('AUTHENTICATION_ERROR', 'Failed to refresh token');
    }
  }

  private processQueue(error: any, token: string | null): void {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    
    this.failedQueue = [];
  }

  private handleAuthenticationError(): void {
    // Clear tokens
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    
    // Redirect to login or emit event
    window.dispatchEvent(new CustomEvent('auth:logout'));
  }

  private queueRequest(config: AxiosRequestConfig): void {
    const queuedRequest: QueuedRequest = {
      id: `queue_${Date.now()}_${Math.random()}`,
      url: config.url || '',
      method: config.method || 'GET',
      data: config.data,
      headers: config.headers as Record<string, string>,
      timestamp: new Date().toISOString(),
      retryCount: 0
    };

    this.offlineQueue.push(queuedRequest);
  }

  private async processOfflineQueue(): Promise<void> {
    if (this.offlineQueue.length === 0) return;

    const queue = [...this.offlineQueue];
    this.offlineQueue = [];

    for (const request of queue) {
      try {
        await this.instance({
          url: request.url,
          method: request.method as any,
          data: request.data,
          headers: request.headers
        });
      } catch (error) {
        // Re-queue failed requests with retry limit
        if (request.retryCount < 3) {
          request.retryCount++;
          this.offlineQueue.push(request);
        }
      }
    }
  }

  private transformError(error: any): ApiError {
    if (error.response) {
      // Server responded with error status
      const status = error.response.status;
      let code: ApiErrorCode;
      
      switch (status) {
        case 401:
          code = 'AUTHENTICATION_ERROR';
          break;
        case 403:
          code = 'AUTHORIZATION_ERROR';
          break;
        case 422:
          code = 'VALIDATION_ERROR';
          break;
        case 429:
          code = 'RATE_LIMIT_ERROR';
          break;
        case 500:
        case 502:
        case 503:
        case 504:
          code = 'SERVER_ERROR';
          break;
        default:
          code = 'UNKNOWN_ERROR';
      }

      return this.createError(code, error.response.data?.message || error.message, error.response.data);
    } else if (error.request) {
      // Network error
      return this.createError('NETWORK_ERROR', 'Network connection failed');
    } else if (error.code === 'ECONNABORTED') {
      // Timeout error
      return this.createError('TIMEOUT_ERROR', 'Request timeout');
    } else {
      // Unknown error
      return this.createError('UNKNOWN_ERROR', error.message || 'An unknown error occurred');
    }
  }

  private createError(code: ApiErrorCode, message: string, details?: any): ApiError {
    return {
      code,
      message,
      details,
      timestamp: new Date().toISOString()
    };
  }

  private emitDebugEvent(debugInfo: any): void {
    window.dispatchEvent(new CustomEvent('api:debug', { detail: debugInfo }));
  }

  // Public methods
  public enableDebugMode(): void {
    this.debugMode = true;
  }

  public disableDebugMode(): void {
    this.debugMode = false;
  }

  public async get<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.get<ApiResponse<T>>(url, config);
    return response.data;
  }

  public async post<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.post<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async put<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.put<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async patch<T = any>(url: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.patch<ApiResponse<T>>(url, data, config);
    return response.data;
  }

  public async delete<T = any>(url: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    const response = await this.instance.delete<ApiResponse<T>>(url, config);
    return response.data;
  }

  public setAuthToken(token: string): void {
    this.setTokens(token);
  }

  public clearAuthToken(): void {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }

  public getQueueLength(): number {
    return this.offlineQueue.length;
  }

  public clearQueue(): void {
    this.offlineQueue = [];
  }
}

// Create and export singleton instance
export const apiClient = new ApiClient();
export default apiClient;