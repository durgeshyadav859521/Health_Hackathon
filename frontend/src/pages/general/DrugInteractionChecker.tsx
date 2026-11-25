import React, { useState } from 'react';
import { api } from '../../services/api';
import { InteractionCheckResult, DrugInteractionItem } from '../../types';
import { ShieldAlert, AlertTriangle, CheckCircle, Info, Plus, X, Search, ShieldCheck } from 'lucide-react';

const COMMON_DRUGS = [
  'Warfarin', 'Aspirin', 'Ibuprofen', 'Acetaminophen', 'Atorvastatin',
  'Metformin', 'Clarithromycin', 'Amoxicillin', 'Methotrexate'
];

export const DrugInteractionChecker: React.FC = () => {
  const [selectedDrugs, setSelectedDrugs] = useState<string[]>(['Warfarin', 'Aspirin']);
  const [customDrugInput, setCustomDrugInput] = useState('');
  const [interactionResult, setInteractionResult] = useState<InteractionCheckResult | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAddDrug = (drugName: string) => {
    const clean = drugName.trim();
    if (clean && !selectedDrugs.includes(clean)) {
      setSelectedDrugs([...selectedDrugs, clean]);
    }
  };

  const handleRemoveDrug = (drugName: string) => {
    setSelectedDrugs(selectedDrugs.filter(d => d !== drugName));
  };

  const handleCheckInteractions = async () => {
    if (selectedDrugs.length < 2) return;
    setLoading(true);
    try {
      const res = await api.checkDrugInteractions(selectedDrugs);
      setInteractionResult(res);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-semibold border border-amber-500/30">
          <ShieldAlert className="w-3.5 h-3.5" />
          <span>Multi-Drug Interaction Engine</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Check Potential Drug Interactions
        </h1>
        <p className="text-sm text-slate-300">
          Select two or more medications to analyze pharmacokinetic synergies, enzymatic competition, and safety warnings.
        </p>
      </div>

      {/* Drug Selection Panel */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl space-y-6 max-w-4xl mx-auto">
        <div>
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
            Selected Medicines to Cross-Evaluate (Minimum 2 required)
          </label>
          <div className="flex flex-wrap items-center gap-2 min-h-[46px] p-2 bg-slate-950 border border-slate-800 rounded-2xl">
            {selectedDrugs.map((drug) => (
              <span
                key={drug}
                className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-teal-500/20 text-teal-300 border border-teal-500/40 rounded-xl text-xs font-semibold"
              >
                <span>{drug}</span>
                <button onClick={() => handleRemoveDrug(drug)} className="hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}

            <div className="flex items-center space-x-2 flex-1 min-w-[200px]">
              <input
                type="text"
                value={customDrugInput}
                onChange={(e) => setCustomDrugInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddDrug(customDrugInput);
                    setCustomDrugInput('');
                  }
                }}
                placeholder="Type drug name and press enter..."
                className="w-full bg-transparent text-xs text-white placeholder-slate-500 focus:outline-none px-2"
              />
              <button
                onClick={() => {
                  handleAddDrug(customDrugInput);
                  setCustomDrugInput('');
                }}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs"
              >
                Add
              </button>
            </div>
          </div>
        </div>

        {/* Quick Add Suggestions */}
        <div className="space-y-2">
          <span className="text-xs text-slate-400 block font-medium">Quick Add Suggestions:</span>
          <div className="flex flex-wrap gap-2">
            {COMMON_DRUGS.map((drug) => (
              <button
                key={drug}
                onClick={() => handleAddDrug(drug)}
                disabled={selectedDrugs.includes(drug)}
                className="px-3 py-1 bg-slate-800/60 hover:bg-slate-800 disabled:opacity-40 text-slate-300 rounded-lg text-xs border border-slate-700/60 transition-colors"
              >
                + {drug}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCheckInteractions}
          disabled={selectedDrugs.length < 2 || loading}
          className="w-full py-3 bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-400 hover:to-cyan-400 disabled:opacity-50 text-slate-950 font-bold text-sm rounded-2xl shadow-lg transition-all"
        >
          {loading ? 'Analyzing Cross-Interactions...' : `Evaluate Interactions (${selectedDrugs.length} Medicines)`}
        </button>
      </div>

      {/* Results Display */}
      {interactionResult && (
        <div className="space-y-6 max-w-4xl mx-auto">
          {/* Status Alert Banner */}
          <div className={`p-5 rounded-2xl border flex items-start space-x-3 text-sm ${
            interactionResult.overall_status === 'High Clinical Alert'
              ? 'bg-rose-950/25 border-rose-800/50 text-rose-200'
              : interactionResult.overall_status === 'Precautionary Monitoring Advised'
              ? 'bg-amber-950/25 border-amber-800/50 text-amber-200'
              : 'bg-emerald-950/25 border-emerald-800/50 text-emerald-200'
          }`}>
            <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h4 className="font-bold text-base">
                Status: {interactionResult.overall_status}
              </h4>
              <p className="text-xs opacity-90 leading-relaxed">
                Evaluated {interactionResult.total_pairs_evaluated} pairwise combinations across {interactionResult.evaluated_drugs.join(', ')}.
              </p>
            </div>
          </div>

          {/* Pairwise Cards */}
          <div className="space-y-4">
            {interactionResult.interactions.map((item, idx) => (
              <div
                key={idx}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-800 pb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-white text-base">
                      {item.drug_1} + {item.drug_2}
                    </span>
                  </div>
                  <span className={`px-2.5 py-1 rounded-md text-xs font-bold self-start sm:self-auto ${
                    item.severity === 'Major'
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                      : item.severity === 'Moderate'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-slate-800 text-slate-300'
                  }`}>
                    {item.severity}
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div>
                    <h5 className="font-bold text-white mb-0.5">{item.title}</h5>
                    <p className="text-slate-300 leading-relaxed">{item.mechanism}</p>
                  </div>

                  <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                    <strong className="text-teal-300 block mb-1">Clinical Action / Recommendation:</strong>
                    <p className="text-slate-300">{item.clinical_action}</p>
                  </div>

                  <div className="text-[10px] text-slate-500 pt-1">
                    Source: {item.evidence_source} ({item.documentation_level})
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mandatory Safety Disclaimer */}
          <div className="bg-amber-950/20 border border-amber-800/40 p-4.5 rounded-2xl flex items-start space-x-3 text-xs text-amber-200">
            <Info className="w-5 h-5 shrink-0 mt-0.5 text-amber-400" />
            <p className="leading-relaxed">
              {interactionResult.disclaimer}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
