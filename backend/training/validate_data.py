"""
MediSim AI - Biomedical Data Quality & Integrity Validation
Author: Team BioNex - VIT Bhopal University
Purpose: Assert schema constraints, detect anomalies, and verify data integrity before model training.
"""

import os
import pandas as pd

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
PROCESSED_DIR = os.path.join(DATASETS_DIR, "processed")


def validate_dilirank():
    file_path = os.path.join(PROCESSED_DIR, "dilirank_processed.csv")
    print(f"[*] Validating DILIrank dataset: {file_path}")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Missing file: {file_path}")
        
    df = pd.read_csv(file_path)
    
    # 1. Null check
    null_counts = df.isnull().sum()
    if null_counts.any():
        print(f"[!] Warning: Null values found in columns:\n{null_counts[null_counts > 0]}")
    else:
        print("[âœ“] Zero null values detected across all features.")
        
    # 2. Check targets
    valid_targets = {0, 1, 2}
    actual_targets = set(df["target"].unique())
    assert actual_targets.issubset(valid_targets), f"Invalid targets found: {actual_targets}"
    print(f"[âœ“] Target classes verified: {df['target'].value_counts().to_dict()}")
    
    # 3. Check physical ranges
    assert (df["mw"] > 0).all(), "Molecular weights must be positive"
    assert (df["tpsa"] >= 0).all(), "TPSA must be non-negative"
    print(f"[âœ“] Physicochemical ranges verified. Total verified records: {len(df)}")
    return True


def validate_lincs():
    file_path = os.path.join(PROCESSED_DIR, "lincs_processed.csv")
    print(f"[*] Validating LINCS L1000 dataset: {file_path}")
    if not os.path.exists(file_path):
        raise FileNotFoundError(f"Missing file: {file_path}")
        
    df = pd.read_csv(file_path)
    landmark_genes = ["TP53", "CASP3", "CDKN1A", "TNF", "HMOX1", "CYP3A4", "SOD1", "AKT1", "MTOR", "IL6"]
    
    for g in landmark_genes:
        assert g in df.columns, f"Missing landmark gene: {g}"
        
    print(f"[âœ“] Landmark genes verified ({len(landmark_genes)} genes). Total records: {len(df)}")
    return True


if __name__ == "__main__":
    validate_dilirank()
    validate_lincs()
    print("\n[SUCCESS] All datasets passed data integrity validation.")

