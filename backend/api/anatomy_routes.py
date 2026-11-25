"""
MediSim AI - Anatomy and Organ Evidence Router
Author: Team BioNex - VIT Bhopal University
Purpose: Exposes endpoints for 3D body simulation, 9 major organs, 8 biological systems,
         organ evidence mappings, and animated Drug Journey timelines.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel
from typing import Optional, List, Dict, Any

from ..services.organ_evidence_service import (
    MAJOR_ORGANS,
    BIOLOGICAL_SYSTEMS,
    get_organ_evidence_for_drug,
    generate_drug_journey
)

router = APIRouter(prefix="/api/anatomy", tags=["Human Body & Anatomy Simulation"])


class JourneyRequest(BaseModel):
    drug_name: str
    route: Optional[str] = "Oral"


class OrganEvidenceRequest(BaseModel):
    drug_name: str


@router.get("/organs")
def list_organs():
    """List all 9 major anatomical organs with physiological and metabolic roles."""
    return {
        "count": len(MAJOR_ORGANS),
        "organs": MAJOR_ORGANS
    }


@router.get("/systems")
def list_systems():
    """List all 8 biological systems with associated anatomical organs."""
    return {
        "count": len(BIOLOGICAL_SYSTEMS),
        "systems": BIOLOGICAL_SYSTEMS
    }


@router.get("/drug/{drug_id}/evidence")
def get_drug_organ_evidence(drug_id: str):
    """Retrieve 6-color disturbance classification and evidence cards for all organs."""
    result = get_organ_evidence_for_drug(drug_id)
    return result


@router.get("/organ/{organ_id}/drugs")
def get_drugs_for_organ(organ_id: str):
    """Retrieve benchmark medicines associated with metabolic or toxicological effects on an organ."""
    found_organ = next((o for o in MAJOR_ORGANS if o["id"] == organ_id.lower()), None)
    if not found_organ:
        raise HTTPException(status_code=404, detail=f"Organ '{organ_id}' not found")
        
    return {
        "organ": found_organ,
        "sample_associated_drugs": [
            "Acetaminophen", "Warfarin", "Atorvastatin", "Ibuprofen", "Metformin"
        ],
        "disclaimer": "These associations represent pharmacodynamic targets and established pharmacological clearance sites."
    }


@router.post("/drug-journey")
def get_drug_journey(payload: JourneyRequest):
    """Generate 6-stage animated Drug Journey with camera checkpoints and timing."""
    journey = generate_drug_journey(payload.drug_name, payload.route or "Oral")
    return journey


@router.post("/simulation/organ-evidence")
def post_organ_evidence(payload: OrganEvidenceRequest):
    """Generate dynamic evidence classification matching POST /api/simulation/organ-evidence specification."""
    return get_organ_evidence_for_drug(payload.drug_name)
