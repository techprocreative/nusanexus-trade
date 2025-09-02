import { toast } from 'sonner';
import { ApiError, ApiErrorCode } from '../types/api';

// Error severity levels
export enum ErrorSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

// Error categories for better organization
export enum ErrorCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  VALIDATION = 'validation',
  NETWORK = 'network',
  SERVER = 'server',
  CLIENT = 'client',
  BUSINESS = 'business'
}

interface ErrorConfig {
  severity: ErrorSeverity;
  category: ErrorCategory;
  userMessage: string;
  showToast: boolean;
  logToConsole: boolean;
  reportToService: boolean;
  retryable: boolean;
}

// Error configuration mapping
const ERROR_CONFIG: Record<ApiErrorCode, ErrorConfig> = {
  AUTHENTICATION_ERROR: {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.AUTHENTICATION,
    userMessage: 'Your session has expired. Please log in again.',
    showToast: true,
    logToConsole: true,
    reportToService: false,
    retryable: false
  },
  AUTHORIZATION_ERROR: {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.AUTHORIZATION,
    userMessage: 'You don\'t have permission to perform this action.',
    showToast: true,
    logToConsole: true,
    reportToService: false,
    retryable: false
  },
  VALIDATION_ERROR: {
    severity: ErrorSeverity.LOW,
    category: ErrorCategory.VALIDATION,
    userMessage: 'Please check your input and try again.',
    showToast: true,
    logToConsole: false,
    reportToService: false,
    retryable: false
  },
  NETWORK_ERROR: {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.NETWORK,
    userMessage: 'Unable to connect. Please check your internet connection.',
    showToast: true,
    logToConsole: true,
    reportToService: true,
    retryable: true
  },
  TIMEOUT_ERROR: {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.NETWORK,
    userMessage: 'Request timed out. Please try again.',
    showToast: true,
    logToConsole: true,
    reportToService: true,
    retryable: true
  },
  RATE_LIMIT_ERROR: {
    severity: ErrorSeverity.LOW,
    category: ErrorCategory.CLIENT,
    userMessage: 'Too many requests. Please wait a moment before trying again.',
    showToast: true,
    logToConsole: false,
    reportToService: false,
    retryable: true
  },
  SERVER_ERROR: {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.SERVER,
    userMessage: 'Server error occurred. Please try again later.',
    showToast: true,
    logToConsole: true,
    reportToService: true,
    retryable: true
  },
  OFFLINE_ERROR: {
    severity: ErrorSeverity.MEDIUM,
    category: ErrorCategory.NETWORK,
    userMessage: 'You\'re offline. Your request will be processed when connection is restored.',
    showToast: true,
    logToConsole: false,
    reportToService: false,
    retryable: true
  },
  UNKNOWN_ERROR: {
    severity: ErrorSeverity.HIGH,
    category: ErrorCategory.CLIENT,
    userMessage: 'An unexpected error occurred. Please try again.',
    showToast: true,
    logToConsole: true,
    reportToService: true,
    retryable: true
  }
};

// Error reporting interface
interface ErrorReport {
  error: ApiError;
  context?: Record<string, any>;
  userId?: string;
  sessionId?: string;
  timestamp: string;
  url: string;
  userAgent: string;
}

class ErrorHandler {
  private errorQueue: ErrorReport[] = [];
  private isReporting = false;
  private maxQueueSize = 50;
  private reportingEndpoint = '/api/errors';

  constructor(config?: {
    maxRetries?: number;
    retryDelay?: number;
    enableReporting?: boolean;
    reportingEndpoint?: string;
  }) {
    if (config) {
      if (config.maxRetries !== undefined) {
        this.maxQueueSize = config.maxRetries;
      }
      if (config.reportingEndpoint !== undefined) {
        this.reportingEndpoint = config.reportingEndpoint;
      }
    }
  }

  /**
   * Handle API errors with appropriate user feedback and logging
   */
  public handleApiError(error: ApiError, context?: Record<string, any>): void {
    const config = ERROR_CONFIG[error.code] || ERROR_CONFIG.UNKNOWN_ERROR;
    
    // Show user-friendly toast notification
    if (config.showToast) {
      this.showErrorToast(error, config);
    }

    // Log to console in development or for important errors
    if (config.logToConsole && (import.meta.env.DEV || config.severity === ErrorSeverity.HIGH)) {
      this.logError(error, config, context);
    }

    // Report to error tracking service
    if (config.reportToService) {
      this.reportError(error, context);
    }

    // Emit custom event for error tracking
    this.emitErrorEvent(error, config, context);
  }

  /**
   * Handle general JavaScript errors
   */
  public handleGeneralError(error: Error, context?: Record<string, any>): void {
    const apiError: ApiError = {
      code: 'UNKNOWN_ERROR',
      message: error.message,
      timestamp: new Date().toISOString(),
      details: {
        name: error.name,
        stack: error.stack,
        ...context
      }
    };

    this.handleApiError(apiError, context);
  }

  /**
   * Handle promise rejections
   */
  public handleUnhandledRejection(event: PromiseRejectionEvent): void {
    const error = event.reason;
    
    if (this.isApiError(error)) {
      this.handleApiError(error);
    } else if (error instanceof Error) {
      this.handleGeneralError(error, { type: 'unhandled_rejection' });
    } else {
      this.handleGeneralError(new Error(String(error)), { type: 'unhandled_rejection' });
    }
  }

