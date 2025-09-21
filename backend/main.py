from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import pandas as pd
import numpy as np
import joblib
import os
from model_loader import load_all_components

# Global variables for model components
model = None
scaler = None
label_encoder = None
feature_columns = None

app = FastAPI()

# Add CORS middleware to allow frontend connections
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],  # Frontend URLs
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


def load_model_components():
    global model, scaler, label_encoder, feature_columns
    components = load_all_components("thermal_comfort_model")
    model = components['model']
    scaler = components['scaler']
    label_encoder = components['label_encoder']
    feature_columns = components['feature_columns']

def calculate_risk_score(prediction, probabilities):
    class_names = label_encoder.classes_
    class_to_score = {}
    for class_name in class_names:
        if 'neutral' in class_name.lower():
            class_to_score[class_name] = 0.0
        elif 'slightly' in class_name.lower() and 'warm' in class_name.lower():
            class_to_score[class_name] = 0.33
        elif 'warm' in class_name.lower() and 'slightly' not in class_name.lower():
            class_to_score[class_name] = 0.67
        elif 'hot' in class_name.lower():
            class_to_score[class_name] = 1.0
        else:
            class_idx = list(class_names).index(class_name)
            class_to_score[class_name] = class_idx / (len(class_names) - 1) if len(class_names) > 1 else 0.0
    
    weighted_score = sum(prob * class_to_score[class_names[j]] for j, prob in enumerate(probabilities))
    return min(1.0, weighted_score + 0.15)


@app.on_event("startup")
async def startup_event():
    load_model_components()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "model_loaded": model is not None}

@app.post("/predict")
async def predict(data: dict):
    from fastapi import HTTPException
    
    try:
        # Check if model components are loaded
        if model is None or scaler is None or label_encoder is None or feature_columns is None:
            raise HTTPException(status_code=503, detail="Model components not loaded")
        
        # Debug: Print key values being received
        print(f"\n🔍 BACKEND RECEIVED:")
        print(f"   Temperature: {data.get('Temperature', 'MISSING')}")
        print(f"   Humidity: {data.get('Humidity', 'MISSING')}")
        print(f"   HR Mean: {data.get('hrv_mean_hr', 'MISSING')}")
        print(f"   HRV RMSSD: {data.get('hrv_rmssd', 'MISSING')}")
        print(f"   Gender: {data.get('Gender', 'MISSING')}")
        print(f"   Age: {data.get('Age', 'MISSING')}")
        
        # Fill missing features with 0
        for feature in feature_columns:
            if feature not in data:
                data[feature] = 0.0
        
        # Prepare and predict
        features_df = pd.DataFrame([data])[feature_columns]
        features_scaled = scaler.transform(features_df)
        
        # Make predictions with error handling
        prediction = model.predict(features_scaled)[0]
        probabilities = model.predict_proba(features_scaled)[0]
        
        # Calculate risk
        risk_score = calculate_risk_score(prediction, probabilities)
        
        # Debug: Print prediction results
        print(f"   🎯 PREDICTION RESULT:")
        print(f"      Raw prediction: {prediction}")
        print(f"      Predicted class: {label_encoder.classes_[prediction]}")
        print(f"      Risk score: {risk_score}")
        print(f"      Confidence: {float(probabilities.max())}")
        
        return {
            "risk_score": round(risk_score, 4),
            "predicted_class": label_encoder.classes_[prediction],
            "confidence": round(float(probabilities.max()), 3)
        }
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction failed: {str(e)}")


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)