import React from 'react';
import { ShieldAlert, Dna, ExternalLink, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="mt-20 border-t border-slate-800 bg-[#070D1E] text-slate-400 text-xs">
      {/* Safety Notice Banner */}
      <div className="bg-amber-950/20 border-b border-amber-900/30 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-start gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-amber-200/90 leading-relaxed text-[11px]">
            <strong className="text-amber-300 font-semibold">Educational & Research Disclaimer:</strong> MediSim AI is an educational, data-driven biomedical research platform developed by Team BioNex at VIT Bhopal University. It is <strong>NOT</strong> an autonomous diagnostic device, prescribing engine, or substitute for professional medical care. Never modify prescribed medications without direct clinical guidance from a licensed healthcare provider.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Col 1: Brand & Team */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Dna className="w-5 h-5 text-[#06D6A0]" />
              <span className="text-base font-bold text-white tracking-tight">MediSim<span className="text-[#06D6A0]">AI</span></span>
            </div>
            <p className="text-[11px] leading-relaxed text-slate-400">
              Simulating and Explaining Drug Responses Using AI. Transforming complex biomedical datasets into explainable, evidence-based health intelligence.
            </p>
            <div className="pt-2 text-[11px] text-slate-300">
              <p className="font-semibold text-white">Team BioNex</p>
              <p>VIT Bhopal University</p>
              <p className="text-[#06D6A0]">Predictive & Preventive Health Intelligence</p>
            </div>
          </div>

          {/* Col 2: Scientific Datasets */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Official Data Sources</h4>
            <ul className="space-y-1.5 text-[11px]">
              <li>
                <a href="https://pubchem.ncbi.nlm.nih.gov/" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  PubChem Compound Database <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://open.fda.gov/apis/drug/label/" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  openFDA Drug Labels (SPL) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.fda.gov/science-research/liver-toxicity-knowledge-base-ltkb/drug-induced-liver-injury-rank-dilirank-20-dataset" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  FDA DILIrank 2.0 LTKB <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://lincsproject.org/" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  LINCS L1000 Gene Compendium <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://www.clinpgx.org/" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  ClinPGx & CPIC Guidelines <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
              <li>
                <a href="https://open.fda.gov/data/faers/" target="_blank" rel="noreferrer" className="hover:text-[#06D6A0] flex items-center gap-1">
                  FDA Adverse Event Reporting (FAERS) <ExternalLink className="w-2.5 h-2.5 opacity-60" />
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Technology Stack */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">AI & ML Architecture</h4>
            <ul className="space-y-1 text-[11px]">
              <li>&bull; Scikit-Learn & XGBoost Classifiers</li>
              <li>&bull; SHAP Tree & Kernel Explainers</li>
              <li>&bull; LINCS L1000 Landmark Transcriptomics</li>
              <li>&bull; Fast Multi-Endpoint FastAPI Engine</li>
              <li>&bull; ReportLab PDF Medical Reporting</li>
              <li>&bull; React 19 + TypeScript + Tailwind CSS</li>
            </ul>
          </div>

          {/* Col 4: Responsible AI */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-white mb-3">Responsible AI Charter</h4>
            <p className="text-[11px] leading-relaxed text-slate-400">
              We strictly separate in-vitro cell-line experimental data from clinical organ outcomes, explicitly compute SHAP feature contributions without LLM fabrication, and disclose all statistical bounds.
            </p>
            <div className="mt-3 p-2 rounded bg-slate-900 border border-slate-800 text-[10px] text-slate-300">
              <span className="text-[#06D6A0] font-semibold">Privacy by Design:</span> Patient baseline data is ephemeral and can be permanently purged at any time.
            </div>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-400">
          <p>&copy; {new Date().getFullYear()} MediSim AI &bull; Developed by Team BioNex, VIT Bhopal University. All rights reserved.</p>
          <p className="flex items-center gap-1 text-slate-300">
            Engineered with scientific rigor & healthcare ethics
          </p>
        </div>
      </div>
    </footer>
  );
};
