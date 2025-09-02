import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import axios, { AxiosError, AxiosResponse } from 'axios';
import { apiClient } from '../lib/apiClient';
import { ApiError } from '../types/api';

// Mock axios
vi.mock('axios');
const mockedAxios = axios as any;

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock navigator.onLine
Object.defineProperty(navigator, 'onLine', {
  writable: true,
  value: true,
});

describe('ApiClient', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorageMock.getItem.mockReturnValue(null);
    (navigator as any).onLine = true;
    
    // Mock axios.create to return a mock instance
    mockedAxios.create.mockReturnValue({
      interceptors: {
        request: { use: vi.fn() },
        response: { use: vi.fn() },
      },
      get: vi.fn(),
      post: vi.fn(),
      put: vi.fn(),
      patch: vi.fn(),
      delete: vi.fn(),
      defaults: { headers: { common: {} } },
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Initialization', () => {
    it('should create axios instance with correct config', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: process.env.VITE_API_BASE_URL || 'http://localhost:3001/api',
        timeout: 30000,
        headers: {
          'Content-Type': 'application/json',
        },
      });
    });

    it('should set up request and response interceptors', () => {
      const mockInstance = mockedAxios.create();
      expect(mockInstance.interceptors.request.use).toHaveBeenCalled();
      expect(mockInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe('Token Management', () => {
    it('should set authorization token', () => {
      const token = 'test-token';
      apiClient.setAuthToken(token);
      
      expect(localStorageMock.setItem).toHaveBeenCalledWith('auth_token', token);
    });

    it('should clear authorization token', () => {
      apiClient.clearAuthToken();
      
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('auth_token');
      expect(localStorageMock.removeItem).toHaveBeenCalledWith('refresh_token');
    });

    it('should get stored token', () => {
      const token = 'stored-token';
      localStorageMock.getItem.mockReturnValue(token);
      
      const result = apiClient.getStoredToken();
      expect(result).toBe(token);
      expect(localStorageMock.getItem).toHaveBeenCalledWith('auth_token');
    });
  });

  describe('HTTP Methods', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
        put: vi.fn(),
        patch: vi.fn(),
        delete: vi.fn(),
      };
      
      // Mock the private axios instance
      (apiClient as any).axiosInstance = mockAxiosInstance;
    });

    it('should make GET request', async () => {
      const mockResponse = { data: { success: true } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await apiClient.get('/test');
      
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make POST request with data', async () => {
      const mockResponse = { data: { id: 1 } };
      const postData = { name: 'test' };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await apiClient.post('/test', postData);
      
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/test', postData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PUT request', async () => {
      const mockResponse = { data: { updated: true } };
      const putData = { name: 'updated' };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await apiClient.put('/test/1', putData);
      
      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/test/1', putData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make PATCH request', async () => {
      const mockResponse = { data: { patched: true } };
      const patchData = { status: 'active' };
      mockAxiosInstance.patch.mockResolvedValue(mockResponse);

      const result = await apiClient.patch('/test/1', patchData);
      
      expect(mockAxiosInstance.patch).toHaveBeenCalledWith('/test/1', patchData, undefined);
      expect(result).toEqual(mockResponse.data);
    });

    it('should make DELETE request', async () => {
      const mockResponse = { data: { deleted: true } };
      mockAxiosInstance.delete.mockResolvedValue(mockResponse);

      const result = await apiClient.delete('/test/1');
      
      expect(mockAxiosInstance.delete).toHaveBeenCalledWith('/test/1', undefined);
      expect(result).toEqual(mockResponse.data);
    });
  });

  describe('Error Handling', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
      };
      (apiClient as any).axiosInstance = mockAxiosInstance;
    });

    it('should handle network errors', async () => {
      const networkError = new Error('Network Error');
      (networkError as any).code = 'NETWORK_ERROR';
      mockAxiosInstance.get.mockRejectedValue(networkError);

      await expect(apiClient.get('/test')).rejects.toThrow('Network Error');
    });

    it('should handle API errors with response', async () => {
      const apiError = {
        response: {
          status: 400,
          data: {
            error: 'Bad Request',
            message: 'Invalid input',
            code: 'VALIDATION_ERROR',
          },
        },
        isAxiosError: true,
      } as AxiosError;

      mockAxiosInstance.get.mockRejectedValue(apiError);

      await expect(apiClient.get('/test')).rejects.toMatchObject({
        message: 'Invalid input',
        status: 400,
        code: 'VALIDATION_ERROR',
      });
    });

    it('should handle timeout errors', async () => {
      const timeoutError = new Error('timeout of 30000ms exceeded');
      (timeoutError as any).code = 'ECONNABORTED';
      mockAxiosInstance.get.mockRejectedValue(timeoutError);

      await expect(apiClient.get('/test')).rejects.toThrow('Request timeout');
    });
  });

  describe('Offline Handling', () => {
    let mockAxiosInstance: any;

    beforeEach(() => {
      mockAxiosInstance = {
        get: vi.fn(),
        post: vi.fn(),
      };
      (apiClient as any).axiosInstance = mockAxiosInstance;
    });

    it('should queue requests when offline', async () => {
      (navigator as any).onLine = false;
      
      const requestPromise = apiClient.get('/test');
      
      // Request should be queued, not executed immediately
      expect(mockAxiosInstance.get).not.toHaveBeenCalled();
      
      // Simulate going back online
      (navigator as any).onLine = true;
      window.dispatchEvent(new Event('online'));
      
      // Wait a bit for the queue to process
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Now the request should be executed
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/test', undefined);
    });
  });

  describe('Debug Mode', () => {
    it('should enable debug mode', () => {
      apiClient.enableDebugMode();
      expect(apiClient.isDebugMode()).toBe(true);
    });

    it('should disable debug mode', () => {
      apiClient.enableDebugMode();
      apiClient.disableDebugMode();
      expect(apiClient.isDebugMode()).toBe(false);
    });

    it('should emit debug events when enabled', async () => {
      const debugListener = vi.fn();
      document.addEventListener('api-debug', debugListener);
      
      apiClient.enableDebugMode();
      
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { success: true } }),
      };
      (apiClient as any).axiosInstance = mockAxiosInstance;
      
      await apiClient.get('/test');
      
      expect(debugListener).toHaveBeenCalled();
      
      document.removeEventListener('api-debug', debugListener);
    });
  });

  describe('Request Statistics', () => {
    it('should track request statistics', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { success: true } }),
      };
      (apiClient as any).axiosInstance = mockAxiosInstance;
      
      await apiClient.get('/test');
      
      const stats = apiClient.getRequestStats();
      expect(stats.totalRequests).toBeGreaterThan(0);
      expect(stats.successfulRequests).toBeGreaterThan(0);
    });

    it('should reset request statistics', async () => {
      const mockAxiosInstance = {
        get: vi.fn().mockResolvedValue({ data: { success: true } }),
      };
      (apiClient as any).axiosInstance = mockAxiosInstance;
      
      await apiClient.get('/test');
      apiClient.resetRequestStats();
      
      const stats = apiClient.getRequestStats();
      expect(stats.totalRequests).toBe(0);
      expect(stats.successfulRequests).toBe(0);
    });
  });
});