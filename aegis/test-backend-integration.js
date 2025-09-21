// Simple test to verify backend integration
// Run with: node test-backend-integration.js

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testBackendIntegration() {
  console.log('🧪 Testing Backend Integration\n');
  
  try {
    // Test health check
    console.log('🏥 Testing API health...');
    const healthResponse = await fetch('http://localhost:8000/docs', { method: 'HEAD' });
    console.log(`  Status: ${healthResponse.status} ${healthResponse.statusText}`);
    
    if (!healthResponse.ok) {
      console.log('❌ Backend is not healthy');
      return;
    }
    
    console.log('✅ Backend is healthy\n');
    
    // Test prediction endpoint
    console.log('🔮 Testing prediction endpoint...');
    
    const testData = {
      "Gender": 1,
      "Age": 30,
      "Temperature": 28.5,
      "Humidity": 65,
      "mean_nni": 800,
      "median_nni": 790,
      "range_nni": 400,
      "sdsd": 45,
      "rmssd": 50,
      "nni_50": 25,
      "pnni_50": 15,
      "nni_20": 45,
      "pnni_20": 25,
      "cvsd": 0.06,
      "sdnn": 55,
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
      "lfnu": 65,
      "hfnu": 35,
      "SD1": 35,
      "SD2": 85,
      "SD2SD1": 2.4,
      "CSI": 4,
      "CVI": 5,
      "CSI_Modified": 6,
      "mean": 800,
      "std": 55,
      "min": 600,
      "max": 1000,
      "ptp": 400,
      "sum": 80000,
      "energy": 5000000,
      "skewness": 0.5,
      "kurtosis": 3.2,
      "peaks": 25,
      "rms": 805,
      "lineintegral": 50000,
      "n_above_mean": 45,
      "n_below_mean": 55,
      "n_sign_changes": 35,
      "iqr": 120,
      "iqr_5_95": 350,
      "pct_5": 650,
      "pct_95": 950,
      "entropy": 1.2,
      "perm_entropy": 0.7,
      "svd_entropy": 0.5
    };
    
    const predictionResponse = await fetch('http://localhost:8000/predict', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testData)
    });
    
    console.log(`  Status: ${predictionResponse.status} ${predictionResponse.statusText}`);
    
    if (!predictionResponse.ok) {
      const errorText = await predictionResponse.text();
      console.log(`❌ Prediction failed: ${errorText}`);
      return;
    }
    
    const prediction = await predictionResponse.json();
    console.log('✅ Prediction successful!');
    console.log(`  Risk Score: ${prediction.risk_score}`);
    console.log(`  Predicted Class: ${prediction.predicted_class}`);
    console.log(`  Confidence: ${prediction.confidence}`);
    
    // Validate response format
    if (typeof prediction.risk_score === 'number' && 
        prediction.risk_score >= 0 && prediction.risk_score <= 1 &&
        typeof prediction.predicted_class === 'string' &&
        typeof prediction.confidence === 'number' &&
        prediction.confidence >= 0 && prediction.confidence <= 1) {
      console.log('✅ Response format is valid');
    } else {
      console.log('❌ Response format is invalid');
    }
    
    console.log('\n🎉 Backend integration test completed successfully!');
    
  } catch (error) {
    console.log(`❌ Test failed: ${error.message}`);
    if (error.code === 'ECONNREFUSED') {
      console.log('💡 Make sure the backend server is running on http://localhost:8000');
    }
  }
}

testBackendIntegration();