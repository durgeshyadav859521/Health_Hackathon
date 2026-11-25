"""
MediSim AI - Organ-Drug Evidence Mapping Service & 3D Anatomy Simulator
Author: Team BioNex - VIT Bhopal University
Purpose: Connects pharmacological compounds to 9 major organs and 8 biological systems,
         evaluates 6-stage animated Drug Journey timelines, and provides evidence-backed
         color classifications (Blue, Green, Yellow, Orange, Red, Grey) with strict scientific honesty.
"""

from typing import Dict, List, Optional, Any

# Anatomical definition of the 9 major organs
MAJOR_ORGANS = [
    {
        "id": "brain",
        "name": "Brain",
        "system": "Nervous System",
        "position": [0.0, 1.75, 0.0],
        "basic_function": "Central regulatory hub for cognition, autonomic functions, neuroendocrine signaling, and sensory processing.",
        "metabolic_role": "Protected by Blood-Brain Barrier (BBB); contains localized CYP2D6/CYP2E1 enzymes that metabolize lipophilic psychoactive compounds."
    },
    {
        "id": "heart",
        "name": "Heart",
        "system": "Cardiovascular System",
        "position": [0.15, 1.25, 0.1],
        "basic_function": "Muscular pump circulating blood, oxygen, and nutrients throughout systemic and pulmonary arterial networks.",
        "metabolic_role": "Primary target for inotropic/chronotropic drugs; susceptible to hERG potassium channel blockade causing QT prolongation."
    },
    {
        "id": "lungs",
        "name": "Lungs",
        "system": "Respiratory System",
        "position": [-0.2, 1.25, 0.05],
        "basic_function": "Gas exchange interface extracting oxygen into alveolar capillaries and eliminating carbon dioxide.",
        "metabolic_role": "Site of pulmonary first-pass extraction; contains CYP1A1/CYP2E1; susceptible to drug-induced pneumonitis and fibrotic remodeling."
    },
    {
        "id": "liver",
        "name": "Liver",
        "system": "Digestive & Metabolic System",
        "position": [-0.25, 0.95, 0.15],
        "basic_function": "Primary biochemical clearinghouse orchestrating glycogen storage, plasma protein synthesis, and xenobiotic detoxification.",
        "metabolic_role": "Major site of Phase I (CYP450 oxidation/reduction) and Phase II (glucuronidation, sulfation, glutathione conjugation) drug metabolism."
    },
    {
        "id": "stomach",
        "name": "Stomach",
        "system": "Digestive System",
        "position": [0.2, 0.95, 0.12],
        "basic_function": "Acidic reservoir (pH 1.5 - 3.5) initiating mechanical churning and enzymatic digestion of ingested matter.",
        "metabolic_role": "Site of gastric absorption for non-ionized acidic drugs (e.g., aspirin); vulnerable to prostaglandin inhibition by NSAIDs."
    },
    {
        "id": "pancreas",
        "name": "Pancreas",
        "system": "Endocrine & Digestive System",
        "position": [0.05, 0.85, 0.05],
        "basic_function": "Dual-function glandular organ secreting digestive enzymes (exocrine) and insulin/glucagon (endocrine).",
        "metabolic_role": "Regulates glucose homeostasis; vulnerable to rare drug-induced pancreatitis (e.g., azathioprine, valproate, GLP-1 agonists)."
    },
    {
        "id": "intestines",
        "name": "Intestines",
        "system": "Digestive System",
        "position": [0.0, 0.65, 0.15],
        "basic_function": "Massive mucosal surface area (duodenum, jejunum, ileum, colon) executing nutrient absorption and waste compaction.",
        "metabolic_role": "Primary site of oral drug absorption; high expression of CYP3A4 and P-glycoprotein (ABCB1) efflux transporters."
    },
    {
        "id": "kidneys",
        "name": "Kidneys",
        "system": "Urinary System",
        "position": [0.2, 0.75, -0.1],
        "basic_function": "Paired retroperitoneal organs filtering blood, regulating arterial pressure, osmolarity, and acid-base equilibrium.",
        "metabolic_role": "Primary organ of hydrophilic drug elimination via glomerular filtration, active tubular secretion (OAT/OCT), and reabsorption."
    },
    {
        "id": "skin",
        "name": "Skin",
        "system": "Integumentary & Immune System",
        "position": [0.0, 1.0, 0.3],
        "basic_function": "Body's largest barrier organ defending against pathogens, chemical insults, and preventing fluid desiccation.",
        "metabolic_role": "Minor localized metabolic activity; sentinel site for drug hypersensitivity reactions (DRESS, Stevens-Johnson syndrome, urticaria)."
    }
]

