import { spawn } from 'child_process';
import path from 'path';

export interface PredictionInput {
  Temperature: number;
  Humidity: number;
  hrv_mean_hr?: number;
  hrv_rmssd?: number;
  Gender?: number;
  Age?: number;
  [key: string]: number | undefined;
}

export interface PredictionResult {
  risk_score: number;
  predicted_class: string;
  confidence: number;
  error?: string;
}

export interface HealthCheckResult {
  status: string;
  model_loaded: boolean;
  error?: string;
}

class ModelLoader {
  private pythonScript: string;

  constructor() {
    // Path to the Python prediction script
    this.pythonScript = path.join(process.cwd(), 'predict.py');
  }

  /**
   * Call the Python prediction script via child_process
   */
  private async callPythonScript(inputData?: PredictionInput, healthCheck: boolean = false): Promise<any> {
    return new Promise((resolve, reject) => {
      const args = healthCheck ? ['health'] : [];
      const pythonProcess = spawn('python3', [this.pythonScript, ...args]);

      let outputData = '';
      let errorData = '';

      // Send input data to Python script if not a health check
      if (!healthCheck && inputData) {
        pythonProcess.stdin.write(JSON.stringify(inputData));
        pythonProcess.stdin.end();
      } else if (!healthCheck) {
        pythonProcess.stdin.end();
      }

      // Collect output data
      pythonProcess.stdout.on('data', (data) => {
        outputData += data.toString();
      });

      // Collect error data
      pythonProcess.stderr.on('data', (data) => {
        errorData += data.toString();
      });

      // Handle process completion
      pythonProcess.on('close', (code) => {
        if (code !== 0) {
          reject(new Error(`Python script exited with code ${code}: ${errorData}`));
          return;
        }

        try {
          const result = JSON.parse(outputData.trim());
          resolve(result);
        } catch (parseError) {
          reject(new Error(`Failed to parse Python output: ${outputData}`));
        }
      });

      // Handle process errors
      pythonProcess.on('error', (error) => {
        reject(new Error(`Failed to start Python process: ${error.message}`));
      });

      // Set a timeout for the process
      setTimeout(() => {
        pythonProcess.kill();
        reject(new Error('Python script timed out'));
      }, 30000); // 30 second timeout
    });
  }

  /**
   * Perform health check to ensure the model is loaded and working
   */
  async healthCheck(): Promise<HealthCheckResult> {
    try {
      const result = await this.callPythonScript(undefined, true);
      return result;
    } catch (error) {
      return {
        status: 'error',
        model_loaded: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Make a prediction using the thermal comfort model
   */
  async predict(inputData: PredictionInput): Promise<PredictionResult> {
    try {
      // Validate required inputs
      if (typeof inputData.Temperature !== 'number' || typeof inputData.Humidity !== 'number') {
        throw new Error('Temperature and Humidity are required fields');
      }

      const result = await this.callPythonScript(inputData, false);

      if (result.error) {
        throw new Error(result.error);
      }

      return result;
    } catch (error) {
      return {
        risk_score: 0,
        predicted_class: 'error',
        confidence: 0,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Calculate risk score based on prediction (backup method)
   */
  calculateRiskScore(predictedClass: string, confidence: number): number {
    const classRiskMap: { [key: string]: number } = {
      'neutral': 0.0,
      'slightly warm': 0.33,
      'warm': 0.67,
      'hot': 1.0
    };

    const baseRisk = classRiskMap[predictedClass.toLowerCase()] || 0.5;
    const confidenceAdjustedRisk = baseRisk * confidence;

    // Add baseline risk
    return Math.min(1.0, confidenceAdjustedRisk + 0.1);
  }
}

// Export singleton instance
export const modelLoader = new ModelLoader();
export default modelLoader;