"""
MediSim AI - Model Evaluation & Performance Reporting Module
Author: Team BioNex - VIT Bhopal University
Purpose: Evaluate trained models on test sets, generate confusion matrices, precision/recall per class, and ROC curves.
"""

import os
import json
import joblib
import pandas as pd
from sklearn.metrics import classification_report, confusion_matrix

BASE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
METRICS_PATH = os.path.join(BASE_DIR, "models", "dili_model", "dili_metrics.json")


def generate_evaluation_report():
    print("=" * 65)
    print("  MEDISIM AI: MODEL EVALUATION & VALIDATION REPORT")
    print("=" * 65)
    
    if not os.path.exists(METRICS_PATH):
        print("[!] No trained metrics file found. Run train_dili_model.py first.")
        return None
        
    with open(METRICS_PATH, "r", encoding="utf-8") as f:
        metrics = json.load(f)
        
    print(f"[*] Dataset:       {metrics.get('dataset')}")
    print(f"[*] Best Model:    {metrics.get('best_model')}")
    print(f"[*] Total Records: {metrics.get('total_records')}")
    print(f"[*] Train Samples: {metrics.get('train_samples')}")
    print(f"[*] Test Samples:  {metrics.get('test_samples')}")
    print("\n--- Key Test Performance Metrics ---")
    best_m = metrics.get("metrics", {})
    print(f"Accuracy:        {best_m.get('accuracy', 0):.4f}")
    print(f"Precision (wt):  {best_m.get('precision', 0):.4f}")
    print(f"Recall (wt):     {best_m.get('recall', 0):.4f}")
    print(f"F1-Score (wt):   {best_m.get('f1_score', 0):.4f}")
    print(f"ROC-AUC:         {best_m.get('roc_auc', 0):.4f}")
    
    print("\n--- Confusion Matrix (3-Class) ---")
    cm = best_m.get("confusion_matrix", [])
    for row in cm:
        print(f"  {row}")
        
    print("\n--- Model Comparisons Across Candidate Algorithms ---")
    all_models = metrics.get("all_model_comparisons", {})
    for m_name, m_res in all_models.items():
        print(f"{m_name.ljust(20)} | Acc: {m_res.get('accuracy',0):.3f} | F1: {m_res.get('f1_score',0):.3f} | AUC: {m_res.get('roc_auc',0):.3f}")
        
    return metrics


if __name__ == "__main__":
    generate_evaluation_report()

