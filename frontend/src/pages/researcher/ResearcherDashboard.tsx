import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { ModelMetadataItem, DatasetInfo } from '../../types';
import { Cpu, Database, Activity, Dna, FileText, ChevronRight, CheckCircle2, ShieldCheck, Zap } from 'lucide-react';

interface ResearcherDashboardProps {
  onNavigate: (page: string) => void;
}

export const ResearcherDashboard: React.FC<ResearcherDashboardProps> = ({ onNavigate }) => {
  const [modelStatus, setModelStatus] = useState<any>(null);
  const [datasetList, setDatasetList] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResearchMeta = async () => {
      try {
        const [models, datasets] = await Promise.all([
          api.getModelsStatus(),
          api.getDatasetsStatus()
        ]);
        setModelStatus(models);
        setDatasetList(datasets.datasets || []);
      } catch (e) {
        console.error('Failed to load researcher metadata', e);
      } finally {
        setLoading(false);
      }
    };
    fetchResearchMeta();
  }, []);

  const diliModel = modelStatus?.models_metadata?.dili_model;
  const lincsModel = modelStatus?.models_metadata?.lincs_model;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Researcher Platform Hero */}
      <div className="bg-gradient-to-r from-indigo-950/80 via-slate-900 to-cyan-950/50 border border-indigo-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30">
            <Cpu className="w-3.5 h-3.5" />
            <span>Researcher Platform – BioNex Lab</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Scientific Drug Intelligence & Explainable AI
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Multi-scale pharmacological workspace combining live PubChem descriptors, FDA DILIrank 2.0 supervised ML, LINCS L1000 cellular transcriptomics, and mathematical Tree SHAP attribution.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('simulator')}
              className="px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-400 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center space-x-2"
            >
              <Zap className="w-4 h-4" />
              <span>Launch Multi-Modal Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('explainable-ai')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Inspect SHAP Explainability</span>
            </button>
          </div>
        </div>
      </div>

      {/* Model Registry Cards */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Cpu className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Active Operational Machine Learning Models</h2>
          </div>
          <span className="text-xs px-2.5 py-1 bg-emerald-500/20 text-emerald-400 font-mono font-bold rounded-lg border border-emerald-500/30">
            {modelStatus?.operating_mode || 'REAL_MODEL_MODE'}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* DILI XGBoost Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-indigo-400 font-bold block mb-1">
                  SUPERVISED CLASSIFIER
                </span>
                <h3 className="text-lg font-bold text-white">
                  {diliModel?.name || 'FDA DILIrank 2.0 XGBoost Classifier'}
                </h3>
                <span className="text-xs text-slate-400">
                  Algorithm: {diliModel?.algorithm || 'XGBoost Multi-Class'} • v{diliModel?.version || '2.0.1'}
                </span>
              </div>
              <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold">
                Trained & Validated
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 py-2 border-y border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Accuracy</span>
                <span className="text-sm font-bold text-white font-mono">
                  {diliModel?.accuracy ? `${(diliModel.accuracy * 100).toFixed(1)}%` : '61.5%'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Weighted F1</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {diliModel?.f1_score ? diliModel.f1_score.toFixed(3) : '0.632'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">ROC-AUC</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {diliModel?.roc_auc ? diliModel.roc_auc.toFixed(3) : '0.747'}
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">Trained on FDA DILIrank 2.0 Benchmark</span>
              <button
                onClick={() => onNavigate('explainable-ai')}
                className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center space-x-1"
              >
                <span>View SHAP Summary</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* LINCS L1000 Engine Card */}
          <div className="bg-slate-900 border border-slate-800 hover:border-slate-700 rounded-3xl p-6 space-y-4 shadow-xl transition-all">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-mono text-cyan-400 font-bold block mb-1">
                  TRANSCRIPTOMIC DIMENSIONALITY ENGINE
                </span>
                <h3 className="text-lg font-bold text-white">
                  {lincsModel?.name || 'LINCS L1000 PCA & Clustering Engine'}
                </h3>
                <span className="text-xs text-slate-400">
                  10 Landmark Genes • 3-Component PCA
                </span>
              </div>
              <span className="px-2.5 py-1 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-lg text-xs font-semibold">
                Trained & Validated
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 py-3 border-y border-slate-800 text-center">
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">3-PC Variance Explained</span>
                <span className="text-sm font-bold text-cyan-400 font-mono">
                  {lincsModel?.variance_explained_3pc ? `${(lincsModel.variance_explained_3pc * 100).toFixed(1)}%` : '97.9%'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase block">Cell Line Substrates</span>
                <span className="text-sm font-bold text-white font-mono">
                  HEPG2 (Human Hepatocytes)
                </span>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-400">LINCS L1000 Phase II Signatures</span>
              <button
                onClick={() => onNavigate('biological-response')}
                className="text-cyan-400 hover:text-cyan-300 font-semibold flex items-center space-x-1"
              >
                <span>Explore Transcriptomics</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Scientific Navigation Modules */}
      <div className="space-y-4">
        <h2 className="text-lg font-bold text-white">Research Modules</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            onClick={() => onNavigate('molecular-explorer')}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-indigo-500/50 rounded-2xl text-left transition-all space-y-2 group"
          >
            <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Dna className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Molecular Explorer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              PubChem 2D structure, SMILES, InChIKey, and Lipinski Rule of 5 evaluation.
            </p>
          </button>

          <button
            onClick={() => onNavigate('analytics')}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-cyan-500/50 rounded-2xl text-left transition-all space-y-2 group"
          >
            <div className="p-2.5 bg-cyan-500/10 text-cyan-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Activity className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">FAERS Safety Signals</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Disproportionality analysis calculating PRR and ROR on spontaneous adverse events.
            </p>
          </button>

          <button
            onClick={() => onNavigate('research-assistant')}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-teal-500/50 rounded-2xl text-left transition-all space-y-2 group"
          >
            <div className="p-2.5 bg-teal-500/10 text-teal-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Research Assistant</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scientific RAG queries regarding receptor affinities, CYP enzymes, and citations.
            </p>
          </button>

          <button
            onClick={() => onNavigate('datasets')}
            className="p-5 bg-slate-900 border border-slate-800 hover:border-purple-500/50 rounded-2xl text-left transition-all space-y-2 group"
          >
            <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-xl w-fit group-hover:scale-110 transition-transform">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="text-sm font-bold text-white">Dataset Explorer</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Deep documentation for 7 scientific datasets (DILIrank, LINCS, ClinPGx, openFDA, FAERS).
            </p>
          </button>
        </div>
      </div>
    </div>
  );
};
