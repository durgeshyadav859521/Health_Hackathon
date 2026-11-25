"""
MediSim AI - PubChem REST API Scientific Integration
Author: Team BioNex - VIT Bhopal University
Purpose: Query live chemical structures, physicochemical properties, and CIDs from NCBI PubChem.
"""

import requests
import json
from typing import Dict, Any, Optional

PUBCHEM_BASE_URL = "https://pubchem.ncbi.nlm.nih.gov/rest/pug"

# Scientific fallback directory for fast deterministic responses & offline reliability
FALLBACK_CHEMICALS = {
    "acetaminophen": {
        "cid": 1983,
        "name": "Acetaminophen",
        "synonyms": ["Paracetamol", "Tylenol", "APAP", "4-Acetamidophenol"],
        "formula": "C8H9NO2",
        "mw": 151.16,
        "logp": 0.46,
        "tpsa": 49.33,
        "hbd": 2,
        "hba": 2,
        "rot_bonds": 1,
        "heavy_atoms": 11,
        "complexity": 135.0,
        "smiles": "CC(=O)NC1=CC=C(C=C1)O",
        "inchikey": "RZVAJINKPMORJF-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/1983/PNG",
        "source": "NCBI PubChem Compound (CID: 1983)"
    },
    "ibuprofen": {
        "cid": 3672,
        "name": "Ibuprofen",
        "synonyms": ["Advil", "Motrin", "Nurofen"],
        "formula": "C13H18O2",
        "mw": 206.28,
        "logp": 3.50,
        "tpsa": 37.30,
        "hbd": 1,
        "hba": 2,
        "rot_bonds": 3,
        "heavy_atoms": 15,
        "complexity": 218.0,
        "smiles": "CC(C)CC1=CC=C(C=C1)C(C)C(=O)O",
        "inchikey": "HEBAACUTVPCOAU-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/3672/PNG",
        "source": "NCBI PubChem Compound (CID: 3672)"
    },
    "amiodarone": {
        "cid": 2157,
        "name": "Amiodarone",
        "synonyms": ["Cordarone", "Pacerone"],
        "formula": "C25H29I2NO3",
        "mw": 645.31,
        "logp": 7.24,
        "tpsa": 38.77,
        "hbd": 0,
        "hba": 3,
        "rot_bonds": 11,
        "heavy_atoms": 31,
        "complexity": 579.0,
        "smiles": "CCCCC1=C(C2=CC=CC=C2O1)C(=O)C3=CC(=C(C(=C3)I)OCCN(CC)CC)I",
        "inchikey": "ITCLFONJEHQNRP-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/2157/PNG",
        "source": "NCBI PubChem Compound (CID: 2157)"
    },
    "atorvastatin": {
        "cid": 60823,
        "name": "Atorvastatin",
        "synonyms": ["Lipitor", "Sortis"],
        "formula": "C33H35FN2O5",
        "mw": 558.64,
        "logp": 5.70,
        "tpsa": 111.79,
        "hbd": 4,
        "hba": 5,
        "rot_bonds": 12,
        "heavy_atoms": 41,
        "complexity": 794.0,
        "smiles": "CC(C)C1=C(C(=C(N1CCC(CC(CC(=O)O)O)O)C2=CC=C(C=C2)F)C3=CC=CC=C3)C(=O)NC4=CC=CC=C4",
        "inchikey": "XGARUPNEQYKBRL-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/60823/PNG",
        "source": "NCBI PubChem Compound (CID: 60823)"
    },
    "metformin": {
        "cid": 4091,
        "name": "Metformin",
        "synonyms": ["Glucophage", "Fortamet"],
        "formula": "C4H11N5",
        "mw": 129.16,
        "logp": -1.43,
        "tpsa": 88.99,
        "hbd": 3,
        "hba": 4,
        "rot_bonds": 1,
        "heavy_atoms": 9,
        "complexity": 78.4,
        "smiles": "CN(C)C(=N)NC(=N)N",
        "inchikey": "XZBYSFZWGKVFAG-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/4091/PNG",
        "source": "NCBI PubChem Compound (CID: 4091)"
    },
    "ketoconazole": {
        "cid": 456201,
        "name": "Ketoconazole",
        "synonyms": ["Nizoral", "Extina"],
        "formula": "C26H28Cl2N4O4",
        "mw": 531.43,
        "logp": 4.35,
        "tpsa": 67.43,
        "hbd": 0,
        "hba": 6,
        "rot_bonds": 6,
        "heavy_atoms": 36,
        "complexity": 662.0,
        "smiles": "CC(=O)N1CCN(CC1)C2=CC=C(C=C2)OCC3COC(O3)(CN4C=CN=C4)C5=C(C=C(C=C5)Cl)Cl",
        "inchikey": "XMAYWYKXPZZBOM-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/456201/PNG",
        "source": "NCBI PubChem Compound (CID: 456201)"
    },
    "metoprolol": {
        "cid": 4171,
        "name": "Metoprolol",
        "synonyms": ["Lopressor", "Toprol-XL"],
        "formula": "C15H25NO3",
        "mw": 267.36,
        "logp": 1.88,
        "tpsa": 50.72,
        "hbd": 2,
        "hba": 4,
        "rot_bonds": 8,
        "heavy_atoms": 19,
        "complexity": 222.0,
        "smiles": "CC(C)NCC(COC1=CC=C(C=C1)CCOC)O",
        "inchikey": "IUBSYQTVCCXAEI-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/4171/PNG",
        "source": "NCBI PubChem Compound (CID: 4171)"
    },
    "warfarin": {
        "cid": 54678486,
        "name": "Warfarin",
        "synonyms": ["Coumadin", "Jantoven"],
        "formula": "C19H16O4",
        "mw": 308.33,
        "logp": 2.70,
        "tpsa": 67.51,
        "hbd": 1,
        "hba": 4,
        "rot_bonds": 4,
        "heavy_atoms": 23,
        "complexity": 444.0,
        "smiles": "CC(=O)CC(C1=CC=CC=C1)C2=C(C3=CC=CC=C3OC2=O)O",
        "inchikey": "PJVJTCIRVRBAPQ-UHFFFAOYSA-N",
        "structure_url": "https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/54678486/PNG",
        "source": "NCBI PubChem Compound (CID: 54678486)"
    }
}


