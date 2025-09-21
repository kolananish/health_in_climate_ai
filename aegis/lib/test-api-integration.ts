// Simple integration test for API service
// Run with: npx ts-node lib/test-api-integration.ts

import { predictWorkerRisk, checkAPIHealth, getAPIConfig } from './api';
import { generateWorkerData } from './utils';

async function testAPIIntegration() {
  console.log('🧪 Testing Worker Health Dashboard API Integration\n');
  
  // Test API configuration
  console.log('📋 API Configuration:');
  const config = getAPIConfig();
  console.log(`  Base URL: ${config.baseUrl}`);
  console.log(`  Timeout: ${config.timeout}ms`);
  console.log(`  Max Retries: ${config.maxRetries}`);
  console.log(`  Retry Delay: ${config.retryDelay}ms\n`);
  
  // Test API health check
  console.log('🏥 Checking API Health...');
  try {
    const isHealthy = await checkAPIHealth();
    console.log(`  API Status: ${isHealthy ? '✅ Healthy' : '❌ Unhealthy'}\n`);
    
    if (!isHealthy) {
      console.log('⚠️  Backend API is not available. Make sure to start the FastAPI server:');
      console.log('   cd backend && python main.py\n');
      return;
    }
  } catch (error) {
    console.log(`  API Health Check Failed: ${error}\n`);
    return;
  }
  
  // Test worker prediction
  console.log('👷 Testing Worker Risk Prediction...');
  try {
    // Generate test worker data
    const testWorker = generateWorkerData('John Doe', 'test-001');
    console.log(`  Generated test worker: ${testWorker.name}`);
    console.log(`  Age: ${testWorker.age}, Gender: ${testWorker.gender}`);
    console.log(`  Temperature: ${testWorker.temperature}°C, Humidity: ${testWorker.humidity}%`);
    console.log(`  Sample HRV metrics: HR=${testWorker.hrv_mean_hr}, RMSSD=${testWorker.hrv_rmssd}\n`);
    
    // Make prediction request
    console.log('🔮 Making prediction request...');
    const prediction = await predictWorkerRisk(testWorker);
    
    console.log('✅ Prediction successful!');
    console.log(`  Risk Score: ${prediction.risk_score} (${(prediction.risk_score * 100).toFixed(1)}%)`);
    console.log(`  Predicted Class: ${prediction.predicted_class}`);
    console.log(`  Confidence: ${prediction.confidence} (${(prediction.confidence * 100).toFixed(1)}%)\n`);
    
    // Test risk score validation
    if (prediction.risk_score >= 0 && prediction.risk_score <= 1) {
      console.log('✅ Risk score is within valid range (0.0 - 1.0)');
    } else {
      console.log('❌ Risk score is outside valid range');
    }
    
    if (prediction.confidence >= 0 && prediction.confidence <= 1) {
      console.log('✅ Confidence is within valid range (0.0 - 1.0)');
    } else {
      console.log('❌ Confidence is outside valid range');
    }
    
    console.log('\n🎉 API Integration Test Completed Successfully!');
    
  } catch (error) {
    console.log(`❌ Prediction failed: ${error}`);
    
    if (error instanceof Error) {
      console.log(`   Error type: ${error.constructor.name}`);
      console.log(`   Error message: ${error.message}`);
    }
  }
}

// Test error handling
async function testErrorHandling() {
  console.log('\n🚨 Testing Error Handling...');
  
  try {
    // Test with invalid worker data (missing required fields)
    const invalidWorker = {
      id: 'invalid',
      name: 'Invalid Worker'
    } as any;
    
    console.log('  Testing with invalid worker data...');
    await predictWorkerRisk(invalidWorker);
    console.log('❌ Should have thrown an error');
  } catch (error) {
    console.log('✅ Error handling working correctly');
    console.log(`   Caught error: ${error}`);
  }
}

// Run tests
async function runTests() {
  try {
    await testAPIIntegration();
    await testErrorHandling();
  } catch (error) {
    console.log(`\n💥 Test suite failed: ${error}`);
  }
}

// Execute if run directly
if (require.main === module) {
  runTests();
}

export { testAPIIntegration, testErrorHandling };