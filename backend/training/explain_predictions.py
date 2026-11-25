"""
MediSim AI - Explainable AI (SHAP) Module
Author: Team BioNex - VIT Bhopal University
Purpose: Compute global and local SHAP explanations for liver toxicity and biological models:
  - Global feature importance rankings
  - Individual patient/drug prediction SHAP attributions (waterfall decomposition)
  - Plain-English scientific translations derived strictly from true mathematical SHAP values
"""

import os
import json
import joblib
import numpy as np
import pandas as pd
import shap

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
MODEL_PATH = os.path.join(BASE_DIR, "models", "dili_model", "dili_model.joblib")
PROCESSED_DATA_PATH = os.path.join(BASE_DIR, "datasets", "processed", "dilirank_processed.csv")
EXPLAINER_DIR = os.path.join(BASE_DIR, "models", "dili_model")

FEATURE_COLS = [
    "mw", "logp", "tpsa", "hbd", "hba", "rot_bonds",
    "daily_dose_mg", "reactive_metabolite", "rule_of_two",
    "log_dose", "logp_tpsa_ratio", "tpsa_mw_ratio", "hb_total"
]

FEATURE_NAMES_READABLE = {
    "mw": "Molecular Weight (g/mol)",
    "logp": "Lipophilicity (XLogP)",
    "tpsa": "Topological Polar Surface Area (Ã…Â²)",
    "hbd": "Hydrogen Bond Donors",
    "hba": "Hydrogen Bond Acceptors",
    "rot_bonds": "Rotatable Bonds",
    "daily_dose_mg": "Daily Exposure Dose (mg)",
    "reactive_metabolite": "Reactive Metabolite Formation",
    "rule_of_two": "FDA LTKB Rule of 2 (Dose â‰¥ 100mg & LogP â‰¥ 3)",
    "log_dose": "Log Daily Dose Exposure",
    "logp_tpsa_ratio": "Lipophilicity / Polar Surface Ratio",
    "tpsa_mw_ratio": "Polar Surface Fraction of Mass",
    "hb_total": "Total Hydrogen Bonding Count"
}


def fit_and_save_explainer():
    """
    Fits a TreeExplainer or KernelExplainer on the training background and serializes it.
    Computes global feature importance rankings.
    """
    if not os.path.exists(MODEL_PATH) or not os.path.exists(PROCESSED_DATA_PATH):
        print("[!] Model or processed dataset missing. Please train the model first.")
        return None
        
    print("[*] Initializing SHAP Explainer on trained DILI model...")
    model = joblib.load(MODEL_PATH)
    df = pd.read_csv(PROCESSED_DATA_PATH)
    X = df[FEATURE_COLS]
    
    # Use TreeExplainer for tree models (RandomForest / XGBoost)
    try:
        explainer = shap.TreeExplainer(model, X)
        shap_values = explainer.shap_values(X)
    except Exception as e:
        print(f"[!] Falling back to KernelExplainer: {e}")
        background = shap.sample(X, 20, random_state=42)
        explainer = shap.KernelExplainer(model.predict_proba, background)
        shap_values = explainer.shap_values(X.iloc[:20])
        
    # Calculate global mean |SHAP| per feature
    arr = np.array(shap_values)
    if arr.ndim == 3:
        if arr.shape[1] == len(FEATURE_COLS):
            global_importance = np.mean(np.abs(arr), axis=(0, 2)).tolist()
        elif arr.shape[2] == len(FEATURE_COLS):
            global_importance = np.mean(np.abs(arr), axis=(0, 1)).tolist()
        else:
            global_importance = np.mean(np.abs(arr), axis=0).flatten()[:len(FEATURE_COLS)].tolist()
    else:
        global_importance = np.mean(np.abs(arr), axis=0).tolist()

    feature_importance_ranking = [
        {
            "feature": col,
            "display_name": FEATURE_NAMES_READABLE.get(col, col),
            "importance": float(np.mean(imp))
        }
        for col, imp in zip(FEATURE_COLS, global_importance)
    ]
    feature_importance_ranking.sort(key=lambda x: x["importance"], reverse=True)
    
    out_json = {
        "global_feature_importance": feature_importance_ranking,
        "features": FEATURE_COLS
    }
    
    out_path = os.path.join(EXPLAINER_DIR, "shap_global.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(out_json, f, indent=2)
        
    print(f"[âœ“] SHAP global feature importances saved to {out_path}")
    return out_json


def explain_single_instance(model, input_dict):
    """
    Calculates exact local SHAP contributions for an incoming prediction request.
    Returns:
      - base_value (expected value)
      - feature_contributions: list of {feature, display_name, value, shap_value, direction}
      - scientific_summary: textual explanation of primary drivers
    """
    row_df = pd.DataFrame([input_dict])[FEATURE_COLS]
    
    # Calculate SHAP values
    try:
        explainer = shap.TreeExplainer(model)
        sv = explainer.shap_values(row_df)
        expected_val = explainer.expected_value
    except Exception:
        # Fallback tree or direct approximation
        explainer = shap.TreeExplainer(model)
        sv = explainer(row_df).values
        expected_val = explainer.expected_value
        
    if isinstance(sv, list):
        # 3 classes: take High Concern (Class 2)
        class_idx = 2 if len(sv) > 2 else 0
        vals = sv[class_idx][0]
        base_v = float(expected_val[class_idx]) if isinstance(expected_val, (list, np.ndarray)) else float(expected_val)
    elif len(np.shape(sv)) == 3:
        vals = sv[0, :, 2]
        base_v = float(expected_val[2]) if hasattr(expected_val, '__len__') else float(expected_val)
    else:
        vals = sv[0]
        base_v = float(expected_val) if not hasattr(expected_val, '__len__') else float(expected_val[0])
        
    contributions = []
    positive_drivers = []
    protective_drivers = []
    
    for col, s_val in zip(FEATURE_COLS, vals):
        s_float = float(s_val)
        val = float(input_dict.get(col, 0.0))
        disp = FEATURE_NAMES_READABLE.get(col, col)
        
        contrib = {
            "feature": col,
            "display_name": disp,
            "feature_value": val,
            "shap_value": round(s_float, 4),
            "direction": "increases_concern" if s_float > 0 else "reduces_concern"
        }
        contributions.append(contrib)
        
        if s_float > 0.05:
            positive_drivers.append(f"{disp} ({val})")
        elif s_float < -0.05:
            protective_drivers.append(f"{disp} ({val})")
            
    # Sort contributions by absolute SHAP value
    contributions.sort(key=lambda x: abs(x["shap_value"]), reverse=True)
    
    # Generate scientifically precise summary
    summary_parts = []
    if positive_drivers:
        summary_parts.append(
            f"The model's risk elevation was primarily driven by: {', '.join(positive_drivers[:3])}."
        )
    if protective_drivers:
        summary_parts.append(
            f"Protective or risk-attenuating factors included: {', '.join(protective_drivers[:2])}."
        )
    if not summary_parts:
        summary_parts.append(
            "Feature contributions remained near the population baseline with no extreme outliers detected."
        )
        
    return {
        "base_value": round(base_v, 4),
        "feature_contributions": contributions,
        "scientific_summary": " ".join(summary_parts)
    }


if __name__ == "__main__":
    fit_and_save_explainer()

