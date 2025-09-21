// Utility functions for Worker Health Dashboard

import { Worker } from '@/types';
import { FEATURE_RANGES, WORKER_NAMES, RISK_COLORS } from './constants';

/**
 * Maps a risk score (0.0 - 1.0) to a color value using smooth interpolation
 * @param riskScore - Risk score between 0.0 and 1.0
 * @returns Hex color string interpolated from green (0.0) to red (1.0)
 */
export function getRiskColor(riskScore: number): string {
  // Clamp risk score to valid range
  const score = Math.max(0, Math.min(1, riskScore));
  
  // Define the color stops for smooth interpolation
  const colorStops = [
    { threshold: 0.0, color: RISK_COLORS.GREEN },
    { threshold: 0.25, color: RISK_COLORS.YELLOW_GREEN },
    { threshold: 0.5, color: RISK_COLORS.YELLOW },
    { threshold: 0.75, color: RISK_COLORS.ORANGE },
    { threshold: 1.0, color: RISK_COLORS.RED }
  ];
  
  // Find the two color stops to interpolate between
  for (let i = 0; i < colorStops.length - 1; i++) {
    const currentStop = colorStops[i];
    const nextStop = colorStops[i + 1];
    
    if (score >= currentStop.threshold && score <= nextStop.threshold) {
      // Calculate interpolation factor between the two stops
      const range = nextStop.threshold - currentStop.threshold;
      const factor = range === 0 ? 0 : (score - currentStop.threshold) / range;
      
      // Interpolate between the two colors
      return interpolateColor(currentStop.color, nextStop.color, factor);
    }
  }
  
  // Fallback (should not reach here due to clamping)
  return score <= 0.5 ? RISK_COLORS.GREEN : RISK_COLORS.RED;
}

/**
 * Interpolates between two colors based on a factor (0.0 - 1.0)
 * @param color1 - Starting color (hex)
 * @param color2 - Ending color (hex)
 * @param factor - Interpolation factor (0.0 - 1.0)
 * @returns Interpolated hex color string
 */
export function interpolateColor(color1: string, color2: string, factor: number): string {
  const f = Math.max(0, Math.min(1, factor));
  
  const hex1 = color1.replace('#', '');
  const hex2 = color2.replace('#', '');
  
  const r1 = parseInt(hex1.substring(0, 2), 16);
  const g1 = parseInt(hex1.substring(2, 4), 16);
  const b1 = parseInt(hex1.substring(4, 6), 16);
  
  const r2 = parseInt(hex2.substring(0, 2), 16);
  const g2 = parseInt(hex2.substring(2, 4), 16);
  const b2 = parseInt(hex2.substring(4, 6), 16);
  
  const r = Math.round(r1 + (r2 - r1) * f);
  const g = Math.round(g1 + (g2 - g1) * f);
  const b = Math.round(b1 + (b2 - b1) * f);
  
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
}

/**
 * Generates a random number within a specified range
 * @param min - Minimum value
 * @param max - Maximum value
 * @param decimals - Number of decimal places (default: 2)
 * @returns Random number within range
 */
export function randomInRange(min: number, max: number, decimals: number = 2): number {
  const value = Math.random() * (max - min) + min;
  return Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals);
}

/**
 * Generates realistic mock data for a single worker
 * @param name - Worker name
 * @param id - Worker ID
 * @returns Worker object with realistic mock data
 */
