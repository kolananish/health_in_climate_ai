'use client';

import { getRiskColor } from '@/lib/utils';

interface RiskIndicatorProps {
  riskScore: number;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
}

/**
 * Professional RiskIndicator component with color-coded risk visualization
 * and optional size variants and labels
 */
export default function RiskIndicator({ 
  riskScore, 
  className = '', 
  size = 'md',
  showLabel = true 
}: RiskIndicatorProps) {
  const color = getRiskColor(riskScore);
  const displayScore = (riskScore * 100).toFixed(1);
  
  // Size configurations
  const sizeConfig = {
    sm: {
      indicator: 'w-3 h-3',
      text: 'text-xs',
      gap: 'gap-1.5'
    },
    md: {
      indicator: 'w-4 h-4',
      text: 'text-sm',
      gap: 'gap-2'
    },
    lg: {
      indicator: 'w-5 h-5',
      text: 'text-base',
      gap: 'gap-2.5'
    }
  };

  const config = sizeConfig[size];
  
  // Risk level determination for accessibility
  const getRiskLevel = (score: number) => {
    if (score <= 0.2) return 'Low Risk';
    if (score <= 0.4) return 'Moderate Risk';
    if (score <= 0.6) return 'Elevated Risk';
    if (score <= 0.8) return 'High Risk';
    return 'Critical Risk';
  };

  const riskLevel = getRiskLevel(riskScore);
  
  return (
    <div className={`flex items-center ${config.gap} ${className}`}>
      <div 
        className={`${config.indicator} rounded-full border-2 border-white shadow-sm ring-1 ring-black/10 transition-all duration-200`}
        style={{ backgroundColor: color }}
        title={`${riskLevel}: ${displayScore}%`}
        role="img"
        aria-label={`Risk indicator showing ${riskLevel} at ${displayScore} percent`}
      />
      {showLabel && (
        <div className="flex flex-col">
          <span className={`${config.text} font-semibold text-slate-700 leading-tight`}>
            {displayScore}%
          </span>
          {size === 'lg' && (
            <span className="text-xs text-slate-500 leading-tight">
              {riskLevel}
            </span>
          )}
        </div>
      )}
    </div>
  );
}