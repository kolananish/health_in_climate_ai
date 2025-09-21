'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Worker } from '@/types';
import { generateMockWorkers } from '@/lib/utils';
import { useSimulation } from '@/lib/simulation';
import { checkAPIHealth, predictMultipleWorkers } from '@/lib/api';
import { categorizeError, getErrorToastConfig, logError } from '@/lib/errorHandling';
import { useToast, ToastContainer } from '@/app/components/Toast';
import WorkerTable from '@/app/components/WorkerTable';
import SimulationControls from '@/app/components/SimulationControls';
import DataViewModal from '@/app/components/DataViewModal';
import LoadingSpinner from '@/app/components/LoadingSpinner';
import { ConnectionIndicator } from '@/app/components/ConnectionStatus';

export default function Dashboard() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDataViewOpen, setIsDataViewOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState<'online' | 'offline' | 'checking'>('checking');
  const [error, setError] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const [connectionAttempts, setConnectionAttempts] = useState(0);
  const [simulationError, setSimulationError] = useState<string | null>(null);
  const [simulationSpeed, setSimulationSpeed] = useState<number>(600); // Default 600ms for smooth updates
  
  // Toast notifications
  const { toasts, addToast, removeToast, showError, showWarning, showSuccess, showInfo } = useToast();

  // Enhanced error handler for dashboard operations
  const handleDashboardError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorInfo = categorizeError(error, context);
    logError(errorInfo, context);
    
    const toastConfig = getErrorToastConfig(errorInfo);
    addToast(toastConfig);
  }, [addToast]);

  // Initialize workers and check API health on component mount
  useEffect(() => {
    const initializeDashboard = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        // Check API health first
        setApiStatus('checking');
        showInfo('Initializing Dashboard', 'Checking backend connection...', 3000);
        
        const isApiHealthy = await checkAPIHealth();
        setApiStatus(isApiHealthy ? 'online' : 'offline');
        
        if (isApiHealthy) {
          showSuccess('Backend Connected', 'Successfully connected to ML backend service', 4000);
        } else {
          showWarning('Backend Offline', 'Using mock data - risk scores will not update during simulations', 6000);
        }
        
        // Generate initial mock workers (includes John Doe)
        const initialWorkers = generateMockWorkers(10);
        console.log('🏭 GENERATED WORKERS:', initialWorkers.map(w => `${w.name} (${w.id})`));
        const johnDoe = initialWorkers.find(w => w.name === 'John Doe');
        console.log('👤 JOHN DOE:', johnDoe ? `Found: ${johnDoe.name} (${johnDoe.id})` : 'NOT FOUND');
        setWorkers(initialWorkers);
        
        // If API is healthy, get initial risk predictions for all workers
        if (isApiHealthy) {
          try {
            showInfo('Loading Risk Assessments', 'Getting initial ML predictions for all workers...', 3000);
            const predictions = await predictMultipleWorkers(initialWorkers);
            
            // Count successful predictions
            const successfulPredictions = predictions.filter(p => p.result).length;
            const failedPredictions = predictions.filter(p => p.error).length;
            
            // Update workers with initial risk predictions
            const updatedWorkers = initialWorkers.map(worker => {
              const prediction = predictions.find(p => p.worker.id === worker.id);
              if (prediction?.result) {
                return {
                  ...worker,
                  riskScore: prediction.result.risk_score,
                  predictedClass: prediction.result.predicted_class,
                  confidence: prediction.result.confidence
                };
              }
              return worker;
            });
            
            setWorkers(updatedWorkers);
            
            if (successfulPredictions > 0) {
              showSuccess('Risk Assessments Loaded', `Successfully loaded ${successfulPredictions} worker risk assessments`, 4000);
            }
            
            if (failedPredictions > 0) {
              showWarning('Partial Load', `${failedPredictions} risk assessments failed to load`, 5000);
            }
            
          } catch (apiError) {
            handleDashboardError(apiError as Error, { 
              operation: 'initial_predictions',
              workerCount: initialWorkers.length 
            });
          }
        }
        
      } catch (initError) {
        const errorInfo = categorizeError(initError as Error, { operation: 'dashboard_initialization' });
        logError(errorInfo);
        setError('Failed to initialize dashboard. Please refresh the page.');
        showError('Initialization Failed', 'Dashboard failed to load. Please refresh the page.', 8000);
      } finally {
        setIsLoading(false);
        setIsInitializing(false);
      }
    };

    initializeDashboard();
  }, [handleDashboardError, showError, showInfo, showSuccess, showWarning]); // Dependencies for functions used inside useEffect

  // Handle worker updates from simulation with error handling
  const handleWorkerUpdate = useCallback((workerId: string, updates: Partial<Worker>) => {
    console.log(`🔄 UPDATING WORKER: ID=${workerId}`);
    console.log(`   Updates:`, updates);
    
    setWorkers(prev => {
      const targetWorker = prev.find(w => w.id === workerId);
      console.log(`   Found worker: ${targetWorker?.name} (ID: ${targetWorker?.id})`);
      
      const updatedWorkers = prev.map(worker => 
        worker.id === workerId ? { ...worker, ...updates } : worker
      );
      
      const updatedWorker = updatedWorkers.find(w => w.id === workerId);
      console.log(`   After update: temp=${updatedWorker?.temperature}, risk=${updatedWorker?.riskScore}`);
      
      return updatedWorkers;
    });
  }, []);



  // Retry API connection with enhanced error handling
  const retryApiConnection = useCallback(async () => {
    setApiStatus('checking');
    setConnectionAttempts(prev => prev + 1);
    
    showInfo('Reconnecting', 'Attempting to reconnect to backend...', 3000);
    
    try {
      const isHealthy = await checkAPIHealth();
      setApiStatus(isHealthy ? 'online' : 'offline');
      
      if (isHealthy) {
        setError(null);
        showSuccess('Connection Restored', 'Successfully reconnected to backend service', 4000);
        
        // Refresh risk predictions for all workers
        try {
          showInfo('Refreshing Data', 'Updating risk assessments...', 3000);
          const predictions = await predictMultipleWorkers(workers);
          
          const successfulPredictions = predictions.filter(p => p.result).length;
          const failedPredictions = predictions.filter(p => p.error).length;
          
          const updatedWorkers = workers.map(worker => {
            const prediction = predictions.find(p => p.worker.id === worker.id);
            if (prediction?.result) {
              return {
                ...worker,
                riskScore: prediction.result.risk_score,
                predictedClass: prediction.result.predicted_class,
                confidence: prediction.result.confidence
              };
            }
            return worker;
          });
          
          setWorkers(updatedWorkers);
          
          if (successfulPredictions > 0) {
            showSuccess('Data Refreshed', `Updated ${successfulPredictions} worker risk assessments`, 4000);
          }
          
          if (failedPredictions > 0) {
            showWarning('Partial Refresh', `${failedPredictions} assessments failed to update`, 5000);
          }
          
        } catch (predictionError) {
          const errorInfo = categorizeError(predictionError as Error, { 
            operation: 'retry_predictions',
            attempt: connectionAttempts 
          });
          logError(errorInfo);
          const toastConfig = getErrorToastConfig(errorInfo);
          addToast(toastConfig);
        }
      } else {
        showError('Connection Failed', 'Unable to connect to backend. Please check if the service is running.', 6000);
      }
    } catch (healthError) {
      const errorInfo = categorizeError(healthError as Error, { 
        operation: 'health_check_retry',
        attempt: connectionAttempts 
      });
      logError(errorInfo);
      const toastConfig = getErrorToastConfig(errorInfo);
      addToast(toastConfig);
      setApiStatus('offline');
    }
  }, [workers, connectionAttempts, showInfo, showSuccess, showError, showWarning, addToast]);

  // Enhanced simulation error handler
  const handleSimulationError = useCallback((error: Error, context?: Record<string, unknown>) => {
    const errorInfo = categorizeError(error, { ...context, source: 'simulation' });
    logError(errorInfo, context);
    
    const toastConfig = getErrorToastConfig(errorInfo);
    addToast(toastConfig);
    
    // Set simulation error state for display in controls
    const consecutiveErrors = typeof context?.consecutiveErrors === 'number' ? context.consecutiveErrors : 0;
    const errorCount = typeof context?.errorCount === 'number' ? context.errorCount : 0;
    
    if (consecutiveErrors >= 3) {
      setSimulationError('Too many consecutive errors. Please check backend connection and try again.');
      showError('Simulation Stopped', 'Too many consecutive errors. Please check backend connection and try again.', 8000);
    } else if (errorCount >= 10) {
      setSimulationError('Too many errors occurred. Please restart the simulation.');
      showError('Simulation Stopped', 'Too many errors occurred. Please restart the simulation.', 8000);
    } else {
      setSimulationError(`Simulation error: ${error.message}`);
    }
    
    // Clear simulation error after 10 seconds
    setTimeout(() => setSimulationError(null), 10000);
  }, [addToast, showError]);

  // Use simulation hook with enhanced error handling and configurable speed
  console.log('🎯 PAGE: useSimulation hook called with workers:', workers.length);
  const {
    simulationState,
    startHeatUpSimulation,
    startCoolDownSimulation,
    stopSimulation
  } = useSimulation(workers, handleWorkerUpdate, handleSimulationError, simulationSpeed);
  
  console.log('🎯 PAGE: Simulation state:', simulationState);

  // Handle simulation speed change
  const handleSpeedChange = useCallback((newSpeed: number) => {
    setSimulationSpeed(newSpeed);
    showInfo('Speed Updated', `Simulation speed set to ${newSpeed === 500 ? 'Very Fast' : newSpeed === 1000 ? 'Fast' : newSpeed === 2000 ? 'Normal' : newSpeed === 4000 ? 'Slow' : 'Very Slow'}`, 2000);
  }, [showInfo]);

  // Open data view modal
  const handleViewData = () => {
    setIsDataViewOpen(true);
  };

  // Close data view modal
  const handleCloseDataView = () => {
    setIsDataViewOpen(false);
  };

  // Show loading state during initialization
  if (isLoading || isInitializing) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <LoadingSpinner size="lg" text="Initializing Worker Health Dashboard..." />
          <div className="mt-4 text-sm text-muted">
            {apiStatus === 'checking' && 'Checking backend connection...'}
            {apiStatus === 'offline' && 'Backend offline - using mock data'}
            {apiStatus === 'online' && 'Loading initial risk assessments...'}
          </div>
        </div>
      </div>
    );
  }

  // Show error state if initialization failed
  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-red-500 text-6xl mb-4">⚠️</div>
          <h1 className="text-xl font-semibold text-foreground mb-2">Dashboard Error</h1>
          <p className="text-muted mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="btn-primary"
          >
            Refresh Page
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onClose={removeToast} />
      
      {/* Header */}
      <header className="bg-card border-b border-border shadow-sm">
        <div className="container-responsive py-4 sm:py-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="min-w-0 flex-1">
              <h1 className="text-headline text-foreground">
                Worker Health Dashboard
              </h1>
              <p className="text-caption mt-1">
                Real-time health monitoring with ML-powered risk assessment
              </p>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              {/* Enhanced Connection Status Indicator */}
              <ConnectionIndicator
                status={apiStatus}
                connectionAttempts={connectionAttempts}
                onRetry={retryApiConnection}
              />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container-responsive py-6 sm:py-8">
        <div className="space-y-6 sm:space-y-8">
          {/* Simulation Controls */}
          <div className="card-elevated">
            <SimulationControls
              simulationState={simulationState}
              onStartHeatUp={startHeatUpSimulation}
              onStartCoolDown={startCoolDownSimulation}
              onStop={stopSimulation}
              onViewData={handleViewData}
              apiStatus={apiStatus}
              simulationError={simulationError}
              simulationSpeed={simulationSpeed}
              onSpeedChange={handleSpeedChange}
            />
          </div>

          {/* Worker Table */}
          <div className="card-elevated">
            <div className="mb-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h2 className="text-title text-foreground">
                    Worker Health Status
                  </h2>
                  <p className="text-caption mt-1">
                    Monitoring {workers.length} workers with {apiStatus === 'online' ? 'real-time ML' : 'mock'} risk assessment
                  </p>
                </div>
                
                {/* Data source indicator */}
                <div className="flex-shrink-0">
                  {apiStatus === 'online' ? (
                    <div className="status-indicator status-info">
                      <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                      <span className="hidden sm:inline">Live ML Predictions</span>
                      <span className="sm:hidden">Live ML</span>
                    </div>
                  ) : (
                    <div className="status-indicator status-warning">
                      <span className="w-2 h-2 bg-gray-400 rounded-full"></span>
                      <span className="hidden sm:inline">Mock Data</span>
                      <span className="sm:hidden">Mock</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
            
            {/* Show offline warning with enhanced messaging */}
            {apiStatus === 'offline' && (
              <div className="alert alert-warning mb-6">
                <div className="flex items-start gap-3">
                  <span className="text-lg flex-shrink-0">⚠️</span>
                  <div className="flex-1">
                    <div className="font-medium text-sm">Backend API Offline</div>
                    <div className="text-sm mt-1">
                      Displaying mock data. Risk scores will not update during simulations.
                    </div>
                    <div className="text-xs mt-2 opacity-75">
                      Troubleshooting: Ensure the backend server is running on localhost:8000
                      {connectionAttempts > 0 && ` (${connectionAttempts} connection attempts)`}
                    </div>
                  </div>
                  <button
                    onClick={retryApiConnection}
                    className="btn-secondary text-xs px-2 py-1 flex-shrink-0"
                  >
                    Retry Now
                  </button>
                </div>
              </div>
            )}
            
            <WorkerTable 
              workers={workers} 
              loading={false} 
              simulationActive={simulationState.isActive}
              simulationTarget={simulationState.targetWorker}
            />
          </div>
        </div>
      </main>

      {/* Data View Modal */}
      <DataViewModal
        isOpen={isDataViewOpen}
        onClose={handleCloseDataView}
        currentValues={simulationState.currentValues}
        targetWorkerName={simulationState.targetWorker}
      />
    </div>
  );
}