export function generateWorkerData(name: string, id: string): Worker {
  return {
    id,
    name,
    gender: Math.round(Math.random()), // 0 or 1
    age: randomInRange(FEATURE_RANGES.age.min, FEATURE_RANGES.age.max, 0),
    
    // HRV Time Domain
    hrv_mean_nni: randomInRange(FEATURE_RANGES.hrv_mean_nni.min, FEATURE_RANGES.hrv_mean_nni.max),
    hrv_median_nni: randomInRange(FEATURE_RANGES.hrv_median_nni.min, FEATURE_RANGES.hrv_median_nni.max),
    hrv_range_nni: randomInRange(FEATURE_RANGES.hrv_range_nni.min, FEATURE_RANGES.hrv_range_nni.max),
    hrv_sdsd: randomInRange(FEATURE_RANGES.hrv_sdsd.min, FEATURE_RANGES.hrv_sdsd.max),
    hrv_rmssd: randomInRange(FEATURE_RANGES.hrv_rmssd.min, FEATURE_RANGES.hrv_rmssd.max),
    hrv_nni_50: randomInRange(FEATURE_RANGES.hrv_nni_50.min, FEATURE_RANGES.hrv_nni_50.max, 0),
    hrv_pnni_50: randomInRange(FEATURE_RANGES.hrv_pnni_50.min, FEATURE_RANGES.hrv_pnni_50.max),
    hrv_nni_20: randomInRange(FEATURE_RANGES.hrv_nni_20.min, FEATURE_RANGES.hrv_nni_20.max, 0),
    hrv_pnni_20: randomInRange(FEATURE_RANGES.hrv_pnni_20.min, FEATURE_RANGES.hrv_pnni_20.max),
    hrv_cvsd: randomInRange(FEATURE_RANGES.hrv_cvsd.min, FEATURE_RANGES.hrv_cvsd.max, 4),
    hrv_sdnn: randomInRange(FEATURE_RANGES.hrv_sdnn.min, FEATURE_RANGES.hrv_sdnn.max),
    hrv_cvnni: randomInRange(FEATURE_RANGES.hrv_cvnni.min, FEATURE_RANGES.hrv_cvnni.max, 4),
    
    // HRV Frequency Domain
    hrv_mean_hr: randomInRange(FEATURE_RANGES.hrv_mean_hr.min, FEATURE_RANGES.hrv_mean_hr.max),
    hrv_min_hr: randomInRange(FEATURE_RANGES.hrv_min_hr.min, FEATURE_RANGES.hrv_min_hr.max, 0),
    hrv_max_hr: randomInRange(FEATURE_RANGES.hrv_max_hr.min, FEATURE_RANGES.hrv_max_hr.max, 0),
    hrv_std_hr: randomInRange(FEATURE_RANGES.hrv_std_hr.min, FEATURE_RANGES.hrv_std_hr.max),
    hrv_total_power: randomInRange(FEATURE_RANGES.hrv_total_power.min, FEATURE_RANGES.hrv_total_power.max, 0),
    hrv_vlf: randomInRange(FEATURE_RANGES.hrv_vlf.min, FEATURE_RANGES.hrv_vlf.max, 0),
    hrv_lf: randomInRange(FEATURE_RANGES.hrv_lf.min, FEATURE_RANGES.hrv_lf.max, 0),
    hrv_hf: randomInRange(FEATURE_RANGES.hrv_hf.min, FEATURE_RANGES.hrv_hf.max, 0),
    hrv_lf_hf_ratio: randomInRange(FEATURE_RANGES.hrv_lf_hf_ratio.min, FEATURE_RANGES.hrv_lf_hf_ratio.max),
    hrv_lfnu: randomInRange(FEATURE_RANGES.hrv_lfnu.min, FEATURE_RANGES.hrv_lfnu.max),
    hrv_hfnu: randomInRange(FEATURE_RANGES.hrv_hfnu.min, FEATURE_RANGES.hrv_hfnu.max),
    
    // HRV Geometric
    hrv_sd1: randomInRange(FEATURE_RANGES.hrv_sd1.min, FEATURE_RANGES.hrv_sd1.max),
    hrv_sd2: randomInRange(FEATURE_RANGES.hrv_sd2.min, FEATURE_RANGES.hrv_sd2.max),
    hrv_sd2sd1: randomInRange(FEATURE_RANGES.hrv_sd2sd1.min, FEATURE_RANGES.hrv_sd2sd1.max),
    hrv_csi: randomInRange(FEATURE_RANGES.hrv_csi.min, FEATURE_RANGES.hrv_csi.max),
    hrv_cvi: randomInRange(FEATURE_RANGES.hrv_cvi.min, FEATURE_RANGES.hrv_cvi.max),
    hrv_csi_modified: randomInRange(FEATURE_RANGES.hrv_csi_modified.min, FEATURE_RANGES.hrv_csi_modified.max),
    
    // HRV Statistical
    hrv_mean: randomInRange(FEATURE_RANGES.hrv_mean.min, FEATURE_RANGES.hrv_mean.max),
    hrv_std: randomInRange(FEATURE_RANGES.hrv_std.min, FEATURE_RANGES.hrv_std.max),
    hrv_min: randomInRange(FEATURE_RANGES.hrv_min.min, FEATURE_RANGES.hrv_min.max, 0),
    hrv_max: randomInRange(FEATURE_RANGES.hrv_max.min, FEATURE_RANGES.hrv_max.max, 0),
    hrv_ptp: randomInRange(FEATURE_RANGES.hrv_ptp.min, FEATURE_RANGES.hrv_ptp.max, 0),
    hrv_sum: randomInRange(FEATURE_RANGES.hrv_sum.min, FEATURE_RANGES.hrv_sum.max, 0),
    hrv_energy: randomInRange(FEATURE_RANGES.hrv_energy.min, FEATURE_RANGES.hrv_energy.max, 0),
    hrv_skewness: randomInRange(FEATURE_RANGES.hrv_skewness.min, FEATURE_RANGES.hrv_skewness.max),
    hrv_kurtosis: randomInRange(FEATURE_RANGES.hrv_kurtosis.min, FEATURE_RANGES.hrv_kurtosis.max),
    hrv_peaks: randomInRange(FEATURE_RANGES.hrv_peaks.min, FEATURE_RANGES.hrv_peaks.max, 0),
    hrv_rms: randomInRange(FEATURE_RANGES.hrv_rms.min, FEATURE_RANGES.hrv_rms.max),
    hrv_lineintegral: randomInRange(FEATURE_RANGES.hrv_lineintegral.min, FEATURE_RANGES.hrv_lineintegral.max, 0),
    hrv_n_above_mean: randomInRange(FEATURE_RANGES.hrv_n_above_mean.min, FEATURE_RANGES.hrv_n_above_mean.max, 0),
    hrv_n_below_mean: randomInRange(FEATURE_RANGES.hrv_n_below_mean.min, FEATURE_RANGES.hrv_n_below_mean.max, 0),
    hrv_n_sign_changes: randomInRange(FEATURE_RANGES.hrv_n_sign_changes.min, FEATURE_RANGES.hrv_n_sign_changes.max, 0),
    hrv_iqr: randomInRange(FEATURE_RANGES.hrv_iqr.min, FEATURE_RANGES.hrv_iqr.max),
    hrv_iqr_5_95: randomInRange(FEATURE_RANGES.hrv_iqr_5_95.min, FEATURE_RANGES.hrv_iqr_5_95.max),
    hrv_pct_5: randomInRange(FEATURE_RANGES.hrv_pct_5.min, FEATURE_RANGES.hrv_pct_5.max),
    hrv_pct_95: randomInRange(FEATURE_RANGES.hrv_pct_95.min, FEATURE_RANGES.hrv_pct_95.max),
    hrv_entropy: randomInRange(FEATURE_RANGES.hrv_entropy.min, FEATURE_RANGES.hrv_entropy.max),
    hrv_perm_entropy: randomInRange(FEATURE_RANGES.hrv_perm_entropy.min, FEATURE_RANGES.hrv_perm_entropy.max),
    hrv_svd_entropy: randomInRange(FEATURE_RANGES.hrv_svd_entropy.min, FEATURE_RANGES.hrv_svd_entropy.max),
    
    // Environmental
    temperature: randomInRange(FEATURE_RANGES.temperature.min, FEATURE_RANGES.temperature.max),
    humidity: randomInRange(FEATURE_RANGES.humidity.min, FEATURE_RANGES.humidity.max)
  };
}

