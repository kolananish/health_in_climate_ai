import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import SimulationControls from '@/app/components/SimulationControls';
import { SimulationState } from '@/types';

describe('SimulationControls Component', () => {
  const mockProps = {
    onStartHeatUp: jest.fn(),
    onStartCoolDown: jest.fn(),
    onStop: jest.fn(),
    onViewData: jest.fn(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should render heat up and cool down buttons when simulation is not active', () => {
    const simulationState: SimulationState = {
      isActive: false,
      type: null,
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    expect(screen.getByText('Simulate Heat Up')).toBeInTheDocument();
    expect(screen.getByText('Cool Down')).toBeInTheDocument();
    expect(screen.getByText('View Data')).toBeInTheDocument();
    expect(screen.queryByText('Stop Simulation')).not.toBeInTheDocument();
  });

  it('should render stop button when simulation is active', () => {
    const simulationState: SimulationState = {
      isActive: true,
      type: 'heatup',
      targetWorker: 'John Doe',
      currentValues: { temperature: 25.5, humidity: 65.2 }
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    expect(screen.getByText('Stop Simulation')).toBeInTheDocument();
    expect(screen.queryByText('Simulate Heat Up')).not.toBeInTheDocument();
    expect(screen.queryByText('Cool Down')).not.toBeInTheDocument();
    expect(screen.getByText('View Data')).toBeInTheDocument();
  });

  it('should call onStartHeatUp when heat up button is clicked', () => {
    const simulationState: SimulationState = {
      isActive: false,
      type: null,
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    fireEvent.click(screen.getByText('Simulate Heat Up'));
    expect(mockProps.onStartHeatUp).toHaveBeenCalledTimes(1);
  });

  it('should call onStartCoolDown when cool down button is clicked', () => {
    const simulationState: SimulationState = {
      isActive: false,
      type: null,
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    fireEvent.click(screen.getByText('Cool Down'));
    expect(mockProps.onStartCoolDown).toHaveBeenCalledTimes(1);
  });

  it('should call onStop when stop button is clicked', () => {
    const simulationState: SimulationState = {
      isActive: true,
      type: 'heatup',
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    fireEvent.click(screen.getByText('Stop Simulation'));
    expect(mockProps.onStop).toHaveBeenCalledTimes(1);
  });

  it('should call onViewData when view data button is clicked', () => {
    const simulationState: SimulationState = {
      isActive: false,
      type: null,
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    fireEvent.click(screen.getByText('View Data'));
    expect(mockProps.onViewData).toHaveBeenCalledTimes(1);
  });

  it('should show simulation status when active', () => {
    const simulationState: SimulationState = {
      isActive: true,
      type: 'heatup',
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    expect(screen.getByText('Running')).toBeInTheDocument();
    expect(screen.getByText(/Heat Up simulation active for John Doe/)).toBeInTheDocument();
  });

  it('should show cool down status when cool down simulation is active', () => {
    const simulationState: SimulationState = {
      isActive: true,
      type: 'cooldown',
      targetWorker: 'John Doe',
      currentValues: {}
    };

    render(
      <SimulationControls
        simulationState={simulationState}
        {...mockProps}
      />
    );

    expect(screen.getByText(/Cool Down simulation active for John Doe/)).toBeInTheDocument();
  });
});