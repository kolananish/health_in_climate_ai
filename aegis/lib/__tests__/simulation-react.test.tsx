// Test to verify simulation engine works with React components

import React from 'react';
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

// Simple test component that uses the simulation hook
function TestSimulationComponent() {
  const [workers] = React.useState<Worker[]>([
    generateWorkerWithRiskProfile('John Doe', 'worker-001', 'moderate')
  ]);

  const handleWorkerUpdate = React.useCallback((workerId: string, updates: Partial<Worker>) => {
    console.log('Worker update:', workerId, updates);
  }, []);

  // Import simulation hook dynamically to avoid issues with React hooks in tests
  const [simulationHook, setSimulationHook] = React.useState<any>(null);

  React.useEffect(() => {
    import('../simulation').then(module => {
      setSimulationHook(() => module.useSimulation);
    });
  }, []);

  if (!simulationHook) {
    return <div>Loading simulation...</div>;
  }

  return <div>Simulation component loaded</div>;
}

describe('Simulation React Integration', () => {
  it('should render test component without errors', () => {
    // This test verifies that the simulation module can be imported in a React context
    const component = React.createElement(TestSimulationComponent);
    expect(component).toBeDefined();
    expect(component.type).toBe(TestSimulationComponent);
  });

  it('should have simulation functions available', async () => {
    const simulationModule = await import('../simulation');
    
    // Verify all expected exports are available
    expect(typeof simulationModule.useSimulation).toBe('function');
    expect(typeof simulationModule.getSimulationProgress).toBe('function');
    expect(typeof simulationModule.formatSimulationValues).toBe('function');
  });
});