def search_pubchem_compound(query: str) -> Optional[Dict[str, Any]]:
    """
    Searches PubChem for a chemical entity by query string (name, brand, or CID).
    Attempts live NCBI PUG REST API query, falling back gracefully to validated local data.
    """
    clean_q = query.strip().lower()
    
    # 1. Check verified local cache
    for key, data in FALLBACK_CHEMICALS.items():
        if clean_q == key or clean_q in key or any(clean_q == syn.lower() for syn in data["synonyms"]):
            return data
            
    # 2. Try live NCBI PubChem PUG REST API
    try:
        url = f"{PUBCHEM_BASE_URL}/compound/name/{requests.utils.quote(clean_q)}/property/MolecularFormula,MolecularWeight,XLogP,TPSA,Complexity,Charge,HBondDonorCount,HBondAcceptorCount,RotatableBondCount,HeavyAtomCount,CanonicalSMILES,InChIKey/JSON"
        resp = requests.get(url, timeout=4)
        if resp.status_code == 200:
            prop = resp.json()["PropertyTable"]["Properties"][0]
            cid = prop.get("CID")
            return {
                "cid": cid,
                "name": query.capitalize(),
                "synonyms": [query.capitalize()],
                "formula": prop.get("MolecularFormula", ""),
                "mw": float(prop.get("MolecularWeight", 0.0)),
                "logp": float(prop.get("XLogP", 0.0)),
                "tpsa": float(prop.get("TPSA", 0.0)),
                "hbd": int(prop.get("HBondDonorCount", 0)),
                "hba": int(prop.get("HBondAcceptorCount", 0)),
                "rot_bonds": int(prop.get("RotatableBondCount", 0)),
                "heavy_atoms": int(prop.get("HeavyAtomCount", 0)),
                "complexity": float(prop.get("Complexity", 0.0)),
                "smiles": prop.get("CanonicalSMILES", ""),
                "inchikey": prop.get("InChIKey", ""),
                "structure_url": f"https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/{cid}/PNG",
                "source": f"NCBI PubChem Live API (CID: {cid})"
            }
    except Exception as e:
        print(f"[!] Live PubChem query failed: {e}")
        
    return None


def get_all_supported_drugs():
    """Returns list of curated drugs ready for simulation and search exploration."""
    return list(FALLBACK_CHEMICALS.values())
