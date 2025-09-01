import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetOnPropsChange?: boolean;
  resetKeys?: Array<string | number>;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  eventId: string | null;
}

class ErrorBoundary extends Component<Props, State> {
  private resetTimeoutId: number | null = null;
  private previousResetKeys: Array<string | number> = [];

  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null
  };

  constructor(props: Props) {
    super(props);
    this.previousResetKeys = props.resetKeys || [];
  }

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    const eventId = this.generateEventId();
    
    this.setState({
      error,
      errorInfo,
      eventId
    });

    // Log error to console in development
    if (process.env.NODE_ENV === 'development') {
      console.group('🚨 Error Boundary Caught an Error');
      console.error('Error:', error);
      console.error('Error Info:', errorInfo);
      console.error('Component Stack:', errorInfo.componentStack);
      console.groupEnd();
    }

    // Call custom error handler
    this.props.onError?.(error, errorInfo);

    // Report to error tracking service (e.g., Sentry)
    // this.reportError(error, errorInfo, eventId);
  }

  public componentDidUpdate(prevProps: Props) {
    const { resetKeys, resetOnPropsChange } = this.props;
    const { hasError } = this.state;

    if (hasError && resetOnPropsChange) {
      // Reset error boundary when props change
      this.setState({
        hasError: false,
        error: null,
        errorInfo: null,
        eventId: null
      });
    }

    if (hasError && resetKeys) {
      // Reset error boundary when resetKeys change
      const hasResetKeyChanged = resetKeys.some(
        (key, index) => key !== this.previousResetKeys[index]
      );

      if (hasResetKeyChanged) {
        this.previousResetKeys = resetKeys;
        this.setState({
          hasError: false,
          error: null,
          errorInfo: null,
          eventId: null
        });
      }
    }
  }

  private generateEventId = (): string => {
    return `error-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      eventId: null
    });
  };

  private handleReload = () => {
    window.location.reload();
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-gray-800 rounded-lg shadow-xl border border-gray-700">
            <div className="p-6">
              <div className="flex items-center space-x-3 mb-4">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-8 w-8 text-red-400" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-white">
                    Something went wrong
                  </h1>
                  <p className="text-sm text-gray-400">
                    An unexpected error occurred
                  </p>
                </div>
              </div>

              {process.env.NODE_ENV === 'development' && this.state.error && (
                <div className="mb-4 p-3 bg-gray-900 rounded border border-gray-600">
                  <p className="text-xs text-red-400 font-mono break-all">
                    {this.state.error.message}
                  </p>
                </div>
              )}

              <div className="space-y-3">
                <button
                  onClick={this.handleRetry}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Try Again</span>
                </button>

                <button
                  onClick={this.handleReload}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors duration-200"
                >
                  <RefreshCw className="h-4 w-4" />
                  <span>Reload Page</span>
                </button>

                <button
                  onClick={this.handleGoHome}
                  className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors duration-200"
                >
                  <Home className="h-4 w-4" />
                  <span>Go Home</span>
                </button>
              </div>

              {this.state.eventId && (
                <div className="mt-4 pt-4 border-t border-gray-700">
                  <p className="text-xs text-gray-500">
                    Error ID: {this.state.eventId}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

// Specialized error boundary for WebSocket connections
export class WebSocketErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    eventId: null
  };

  public static getDerivedStateFromError(error: Error): Partial<State> {
    return {
      hasError: true,
      error
    };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('WebSocket Error Boundary:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="bg-red-900/20 border border-red-500/30 rounded-lg p-4 m-4">
          <div className="flex items-center space-x-2 text-red-400 mb-2">
            <AlertTriangle className="h-4 w-4" />
            <span className="text-sm font-medium">WebSocket Connection Error</span>
          </div>
          <p className="text-xs text-red-300 mb-3">
            Real-time data connection failed. Some features may not work properly.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded transition-colors"
          >
            Reload Page
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}

// Hook for functional components to handle errors
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null);

  const resetError = React.useCallback(() => {
    setError(null);
  }, []);

  const captureError = React.useCallback((error: Error) => {
    console.error('Captured error:', error);
    setError(error);
  }, []);

  React.useEffect(() => {
    if (error) {
      throw error;
    }
  }, [error]);

  return { captureError, resetError, error };
};

// Higher-order component for adding error boundaries
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) => {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;

  return WrappedComponent;
};