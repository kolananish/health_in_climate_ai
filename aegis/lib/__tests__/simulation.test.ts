// Tests for simulation engine

import { getSimulationProgress, formatSimulationValues } from '../simulation';
import { Worker } from '@/types';
import { generateWorkerWithRiskProfile } from '../utils';

// Mock the API module
jest.mock('../api', () => ({
  predictWorkerRisk: jest.fn().mockResolvedValue({
    risk_score: 0.5,
    predicted_class: 'moderate',
    confidence: 0.8
  })
}));

describe('Simulation Engine', () => {
  let mockWorkers: Worker[];

  beforeEach(() => {
    // Create mock workers including John Doe
    mockWorkers = [
      generateWorkerWithRiskProfile('John Doe', 'worker-001', 'moderate'),
      generateWorkerWithRiskProfile('Sarah Johnson', 'worker-002', 'low')
    ];
  });

  describe('getSimulationProgress', () => {
    it('should calculate heat up progress correctly', () => {
      const progress = getSimulationProgress(25, 60, 'heatup');
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should calculate cool down progress correctly', () => {
      const progress = getSimulationProgress(30, 70, 'cooldown');
      expect(progress).toBeGreaterThan(0);
      expect(progress).toBeLessThanOrEqual(100);
    });

    it('should return 100% for maximum heat up values', () => {
      const progress = getSimulationProgress(40, 95, 'heatup');
      expect(progress).toBe(100);
    });
  });

  describe('formatSimulationValues', () => {
    it('should format temperature and humidity values', () => {
      const values = { temperature: 25.5, humidity: 65.2 };
      const formatted = formatSimulationValues(values);
      expect(formatted).toBe('Temperature: 25.5°C, Humidity: 65.2%');
    });

    it('should handle partial values', () => {
      const values = { temperature: 25.5 };
      const formatted = formatSimulationValues(values);
      expect(formatted).toBe('Temperature: 25.5°C');
    });

    it('should handle empty values', () => {
      const values = {};
      const formatted = formatSimulationValues(values);
      expect(formatted).toBe('');
    });
  });
});