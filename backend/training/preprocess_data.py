"""
MediSim AI - Biomedical Data Preprocessing Pipeline
Author: Team BioNex - VIT Bhopal University
Purpose: Clean, normalize, and extract verified physicochemical & biological features.
"""

import os
import json
import numpy as np
import pandas as pd

DATASETS_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "datasets"))
RAW_DIR = os.path.join(DATASETS_DIR, "raw")
PROCESSED_DIR = os.path.join(DATASETS_DIR, "processed")


def preprocess_dilirank():
    """
    Cleans FDA DILIrank 2.0 dataset, maps regulatory classifications to numeric targets,
    and computes scientifically validated molecular descriptors and pharmacokinetic indices.
    """
    raw_path = os.path.join(RAW_DIR, "dilirank_raw.csv")
    out_path = os.path.join(PROCESSED_DIR, "dilirank_processed.csv")
    
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw dataset not found at {raw_path}. Run download_data.py first.")
        
    print(f"[*] Preprocessing FDA DILIrank 2.0 dataset from {raw_path}...")
    df = pd.read_csv(raw_path)
    
    # 1. Deduplication and null check
    df = df.drop_duplicates(subset=["drug_name", "cid"])
    df = df.dropna(subset=["dili_class", "mw", "logp", "tpsa"])
    
    # 2. Label encoding: 0 = No DILI, 1 = Less DILI, 2 = Most DILI
    class_mapping = {
        "v-No-DILI-concern": 0,
        "v-Less-DILI-concern": 1,
        "v-Most-DILI-concern": 2
    }
    df["target"] = df["dili_class"].map(class_mapping)
    df = df.dropna(subset=["target"])
    df["target"] = df["target"].astype(int)
    
    # Binary classification target (0 = No Concern, 1 = Concern [Less + Most])
    df["target_binary"] = (df["target"] > 0).astype(int)
    
    # 3. Scientific Feature Engineering
    # FDA LTKB "Rule of 2": High daily dose (>= 100 mg) AND High lipophilicity (LogP >= 3.0)
    df["rule_of_two"] = ((df["daily_dose_mg"] >= 100) & (df["logp"] >= 3.0)).astype(int)
    
    # Log-transformed daily dose exposure metric
    df["log_dose"] = np.log10(df["daily_dose_mg"] + 1.0)
    
    # Lipophilicity to polar surface area ratio
    df["logp_tpsa_ratio"] = df["logp"] / (df["tpsa"] + 1.0)
    
    # Polar surface area fraction of molecular mass
    df["tpsa_mw_ratio"] = df["tpsa"] / (df["mw"] + 1.0)
    
    # Molecular complexity proxy: hydrogen bonding balance
    df["hb_total"] = df["hbd"] + df["hba"]
    
    df.to_csv(out_path, index=False)
    print(f"[âœ“] Processed DILIrank saved to {out_path} ({len(df)} records, {len(df.columns)} features)")
    return df


def preprocess_lincs():
    """
    Cleans LINCS L1000 experimental gene expression perturbation records.
    Calculates composite biological pathway stress indices.
    """
    raw_path = os.path.join(RAW_DIR, "lincs_raw.csv")
    out_path = os.path.join(PROCESSED_DIR, "lincs_processed.csv")
    
    if not os.path.exists(raw_path):
        raise FileNotFoundError(f"Raw LINCS dataset not found at {raw_path}. Run download_data.py first.")
        
    print(f"[*] Preprocessing LINCS L1000 dataset from {raw_path}...")
    df = pd.read_csv(raw_path)
    
    landmark_genes = ["TP53", "CASP3", "CDKN1A", "TNF", "HMOX1", "CYP3A4", "SOD1", "AKT1", "MTOR", "IL6"]
    
    # Mean transcriptional absolute perturbation (Z-score magnitude)
    df["mean_perturbation"] = df[landmark_genes].abs().mean(axis=1)
    
    # Pro-apoptotic / DNA damage signature score: (TP53 + CASP3 + CDKN1A) / 3
    df["apoptotic_dna_stress"] = (df["TP53"] + df["CASP3"] + df["CDKN1A"]) / 3.0
    
    # Antioxidant / inflammatory response balance: HMOX1 - SOD1 + TNF + IL6
    df["oxidative_inflammatory_index"] = (df["HMOX1"] - df["SOD1"] + df["TNF"] + df["IL6"]) / 4.0
    
    # Cell line one-hot encoding
    df = pd.get_dummies(df, columns=["cell_line"], prefix="cell", drop_first=False)
    
    df.to_csv(out_path, index=False)
    print(f"[âœ“] Processed LINCS L1000 saved to {out_path} ({len(df)} records)")
    return df


if __name__ == "__main__":
    preprocess_dilirank()
    preprocess_lincs()
    print("\n[SUCCESS] Preprocessing completed.")

