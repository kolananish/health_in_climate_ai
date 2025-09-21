// Enhanced error handling utilities for the Worker Health Dashboard

import { APIError, NetworkError, TimeoutError } from './api';

export interface ErrorInfo {
  type: 'api' | 'network' | 'timeout' | 'simulation' | 'validation' | 'unknown';
  code?: string;
  message: string;
  details?: string;
  timestamp: Date;
  context?: Record<string, unknown>;
}

/**
 * Categorizes and formats errors for user-friendly display
 */
export function categorizeError(error: Error, context?: Record<string, unknown>): ErrorInfo {
  const timestamp = new Date();
  
  if (error instanceof APIError) {
    return {
      type: 'api',
      code: error.code,
      message: getAPIErrorMessage(error),
      details: error.message,
      timestamp,
      context
    };
  }
  
  if (error instanceof NetworkError) {
    return {
      type: 'network',
      message: 'Network Connection Failed',
      details: 'Unable to connect to the backend server. Please check your internet connection.',
      timestamp,
      context
    };
  }
  
  if (error instanceof TimeoutError) {
    return {
      type: 'timeout',
      message: 'Request Timed Out',
      details: 'The server is taking too long to respond. Please try again.',
      timestamp,
      context
    };
  }
  
  // Handle fetch errors
  if (error instanceof TypeError && error.message.includes('fetch')) {
    return {
      type: 'network',
      message: 'Connection Error',
      details: 'Failed to connect to the backend server.',
      timestamp,
      context
    };
  }
  
  // Handle simulation errors
  if (context?.source === 'simulation') {
    return {
      type: 'simulation',
      message: 'Simulation Error',
      details: error.message || 'An error occurred during the simulation.',
      timestamp,
      context
    };
  }
  
  // Handle validation errors
  if (error.message.includes('validation') || error.message.includes('invalid')) {
    return {
      type: 'validation',
      message: 'Data Validation Error',
      details: error.message,
      timestamp,
      context
    };
  }
  
  // Unknown error
  return {
    type: 'unknown',
    message: 'Unexpected Error',
    details: error.message || 'An unexpected error occurred.',
    timestamp,
    context
  };
}

/**
 * Gets user-friendly message for API errors
 */
function getAPIErrorMessage(error: APIError): string {
  if (error.status) {
    if (error.status >= 500) {
      return 'Server Error';
    }
    if (error.status === 404) {
      return 'Service Not Found';
    }
    if (error.status === 400) {
      return 'Invalid Request';
    }
    if (error.status === 401) {
      return 'Authentication Required';
    }
    if (error.status === 403) {
      return 'Access Denied';
    }
  }
  
  if (error.code === 'INVALID_JSON') {
    return 'Invalid Server Response';
  }
  
  if (error.code === 'INVALID_RESPONSE') {
    return 'Unexpected Response Format';
  }
  
  return 'API Error';
}

/**
 * Gets toast notification configuration for different error types
 */
export function getErrorToastConfig(errorInfo: ErrorInfo) {
  const baseConfig = {
    title: errorInfo.message,
    message: errorInfo.details || 'Please try again or contact support if the problem persists.',
    duration: 6000 // 6 seconds for errors
  };
  
  switch (errorInfo.type) {
    case 'network':
      return {
        ...baseConfig,
        type: 'error' as const,
        duration: 8000, // Longer for network issues
        message: 'Check your internet connection and try again. The backend server may be offline.'
      };
      
    case 'timeout':
      return {
        ...baseConfig,
        type: 'warning' as const,
        duration: 6000,
        message: 'The request is taking longer than expected. Please try again.'
      };
      
    case 'api':
      return {
        ...baseConfig,
        type: 'error' as const,
        message: errorInfo.details || 'The backend service encountered an error. Please try again.'
      };
      
    case 'simulation':
      return {
        ...baseConfig,
        type: 'warning' as const,
        title: 'Simulation Issue',
        message: 'The simulation encountered an issue but will continue. Risk scores may not update properly.'
      };
      
    case 'validation':
      return {
        ...baseConfig,
        type: 'warning' as const,
        message: 'There was an issue with the data format. Please refresh the page.'
      };
      
    default:
      return {
        ...baseConfig,
        type: 'error' as const
      };
  }
}

/**
 * Determines if an error should be retried automatically
 */
export function shouldRetryError(errorInfo: ErrorInfo): boolean {
  // Don't retry validation errors or client errors
  if (errorInfo.type === 'validation' || 
      (errorInfo.type === 'api' && errorInfo.code && ['400', '401', '403', '404'].includes(errorInfo.code))) {
    return false;
  }
  
  // Retry network, timeout, and server errors
  return ['network', 'timeout', 'api'].includes(errorInfo.type);
}

/**
 * Gets recovery suggestions for different error types
 */
export function getRecoverySuggestions(errorInfo: ErrorInfo): string[] {
  switch (errorInfo.type) {
    case 'network':
      return [
        'Check your internet connection',
        'Verify the backend server is running',
        'Try refreshing the page',
        'Contact your system administrator'
      ];
      
    case 'timeout':
      return [
        'Try the request again',
        'Check if the server is under heavy load',
        'Verify your network connection speed'
      ];
      
    case 'api':
      return [
        'Try refreshing the page',
        'Check if the backend service is running',
        'Contact technical support if the issue persists'
      ];
      
    case 'simulation':
      return [
        'Stop and restart the simulation',
        'Check the backend connection',
        'Refresh the page to reset the dashboard'
      ];
      
    case 'validation':
      return [
        'Refresh the page to reload data',
        'Clear your browser cache',
        'Contact support if the issue continues'
      ];
      
    default:
      return [
        'Try refreshing the page',
        'Contact support if the problem persists'
      ];
  }
}

/**
 * Logs errors with appropriate level and context
 */
export function logError(errorInfo: ErrorInfo, additionalContext?: Record<string, unknown>) {
  const logContext = {
    ...errorInfo.context,
    ...additionalContext,
    timestamp: errorInfo.timestamp.toISOString(),
    userAgent: typeof window !== 'undefined' ? window.navigator.userAgent : 'unknown'
  };
  
  const logMessage = `[${errorInfo.type.toUpperCase()}] ${errorInfo.message}`;
  
  if (errorInfo.type === 'network' || errorInfo.type === 'timeout') {
    console.warn(logMessage, logContext);
  } else if (errorInfo.type === 'simulation' || errorInfo.type === 'validation') {
    console.warn(logMessage, logContext);
  } else {
    console.error(logMessage, logContext);
  }
  
  // In a production environment, you might want to send this to a logging service
  // Example: sendToLoggingService(errorInfo, logContext);
}

/**
 * Creates a standardized error report for debugging
 */
export function createErrorReport(errorInfo: ErrorInfo): string {
  const report = [
    `Error Report - ${errorInfo.timestamp.toISOString()}`,
    `Type: ${errorInfo.type}`,
    `Message: ${errorInfo.message}`,
    errorInfo.details ? `Details: ${errorInfo.details}` : null,
    errorInfo.code ? `Code: ${errorInfo.code}` : null,
    errorInfo.context ? `Context: ${JSON.stringify(errorInfo.context, null, 2)}` : null,
    `Recovery Suggestions:`,
    ...getRecoverySuggestions(errorInfo).map(suggestion => `- ${suggestion}`)
  ].filter(Boolean).join('\n');
  
  return report;
}