/**
 * Generates mock data for multiple workers with varied risk profiles
 * @param count - Number of workers to generate (default: 10)
 * @returns Array of Worker objects
 */
export function generateMockWorkers(count: number = 10): Worker[] {
  const workers: Worker[] = [];
  
  // Always include John Doe first for simulation purposes
  // Generate John Doe with moderate baseline values for simulation
  const johnDoe = generateWorkerWithRiskProfile('John Doe', 'worker-001', 'moderate');
  workers.push(johnDoe);
  
  // Generate additional workers with varied risk profiles
  const remainingCount = Math.max(0, count - 1);
  const availableNames = WORKER_NAMES.slice(1); // Exclude John Doe
  const riskProfiles: ('low' | 'moderate' | 'high')[] = ['low', 'moderate', 'high'];
  
  for (let i = 0; i < remainingCount; i++) {
    const nameIndex = i % availableNames.length;
    const name = availableNames[nameIndex];
    const id = `worker-${String(i + 2).padStart(3, '0')}`;
    const riskProfile = riskProfiles[i % riskProfiles.length];
    workers.push(generateWorkerWithRiskProfile(name, id, riskProfile));
  }
  
  return workers;
}

/**
 * Generates worker data with a specific risk profile to ensure varied risk scores
 * @param name - Worker name
 * @param id - Worker ID
 * @param riskProfile - Risk profile: 'low', 'moderate', or 'high'
 * @returns Worker object with targeted risk characteristics
 */
