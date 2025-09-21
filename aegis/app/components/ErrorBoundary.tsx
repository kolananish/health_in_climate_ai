'use client';

import React, { Component, ErrorInfo, ReactNode } from 'react';
import { categorizeError, logError, createErrorReport } from '@/lib/errorHandling';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  errorReport?: string;
}

/**
 * Error boundary component to catch and handle React errors gracefully
 */
export default class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error with enhanced error handling
    const enhancedError = categorizeError(error, {
      source: 'react_error_boundary',
      componentStack: errorInfo.componentStack,
      errorBoundary: true
    });
    
    logError(enhancedError, {
      componentStack: errorInfo.componentStack,
      errorInfo
    });

    // Create error report for debugging
    const errorReport = createErrorReport(enhancedError);
    
    // Update state with error details
    this.setState({
      error,
      errorInfo,
      errorReport
    });

    // Call optional error callback
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined, errorInfo: undefined, errorReport: undefined });
  };

  handleReload = () => {
    window.location.reload();
  };

  copyErrorReport = () => {
    if (this.state.errorReport) {
      navigator.clipboard.writeText(this.state.errorReport).then(() => {
        alert('Error report copied to clipboard');
      }).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = this.state.errorReport!;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Error report copied to clipboard');
      });
    }
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-card rounded-lg border border-border shadow-lg p-6">
            <div className="text-center mb-6">
              <div className="text-red-500 text-6xl mb-4">⚠️</div>
              <h1 className="text-xl font-semibold text-foreground mb-2">
                Something went wrong
              </h1>
              <p className="text-muted text-sm">
                The dashboard encountered an unexpected error and needs to be restarted.
              </p>
            </div>

            {/* Error details (collapsible) */}
            <details className="mb-6 text-sm">
              <summary className="cursor-pointer text-muted hover:text-foreground mb-2">
                Error Details
              </summary>
              <div className="bg-muted/20 rounded p-3 text-xs font-mono">
                <div className="mb-2">
                  <strong>Error:</strong> {this.state.error?.message}
                </div>
                <div className="mb-2">
                  <strong>Type:</strong> {this.state.error?.name}
                </div>
                {this.state.error?.stack && (
                  <div className="mb-2">
                    <strong>Stack:</strong>
                    <pre className="mt-1 whitespace-pre-wrap text-xs">
                      {this.state.error.stack}
                    </pre>
                  </div>
                )}
              </div>
            </details>

            {/* Action buttons */}
            <div className="space-y-3">
              <button
                onClick={this.handleRetry}
                className="w-full btn-primary"
              >
                Try Again
              </button>
              
              <button
                onClick={this.handleReload}
                className="w-full btn-secondary"
              >
                Reload Page
              </button>

              {this.state.errorReport && (
                <button
                  onClick={this.copyErrorReport}
                  className="w-full btn-secondary text-xs"
                >
                  Copy Error Report
                </button>
              )}
            </div>

            {/* Help text */}
            <div className="mt-6 text-xs text-muted text-center">
              If this problem persists, please contact support with the error report.
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Hook version of error boundary for functional components
 */
export function useErrorHandler() {
  const handleError = (error: Error, context?: Record<string, unknown>) => {
    const errorInfo = categorizeError(error, {
      ...context,
      source: 'error_handler_hook'
    });
    
    logError(errorInfo, context);
    
    // In a real application, you might want to send this to an error reporting service
    console.error('Handled error:', errorInfo);
  };

  return { handleError };
}

/**
 * Higher-order component to wrap components with error boundary
 */
export function withErrorBoundary<P extends Record<string, unknown>>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode,
  onError?: (error: Error, errorInfo: ErrorInfo) => void
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback} onError={onError}>
      <Component {...props} />
    </ErrorBoundary>
  );

  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}