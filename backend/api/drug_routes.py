"""
MediSim AI - Medicine & Chemical Information API Routes
Author: Team BioNex - VIT Bhopal University
Purpose: Search and retrieve PubChem molecular descriptors, openFDA safety labeling,
         Indian CDSCO/ABDM brand mappings, and multi-drug interaction assessments.
"""

from fastapi import APIRouter, HTTPException, Query
from pydantic import BaseModel, Field
from typing import Dict, Any, List, Optional

from ..services.pubchem_service import search_pubchem_compound, get_all_supported_drugs
from ..services.openfda_service import get_drug_safety_label
from ..services.clinpgx_service import get_pgx_guidance
from ..services.faers_service import get_faers_adverse_events
from ..services.indian_medicine_service import search_indian_medicines, get_indian_medicine_details
from ..services.interaction_service import check_drug_interactions

router = APIRouter(prefix="/api/drugs", tags=["Drugs & Pharmacology"])


class InteractionCheckRequest(BaseModel):
    drugs: List[str] = Field(..., min_items=2, description="List of at least two drug names to check")


@router.get("/search")
def search_drugs(q: str = Query(..., description="Drug name, brand, or identifier")):
    """Searches for medicines across PubChem, curated benchmarks, and Indian brand registries."""
    res = search_pubchem_compound(q)
    results = [res] if res else []
    
    if not results:
        all_drugs = get_all_supported_drugs()
        matches = [d for d in all_drugs if q.lower() in d["name"].lower() or any(q.lower() in s.lower() for s in d.get("synonyms", []))]
        results = matches

    # Enrich with Indian brand / CDSCO mappings if available
    indian_matches = search_indian_medicines(q)

    return {
        "query": q,
        "results": results,
        "indian_brand_matches": indian_matches
    }


@router.get("/catalog")
def get_catalog():
    """Returns all pre-indexed pharmaceutical compounds with full descriptors."""
    return {"drugs": get_all_supported_drugs()}


@router.get("/indian/search")
def search_indian_brands(q: str = Query(..., description="Brand name or generic active substance")):
    """Search Indian ABDM / CDSCO drug registry."""
    matches = search_indian_medicines(q)
    return {
        "query": q,
        "count": len(matches),
        "results": matches
    }


@router.post("/interactions")
def evaluate_interactions(payload: InteractionCheckRequest):
    """
    Checks pairwise pharmacological interactions among 2 or more selected drugs.
    Returns severity, mechanisms, clinical mitigation, and mandatory disclaimers.
    """
    return check_drug_interactions(payload.drugs)


@router.get("/{drug_id}")
def get_drug_details(drug_id: str):
    """Retrieves chemical structure, descriptors, Indian brand data, and pharmacogenomic notes."""
    compound = search_pubchem_compound(drug_id)
    if not compound:
        raise HTTPException(status_code=404, detail=f"Drug '{drug_id}' not found in scientific databases.")
    
    pgx = get_pgx_guidance(compound["name"])
    indian_info = get_indian_medicine_details(compound["name"])
    
    return {
        "compound": compound,
        "pharmacogenomics": pgx,
        "indian_registry": indian_info
    }


@router.get("/{drug_id}/properties")
def get_drug_properties(drug_id: str):
    """Returns detailed physicochemical properties, SMILES, InChIKey, and Ro5 evaluation."""
    compound = search_pubchem_compound(drug_id)
    if not compound:
        raise HTTPException(status_code=404, detail=f"Drug '{drug_id}' not found.")
        
    return {
        "name": compound["name"],
        "cid": compound["cid"],
        "formula": compound["formula"],
        "mw": compound["mw"],
        "xlogp": compound["xlogp"],
        "tpsa": compound["tpsa"],
        "hbd": compound["hbd"],
        "hba": compound["hba"],
        "rotatable_bonds": compound.get("rotatable_bonds", 1),
        "canonical_smiles": compound["smiles"],
        "inchi_key": compound.get("inchi_key", "N/A"),
        "rule_of_5_violations": compound.get("rule_of_5_violations", 0)
    }


@router.get("/{drug_id}/safety")
def get_drug_safety(drug_id: str):
    """Retrieves openFDA regulatory warnings, indications, and FAERS adverse event signals."""
    compound = search_pubchem_compound(drug_id)
    drug_name = compound["name"] if compound else drug_id
    
    label = get_drug_safety_label(drug_name)
    faers = get_faers_adverse_events(drug_name)
    indian_info = get_indian_medicine_details(drug_name)
    
    return {
        "drug_name": drug_name,
        "openfda_label": label,
        "faers_adverse_events": faers,
        "indian_regulatory": indian_info
    }
