// Tests for API service functions

import { 
  predictWorkerRisk, 
  predictMultipleWorkers, 
  checkAPIHealth, 
  getAPIConfig,
  APIError,
  NetworkError,
  TimeoutError
} from '../api';
import { generateWorkerData } from '../utils';

// Mock fetch for testing
global.fetch = jest.fn();

describe('API Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.clearAllTimers();
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe('predictWorkerRisk', () => {
    const mockWorker = generateWorkerData('Test Worker', 'test-001');

    it('should successfully predict worker risk', async () => {
      const mockResponse = {
        risk_score: 0.75,
        predicted_class: 'warm',
        confidence: 0.85
      };

      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => mockResponse,
        status: 200,
        statusText: 'OK'
      });

      const result = await predictWorkerRisk(mockWorker);

      expect(result).toEqual(mockResponse);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/predict',
        expect.objectContaining({
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: expect.any(String)
        })
      );
    });

    it('should handle API errors correctly', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Server error'
      });

      await expect(predictWorkerRisk(mockWorker)).rejects.toThrow(APIError);
    });

    it('should handle network errors', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new TypeError('fetch failed'));

      await expect(predictWorkerRisk(mockWorker)).rejects.toThrow(NetworkError);
    });

    it('should handle timeout errors', async () => {
      (fetch as jest.Mock).mockImplementationOnce(
        () => new Promise(resolve => setTimeout(resolve, 15000))
      );

      const promise = predictWorkerRisk(mockWorker);
      
      // Fast-forward time to trigger timeout
      jest.advanceTimersByTime(10000);
      
      await expect(promise).rejects.toThrow(TimeoutError);
    });

    it('should retry on server errors', async () => {
      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: false,
          status: 503,
          statusText: 'Service Unavailable',
          text: async () => 'Service unavailable'
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            risk_score: 0.5,
            predicted_class: 'neutral',
            confidence: 0.9
          })
        });

      const promise = predictWorkerRisk(mockWorker);
      
      // Fast-forward time for retry delay
      jest.advanceTimersByTime(1000);
      
      const result = await promise;
      
      expect(result.risk_score).toBe(0.5);
      expect(fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate response format', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true,
        json: async () => ({ invalid: 'response' }),
        status: 200
      });

      await expect(predictWorkerRisk(mockWorker)).rejects.toThrow(APIError);
    });
  });

  describe('predictMultipleWorkers', () => {
    it('should handle multiple workers successfully', async () => {
      const workers = [
        generateWorkerData('Worker 1', 'w1'),
        generateWorkerData('Worker 2', 'w2')
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            risk_score: 0.3,
            predicted_class: 'neutral',
            confidence: 0.8
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            risk_score: 0.7,
            predicted_class: 'warm',
            confidence: 0.9
          })
        });

      const results = await predictMultipleWorkers(workers);

      expect(results).toHaveLength(2);
      expect(results[0].result?.risk_score).toBe(0.3);
      expect(results[1].result?.risk_score).toBe(0.7);
      expect(results[0].error).toBeUndefined();
      expect(results[1].error).toBeUndefined();
    });

    it('should handle mixed success and failure', async () => {
      const workers = [
        generateWorkerData('Worker 1', 'w1'),
        generateWorkerData('Worker 2', 'w2')
      ];

      (fetch as jest.Mock)
        .mockResolvedValueOnce({
          ok: true,
          json: async () => ({
            risk_score: 0.3,
            predicted_class: 'neutral',
            confidence: 0.8
          })
        })
        .mockRejectedValueOnce(new TypeError('fetch failed'));

      const results = await predictMultipleWorkers(workers);

      expect(results).toHaveLength(2);
      expect(results[0].result?.risk_score).toBe(0.3);
      expect(results[0].error).toBeUndefined();
      expect(results[1].result).toBeUndefined();
      expect(results[1].error).toBeInstanceOf(NetworkError);
    });
  });

  describe('checkAPIHealth', () => {
    it('should return true when API is healthy', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: true
      });

      const isHealthy = await checkAPIHealth();

      expect(isHealthy).toBe(true);
      expect(fetch).toHaveBeenCalledWith(
        'http://localhost:8000/docs',
        { method: 'HEAD' }
      );
    });

    it('should return false when API is unhealthy', async () => {
      (fetch as jest.Mock).mockResolvedValueOnce({
        ok: false
      });

      const isHealthy = await checkAPIHealth();

      expect(isHealthy).toBe(false);
    });

    it('should return false on network error', async () => {
      (fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

      const isHealthy = await checkAPIHealth();

      expect(isHealthy).toBe(false);
    });
  });

  describe('getAPIConfig', () => {
    it('should return correct API configuration', () => {
      const config = getAPIConfig();

      expect(config).toEqual({
        baseUrl: 'http://localhost:8000',
        timeout: 10000,
        maxRetries: 3,
        retryDelay: 1000
      });
    });
  });
});