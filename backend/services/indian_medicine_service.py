"""
MediSim AI - Indian Medicine Information Service (ABDM / CDSCO Integration)
Author: Team BioNex - VIT Bhopal University
Purpose: Maps generic molecules to approved Indian brand names, CDSCO regulatory approvals,
         Schedule H/H1 warning categories, and standard clinical indications.
"""

from typing import Dict, List, Optional, Any

# Knowledgebase of common Indian pharmaceutical formulations mapped to generic active ingredients
INDIAN_DRUG_REGISTRY = {
    "acetaminophen": {
        "generic_name": "Paracetamol (Acetaminophen)",
        "abdm_id": "ABDM-MED-001983",
        "cdsco_status": "Approved by CDSCO (Central Drugs Standard Control Organisation)",
        "schedule": "Over-The-Counter (OTC) / Non-Scheduled for standard oral strengths",
        "common_brands": [
            {"brand": "Dolo 650", "manufacturer": "Micro Labs Ltd.", "strength": "650 mg", "form": "Tablet"},
            {"brand": "Calpol 500/650", "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd.", "strength": "500 mg / 650 mg", "form": "Tablet"},
            {"brand": "Crocin Advance", "manufacturer": "Haleon India", "strength": "500 mg", "form": "Tablet"},
            {"brand": "Pacimol", "manufacturer": "Ipca Laboratories Ltd.", "strength": "650 mg", "form": "Tablet"}
        ],
        "approved_indications": "Analgesic and antipyretic for mild to moderate pain and pyrexia.",
        "cdsco_warnings": "Warning: Taking more than daily dose of 4000 mg may cause serious liver damage or allergic reactions (swelling of face, mouth, throat, difficulty in breathing).",
        "storage": "Store below 25°C in a dry place protected from direct sunlight."
    },
    "paracetamol": {
        "generic_name": "Paracetamol (Acetaminophen)",
        "abdm_id": "ABDM-MED-001983",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "OTC / Non-Scheduled",
        "common_brands": [
            {"brand": "Dolo 650", "manufacturer": "Micro Labs Ltd.", "strength": "650 mg", "form": "Tablet"},
            {"brand": "Calpol", "manufacturer": "GSK India", "strength": "500/650 mg", "form": "Tablet"},
            {"brand": "Crocin", "manufacturer": "Haleon", "strength": "500 mg", "form": "Tablet"}
        ],
        "approved_indications": "Pain relief, fever reduction.",
        "cdsco_warnings": "Exceeding daily dose of 4g may cause severe liver injury.",
        "storage": "Store below 25°C."
    },
    "metformin": {
        "generic_name": "Metformin Hydrochloride",
        "abdm_id": "ABDM-MED-004091",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H Prescription Drug (Warning: To be sold by retail on prescription of a Registered Medical Practitioner only)",
        "common_brands": [
            {"brand": "Glycomet 500/850/1000", "manufacturer": "USV Pvt. Ltd.", "strength": "500 mg / 1000 mg SR", "form": "Sustained Release Tablet"},
            {"brand": "Gluconorm", "manufacturer": "Lupin Ltd.", "strength": "500 mg", "form": "Tablet"},
            {"brand": "Obimet", "manufacturer": "Abbott India Ltd.", "strength": "500 mg SR", "form": "Tablet"}
        ],
        "approved_indications": "First-line oral antihyperglycemic for Type 2 Diabetes Mellitus management.",
        "cdsco_warnings": "Schedule H: Caution in renal impairment (eGFR < 30 mL/min). Risk of rare but severe lactic acidosis.",
        "storage": "Store in a cool and dry place."
    },
    "atorvastatin": {
        "generic_name": "Atorvastatin Calcium",
        "abdm_id": "ABDM-MED-060823",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H Prescription Drug",
        "common_brands": [
            {"brand": "Atorva 10/20/40", "manufacturer": "Zydus Lifesciences Ltd.", "strength": "10 mg / 20 mg", "form": "Film-coated Tablet"},
            {"brand": "Storvas 10/20", "manufacturer": "Sun Pharmaceutical Industries Ltd.", "strength": "10 mg / 20 mg", "form": "Tablet"},
            {"brand": "Lipivas", "manufacturer": "Cipla Ltd.", "strength": "10 mg", "form": "Tablet"}
        ],
        "approved_indications": "Primary hypercholesterolemia, prevention of cardiovascular events in high-risk patients.",
        "cdsco_warnings": "Schedule H: Periodic liver enzyme testing recommended. Advise patient to promptly report unexplained muscle pain or weakness (rhabdomyolysis risk).",
        "storage": "Protect from moisture and heat."
    },
    "azithromycin": {
        "generic_name": "Azithromycin",
        "abdm_id": "ABDM-MED-044704",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H1 Prescription Drug (Strict warning: Dangerous to take without medical supervision. Drug Dispensation register mandatory).",
        "common_brands": [
            {"brand": "Azithral 500", "manufacturer": "Alembic Pharmaceuticals Ltd.", "strength": "500 mg", "form": "Tablet"},
            {"brand": "Azee 500", "manufacturer": "Cipla Ltd.", "strength": "500 mg", "form": "Tablet"},
            {"brand": "Zithrox 500", "manufacturer": "Mankind Pharma Ltd.", "strength": "500 mg", "form": "Tablet"}
        ],
        "approved_indications": "Macrolide antibiotic for upper and lower respiratory tract infections, skin infections.",
        "cdsco_warnings": "Schedule H1: Complete the prescribed course to prevent antimicrobial resistance. Caution in patients with QT prolongation.",
        "storage": "Store protected from light and moisture at a temperature not exceeding 30°C."
    },
    "amoxicillin": {
        "generic_name": "Amoxicillin and Potassium Clavulanate",
        "abdm_id": "ABDM-MED-033652",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H1 Prescription Drug",
        "common_brands": [
            {"brand": "Augmentin 625 Duo", "manufacturer": "GlaxoSmithKline Pharmaceuticals Ltd.", "strength": "500 mg + 125 mg", "form": "Tablet"},
            {"brand": "Moxikind-CV 625", "manufacturer": "Mankind Pharma Ltd.", "strength": "500 mg + 125 mg", "form": "Tablet"},
            {"brand": "Clavam 625", "manufacturer": "Alkem Laboratories Ltd.", "strength": "500 mg + 125 mg", "form": "Tablet"}
        ],
        "approved_indications": "Beta-lactamase producing bacterial infections of the respiratory tract, ENT, skin, and soft tissue.",
        "cdsco_warnings": "Schedule H1: Risk of cholestatic jaundice / hepatic dysfunction. Contraindicated in penicillin allergy.",
        "storage": "Store in a cool, dry place. Keep desiccants in container."
    },
    "pantoprazole": {
        "generic_name": "Pantoprazole Sodium",
        "abdm_id": "ABDM-MED-046790",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H Prescription Drug",
        "common_brands": [
            {"brand": "Pan 40", "manufacturer": "Alkem Laboratories Ltd.", "strength": "40 mg", "form": "Gastro-resistant Tablet"},
            {"brand": "Pantocid 40", "manufacturer": "Sun Pharmaceutical Industries Ltd.", "strength": "40 mg", "form": "Tablet"},
            {"brand": "Pan-D (with Domperidone)", "manufacturer": "Alkem Laboratories Ltd.", "strength": "40 mg + 30 mg", "form": "Capsule"}
        ],
        "approved_indications": "Gastroesophageal reflux disease (GERD), peptic ulcer disease, acid-peptic disorders.",
        "cdsco_warnings": "Schedule H: Best taken before breakfast. Long-term use (>1 year) may reduce magnesium and vitamin B12 absorption.",
        "storage": "Store below 25°C."
    },
    "ibuprofen": {
        "generic_name": "Ibuprofen",
        "abdm_id": "ABDM-MED-003672",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H / OTC in lower pediatric formulations",
        "common_brands": [
            {"brand": "Brufen 400", "manufacturer": "Abbott India Ltd.", "strength": "400 mg", "form": "Tablet"},
            {"brand": "Combiflam (with Paracetamol)", "manufacturer": "Sanofi India Ltd.", "strength": "400 mg + 325 mg", "form": "Tablet"},
            {"brand": "Ibugesic", "manufacturer": "Cipla Ltd.", "strength": "400 mg", "form": "Tablet"}
        ],
        "approved_indications": "NSAID for pain, inflammation, rheumatoid arthritis, osteoarthritis, dysmenorrhea.",
        "cdsco_warnings": "Schedule H: Always take with food to minimize GI ulceration risk. Caution in cardiovascular and renal disease.",
        "storage": "Store protected from moisture and light."
    },
    "warfarin": {
        "generic_name": "Warfarin Sodium",
        "abdm_id": "ABDM-MED-005467",
        "cdsco_status": "Approved by CDSCO",
        "schedule": "Schedule H Prescription Drug - Narrow Therapeutic Index",
        "common_brands": [
            {"brand": "Warf 1/2/5", "manufacturer": "Cipla Ltd.", "strength": "1 mg / 2 mg / 5 mg", "form": "Tablet"},
            {"brand": "Uniwarf", "manufacturer": "Unichem Laboratories Ltd.", "strength": "5 mg", "form": "Tablet"}
        ],
        "approved_indications": "Prophylaxis and treatment of venous thromboembolism, pulmonary embolism, atrial fibrillation.",
        "cdsco_warnings": "Schedule H: Boxed Warning for major or fatal bleeding. Mandatory INR monitoring. Highly sensitive to CYP2C9 and VKORC1 genetic variants.",
        "storage": "Store at 20°C to 25°C."
    }
}