export function generateWorkerWithRiskProfile(
  name: string, 
  id: string, 
  riskProfile: 'low' | 'moderate' | 'high'
): Worker {
  const baseWorker = generateWorkerData(name, id);
  
  // Adjust key parameters based on risk profile to influence ML model predictions
  switch (riskProfile) {
    case 'low':
      // Younger age, better HRV metrics, comfortable environment
      baseWorker.age = randomInRange(22, 35, 0);
      baseWorker.hrv_rmssd = randomInRange(40, 120); // Higher is better
      baseWorker.hrv_sdnn = randomInRange(50, 150); // Higher is better
      baseWorker.hrv_mean_hr = randomInRange(50, 70); // Lower resting HR
      baseWorker.temperature = randomInRange(18, 24); // Comfortable temp
      baseWorker.humidity = randomInRange(30, 50); // Comfortable humidity
      break;
      
    case 'moderate':
      // Middle-aged, average HRV metrics, moderate environment
      baseWorker.age = randomInRange(35, 50, 0);
      baseWorker.hrv_rmssd = randomInRange(25, 60);
      baseWorker.hrv_sdnn = randomInRange(30, 80);
      baseWorker.hrv_mean_hr = randomInRange(65, 85);
      baseWorker.temperature = randomInRange(22, 28);
      baseWorker.humidity = randomInRange(45, 70);
      break;
      
    case 'high':
      // Older age, poorer HRV metrics, stressful environment
      baseWorker.age = randomInRange(50, 65, 0);
      baseWorker.hrv_rmssd = randomInRange(15, 40); // Lower is worse
      baseWorker.hrv_sdnn = randomInRange(20, 50); // Lower is worse
      baseWorker.hrv_mean_hr = randomInRange(80, 100); // Higher resting HR
      baseWorker.temperature = randomInRange(28, 35); // Hot environment
      baseWorker.humidity = randomInRange(70, 90); // High humidity
      break;
  }
  
  return baseWorker;
}

/**
 * Converts a Worker object to the format expected by the ML backend
 * @param worker - Worker object
 * @returns Array of feature values in the correct order
 */
export function workerToFeatureArray(worker: Worker): number[] {
  return [
    worker.gender,
    worker.age,
    
    // HRV Time Domain
    worker.hrv_mean_nni,
    worker.hrv_median_nni,
    worker.hrv_range_nni,
    worker.hrv_sdsd,
    worker.hrv_rmssd,
    worker.hrv_nni_50,
    worker.hrv_pnni_50,
    worker.hrv_nni_20,
    worker.hrv_pnni_20,
    worker.hrv_cvsd,
    worker.hrv_sdnn,
    worker.hrv_cvnni,
    
    // HRV Frequency Domain
    worker.hrv_mean_hr,
    worker.hrv_min_hr,
    worker.hrv_max_hr,
    worker.hrv_std_hr,
    worker.hrv_total_power,
    worker.hrv_vlf,
    worker.hrv_lf,
    worker.hrv_hf,
    worker.hrv_lf_hf_ratio,
    worker.hrv_lfnu,
    worker.hrv_hfnu,
    
    // HRV Geometric
    worker.hrv_sd1,
    worker.hrv_sd2,
    worker.hrv_sd2sd1,
    worker.hrv_csi,
    worker.hrv_cvi,
    worker.hrv_csi_modified,
    
    // HRV Statistical
    worker.hrv_mean,
    worker.hrv_std,
    worker.hrv_min,
    worker.hrv_max,
    worker.hrv_ptp,
    worker.hrv_sum,
    worker.hrv_energy,
    worker.hrv_skewness,
    worker.hrv_kurtosis,
    worker.hrv_peaks,
    worker.hrv_rms,
    worker.hrv_lineintegral,
    worker.hrv_n_above_mean,
    worker.hrv_n_below_mean,
    worker.hrv_n_sign_changes,
    worker.hrv_iqr,
    worker.hrv_iqr_5_95,
    worker.hrv_pct_5,
    worker.hrv_pct_95,
    worker.hrv_entropy,
    worker.hrv_perm_entropy,
    worker.hrv_svd_entropy,
    
    // Environmental
    worker.temperature,
    worker.humidity
  ];
}