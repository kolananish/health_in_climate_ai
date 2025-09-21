# Simulation Engine Usage Guide

The simulation engine provides React hooks and utilities for managing worker health simulations in the Worker Health Dashboard.

## Core Features

### useSimulation Hook

The main hook for managing simulation state and operations:

```typescript
import { useSimulation } from '@/lib/simulation';

function DashboardComponent() {
  const [workers, setWorkers] = useState<Worker[]>([]);
  
  const handleWorkerUpdate = (workerId: string, updates: Partial<Worker>) => {
    setWorkers(prev => prev.map(worker => 
      worker.id === workerId ? { ...worker, ...updates } : worker
    ));
  };

  const simulation = useSimulation(workers, handleWorkerUpdate);

  return (
    <div>
      <button onClick={simulation.startHeatUpSimulation}>
        Start Heat Up
      </button>
      <button onClick={simulation.startCoolDownSimulation}>
        Start Cool Down
      </button>
      <button onClick={simulation.stopSimulation}>
        Stop
      </button>
      
      {simulation.isSimulationActive && (
        <div>
          Simulation Type: {simulation.simulationType}
          Current Values: {formatSimulationValues(simulation.currentSimulationValues)}
        </div>
      )}
    </div>
  );
}
```

### Simulation Configuration

- **Interval**: 2 seconds between updates
- **Temperature Range**: 18°C - 40°C
- **Humidity Range**: 30% - 95%
- **Target Worker**: Always "John Doe"
- **Max Steps**: 50 steps to prevent infinite loops

### Heat Up Algorithm

Gradually increases environmental stress:
- Temperature: +0.5°C per step
- Humidity: +2% per step
- Continues until maximum values or step limit reached

### Cool Down Algorithm

Gradually decreases environmental stress:
- Temperature: -0.5°C per step  
- Humidity: -2% per step
- Continues until minimum values or step limit reached

### Utility Functions

#### getSimulationProgress
```typescript
const progress = getSimulationProgress(currentTemp, currentHumidity, 'heatup');
// Returns 0-100 percentage of simulation completion
```

#### formatSimulationValues
```typescript
const display = formatSimulationValues({ temperature: 25.5, humidity: 65.2 });
// Returns: "Temperature: 25.5°C, Humidity: 65.2%"
```

## Integration with Backend

The simulation engine automatically:
1. Calls the ML backend API every 2 seconds during simulation
2. Updates worker risk scores based on API responses
3. Handles API errors gracefully without stopping simulation
4. Applies exponential backoff for failed requests

## Error Handling

- Network errors: Logged but simulation continues
- API timeouts: Automatic retry with backoff
- Missing target worker: Simulation stops gracefully
- Step limit exceeded: Automatic simulation stop

## Testing

The simulation engine includes comprehensive tests:
- Unit tests for utility functions
- Integration tests for module imports
- React component compatibility tests
- Mock API integration tests