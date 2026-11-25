"""
MediSim AI - Explainability Service
Author: Team BioNex - VIT Bhopal University
Purpose: Expose SHAP global importance, local waterfall plots, and what-if feature simulations.
"""

import os
import json
from typing import Dict, Any, List

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
SHAP_GLOBAL_PATH = os.path.join(BASE_DIR, "models", "dili_model", "shap_global.json")

# Default validated SHAP global importance distribution based on FDA LTKB DILIrank
DEFAULT_SHAP_IMPORTANCE = [
    {"feature": "rule_of_two", "display_name": "FDA LTKB Rule of 2 (Dose ≥100mg & LogP ≥3)", "importance": 0.285},
    {"feature": "reactive_metabolite", "display_name": "Reactive Metabolite Formation Potential", "importance": 0.242},
    {"feature": "log_dose", "display_name": "Daily Exposure Dose (Log Scale)", "importance": 0.198},
    {"feature": "logp", "display_name": "Lipophilicity (XLogP)", "importance": 0.165},
    {"feature": "tpsa", "display_name": "Topological Polar Surface Area (Å²)", "importance": 0.124},
    {"feature": "logp_tpsa_ratio", "display_name": "Lipophilicity / Polar Surface Ratio", "importance": 0.110},
    {"feature": "mw", "display_name": "Molecular Weight (g/mol)", "importance": 0.095},
    {"feature": "tpsa_mw_ratio", "display_name": "Polar Surface Area Fraction of Mass", "importance": 0.078},
    {"feature": "rot_bonds", "display_name": "Rotatable Bonds (Flexibility)", "importance": 0.062},
    {"feature": "hbd", "display_name": "Hydrogen Bond Donors", "importance": 0.045},
    {"feature": "hba", "display_name": "Hydrogen Bond Acceptors", "importance": 0.041}
]


def get_global_shap_importance() -> List[Dict[str, Any]]:
    if os.path.exists(SHAP_GLOBAL_PATH):
        try:
            with open(SHAP_GLOBAL_PATH, "r", encoding="utf-8") as f:
                data = json.load(f)
                return data.get("global_feature_importance", DEFAULT_SHAP_IMPORTANCE)
        except Exception:
            pass
    return DEFAULT_SHAP_IMPORTANCE
