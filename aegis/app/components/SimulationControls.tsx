'use client';

import { SimulationState } from '@/types';
import { getSimulationProgress } from '@/lib/simulation';

interface SimulationControlsProps {
  simulationState: SimulationState;
  onStartHeatUp: () => void;
  onStartCoolDown: () => void;
  onStop: () => void;
  onViewData: () => void;
  apiStatus?: 'online' | 'offline' | 'checking';
  simulationError?: string | null;
  className?: string;
  simulationSpeed?: number;
  onSpeedChange?: (speed: number) => void;
}

/**
 * Professional simulation controls component with modern button styling and speed control
 */
export default function SimulationControls({
  simulationState,
  onStartHeatUp,
  onStartCoolDown,
  onStop,
  onViewData,
  apiStatus = 'checking',
  simulationError = null,
  className = '',
  simulationSpeed = 2000,
  onSpeedChange
}: SimulationControlsProps) {
  const { isActive, type, currentValues } = simulationState;

  // Calculate simulation progress if active
  const progress = isActive && currentValues && type ? 
    getSimulationProgress(
      currentValues.temperature || 0, 
      currentValues.humidity || 0, 
      type
    ) : 0;

  // Speed options (in milliseconds) - smooth and fast options
  const speedOptions = [
    { label: 'Ultra Fast', value: 200, description: '0.2s intervals' },
    { label: 'Very Fast', value: 400, description: '0.4s intervals' },
    { label: 'Fast', value: 600, description: '0.6s intervals' },
    { label: 'Normal', value: 1000, description: '1s intervals' },
    { label: 'Slow', value: 2000, description: '2s intervals' }
  ];

  const currentSpeedOption = speedOptions.find(option => option.value === simulationSpeed) || speedOptions[2];

  return (
    <div className={`card ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">Simulation Controls</h2>
          <p className="text-sm text-slate-600 mt-1">
            Control health simulation for John Doe - adjust speed and monitor risk changes
          </p>
        </div>
        {isActive && (
          <div className="status-indicator status-info">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
            Running ({Math.round(progress)}%)
          </div>
        )}
      </div>

      {/* Speed Control */}
      {onSpeedChange && (
        <div className="mb-4 p-3 bg-slate-50 rounded-lg border">
          <div className="flex items-center justify-between mb-2">
            <label className="text-sm font-medium text-slate-700">
              Simulation Speed
            </label>
            <span className="text-xs text-slate-500">
              {currentSpeedOption.description}
            </span>
          </div>
          <div className="flex gap-2">
            {speedOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => onSpeedChange(option.value)}
                disabled={isActive}
                className={`px-3 py-1 text-xs rounded-md border transition-colors ${
                  simulationSpeed === option.value
                    ? 'bg-blue-100 border-blue-300 text-blue-700'
                    : 'bg-white border-slate-300 text-slate-600 hover:bg-slate-50'
                } ${isActive ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
              >
                {option.label}
              </button>
            ))}
          </div>
          {isActive && (
            <p className="text-xs text-slate-500 mt-1">
              Speed cannot be changed during active simulation
            </p>
          )}
        </div>
      )}

      <div className="flex flex-col sm:flex-row gap-3">
        {!isActive ? (
          <div className="flex flex-col sm:flex-row gap-3 flex-1">
            <button
              onClick={() => {
                console.log('🔥 HEAT UP BUTTON CLICKED');
                onStartHeatUp();
              }}
              disabled={apiStatus === 'checking'}
              className="btn-warning flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <span>🔥</span>
              <span className="hidden sm:inline">Simulate Heat Up</span>
              <span className="sm:hidden">Heat Up</span>
            </button>
            <button
              onClick={onStartCoolDown}
              disabled={apiStatus === 'checking'}
              className="btn-primary flex items-center justify-center gap-2 flex-1 sm:flex-none"
            >
              <span>❄️</span>
              <span className="hidden sm:inline">Cool Down</span>
              <span className="sm:hidden">Cool Down</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onStop}
            className="btn-danger flex items-center justify-center gap-2 flex-1 sm:flex-none"
          >
            <span>⏹️</span>
            <span className="hidden sm:inline">Stop Simulation</span>
            <span className="sm:hidden">Stop</span>
          </button>
        )}
        
        <button
          onClick={onViewData}
          className="btn-secondary flex items-center justify-center gap-2 flex-1 sm:flex-none"
        >
          <span>📊</span>
          <span className="hidden sm:inline">View Data</span>
          <span className="sm:hidden">Data</span>
        </button>
      </div>

      {/* Enhanced Simulation Status with John Doe Focus */}
      {isActive && currentValues && (
        <div className="mt-4 space-y-3">
          {/* Progress Bar */}
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2 text-sm">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="font-medium text-blue-800">
                  {type === 'heatup' ? 'Heat Up' : 'Cool Down'} simulation active for John Doe
                </span>
              </div>
              <span className="text-xs text-blue-600 font-medium">
                {Math.round(progress)}% complete
              </span>
            </div>
            
            {/* Progress bar */}
            <div className="w-full bg-blue-100 rounded-full h-3 mb-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            
            <p className="text-xs text-blue-600">
              Environmental conditions are being gradually adjusted{apiStatus === 'online' ? ' and risk scores updated in real-time' : ' (risk scores require backend connection)'}.
            </p>
          </div>

          {/* John Doe's Current Values */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium text-slate-700">👤 John Doe&apos;s Current Status</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
              <div className="text-center">
                <div className="font-medium text-slate-600">🌡️ Temperature</div>
                <div className="text-lg font-bold text-slate-900">
                  {currentValues.temperature?.toFixed(1) || '--'}°C
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-600">💧 Humidity</div>
                <div className="text-lg font-bold text-slate-900">
                  {currentValues.humidity?.toFixed(1) || '--'}%
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-600">❤️ Heart Rate</div>
                <div className="text-lg font-bold text-slate-900">
                  {currentValues.hrv_mean_hr?.toFixed(0) || '--'} BPM
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-600">📊 HRV RMSSD</div>
                <div className="text-lg font-bold text-slate-900">
                  {currentValues.hrv_rmssd?.toFixed(1) || '--'}ms
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-600">⚠️ Risk Score</div>
                <div className={`text-lg font-bold transition-colors duration-300 ${
                  currentValues.riskScore !== undefined 
                    ? currentValues.riskScore > 0.7 ? 'text-red-600' 
                      : currentValues.riskScore > 0.4 ? 'text-yellow-600' 
                      : 'text-green-600'
                    : 'text-slate-400'
                }`}>
                  {currentValues.riskScore !== undefined 
                    ? (currentValues.riskScore * 100).toFixed(0) + '%'
                    : '--'
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="font-medium text-slate-600">🎯 Risk Level</div>
                <div className={`text-sm font-bold transition-colors duration-300 ${
                  currentValues.predictedClass === 'hot' ? 'text-red-600' 
                    : currentValues.predictedClass === 'warm' ? 'text-orange-600'
                    : currentValues.predictedClass === 'slightly warm' ? 'text-yellow-600' 
                    : currentValues.predictedClass === 'neutral' ? 'text-green-600'
                    : 'text-slate-400'
                }`}>
                  {currentValues.predictedClass || '--'}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Simulation Error Display */}
      {simulationError && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-red-800">
            <span>❌</span>
            <span className="font-medium">Simulation Error</span>
          </div>
          <p className="text-xs text-red-700 mt-1">
            {simulationError}
          </p>
        </div>
      )}

      {/* API Status Warning for Simulations */}
      {!isActive && !simulationError && apiStatus === 'offline' && (
        <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-center gap-2 text-sm text-yellow-800">
            <span>⚠️</span>
            <span className="font-medium">Backend Offline</span>
          </div>
          <p className="text-xs text-yellow-700 mt-1">
            Simulations will run but risk scores will not update without backend connection.
          </p>
        </div>
      )}
    </div>
  );
}