def search_indian_medicines(query: str) -> List[Dict[str, Any]]:
    """Search by Indian brand name or generic active substance."""
    query_clean = query.strip().lower()
    matches = []
    
    for key, data in INDIAN_DRUG_REGISTRY.items():
        matched = False
        # Match generic name
        if query_clean in key or query_clean in data["generic_name"].lower():
            matched = True
        # Match common brand names
        for b in data["common_brands"]:
            if query_clean in b["brand"].lower():
                matched = True
                break
                
        if matched:
            matches.append({
                "generic_key": key,
                "generic_name": data["generic_name"],
                "abdm_id": data["abdm_id"],
                "cdsco_status": data["cdsco_status"],
                "schedule": data["schedule"],
                "brands_sample": [b["brand"] for b in data["common_brands"]],
                "brands_full": data["common_brands"],
                "approved_indications": data["approved_indications"],
                "cdsco_warnings": data["cdsco_warnings"]
            })
            
    return matches


def get_indian_medicine_details(drug_name: str) -> Optional[Dict[str, Any]]:
    """Get full Indian regulatory and commercial brand details."""
    key = drug_name.strip().lower()
    for k, v in INDIAN_DRUG_REGISTRY.items():
        if k in key or key in k:
            return v
        for b in v["common_brands"]:
            if key in b["brand"].lower() or b["brand"].lower() in key:
                return v
    return None
