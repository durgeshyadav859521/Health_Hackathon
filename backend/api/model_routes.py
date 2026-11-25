"""
MediSim AI - Model Metadata & Scientific Explainability Routes
Author: Team BioNex - VIT Bhopal University
Purpose: Expose model metrics, training status, dataset provenance, and SHAP feature importances.
"""

import os
import json
from fastapi import APIRouter, HTTPException
from typing import Dict, Any

from ..services.prediction_service import check_models_status
from ..services.explainability_service import get_global_shap_importance
from .simulation_routes import SIMULATION_STORE

router = APIRouter(prefix="/api", tags=["Models & Explainability"])

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DILI_METRICS_PATH = os.path.join(BASE_DIR, "models", "dili_model", "dili_metrics.json")
LINCS_METRICS_PATH = os.path.join(BASE_DIR, "models", "lincs_model", "lincs_metrics.json")
METADATA_DIR = os.path.join(BASE_DIR, "datasets", "metadata", "datasets_metadata.json")


@router.get("/models/status")
def get_models_status():
    """Returns training state, versioning, and Real vs Demonstration operating mode."""
    return check_models_status()


@router.get("/models/metrics")
def get_model_metrics():
    """Returns evaluation metrics, ROC-AUC, F1-scores, and confusion matrices."""
    metrics_payload = {
        "dili_model": None,
        "lincs_model": None
    }
    
    if os.path.exists(DILI_METRICS_PATH):
        try:
            with open(DILI_METRICS_PATH, "r", encoding="utf-8") as f:
                metrics_payload["dili_model"] = json.load(f)
        except Exception:
            pass
            
    if os.path.exists(LINCS_METRICS_PATH):
        try:
            with open(LINCS_METRICS_PATH, "r", encoding="utf-8") as f:
                metrics_payload["lincs_model"] = json.load(f)
        except Exception:
            pass
            
    return metrics_payload


@router.get("/datasets/status")
def get_datasets_status():
    """Returns information on all 7 biomedical datasets (PubChem, openFDA, DILIrank, LINCS, ClinPGx, FAERS, MIMIC-IV)."""
    if os.path.exists(METADATA_DIR):
        try:
            with open(METADATA_DIR, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            pass
    return {"datasets": []}


@router.get("/explainability/global")
def get_global_explainability():
    """Returns global feature importance rankings computed via SHAP TreeExplainer."""
    return {
        "dataset": "FDA DILIrank 2.0 (LTKB)",
        "explainer_type": "TreeExplainer",
        "feature_importances": get_global_shap_importance()
    }


@router.get("/explainability/{simulation_id}")
def get_simulation_explainability(simulation_id: str):
    """Retrieves local SHAP feature attribution waterfall and explanation for a simulation run."""
    if simulation_id not in SIMULATION_STORE:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
        
    sim = SIMULATION_STORE[simulation_id]
    exp = sim.get("explainability", {})
    return {
        "simulation_id": simulation_id,
        "drug_name": sim.get("drug_name"),
        "explainability": exp
    }
