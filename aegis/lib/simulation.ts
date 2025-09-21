// Simulation engine for Worker Health Dashboard

import { PredictionResponse, SimulationState, Worker } from '@/types';
import { useCallback, useEffect, useRef, useState } from 'react';
import { predictWorkerRisk } from './api';
import { categorizeError, logError } from './errorHandling';
import { generateWorkerWithRiskProfile } from './utils';

// Default simulation configuration constants
const DEFAULT_SIMULATION_INTERVAL = 500; // 500ms for smooth updates
const TEMPERATURE_INCREMENT = 1.2; // Slightly larger increments for better visibility
const HUMIDITY_INCREMENT = 3.5; // Slightly larger increments for better visibility
const MAX_TEMPERATURE = 34; // Maximum temperature for heat up
const MIN_TEMPERATURE = 10; // Minimum temperature for cool down
const MAX_HUMIDITY = 90; // Maximum humidity for heat up
const MIN_HUMIDITY = 20; // Minimum humidity for cool down

// Heart rate variability changes - different rates for different metrics
// Factors > 1.0 INCREASE HRV, factors < 1.0 DECREASE HRV
// const HRV_INCREASE_RMSSD = 9.6; // RMSSD increases at this rate
// const HRV_INCREASE_SDNN = 0.9; // SDNN increases at this rate
// const HRV_INCREASE_PNN50 = 0.94; // pNN50 increases at this rate
// const HRV_INCREASE_POWER = 0.97; // Power metrics increase at this rate
// const HRV_INCREASE_LF = 0.98; // Low frequency increases at this rate
// const HRV_INCREASE_HF = 0.96; // High frequency increases at this rate

// const HRV_DECREASE_RMSSD = 1.03; // RMSSD decreases at this rate
// const HRV_DECREASE_SDNN = 1.03; // SDNN decreases at this rate
// const HRV_DECREASE_PNN50 = 1.06; // pNN50 decreases at this rate
// const HRV_DECREASE_POWER = 1.05; // Power metrics decrease at this rate
// const HRV_DECREASE_LF = 1.03; // Low frequency decreases at this rate
// const HRV_DECREASE_HF = 1.04; // High frequency decreases at this rate
// const HEART_RATE_STRESS_INCREMENT = 1.5; // BPM increase per step during heat up
// const HEART_RATE_RECOVERY_DECREMENT = 1.2; // BPM decrease per step during cool down

// Heart rate variability changes - different rates for different metrics
// Factors > 1.0 INCREASE HRV, factors < 1.0 DECREASE HRV
const HRV_INCREASE_RMSSD = 1.04; // RMSSD increases at this rate
const HRV_INCREASE_SDNN = 1.03; // SDNN increases at this rate
const HRV_INCREASE_PNN50 = 1.05; // pNN50 increases at this rate
const HRV_INCREASE_POWER = 1.06; // Power metrics increase at this rate
const HRV_INCREASE_LF = 1.03; // Low frequency increases at this rate
const HRV_INCREASE_HF = 1.08; // High frequency increases at this rate

const HRV_DECREASE_RMSSD = 0.96; // RMSSD decreases at this rate
const HRV_DECREASE_SDNN = 0.97; // SDNN decreases at this rate
const HRV_DECREASE_PNN50 = 0.93; // pNN50 decreases at this rate
const HRV_DECREASE_POWER = 0.92; // Power metrics decrease at this rate
const HRV_DECREASE_LF = 0.94; // Low frequency decreases at this rate
const HRV_DECREASE_HF = 0.90; // High frequency decreases at this rate
const HEART_RATE_STRESS_INCREMENT = 1.5; // BPM increase per step during heat up
const HEART_RATE_RECOVERY_DECREMENT = 1.2; // BPM decrease per step during cool down

// Simulation step limits to prevent infinite loops
const MAX_SIMULATION_STEPS = 100;

/**
 * Custom hook for managing simulation state and operations
 * @param workers - Array of current workers
 * @param onWorkerUpdate - Callback to update a worker's data
 * @param onError - Callback to handle simulation errors
 * @param simulationInterval - Custom simulation interval in milliseconds (default: 2000)
 * @returns Simulation state and control functions
 */
