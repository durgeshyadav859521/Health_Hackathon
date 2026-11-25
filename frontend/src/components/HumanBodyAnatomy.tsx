import React, { useState } from 'react';
import { Activity, ShieldAlert, CheckCircle, Info, Sparkles, AlertCircle } from 'lucide-react';

interface OrganData {
  id: string;
  name: string;
  hasActiveModel: boolean;
  modelName?: string;
  biomarkers: string[];
  scientificMechanism: string;
  supportedEvidence: string;
  limitations: string;
}

const ORGANS: Record<string, OrganData> = {
  liver: {
    id: 'liver',
    name: 'Hepatic System (Liver)',
    hasActiveModel: true,
    modelName: 'FDA DILIrank 2.0 Supervised ML Classifier + SHAP',
    biomarkers: ['ALT (Alanine Aminotransferase)', 'AST (Aspartate Aminotransferase)', 'Total Bilirubin', 'Alkaline Phosphatase (ALP)'],
    scientificMechanism: 'First-pass metabolism site via Cytochrome P450 enzymes (CYP3A4, CYP2D6, CYP2C9). High lipophilicity (LogP ≥ 3) combined with high daily exposure dose (≥100 mg/day) creates metabolic stress and reactive intermediate generation.',
    supportedEvidence: 'FDA LTKB DILIrank 2.0 benchmark compendium (1,036 verified drugs), openFDA hepatotoxicity warnings, and LINCS in-vitro hepatocellular (HEPG2) stress response.',
    limitations: 'Model classifies regulatory and chemical hepatic liability based on molecular descriptors and baseline labs; it is not an absolute individual diagnostic certainty.'
  },
  kidney: {
    id: 'kidney',
    name: 'Renal System (Kidney)',
    hasActiveModel: false,
    biomarkers: ['Serum Creatinine', 'eGFR (Glomerular Filtration Rate)', 'Blood Urea Nitrogen (BUN)', 'Urinary Protein'],
    scientificMechanism: 'Primary excretion organ for hydrophilic molecules and polar metabolites. Glomerular filtration, tubular secretion, and concentration gradients make renal tubules susceptible to crystal nephropathy and hemodynamic constriction (e.g. NSAID COX-inhibition).',
    supportedEvidence: 'openFDA renal impairment dosage adjustments and FAERS acute kidney injury disproportionality reports.',
    limitations: 'Research information available – personalized simulation not yet supported. Renal risk is qualitative based on label contraindications (e.g. eGFR < 30 mL/min for Metformin).'
  },
  heart: {
    id: 'heart',
    name: 'Cardiovascular System (Heart)',
    hasActiveModel: false,
    biomarkers: ['Cardiac Troponin I/T', 'BNP / NT-proBNP', 'ECG QTc Interval (ms)', 'Left Ventricular Ejection Fraction (LVEF)'],
    scientificMechanism: 'Susceptibility to electrophysiological interference via hERG potassium channel (KCNH2) blockade leading to delayed repolarization, prolonged QT interval, and torsades de pointes; microvascular endothelial toxicity.',
    supportedEvidence: 'FDA Boxed Warnings for antiarrhythmics (Amiodarone) and FAERS QT-prolongation signal distributions.',
    limitations: 'Research information available – personalized simulation not yet supported. Electrophysiological simulations require dedicated patch-clamp / hERG structural models.'
  },
  blood: {
    id: 'blood',
    name: 'Hematological & Coagulation System',
    hasActiveModel: false,
    biomarkers: ['INR (International Normalized Ratio)', 'Platelet Count', 'Hemoglobin', 'PT / aPTT'],
    scientificMechanism: 'Drug-induced bone marrow suppression, immune-mediated thrombocytopenia, or alteration of hepatic vitamin K clotting factor synthesis (e.g. Warfarin / CYP2C9 & VKORC1 interaction).',
    supportedEvidence: 'ClinPGx / CPIC Level 1A guidelines for Warfarin and Azathioprine; openFDA boxed warnings for bleeding and aplastic anemia.',
    limitations: 'Research information available – personalized simulation not yet supported. Pharmacogenomic rules provide actionable dosing guidelines, not dynamic whole-body pharmacokinetic simulations.'
  },
  brain: {
    id: 'brain',
    name: 'Central Nervous System (Brain)',
    hasActiveModel: false,
    biomarkers: ['Blood-Brain Barrier (BBB) Permeability Index', 'LogBB Prediction', 'Sedation / Cognitive Scale'],
    scientificMechanism: 'Penetration through the blood-brain barrier is governed by molecular weight (<400 g/mol), moderate lipophilicity (LogP 1.5–3.0), and low hydrogen bonding (HBD < 3). Neurotoxicity may arise via unintended central receptor antagonism or mitochondrial inhibition.',
    supportedEvidence: 'PubChem physicochemical BBB parameters and openFDA central adverse effects (somnolence, dizziness, seizure liability).',
    limitations: 'Research information available – personalized simulation not yet supported. Qualitative BBB permeability heuristics used.'
  },
  digestive: {
    id: 'digestive',
    name: 'Gastrointestinal & Digestive System',
    hasActiveModel: false,
    biomarkers: ['Gastric pH', 'Fecal Calprotectin', 'Occult Blood'],
    scientificMechanism: 'Local mucosal irritation and systemic COX-1 inhibition reducing protective prostaglandins (PGE2, PGI2), causing gastric acid hypersecretion, mucosal ulceration, and potential GI hemorrhage.',
    supportedEvidence: 'openFDA NSAID boxed warnings and FAERS gastric ulcer reporting statistics.',
    limitations: 'Research information available – personalized simulation not yet supported. GI risk profiles are derived from official regulatory labeling.'
  }
};

