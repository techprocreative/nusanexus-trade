import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { ApiError } from '../types/api';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    };
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    return {
      hasError: true,
      error,
      errorId
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({ errorInfo });
    
    // Log error to console in development
    if (import.meta.env.DEV) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // Report error to monitoring service
    this.reportError(error, errorInfo);
    
    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  private reportError = (error: Error, errorInfo: ErrorInfo) => {
    // In a real app, you would send this to your error reporting service
    // For now, we'll just emit a custom event that can be caught by monitoring tools
    window.dispatchEvent(new CustomEvent('app:error', {
      detail: {
        error: {
          message: error.message,
          stack: error.stack,
          name: error.name
        },
        errorInfo,
        errorId: this.state.errorId,
        timestamp: new Date().toISOString(),
        url: window.location.href,
        userAgent: navigator.userAgent
      }
    }));
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private getErrorMessage = (error: Error): string => {
    // Check if it's an API error
    if ('code' in error && 'timestamp' in error) {
      const apiError = error as ApiError;
      switch (apiError.code) {
        case 'NETWORK_ERROR':
          return 'Unable to connect to our servers. Please check your internet connection.';
        case 'AUTHENTICATION_ERROR':
          return 'Your session has expired. Please log in again.';
        case 'AUTHORIZATION_ERROR':
          return 'You don\'t have permission to access this resource.';
        case 'VALIDATION_ERROR':
          return 'The information provided is invalid. Please check your input.';
        case 'RATE_LIMIT_ERROR':
          return 'Too many requests. Please wait a moment before trying again.';
        case 'SERVER_ERROR':
          return 'Our servers are experiencing issues. Please try again later.';
        case 'TIMEOUT_ERROR':
          return 'The request took too long to complete. Please try again.';
        default:
          return apiError.message || 'An unexpected error occurred.';
      }
    }

    // Handle common React errors
    if (error.message.includes('ChunkLoadError')) {
      return 'Failed to load application resources. Please refresh the page.';
    }

    if (error.message.includes('Loading chunk')) {
      return 'Failed to load part of the application. Please refresh the page.';
    }

    // Default error message
    return 'Something went wrong. Please try again.';
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const errorMessage = this.getErrorMessage(this.state.error!);
      const isNetworkError = this.state.error?.message.includes('fetch') || 
                            this.state.error?.message.includes('network');

      return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
          <div className="sm:mx-auto sm:w-full sm:max-w-md">
            <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
              <div className="text-center">
                <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                <h2 className="text-lg font-medium text-gray-900 mb-2">
                  Oops! Something went wrong
                </h2>
                <p className="text-sm text-gray-600 mb-6">
                  {errorMessage}
                </p>
                
                {this.state.errorId && (
                  <p className="text-xs text-gray-400 mb-6">
                    Error ID: {this.state.errorId}
                  </p>
                )}

                <div className="space-y-3">
                  <button
                    onClick={this.handleRetry}
                    className="w-full flex justify-center items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                  </button>
                  
                  <button
                    onClick={this.handleGoHome}
                    className="w-full flex justify-center items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                  >
                    <Home className="w-4 h-4 mr-2" />
                    Go Home
                  </button>
                </div>

                {import.meta.env.DEV && this.state.error && (
                  <details className="mt-6 text-left">
                    <summary className="text-sm text-gray-500 cursor-pointer hover:text-gray-700">
                      Technical Details (Development)
                    </summary>
                    <div className="mt-2 p-3 bg-gray-100 rounded text-xs font-mono text-gray-800 overflow-auto max-h-40">
                      <div className="mb-2">
                        <strong>Error:</strong> {this.state.error.message}
                      </div>
                      {this.state.error.stack && (
                        <div>
                          <strong>Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">
                            {this.state.error.stack}
                          </pre>
                        </div>
                      )}
                      {this.state.errorInfo && (
                        <div className="mt-2">
                          <strong>Component Stack:</strong>
                          <pre className="whitespace-pre-wrap mt-1">
                            {this.state.errorInfo.componentStack}
                          </pre>
                        </div>
                      )}
                    </div>
                  </details>
                )}
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;