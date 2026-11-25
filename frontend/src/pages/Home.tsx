import React from 'react';
import {
  Activity, ArrowRight, Dna, ShieldCheck, Database, Cpu,
  Sparkles, CheckCircle2, AlertTriangle, Layers, BookOpen, ExternalLink
} from 'lucide-react';
import { HumanBodyAnatomy } from '../components/HumanBodyAnatomy';

interface HomeProps {
  onStartSimulation: () => void;
  onExploreTech: () => void;
}

export const Home: React.FC<HomeProps> = ({ onStartSimulation, onExploreTech }) => {
  return (
    <div className="space-y-20 pb-16">
      {/* 1. Hero Section */}
      <section className="relative pt-8 pb-12 overflow-hidden">
        {/* Ambient Glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[350px] bg-gradient-to-tr from-[#06D6A0]/15 to-[#3A86FF]/15 blur-[120px] pointer-events-none rounded-full"></div>

        <div className="max-w-5xl mx-auto text-center space-y-6 px-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-xs font-semibold text-[#00F5D4] shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-[#06D6A0]" />
            <span>BioNex &bull; Predictive & Preventive Health Intelligence</span>
          </div>

          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Understand How Medicines <br />
            <span className="bg-gradient-to-r from-[#06D6A0] via-[#00F5D4] to-[#3A86FF] bg-clip-text text-transparent">
              May Affect Your Body.
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-3xl mx-auto leading-relaxed">
            Explore drug responses using biomedical research, patient baseline information, pharmacological knowledge, and explainable artificial intelligence.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 pt-2">
            <button
              onClick={onStartSimulation}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-bold bg-gradient-to-r from-[#06D6A0] to-[#00F5D4] text-[#0B132B] hover:shadow-lg hover:shadow-[#06D6A0]/25 transition-all transform hover:-translate-y-0.5"
            >
              Start Simulation
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={onExploreTech}
              className="flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#1C2541]/80 hover:bg-slate-800 text-white border border-slate-700 hover:border-[#06D6A0]/40 transition-all"
            >
              Explore the Technology
            </button>
          </div>
        </div>

        {/* Interactive Human Anatomy Visualization */}
        <div className="max-w-6xl mx-auto mt-12 px-4">
          <HumanBodyAnatomy />
        </div>
      </section>

      {/* 2. The Healthcare Problem */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-700/80 bg-[#0F172A]/80">
          <div className="max-w-3xl mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-[#06D6A0]">The Clinical Challenge</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
              Why Different Individuals Respond Differently to the Same Medicine
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 mt-2 leading-relaxed">
              Most conventional medicine platforms display static, one-size-fits-all labels (uses, warnings, and standard doses). However, real-world biological responses vary dramatically across individuals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { title: "Metabolic Biomarkers", desc: "Baseline liver (ALT, AST, Bilirubin) and kidney (eGFR, Creatinine) functions govern clearance and drug accumulation risk.", icon: Activity },
              { title: "Physiological Factors", desc: "Age, body weight, BMI, and baseline cardiovascular metrics modify volume of distribution and half-life.", icon: Dna },
              { title: "Pharmacogenomic Variations", desc: "CYP450 enzyme polymorphisms (CYP2D6, CYP2C19, CYP2C9) alter active metabolite generation by up to 500%.", icon: Cpu },
              { title: "Exposure Duration & Dose", desc: "High daily milligram dosage combined with high lipophilicity (FDA Rule of 2) triggers mitochondrial stress.", icon: Layers }
            ].map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                  <div className="w-8 h-8 rounded-lg bg-[#06D6A0]/10 flex items-center justify-center text-[#06D6A0] mb-3">
                    <Icon className="w-4 h-4" />
                  </div>
                  <h3 className="font-bold text-white text-sm mb-1">{f.title}</h3>
                  <p className="text-slate-400 leading-relaxed text-[11px]">{f.desc}</p>
                </div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl bg-slate-800/40 border border-slate-700/60 text-xs text-slate-300 flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-white font-semibold">The Information Gap:</strong> Conventional medicine portals provide general monographs but do not link an individual's baseline health status with experimental transcriptional responses or explain <span className="text-[#00F5D4] font-medium">why</span> an AI model classifies risk. MediSim AI closes this critical gap.
            </div>
          </div>
        </div>
      </section>

      {/* 3. Our Proposed Solution */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-10">
          <span className="text-xs font-bold uppercase tracking-wider text-[#06D6A0]">The MediSim AI Approach</span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">
            An Integrated Biomedical Intelligence Platform
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 mt-2">
            Combining verified scientific databases, experimental biology, and explainable supervised machine learning.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-panel p-6 rounded-2xl border border-slate-700/70 bg-[#0F172A]/80 hover:border-[#06D6A0]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-cyan-950/60 border border-cyan-800 flex items-center justify-center text-[#00F5D4] mb-4">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">1. Scientific Data Provenance</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Live integration with NCBI PubChem for molecular descriptors, openFDA for official boxed warnings, and curated FDA DILIrank 2.0 & LINCS L1000 datasets. Zero fabricated records.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/70 bg-[#0F172A]/80 hover:border-[#06D6A0]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-emerald-950/60 border border-emerald-800 flex items-center justify-center text-[#06D6A0] mb-4">
              <Cpu className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">2. Validated ML Classification</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Supervised classifiers (Logistic Regression, Random Forest, XGBoost) trained on FDA DILIrank benchmarks with class-imbalance weighting, stratified evaluation, and ROC-AUC verification.
            </p>
          </div>

          <div className="glass-panel p-6 rounded-2xl border border-slate-700/70 bg-[#0F172A]/80 hover:border-[#06D6A0]/40 transition-all">
            <div className="w-10 h-10 rounded-xl bg-blue-950/60 border border-blue-800 flex items-center justify-center text-blue-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-base font-bold text-white mb-2">3. Explainable AI with SHAP</h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              Every prediction is decomposed via SHAP TreeExplainer into exact positive and negative feature contributions, providing auditable scientific rationale rather than an opaque black box.
            </p>
          </div>
        </div>
      </section>

      {/* 4. How MediSim AI Works: 4-Step Pipeline */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="glass-panel p-8 rounded-2xl border border-slate-700/80 bg-[#0F172A]/80">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-[#06D6A0]">Workflow Architecture</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white mt-1">How MediSim AI Operates</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
            {[
              { step: "01", title: "Drug Identification", desc: "Queries PubChem & openFDA for chemical structure, CIDs, SMILES, and regulatory labeling." },
              { step: "02", title: "Patient Baseline", desc: "Integrates age, biological sex, BMI, and baseline transaminase & renal lab values." },
              { step: "03", title: "Multimodal AI Inference", desc: "Executes DILIrank supervised toxicity classifier & LINCS L1000 gene perturbation modeling." },
              { step: "04", title: "Explainability & PDF", desc: "Computes SHAP waterfall attributions and exports a complete publication-grade PDF report." }
            ].map((s, i) => (
              <div key={i} className="p-4 rounded-xl bg-slate-900 border border-slate-800 text-xs relative">
                <span className="text-2xl font-black text-[#06D6A0]/30 absolute top-3 right-3">{s.step}</span>
                <h3 className="font-bold text-white text-sm mb-1 mt-1">{s.title}</h3>
                <p className="text-slate-400 leading-relaxed text-[11px]">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. Responsible AI and Safety */}
      <section className="max-w-6xl mx-auto px-4">
        <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-[#0B132B] to-slate-900 border border-slate-700/80">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div className="space-y-2 max-w-2xl">
              <span className="text-xs font-bold uppercase tracking-wider text-[#06D6A0]">Responsible AI & Safety</span>
              <h2 className="text-xl sm:text-2xl font-bold text-white">
                Committed to Scientific Integrity & Medical Ethics
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                MediSim AI strictly adheres to responsible AI practices: we never fabricate clinical predictions, never describe cell-line assays as direct whole-human organ responses, prominently display statistical reporting biases, and protect sensitive baseline inputs.
              </p>
            </div>
            <button
              onClick={onStartSimulation}
              className="px-6 py-3 rounded-xl text-xs font-bold bg-[#06D6A0] text-[#0B132B] hover:bg-[#00F5D4] transition-all whitespace-nowrap"
            >
              Launch AI Simulator
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};
