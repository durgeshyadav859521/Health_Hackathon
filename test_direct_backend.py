"""
MediSim AI - Direct Function & Integration Verification Suite
Author: Team BioNex - VIT Bhopal University
"""

import os
import sys

# Add directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from backend.services.pubchem_service import search_pubchem_compound, get_all_supported_drugs
from backend.services.openfda_service import get_drug_safety_label
from backend.services.clinpgx_service import get_pgx_guidance
from backend.services.faers_service import get_faers_adverse_events
from backend.services.prediction_service import simulate_liver_toxicity, simulate_biological_response, check_models_status
from backend.reports.report_generator import generate_pdf_report
from backend.api.simulation_routes import run_liver_toxicity_simulation, LiverSimulationRequest, PatientProfileInput


def run_all_tests():
    print("=" * 65)
    print("  MEDISIM AI: DIRECT BACKEND INTEGRATION TEST SUITE")
    print("=" * 65)
    
    # 1. PubChem Chemical Integration
    print("\n[TEST 1] Testing PubChem Integration...")
    compound = search_pubchem_compound("Acetaminophen")
    assert compound is not None, "Failed to retrieve Acetaminophen"
    assert compound["cid"] == 1983, f"Unexpected CID: {compound['cid']}"
    assert compound["mw"] > 150.0, "Invalid MW"
    print(f"  [OK] Retrieved {compound['name']} | CID: {compound['cid']} | MW: {compound['mw']} | XLogP: {compound['logp']}")
    
    # 2. openFDA Drug Labeling
    print("\n[TEST 2] Testing openFDA Drug Label Service...")
    label = get_drug_safety_label("Acetaminophen")
    assert "boxed_warning" in label, "Missing boxed warning"
    assert "indications" in label, "Missing indications"
    print(f"  [OK] Retrieved Label for {label['generic_name']} | Boxed Warning Present: {bool(label['boxed_warning'])}")
    
    # 3. FAERS Adverse Event Signal Explorer
    print("\n[TEST 3] Testing FAERS Adverse Event Service...")
    faers = get_faers_adverse_events("Acetaminophen")
    assert len(faers["top_adverse_events"]) > 0, "No FAERS events"
    top_ev = faers["top_adverse_events"][0]
    print(f"  [OK] FAERS Signals: Top Reaction = '{top_ev['term']}' (PRR: {top_ev['prr']}, ROR: {top_ev['ror']}, {top_ev['disproportionality']})")
    
    # 4. ClinPGx Pharmacogenomics
    print("\n[TEST 4] Testing ClinPGx Guidelines...")
    pgx = get_pgx_guidance("Warfarin")
    assert pgx is not None, "Missing Warfarin PGx"
    assert "CYP2C9" in pgx["gene"], "Unexpected PGx gene"
    print(f"  [OK] ClinPGx: {pgx['drug']} -> {pgx['gene']} (Evidence Level: {pgx['evidence_level']})")
    
    # 5. Model Status Verification (Real Model Mode)
    print("\n[TEST 5] Checking Operational Models Status...")
    status = check_models_status()
    print(f"  [OK] Active Operating Mode: {status['operating_mode']}")
    print(f"  [OK] DILI Model Trained Artifact: {status['dili_model_trained']}")
    print(f"  [OK] LINCS Model Trained Artifact: {status['lincs_model_trained']}")
    assert status["operating_mode"] == "REAL_MODEL_MODE", f"Expected REAL_MODEL_MODE, got {status['operating_mode']}"
    
    # 6. Liver Toxicity Supervised Prediction & SHAP
    print("\n[TEST 6] Testing DILIrank Supervised Prediction & SHAP Decomposition...")
    patient = {
        "age": 52.0, "sex": "Male", "bmi": 26.5,
        "ast": 38.0, "alt": 42.0, "bilirubin": 1.1
    }
    liver_res = simulate_liver_toxicity(patient, "Acetaminophen", daily_dose_mg=3000.0)
    assert liver_res is not None
    assert "predicted_class_label" in liver_res, "Missing predicted class label"
    assert "explainability" in liver_res, "Missing explainability"
    assert len(liver_res["explainability"]["waterfall"]) > 0, "Missing SHAP waterfall"
    print(f"  [OK] Predicted DILI Class: {liver_res['predicted_class_label']}")
    print(f"  [OK] Probability: {liver_res['class_probabilities']}")
    print(f"  [OK] SHAP Primary Driver: {liver_res['explainability']['waterfall'][0]['display_name']} ({liver_res['explainability']['waterfall'][0]['shap_value']})")
    
    # 7. Biological Response Simulation (LINCS L1000)
    print("\n[TEST 7] Testing LINCS Biological Response Model...")
    bio_res = simulate_biological_response("Acetaminophen", "HEPG2", dose_um=10.0, time_h=24)
    assert "landmark_gene_zscores" in bio_res
    assert "TP53" in bio_res["landmark_gene_zscores"]
    print(f"  [OK] Biological Perturbation: TP53 = {bio_res['landmark_gene_zscores']['TP53']} | CASP3 = {bio_res['landmark_gene_zscores']['CASP3']}")
    print(f"  [OK] Pattern Cluster: {bio_res['cluster_assignment']}")
    
    # 8. ReportLab PDF Medical Report Generation
    print("\n[TEST 8] Testing ReportLab PDF Report Generation...")
    pdf_path = generate_pdf_report(liver_res, patient, compound)
    assert os.path.exists(pdf_path), f"PDF file not created at {pdf_path}"
    pdf_size = os.path.getsize(pdf_path)
    assert pdf_size > 1000, f"PDF file too small: {pdf_size} bytes"
    print(f"  [OK] PDF Report Successfully Generated: {os.path.basename(pdf_path)} ({pdf_size} bytes)")
    
    # 9. Full Simulation Router Flow
    print("\n[TEST 9] Testing Full Simulation Router Handler...")
    req = LiverSimulationRequest(
        drug_name="Acetaminophen",
        daily_dose_mg=2000.0,
        patient=PatientProfileInput(age=45.0, height_cm=175.0, weight_kg=75.0, ast=24.0, alt=22.0)
    )
    router_res = run_liver_toxicity_simulation(req)
    assert "simulation_id" in router_res
    assert router_res["operating_mode"] == "REAL_MODEL_MODE"
    print(f"  [OK] Simulation Handled: ID = {router_res['simulation_id']}, Mode = {router_res['operating_mode']}")
    
    print("\n" + "=" * 65)
    print("  ALL 9 DIRECT BACKEND INTEGRATION TESTS PASSED PERFECTLY!")
    print("=" * 65)


if __name__ == "__main__":
    run_all_tests()