BIOLOGICAL_SYSTEMS = [
    {"id": "nervous", "name": "Nervous System", "key_organs": ["brain", "spinal_cord"], "color": "#818cf8"},
    {"id": "cardiovascular", "name": "Cardiovascular System", "key_organs": ["heart", "blood_vessels"], "color": "#f87171"},
    {"id": "respiratory", "name": "Respiratory System", "key_organs": ["lungs", "trachea"], "color": "#38bdf8"},
    {"id": "digestive", "name": "Digestive System", "key_organs": ["stomach", "intestines", "liver", "pancreas"], "color": "#fbbf24"},
    {"id": "urinary", "name": "Urinary System", "key_organs": ["kidneys", "bladder"], "color": "#34d399"},
    {"id": "endocrine", "name": "Endocrine System", "key_organs": ["pancreas", "thyroid", "adrenal"], "color": "#c084fc"},
    {"id": "musculoskeletal", "name": "Musculoskeletal System", "key_organs": ["muscles", "bones"], "color": "#fb923c"},
    {"id": "immune", "name": "Blood & Immune System", "key_organs": ["skin", "bone_marrow", "spleen"], "color": "#f472b6"}
]

# Curated evidence matrix for benchmark compounds mapped across organs
DRUG_ORGAN_EVIDENCE_MAP = {
    "acetaminophen": {
        "liver": {
            "status": "red",
            "effect_category": "Hepatotoxicity Risk / Boxed Warning",
            "mechanism": "At supratherapeutic doses, saturation of glucuronidation/sulfation pathways shunts metabolism through CYP2E1, forming reactive electrophile N-acetyl-p-benzoquinone imine (NAPQI). Depletion of hepatic glutathione (GSH) causes mitochondrial protein adduct formation and centrilobular necrosis.",
            "evidence_source": "FDA DILIrank 2.0 (v-Most-DILI-concern) & openFDA SPL Boxed Warning",
            "evidence_type": "Established Clinical & Mechanistic Evidence",
            "biomarkers": ["Serum ALT", "Serum AST", "Total Bilirubin", "Prothrombin Time / INR"],
            "limitations": "These findings reflect population-level toxicological risks and boxed warnings. They do not establish that this medicine is causing liver injury in an individual patient taking recommended therapeutic doses."
        },
        "kidneys": {
            "status": "yellow",
            "effect_category": "Renal Clearance & Precautionary Evidence",
            "mechanism": "Normal therapeutic elimination occurs predominantly (>90%) via renal clearance of inactive glucuronide and sulfate metabolites. Massive acute overdose can cause acute tubular necrosis via localized renal prostaglandin synthase co-oxidation.",
            "evidence_source": "DIRIL / FDA Prescribing Information",
            "evidence_type": "Established Pharmacokinetic Evidence",
            "biomarkers": ["Serum Creatinine", "eGFR", "BUN"],
            "limitations": "Renal toxicity is generally secondary to massive acute hepatic failure or extreme overdose."
        },
        "brain": {
            "status": "yellow",
            "effect_category": "Therapeutic Central Analgesic Response",
            "mechanism": "Crosses the blood-brain barrier to inhibit central cyclooxygenase (COX-3 / variant COX-1) and cannabinoid reuptake, modulating descending serotonergic pain pathways and hypothalamic thermoregulatory center.",
            "evidence_source": "Reactome Pathway R-HSA-2142753 / Neuropharmacology",
            "evidence_type": "Established Therapeutic Mechanism",
            "biomarkers": ["Hypothalamic Thermoregulation"],
            "limitations": "Educational representation of central therapeutic mechanism."
        },
        "stomach": {
            "status": "green",
            "effect_category": "Gastric Tolerability",
            "mechanism": "Lacks significant peripheral COX-1 inhibition; does not impair protective gastric mucosal prostaglandin synthesis at therapeutic dosages, resulting in superior gastrointestinal tolerability compared to NSAIDs.",
            "evidence_source": "FDA Clinical Pharmacology Reviews",
            "evidence_type": "Established Clinical Evidence",
            "biomarkers": ["Gastric Mucosal Integrity"],
            "limitations": "Absence of direct gastric irritation does not preclude other systemic effects."
        }
    },
    "warfarin": {
        "liver": {
            "status": "orange",
            "effect_category": "Primary Hepatic Metabolism & Clotting Factor Synthesis",
            "mechanism": "Inhibits hepatic Vitamin K epoxide reductase complex 1 (VKORC1), blocking gamma-carboxylation of clotting factors II, VII, IX, and X. Extensively metabolised by CYP2C9.",
            "evidence_source": "CPIC Level 1A Guidelines / PharmGKB",
            "evidence_type": "Established Pharmacogenomic Evidence",
            "biomarkers": ["INR / Prothrombin Time", "CYP2C9 *2/*3 Genotype", "VKORC1 -1639G>A"],
            "limitations": "Dosing requirements are heavily dependent on genetic variants and dietary Vitamin K."
        },
        "heart": {
            "status": "red",
            "effect_category": "Cardiovascular & Bleeding Risk (Boxed Warning)",
            "mechanism": "Anticoagulation prevents stroke and thromboembolism in atrial fibrillation and prosthetic valves, but excessive anticoagulation presents serious or fatal major hemorrhage risk.",
            "evidence_source": "openFDA SPL Boxed Warning",
            "evidence_type": "Established Regulatory Evidence",
            "biomarkers": ["INR Target 2.0-3.0"],
            "limitations": "Cardiovascular protection must be strictly balanced against hemorrhagic risk."
        },
        "skin": {
            "status": "orange",
            "effect_category": "Rare Adverse Effect (Warfarin-Induced Skin Necrosis)",
            "mechanism": "Rapid initial decline in Protein C (half-life 8h) relative to clotting factors creates a transient prothrombotic state leading to microvascular cutaneous thrombosis and tissue necrosis.",
            "evidence_source": "FAERS Safety Surveillance / Clinical Case Reports",
            "evidence_type": "Rare Clinical Adverse Event",
            "biomarkers": ["Protein C Antigen", "Cutaneous Presentation"],
            "limitations": "Extremely rare (<0.1% incidence), primarily associated with large loading doses without heparin bridging."
        }
    },
    "atorvastatin": {
        "liver": {
            "status": "orange",
            "effect_category": "Target Organ of Action & Hepatic Surveillance",
            "mechanism": "Competitive inhibition of hepatic HMG-CoA reductase, upregulating LDL receptors. Transaminase elevations occur in 0.5-2% of patients in a dose-dependent manner.",
            "evidence_source": "FDA DILIrank 2.0 (v-Less-DILI-concern) / FDA SPL",
            "evidence_type": "Established Clinical Evidence",
            "biomarkers": ["Serum ALT/AST", "Total Bilirubin", "Lipid Profile"],
            "limitations": "Persistent elevations (>3x ULN) warrant dose reduction, but severe liver injury is exceedingly rare."
        },
        "heart": {
            "status": "yellow",
            "effect_category": "Cardioprotective Response (Atherosclerosis Reduction)",
            "mechanism": "Lowers circulating LDL-C and apolipoprotein B, stabilizing atherosclerotic plaques and reducing endothelial oxidative inflammation.",
            "evidence_source": "ACC/AHA Cholesterol Clinical Practice Guidelines",
            "evidence_type": "Established Clinical Trial Evidence",
            "biomarkers": ["LDL-C", "ApoB", "hs-CRP"],
            "limitations": "Cardioprotection represents long-term therapeutic preventative efficacy."
        },
        "musculoskeletal": {
            "status": "orange",
            "effect_category": "Documented Adverse Effect (Myopathy / Rhabdomyolysis)",
            "mechanism": "Depletion of intramuscular coenzyme Q10 (ubiquinone) and isoprenoid intermediates impairs mitochondrial energy metabolism, potentially causing myalgia or rare rhabdomyolysis.",
            "evidence_source": "FDA Label Warnings & FAERS Signals (PRR: 3.8)",
            "evidence_type": "Established Clinical Safety Evidence",
            "biomarkers": ["Creatine Kinase (CK)", "Serum Myoglobin"],
            "limitations": "Benign statin-associated muscle symptoms are common; rhabdomyolysis is extremely rare."
        }
    },
    "ibuprofen": {
        "stomach": {
            "status": "red",
            "effect_category": "Gastrointestinal Ulceration & Bleeding (Boxed Warning)",
            "mechanism": "Non-selective inhibition of COX-1 impairs cytoprotective gastric mucosal prostaglandin (PGE2, PGI2) synthesis and increases local acid susceptibility, leading to erosions, peptic ulcers, and hemorrhage.",
            "evidence_source": "openFDA SPL Boxed Warning",
            "evidence_type": "Established Clinical Evidence",
            "biomarkers": ["Hemoglobin / Hematocrit", "Occult Blood Stool"],
            "limitations": "Risk escalates with duration, concurrent corticosteroid/anticoagulant use, and advanced age."
        },
        "kidneys": {
            "status": "orange",
            "effect_category": "Renal Hemodynamic Disturbance",
            "mechanism": "Inhibits renal vasodilatory prostaglandins (PGE2, PGI2), inducing afferent arteriolar vasoconstriction, decreased glomerular filtration rate, and acute tubular or interstitial nephritis.",
            "evidence_source": "DIRIL / FDA Prescribing Information",
            "evidence_type": "Established Clinical Evidence",
            "biomarkers": ["Serum Creatinine", "eGFR", "Potassium (Hyperkalemia)"],
            "limitations": "Particularly hazardous in volume-depleted or preexisting chronic kidney disease patients."
        },
        "heart": {
            "status": "red",
            "effect_category": "Cardiovascular Thrombotic Events (Boxed Warning)",
            "mechanism": "Systemic NSAID use carries an elevated risk of serious cardiovascular thrombotic events, myocardial infarction, and stroke due to unopposed platelet thromboxane A2 relative to endothelial prostacyclin.",
            "evidence_source": "FDA Class Warning for Non-Aspirin NSAIDs",
            "evidence_type": "Established Regulatory Evidence",
            "biomarkers": ["Blood Pressure", "Cardiovascular History"],
            "limitations": "Contraindicated for peri-operative pain in coronary artery bypass graft (CABG) surgery."
        }
    },
    "metformin": {
        "intestines": {
            "status": "yellow",
            "effect_category": "Primary Gastrointestinal Absorption & Transient Intolerance",
            "mechanism": "Absorbed slowly in the upper small intestine. Alterations in gut microbiota, localized GLP-1 secretion, and bile acid reabsorption can cause transient diarrhea, nausea, or dyspepsia in 20-30% of patients.",
            "evidence_source": "FDA Prescribing Information",
            "evidence_type": "Established Pharmacokinetic Evidence",
            "biomarkers": ["Gastrointestinal Tolerability"],
            "limitations": "Mitigated by gradual dose titration and administration with meals."
        },
        "liver": {
            "status": "yellow",
            "effect_category": "Therapeutic Target (Suppression of Hepatic Gluconeogenesis)",
            "mechanism": "Activates AMP-activated protein kinase (AMPK) in hepatocytes, suppressing hepatic gluconeogenic transcription factors and reducing fasting plasma glucose.",
            "evidence_source": "Reactome Pathway R-HSA-5653656",
            "evidence_type": "Established Molecular Mechanism",
            "biomarkers": ["Fasting Blood Glucose", "HbA1c"],
            "limitations": "Not significantly metabolised by hepatic CYP enzymes; excreted unchanged."
        },
        "kidneys": {
            "status": "red",
            "effect_category": "Renal Clearance & Lactic Acidosis Precaution (Boxed Warning)",
            "mechanism": "Eliminated 100% unchanged via renal tubular secretion. In significant renal impairment (eGFR < 30 mL/min), drug accumulation can block mitochondrial respiratory complex I, precipitating rare but fatal lactic acidosis.",
            "evidence_source": "openFDA SPL Boxed Warning",
            "evidence_type": "Established Regulatory Evidence",
            "biomarkers": ["eGFR", "Serum Creatinine", "Blood Lactate"],
            "limitations": "Safe when eGFR > 45 mL/min; contraindicated when eGFR < 30 mL/min."
        }
    }
}


