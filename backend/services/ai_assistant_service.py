"""
MediSim AI - Retrieval-Augmented Generation (RAG) AI Medicine Guide & Research Assistant
Author: Team BioNex - VIT Bhopal University
Purpose: Answers user and researcher questions using grounded biomedical knowledge from
         PubChem, FDA Drug Labels, DILIrank, ClinPGx, and CDSCO, strictly enforcing medical safety guardrails.
"""

from typing import Dict, List, Optional, Any
from .pubchem_service import search_pubchem_compound
from .openfda_service import get_drug_safety_label
from .clinpgx_service import get_pgx_guidance
from .indian_medicine_service import get_indian_medicine_details

# Safety rule keywords that must trigger urgent healthcare referral
EMERGENCY_KEYWORDS = [
    "chest pain", "difficulty breathing", "shortness of breath", "anaphylaxis",
    "swelling of face", "suicide", "overdose", "unconscious", "vomiting blood", "severe bleeding"
]


def process_assistant_query(query: str, mode: str = "general", drug_context: Optional[str] = None) -> Dict[str, Any]:
    """
    Executes a RAG query over grounded biomedical datasets with safety filtering.
    Modes:
      - 'general': Simple language for patients, clear warnings, no jargon.
      - 'researcher': Molecular targets, pharmacokinetics, CYP enzymes, scientific citations.
    """
    clean_query = query.strip().lower()
    
    # 1. Emergency Safety Filter
    for kw in EMERGENCY_KEYWORDS:
        if kw in clean_query:
            return {
                "query": query,
                "mode": mode,
                "is_emergency": True,
                "response": (
                    "EMERGENCY MEDICAL NOTICE: You have mentioned symptoms or situations that may require urgent medical care "
                    f"('{kw}'). MediSim AI is an educational platform and CANNOT provide emergency medical triage. "
                    "Please immediately dial your local emergency services (e.g. 112 / 108 in India, 911 in US) or go to the nearest emergency department."
                ),
                "citations": ["World Health Organization Emergency Guidelines"],
                "disclaimer": "MediSim AI does not replace professional emergency medical assessment."
            }
            
    # 2. Extract drug entity from query or context
    detected_drug = drug_context
    known_drugs = ["acetaminophen", "paracetamol", "warfarin", "atorvastatin", "ibuprofen", "metformin", "azithromycin", "amoxicillin", "pantoprazole", "aspirin"]
    if not detected_drug:
        for kd in known_drugs:
            if kd in clean_query:
                detected_drug = kd.capitalize()
                break
                
    if not detected_drug:
        detected_drug = "Acetaminophen"  # Default contextual anchor if not specified
        
    # 3. Retrieve Grounded Knowledge (RAG Document Ingestion)
    pubchem_data = search_pubchem_compound(detected_drug) or {}
    fda_data = get_drug_safety_label(detected_drug) or {}
    pgx_data = get_pgx_guidance(detected_drug) or {}
    indian_data = get_indian_medicine_details(detected_drug)
    
    citations = [
        f"NCBI PubChem Compound Knowledgebase (CID: {pubchem_data.get('cid', 'N/A')})",
        f"U.S. FDA Structured Product Labeling (SPL) for {detected_drug}",
        "CPIC / PharmGKB Clinical Pharmacogenetics Implementation Consortium"
    ]
    if indian_data:
        citations.append(f"CDSCO / ABDM Drug Registry ({indian_data.get('cdsco_status', 'Approved')})")
        
    # 4. Generate Response based on Mode
    if mode == "general":
        # General User Friendly Explanation
        uses = fda_data.get("indications", "Commonly used for symptom management under medical guidance.")
        warnings = fda_data.get("boxed_warning") or fda_data.get("warnings", "Use strictly as directed on the label.")
        
        brands_str = ""
        if indian_data:
            brands = [b["brand"] for b in indian_data.get("common_brands", [])]
            brands_str = f"Common Indian brand names include: **{', '.join(brands)}**."

        answer_parts = [
            f"### Plain-Language Guide: **{detected_drug}**\n",
            f"**What is it used for?**\n{uses}\n",
            f"{brands_str}\n" if brands_str else "",
            f"**How should you take it?**\nAlways take this medicine according to your doctor's or pharmacist's specific instructions. Do not change your dose without speaking to your doctor.\n",
            f"**Important Safety Precautions & Warnings:**\n{warnings[:400]}...\n",
            "**What to do if you miss a dose?**\nTake it as soon as you remember, unless it is almost time for your next scheduled dose. **Never take a double dose** to make up for a missed dose.",
            "\n**When to contact a doctor immediately?**\nIf you notice yellowing of the eyes/skin, severe abdominal pain, persistent nausea, or an allergic rash, seek medical attention promptly."
        ]
        response_text = "\n".join(answer_parts)
    else:
        # Researcher Scientific Pharmacology
        mw = pubchem_data.get("mw", "N/A")
        formula = pubchem_data.get("formula", "N/A")
        xlogp = pubchem_data.get("xlogp", "N/A")
        tpsa = pubchem_data.get("tpsa", "N/A")
        smiles = pubchem_data.get("smiles", "N/A")
        
        pgx_str = "No Level 1A CPIC genetic variant guidelines currently established."
        if pgx_data and pgx_data.get("has_guidelines"):
            genes = ", ".join(pgx_data.get("genes", []))
            rec = pgx_data.get("clinical_recommendation", "")
            pgx_str = f"Associated with high-evidence variants in **{genes}** (CPIC Level 1A). Therapeutic implication: {rec}"

        answer_parts = [
            f"### Biomedical & Molecular Analysis: **{detected_drug}**\n",
            f"- **Formula:** `{formula}` | **Molecular Weight:** `{mw} g/mol`",
            f"- **XLogP3-AA:** `{xlogp}` | **Topological Polar Surface Area (TPSA):** `{tpsa} Å²`",
            f"- **Canonical SMILES:** `{smiles}`\n",
            f"**Mechanism of Action & Target Receptors:**\n{fda_data.get('mechanism_of_action', 'Exerts therapeutic modulation via specific enzymatic or receptor pathway.')}\n",
            f"**Pharmacogenomics (CPIC Level 1A):**\n{pgx_str}\n",
            f"**Toxicological Benchmarks & Safety Profile:**\nFDA DILIrank classification and openFDA spontaneous adverse event signals identify primary clearance pathways. Boxed warning status: {bool(fda_data.get('boxed_warning'))}.\n",
            f"**Indian Regulatory Classification:**\n{indian_data.get('schedule', 'CDSCO Regulated')} | Status: {indian_data.get('cdsco_status', 'Approved') if indian_data else 'Standard International Listing'}."
        ]
        response_text = "\n".join(answer_parts)

    return {
        "query": query,
        "mode": mode,
        "detected_drug": detected_drug,
        "is_emergency": False,
        "response": response_text,
        "citations": citations,
        "disclaimer": "MediSim AI is an educational and biomedical research prototype developed by Team BioNex (VIT Bhopal University). It does not provide medical diagnosis, prescribing, or clinical treatment recommendations."
    }
