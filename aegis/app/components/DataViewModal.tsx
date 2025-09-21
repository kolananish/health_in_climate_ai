'use client';

import React from 'react';
import { Worker } from '@/types';

interface DataViewModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentValues: Partial<Worker>;
  targetWorkerName: string;
  className?: string;
}

/**
 * Modal component to display current simulation values in real-time
 * Shows all 55 features being sent to the backend during simulation
 */
export default function DataViewModal({
  isOpen,
  onClose,
  currentValues,
  targetWorkerName,
  className = ''
}: DataViewModalProps) {
  // Handle backdrop click to close modal
  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  // Handle escape key to close modal
  React.useEffect(() => {
    const handleEscapeKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      // Prevent body scroll when modal is open
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  // Format feature groups for display
  const formatFeatureGroup = (title: string, features: Array<{ key: string; value: number | undefined; unit?: string }>) => (
    <div className="mb-8">
      <h4 className="text-overline text-slate-600 mb-4 pb-2 border-b border-slate-200">
        {title}
      </h4>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
        {features.map(({ key, value, unit = '' }) => (
          <div key={key} className="card-compact hover:shadow-md transition-shadow duration-200">
            <div className="text-xs text-slate-500 mb-2 font-medium">
              {key.replace(/^hrv_/, '').replace(/_/g, ' ').toUpperCase()}
            </div>
            <div className="text-sm font-semibold text-slate-800">
              {value !== undefined ? `${value.toFixed(2)}${unit}` : 'N/A'}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div 
      className={`fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 ${className}`}
      onClick={handleBackdropClick}
    >
      <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 sm:p-6 border-b border-slate-200 bg-slate-50">
          <div className="min-w-0 flex-1">
            <h3 className="text-title text-slate-900">
              Current Simulation Values
            </h3>
            <p className="text-caption mt-1">
              Real-time data being sent to ML model for <span className="font-medium">{targetWorkerName}</span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-all duration-200 p-2 rounded-lg flex-shrink-0 self-start sm:self-center"
            aria-label="Close modal"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Demographics */}
          {formatFeatureGroup('Demographics', [
            { key: 'gender', value: currentValues.gender },
            { key: 'age', value: currentValues.age, unit: ' years' }
          ])}

          {/* Environmental */}
          {formatFeatureGroup('Environmental Conditions', [
            { key: 'temperature', value: currentValues.temperature, unit: '°C' },
            { key: 'humidity', value: currentValues.humidity, unit: '%' }
          ])}

          {/* HRV Time Domain */}
          {formatFeatureGroup('HRV Time Domain Metrics', [
            { key: 'hrv_mean_nni', value: currentValues.hrv_mean_nni, unit: ' ms' },
            { key: 'hrv_median_nni', value: currentValues.hrv_median_nni, unit: ' ms' },
            { key: 'hrv_range_nni', value: currentValues.hrv_range_nni, unit: ' ms' },
            { key: 'hrv_sdsd', value: currentValues.hrv_sdsd, unit: ' ms' },
            { key: 'hrv_rmssd', value: currentValues.hrv_rmssd, unit: ' ms' },
            { key: 'hrv_nni_50', value: currentValues.hrv_nni_50 },
            { key: 'hrv_pnni_50', value: currentValues.hrv_pnni_50, unit: '%' },
            { key: 'hrv_nni_20', value: currentValues.hrv_nni_20 },
            { key: 'hrv_pnni_20', value: currentValues.hrv_pnni_20, unit: '%' },
            { key: 'hrv_cvsd', value: currentValues.hrv_cvsd },
            { key: 'hrv_sdnn', value: currentValues.hrv_sdnn, unit: ' ms' },
            { key: 'hrv_cvnni', value: currentValues.hrv_cvnni }
          ])}

          {/* HRV Frequency Domain */}
          {formatFeatureGroup('HRV Frequency Domain Metrics', [
            { key: 'hrv_mean_hr', value: currentValues.hrv_mean_hr, unit: ' bpm' },
            { key: 'hrv_min_hr', value: currentValues.hrv_min_hr, unit: ' bpm' },
            { key: 'hrv_max_hr', value: currentValues.hrv_max_hr, unit: ' bpm' },
            { key: 'hrv_std_hr', value: currentValues.hrv_std_hr, unit: ' bpm' },
            { key: 'hrv_total_power', value: currentValues.hrv_total_power, unit: ' ms²' },
            { key: 'hrv_vlf', value: currentValues.hrv_vlf, unit: ' ms²' },
            { key: 'hrv_lf', value: currentValues.hrv_lf, unit: ' ms²' },
            { key: 'hrv_hf', value: currentValues.hrv_hf, unit: ' ms²' },
            { key: 'hrv_lf_hf_ratio', value: currentValues.hrv_lf_hf_ratio },
            { key: 'hrv_lfnu', value: currentValues.hrv_lfnu, unit: ' nu' },
            { key: 'hrv_hfnu', value: currentValues.hrv_hfnu, unit: ' nu' }
          ])}

          {/* HRV Geometric */}
          {formatFeatureGroup('HRV Geometric Metrics', [
            { key: 'hrv_sd1', value: currentValues.hrv_sd1, unit: ' ms' },
            { key: 'hrv_sd2', value: currentValues.hrv_sd2, unit: ' ms' },
            { key: 'hrv_sd2sd1', value: currentValues.hrv_sd2sd1 },
            { key: 'hrv_csi', value: currentValues.hrv_csi },
            { key: 'hrv_cvi', value: currentValues.hrv_cvi },
            { key: 'hrv_csi_modified', value: currentValues.hrv_csi_modified }
          ])}

          {/* HRV Statistical */}
          {formatFeatureGroup('HRV Statistical Metrics', [
            { key: 'hrv_mean', value: currentValues.hrv_mean },
            { key: 'hrv_std', value: currentValues.hrv_std },
            { key: 'hrv_min', value: currentValues.hrv_min },
            { key: 'hrv_max', value: currentValues.hrv_max },
            { key: 'hrv_ptp', value: currentValues.hrv_ptp },
            { key: 'hrv_sum', value: currentValues.hrv_sum },
            { key: 'hrv_energy', value: currentValues.hrv_energy },
            { key: 'hrv_skewness', value: currentValues.hrv_skewness },
            { key: 'hrv_kurtosis', value: currentValues.hrv_kurtosis },
            { key: 'hrv_peaks', value: currentValues.hrv_peaks },
            { key: 'hrv_rms', value: currentValues.hrv_rms },
            { key: 'hrv_lineintegral', value: currentValues.hrv_lineintegral },
            { key: 'hrv_n_above_mean', value: currentValues.hrv_n_above_mean },
            { key: 'hrv_n_below_mean', value: currentValues.hrv_n_below_mean },
            { key: 'hrv_n_sign_changes', value: currentValues.hrv_n_sign_changes },
            { key: 'hrv_iqr', value: currentValues.hrv_iqr },
            { key: 'hrv_iqr_5_95', value: currentValues.hrv_iqr_5_95 },
            { key: 'hrv_pct_5', value: currentValues.hrv_pct_5 },
            { key: 'hrv_pct_95', value: currentValues.hrv_pct_95 },
            { key: 'hrv_entropy', value: currentValues.hrv_entropy },
            { key: 'hrv_perm_entropy', value: currentValues.hrv_perm_entropy },
            { key: 'hrv_svd_entropy', value: currentValues.hrv_svd_entropy }
          ])}

          {/* ML Model Response */}
          {(currentValues.riskScore !== undefined || currentValues.predictedClass || currentValues.confidence !== undefined) && (
            <div className="card-elevated bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
              <h4 className="text-overline text-blue-700 mb-4">ML Model Response</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {currentValues.riskScore !== undefined && (
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-overline text-blue-600 mb-2">Risk Score</div>
                    <div className="text-2xl font-bold text-blue-800">
                      {(currentValues.riskScore * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
                {currentValues.predictedClass && (
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-overline text-blue-600 mb-2">Predicted Class</div>
                    <div className="text-subtitle font-medium text-blue-800">
                      {currentValues.predictedClass}
                    </div>
                  </div>
                )}
                {currentValues.confidence !== undefined && (
                  <div className="text-center p-4 bg-white rounded-lg shadow-sm">
                    <div className="text-overline text-blue-600 mb-2">Confidence</div>
                    <div className="text-subtitle font-medium text-blue-800">
                      {(currentValues.confidence * 100).toFixed(1)}%
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex justify-between items-center p-4 sm:p-6 border-t border-slate-200 bg-slate-50">
          <div className="text-caption text-slate-500">
            Data updates every 2 seconds during simulation
          </div>
          <button
            onClick={onClose}
            className="btn-primary"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}