"""
MediSim AI - PDF Report API Routes
Author: Team BioNex - VIT Bhopal University
Purpose: Generate and serve publication-grade downloadable PDF simulation reports.
"""

import os
from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse
from pydantic import BaseModel
from typing import Dict, Any, Optional

from ..reports.report_generator import generate_pdf_report
from .simulation_routes import SIMULATION_STORE

router = APIRouter(prefix="/api/reports", tags=["Reports"])

REPORT_CACHE: Dict[str, str] = {}


class GenerateReportRequest(BaseModel):
    simulation_id: Optional[str] = None
    drug_name: str
    patient: Dict[str, Any]
    simulation_result: Dict[str, Any]
    chemical_properties: Optional[Dict[str, Any]] = None


@router.post("/generate")
def create_report(req: GenerateReportRequest):
    """Generates a downloadable PDF report for a simulation."""
    sim_data = req.simulation_result
    if req.simulation_id and req.simulation_id in SIMULATION_STORE:
        stored = SIMULATION_STORE[req.simulation_id]
        sim_data = stored.get("prediction", sim_data)
        if not req.chemical_properties:
            req.chemical_properties = stored.get("chemical_properties", {})
            
    chem = req.chemical_properties or {
        "name": req.drug_name,
        "mw": 300.0,
        "logp": 2.5,
        "tpsa": 60.0
    }
    
    try:
        pdf_path = generate_pdf_report(sim_data, req.patient, chem)
        report_id = os.path.basename(pdf_path)
        REPORT_CACHE[report_id] = pdf_path
        
        return {
            "report_id": report_id,
            "filename": report_id,
            "download_url": f"/api/reports/{report_id}",
            "status": "ready"
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to generate PDF report: {e}")


@router.get("/{report_id}")
def download_report(report_id: str):
    """Downloads the generated PDF report."""
    if report_id in REPORT_CACHE and os.path.exists(REPORT_CACHE[report_id]):
        file_path = REPORT_CACHE[report_id]
    else:
        # Check standard reports directory
        from ..reports.report_generator import REPORTS_DIR
        file_path = os.path.join(REPORTS_DIR, report_id)
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Requested report PDF not found.")
            
    return FileResponse(
        file_path,
        media_type="application/pdf",
        filename=os.path.basename(file_path)
    )
