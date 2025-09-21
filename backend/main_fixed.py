from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import os

# Global variables for model components
model = None
scaler = None
label_encoder = None
feature_columns = None

app = FastAPI()

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

def load_model_components():
    """Load the retrained model components."""
    global model, scaler, label_encoder, feature_columns
    
    model_dir = "thermal_comfort_model"
    
    try:
        print("Loading retrained model components...")
        
        # Load all components
        model = joblib.load(os.path.join(model_dir, "xgboost_model.joblib"))
        scaler = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        label_encoder = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))
        feature_columns = joblib.load(os.path.join(model_dir, "feature_columns.joblib"))
        
        print(f"✅ Model loaded successfully!")
        print(f"   Features: {len(feature_columns)}")
        print(f"   Classes: {list(label_encoder.classes_)}")
        
        # Test the model to make sure it works
        test_data = {col: 0.5 for col in feature_columns}
        test_data['Gender'] = 1
        test_data['Age'] = 30
        test_data['Temperature'] = 25
        test_data['Humidity'] = 50
        
        test_df = pd.DataFrame([test_data])
        test_scaled = scaler.transform(test_df)
        prediction = model.predict(test_scaled)[0]
        probabilities = model.predict_proba(test_scaled)[0]
        
        print(f"✅ Model test successful!")
        
    except Exception as e:
        print(f"❌ Error loading model: {e}")
        raise

def calculate_risk_score(prediction, probabilities):
    """Calculate risk score based on thermal comfort prediction."""
    class_names = label_encoder.classes_
    
    # Map thermal comfort classes to risk scores
    class_to_score = {
        'neutral': 0.0,
        'slightly warm': 0.33,
        'warm': 0.67,
        'hot': 1.0
    }
    
    # Calculate weighted risk score
    weighted_score = 0.0
    for i, prob in enumerate(probabilities):
        class_name = class_names[i]
        score = class_to_score.get(class_name, 0.5)  # Default to moderate risk
        weighted_score += prob * score
    
    # Add small baseline risk
    return min(1.0, weighted_score + 0.1)

@app.on_event("startup")
async def startup_event():
    load_model_components()

@app.get("/")
async def root():
    return {"message": "Thermal Comfort Prediction API", "status": "running"}

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(data: dict):
    try:
        if model is None:
            return {"error": "Model not loaded"}
        
        # Ensure all required features are present
        for feature in feature_columns:
            if feature not in data:
                data[feature] = 0.0
        
        # Prepare features dataframe
        features_df = pd.DataFrame([data])[feature_columns]
        
        # Scale features
        features_scaled = scaler.transform(features_df)
        
        # Make predictions
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        # Calculate risk score
        risk_score = calculate_risk_score(prediction, probabilities)
        
        # Get predicted class name
        predicted_class = label_encoder.classes_[prediction]
        
        # Get confidence (max probability)
        confidence = float(probabilities.max())
        
        return {
            "risk_score": round(risk_score, 4),
            "predicted_class": predicted_class,
            "confidence": round(confidence, 3)
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Thermal Comfort Prediction API...")
    uvicorn.run(app, host="0.0.0.0", port=8000)