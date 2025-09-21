#!/usr/bin/env python3
"""
Retrain XGBoost Model for Thermal Comfort Prediction
===================================================
This script retrains the model using current XGBoost best practices
without deprecated parameters like use_label_encoder.
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.metrics import classification_report, accuracy_score
import xgboost as xgb
import joblib
import os
import warnings

# Suppress warnings
warnings.filterwarnings('ignore')

def load_and_prepare_data():
    """Load and prepare the training data."""
    print("Loading training data...")
    
    # Load the dataset
    df = pd.read_csv('Train2021.csv')
    print(f"Loaded {len(df)} samples")
    
    # Define the feature columns (55 features as expected by frontend)
    feature_columns = [
        'Gender', 'Age',
        # HRV Time Domain (13 fields)
        'hrv_mean_nni', 'hrv_median_nni', 'hrv_range_nni', 'hrv_sdsd', 'hrv_rmssd',
        'hrv_nni_50', 'hrv_pnni_50', 'hrv_nni_20', 'hrv_pnni_20', 'hrv_cvsd',
        'hrv_sdnn', 'hrv_cvnni',
        # HRV Frequency Domain (11 fields) 
        'hrv_mean_hr', 'hrv_min_hr', 'hrv_max_hr', 'hrv_std_hr', 'hrv_total_power',
        'hrv_vlf', 'hrv_lf', 'hrv_hf', 'hrv_lf_hf_ratio', 'hrv_lfnu', 'hrv_hfnu',
        # HRV Geometric (6 fields)
        'hrv_SD1', 'hrv_SD2', 'hrv_SD2SD1', 'hrv_CSI', 'hrv_CVI', 'hrv_CSI_Modified',
        # HRV Statistical (21 fields)
        'hrv_mean', 'hrv_std', 'hrv_min', 'hrv_max', 'hrv_ptp', 'hrv_sum',
        'hrv_energy', 'hrv_skewness', 'hrv_kurtosis', 'hrv_peaks', 'hrv_rms',
        'hrv_lineintegral', 'hrv_n_above_mean', 'hrv_n_below_mean', 'hrv_n_sign_changes',
        'hrv_iqr', 'hrv_iqr_5_95', 'hrv_pct_5', 'hrv_pct_95', 'hrv_entropy',
        'hrv_perm_entropy', 'hrv_svd_entropy',
        # Environmental (2 fields)
        'Temperature', 'Humidity'
    ]
    
    # Map gender to numeric (if not already)
    if 'Gender' in df.columns:
        df['Gender'] = df['Gender'].map({'M': 1, 'F': 0}).fillna(df['Gender'])
    
    # Use 'Thermal sensation' as the target variable
    target_column = 'Thermal sensation'
    
    # Check which features are available in the dataset
    available_features = [col for col in feature_columns if col in df.columns]
    missing_features = [col for col in feature_columns if col not in df.columns]
    
    print(f"Available features: {len(available_features)}")
    print(f"Missing features: {len(missing_features)}")
    if missing_features:
        print(f"Missing: {missing_features}")
    
    # Prepare features and target
    X = df[available_features].copy()
    y = df[target_column].copy()
    
    # Handle missing values
    X = X.fillna(X.mean())
    
    # Remove any rows with missing target values
    mask = y.notna()
    X = X[mask]
    y = y[mask]
    
    print(f"Final dataset: {len(X)} samples, {len(X.columns)} features")
    print(f"Target distribution:\n{y.value_counts()}")
    
    return X, y, available_features

def train_model(X, y, feature_columns):
    """Train the XGBoost model with current best practices."""
    print("\nTraining XGBoost model...")
    
    # Split the data
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    
    # Scale the features
    scaler = StandardScaler()
    X_train_scaled = scaler.fit_transform(X_train)
    X_test_scaled = scaler.transform(X_test)
    
    # Encode the labels
    label_encoder = LabelEncoder()
    y_train_encoded = label_encoder.fit_transform(y_train)
    y_test_encoded = label_encoder.transform(y_test)
    
    # Train XGBoost model with current best practices
    # Note: We explicitly avoid use_label_encoder parameter
    model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        eval_metric='mlogloss',
        # Explicitly set enable_categorical=False to avoid issues
        enable_categorical=False
    )
    
    # Fit the model
    model.fit(
        X_train_scaled, 
        y_train_encoded,
        eval_set=[(X_test_scaled, y_test_encoded)],
        verbose=False
    )
    
    # Make predictions
    y_pred = model.predict(X_test_scaled)
    y_pred_labels = label_encoder.inverse_transform(y_pred)
    
    # Evaluate the model
    accuracy = accuracy_score(y_test, y_pred_labels)
    print(f"\nModel Accuracy: {accuracy:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred_labels))
    
    return model, scaler, label_encoder, feature_columns

def save_model_components(model, scaler, label_encoder, feature_columns, output_dir="thermal_comfort_model"):
    """Save all model components."""
    print(f"\nSaving model components to {output_dir}/...")
    
    # Create output directory
    os.makedirs(output_dir, exist_ok=True)
    
    # Save each component
    joblib.dump(model, os.path.join(output_dir, "xgboost_model.joblib"))
    joblib.dump(scaler, os.path.join(output_dir, "scaler.joblib"))
    joblib.dump(label_encoder, os.path.join(output_dir, "label_encoder.joblib"))
    joblib.dump(feature_columns, os.path.join(output_dir, "feature_columns.joblib"))
    
    print("Model components saved successfully!")
    
    # Print model info
    print(f"\nModel Info:")
    print(f"- XGBoost version: {xgb.__version__}")
    print(f"- Number of features: {len(feature_columns)}")
    print(f"- Number of classes: {len(label_encoder.classes_)}")
    print(f"- Classes: {list(label_encoder.classes_)}")

def test_model_loading(model_dir="thermal_comfort_model"):
    """Test that the saved model can be loaded and used."""
    print(f"\nTesting model loading from {model_dir}/...")
    
    try:
        # Load components
        model = joblib.load(os.path.join(model_dir, "xgboost_model.joblib"))
        scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))
        feature_columns = joblib.load(os.path.join(model_dir, "feature_columns.joblib"))
        
        # Create test data
        test_data = {col: 0.5 for col in feature_columns}
        test_data['Gender'] = 1
        test_data['Age'] = 30
        test_data['Temperature'] = 25
        test_data['Humidity'] = 50
        
        # Make prediction
        test_df = pd.DataFrame([test_data])
        test_scaled = scaler.transform(test_df)
        prediction = model.predict(test_scaled)[0]
        probabilities = model.predict_proba(test_scaled)[0]
        
        predicted_class = label_encoder.classes_[prediction]
        confidence = probabilities.max()
        
        print("✅ Model loading test successful!")
        print(f"Test prediction: {predicted_class} (confidence: {confidence:.3f})")
        
        return True
        
    except Exception as e:
        print(f"❌ Model loading test failed: {e}")
        return False

def main():
    """Main training pipeline."""
    print("=== XGBoost Model Retraining ===")
    print(f"XGBoost version: {xgb.__version__}")
    
    try:
        # Load and prepare data
        X, y, feature_columns = load_and_prepare_data()
        
        # Train model
        model, scaler, label_encoder, feature_columns = train_model(X, y, feature_columns)
        
        # Save model components
        save_model_components(model, scaler, label_encoder, feature_columns)
        
        # Test model loading
        if test_model_loading():
            print("\n🎉 Model retraining completed successfully!")
            print("The new model should work without XGBoost compatibility issues.")
        else:
            print("\n⚠️ Model retraining completed but loading test failed.")
            
    except Exception as e:
        print(f"\n❌ Error during model retraining: {e}")
        raise

if __name__ == "__main__":
    main()