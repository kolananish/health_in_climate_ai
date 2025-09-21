from fastapi import FastAPI
import random
import math

app = FastAPI()

@app.get("/health")
async def health_check():
    return {"status": "healthy", "message": "Mock ML backend is running"}

@app.post("/predict")
async def predict(data: dict):
    """
    Mock prediction endpoint that simulates ML model behavior
    Returns realistic risk scores based on temperature and humidity
    """
    try:
        # Extract key features
        temperature = data.get('temperature', 25.0)
        humidity = data.get('humidity', 50.0)
        age = data.get('age', 30)
        
        # Calculate risk score based on environmental factors
        # Higher temperature and humidity = higher risk
        temp_risk = max(0, (temperature - 20) / 15)  # Risk increases above 20°C
        humidity_risk = max(0, (humidity - 40) / 50)  # Risk increases above 40%
        age_risk = max(0, (age - 25) / 40)  # Slight age factor
        
        # Combine factors with some randomness
        base_risk = (temp_risk * 0.5 + humidity_risk * 0.3 + age_risk * 0.2)
        noise = random.uniform(-0.1, 0.1)  # Add some realistic variation
        risk_score = max(0.0, min(1.0, base_risk + noise))
        
        # Determine class based on risk score
        if risk_score < 0.2:
            predicted_class = "neutral"
            confidence = 0.85 + random.uniform(0, 0.1)
        elif risk_score < 0.4:
            predicted_class = "slightly_warm"
            confidence = 0.75 + random.uniform(0, 0.15)
        elif risk_score < 0.6:
            predicted_class = "warm"
            confidence = 0.70 + random.uniform(0, 0.2)
        elif risk_score < 0.8:
            predicted_class = "hot"
            confidence = 0.75 + random.uniform(0, 0.15)
        else:
            predicted_class = "very_hot"
            confidence = 0.80 + random.uniform(0, 0.15)
        
        return {
            "risk_score": round(risk_score, 4),
            "predicted_class": predicted_class,
            "confidence": round(min(1.0, confidence), 3)
        }
        
    except Exception as e:
        return {"error": f"Prediction failed: {str(e)}"}

if __name__ == "__main__":
    import uvicorn
    print("Starting Mock ML Backend Server...")
    print("This server simulates ML predictions for testing purposes")
    uvicorn.run(app, host="0.0.0.0", port=8000)