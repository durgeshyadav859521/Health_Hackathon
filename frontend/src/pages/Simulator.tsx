import React, { useState, useEffect } from 'react';
import {
  Dna, Play, Download, CheckCircle2, AlertTriangle, ShieldCheck,
  Activity, ArrowRight, RefreshCw, FileText, Sparkles, Info, ChevronRight, Layers
} from 'lucide-react';
import { api } from '../services/api';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';
import { GeneExpressionChart } from '../components/GeneExpressionChart';
import { DrugCompound, SimulationResult, BiologicalResponse } from '../types';

interface SimulatorProps {
  initialDrugName?: string;
}

export const Simulator: React.FC<SimulatorProps> = ({ initialDrugName = 'Acetaminophen' }) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedDrug, setSelectedDrug] = useState<string>(initialDrugName);
  const [dailyDoseMg, setDailyDoseMg] = useState<number>(1000);
  const [simType, setSimType] = useState<'liver-toxicity' | 'biological-response'>('liver-toxicity');
  const [catalog, setCatalog] = useState<DrugCompound[]>([]);
  const [loading, setLoading] = useState(false);
  const [generatingPdf, setGeneratingPdf] = useState(false);
  const [pdfDownloadUrl, setPdfDownloadUrl] = useState<string | null>(null);

  // Patient Baseline State
  const [age, setAge] = useState<number>(48);
  const [sex, setSex] = useState<string>('Male');
  const [heightCm, setHeightCm] = useState<number>(175);
  const [weightKg, setWeightKg] = useState<number>(78);
  const [ast, setAst] = useState<number>(26);
  const [alt, setAlt] = useState<number>(28);
  const [bilirubin, setBilirubin] = useState<number>(0.9);
  const [creatinine, setCreatinine] = useState<number>(1.0);
  const [systolicBp, setSystolicBp] = useState<number>(120);
  const [diastolicBp, setDiastolicBp] = useState<number>(80);

  // Biological response specific params
  const [cellLine, setCellLine] = useState<string>('HEPG2');
  const [doseUm, setDoseUm] = useState<number>(10.0);
  const [timeHours, setTimeHours] = useState<number>(24);

  // Simulation Results
  const [simulationResult, setSimulationResult] = useState<SimulationResult | null>(null);
  const [biologicalResult, setBiologicalResult] = useState<BiologicalResponse | null>(null);

  // Automatic BMI Calculation
  const bmi = heightCm > 0 ? Number((weightKg / ((heightCm / 100) ** 2)).toFixed(1)) : 24.2;

  useEffect(() => {
    api.getCatalog().then(drugs => setCatalog(drugs));
  }, []);

  const handleRunSimulation = async () => {
    setLoading(true);
    setPdfDownloadUrl(null);

    const patientPayload = {
      age,
      sex,
      height_cm: heightCm,
      weight_kg: weightKg,
      bmi,
      ast,
      alt,
      bilirubin,
      creatinine,
      systolic_bp: systolicBp,
      diastolic_bp: diastolicBp,
      medications: []
    };

    try {
      if (simType === 'liver-toxicity') {
        const res = await api.runLiverSimulation({
          drug_name: selectedDrug,
          daily_dose_mg: dailyDoseMg,
          patient: patientPayload
        });
        setSimulationResult(res);

        // Also fetch LINCS biological response to provide comprehensive multi-modal insight
        const bioRes = await api.runBiologicalSimulation({
          drug_name: selectedDrug,
          cell_line: 'HEPG2',
          dose_um: 10.0,
          time_h: 24
        });
        setBiologicalResult(bioRes);
      } else {
        const bioRes = await api.runBiologicalSimulation({
          drug_name: selectedDrug,
          cell_line: cellLine,
          dose_um: doseUm,
          time_h: timeHours
        });
        setBiologicalResult(bioRes);
      }
      setCurrentStep(4); // View Results
    } catch (err) {
      console.error(err);
      alert('Simulation execution failed. Please verify the backend connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleGeneratePdf = async () => {
    if (!simulationResult) return;
    setGeneratingPdf(true);
    try {
      const res = await api.generateReport({
        simulation_id: simulationResult.simulation_id,
        drug_name: simulationResult.drug_name,
        patient: simulationResult.patient_profile,
        simulation_result: simulationResult.prediction,
        chemical_properties: simulationResult.chemical_properties
      });
      if (res.download_url) {
        setPdfDownloadUrl(res.download_url);
        // Automatically trigger browser download
        window.open(res.download_url, '_blank');
      }
    } catch (e) {
      console.error(e);
      alert('Could not generate PDF report.');
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      {/* Title & Tagline */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <Dna className="w-6 h-6 text-[#06D6A0]" />
            AI Drug Response Simulator
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Simulate and explain individualized drug responses using FDA DILIrank 2.0, LINCS L1000, and SHAP explainable AI.
          </p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center gap-1.5 text-xs">
          {[
            { num: 1, label: 'Medicine' },
            { num: 2, label: 'Baseline' },
            { num: 3, label: 'Module' },
            { num: 4, label: 'Results' }
          ].map(s => (
            <div
              key={s.num}
              onClick={() => {
                if (s.num < currentStep || (s.num === 4 && simulationResult)) setCurrentStep(s.num);
              }}
              className={`flex items-center gap-1 px-3 py-1.5 rounded-lg font-medium cursor-pointer transition-all ${
                currentStep === s.num
                  ? 'bg-[#06D6A0] text-[#0B132B] font-bold shadow-md shadow-[#06D6A0]/20'
                  : currentStep > s.num
                  ? 'bg-slate-800 text-[#00F5D4] border border-slate-700'
                  : 'bg-slate-900 text-slate-500 border border-slate-800'
              }`}
            >
              <span>{s.num}.</span>
              <span>{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* STEP 1: SELECT MEDICINE */}
      {currentStep === 1 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] text-xs flex items-center justify-center font-bold">1</span>
                Select Pharmaceutical Agent & Exposure Dosage
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Choose a verified compound from official biomedical datasets.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {catalog.map(c => (
              <button
                key={c.cid}
                type="button"
                onClick={() => setSelectedDrug(c.name)}
                className={`p-3 rounded-xl text-left border transition-all text-xs ${
                  selectedDrug === c.name
                    ? 'border-[#06D6A0] bg-[#06D6A0]/15 text-white shadow-md shadow-[#06D6A0]/20'
                    : 'border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700'
                }`}
              >
                <div className="font-bold text-sm text-white mb-0.5">{c.name}</div>
                <div className="text-[10px] text-slate-400 font-mono">CID: {c.cid} &bull; MW: {c.mw}</div>
                <div className="text-[10px] text-[#00F5D4] mt-1">XLogP: {c.logp}</div>
              </button>
            ))}
          </div>

          {/* Daily Dose Input */}
          <div className="max-w-md pt-4 border-t border-slate-800">
            <label className="block text-xs font-semibold text-slate-300 mb-1">
              Anticipated Daily Exposure Dose (mg/24h)
            </label>
            <div className="flex items-center gap-3">
              <input
                type="number"
                value={dailyDoseMg}
                onChange={(e) => setDailyDoseMg(Number(e.target.value))}
                min={1}
                max={5000}
                className="w-40 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-[#06D6A0]"
              />
              <span className="text-xs text-slate-400">
                (FDA LTKB Rule of 2 threshold: ≥100 mg/day)
              </span>
            </div>
          </div>

          <div className="flex justify-end pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#06D6A0] text-[#0B132B] hover:bg-[#00F5D4] transition-all"
            >
              Continue to Patient Baseline
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: PATIENT BASELINE PROFILE */}
      {currentStep === 2 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] text-xs flex items-center justify-center font-bold">2</span>
                Patient Baseline Clinical & Laboratory Profile
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Enter physiological measurements. BMI is calculated automatically.
              </p>
            </div>
            <div className="px-3 py-1 rounded-lg bg-slate-800 border border-slate-700 text-xs">
              <span className="text-slate-400">Target Medicine: </span>
              <strong className="text-[#06D6A0]">{selectedDrug} ({dailyDoseMg} mg)</strong>
            </div>
          </div>

          {/* Form Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Demographics & Vitals */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#06D6A0]">
                Demographics & Anthropometrics
              </h4>
              <div>
                <label className="block text-slate-300 mb-1">Age (Years)</label>
                <input
                  type="number"
                  value={age}
                  onChange={(e) => setAge(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Biological Sex</label>
                <select
                  value={sex}
                  onChange={(e) => setSex(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                >
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Not Specified">Not Specified</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={heightCm}
                    onChange={(e) => setHeightCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Weight (kg)</label>
                  <input
                    type="number"
                    value={weightKg}
                    onChange={(e) => setWeightKg(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 flex items-center justify-between">
                <span className="text-slate-400">Calculated BMI:</span>
                <span className="font-bold text-[#00F5D4]">{bmi} kg/m²</span>
              </div>
            </div>

            {/* Hepatic Biomarkers */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-[#06D6A0]">
                Hepatic Enzymes & Biomarkers
              </h4>
              <div>
                <label className="block text-slate-300 mb-1">ALT (Alanine Aminotransferase) [U/L]</label>
                <input
                  type="number"
                  value={alt}
                  onChange={(e) => setAlt(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-[10px] text-slate-500">Normal reference range: 7–56 U/L</span>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">AST (Aspartate Aminotransferase) [U/L]</label>
                <input
                  type="number"
                  value={ast}
                  onChange={(e) => setAst(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-[10px] text-slate-500">Normal reference range: 10–40 U/L</span>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Total Serum Bilirubin [mg/dL]</label>
                <input
                  type="number"
                  step="0.1"
                  value={bilirubin}
                  onChange={(e) => setBilirubin(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-[10px] text-slate-500">Normal reference range: 0.1–1.2 mg/dL</span>
              </div>
            </div>

            {/* Renal & Cardiovascular Baseline */}
            <div className="space-y-4 p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
              <h4 className="font-bold text-white uppercase tracking-wider text-[11px] text-cyan-400">
                Renal & Hemodynamic Baseline
              </h4>
              <div>
                <label className="block text-slate-300 mb-1">Serum Creatinine [mg/dL]</label>
                <input
                  type="number"
                  step="0.1"
                  value={creatinine}
                  onChange={(e) => setCreatinine(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                />
                <span className="text-[10px] text-slate-500">Normal: 0.7–1.3 mg/dL</span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-slate-300 mb-1">Systolic BP</label>
                  <input
                    type="number"
                    value={systolicBp}
                    onChange={(e) => setSystolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Diastolic BP</label>
                  <input
                    type="number"
                    value={diastolicBp}
                    onChange={(e) => setDiastolicBp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-white"
                  />
                </div>
              </div>
              <div className="p-2.5 rounded bg-slate-800/80 border border-slate-700 text-[10px] text-slate-400">
                <Info className="w-3.5 h-3.5 text-cyan-400 inline mr-1" />
                Vitals provide pharmacological clearance context. Unsupported organ predictions are never fabricated.
              </div>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(1)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="flex items-center gap-1.5 px-6 py-2.5 rounded-xl text-xs font-bold bg-[#06D6A0] text-[#0B132B] hover:bg-[#00F5D4] transition-all"
            >
              Choose Simulation Module
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: SELECT SIMULATION MODULE */}
      {currentStep === 3 && (
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-6">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span className="w-6 h-6 rounded-full bg-[#06D6A0]/20 text-[#06D6A0] text-xs flex items-center justify-center font-bold">3</span>
              Select Verified Biomedical Simulation Module
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Only modules backed by official datasets and validated models are supported.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Module 1: Liver Toxicity */}
            <div
              onClick={() => setSimType('liver-toxicity')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                simType === 'liver-toxicity'
                  ? 'border-[#06D6A0] bg-[#06D6A0]/10 shadow-lg shadow-[#06D6A0]/15'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#06D6A0]" />
                  Drug-Induced Liver Injury (DILIrank 2.0)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-950/80 text-emerald-400 border border-emerald-800">
                  Supervised ML + SHAP
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Applies trained machine learning classifier on FDA DILIrank 2.0. Integrates chemical properties, patient transaminases, and calculates SHAP waterfall attribution.
              </p>
            </div>

            {/* Module 2: LINCS Biological Response */}
            <div
              onClick={() => setSimType('biological-response')}
              className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                simType === 'biological-response'
                  ? 'border-[#06D6A0] bg-[#06D6A0]/10 shadow-lg shadow-[#06D6A0]/15'
                  : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="font-bold text-white text-sm flex items-center gap-2">
                  <Layers className="w-4 h-4 text-cyan-400" />
                  In-Vitro Gene Perturbation (LINCS L1000)
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-cyan-950/80 text-cyan-400 border border-cyan-800">
                  Transcriptional PCA
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Simulates cellular transcriptomic changes across landmark hallmark genes (TP53, CASP3, HMOX1, TNF) across cell lines, doses, and exposure durations.
              </p>
            </div>
          </div>

          <div className="flex justify-between pt-4">
            <button
              onClick={() => setCurrentStep(2)}
              className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
            >
              Back
            </button>
            <button
              onClick={handleRunSimulation}
              disabled={loading}
              className="flex items-center gap-2 px-8 py-3 rounded-xl text-xs font-extrabold bg-gradient-to-r from-[#06D6A0] to-[#00F5D4] text-[#0B132B] hover:shadow-xl hover:shadow-[#06D6A0]/25 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running AI Models...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  Execute Simulation
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: MULTI-SECTION INTEGRATED RESULTS */}
      {currentStep === 4 && simulationResult && (
        <div className="space-y-6">
          {/* Top Banner: Action Bar & Operating Mode */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl glass-panel border border-slate-700 bg-slate-900/90">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-base font-bold text-white">
                  Simulation Results: <span className="text-[#06D6A0]">{simulationResult.drug_name}</span>
                </span>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 font-mono">
                  ID: {simulationResult.simulation_id}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Patient: Age {simulationResult.patient_profile.age} &bull; BMI {simulationResult.patient_profile.bmi} &bull; Dose: {simulationResult.daily_dose_mg} mg/day
              </p>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setCurrentStep(1)}
                className="px-3.5 py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700"
              >
                New Simulation
              </button>
              <button
                onClick={handleGeneratePdf}
                disabled={generatingPdf}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-bold bg-[#06D6A0] text-[#0B132B] hover:bg-[#00F5D4] transition-all disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                {generatingPdf ? 'Generating PDF...' : 'Download PDF Report'}
              </button>
            </div>
          </div>

          {/* Section A: Drug & Chemical Properties */}
          <div className="glass-panel p-5 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#06D6A0] mb-3 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Section A: Drug Molecular Identity & Chemical Properties (PubChem)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 text-xs">
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Molecular Weight</span>
                <span className="font-mono text-white font-semibold">{simulationResult.chemical_properties?.mw} g/mol</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Lipophilicity (XLogP)</span>
                <span className="font-mono text-cyan-300 font-semibold">{simulationResult.chemical_properties?.logp}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Polar Surface (TPSA)</span>
                <span className="font-mono text-white font-semibold">{simulationResult.chemical_properties?.tpsa} Å²</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">H-Bond Donors</span>
                <span className="font-mono text-white font-semibold">{simulationResult.chemical_properties?.hbd}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">H-Bond Acceptors</span>
                <span className="font-mono text-white font-semibold">{simulationResult.chemical_properties?.hba}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">Rotatable Bonds</span>
                <span className="font-mono text-white font-semibold">{simulationResult.chemical_properties?.rot_bonds}</span>
              </div>
            </div>
          </div>

          {/* Section B: Machine Learning Prediction */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-[#06D6A0] flex items-center gap-2">
              <Activity className="w-4 h-4" />
              Section B: Supervised Machine Learning Prediction (FDA DILIrank 2.0)
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Predicted Classification Badge */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between">
                <span className="text-slate-400 text-[11px]">Predicted FDA LTKB Classification:</span>
                <div className="my-2">
                  <span className={`inline-block px-3 py-1.5 rounded-lg text-sm font-bold ${
                    simulationResult.prediction.predicted_class_code === 2
                      ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                      : simulationResult.prediction.predicted_class_code === 1
                      ? 'bg-amber-950/80 text-amber-300 border border-amber-700'
                      : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
                  }`}>
                    {simulationResult.prediction.predicted_class_label}
                  </span>
                </div>
                <span className="text-[10px] text-slate-500">Benchmark: FDA DILIrank 2.0 (1,036 compounds)</span>
              </div>

              {/* Class Probability Distribution */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2 text-xs">
                <span className="text-slate-400 text-[11px] block">Calibrated Probability Distribution:</span>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-emerald-400">No Concern</span>
                    <span className="font-mono">{(simulationResult.prediction.class_probabilities.v_no_dili_concern * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-emerald-500 h-full" style={{ width: `${simulationResult.prediction.class_probabilities.v_no_dili_concern * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-amber-400">Less Concern</span>
                    <span className="font-mono">{(simulationResult.prediction.class_probabilities.v_less_dili_concern * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-500 h-full" style={{ width: `${simulationResult.prediction.class_probabilities.v_less_dili_concern * 100}%` }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between text-[11px] mb-0.5">
                    <span className="text-rose-400">Most Concern</span>
                    <span className="font-mono">{(simulationResult.prediction.class_probabilities.v_most_dili_concern * 100).toFixed(1)}%</span>
                  </div>
                  <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-rose-500 h-full" style={{ width: `${simulationResult.prediction.class_probabilities.v_most_dili_concern * 100}%` }}></div>
                  </div>
                </div>
              </div>

              {/* Patient Vulnerability Modifiers */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs space-y-2">
                <span className="text-slate-400 text-[11px] block">Patient Baseline Vulnerability:</span>
                {simulationResult.prediction.patient_baseline_factors.vulnerability_flags.length > 0 ? (
                  <ul className="space-y-1">
                    {simulationResult.prediction.patient_baseline_factors.vulnerability_flags.map((flag, idx) => (
                      <li key={idx} className="text-amber-300 text-[11px] flex items-start gap-1.5">
                        <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-400" />
                        <span>{flag}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="text-emerald-400 text-[11px] flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Baseline transaminases and bilirubin within normal physiological limits.</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Section C: Biological Response (LINCS L1000) */}
          {biologicalResult && (
            <div className="space-y-2">
              <GeneExpressionChart
                geneZscores={biologicalResult.landmark_gene_zscores}
                cellLine={biologicalResult.cell_line}
                doseUm={biologicalResult.experimental_dose_um}
                timeHours={biologicalResult.exposure_time_hours}
                cluster={biologicalResult.cluster_assignment}
                stressIndex={biologicalResult.pathway_stress_index}
              />
            </div>
          )}

          {/* Section D: Explainable AI with SHAP */}
          {simulationResult.explainability && (
            <div className="space-y-2">
              <ShapWaterfallChart
                baseValue={simulationResult.explainability.base_value}
                contributions={simulationResult.explainability.waterfall}
                scientificSummary={simulationResult.explainability.scientific_summary}
              />
            </div>
          )}

          {/* Section E: Evidence, Limitations & Medical Disclaimer */}
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-900/40 text-amber-200/90 text-xs flex items-start gap-3">
            <Info className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <strong className="text-white font-semibold">Scientific Evidence & Legal Disclaimer:</strong>
              <p className="leading-relaxed text-[11px]">
                {simulationResult.prediction.disclaimer} This application is an investigational prototype by Team BioNex at VIT Bhopal University. It does not replace medical consultation.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
