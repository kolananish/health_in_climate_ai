'use client';

interface ErrorMessageProps {
  title?: string;
  message: string;
  type?: 'error' | 'warning' | 'info';
  className?: string;
  onRetry?: () => void;
  showIcon?: boolean;
}

/**
 * Professional error message component with optional retry functionality
 */
export default function ErrorMessage({ 
  title = 'Error',
  message,
  type = 'error',
  className = '',
  onRetry,
  showIcon = true
}: ErrorMessageProps) {
  const typeStyles = {
    error: {
      container: 'alert alert-error',
      icon: '⚠️',
      iconBg: 'bg-red-100 text-red-600',
      button: 'btn-danger'
    },
    warning: {
      container: 'alert alert-warning',
      icon: '⚠️',
      iconBg: 'bg-yellow-100 text-yellow-600',
      button: 'btn-warning'
    },
    info: {
      container: 'alert alert-info',
      icon: 'ℹ️',
      iconBg: 'bg-blue-100 text-blue-600',
      button: 'btn-primary'
    }
  };

  const styles = typeStyles[type];

  return (
    <div className={`${styles.container} ${className}`}>
      <div className="flex items-start gap-4">
        {showIcon && (
          <div className={`w-8 h-8 rounded-full ${styles.iconBg} flex items-center justify-center flex-shrink-0`}>
            <span className="text-sm" role="img" aria-label={type}>
              {styles.icon}
            </span>
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-sm mb-1">{title}</h3>
              <p className="text-sm leading-relaxed">{message}</p>
            </div>
            {onRetry && (
              <div className="flex-shrink-0">
                <button
                  onClick={onRetry}
                  className={`${styles.button} text-sm px-4 py-2`}
                >
                  <span className="flex items-center gap-2">
                    <span>↻</span>
                    <span className="hidden sm:inline">Try Again</span>
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}