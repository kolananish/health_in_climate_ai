// Quick debug script to test API connection
const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAPI() {
  try {
    console.log('Testing API health check...');
    const healthResponse = await fetch(' BACKEND_URL/health', {
      method: 'GET',
    });
    console.log('Health check status:', healthResponse.status, healthResponse.ok);
    
    if (healthResponse.ok) {
      console.log('Testing prediction endpoint...');
      
      // Sample worker data
      const testData = {
        "Gender": 1,
        "Age": 35,
        "mean_nni": 800,
        "median_nni": 790,
        "range_nni": 400,
        "sdsd": 45,
        "rmssd": 50,
        "nni_50": 100,
        "pnni_50": 25,
        "nni_20": 150,
        "pnni_20": 40,
        "cvsd": 0.06,
        "sdnn": 60,
        "cvnni": 0.07,
        "mean_hr": 75,
        "min_hr": 60,
        "max_hr": 95,
        "std_hr": 12,
        "total_power": 2500,
        "vlf": 200,
        "lf": 800,
        "hf": 400,
        "lf_hf_ratio": 2.0,
        "lfnu": 60,
        "hfnu": 40,
        "SD1": 35,
        "SD2": 85,
        "SD2SD1": 2.4,
        "CSI": 4,
        "CVI": 5,
        "CSI_Modified": 6,
        "mean": 800,
        "std": 60,
        "min": 600,
        "max": 1000,
        "ptp": 400,
        "sum": 80000,
        "energy": 10000000,
        "skewness": 0.5,
        "kurtosis": 3,
        "peaks": 25,
        "rms": 800,
        "lineintegral": 50000,
        "n_above_mean": 50,
        "n_below_mean": 50,
        "n_sign_changes": 45,
        "iqr": 150,
        "iqr_5_95": 400,
        "pct_5": 700,
        "pct_95": 1100,
        "entropy": 1.2,
        "perm_entropy": 0.6,
        "svd_entropy": 0.4,
        "Temperature": 25,
        "Humidity": 50
      };
      
      const predictionResponse = await fetch(' BACKEND_URL/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testData),
      });
      
      console.log('Prediction status:', predictionResponse.status, predictionResponse.ok);
      
      if (predictionResponse.ok) {
        const result = await predictionResponse.json();
        console.log('Prediction result:', result);
      } else {
        const errorText = await predictionResponse.text();
        console.log('Prediction error:', errorText);
      }
    }
  } catch (error) {
    console.log('API test failed:', error.message);
  }
}

testAPI();