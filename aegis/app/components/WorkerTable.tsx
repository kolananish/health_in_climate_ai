'use client';

import React from 'react';
import { Worker } from '@/types';
import RiskIndicator from './RiskIndicator';
import LoadingSpinner from './LoadingSpinner';

interface WorkerTableProps {
  workers: Worker[];
  loading?: boolean;
  className?: string;
  simulationActive?: boolean;
  simulationTarget?: string;
}

/**
 * Professional responsive WorkerTable component with modern styling
 * Optimized for real-time updates with React.memo
 */
const WorkerTable = React.memo(function WorkerTable({ 
  workers, 
  loading = false, 
  className = '', 
  simulationActive = false,
  simulationTarget = 'John Doe'
}: WorkerTableProps) {
  if (loading) {
    return (
      <div className={`table-container ${className}`}>
        <div className="p-8 text-center">
          <LoadingSpinner size="lg" text="Loading worker data..." />
        </div>
      </div>
    );
  }

  if (workers.length === 0) {
    return (
      <div className={`table-container ${className}`}>
        <div className="p-8 text-center">
          <div className="text-slate-400 text-lg mb-2">📊</div>
          <h3 className="text-lg font-semibold text-slate-700 mb-1">No Workers Found</h3>
          <p className="text-slate-500">No worker data is currently available.</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`table-container ${className}`}>
      {/* Desktop Table View */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead className="table-header">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Worker
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Age
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Gender
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Temperature
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Humidity
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                HRV Score
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">
                Risk Assessment
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {workers.map((worker) => {
              const isSimulationTarget = simulationActive && worker.name === simulationTarget;
              return (
              <tr key={worker.id} className={`table-row transition-colors duration-150 ${
                isSimulationTarget ? 'bg-blue-50 border-l-4 border-blue-500' : ''
              }`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 ${
                      isSimulationTarget 
                        ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-300 animate-pulse' 
                        : 'bg-gradient-to-br from-blue-500 to-blue-600'
                    }`}>
                      {worker.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <div className={`text-sm font-semibold ${
                        isSimulationTarget ? 'text-blue-900' : 'text-slate-900'
                      }`}>
                        {worker.name}
                        {isSimulationTarget && (
                          <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            🎯 Simulation Active
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-slate-500">ID: {worker.id}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm font-medium text-slate-700">{worker.age}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm text-slate-600">
                    {worker.gender === 1 ? 'Male' : 'Female'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      {worker.temperature.toFixed(1)}°C
                    </span>
                    <span className="text-xs text-slate-500">
                      {worker.temperature > 30 ? '🔥' : worker.temperature < 20 ? '❄️' : '🌡️'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-1">
                    <span className="text-sm font-medium text-slate-700">
                      {worker.humidity.toFixed(1)}%
                    </span>
                    <span className="text-xs text-slate-500">
                      {worker.humidity > 70 ? '💧' : '💨'}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm">
                    <div className="font-medium text-slate-700">
                      RMSSD: {worker.hrv_rmssd.toFixed(1)}
                    </div>
                    <div className="text-xs text-slate-500">
                      SDNN: {worker.hrv_sdnn.toFixed(1)}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <RiskIndicator 
                    riskScore={worker.riskScore || 0} 
                    size="md"
                  />
                </td>
              </tr>
            );
            })}
          </tbody>
        </table>
      </div>
      {/* Tablet View (md to lg) */}
      <div className="hidden md:block lg:hidden">
        <div className="grid gap-4">
          {workers.map((worker) => {
            const isSimulationTarget = simulationActive && worker.name === simulationTarget;
            return (
            <div key={worker.id} className={`table-mobile-card bg-white border rounded-lg p-4 hover:shadow-md transition-all duration-200 ${
              isSimulationTarget ? 'border-blue-300 bg-blue-50 ring-2 ring-blue-200' : 'border-slate-200'
            }`}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-semibold mr-4 ${
                    isSimulationTarget 
                      ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-300 animate-pulse' 
                      : 'bg-gradient-to-br from-blue-500 to-blue-600'
                  }`}>
                    {worker.name.split(' ').map(n => n[0]).join('')}
                  </div>
                  <div>
                    <div className={`text-base font-semibold ${
                      isSimulationTarget ? 'text-blue-900' : 'text-slate-900'
                    }`}>
                      {worker.name}
                      {isSimulationTarget && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          🎯 Active
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-500">
                      {worker.gender === 1 ? 'Male' : 'Female'}, Age {worker.age} • ID: {worker.id}
                    </div>
                  </div>
                </div>
                <RiskIndicator 
                  riskScore={worker.riskScore || 0} 
                  size="md"
                />
              </div>
              
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Environment</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {worker.temperature.toFixed(1)}°C
                  </div>
                  <div className="text-sm text-slate-600">
                    {worker.humidity.toFixed(1)}% humidity
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">HRV Primary</div>
                  <div className="text-sm font-semibold text-slate-700">
                    RMSSD: {worker.hrv_rmssd.toFixed(1)}
                  </div>
                  <div className="text-sm text-slate-600">
                    SDNN: {worker.hrv_sdnn.toFixed(1)}
                  </div>
                </div>
                <div className="bg-slate-50 rounded-lg p-3">
                  <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">Heart Rate</div>
                  <div className="text-sm font-semibold text-slate-700">
                    {worker.hrv_mean_hr?.toFixed(0) || 'N/A'} bpm
                  </div>
                  <div className="text-sm text-slate-600">
                    Range: {worker.hrv_min_hr?.toFixed(0) || 'N/A'}-{worker.hrv_max_hr?.toFixed(0) || 'N/A'}
                  </div>
                </div>
              </div>
            </div>
          );
          })}
        </div>
      </div>

      {/* Mobile Card View */}
      <div className="md:hidden divide-y divide-slate-200">
        {workers.map((worker) => {
          const isSimulationTarget = simulationActive && worker.name === simulationTarget;
          return (
          <div key={worker.id} className={`table-mobile-card p-4 transition-all duration-200 ${
            isSimulationTarget ? 'bg-blue-50 border-l-4 border-blue-500' : 'hover:bg-slate-50'
          }`}>
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center flex-1 min-w-0">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm mr-3 flex-shrink-0 ${
                  isSimulationTarget 
                    ? 'bg-gradient-to-br from-blue-600 to-blue-700 ring-2 ring-blue-300 animate-pulse' 
                    : 'bg-gradient-to-br from-blue-500 to-blue-600'
                }`}>
                  {worker.name.split(' ').map(n => n[0]).join('')}
                </div>
                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-semibold truncate ${
                    isSimulationTarget ? 'text-blue-900' : 'text-slate-900'
                  }`}>
                    {worker.name}
                    {isSimulationTarget && <span className="ml-1">🎯</span>}
                  </div>
                  <div className="text-xs text-slate-500">
                    {worker.gender === 1 ? 'Male' : 'Female'}, Age {worker.age}
                    {isSimulationTarget && (
                      <span className="ml-2 text-blue-600 font-medium">• Simulation Active</span>
                    )}
                  </div>
                </div>
              </div>
              <div className="ml-3 flex-shrink-0">
                <RiskIndicator 
                  riskScore={worker.riskScore || 0} 
                  size="sm"
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-2 text-sm">
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-medium text-slate-500 uppercase tracking-wide">Environment</span>
                  <div className="flex gap-1 text-xs">
                    {worker.temperature > 30 ? '🔥' : worker.temperature < 20 ? '❄️' : '🌡️'}
                    {worker.humidity > 70 ? '💧' : '💨'}
                  </div>
                </div>
                <div className="font-medium text-slate-700">
                  {worker.temperature.toFixed(1)}°C • {worker.humidity.toFixed(1)}% humidity
                </div>
              </div>
              <div className="bg-slate-50 rounded-lg p-3">
                <div className="text-xs font-medium text-slate-500 uppercase tracking-wide mb-1">HRV Metrics</div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-slate-500">RMSSD:</span>
                    <span className="font-medium text-slate-700 ml-1">{worker.hrv_rmssd.toFixed(1)}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">SDNN:</span>
                    <span className="font-medium text-slate-700 ml-1">{worker.hrv_sdnn.toFixed(1)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
        })}
      </div>
    </div>
  );
});

export default WorkerTable;