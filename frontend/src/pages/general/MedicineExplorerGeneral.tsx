import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DrugCompound, DrugSafetyLabel } from '../../types';
import { Search, Pill, ShieldAlert, Sparkles, BookOpen, AlertCircle, Info, Heart, ArrowRight } from 'lucide-react';

interface MedicineExplorerGeneralProps {
  onSelectForSimulation?: (drugName: string) => void;
}

export const MedicineExplorerGeneral: React.FC<MedicineExplorerGeneralProps> = ({
  onSelectForSimulation
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrug, setSelectedDrug] = useState<string>('Acetaminophen');
  const [drugDetails, setDrugDetails] = useState<any>(null);
  const [safetyLabel, setSafetyLabel] = useState<DrugSafetyLabel | null>(null);
  const [explanationMode, setExplanationMode] = useState<'simple' | 'scientific'>('simple');
  const [loading, setLoading] = useState(false);
  const [indianMatches, setIndianMatches] = useState<any[]>([]);

  const handleSearch = async (query: string) => {
    if (!query.trim()) return;
    setLoading(true);
    try {
      const res = await api.searchDrugs(query);
      const indianRes = await api.searchIndianBrands(query);
      setIndianMatches(indianRes || []);
      if (res && res.length > 0) {
        setSelectedDrug(res[0].name);
      } else if (indianRes && indianRes.length > 0) {
        setSelectedDrug(indianRes[0].generic_name.split(' ')[0]);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchDrugInfo = async () => {
      setLoading(true);
      try {
        const details = await api.getDrugDetails(selectedDrug);
        const safety = await api.getDrugSafety(selectedDrug);
        setDrugDetails(details);
        setSafetyLabel(safety.openfda_label);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchDrugInfo();
  }, [selectedDrug]);

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Search */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Patient-Friendly Medicine Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-white tracking-tight">
          Understand Your Prescribed Medicine
        </h1>
        <p className="text-sm text-slate-300">
          Search by generic compound (e.g. Paracetamol, Metformin) or popular Indian brand name (e.g. Dolo 650, Glycomet, Storvas).
        </p>

        {/* Search Bar */}
        <div className="relative max-w-xl mx-auto mt-4">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(searchQuery)}
            placeholder="Search medicine or brand name (e.g. Dolo 650, Atorvastatin)..."
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900 border border-slate-700 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-teal-500 text-sm shadow-xl"
          />
          <button
            onClick={() => handleSearch(searchQuery)}
            className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl transition-all"
          >
            Search
          </button>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex flex-wrap items-center justify-center gap-2 pt-2 text-xs">
          <span className="text-slate-400">Popular:</span>
          {['Paracetamol (Dolo 650)', 'Metformin (Glycomet)', 'Atorvastatin (Storvas)', 'Ibuprofen (Brufen)', 'Azithromycin (Azithral)'].map((drug) => (
            <button
              key={drug}
              onClick={() => {
                const generic = drug.split(' ')[0];
                setSelectedDrug(generic);
              }}
              className="px-3 py-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
            >
              {drug}
            </button>
          ))}
        </div>
      </div>

      {/* Main Medicine Display Card */}
      {drugDetails && (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
          {/* Top Bar with Explanation Level Switcher */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
            <div>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-teal-500/10 text-teal-400 rounded-2xl">
                  <Pill className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-2xl font-extrabold text-white">
                    {drugDetails.compound.name}
                  </h2>
                  <p className="text-xs text-slate-400">
                    Formula: <span className="font-mono text-cyan-300">{drugDetails.compound.formula}</span> • PubChem CID: {drugDetails.compound.cid}
                  </p>
                </div>
              </div>
            </div>

            {/* Simple vs Scientific Toggle */}
            <div className="flex items-center space-x-1.5 bg-slate-950 p-1.5 rounded-xl border border-slate-800 self-start sm:self-auto">
              <button
                onClick={() => setExplanationMode('simple')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  explanationMode === 'simple'
                    ? 'bg-teal-500 text-slate-950 shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Simple Explanation
              </button>
              <button
                onClick={() => setExplanationMode('scientific')}
                className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                  explanationMode === 'scientific'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Scientific Overview
              </button>
            </div>
          </div>

          {/* Explanation Content */}
          {explanationMode === 'simple' ? (
            /* SIMPLE MODE */
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* What is this used for? */}
                <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2">
                    <Heart className="w-4 h-4" />
                    <span>What is this medicine used for?</span>
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {safetyLabel?.indications ||
                      `${drugDetails.compound.name} is prescribed for symptom management under clinical supervision.`}
                  </p>
                </div>

                {/* How does it work? */}
                <div className="bg-slate-950/70 border border-slate-850 rounded-2xl p-5 space-y-2">
                  <h3 className="text-sm font-bold text-teal-300 flex items-center space-x-2">
                    <Sparkles className="w-4 h-4" />
                    <span>How does it work in simple terms?</span>
                  </h3>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    {safetyLabel?.mechanism_of_action ||
                      `It interacts with specific biological proteins and enzymes in your body to alleviate discomfort or modulate bodily pathways.`}
                  </p>
                </div>
              </div>

              {/* Indian Market & Commercial Brand Info */}
              {drugDetails.indian_registry && (
                <div className="bg-teal-950/20 border border-teal-800/40 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-teal-200 flex items-center space-x-2">
                      <Info className="w-4 h-4 text-teal-400" />
                      <span>Indian Regulatory & Brand Availability (CDSCO / ABDM)</span>
                    </h3>
                    <span className="text-xs px-2.5 py-0.5 bg-teal-500/20 text-teal-300 rounded font-medium">
                      {drugDetails.indian_registry.cdsco_status}
                    </span>
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-200">Prescription Category: </strong>
                    {drugDetails.indian_registry.schedule}
                  </div>

                  <div className="text-xs text-slate-300">
                    <strong className="text-slate-200">Common Indian Brands: </strong>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {drugDetails.indian_registry.common_brands.map((b: any, i: number) => (
                        <span key={i} className="px-2.5 py-1 bg-slate-900 border border-teal-700/40 rounded-lg text-teal-200 font-medium">
                          {b.brand} ({b.strength} - {b.manufacturer})
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* Warnings & Boxed Warnings */}
              {safetyLabel?.boxed_warning && (
                <div className="bg-rose-950/25 border border-rose-800/50 rounded-2xl p-5 space-y-2 text-rose-200">
                  <h4 className="text-sm font-bold text-rose-300 flex items-center space-x-2">
                    <ShieldAlert className="w-4 h-4 text-rose-400" />
                    <span>Official Safety Warning</span>
                  </h4>
                  <p className="text-xs text-slate-200 leading-relaxed">
                    {safetyLabel.boxed_warning}
                  </p>
                </div>
              )}

              {/* Missed Dose Guidance */}
              <div className="bg-amber-950/20 border border-amber-800/40 rounded-2xl p-4.5 space-y-1.5 text-xs text-amber-200">
                <div className="font-bold text-amber-300 flex items-center space-x-1.5">
                  <AlertCircle className="w-4 h-4" />
                  <span>What if you miss a dose?</span>
                </div>
                <p className="text-slate-300 leading-relaxed text-[11px]">
                  Take the missed dose as soon as you remember. If it is almost time for your next scheduled dose, skip the missed dose and continue your normal schedule. <strong className="text-amber-200">Never take a double dose</strong> to make up for a missed one.
                </p>
              </div>
            </div>
          ) : (
            /* SCIENTIFIC MODE */
            <div className="space-y-6">
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-400 block">Molecular Weight</span>
                  <span className="text-lg font-bold text-white font-mono">{drugDetails.compound.mw} g/mol</span>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-400 block">Lipophilicity (XLogP)</span>
                  <span className="text-lg font-bold text-white font-mono">{drugDetails.compound.logp}</span>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-400 block">Polar Surface Area</span>
                  <span className="text-lg font-bold text-white font-mono">{drugDetails.compound.tpsa} Å²</span>
                </div>
                <div className="bg-slate-950/70 p-4 rounded-xl border border-slate-850">
                  <span className="text-xs text-slate-400 block">H-Bond Donors/Acc</span>
                  <span className="text-lg font-bold text-white font-mono">{drugDetails.compound.hbd} / {drugDetails.compound.hba}</span>
                </div>
              </div>

              {/* SMILES & InChIKey */}
              <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-850 space-y-2 text-xs">
                <span className="font-semibold text-slate-400 block">Canonical SMILES</span>
                <code className="text-cyan-300 font-mono break-all block bg-slate-900 p-2.5 rounded border border-slate-800">
                  {drugDetails.compound.smiles}
                </code>
              </div>

              {/* CPIC Pharmacogenomics */}
              {drugDetails.pharmacogenomics && (
                <div className="bg-indigo-950/20 border border-indigo-800/40 rounded-2xl p-5 space-y-2 text-xs">
                  <h4 className="font-bold text-indigo-300">
                    CPIC Level 1A Pharmacogenomic Guidelines
                  </h4>
                  <p className="text-slate-300 leading-relaxed">
                    {drugDetails.pharmacogenomics.clinical_summary}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