export const HumanBodyAnatomy: React.FC = () => {
  const [selectedOrgan, setSelectedOrgan] = useState<string>('liver');
  const activeOrgan = ORGANS[selectedOrgan] || ORGANS['liver'];

  return (
    <div className="glass-panel p-6 rounded-2xl border border-slate-700/60 bg-[#0F172A]/80 shadow-xl">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-5 border-b border-slate-700/60">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Activity className="w-5 h-5 text-[#06D6A0]" />
              Interactive Human Anatomy & Organ Intelligence
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-[#06D6A0]/15 text-[#00F5D4] border border-[#06D6A0]/30">
              Interactive
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Click on biological systems to explore active AI prediction models, clinical biomarkers, and scientific evidence.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-[#06D6A0] shadow-sm shadow-[#06D6A0]"></span>
            <span className="text-slate-300 font-medium">Active ML Model</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-full bg-slate-500"></span>
            <span className="text-slate-400">Research Evidence Only</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6 items-center">
        {/* Anatomy Diagram / Interactive SVG Silhouette */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 bg-[#070D1E]/80 rounded-xl border border-slate-800 relative">
          <div className="relative w-64 h-96 flex items-center justify-center">
            {/* Base Body Silhouette SVG */}
            <svg viewBox="0 0 200 400" className="w-full h-full text-slate-700 drop-shadow-md">
              {/* Head */}
              <circle cx="100" cy="40" r="28" fill="#1C2541" stroke="#3A86FF" strokeWidth="1.5" strokeDasharray="3 2" />
              {/* Neck */}
              <rect x="94" y="68" width="12" height="16" fill="#1C2541" />
              {/* Torso */}
              <path d="M 60 84 Q 100 80 140 84 L 132 230 Q 100 236 68 230 Z" fill="#131D36" stroke="#3A86FF" strokeWidth="1.2" />
              {/* Arms */}
              <path d="M 60 84 Q 40 140 45 220" stroke="#1C2541" strokeWidth="14" strokeLinecap="round" fill="none" />
              <path d="M 140 84 Q 160 140 155 220" stroke="#1C2541" strokeWidth="14" strokeLinecap="round" fill="none" />
              {/* Legs */}
              <path d="M 78 230 L 72 380" stroke="#131D36" strokeWidth="18" strokeLinecap="round" />
              <path d="M 122 230 L 128 380" stroke="#131D36" strokeWidth="18" strokeLinecap="round" />
            </svg>

            {/* Interactive Organ Hotspots */}
            {/* 1. Brain */}
            <button
              onClick={() => setSelectedOrgan('brain')}
              className={`absolute top-6 left-[84px] w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                selectedOrgan === 'brain' ? 'ring-4 ring-[#00F5D4] bg-[#00F5D4] text-[#0B132B] scale-110' : 'bg-slate-700/80 text-white hover:bg-slate-600'
              }`}
              title="Brain / CNS"
            >
              <span className="text-[10px] font-bold">CNS</span>
            </button>

            {/* 2. Heart */}
            <button
              onClick={() => setSelectedOrgan('heart')}
              className={`absolute top-[110px] left-[106px] w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedOrgan === 'heart' ? 'ring-4 ring-rose-400 bg-rose-500 text-white scale-110' : 'bg-slate-700/80 text-white hover:bg-rose-900/60'
              }`}
              title="Heart"
            >
              <span className="text-[9px] font-bold">HRT</span>
            </button>

            {/* 3. Liver (ACTIVE MODEL) */}
            <button
              onClick={() => setSelectedOrgan('liver')}
              className={`absolute top-[140px] left-[78px] w-9 h-9 rounded-full flex items-center justify-center transition-all shadow-lg ${
                selectedOrgan === 'liver'
                  ? 'ring-4 ring-[#06D6A0] bg-[#06D6A0] text-[#0B132B] scale-125 shadow-[#06D6A0]/50'
                  : 'bg-[#06D6A0]/80 text-[#0B132B] hover:bg-[#06D6A0] animate-pulse'
              }`}
              title="Liver (Active ML Model)"
            >
              <span className="text-[10px] font-extrabold">LIV</span>
            </button>

            {/* 4. Digestive System */}
            <button
              onClick={() => setSelectedOrgan('digestive')}
              className={`absolute top-[165px] left-[98px] w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedOrgan === 'digestive' ? 'ring-4 ring-amber-400 bg-amber-500 text-[#0B132B] scale-110' : 'bg-slate-700/80 text-white hover:bg-slate-600'
              }`}
              title="Digestive / GI"
            >
              <span className="text-[9px] font-bold">GI</span>
            </button>

            {/* 5. Kidney */}
            <button
              onClick={() => setSelectedOrgan('kidney')}
              className={`absolute top-[180px] left-[118px] w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedOrgan === 'kidney' ? 'ring-4 ring-cyan-400 bg-cyan-500 text-[#0B132B] scale-110' : 'bg-slate-700/80 text-white hover:bg-slate-600'
              }`}
              title="Kidney / Renal"
            >
              <span className="text-[9px] font-bold">REN</span>
            </button>

            {/* 6. Blood / Vascular */}
            <button
              onClick={() => setSelectedOrgan('blood')}
              className={`absolute top-[210px] left-[78px] w-7 h-7 rounded-full flex items-center justify-center transition-all ${
                selectedOrgan === 'blood' ? 'ring-4 ring-purple-400 bg-purple-500 text-white scale-110' : 'bg-slate-700/80 text-white hover:bg-slate-600'
              }`}
              title="Blood / Vascular"
            >
              <span className="text-[9px] font-bold">BLD</span>
            </button>
          </div>

          {/* Quick organ switch buttons */}
          <div className="flex flex-wrap gap-1.5 mt-3 justify-center">
            {Object.keys(ORGANS).map(key => {
              const organ = ORGANS[key];
              const isSelected = selectedOrgan === key;
              return (
                <button
                  key={key}
                  onClick={() => setSelectedOrgan(key)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-all ${
                    isSelected
                      ? organ.hasActiveModel
                        ? 'bg-[#06D6A0] text-[#0B132B] font-bold'
                        : 'bg-slate-200 text-[#0B132B] font-semibold'
                      : organ.hasActiveModel
                      ? 'bg-[#06D6A0]/20 text-[#06D6A0] border border-[#06D6A0]/40'
                      : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                  }`}
                >
                  {organ.name.split(' ')[0]}
                </button>
              );
            })}
          </div>
        </div>

        {/* Organ Intelligence & Scientific Dossier */}
        <div className="lg:col-span-7 space-y-4">
          <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-700/80">
            <div className="flex items-center justify-between gap-2 mb-2">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                {activeOrgan.name}
              </h4>
              {activeOrgan.hasActiveModel ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/60 border border-emerald-500/50 text-emerald-400">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Active ML Model
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-300 border border-slate-700">
                  <Info className="w-3.5 h-3.5 text-slate-400" />
                  Research Evidence Available
                </span>
              )}
            </div>

            {activeOrgan.hasActiveModel && activeOrgan.modelName && (
              <div className="mb-3 px-3 py-1.5 rounded-lg bg-[#06D6A0]/10 border border-[#06D6A0]/30 text-xs text-[#00F5D4] font-medium">
                Trained Engine: {activeOrgan.modelName}
              </div>
            )}

            <div className="space-y-3 text-xs">
              {/* Biological Mechanism */}
              <div>
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Biological Mechanism & Pharmacokinetics:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  {activeOrgan.scientificMechanism}
                </p>
              </div>

              {/* Supported Evidence & Datasets */}
              <div>
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Scientific Datasets & Evidence:</span>
                <p className="text-slate-300 mt-0.5 leading-relaxed bg-slate-800/40 p-2.5 rounded-lg border border-slate-700/40">
                  {activeOrgan.supportedEvidence}
                </p>
              </div>

              {/* Relevant Biomarkers */}
              <div>
                <span className="font-semibold text-slate-300 uppercase tracking-wider text-[10px]">Integrated Baseline Biomarkers:</span>
                <div className="flex flex-wrap gap-1.5 mt-1">
                  {activeOrgan.biomarkers.map((b, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[11px] border border-slate-700">
                      {b}
                    </span>
                  ))}
                </div>
              </div>

              {/* Strict Scientific Honesty Notice */}
              <div className="pt-2 border-t border-slate-800">
                <div className={`p-2.5 rounded-lg flex items-start gap-2 text-[11px] ${
                  activeOrgan.hasActiveModel
                    ? 'bg-emerald-950/20 border border-emerald-900/40 text-emerald-200/90'
                    : 'bg-amber-950/20 border border-amber-900/40 text-amber-200/90'
                }`}>
                  <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 ${activeOrgan.hasActiveModel ? 'text-emerald-400' : 'text-amber-400'}`} />
                  <div>
                    <span className="font-semibold">{activeOrgan.hasActiveModel ? 'Operational Model Disclosure:' : 'Scientific Scope Limitation:'}</span> {activeOrgan.limitations}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
