# MediSim AI – Dual-Platform Drug Response Simulation & 3D Anatomy Platform

> **Project Title:** AI-Powered Drug Response Simulation and Interactive Human Body Visualization  
> **Tagline:** *Understand the Medicine. Visualize Its Effects. Explore the Science.*  
> **Project Category:** Predictive and Preventive Health Intelligence  
> **Team:** BioNex – VIT Bhopal University  
> **Operational Status:** `REAL_MODEL_MODE` (Trained Supervised ML Weights Active)

---

## 1. Executive Summary & Overview

**MediSim AI** is a comprehensive, scientific, AI-powered healthcare web application engineered to bridge the gap between complex biomedical data and intuitive visual understanding. The platform provides **two distinct experiences** via a seamless top-bar platform switcher:

1. **General User Platform:** For patients, caregivers, and everyday users who want clear, plain-language medicine guides, commercial Indian brand information (e.g. Dolo 650, Glycomet, Storvas), an interactive **3D Animated Human Body Drug Journey**, a **Smart Medicine Calendar** for dose tracking (**Taken**, **Skipped**, **Missed**), medication reminders, a **Multi-Drug Interaction Checker**, and an **AI Medicine Guide**.
2. **Researcher Platform:** For biomedical researchers, pharmacologists, and medical students seeking deep molecular exploration (PubChem 2D topology, SMILES, InChIKey), **FDA DILIrank 2.0 supervised XGBoost models**, mathematical **Tree SHAP waterfalls**, **LINCS L1000 cellular transcriptomics (PCA & K-Means clustering)**, **openFDA FAERS disproportionality signals (PRR/ROR)**, and a **Research AI Assistant**.

---

## 2. Core Capabilities & Feature Highlights

### 🧍 Signature Feature: Interactive 3D Human Body Simulator
- **Interactive Three.js 3D Engine:** Orbit controls (rotate, zoom, pan) with 9 major selectable organs (**Brain**, **Heart**, **Lungs**, **Liver**, **Stomach**, **Pancreas**, **Intestines**, **Kidneys**, **Skin**) inside a translucent human silhouette with active bloodstream particle streaming.
- **6-Stage Animated Drug Journey:** Educational visualization of the pharmacokinetic sequence:
  - *Stage 1 (Entry)* $\rightarrow$ *Stage 2 (Absorption)* $\rightarrow$ *Stage 3 (Distribution)* $\rightarrow$ *Stage 4 (Metabolism)* $\rightarrow$ *Stage 5 (Elimination)* $\rightarrow$ *Stage 6 (Biological Effects)*.
  - Full timeline controller: Play, Pause, Replay, Step Next, Step Prev, Speed selection (`0.5x`, `1x`, `2x`), and Reset.
  - Honest gap disclosure: *"Detailed pathway information is currently unavailable"* when literature lacks specific kinetics.
- **Scientific 6-Color Disturbance Classification:**
  - 🔵 Blue: Selected organ
  - 🟢 Green: Normal educational view
  - 🟡 Yellow: Precautionary evidence or biological response
  - 🟠 Orange: Documented adverse-effect or toxicity evidence
  - 🔴 Red: Serious safety warning or boxed warning
  - ⚪ Grey: Baseline or insufficient organ-specific data
- **Organ Evidence Overlay:** Detailed physiological function, metabolic role, mechanism, biomarkers, citations, and non-diagnostic disclaimer: *"These findings do not establish that this medicine is damaging the user's organ."*
- **2D Vector Fallback:** Instant toggle switch between 3D WebGL and 2D SVG rendering for low-power or mobile devices.

### 📅 Smart Medicine Calendar & Reminders (General User)
- Day, Week, and Month schedule views.
- Daily dose tracker with instant status updates: **Taken**, **Skipped**, **Missed**.
- Self-reported adherence rate percentage calculation.
- Add Prescribed Medication Schedule modal (dosage, frequency, times, food timing, doctor).
- Mandatory missed-dose rule: *"Never take a double dose to make up for a missed dose."*

### ⚠️ Multi-Drug Interaction Checker
- Evaluate 2 or more medicines simultaneously.
- Pairwise interaction checking: Severity (**Major**, **Moderate**, **Minor**, **No Documented Interaction**), molecular mechanism, and clinical management.
- Mandatory disclaimer: *"Absence of a documented interaction does not guarantee that a medicine combination is safe."*

### 🤖 Grounded RAG AI Medicine Guide & Research Assistant
- Dual response modes:
  - **General Mode:** Simple language, precautions, warnings, when to see a doctor.
  - **Researcher Mode:** Molecular targets, CYP450 enzyme clearance, receptor affinities, dataset citations.
