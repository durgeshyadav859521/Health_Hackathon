import React, { useState, useEffect } from 'react';
import {
  Search, BookOpen, AlertOctagon, CheckCircle2, ShieldAlert,
  Dna, Sparkles, ExternalLink, ArrowRight, Activity, Info
} from 'lucide-react';
import { api } from '../services/api';
import { DrugCompound, DrugSafetyLabel, FaersData } from '../types';

interface DrugExplorerProps {
  onSelectForSimulation: (drugName: string) => void;
}

export const DrugExplorer: React.FC<DrugExplorerProps> = ({ onSelectForSimulation }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<DrugCompound | null>(null);
  const [safetyLabel, setSafetyLabel] = useState<DrugSafetyLabel | null>(null);
  const [faersData, setFaersData] = useState<FaersData | null>(null);
  const [pgxData, setPgxData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [catalog, setCatalog] = useState<DrugCompound[]>([]);

  useEffect(() => {
    // Load pre-indexed catalog
    api.getCatalog().then(drugs => {
      setCatalog(drugs);
      if (drugs.length > 0) {
        handleSelectDrug(drugs[0]);
      }
    });
  }, []);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoading(true);

    try {
      const results = await api.searchDrugs(searchQuery.trim());
      if (results && results.length > 0) {
        handleSelectDrug(results[0]);
      } else {
        alert(`No direct match found for "${searchQuery}". Please select from the verified scientific catalog.`);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectDrug = async (drug: DrugCompound) => {
    setSelectedDrug(drug);
    setLoading(true);
    try {
      const [safetyRes, detailsRes] = await Promise.all([
        api.getDrugSafety(drug.name),
        api.getDrugDetails(drug.name)
      ]);
      setSafetyLabel(safetyRes.openfda_label);
      setFaersData(safetyRes.faers_adverse_events);
      setPgxData(detailsRes.pharmacogenomics);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
            <BookOpen className="w-6 h-6 text-[#06D6A0]" />
            Drug Information Explorer
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Query PubChem chemical descriptors, openFDA official safety labels, and FAERS real-world adverse signals.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSearch} className="w-full md:w-96 flex items-center gap-2">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search Acetaminophen, Ibuprofen, Amiodarone..."
              className="w-full pl-9 pr-3 py-2 bg-slate-900/90 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06D6A0]"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 rounded-xl text-xs font-bold bg-[#06D6A0] text-[#0B132B] hover:bg-[#00F5D4] transition-all disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
      </div>

      {/* Quick Catalog Chips */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">Verified Catalog:</span>
        {catalog.map(c => (
          <button
            key={c.cid}
            onClick={() => handleSelectDrug(c)}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              selectedDrug?.name === c.name
                ? 'bg-[#06D6A0] text-[#0B132B] font-bold shadow-md shadow-[#06D6A0]/20'
                : 'bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700'
            }`}
          >
            {c.name}
          </button>
        ))}
      </div>

      {selectedDrug && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Chemical Structure & Molecular Descriptors */}
          <div className="lg:col-span-5 space-y-6">
            {/* Molecular Profile Card */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-xl font-extrabold text-white">{selectedDrug.name}</h3>
                  <p className="text-xs text-slate-400">
                    Synonyms: {selectedDrug.synonyms?.join(', ') || 'N/A'}
                  </p>
                </div>
                <button
                  onClick={() => onSelectForSimulation(selectedDrug.name)}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#06D6A0] to-[#00F5D4] text-[#0B132B] hover:shadow-lg hover:shadow-[#06D6A0]/20 transition-all shrink-0"
                >
                  Simulate
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* 2D Chemical Rendering */}
              <div className="p-4 rounded-xl bg-white/95 flex flex-col items-center justify-center border border-slate-700 relative">
                <img
                  src={selectedDrug.structure_url}
                  alt={`${selectedDrug.name} 2D Chemical Structure`}
                  className="h-44 object-contain"
                  onError={(e) => {
                    // Fallback visual if external image is restricted
                    (e.target as HTMLElement).style.display = 'none';
                  }}
                />
                <span className="text-[10px] text-slate-600 font-mono mt-2">
                  PubChem 2D Structure Representation (CID: {selectedDrug.cid})
                </span>
              </div>

              {/* Physicochemical Descriptors Grid */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                  Physicochemical Descriptors (PubChem)
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Molecular Formula</span>
                    <span className="font-mono text-cyan-300 font-semibold">{selectedDrug.formula}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Molecular Weight</span>
                    <span className="font-mono text-white font-semibold">{selectedDrug.mw} g/mol</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Lipophilicity (XLogP)</span>
                    <span className={`font-mono font-semibold ${selectedDrug.logp >= 3 ? 'text-amber-400' : 'text-emerald-400'}`}>
                      {selectedDrug.logp} {selectedDrug.logp >= 3 ? '(High)' : '(Favorable)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Polar Surface Area (TPSA)</span>
                    <span className="font-mono text-white font-semibold">{selectedDrug.tpsa} Å²</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">H-Bond Donors / Acceptors</span>
                    <span className="font-mono text-white font-semibold">{selectedDrug.hbd} / {selectedDrug.hba}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">Rotatable Bonds</span>
                    <span className="font-mono text-white font-semibold">{selectedDrug.rot_bonds}</span>
                  </div>
                </div>
              </div>

              {/* SMILES */}
              <div>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                  Canonical SMILES
                </span>
                <div className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 font-mono text-[10px] text-slate-300 break-all">
                  {selectedDrug.smiles}
                </div>
              </div>
            </div>

            {/* Pharmacogenomics Note (if present) */}
            {pgxData && (
              <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-800/40 text-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-purple-300 flex items-center gap-1.5">
                    <Dna className="w-4 h-4 text-purple-400" />
                    ClinPGx Pharmacogenomics ({pgxData.gene})
                  </span>
                  <span className="px-2 py-0.5 rounded bg-purple-900/60 text-purple-200 text-[10px] font-semibold">
                    Evidence {pgxData.evidence_level}
                  </span>
                </div>
                <p className="text-slate-300 text-[11px] leading-relaxed">
                  {pgxData.clinical_summary}
                </p>
              </div>
            )}
          </div>

          {/* Right Column: openFDA Regulatory Safety & FAERS Signals */}
          <div className="lg:col-span-7 space-y-6">
            {/* Boxed Warnings Banner */}
            {safetyLabel && safetyLabel.boxed_warning && !safetyLabel.boxed_warning.toLowerCase().includes('none') && (
              <div className="p-4 rounded-xl bg-rose-950/30 border border-rose-800/60 text-xs space-y-1.5">
                <div className="flex items-center gap-2 text-rose-400 font-bold uppercase tracking-wider text-[11px]">
                  <AlertOctagon className="w-4 h-4 text-rose-500 shrink-0" />
                  FDA Boxed Warning (Black Box Warning)
                </div>
                <p className="text-rose-200/90 leading-relaxed text-[11px] bg-rose-950/20 p-2.5 rounded border border-rose-900/30">
                  {safetyLabel.boxed_warning}
                </p>
              </div>
            )}

            {/* Regulatory Labeling Sections */}
            <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#06D6A0] flex items-center gap-2">
                <ShieldAlert className="w-4 h-4" />
                openFDA Structured Product Labeling (SPL)
              </h3>

              {safetyLabel ? (
                <div className="space-y-4 text-xs">
                  <div>
                    <h4 className="font-semibold text-white mb-1">Approved Indications & Usage</h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      {safetyLabel.indications}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Mechanism of Action</h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      {safetyLabel.mechanism_of_action}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Contraindications</h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      {safetyLabel.contraindications}
                    </p>
                  </div>

                  <div>
                    <h4 className="font-semibold text-white mb-1">Warnings and Precautions</h4>
                    <p className="text-slate-300 leading-relaxed bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                      {safetyLabel.warnings}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center text-slate-500 text-xs">Loading official FDA labeling...</div>
              )}
            </div>

            {/* FAERS Adverse Event Surveillance */}
            {faersData && (
              <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-2">
                      <Activity className="w-4 h-4" />
                      FAERS Post-Marketing Surveillance Signals
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Total Reports Analyzed: <strong className="text-white">{faersData.total_reports_indexed?.toLocaleString()}</strong> &bull; Source: openFDA FAERS
                    </p>
                  </div>
                </div>

                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-slate-400 text-[10px] uppercase font-semibold">
                        <th className="py-2 px-3">Reported Reaction Term</th>
                        <th className="py-2 px-3">Report Count</th>
                        <th className="py-2 px-3">PRR / ROR Score</th>
                        <th className="py-2 px-3">Signal Categorization</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-slate-300">
                      {faersData.top_adverse_events?.map((ev, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/40">
                          <td className="py-2.5 px-3 font-medium text-white">{ev.term}</td>
                          <td className="py-2.5 px-3 font-mono">{ev.count?.toLocaleString()}</td>
                          <td className="py-2.5 px-3 font-mono text-cyan-300">
                            {ev.prr?.toFixed(2)} / {ev.ror?.toFixed(2)}
                          </td>
                          <td className="py-2.5 px-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                              ev.disproportionality === 'Strong Signal'
                                ? 'bg-rose-950/60 text-rose-400 border border-rose-800'
                                : ev.disproportionality === 'Moderate Signal'
                                ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                                : 'bg-slate-800 text-slate-300'
                            }`}>
                              {ev.disproportionality}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Reporting Bias Statement */}
                <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/30 text-amber-200/90 text-[11px] flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    <strong>Critical Scientific Caveat (FAERS Bias):</strong> {faersData.bias_statement} Report frequencies do not equal incidence rates or established causal proof.
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
