import { describe, it, expect, beforeEach, afterEach, vi, Mock } from 'vitest';
import {
  ErrorHandler,
  handleApiError,
  handleGlobalError,
  reportError,
  getErrorStats,
  clearErrorStats,
} from '../lib/errorHandler';
import { ApiError } from '../types/api';

// Mock toast notifications
const mockToast = {
  error: vi.fn(),
  warning: vi.fn(),
  info: vi.fn(),
};

vi.mock('sonner', () => ({
  toast: mockToast,
}));

// Mock console methods
const originalConsole = { ...console };
beforeEach(() => {
  console.error = vi.fn();
  console.warn = vi.fn();
  console.info = vi.fn();
});

afterEach(() => {
  Object.assign(console, originalConsole);
  vi.clearAllMocks();
});

describe('ErrorHandler', () => {
  beforeEach(() => {
    clearErrorStats();
  });

  describe('handleApiError', () => {
    it('should handle authentication errors', () => {
      const error: ApiError = {
        message: 'Unauthorized',
        status: 401,
        code: 'UNAUTHORIZED',
        timestamp: new Date().toISOString(),
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('Please log in to continue');
      expect(result.shouldShowToast).toBe(true);
      expect(result.shouldLog).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('authentication');
    });

    it('should handle validation errors', () => {
      const error: ApiError = {
        message: 'Validation failed',
        status: 400,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
        details: {
          field: 'email',
          message: 'Invalid email format',
        },
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('Please check your input and try again');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.category).toBe('validation');
    });

    it('should handle network errors', () => {
      const error: ApiError = {
        message: 'Network Error',
        status: 0,
        code: 'NETWORK_ERROR',
        timestamp: new Date().toISOString(),
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('Please check your internet connection and try again');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('network');
    });

    it('should handle server errors', () => {
      const error: ApiError = {
        message: 'Internal Server Error',
        status: 500,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('Something went wrong on our end. Please try again later');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('server');
    });

    it('should handle rate limiting errors', () => {
      const error: ApiError = {
        message: 'Too Many Requests',
        status: 429,
        code: 'RATE_LIMIT_EXCEEDED',
        timestamp: new Date().toISOString(),
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('Too many requests. Please wait a moment and try again');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.category).toBe('rate_limit');
    });

    it('should handle unknown errors', () => {
      const error: ApiError = {
        message: 'Unknown error',
        status: 418,
        code: 'UNKNOWN_ERROR',
        timestamp: new Date().toISOString(),
      };

      const result = handleApiError(error);

      expect(result.userMessage).toBe('An unexpected error occurred. Please try again');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.category).toBe('unknown');
    });
  });

  describe('handleGlobalError', () => {
    it('should handle JavaScript errors', () => {
      const error = new Error('Test error');
      const result = handleGlobalError(error, { context: 'test' });

      expect(result.userMessage).toBe('An unexpected error occurred');
      expect(result.shouldShowToast).toBe(true);
      expect(result.shouldLog).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('javascript');
    });

    it('should handle promise rejection errors', () => {
      const error = { reason: 'Promise rejected', type: 'unhandledrejection' };
      const result = handleGlobalError(error, { context: 'promise' });

      expect(result.userMessage).toBe('An unexpected error occurred');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('high');
      expect(result.category).toBe('promise');
    });

    it('should handle chunk load errors', () => {
      const error = new Error('Loading chunk 5 failed');
      const result = handleGlobalError(error, { context: 'chunk' });

      expect(result.userMessage).toBe('Failed to load application resources. Please refresh the page');
      expect(result.shouldShowToast).toBe(true);
      expect(result.severity).toBe('medium');
      expect(result.category).toBe('chunk');
    });
  });

  describe('reportError', () => {
    it('should report error with default options', async () => {
      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      };

      await reportError(error);

      expect(mockToast.error).toHaveBeenCalledWith('Please check your input and try again');
      expect(console.error).toHaveBeenCalled();
    });

    it('should report error with custom options', async () => {
      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      };

      await reportError(error, {
        showToast: false,
        logToConsole: false,
        context: { userId: '123' },
      });

      expect(mockToast.error).not.toHaveBeenCalled();
      expect(console.error).not.toHaveBeenCalled();
    });

    it('should handle error reporting queue', async () => {
      const errors = Array.from({ length: 5 }, (_, i) => ({
        message: `Test error ${i}`,
        status: 400,
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      }));

      // Report multiple errors quickly
      const promises = errors.map(error => reportError(error));
      await Promise.all(promises);

      // Should have processed all errors
      expect(mockToast.error).toHaveBeenCalledTimes(5);
    });
  });

  describe('Error Statistics', () => {
    it('should track error statistics', async () => {
      const error1: ApiError = {
        message: 'Error 1',
        status: 400,
        code: 'VALIDATION_ERROR',
        timestamp: new Date().toISOString(),
      };

      const error2: ApiError = {
        message: 'Error 2',
        status: 500,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };

      await reportError(error1);
      await reportError(error2);

      const stats = getErrorStats();
      expect(stats.totalErrors).toBe(2);
      expect(stats.errorsByCategory.validation).toBe(1);
      expect(stats.errorsByCategory.server).toBe(1);
      expect(stats.errorsBySeverity.medium).toBe(1);
      expect(stats.errorsBySeverity.high).toBe(1);
    });

    it('should clear error statistics', async () => {
      const error: ApiError = {
        message: 'Test error',
        status: 400,
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      };

      await reportError(error);
      clearErrorStats();

      const stats = getErrorStats();
      expect(stats.totalErrors).toBe(0);
      expect(Object.values(stats.errorsByCategory).every(count => count === 0)).toBe(true);
      expect(Object.values(stats.errorsBySeverity).every(count => count === 0)).toBe(true);
    });

    it('should track recent errors', async () => {
      const error: ApiError = {
        message: 'Recent error',
        status: 400,
        code: 'TEST_ERROR',
        timestamp: new Date().toISOString(),
      };

      await reportError(error);

      const stats = getErrorStats();
      expect(stats.recentErrors).toHaveLength(1);
      expect(stats.recentErrors[0].message).toBe('Recent error');
    });
  });

  describe('ErrorHandler Class', () => {
    let errorHandler: ErrorHandler;

    beforeEach(() => {
      errorHandler = new ErrorHandler({
        maxRetries: 3,
        retryDelay: 100,
        enableReporting: true,
        reportingEndpoint: '/api/errors',
      });
    });

    it('should initialize with custom config', () => {
      expect(errorHandler.getConfig().maxRetries).toBe(3);
      expect(errorHandler.getConfig().retryDelay).toBe(100);
      expect(errorHandler.getConfig().enableReporting).toBe(true);
    });

    it('should handle errors with retry logic', async () => {
      const error: ApiError = {
        message: 'Retryable error',
        status: 500,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };

      const retryFn = vi.fn().mockRejectedValueOnce(error).mockResolvedValueOnce('success');
      
      const result = await errorHandler.handleWithRetry(retryFn);
      expect(result).toBe('success');
      expect(retryFn).toHaveBeenCalledTimes(2);
    });

    it('should fail after max retries', async () => {
      const error: ApiError = {
        message: 'Persistent error',
        status: 500,
        code: 'INTERNAL_ERROR',
        timestamp: new Date().toISOString(),
      };

      const retryFn = vi.fn().mockRejectedValue(error);
      
      await expect(errorHandler.handleWithRetry(retryFn)).rejects.toThrow('Persistent error');
      expect(retryFn).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it('should update configuration', () => {
      errorHandler.updateConfig({ maxRetries: 5 });
      expect(errorHandler.getConfig().maxRetries).toBe(5);
    });
  });

  describe('Global Error Listeners', () => {
    it('should set up global error listeners', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');
      
      // Import should set up listeners
      require('../lib/errorHandler');
      
      expect(addEventListenerSpy).toHaveBeenCalledWith('error', expect.any(Function));
      expect(addEventListenerSpy).toHaveBeenCalledWith('unhandledrejection', expect.any(Function));
    });
  });
});