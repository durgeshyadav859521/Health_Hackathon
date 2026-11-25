"""
MediSim AI - ClinPGx Pharmacogenomics Knowledge Service
Author: Team BioNex - VIT Bhopal University
Purpose: Query CPIC/PharmGKB clinical evidence levels, gene-drug interactions, and phenotype guidance.
"""

import os
import json
from typing import Dict, Any, List, Optional

RAW_PATH = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets", "raw", "clinpgx_raw.json"))

DEFAULT_PGX_DATABASE = [
    {
        "drug": "Codeine",
        "gene": "CYP2D6",
        "evidence_level": "1A (CPIC High Level)",
        "clinical_summary": "CYP2D6 biotransforms codeine into its active analgesic form, morphine.",
        "phenotype_guidelines": {
            "Poor Metabolizer": {
                "impact": "Lack of analgesic efficacy",
                "recommendation": "Avoid codeine due to lack of efficacy. Alternative: Morphine or non-opioid analgesic."
            },
            "Intermediate Metabolizer": {
                "impact": "Reduced analgesic response",
                "recommendation": "Monitor closely for pain relief; titrate dose if clinically appropriate."
            },
            "Normal Metabolizer": {
                "impact": "Normal therapeutic response",
                "recommendation": "Standard initial dose per product label."
            },
            "Ultra-Rapid Metabolizer": {
                "impact": "High risk of life-threatening respiratory depression and opioid toxicity",
                "recommendation": "AVOID CODEINE. Substantial risk of fatal overdose even at normal therapeutic doses."
            }
        },
        "citation": "CPIC Guideline for Codeine and CYP2D6 (PMID: 24458010)"
    },
    {
        "drug": "Clopidogrel",
        "gene": "CYP2C19",
        "evidence_level": "1A (CPIC High Level)",
        "clinical_summary": "CYP2C19 is required to bioactivate clopidogrel into its active antiplatelet thiol metabolite.",
        "phenotype_guidelines": {
            "Poor Metabolizer": {
                "impact": "Significantly reduced active metabolite; elevated stent thrombosis and MACE risk",
                "recommendation": "Prescribe alternative antiplatelet agent (Prasugrel or Ticagrelor) if not contraindicated."
            },
            "Intermediate Metabolizer": {
                "impact": "Reduced antiplatelet response",
                "recommendation": "Consider alternative antiplatelet therapy based on clinical indication."
            },
            "Normal Metabolizer": {
                "impact": "Standard antiplatelet inhibition",
                "recommendation": "Standard label dose (75 mg daily)."
            },
            "Ultra-Rapid Metabolizer": {
                "impact": "Normal to slightly enhanced platelet inhibition",
                "recommendation": "Standard label dose."
            }
        },
        "citation": "CPIC Guideline for CYP2C19 and Clopidogrel (PMID: 35147995)"
    },
    {
        "drug": "Simvastatin",
        "gene": "SLCO1B1",
        "evidence_level": "1A (CPIC High Level)",
        "clinical_summary": "SLCO1B1 encodes the OATP1B1 hepatic uptake transporter responsible for hepatic extraction of statins.",
        "phenotype_guidelines": {
            "Poor Function": {
                "impact": "400-500% increase in systemic statin exposure; severe risk of rhabdomyolysis and myopathy",
                "recommendation": "Prescribe alternative statin (Pravastatin or Rosuvastatin at low dose) or limit simvastatin dose to ≤20 mg daily."
            },
            "Intermediate Function": {
                "impact": "Moderate increase in systemic statin plasma concentration",
                "recommendation": "Avoid high-dose simvastatin (≥40 mg). Consider lower dose or alternative agent."
            },
            "Normal Function": {
                "impact": "Standard hepatic extraction and expected clearance",
                "recommendation": "Standard label dosing."
            }
        },
        "citation": "CPIC Guideline for SLCO1B1 and Statin Therapy (PMID: 35243689)"
    },
    {
        "drug": "Warfarin",
        "gene": "CYP2C9 & VKORC1",
        "evidence_level": "1A (CPIC High Level)",
        "clinical_summary": "CYP2C9 metabolizes the more potent (S)-warfarin enantiomer; VKORC1 encodes the pharmacological target enzyme.",
        "phenotype_guidelines": {
            "Poor Metabolizer": {
                "impact": "Extreme sensitivity to warfarin and prolonged clearance; major hemorrhage risk",
                "recommendation": "Reduce initial empiric dose by 50-80% and monitor INR frequently."
            },
            "Intermediate Metabolizer": {
                "impact": "Moderate sensitivity",
                "recommendation": "Reduce initial dose by 20-40%."
            },
            "Normal Metabolizer": {
                "impact": "Standard therapeutic responsiveness",
                "recommendation": "Standard dosing titrated by INR."
            }
        },
        "citation": "CPIC Guideline for Warfarin Pharmacogenetics (PMID: 28198005)"
    }
]


def get_pgx_guidance(drug_name: str) -> Optional[Dict[str, Any]]:
    """
    Finds pharmacogenomic annotations and guidelines for a given drug.
    """
    clean_d = drug_name.strip().lower()
    for item in DEFAULT_PGX_DATABASE:
        if clean_d in item["drug"].lower() or item["drug"].lower() in clean_d:
            return item
    return None


def get_all_pgx_guidelines() -> List[Dict[str, Any]]:
    return DEFAULT_PGX_DATABASE