export function useSimulation(
  workers: Worker[],
  onWorkerUpdate: (workerId: string, updates: Partial<Worker>) => void,
  onError?: (error: Error, context?: Record<string, unknown>) => void,
  simulationInterval: number = DEFAULT_SIMULATION_INTERVAL
) {
  // Simulation state - keep for UI display only
  const [simulationState, setSimulationState] = useState<SimulationState>({
    isActive: false,
    type: null,
    targetWorker: 'John Doe',
    currentValues: {}
  });

  // Refs to store ALL simulation data synchronously
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const stepCountRef = useRef<number>(0);
  const baselineValuesRef = useRef<Partial<Worker>>({});
  const errorCountRef = useRef<number>(0);
  const consecutiveErrorsRef = useRef<number>(0);
  const simulationTypeRef = useRef<'heatup' | 'cooldown' | null>(null);
  const isActiveRef = useRef<boolean>(false);
  const workersRef = useRef<Worker[]>(workers);
  const currentWorkerValuesRef = useRef<Worker | null>(null);

  /**
   * Clears the simulation interval and resets state
   */
  const clearSimulationInterval = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  /**
   * Stops the current simulation
   */
  const stopSimulation = (reason?: string) => {
    console.log(`🛑 STOPPING SIMULATION: ${reason || 'Manual stop'}`);
    clearSimulationInterval();
    simulationTypeRef.current = null;
    isActiveRef.current = false;
    currentWorkerValuesRef.current = null; // Clear cached values
    setSimulationState(prev => ({
      ...prev,
      isActive: false,
      type: null
    }));
    stepCountRef.current = 0;
    errorCountRef.current = 0;
    consecutiveErrorsRef.current = 0;
  };

  // Update workers ref when workers prop changes
  workersRef.current = workers;

  /**
   * Finds the target worker (John Doe) synchronously
   * @returns Worker object or null if not found
   */
  const findTargetWorker = (): Worker | null => {
    return workersRef.current.find(worker => worker.name === 'John Doe') || null;
  };

  /**
   * Calculates the next simulation values based on the simulation type
   * @param currentWorker - Current worker data
   * @param simulationType - Type of simulation ('heatup' or 'cooldown')
   * @returns Updated worker values
   */
  const calculateNextSimulationValues = useCallback((
    currentWorker: Worker,
    simulationType: 'heatup' | 'cooldown'
  ): Partial<Worker> => {
    const currentTemp = currentWorker.temperature;
    const currentHumidity = currentWorker.humidity;
    const currentMeanHR = currentWorker.hrv_mean_hr;
    const currentRMSSD = currentWorker.hrv_rmssd;
    const currentSDNN = currentWorker.hrv_sdnn;
    const currentMeanNNI = currentWorker.hrv_mean_nni;
    const currentPNN50 = currentWorker.hrv_pnni_50;
    const currentTotalPower = currentWorker.hrv_total_power;
    const currentLF = currentWorker.hrv_lf;
    const currentHF = currentWorker.hrv_hf;

    let newTemp = currentTemp;
    let newHumidity = currentHumidity;
    let newMeanHR = currentMeanHR;
    let newRMSSD = currentRMSSD;
    let newSDNN = currentSDNN;
    let newMeanNNI = currentMeanNNI;
    let newPNN50 = currentPNN50;
    let newTotalPower = currentTotalPower;
    let newLF = currentLF;
    let newHF = currentHF;

    if (simulationType === 'heatup') {
      // Environmental stress increases
      newTemp = Math.min(MAX_TEMPERATURE, currentTemp + TEMPERATURE_INCREMENT);
      newHumidity = Math.min(MAX_HUMIDITY, currentHumidity + HUMIDITY_INCREMENT);

      // Heat up responses - HRV indexes INCREASE
      newMeanHR = Math.min(110, currentMeanHR + HEART_RATE_STRESS_INCREMENT); // Heart rate increases
      newRMSSD = Math.min(120, currentRMSSD * HRV_INCREASE_RMSSD); // RMSSD increases during heat up
      newSDNN = Math.min(150, currentSDNN * HRV_INCREASE_SDNN); // SDNN increases during heat up
      newMeanNNI = Math.min(1200, currentMeanNNI * 1.04); // NNI intervals increase during heat up
      newPNN50 = Math.min(50, currentPNN50 * HRV_INCREASE_PNN50); // pNN50 increases during heat up
      newTotalPower = Math.min(5000, currentTotalPower * HRV_INCREASE_POWER); // Total HRV power increases
      newLF = Math.min(1500, currentLF * HRV_INCREASE_LF); // Low frequency power increases
      newHF = Math.min(1000, currentHF * HRV_INCREASE_HF); // High frequency power increases

    } else if (simulationType === 'cooldown') {
      // Environmental stress decreases
      newTemp = Math.max(MIN_TEMPERATURE, currentTemp - TEMPERATURE_INCREMENT);
      newHumidity = Math.max(MIN_HUMIDITY, currentHumidity - HUMIDITY_INCREMENT);

      // Cool down responses - HRV indexes DECREASE at different rates
      newMeanHR = Math.max(50, currentMeanHR - HEART_RATE_RECOVERY_DECREMENT); // Heart rate decreases
      newRMSSD = Math.max(15, currentRMSSD * HRV_DECREASE_RMSSD); // RMSSD decreases during cool down
      newSDNN = Math.max(20, currentSDNN * HRV_DECREASE_SDNN); // SDNN decreases during cool down
      newMeanNNI = Math.min(1200, currentMeanNNI * 1.04); // NNI intervals increase (slower heart rate)
      newPNN50 = Math.max(5, currentPNN50 * HRV_DECREASE_PNN50); // pNN50 decreases during cool down
      newTotalPower = Math.max(800, currentTotalPower * HRV_DECREASE_POWER); // Total HRV power decreases
      newLF = Math.max(200, currentLF * HRV_DECREASE_LF); // Low frequency power decreases
      newHF = Math.max(100, currentHF * HRV_DECREASE_HF); // High frequency power decreases most
    }

    return {
      temperature: Math.round(newTemp * 10) / 10,
      humidity: Math.round(newHumidity * 10) / 10,
      hrv_mean_hr: Math.round(newMeanHR * 10) / 10,
      hrv_rmssd: Math.round(newRMSSD * 10) / 10,
      hrv_sdnn: Math.round(newSDNN * 10) / 10,
      hrv_mean_nni: Math.round(newMeanNNI),
      hrv_pnni_50: Math.round(newPNN50 * 10) / 10,
      hrv_total_power: Math.round(newTotalPower),
      hrv_lf: Math.round(newLF),
      hrv_hf: Math.round(newHF),
      // Also update related HRV metrics for realism
      hrv_min_hr: Math.round((newMeanHR - 15) * 10) / 10,
      hrv_max_hr: Math.round((newMeanHR + 25) * 10) / 10,
      hrv_std_hr: Math.round((newSDNN * 0.3) * 10) / 10,
      hrv_lf_hf_ratio: Math.round((newLF / newHF) * 100) / 100,
      hrv_median_nni: Math.round(newMeanNNI * 0.98),
      hrv_range_nni: Math.round(newSDNN * 8),
      hrv_cvnni: Math.round((newSDNN / newMeanNNI) * 1000) / 1000
    };
  }, []);

  /**
   * Checks if the simulation should continue based on current values and limits
   * @param currentWorker - Current worker data
   * @param simulationType - Type of simulation
   * @returns True if simulation should continue
   */
  const shouldContinueSimulation = useCallback((
    currentWorker: Worker,
    simulationType: 'heatup' | 'cooldown'
  ): boolean => {
    // Check step count limit
    if (stepCountRef.current >= MAX_SIMULATION_STEPS) {
      return false;
    }

    const temp = currentWorker.temperature;
    const humidity = currentWorker.humidity;

    if (simulationType === 'heatup') {
      // Continue if we haven't reached maximum values
      return temp < MAX_TEMPERATURE || humidity < MAX_HUMIDITY;
    } else if (simulationType === 'cooldown') {
      // Continue if we haven't reached minimum values
      return temp > MIN_TEMPERATURE || humidity > MIN_HUMIDITY;
    }

    return false;
  }, []);

  /**
   * Performs a single simulation step - SYNCHRONOUS approach
   */
  const performSimulationStep = async () => {
    console.log('⚡ PERFORM SIMULATION STEP CALLED');
    console.log('   Active:', isActiveRef.current);
    console.log('   Type:', simulationTypeRef.current);
    
    // Check if simulation should still be running
    if (!isActiveRef.current || !simulationTypeRef.current) {
      console.log('❌ Stopping simulation - not active or no type');
      stopSimulation('Simulation no longer active');
      return;
    }

    // Use cached worker values if available, otherwise find fresh
    let targetWorker = currentWorkerValuesRef.current;
    if (!targetWorker) {
      targetWorker = findTargetWorker();
      if (targetWorker) {
        currentWorkerValuesRef.current = targetWorker;
      }
    }
    
    console.log('   Target worker in step:', targetWorker ? `${targetWorker.name} (${targetWorker.id})` : 'NOT FOUND');
    
    if (!targetWorker) {
      console.log('❌ Stopping simulation - target worker not found');
      stopSimulation('Target worker not found');
      return;
    }

    const simulationType = simulationTypeRef.current;

    try {
      // Calculate next simulation values
      const nextValues = calculateNextSimulationValues(targetWorker, simulationType);
      
      console.log(`🔥 SIMULATION STEP ${stepCountRef.current + 1}:`);
      console.log(`   Previous: temp=${targetWorker.temperature}°C, humidity=${targetWorker.humidity}%`);
      console.log(`   New: temp=${nextValues.temperature}°C, humidity=${nextValues.humidity}%`);
      
      // Create updated worker object for API call
      const updatedWorker: Worker = {
        ...targetWorker,
        ...nextValues
      };

      // Call backend API to get new risk prediction
      console.log(`   🚀 Calling API for John Doe (ID: ${targetWorker.id})`);
      const prediction: PredictionResponse = await predictWorkerRisk(updatedWorker);
      console.log(`   📊 API Response: risk=${prediction.risk_score}, class=${prediction.predicted_class}`);

      // Update worker with new values and prediction results
      const workerUpdates: Partial<Worker> = {
        ...nextValues,
        riskScore: prediction.risk_score,
        predictedClass: prediction.predicted_class,
        confidence: prediction.confidence
      };

      console.log(`   💾 Updating worker with:`);
      console.log(`      temp: ${targetWorker.temperature} → ${workerUpdates.temperature}`);
      console.log(`      humidity: ${targetWorker.humidity} → ${workerUpdates.humidity}`);
      console.log(`      HR: ${targetWorker.hrv_mean_hr} → ${workerUpdates.hrv_mean_hr}`);
      console.log(`      risk: ${workerUpdates.riskScore}`);
      
      onWorkerUpdate(targetWorker.id, workerUpdates);

      // Update our cached worker values for next step
      currentWorkerValuesRef.current = {
        ...targetWorker,
        ...workerUpdates
      };

      // Update simulation state with the complete worker data including prediction results
      setSimulationState(prev => ({
        ...prev,
        currentValues: {
          ...updatedWorker,
          riskScore: prediction.risk_score,
          predictedClass: prediction.predicted_class,
          confidence: prediction.confidence
        }
      }));

      // Increment step count
      stepCountRef.current += 1;

      // Reset consecutive error count on successful step
      consecutiveErrorsRef.current = 0;

      // Check if simulation should continue
      if (!shouldContinueSimulation(updatedWorker, simulationType)) {
        console.log(`Simulation completed after ${stepCountRef.current} steps`);
        stopSimulation('Simulation completed successfully');
      }

    } catch (error) {
      const errorInfo = categorizeError(error as Error, {
        source: 'simulation',
        step: stepCountRef.current,
        simulationType: simulationState.type,
        targetWorker: simulationState.targetWorker
      });
      
      logError(errorInfo);
      
      // Track error counts
      errorCountRef.current += 1;
      consecutiveErrorsRef.current += 1;
      
      console.log(`❌ SIMULATION ERROR:`, error);
      
      // Calculate next values even if API fails
      const nextValues = calculateNextSimulationValues(targetWorker, simulationType);
      
      console.log(`   🔧 Fallback: updating environmental values only`);
      console.log(`   New values: temp=${nextValues.temperature}, humidity=${nextValues.humidity}`);
      
      // Even if API fails, update the environmental values and simulation state
      const updatedWorker: Worker = {
        ...targetWorker,
        ...nextValues
      };
      
      // Update worker with environmental changes (without risk assessment)
      onWorkerUpdate(targetWorker.id, nextValues);
      
      // Update our cached worker values for next step
      currentWorkerValuesRef.current = {
        ...targetWorker,
        ...nextValues
      };
      
      // Update simulation state with current values (without risk assessment)
      setSimulationState(prev => ({
        ...prev,
        currentValues: updatedWorker
      }));
      
      // Notify parent component of error
      if (onError) {
        onError(error as Error, {
          step: stepCountRef.current,
          simulationType: simulationType,
          errorCount: errorCountRef.current,
          consecutiveErrors: consecutiveErrorsRef.current
        });
      }
      
      // Stop simulation if too many consecutive errors (3) or total errors (10)
      if (consecutiveErrorsRef.current >= 3) {
        stopSimulation('Too many consecutive errors');
        return;
      }
      
      if (errorCountRef.current >= 10) {
        stopSimulation('Too many total errors');
        return;
      }
      
      // Continue simulation despite API errors, but increment step count
      stepCountRef.current += 1;
      
      // Stop simulation if too many steps
      if (stepCountRef.current >= MAX_SIMULATION_STEPS) {
        stopSimulation('Maximum steps reached');
        return;
      }
    }
  };

  /**
   * Starts a heat up simulation - SYNCHRONOUS approach
   */
  const startHeatUpSimulation = () => {
    console.log('🚀 STARTING HEAT UP SIMULATION');
    console.log('   Workers array length:', workersRef.current.length);
    console.log('   Workers:', workersRef.current.map(w => `${w.name} (${w.id})`));
    
    const targetWorker = findTargetWorker();
    console.log('   Target worker found:', targetWorker ? `${targetWorker.name} (${targetWorker.id})` : 'NOT FOUND');
    
    if (!targetWorker) {
      console.error('❌ Target worker "John Doe" not found');
      console.log('   Available workers:', workersRef.current.map(w => w.name));
      return;
    }

    console.log('   Current values:', {
      temp: targetWorker.temperature,
      humidity: targetWorker.humidity,
      riskScore: targetWorker.riskScore
    });

    // Stop any existing simulation
    stopSimulation('Starting new simulation');

    // Store baseline values for reference
    baselineValuesRef.current = {
      temperature: targetWorker.temperature,
      humidity: targetWorker.humidity
    };

    // Reset counters and set refs SYNCHRONOUSLY
    stepCountRef.current = 0;
    errorCountRef.current = 0;
    consecutiveErrorsRef.current = 0;
    simulationTypeRef.current = 'heatup';
    isActiveRef.current = true;
    currentWorkerValuesRef.current = targetWorker; // Cache initial worker state

    // Set simulation state for UI
    setSimulationState({
      isActive: true,
      type: 'heatup',
      targetWorker: 'John Doe',
      currentValues: targetWorker
    });

    // Start simulation interval
    console.log(`   ⏰ Setting interval: ${simulationInterval}ms`);
    intervalRef.current = setInterval(performSimulationStep, simulationInterval);

    console.log('✅ Heat up simulation started for John Doe');
  };

  /**
   * Starts a cool down simulation - SYNCHRONOUS approach
   */
  const startCoolDownSimulation = () => {
    console.log('🧊 STARTING COOL DOWN SIMULATION');
    
    const targetWorker = findTargetWorker();
    if (!targetWorker) {
      console.error('❌ Target worker "John Doe" not found');
      return;
    }

    // Stop any existing simulation
    stopSimulation('Starting new simulation');

    // Store baseline values for reference
    baselineValuesRef.current = {
      temperature: targetWorker.temperature,
      humidity: targetWorker.humidity
    };

    // Reset counters and set refs SYNCHRONOUSLY
    stepCountRef.current = 0;
    errorCountRef.current = 0;
    consecutiveErrorsRef.current = 0;
    simulationTypeRef.current = 'cooldown';
    isActiveRef.current = true;
    currentWorkerValuesRef.current = targetWorker; // Cache initial worker state

    // Set simulation state for UI
    setSimulationState({
      isActive: true,
      type: 'cooldown',
      targetWorker: 'John Doe',
      currentValues: targetWorker
    });

    // Start simulation interval
    intervalRef.current = setInterval(performSimulationStep, simulationInterval);

    console.log('✅ Cool down simulation started for John Doe');
  };

  /**
   * Resets the target worker to baseline values
   */
  const resetToBaseline = () => {
    const targetWorker = findTargetWorker();
    if (!targetWorker) {
      return;
    }

    // Stop any active simulation
    stopSimulation('Resetting to baseline');

    // Generate fresh baseline values for John Doe
    const freshWorker = generateWorkerWithRiskProfile('John Doe', targetWorker.id, 'moderate');
    
    onWorkerUpdate(targetWorker.id, {
      temperature: freshWorker.temperature,
      humidity: freshWorker.humidity,
      riskScore: undefined,
      predictedClass: undefined,
      confidence: undefined
    });

    console.log('John Doe reset to baseline values');
  };

  // Cleanup interval on unmount
  useEffect(() => {
    return () => {
      clearSimulationInterval();
    };
  }, [clearSimulationInterval]);

  return {
    simulationState,
    startHeatUpSimulation,
    startCoolDownSimulation,
    stopSimulation,
    resetToBaseline,
    isSimulationActive: simulationState.isActive,
    simulationType: simulationState.type,
    currentSimulationValues: simulationState.currentValues,
    targetWorkerName: simulationState.targetWorker
  };
}

