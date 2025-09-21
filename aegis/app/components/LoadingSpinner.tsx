'use client';

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  text?: string;
}

/**
 * Professional loading spinner component with optional text
 */
export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  text 
}: LoadingSpinnerProps) {
  const sizeConfig = {
    sm: {
      spinner: 'w-4 h-4 border-2',
      text: 'text-sm',
      gap: 'gap-2'
    },
    md: {
      spinner: 'w-6 h-6 border-2',
      text: 'text-base',
      gap: 'gap-3'
    },
    lg: {
      spinner: 'w-8 h-8 border-[3px]',
      text: 'text-lg',
      gap: 'gap-4'
    }
  };

  const config = sizeConfig[size];

  return (
    <div className={`flex items-center justify-center ${config.gap} ${className}`}>
      <div 
        className={`${config.spinner} border-slate-200 border-t-blue-600 rounded-full animate-spin`}
        style={{
          borderTopColor: 'var(--primary)',
          borderRightColor: 'transparent',
          borderBottomColor: 'transparent',
          borderLeftColor: 'transparent'
        }}
        role="status"
        aria-label="Loading"
      />
      {text && (
        <div className="flex flex-col items-center">
          <span className={`${config.text} text-slate-700 font-medium`}>
            {text}
          </span>
          <div className="flex gap-1 mt-1">
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '0ms' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '150ms' }}></div>
            <div className="w-1 h-1 bg-blue-400 rounded-full animate-pulse" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
      )}
    </div>
  );
}