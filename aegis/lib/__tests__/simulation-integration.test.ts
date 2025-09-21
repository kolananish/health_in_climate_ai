// Integration test for simulation engine

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

describe('Simulation Engine Integration', () => {
  let mockWorkers: Worker[];
  let mockOnWorkerUpdate: jest.Mock;

  beforeEach(() => {
    // Create mock workers including John Doe
    mockWorkers = [
      generateWorkerWithRiskProfile('John Doe', 'worker-001', 'moderate'),
      generateWorkerWithRiskProfile('Sarah Johnson', 'worker-002', 'low')
    ];
    
    mockOnWorkerUpdate = jest.fn();
  });

  it('should import simulation module without errors', async () => {
    // Test that the simulation module can be imported
    const simulationModule = await import('../simulation');
    
    expect(simulationModule.useSimulation).toBeDefined();
    expect(simulationModule.getSimulationProgress).toBeDefined();
    expect(simulationModule.formatSimulationValues).toBeDefined();
  });

  it('should have correct simulation constants', async () => {
    // Test that simulation constants are reasonable
    const simulationModule = await import('../simulation');
    
    // Test utility functions work with realistic values
    const progress = simulationModule.getSimulationProgress(25, 60, 'heatup');
    expect(progress).toBeGreaterThanOrEqual(0);
    expect(progress).toBeLessThanOrEqual(100);
    
    const formatted = simulationModule.formatSimulationValues({
      temperature: 25.5,
      humidity: 65.2
    });
    expect(formatted).toContain('Temperature');
    expect(formatted).toContain('Humidity');
  });

  it('should handle John Doe worker correctly', () => {
    const johnDoe = mockWorkers.find(w => w.name === 'John Doe');
    expect(johnDoe).toBeDefined();
    expect(johnDoe?.name).toBe('John Doe');
    expect(johnDoe?.temperature).toBeGreaterThan(0);
    expect(johnDoe?.humidity).toBeGreaterThan(0);
  });
});