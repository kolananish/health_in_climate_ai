import joblib
import os
import warnings
from sklearn.exceptions import InconsistentVersionWarning

# Suppress version warnings
warnings.filterwarnings("ignore", category=InconsistentVersionWarning)

def load_model_safely(model_path):
    """Load XGBoost model with compatibility fixes"""
    try:
        model = joblib.load(model_path)
        
        # Remove deprecated attributes that cause issues
        deprecated_attrs = ['use_label_encoder', '_use_label_encoder']
        for attr in deprecated_attrs:
            if hasattr(model, attr):
                delattr(model, attr)
        
        # Set safe defaults for XGBoost
        if hasattr(model, 'set_params'):
            try:
                model.set_params(enable_categorical=False)
            except:
                pass
        
        # Additional fix for XGBoost compatibility
        if hasattr(model, '_Booster'):
            # This is an XGBoost model, apply additional fixes
            try:
                # Force remove the problematic attribute from the underlying booster
                if hasattr(model._Booster, 'use_label_encoder'):
                    delattr(model._Booster, 'use_label_encoder')
            except:
                pass
                
        return model
    except Exception as e:
        print(f"Error loading model: {e}")
        raise

def load_all_components(model_dir="thermal_comfort_model"):
    """Load all model components with error handling"""
    components = {}
    
    try:
        components['model'] = load_model_safely(os.path.join(model_dir, "xgboost_model.joblib"))
        components['scaler'] = joblib.load(os.path.join(model_dir, "scaler.joblib"))
        components['label_encoder'] = joblib.load(os.path.join(model_dir, "label_encoder.joblib"))
        components['feature_columns'] = joblib.load(os.path.join(model_dir, "feature_columns.joblib"))
        
        print("All model components loaded successfully")
        return components
        
    except Exception as e:
        print(f"Error loading model components: {e}")
        raise