import React, { useState, useEffect } from 'react';
import { Layers, Dna, Play, Sparkles, AlertCircle, RefreshCw, BarChart2 } from 'lucide-react';
import { api } from '../services/api';
import { GeneExpressionChart } from '../components/GeneExpressionChart';
import { BiologicalResponse as BioRespType, DrugCompound } from '../types';

export const BiologicalResponse: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<string>('Acetaminophen');
  const [cellLine, setCellLine] = useState<string>('HEPG2');
  const [doseUm, setDoseUm] = useState<number>(10.0);
  const [timeHours, setTimeHours] = useState<number>(24);
  const [catalog, setCatalog] = useState<DrugCompound[]>([]);
  const [bioResult, setBioResult] = useState<BioRespType | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    api.getCatalog().then(drugs => setCatalog(drugs));
    handleSimulate();
  }, []);

  const handleSimulate = async () => {
    setLoading(true);
    try {
      const res = await api.runBiologicalSimulation({
        drug_name: selectedDrug,
        cell_line: cellLine,
        dose_um: doseUm,
        time_h: timeHours
      });
      setBioResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-[#06D6A0]" />
          Biological Response & LINCS L1000 Explorer
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore experimental in-vitro transcriptional responses across hallmark landmark genes, cell lines, and exposure conditions.
        </p>
      </div>

      {/* Experimental Parameter Controls */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-[#06D6A0] flex items-center gap-2">
          <Sparkles className="w-4 h-4" />
          Experimental Assay Configuration
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs">
          {/* Target Drug */}
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Perturbagen (Drug)</label>
            <select
              value={selectedDrug}
              onChange={(e) => setSelectedDrug(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              {catalog.map(c => (
                <option key={c.cid} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>

          {/* Cell Line */}
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Cell Line Assay</label>
            <select
              value={cellLine}
              onChange={(e) => setCellLine(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value="HEPG2">HEPG2 (Human Hepatocellular / Liver)</option>
              <option value="A549">A549 (Human Lung Carcinoma)</option>
              <option value="MCF7">MCF7 (Human Breast Adenocarcinoma)</option>
              <option value="PC3">PC3 (Human Prostate Carcinoma)</option>
            </select>
          </div>

          {/* Dose */}
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Drug Concentration (µM)</label>
            <select
              value={doseUm}
              onChange={(e) => setDoseUm(Number(e.target.value))}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
            >
              <option value={0.1}>0.1 µM (Low Exposure)</option>
              <option value={1.0}>1.0 µM (Sub-Micromolar)</option>
              <option value={5.0}>5.0 µM (Mid Exposure)</option>
              <option value={10.0}>10.0 µM (Standard LINCS Landmark)</option>
            </select>
          </div>

          {/* Exposure Time */}
          <div>
            <label className="block text-slate-300 mb-1 font-semibold">Incubation Time</label>
            <div className="flex gap-2">
              <select
                value={timeHours}
                onChange={(e) => setTimeHours(Number(e.target.value))}
                className="flex-1 px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white"
              >
                <option value={6}>6 Hours</option>
                <option value={24}>24 Hours</option>
              </select>
              <button
                onClick={handleSimulate}
                disabled={loading}
                className="px-4 py-2 rounded-lg bg-[#06D6A0] text-[#0B132B] font-bold hover:bg-[#00F5D4] transition-all disabled:opacity-50"
              >
                {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : 'Run'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Results View */}
      {bioResult && (
        <div className="space-y-6">
          <GeneExpressionChart
            geneZscores={bioResult.landmark_gene_zscores}
            cellLine={bioResult.cell_line_description || bioResult.cell_line}
            doseUm={bioResult.experimental_dose_um}
            timeHours={bioResult.exposure_time_hours}
            cluster={bioResult.cluster_assignment}
            stressIndex={bioResult.pathway_stress_index}
          />

          {/* 3D PCA Projection Cards */}
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Principal Component Analysis (PCA) Transcriptional Space
            </h3>
            <p className="text-xs text-slate-300">
              Dimensionality reduction projects 10-dimensional landmark gene expression vectors into principal components explaining biological perturbation patterns.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">PC1 (Cytotoxicity & Apoptosis Axis)</span>
                <span className="font-mono text-cyan-300 text-lg font-bold">
                  {bioResult.pca_coordinates.pc1 > 0 ? `+${bioResult.pca_coordinates.pc1}` : bioResult.pca_coordinates.pc1}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Strongly weighted by TP53, CASP3, HMOX1</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">PC2 (Cytokine & Inflammatory Axis)</span>
                <span className="font-mono text-emerald-300 text-lg font-bold">
                  {bioResult.pca_coordinates.pc2 > 0 ? `+${bioResult.pca_coordinates.pc2}` : bioResult.pca_coordinates.pc2}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Reflects TNF, IL6, SOD1 modulation</p>
              </div>
              <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                <span className="text-slate-400 text-[10px] block">PC3 (Metabolic Survival Axis)</span>
                <span className="font-mono text-purple-300 text-lg font-bold">
                  {bioResult.pca_coordinates.pc3 > 0 ? `+${bioResult.pca_coordinates.pc3}` : bioResult.pca_coordinates.pc3}
                </span>
                <p className="text-[10px] text-slate-500 mt-1">Reflects CYP3A4 vs MTOR kinase shifts</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