/**
 * Utility function to get simulation progress as a percentage
 * @param currentTemp - Current temperature
 * @param currentHumidity - Current humidity
 * @param simulationType - Type of simulation
 * @returns Progress percentage (0-100)
 */
export function getSimulationProgress(
  currentTemp: number,
  currentHumidity: number,
  simulationType: 'heatup' | 'cooldown'
): number {
  if (simulationType === 'heatup') {
    const tempProgress = Math.min(100, ((currentTemp - MIN_TEMPERATURE) / (MAX_TEMPERATURE - MIN_TEMPERATURE)) * 100);
    const humidityProgress = Math.min(100, ((currentHumidity - MIN_HUMIDITY) / (MAX_HUMIDITY - MIN_HUMIDITY)) * 100);
    // Use average for smoother progress
    return (tempProgress + humidityProgress) / 2;
  } else {
    const tempProgress = Math.min(100, ((MAX_TEMPERATURE - currentTemp) / (MAX_TEMPERATURE - MIN_TEMPERATURE)) * 100);
    const humidityProgress = Math.min(100, ((MAX_HUMIDITY - currentHumidity) / (MAX_HUMIDITY - MIN_HUMIDITY)) * 100);
    // Use average for smoother progress
    return (tempProgress + humidityProgress) / 2;
  }
}

/**
 * Utility function to format simulation values for display
 * @param values - Partial worker values from simulation
 * @returns Formatted string for display
 */
export function formatSimulationValues(values: Partial<Worker>): string {
  const parts: string[] = [];
  
  if (values.temperature !== undefined) {
    parts.push(`Temperature: ${values.temperature.toFixed(1)}°C`);
  }
  
  if (values.humidity !== undefined) {
    parts.push(`Humidity: ${values.humidity.toFixed(1)}%`);
  }
  
  return parts.join(', ');
}