- Grounded in official FDA labels, PubChem, CPIC, and CDSCO datasets.
- Emergency keyword triage: Refers critical symptoms directly to emergency medical care.

### 🇮🇳 Indian Medicine Registry (ABDM / CDSCO Integration)
- Maps generic compounds to common Indian pharmaceutical brand names (e.g., Paracetamol $\rightarrow$ Dolo 650, Calpol; Metformin $\rightarrow$ Glycomet; Atorvastatin $\rightarrow$ Storvas; Azithromycin $\rightarrow$ Azithral; Amoxicillin/Clavulanate $\rightarrow$ Augmentin).
- Includes CDSCO regulatory approvals, Schedule H / H1 prescription warnings, and approved indications.

### 🔬 Machine Learning & Explainable AI (Researcher Platform)
- **FDA DILIrank 2.0 Multi-Class XGBoost Model:** Stratified holdout evaluation: **Weighted F1: 0.6325**, **ROC-AUC: 0.7468**.
- **Tree SHAP Explainability:** Exact mathematical local waterfall bar contributions and global feature rankings (`reactive_metabolite`, `logp`, `daily_dose_mg`).
- **LINCS L1000 Phase II Cellular Transcriptomics:** 10 landmark genes (`TP53`, `CASP3`, `HMOX1`, etc.) with 3-component PCA explaining **97.99% cumulative variance** and K-Means phenotypic stress clustering.

---

## 3. Quickstart & How to Run

### Method 1: One-Click Unified Launcher (Recommended)
```powershell
# From project root:
.\venv\Scripts\python.exe run_medisim.py
```
Starts both the FastAPI backend and React frontend simultaneously.

### Method 2: Individual Windows Batch Files
- Double-click `start_backend.bat` (Starts FastAPI on `http://127.0.0.1:8000`)
- Double-click `start_frontend.bat` (Starts React on `http://localhost:5173`)

### Method 3: Manual Terminal Execution
```powershell
# Terminal 1 - Backend:
.\venv\Scripts\python.exe -m uvicorn backend.main:app --host 127.0.0.1 --port 8000 --reload

# Terminal 2 - Frontend:
cd frontend
npm run dev
```

---

## 4. Accessing the Application

| Interface | URL | Description |
| :--- | :--- | :--- |
| **Web Application** | **[http://localhost:5173](http://localhost:5173)** | Complete interactive platform (Dual-Platform, 3D Anatomy, Calendar) |
| **FastAPI Interactive Docs** | **[http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)** | Swagger UI testing all REST endpoints |
| **Model Status & Health** | **[http://127.0.0.1:8000/api/models/status](http://127.0.0.1:8000/api/models/status)** | Confirms `REAL_MODEL_MODE` status |

---

## 5. Automated Verification & Testing

MediSim AI includes a complete automated test suite verifying all 16 endpoints:

```powershell
# Run the 16-test automated verification suite:
.\venv\Scripts\python.exe test_e2e_api.py
```

### Verification Results (16 / 16 Passed)
- `[OK]` Root health & platform identity
- `[OK]` Live PubChem API drug search & caching
- `[OK]` Compound physicochemical descriptors & CPIC guidelines
- `[OK]` openFDA structured labeling & FAERS adverse reaction PRR/ROR signals
- `[OK]` Multi-class XGBoost liver toxicity simulation with real SHAP attribution
- `[OK]` LINCS L1000 cellular perturbation & K-Means cluster assignment
- `[OK]` Live model status and JSON metrics verification
- `[OK]` Dynamic ReportLab PDF report generation
- `[OK]` Direct PDF streaming download
- `[OK]` 3D Anatomy 9 major organs indexing
- `[OK]` 8 biological systems mapping
- `[OK]` Organ evidence & 6-color disturbance classification
- `[OK]` 6-stage animated Drug Journey timeline
- `[OK]` Smart Medicine Calendar & adherence tracking
- `[OK]` Multi-drug interaction checking with severity ratings
- `[OK]` Grounded RAG AI Medicine Guide with citations
- `[OK]` Indian Medicine Registry (ABDM / CDSCO brand mapping)

---

## 6. Team Attribution & License

- **Project Title:** AI-Powered Drug Response Simulation and Interactive Human Body Visualization
- **Application Name:** MediSim AI
- **Tagline:** *Understand the Medicine. Visualize Its Effects. Explore the Science.*
- **Team:** **BioNex** – VIT Bhopal University
- **Category:** Predictive and Preventive Health Intelligence
- **License:** MIT License (Research & Educational Use)
