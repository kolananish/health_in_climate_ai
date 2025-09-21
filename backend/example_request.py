import requests

# Example data
example_features = {
    "Gender": 1,
    "Age": 30,
    "Temperature": 28.5,
    "Humidity": 65,
    "hrv_mean_hr": 75.0,
    "hrv_mean_nni": 800.0
}

def test_prediction():
    response = requests.post("BACKEND_URL/predict", json=example_features)
    if response.status_code == 200:
        result = response.json()
        print(f"Risk Score: {result['risk_score']}")
        print(f"Confidence: {result['confidence']}")
        print(f"Predicted Class: {result['predicted_class']}")
    else:
        print(f"Error: {response.text}")

def main():
    test_prediction()

if __name__ == "__main__":
    main()