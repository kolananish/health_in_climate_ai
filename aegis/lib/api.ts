// API service functions for communicating with FastAPI backend

import { Worker, PredictionResponse } from '@/types';
import { workerToFeatureArray } from './utils';
import { FEATURE_NAMES } from './constants';

// API configuration
const API_BASE_URL = process.env.NEXT_PUBLIC_BACKEND_URL || 'https://a36a70b47eb0.ngrok-free.app';
const API_TIMEOUT = 10000; // 10 seconds
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second

// Custom error types for better error handling
export class APIError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string
  ) {
    super(message);
    this.name = 'APIError';
  }
}

export class NetworkError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'NetworkError';
  }
}

export class TimeoutError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'TimeoutError';
  }
}

/**
 * Creates a timeout promise that rejects after the specified duration
 * @param ms - Timeout duration in milliseconds
 * @returns Promise that rejects with TimeoutError
 */
function createTimeoutPromise(ms: number): Promise<never> {
  return new Promise((_, reject) => {
    setTimeout(() => reject(new TimeoutError(`Request timed out after ${ms}ms`)), ms);
  });
}

/**
 * Delays execution for the specified duration
 * @param ms - Delay duration in milliseconds
 * @returns Promise that resolves after the delay
 */
function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Converts Worker object to the format expected by the backend API
 * @param worker - Worker object with all 55 features
 * @returns Object with feature names as keys and values as numbers
 */
function workerToAPIFormat(worker: Worker): Record<string, number> {
  const featureArray = workerToFeatureArray(worker);
  const apiData: Record<string, number> = {};
  
  // Map feature values to their corresponding names
  FEATURE_NAMES.forEach((featureName, index) => {
    apiData[featureName] = featureArray[index];
  });
  
  return apiData;
}

/**
 * Validates the prediction response from the backend
 * @param response - Raw response object
 * @returns True if response is valid
 */
function validatePredictionResponse(response: unknown): response is PredictionResponse {
  if (typeof response !== 'object' || response === null) {
    return false;
  }
  
  const obj = response as Record<string, unknown>;
  
  return (
    typeof obj.risk_score === 'number' &&
    typeof obj.predicted_class === 'string' &&
    typeof obj.confidence === 'number' &&
    obj.risk_score >= 0 &&
    obj.risk_score <= 1 &&
    obj.confidence >= 0 &&
    obj.confidence <= 1
  );
}

/**
 * Makes a single prediction request to the backend
 * @param worker - Worker object with all required features
 * @returns Promise resolving to PredictionResponse
 */
async function makePredictionRequest(worker: Worker): Promise<PredictionResponse> {
  const apiData = workerToAPIFormat(worker);
  
  const fetchPromise = fetch(`${API_BASE_URL}/predict`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(apiData),
  });
  
  // Race between fetch and timeout
  const response = await Promise.race([
    fetchPromise,
    createTimeoutPromise(API_TIMEOUT)
  ]);
  
  // Check if response is ok
  if (!response.ok) {
    const _errorText = await response.text().catch(() => 'Unknown error');
    throw new APIError(
      `API request failed: ${response.status} ${response.statusText}`,
      response.status,
      'API_ERROR'
    );
  }
  
  // Parse JSON response
  let jsonResponse;
  try {
    jsonResponse = await response.json();
  } catch (_error) {
    throw new APIError('Invalid JSON response from API', response.status, 'INVALID_JSON');
  }
  
  // Validate response structure
  if (!validatePredictionResponse(jsonResponse)) {
    throw new APIError('Invalid response format from API', response.status, 'INVALID_RESPONSE');
  }
  
  return jsonResponse;
}

/**
 * Makes a prediction request with retry logic and error handling
 * @param worker - Worker object with all required features
 * @param retryCount - Current retry attempt (internal use)
 * @returns Promise resolving to PredictionResponse
 */
export async function predictWorkerRisk(
  worker: Worker,
  retryCount: number = 0
): Promise<PredictionResponse> {
  try {
    return await makePredictionRequest(worker);
  } catch (error) {
    // Don't retry on validation errors or client errors (4xx)
    if (error instanceof APIError && error.status && error.status >= 400 && error.status < 500) {
      throw error;
    }
    
    // Retry on network errors, timeouts, and server errors (5xx)
    if (retryCount < MAX_RETRIES) {
      console.warn(`Prediction request failed (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
      
      // Wait before retrying with exponential backoff
      const delayMs = RETRY_DELAY * Math.pow(2, retryCount);
      await delay(delayMs);
      
      return predictWorkerRisk(worker, retryCount + 1);
    }
    
    // Convert fetch errors to more specific error types
    if (error instanceof TypeError && error.message.includes('fetch')) {
      throw new NetworkError('Network error: Unable to connect to the backend API');
    }
    
    // Re-throw the original error if all retries failed
    throw error;
  }
}

/**
 * Makes prediction requests for multiple workers concurrently
 * @param workers - Array of Worker objects
 * @returns Promise resolving to array of results (success or error)
 */
export async function predictMultipleWorkers(
  workers: Worker[]
): Promise<Array<{ worker: Worker; result?: PredictionResponse; error?: Error }>> {
  const promises = workers.map(async (worker) => {
    try {
      const result = await predictWorkerRisk(worker);
      return { worker, result };
    } catch (error) {
      return { worker, error: error as Error };
    }
  });
  
  return Promise.all(promises);
}

/**
 * Checks if the backend API is available
 * @returns Promise resolving to true if API is available, false otherwise
 */
export async function checkAPIHealth(): Promise<boolean> {
  try {
    const response = await Promise.race([
      fetch(`${API_BASE_URL}/health`, { method: 'GET' }),
      createTimeoutPromise(5000), // Shorter timeout for health check
    ]);
    return response.ok;
  } catch (error) {
    console.warn('API health check failed:', error);
    return false;
  }
}

/**
 * Gets the current API configuration
 * @returns Object with API configuration details
 */
export function getAPIConfig() {
  return {
    baseUrl: API_BASE_URL,
    timeout: API_TIMEOUT,
    maxRetries: MAX_RETRIES,
    retryDelay: RETRY_DELAY
  };
}