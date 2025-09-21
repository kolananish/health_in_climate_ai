import { NextRequest, NextResponse } from 'next/server';
import { jsModelLoader, PredictionInput } from '@/lib/jsModelLoader';

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();

    // Debug: Log the incoming request
    console.log('\n🔍 AEGIS API RECEIVED:');
    console.log(`   Temperature: ${body.Temperature || 'MISSING'}`);
    console.log(`   Humidity: ${body.Humidity || 'MISSING'}`);
    console.log(`   HR Mean: ${body.hrv_mean_hr || 'MISSING'}`);
    console.log(`   HRV RMSSD: ${body.hrv_rmssd || 'MISSING'}`);
    console.log(`   Gender: ${body.Gender || 'MISSING'}`);
    console.log(`   Age: ${body.Age || 'MISSING'}`);

    // Validate required fields
    if (typeof body.Temperature !== 'number' || typeof body.Humidity !== 'number') {
      return NextResponse.json(
        { error: 'Temperature and Humidity are required numeric fields' },
        { status: 400 }
      );
    }

    // Prepare prediction input
    const predictionInput: PredictionInput = {
      Temperature: body.Temperature,
      Humidity: body.Humidity,
      hrv_mean_hr: body.hrv_mean_hr || 0,
      hrv_rmssd: body.hrv_rmssd || 0,
      Gender: body.Gender || 0,
      Age: body.Age || 30,
      // Include any additional fields from the request
      ...body
    };

    // Make prediction using the model loader
    const predictionResult = await jsModelLoader.predict(predictionInput);

    // Check for errors in prediction
    if (predictionResult.error) {
      console.error('Prediction error:', predictionResult.error);
      return NextResponse.json(
        { error: predictionResult.error },
        { status: 500 }
      );
    }

    // Debug: Log the prediction result
    console.log('   🎯 AEGIS PREDICTION RESULT:');
    console.log(`      Risk score: ${predictionResult.risk_score}`);
    console.log(`      Predicted class: ${predictionResult.predicted_class}`);
    console.log(`      Confidence: ${predictionResult.confidence}`);

    // Return successful prediction
    return NextResponse.json({
      risk_score: predictionResult.risk_score,
      predicted_class: predictionResult.predicted_class,
      confidence: predictionResult.confidence
    });

  } catch (error) {
    console.error('API predict endpoint error:', error);

    // Handle JSON parsing errors
    if (error instanceof SyntaxError) {
      return NextResponse.json(
        { error: 'Invalid JSON in request body' },
        { status: 400 }
      );
    }

    // Handle other errors
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error occurred' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  // Return API information for GET requests
  return NextResponse.json({
    message: 'Thermal Comfort Prediction API',
    version: '1.0.0',
    endpoints: {
      'POST /api/predict': 'Make thermal comfort predictions',
      'GET /api/health': 'Check API health status'
    },
    required_fields: ['Temperature', 'Humidity'],
    optional_fields: ['hrv_mean_hr', 'hrv_rmssd', 'Gender', 'Age']
  });
}