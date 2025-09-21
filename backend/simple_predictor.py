"""
Simplified Thermal Comfort Predictor
===================================
Core XGBoost model querying functionality only.
"""

import pandas as pd
import joblib
import os


class SimpleThermalPredictor:
    """Minimal thermal comfort predictor - just the core XGBoost querying."""
    
    def __init__(self, model_dir="thermal_comfort_model"):
        """Load the trained XGBoost model and components."""
        self.model = joblib.load(os.path.join(model_dir, "xgboost_model.joblib"))
        self.scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        self.label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))
        self.feature_columns = joblib.load(os.path.join(model_dir, "feature_columns.joblib"))
    
    def predict(self, features_dict):
        """
        Predict thermal comfort from input features.
        
        Args:
            features_dict: Dictionary with feature names as keys and values
            
        Returns:
            dict: Prediction results
        """
        # Prepare features
        features_df = pd.DataFrame([features_dict])
        features_df = features_df[self.feature_columns]
        features_df = features_df.fillna(features_df.mean())
        
        # Scale and predict
        features_scaled = self.scaler.transform(features_df)
        prediction = self.model.predict(features_scaled)[0]
        probabilities = self.model.predict_proba(features_scaled)[0]
        
        # Return results
        return {
            'predicted_class': self.label_encoder.classes_[prediction],
            'confidence': float(probabilities.max()),
            'probabilities': {
                class_name: float(prob) 
                for class_name, prob in zip(self.label_encoder.classes_, probabilities)
            }
        }


def main():
    """Simple test of the predictor."""
    predictor = SimpleThermalPredictor()
    
    # Example prediction
    test_features = {
        'Gender': 1, 'Age': 30, 'Temperature': 28.5, 'Humidity': 65,
        'hrv_mean_hr': 75, 'hrv_mean_nni': 800
    }
    
    # Fill missing features with defaults
    for feature in predictor.feature_columns:
        if feature not in test_features:
            test_features[feature] = 0.0
    
    result = predictor.predict(test_features)
    print(f"Prediction: {result['predicted_class']}")
    print(f"Confidence: {result['confidence']:.3f}")


if __name__ == "__main__":
    main()