"""
MediSim AI - Simulation & Inference API Routes
Author: Team BioNex - VIT Bhopal University
Purpose: Execute liver toxicity and biological response simulations with full SHAP explainability.
"""

import uuid
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel, Field
from typing import Dict, Any, Optional, List

from ..services.prediction_service import simulate_liver_toxicity, simulate_biological_response
from ..services.pubchem_service import search_pubchem_compound
from ..services.openfda_service import get_drug_safety_label
from ..services.clinpgx_service import get_pgx_guidance
from ..services.faers_service import get_faers_adverse_events
from ..services.explainability_service import get_global_shap_importance

router = APIRouter(prefix="/api/simulation", tags=["Simulation"])

# In-memory store for instant zero-dependency simulation caching
SIMULATION_STORE: Dict[str, Any] = {}


class PatientProfileInput(BaseModel):
    age: float = Field(45.0, ge=1, le=120, description="Patient age in years")
    sex: str = Field("Not Specified", description="Biological sex (when relevant to clearance)")
    height_cm: float = Field(170.0, ge=50, le=250, description="Height in centimeters")
    weight_kg: float = Field(70.0, ge=20, le=300, description="Weight in kilograms")
    ast: Optional[float] = Field(24.0, ge=0, le=2000, description="Aspartate aminotransferase (AST) in U/L")
    alt: Optional[float] = Field(22.0, ge=0, le=2000, description="Alanine aminotransferase (ALT) in U/L")
    bilirubin: Optional[float] = Field(0.8, ge=0, le=30.0, description="Total serum bilirubin in mg/dL")
    creatinine: Optional[float] = Field(0.9, ge=0, le=20.0, description="Serum creatinine in mg/dL")
    systolic_bp: Optional[float] = Field(120.0, ge=60, le=260, description="Systolic Blood Pressure (mmHg)")
    diastolic_bp: Optional[float] = Field(80.0, ge=40, le=160, description="Diastolic Blood Pressure (mmHg)")
    medications: Optional[List[str]] = Field(default=[], description="Concurrent medications")


class LiverSimulationRequest(BaseModel):
    drug_name: str = Field(..., description="Target drug name or compound")
    daily_dose_mg: float = Field(500.0, ge=0.1, le=10000.0, description="Daily exposure dose in mg")
    patient: PatientProfileInput


class BiologicalSimulationRequest(BaseModel):
    drug_name: str = Field(..., description="Target drug name or compound")
    cell_line: str = Field("HEPG2", description="Cell line (HEPG2, A549, MCF7, PC3)")
    dose_um: float = Field(10.0, ge=0.01, le=100.0, description="Experimental concentration in micromolar")
    time_h: int = Field(24, ge=1, le=72, description="Incubation time in hours")


@router.post("/liver-toxicity")
def run_liver_toxicity_simulation(req: LiverSimulationRequest):
    """
    Executes an integrated drug-induced liver injury simulation connecting:
      1. PubChem chemical properties
      2. Patient baseline transaminases and age
      3. Trained FDA DILIrank 2.0 ML model
      4. SHAP local feature attribution waterfall
      5. openFDA safety label & FAERS signals
      6. ClinPGx pharmacogenomic notes
    """
    sim_id = str(uuid.uuid4())[:8]
    
    # Calculate BMI
    h_m = req.patient.height_cm / 100.0
    bmi = round(req.patient.weight_kg / (h_m * h_m), 1) if h_m > 0 else 24.2
    
    patient_dict = req.patient.model_dump()
    patient_dict["bmi"] = bmi
    
    # 1. Run liver toxicity prediction
    dili_result = simulate_liver_toxicity(patient_dict, req.drug_name, req.daily_dose_mg)
    
    # 2. Retrieve chemical, label, and PGx context
    chem = search_pubchem_compound(req.drug_name)
    label = get_drug_safety_label(req.drug_name)
    pgx = get_pgx_guidance(req.drug_name)
    faers = get_faers_adverse_events(req.drug_name)
    
    # 3. Assemble integrated payload
    full_result = {
        "simulation_id": sim_id,
        "type": "liver-toxicity",
        "drug_name": req.drug_name,
        "daily_dose_mg": req.daily_dose_mg,
        "patient_profile": patient_dict,
        "chemical_properties": chem,
        "prediction": dili_result,
        "openfda_safety": label,
        "pharmacogenomics": pgx,
        "faers_adverse_events": faers,
        "explainability": dili_result["explainability"],
        "operating_mode": dili_result["operating_mode"]
    }
    
    SIMULATION_STORE[sim_id] = full_result
    return full_result


@router.post("/biological-response")
def run_biological_response_simulation(req: BiologicalSimulationRequest):
    """
    Executes in-vitro gene perturbation response simulation on LINCS L1000 landmark genes.
    """
    sim_id = str(uuid.uuid4())[:8]
    result = simulate_biological_response(
        req.drug_name, req.cell_line, req.dose_um, req.time_h
    )
    result["simulation_id"] = sim_id
    SIMULATION_STORE[sim_id] = result
    return result


@router.get("/{simulation_id}")
def get_simulation_result(simulation_id: str):
    """Retrieves cached simulation result by ID."""
    if simulation_id not in SIMULATION_STORE:
        raise HTTPException(status_code=404, detail=f"Simulation '{simulation_id}' not found.")
    return SIMULATION_STORE[simulation_id]
