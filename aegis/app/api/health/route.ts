import { NextRequest, NextResponse } from 'next/server';
import { jsModelLoader } from '@/lib/jsModelLoader';

export async function GET(request: NextRequest) {
  try {
    // Perform health check using the model loader
    const healthResult = await jsModelLoader.healthCheck();

    // Return appropriate status code based on health check result
    const statusCode = healthResult.status === 'healthy' && healthResult.model_loaded ? 200 : 503;

    return NextResponse.json(healthResult, { status: statusCode });
  } catch (error) {
    console.error('Health check error:', error);

    return NextResponse.json(
      {
        status: 'error',
        model_loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Allow POST requests to health endpoint as well for compatibility
  return GET(request);
}