#!/usr/bin/env python3
"""
Restart Backend Server
=====================
Simple script to restart the backend server to load the new model.
"""

import subprocess
import sys
import time
import requests
import os
import signal

def kill_existing_server():
    """Kill any existing backend server processes."""
    print("Stopping existing backend server...")
    
    try:
        # Try to find and kill the process on Windows
        if os.name == 'nt':  # Windows
            subprocess.run(['taskkill', '/f', '/im', 'python.exe'], 
                         capture_output=True, text=True)
        else:  # Unix-like
            subprocess.run(['pkill', '-f', 'main.py'], 
                         capture_output=True, text=True)
    except Exception as e:
        print(f"Note: {e}")
    
    # Wait a moment for processes to terminate
    time.sleep(2)

def start_server():
    """Start the backend server."""
    print("Starting backend server with new model...")
    
    try:
        # Start the server in the background
        process = subprocess.Popen([sys.executable, 'main.py'], 
                                 stdout=subprocess.PIPE, 
                                 stderr=subprocess.PIPE)
        
        # Wait a moment for server to start
        time.sleep(3)
        
        # Check if server is running
        try:
            response = requests.get(' BACKEND_URL/docs', timeout=5)
            if response.status_code == 200:
                print("✅ Backend server started successfully!")
                return process
            else:
                print(f"❌ Server responded with status {response.status_code}")
                return None
        except requests.exceptions.RequestException as e:
            print(f"❌ Server not responding: {e}")
            return None
            
    except Exception as e:
        print(f"❌ Failed to start server: {e}")
        return None

def test_prediction():
    """Test that the new model works correctly."""
    print("Testing prediction with new model...")
    
    test_data = {
        "Gender": 1,
        "Age": 35,
        "mean_nni": 800,
        "median_nni": 790,
        "range_nni": 400,
        "sdsd": 45,
        "rmssd": 50,
        "nni_50": 100,
        "pnni_50": 25,
        "nni_20": 150,
        "pnni_20": 40,
        "cvsd": 0.06,
        "sdnn": 60,
        "cvnni": 0.07,
        "mean_hr": 75,
        "min_hr": 60,
        "max_hr": 95,
        "std_hr": 12,
        "total_power": 2500,
        "vlf": 200,
        "lf": 800,
        "hf": 400,
        "lf_hf_ratio": 2.0,
        "lfnu": 60,
        "hfnu": 40,
        "SD1": 35,
        "SD2": 85,
        "SD2SD1": 2.4,
        "CSI": 4,
        "CVI": 5,
        "CSI_Modified": 6,
        "mean": 800,
        "std": 60,
        "min": 600,
        "max": 1000,
        "ptp": 400,
        "sum": 80000,
        "energy": 10000000,
        "skewness": 0.5,
        "kurtosis": 3,
        "peaks": 25,
        "rms": 800,
        "lineintegral": 50000,
        "n_above_mean": 50,
        "n_below_mean": 50,
        "n_sign_changes": 45,
        "iqr": 150,
        "iqr_5_95": 400,
        "pct_5": 700,
        "pct_95": 1100,
        "entropy": 1.2,
        "perm_entropy": 0.6,
        "svd_entropy": 0.4,
        "Temperature": 25,
        "Humidity": 50
    }
    
    try:
        response = requests.post(' BACKEND_URL/predict', 
                               json=test_data, 
                               timeout=10)
        
        if response.status_code == 200:
            result = response.json()
            if 'error' in result:
                print(f"❌ Prediction failed: {result['error']}")
                return False
            else:
                print(f"✅ Prediction successful!")
                print(f"   Risk Score: {result.get('risk_score', 'N/A')}")
                print(f"   Predicted Class: {result.get('predicted_class', 'N/A')}")
                print(f"   Confidence: {result.get('confidence', 'N/A')}")
                return True
        else:
            print(f"❌ Prediction request failed with status {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Prediction test failed: {e}")
        return False

def main():
    """Main restart process."""
    print("=== Backend Server Restart ===")
    
    # Kill existing server
    kill_existing_server()
    
    # Start new server
    process = start_server()
    
    if process:
        # Test the new model
        if test_prediction():
            print("\n🎉 Backend restart successful! New model is working.")
            print("You can now test the frontend simulation.")
            
            # Keep the server running
            try:
                print("\nServer is running. Press Ctrl+C to stop.")
                process.wait()
            except KeyboardInterrupt:
                print("\nShutting down server...")
                process.terminate()
                
        else:
            print("\n❌ New model test failed. Stopping server.")
            process.terminate()
    else:
        print("\n❌ Failed to start server.")

if __name__ == "__main__":
    main()