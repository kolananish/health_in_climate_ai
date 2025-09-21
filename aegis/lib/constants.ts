// Feature constants for Worker Health Dashboard

// All 55 feature names in the order expected by the ML model
export const FEATURE_NAMES = [
  'Gender',
  'Age',
  
  // HRV Time Domain (13 fields)
  'hrv_mean_nni',
  'hrv_median_nni', 
  'hrv_range_nni',
  'hrv_sdsd',
  'hrv_rmssd',
  'hrv_nni_50',
  'hrv_pnni_50',
  'hrv_nni_20',
  'hrv_pnni_20',
  'hrv_cvsd',
  'hrv_sdnn',
  'hrv_cvnni',
  
  // HRV Frequency Domain (11 fields)
  'hrv_mean_hr',
  'hrv_min_hr',
  'hrv_max_hr',
  'hrv_std_hr',
  'hrv_total_power',
  'hrv_vlf',
  'hrv_lf',
  'hrv_hf',
  'hrv_lf_hf_ratio',
  'hrv_lfnu',
  'hrv_hfnu',
  
  // HRV Geometric (6 fields)
  'hrv_SD1',
  'hrv_SD2',
  'hrv_SD2SD1',
  'hrv_CSI',
  'hrv_CVI',
  'hrv_CSI_Modified',
  
  // HRV Statistical (21 fields)
  'hrv_mean',
  'hrv_std',
  'hrv_min',
  'hrv_max',
  'hrv_ptp',
  'hrv_sum',
  'hrv_energy',
  'hrv_skewness',
  'hrv_kurtosis',
  'hrv_peaks',
  'hrv_rms',
  'hrv_lineintegral',
  'hrv_n_above_mean',
  'hrv_n_below_mean',
  'hrv_n_sign_changes',
  'hrv_iqr',
  'hrv_iqr_5_95',
  'hrv_pct_5',
  'hrv_pct_95',
  'hrv_entropy',
  'hrv_perm_entropy',
  'hrv_svd_entropy',
  
  // Environmental (2 fields)
  'Temperature',
  'Humidity'
] as const;

// Baseline ranges for generating realistic mock data
export const FEATURE_RANGES = {
  // Demographics
  gender: { min: 0, max: 1 }, // 0 = female, 1 = male
  age: { min: 22, max: 65 },
  
  // HRV Time Domain
  hrv_mean_nni: { min: 600, max: 1200 },
  hrv_median_nni: { min: 580, max: 1180 },
  hrv_range_nni: { min: 200, max: 800 },
  hrv_sdsd: { min: 10, max: 100 },
  hrv_rmssd: { min: 15, max: 120 },
  hrv_nni_50: { min: 0, max: 200 },
  hrv_pnni_50: { min: 0, max: 50 },
  hrv_nni_20: { min: 0, max: 300 },
  hrv_pnni_20: { min: 0, max: 80 },
  hrv_cvsd: { min: 0.01, max: 0.15 },
  hrv_sdnn: { min: 20, max: 150 },
  hrv_cvnni: { min: 0.02, max: 0.12 },
  
  // HRV Frequency Domain
  hrv_mean_hr: { min: 50, max: 100 },
  hrv_min_hr: { min: 45, max: 80 },
  hrv_max_hr: { min: 80, max: 150 },
  hrv_std_hr: { min: 5, max: 25 },
  hrv_total_power: { min: 500, max: 5000 },
  hrv_vlf: { min: 50, max: 500 },
  hrv_lf: { min: 100, max: 1500 },
  hrv_hf: { min: 50, max: 1000 },
  hrv_lf_hf_ratio: { min: 0.5, max: 4.0 },
  hrv_lfnu: { min: 20, max: 80 },
  hrv_hfnu: { min: 20, max: 80 },
  
  // HRV Geometric
  hrv_sd1: { min: 10, max: 80 },
  hrv_sd2: { min: 30, max: 200 },
  hrv_sd2sd1: { min: 1.5, max: 4.0 },
  hrv_csi: { min: 1, max: 10 },
  hrv_cvi: { min: 2, max: 8 },
  hrv_csi_modified: { min: 1, max: 12 },
  
  // HRV Statistical
  hrv_mean: { min: 600, max: 1200 },
  hrv_std: { min: 20, max: 150 },
  hrv_min: { min: 400, max: 800 },
  hrv_max: { min: 800, max: 1600 },
  hrv_ptp: { min: 200, max: 800 },
  hrv_sum: { min: 30000, max: 120000 },
  hrv_energy: { min: 1000000, max: 50000000 },
  hrv_skewness: { min: -2, max: 2 },
  hrv_kurtosis: { min: 1, max: 10 },
  hrv_peaks: { min: 5, max: 50 },
  hrv_rms: { min: 600, max: 1200 },
  hrv_lineintegral: { min: 10000, max: 100000 },
  hrv_n_above_mean: { min: 20, max: 80 },
  hrv_n_below_mean: { min: 20, max: 80 },
  hrv_n_sign_changes: { min: 10, max: 90 },
  hrv_iqr: { min: 50, max: 300 },
  hrv_iqr_5_95: { min: 200, max: 800 },
  hrv_pct_5: { min: 500, max: 900 },
  hrv_pct_95: { min: 900, max: 1400 },
  hrv_entropy: { min: 0.5, max: 2.0 },
  hrv_perm_entropy: { min: 0.3, max: 1.0 },
  hrv_svd_entropy: { min: 0.2, max: 0.8 },
  
  // Environmental
  temperature: { min: 18, max: 35 }, // Celsius
  humidity: { min: 30, max: 90 } // Percentage
};

// Sample worker names for mock data generation
export const WORKER_NAMES = [
  'John Doe', // Always included for simulation
  'Sarah Johnson',
  'Michael Chen',
  'Emily Rodriguez',
  'David Kim',
  'Lisa Thompson',
  'James Wilson',
  'Maria Garcia',
  'Robert Brown',
  'Jennifer Davis',
  'Christopher Lee',
  'Amanda Martinez'
];

// Risk score color thresholds
export const RISK_COLOR_THRESHOLDS = {
  LOW: 0.2,
  MODERATE: 0.4,
  ELEVATED: 0.6,
  HIGH: 0.8
} as const;

// Color values for risk indicators
export const RISK_COLORS = {
  GREEN: '#10B981',
  YELLOW_GREEN: '#84CC16', 
  YELLOW: '#EAB308',
  ORANGE: '#F97316',
  RED: '#EF4444'
} as const;