  /**
   * Show appropriate toast notification based on error severity
   */
  private showErrorToast(error: ApiError, config: ErrorConfig): void {
    const message = error.message || config.userMessage;
    
    switch (config.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        toast.error(message, {
          duration: 6000,
          action: config.retryable ? {
            label: 'Retry',
            onClick: () => window.location.reload()
          } : undefined
        });
        break;
      case ErrorSeverity.MEDIUM:
        toast.error(message, { duration: 4000 });
        break;
      case ErrorSeverity.LOW:
        toast.warning(message, { duration: 3000 });
        break;
    }
  }

  /**
   * Log error to console with structured information
   */
  private logError(error: ApiError, config: ErrorConfig, context?: Record<string, any>): void {
    const logData = {
      error,
      config,
      context,
      timestamp: new Date().toISOString(),
      url: window.location.href
    };

    switch (config.severity) {
      case ErrorSeverity.CRITICAL:
      case ErrorSeverity.HIGH:
        console.error('[ERROR HANDLER]', logData);
        break;
      case ErrorSeverity.MEDIUM:
        console.warn('[ERROR HANDLER]', logData);
        break;
      case ErrorSeverity.LOW:
        console.info('[ERROR HANDLER]', logData);
        break;
    }
  }

  /**
   * Report error to monitoring service
   */
  private reportError(error: ApiError, context?: Record<string, any>): void {
    const report: ErrorReport = {
      error,
      context,
      userId: this.getUserId(),
      sessionId: this.getSessionId(),
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent
    };

    // Add to queue
    this.errorQueue.push(report);
    
    // Limit queue size
    if (this.errorQueue.length > this.maxQueueSize) {
      this.errorQueue.shift();
    }

    // Process queue
    this.processErrorQueue();
  }

  /**
   * Process error reporting queue
   */
  private async processErrorQueue(): Promise<void> {
    if (this.isReporting || this.errorQueue.length === 0) {
      return;
    }

    this.isReporting = true;

    try {
      const reports = [...this.errorQueue];
      this.errorQueue = [];

      // In a real app, send to your error reporting service
      // For now, we'll just log to console in development
      if (import.meta.env.DEV) {
        console.log('[ERROR REPORTS]', reports);
      } else {
        // Send to actual error reporting service
        await fetch(this.reportingEndpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ reports })
        });
      }
    } catch (reportingError) {
      console.error('Failed to report errors:', reportingError);
      // Re-add reports to queue for retry
      this.errorQueue.unshift(...this.errorQueue);
    } finally {
      this.isReporting = false;
    }
  }

  /**
   * Emit custom error event for application-level error handling
   */
  private emitErrorEvent(error: ApiError, config: ErrorConfig, context?: Record<string, any>): void {
    window.dispatchEvent(new CustomEvent('app:error', {
      detail: {
        error,
        config,
        context,
        timestamp: new Date().toISOString()
      }
    }));
  }

  /**
   * Check if error is an API error
   */
  private isApiError(error: any): error is ApiError {
    return error && typeof error === 'object' && 'code' in error && 'timestamp' in error;
  }

  /**
   * Get current user ID from storage or context
   */
  private getUserId(): string | undefined {
    try {
      const user = localStorage.getItem('user');
      return user ? JSON.parse(user).id : undefined;
    } catch {
      return undefined;
    }
  }

  /**
   * Get current session ID
   */
  private getSessionId(): string {
    let sessionId = sessionStorage.getItem('sessionId');
    if (!sessionId) {
      sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      sessionStorage.setItem('sessionId', sessionId);
    }
    return sessionId;
  }

  /**
   * Clear error queue (useful for testing)
   */
  public clearErrorQueue(): void {
    this.errorQueue = [];
  }

  /**
   * Get error statistics
   */
  public getErrorStats(): Record<string, number> {
    const stats: Record<string, number> = {};

    this.errorQueue.forEach(report => {
      const key = report.error.code;
      stats[key] = (stats[key] || 0) + 1;
    });

    return stats;
  }

  /**
   * Get current config
   */
  public getConfig(): any {
    return {
      maxRetries: this.errorQueue.length,
      retryDelay: 100,
      enableReporting: import.meta.env.DEV
    };
  }

  /**
   * Handle operations with retry
   */
  public async handleWithRetry<T>(fn: () => Promise<T>): Promise<T> {
    let lastError: any;
    for (let i = 0; i < 3; i++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
      }
    }
    throw lastError;
  }

  /**
   * Update configuration
   */
  public updateConfig(newConfig: Partial<any>): void {
    if (newConfig.maxRetries !== undefined) {
      this.maxQueueSize = newConfig.maxRetries;
    }
    if (newConfig.reportingEndpoint !== undefined) {
      this.reportingEndpoint = newConfig.reportingEndpoint;
    }
  }

  /**
   * Public access to report error (for testing compatibility)
   */
  public accessReportError(error: ApiError, context?: Record<string, any>): void {
    return this.reportError(error, context);
  }
}

// Create singleton instance
export const errorHandler = new ErrorHandler();

// Export the class for testing
export { ErrorHandler };

// Export individual functions for testing convenience
export const handleApiError = errorHandler.handleApiError.bind(errorHandler);
export const handleGlobalError = errorHandler.handleGeneralError.bind(errorHandler);
export const getErrorStats = errorHandler.getErrorStats.bind(errorHandler);
export const clearErrorStats = errorHandler.clearErrorQueue.bind(errorHandler);

export const reportError = (error: ApiError, context?: Record<string, any>) => errorHandler.accessReportError(error, context);

// Setup global error handlers
if (typeof window !== 'undefined') {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    errorHandler.handleUnhandledRejection(event);
  });

  // Handle general JavaScript errors
  window.addEventListener('error', (event) => {
    errorHandler.handleGeneralError(event.error, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno
    });
  });
}

export default errorHandler;