def get_organ_evidence_for_drug(drug_name: str) -> Dict[str, Any]:
    """
    Returns organ highlighting states and scientific evidence for a drug.
    Missing organs default to 'grey' with honest insufficient evidence disclaimer.
    """
    clean_name = drug_name.strip().lower()
    matched_key = None
    
    for k in DRUG_ORGAN_EVIDENCE_MAP.keys():
        if k in clean_name or clean_name in k:
            matched_key = k
            break
            
    drug_evidence = DRUG_ORGAN_EVIDENCE_MAP.get(matched_key, {})
    
    organs_result = []
    for organ in MAJOR_ORGANS:
        oid = organ["id"]
        if oid in drug_evidence:
            ev = drug_evidence[oid]
            organs_result.append({
                "organ_id": oid,
                "name": organ["name"],
                "system": organ["system"],
                "position": organ["position"],
                "basic_function": organ["basic_function"],
                "metabolic_role": organ["metabolic_role"],
                "status": ev["status"],
                "effect_category": ev["effect_category"],
                "mechanism": ev["mechanism"],
                "evidence_source": ev["evidence_source"],
                "evidence_type": ev["evidence_type"],
                "biomarkers": ev.get("biomarkers", []),
                "limitations": ev["limitations"]
            })
        else:
            organs_result.append({
                "organ_id": oid,
                "name": organ["name"],
                "system": organ["system"],
                "position": organ["position"],
                "basic_function": organ["basic_function"],
                "metabolic_role": organ["metabolic_role"],
                "status": "grey",
                "effect_category": "No Significant Organ-Specific Toxicity Evidence",
                "mechanism": "Detailed organ-specific perturbation data is not documented or below established reporting threshold for this compound.",
                "evidence_source": "Biomedical Literature & Benchmark Datasets",
                "evidence_type": "Baseline / Unperturbed",
                "biomarkers": [],
                "limitations": "Absence of documented evidence does not prove physiological immunity, but indicates standard clinical safety profile for this organ system."
            })
            
    return {
        "drug_name": drug_name,
        "is_supported": matched_key is not None,
        "organs": organs_result,
        "general_disclaimer": "These visual classifications represent scientific and toxicological evidence categories from peer-reviewed benchmarks. They do not claim to detect actual organ damage or diagnose an individual patient."
    }


