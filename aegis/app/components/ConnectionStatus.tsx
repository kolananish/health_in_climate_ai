'use client';

import React from 'react';

interface ConnectionStatusProps {
  status: 'online' | 'offline' | 'checking';
  connectionAttempts: number;
  onRetry: () => void;
  className?: string;
}

/**
 * Connection status component with detailed status information
 */
export default function ConnectionStatus({ 
  status, 
  connectionAttempts, 
  onRetry, 
  className = '' 
}: ConnectionStatusProps) {
  const getStatusConfig = () => {
    switch (status) {
      case 'online':
        return {
          color: 'text-green-700',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          icon: '✅',
          title: 'Backend Connected',
          message: 'ML predictions are active'
        };
      case 'offline':
        return {
          color: 'text-red-700',
          bgColor: 'bg-red-50',
          borderColor: 'border-red-200',
          icon: '❌',
          title: 'Backend Offline',
          message: 'Using mock data only'
        };
      case 'checking':
        return {
          color: 'text-yellow-700',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          icon: '🔄',
          title: 'Connecting...',
          message: 'Checking backend status'
        };
      default:
        return {
          color: 'text-gray-700',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          icon: '❓',
          title: 'Unknown Status',
          message: 'Connection status unknown'
        };
    }
  };

  const config = getStatusConfig();

  return (
    <div className={`rounded-lg border p-4 ${config.bgColor} ${config.borderColor} ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <span className="text-lg flex-shrink-0">
            {config.icon}
          </span>
          <div className="flex-1 min-w-0">
            <div className={`font-medium text-sm ${config.color}`}>
              {config.title}
            </div>
            <div className={`text-sm mt-1 ${config.color} opacity-80`}>
              {config.message}
            </div>
            {connectionAttempts > 0 && (
              <div className={`text-xs mt-1 ${config.color} opacity-60`}>
                Connection attempts: {connectionAttempts}
              </div>
            )}
          </div>
        </div>
        
        {status === 'offline' && (
          <button
            onClick={onRetry}
            className="btn-secondary text-xs px-3 py-1.5 flex-shrink-0"
          >
            Retry
          </button>
        )}
      </div>
      
      {/* Additional troubleshooting info for offline status */}
      {status === 'offline' && (
        <div className={`mt-3 pt-3 border-t ${config.borderColor} text-xs ${config.color} opacity-70`}>
          <div className="font-medium mb-1">Troubleshooting:</div>
          <ul className="space-y-1 list-disc list-inside">
            <li>Ensure backend server is running on localhost:8000</li>
            <li>Check if the /predict endpoint is accessible</li>
            <li>Verify network connectivity</li>
          </ul>
        </div>
      )}
    </div>
  );
}

interface ConnectionIndicatorProps {
  status: 'online' | 'offline' | 'checking';
  connectionAttempts: number;
  onRetry: () => void;
  showText?: boolean;
}

/**
 * Compact connection status indicator for headers
 */
export function ConnectionIndicator({ 
  status, 
  connectionAttempts, 
  onRetry, 
  showText = true 
}: ConnectionIndicatorProps) {
  const getIndicatorConfig = () => {
    switch (status) {
      case 'online':
        return {
          dotColor: 'bg-green-500',
          text: 'Backend Online',
          shortText: 'Online'
        };
      case 'offline':
        return {
          dotColor: 'bg-red-500',
          text: 'Backend Offline',
          shortText: 'Offline'
        };
      case 'checking':
        return {
          dotColor: 'bg-yellow-500 animate-pulse',
          text: 'Checking...',
          shortText: 'Checking'
        };
      default:
        return {
          dotColor: 'bg-gray-400',
          text: 'Unknown',
          shortText: 'Unknown'
        };
    }
  };

  const config = getIndicatorConfig();

  return (
    <div className="flex items-center gap-2">
      <div className={`status-indicator ${
        status === 'online' ? 'status-success' : 
        status === 'offline' ? 'status-error' : 'status-warning'
      }`}>
        <div className={`w-2 h-2 rounded-full ${config.dotColor}`}></div>
        {showText && (
          <>
            <span className="hidden sm:inline">
              {config.text}
            </span>
            <span className="sm:hidden">
              {config.shortText}
            </span>
          </>
        )}
        {connectionAttempts > 0 && (
          <span className="text-xs opacity-75 ml-1">
            ({connectionAttempts})
          </span>
        )}
      </div>
      
      {status === 'offline' && (
        <button
          onClick={onRetry}
          className="btn-secondary text-xs px-2 py-1"
          title="Retry backend connection"
        >
          <span className="hidden sm:inline">Retry</span>
          <span className="sm:hidden">↻</span>
        </button>
      )}
    </div>
  );
}