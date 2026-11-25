"""
MediSim AI - End-to-End API Automated Verification Test
Author: Team BioNex - VIT Bhopal University
"""

import sys
import os

# Add parent directory to python path
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from fastapi.testclient import TestClient
from backend.main import app

client = TestClient(app)


def test_api():
    print("=" * 65)
    print("  MEDISIM AI: AUTOMATED END-TO-END VERIFICATION")
    print("=" * 65)
    
    # 1. Health & Root
    r = client.get("/")
    assert r.status_code == 200, f"Root failed: {r.status_code}"
    print(f"[OK] Root Endpoint Verified: Platform = {r.json()['platform']}")
    
    # 2. Drug Search
    r = client.get("/api/drugs/search?q=Acetaminophen")
    assert r.status_code == 200, f"Drug search failed: {r.status_code}"
    results = r.json()["results"]
    assert len(results) > 0, "No drugs returned"
    print(f"[OK] Drug Search Endpoint: Found {results[0]['name']} (CID: {results[0]['cid']})")
    
    # 3. Drug Details & PGx
    r = client.get("/api/drugs/Acetaminophen")
    assert r.status_code == 200, f"Drug details failed: {r.status_code}"
    print(f"[OK] Drug Details: Formula = {r.json()['compound']['formula']}, MW = {r.json()['compound']['mw']}")
    
    # 4. Drug Safety & FAERS
    r = client.get("/api/drugs/Acetaminophen/safety")
    assert r.status_code == 200, f"Safety failed: {r.status_code}"
    assert "boxed_warning" in r.json()["openfda_label"], "Missing boxed warning"
    assert "top_adverse_events" in r.json()["faers_adverse_events"], "Missing FAERS events"
    print(f"[OK] openFDA & FAERS Signals Verified. Top FAERS reaction: {r.json()['faers_adverse_events']['top_adverse_events'][0]['term']}")
    
    # 5. Liver Toxicity Simulation (Real Model Mode)
    sim_payload = {
        "drug_name": "Acetaminophen",
        "daily_dose_mg": 2000.0,
        "patient": {
            "age": 45.0,
            "sex": "Male",
            "height_cm": 175.0,
            "weight_kg": 75.0,
            "ast": 32.0,
            "alt": 35.0,
            "bilirubin": 0.9,
            "creatinine": 1.0,
            "systolic_bp": 120.0,
            "diastolic_bp": 80.0
        }
    }
    r = client.post("/api/simulation/liver-toxicity", json=sim_payload)
    assert r.status_code == 200, f"Liver simulation failed: {r.status_code}"
    sim_res = r.json()
    assert "prediction" in sim_res, "Missing prediction"
    assert "explainability" in sim_res, "Missing SHAP explainability"
    assert "waterfall" in sim_res["explainability"], "Missing waterfall"
    print(f"[OK] Liver Toxicity Simulation Executed:")
    print(f"     Operating Mode: {sim_res['operating_mode']}")
    print(f"     Predicted Class: {sim_res['prediction']['predicted_class_label']}")
    print(f"     SHAP Primary Driver: {sim_res['explainability']['waterfall'][0]['display_name']} ({sim_res['explainability']['waterfall'][0]['shap_value']})")
    
    # 6. Biological Response Simulation (LINCS L1000)
    bio_payload = {
        "drug_name": "Acetaminophen",
        "cell_line": "HEPG2",
        "dose_um": 10.0,
        "time_h": 24
    }
    r = client.post("/api/simulation/biological-response", json=bio_payload)
    assert r.status_code == 200, f"Biological simulation failed: {r.status_code}"
    bio_res = r.json()
    assert "landmark_gene_zscores" in bio_res, "Missing gene z-scores"
    print(f"[OK] LINCS Biological Response Executed:")
    print(f"     Cell Line: {bio_res['cell_line']}")
    print(f"     Cluster: {bio_res['cluster_assignment']}")
    print(f"     TP53 Z-Score: {bio_res['landmark_gene_zscores']['TP53']}, CASP3 Z-Score: {bio_res['landmark_gene_zscores']['CASP3']}")
    
    # 7. Model Status & Metrics
    r = client.get("/api/models/status")
    assert r.status_code == 200
    print(f"[OK] Model Status: {r.json()['operating_mode']}, DILI Model Trained = {r.json()['dili_model_trained']}")
    
    r = client.get("/api/models/metrics")
    assert r.status_code == 200
    assert r.json()["dili_model"] is not None, "Missing DILI model metrics"
    print(f"[OK] Model Metrics: DILI Best Model = {r.json()['dili_model']['best_model']}, F1 = {r.json()['dili_model']['metrics']['f1_score']:.3f}")
    
    # 8. Report Generation (PDF)
    report_payload = {
        "simulation_id": sim_res["simulation_id"],
        "drug_name": "Acetaminophen",
        "patient": sim_payload["patient"],
        "simulation_result": sim_res["prediction"],
        "chemical_properties": sim_res["chemical_properties"]
    }
    r = client.post("/api/reports/generate", json=report_payload)
    assert r.status_code == 200, f"Report generation failed: {r.status_code}"
    rep_res = r.json()
    assert "download_url" in rep_res, "Missing download URL"
    print(f"[OK] PDF Report Generated: {rep_res['filename']}")
    
    # 9. Download PDF
    r_pdf = client.get(rep_res["download_url"])
    assert r_pdf.status_code == 200, f"PDF download failed: {r_pdf.status_code}"
    assert r_pdf.headers["content-type"] == "application/pdf"
    print(f"[OK] PDF File Download Verified (Size: {len(r_pdf.content)} bytes)")

    # 10. 3D Anatomy Organs & Systems
    r = client.get("/api/anatomy/organs")
    assert r.status_code == 200
    assert len(r.json()["organs"]) == 9, "Expected 9 major organs"
    print(f"[OK] Anatomy Organs Verified: {len(r.json()['organs'])} major organs indexed")

    r = client.get("/api/anatomy/systems")
    assert r.status_code == 200
    assert len(r.json()["systems"]) == 8, "Expected 8 biological systems"
    print(f"[OK] Biological Systems Verified: {len(r.json()['systems'])} systems mapped")

    # 11. Organ Evidence & 6-Color Disturbance Classification
    r = client.get("/api/anatomy/drug/Acetaminophen/evidence")
    assert r.status_code == 200
    organs = r.json()["organs"]
    liver = next((o for o in organs if o["organ_id"] == "liver"), None)
    assert liver is not None and liver["status"] == "red"
    print(f"[OK] Organ Evidence Verified: Liver status = '{liver['status']}', Category: '{liver['effect_category']}'")

    # 12. 6-Stage Animated Drug Journey Timeline
    r = client.post("/api/anatomy/drug-journey", json={"drug_name": "Acetaminophen", "route": "Oral"})
    assert r.status_code == 200
    journey = r.json()
    assert journey["total_stages"] == 6, "Expected 6 stages in Drug Journey"
    print(f"[OK] Drug Journey Verified: 6 stages from '{journey['stages'][0]['title']}' to '{journey['stages'][5]['title']}'")

    # 13. Smart Medicine Calendar & Adherence Tracking
    r = client.get("/api/calendar")
    assert r.status_code == 200
    cal = r.json()
    assert "adherence_statistics" in cal
    print(f"[OK] Smart Calendar Verified: Adherence = {cal['adherence_statistics']['rate_percentage']}%, Active Reminders = {len(cal['reminders'])}")

    # 14. Multi-Drug Interaction Checking
    r = client.post("/api/drugs/interactions", json={"drugs": ["Warfarin", "Aspirin"]})
    assert r.status_code == 200
    interactions = r.json()
    assert interactions["total_pairs_evaluated"] >= 1
    assert interactions["interactions"][0]["severity"] == "Major"
    print(f"[OK] Drug Interaction Checker: Warfarin + Aspirin = '{interactions['interactions'][0]['severity']}' ({interactions['interactions'][0]['title']})")

    # 15. Grounded RAG AI Assistant
    r = client.post("/api/assistant/query", json={"query": "What is Paracetamol used for?", "mode": "general"})
    assert r.status_code == 200
    assert not r.json()["is_emergency"]
    print(f"[OK] AI Medicine Guide Verified: Detected '{r.json()['detected_drug']}', Citations: {len(r.json()['citations'])}")

    # 16. Indian Medicine Registry (ABDM / CDSCO)
    r = client.get("/api/drugs/indian/search?q=Dolo")
    assert r.status_code == 200
    indian_res = r.json()["results"]
    assert len(indian_res) > 0
    print(f"[OK] Indian Medicine Registry: Found '{indian_res[0]['generic_name']}' with {len(indian_res[0]['brands_full'])} commercial formulations")

    print("\n" + "=" * 65)
    print("  ALL 16 AUTOMATED END-TO-END VERIFICATION CHECKS PASSED!")
    print("=" * 65)


if __name__ == "__main__":
    test_api()
