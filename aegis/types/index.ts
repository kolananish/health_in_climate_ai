// TypeScript interfaces for Worker Health Dashboard

export interface Worker {
  id: string;
  name: string;
  gender: number;
  age: number;
  
  // HRV Time Domain metrics (13 fields)
  hrv_mean_nni: number;
  hrv_median_nni: number;
  hrv_range_nni: number;
  hrv_sdsd: number;
  hrv_rmssd: number;
  hrv_nni_50: number;
  hrv_pnni_50: number;
  hrv_nni_20: number;
  hrv_pnni_20: number;
  hrv_cvsd: number;
  hrv_sdnn: number;
  hrv_cvnni: number;
  
  // HRV Frequency Domain metrics (8 fields)
  hrv_mean_hr: number;
  hrv_min_hr: number;
  hrv_max_hr: number;
  hrv_std_hr: number;
  hrv_total_power: number;
  hrv_vlf: number;
  hrv_lf: number;
  hrv_hf: number;
  hrv_lf_hf_ratio: number;
  hrv_lfnu: number;
  hrv_hfnu: number;
  
  // HRV Geometric metrics (6 fields)
  hrv_sd1: number;
  hrv_sd2: number;
  hrv_sd2sd1: number;
  hrv_csi: number;
  hrv_cvi: number;
  hrv_csi_modified: number;
  
  // HRV Statistical metrics (21 fields)
  hrv_mean: number;
  hrv_std: number;
  hrv_min: number;
  hrv_max: number;
  hrv_ptp: number;
  hrv_sum: number;
  hrv_energy: number;
  hrv_skewness: number;
  hrv_kurtosis: number;
  hrv_peaks: number;
  hrv_rms: number;
  hrv_lineintegral: number;
  hrv_n_above_mean: number;
  hrv_n_below_mean: number;
  hrv_n_sign_changes: number;
  hrv_iqr: number;
  hrv_iqr_5_95: number;
  hrv_pct_5: number;
  hrv_pct_95: number;
  hrv_entropy: number;
  hrv_perm_entropy: number;
  hrv_svd_entropy: number;
  
  // Environmental metrics (2 fields)
  temperature: number;
  humidity: number;
  
  // ML model response fields (optional)
  riskScore?: number;
  predictedClass?: string;
  confidence?: number;
}

export interface PredictionResponse {
  risk_score: number;
  predicted_class: string;
  confidence: number;
}

export interface SimulationState {
  isActive: boolean;
  type: 'heatup' | 'cooldown' | null;
  targetWorker: string;
  currentValues: Partial<Worker>;
  intervalId?: NodeJS.Timeout;
}