def generate_drug_journey(drug_name: str, route: str = "Oral") -> Dict[str, Any]:
    """
    Generates a 6-stage animated Drug Journey with pharmacokinetics.
    Follows: Entry -> Absorption -> Distribution -> Metabolism -> Elimination -> Biological Effects.
    """
    clean_name = drug_name.strip().lower()
    
    # Specific pharmacokinetic profiles
    pk_profiles = {
        "acetaminophen": {
            "entry_desc": "Oral ingestion as solid tablet or suspension; rapid dissolution in gastric fluids.",
            "absorption_desc": "Passive transcellular transport across duodenal and jejunal enterocytes (Tmax ~30-60 min; bioavailability ~70-90%).",
            "distribution_desc": "Distributed uniformly throughout bodily fluids; negligible plasma protein binding (10-25%); Vd approx 0.9 L/kg.",
            "metabolism_desc": "Major hepatic biotransformation: 55% glucuronidation (UGT1A6/1A9), 30% sulfation (SULT1A1). Minor ~5-10% oxidized via CYP2E1 into NAPQI, rapidly detoxified by glutathione.",
            "elimination_desc": "Predominantly renal excretion (>90% as inactive conjugates within 24h); elimination half-life ~2.0-3.0 hours.",
            "effects_desc": "Central nervous system COX variant inhibition suppressing prostaglandin synthesis; hypothalamic thermoregulation mediated by antipyretic signaling."
        },
        "warfarin": {
            "entry_desc": "Oral administration of racemic mixture (R- and S-warfarin); near complete gastrointestinal absorption.",
            "absorption_desc": "Rapid mucosal uptake from proximal gastrointestinal tract with minimal first-pass degradation (bioavailability >95%).",
            "distribution_desc": "High plasma albumin binding (99%); confined distribution volume (Vd ~0.14 L/kg); passes placenta.",
            "metabolism_desc": "Stereoselective hepatic metabolism: S-warfarin (5x more potent) primarily cleared by CYP2C9; R-warfarin by CYP1A2 and CYP3A4.",
            "elimination_desc": "Slow renal and biliary excretion of inactive metabolites; elimination half-life extends from 20 to 60 hours.",
            "effects_desc": "Inhibition of VKORC1 blocks Vitamin K reduction, depleting functional clotting factors II, VII, IX, and X, extending prothrombin time."
        },
        "atorvastatin": {
            "entry_desc": "Oral tablet swallowed with water; systemic bioavailability is approximately 14% due to presystemic clearance.",
            "absorption_desc": "Rapidly absorbed from small intestine (Tmax 1-2 hours); extensive first-pass intestinal mucosal and hepatic extraction.",
            "distribution_desc": "Highly bound to plasma proteins (>=98%); distributed preferentially to hepatocytes via OATP1B1/OATP1B3 transporters.",
            "metabolism_desc": "Extensively metabolised by hepatic CYP3A4 to active ortho- and para-hydroxylated metabolites, contributing ~70% of circulating inhibitory activity.",
            "elimination_desc": "Eliminated primarily through hepatic biliary excretion into feces (>98%); minimal renal excretion (<2%); terminal half-life ~14 hours.",
            "effects_desc": "Competitive HMG-CoA reductase inhibition suppresses endogenous hepatic cholesterol synthesis, upregulating cell-surface LDL receptors."
        }
    }
    
    matched_key = None
    for k in pk_profiles.keys():
        if k in clean_name or clean_name in k:
            matched_key = k
            break
            
    pk = pk_profiles.get(matched_key)
    
    stages = [
        {
            "stage_number": 1,
            "title": "Medicine Entry",
            "target_system": "Digestive System (Upper)",
            "primary_organ": "stomach",
            "duration_seconds": 2.5,
            "description": pk["entry_desc"] if pk else f"{route} administration of {drug_name}; initiates systemic or local bioavailability pathway.",
            "pharmacokinetic_status": "Documented Route" if pk else "Standard Clinical Route",
            "camera_focus": [0.0, 1.3, 1.2]
        },
        {
            "stage_number": 2,
            "title": "Absorption",
            "target_system": "Gastrointestinal Tract",
            "primary_organ": "intestines",
            "duration_seconds": 3.0,
            "description": pk["absorption_desc"] if pk else "Mucosal absorption across epithelial barrier into mesenteric capillary network.",
            "pharmacokinetic_status": "Documented Bioavailability" if pk else "Detailed absorption kinetics currently unavailable.",
            "camera_focus": [0.0, 0.7, 1.0]
        },
        {
            "stage_number": 3,
            "title": "Distribution",
            "target_system": "Cardiovascular System",
            "primary_organ": "heart",
            "duration_seconds": 3.0,
            "description": pk["distribution_desc"] if pk else "Transportation through systemic arterial and venous circulation with plasma protein binding.",
            "pharmacokinetic_status": "Documented Volume of Distribution" if pk else "Detailed distribution parameters currently unavailable.",
            "camera_focus": [0.0, 1.1, 1.2]
        },
        {
            "stage_number": 4,
            "title": "Metabolism",
            "target_system": "Hepatic Metabolic Network",
            "primary_organ": "liver",
            "duration_seconds": 3.5,
            "description": pk["metabolism_desc"] if pk else "Hepatic Phase I (oxidation) and Phase II (conjugation) clearance by Cytochrome P450 isoenzymes.",
            "pharmacokinetic_status": "Documented Enzymatic Clearance" if pk else "Detailed metabolic pathway currently unavailable.",
            "camera_focus": [-0.15, 0.95, 0.9]
        },
        {
            "stage_number": 5,
            "title": "Elimination",
            "target_system": "Urinary & Renal System",
            "primary_organ": "kidneys",
            "duration_seconds": 3.0,
            "description": pk["elimination_desc"] if pk else "Renal glomerular filtration and tubular secretion, or biliary excretion into feces.",
            "pharmacokinetic_status": "Documented Excretion Route" if pk else "Detailed elimination pathway currently unavailable.",
            "camera_focus": [0.15, 0.75, 0.9]
        },
        {
            "stage_number": 6,
            "title": "Biological Effects",
            "target_system": "Target Receptors & Organ Perturbation",
            "primary_organ": "liver" if "paracetamol" in clean_name or "acetaminophen" in clean_name else "heart",
            "duration_seconds": 4.0,
            "description": pk["effects_desc"] if pk else f"Receptor engagement and cellular signaling cascade modulated by {drug_name}.",
            "pharmacokinetic_status": "Documented Pharmacodynamics" if pk else "Detailed pharmacodynamic mechanism currently unavailable.",
            "camera_focus": [0.0, 1.0, 1.5]
        }
    ]
    
    return {
        "drug_name": drug_name,
        "route": route,
        "total_stages": 6,
        "stages": stages,
        "disclaimer": "This animated timeline is an educational simulation of human pharmacokinetic stages. It does not represent real-time physical movement within a specific patient."
    }
