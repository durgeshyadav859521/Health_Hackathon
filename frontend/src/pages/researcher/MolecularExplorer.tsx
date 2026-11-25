import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { DrugCompound } from '../../types';
import { Dna, Search, CheckCircle2, XCircle, ArrowRightLeft, ExternalLink, ShieldCheck, Copy, Check } from 'lucide-react';

export const MolecularExplorer: React.FC = () => {
  const [selectedDrug, setSelectedDrug] = useState<string>('Acetaminophen');
  const [compareDrug, setCompareDrug] = useState<string>('Warfarin');
  const [isComparing, setIsComparing] = useState(false);
  const [compoundData, setCompoundData] = useState<any>(null);
  const [compareData, setCompareData] = useState<any>(null);
  const [copiedSmiles, setCopiedSmiles] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProps = async () => {
      setLoading(true);
      try {
        const d1 = await api.getDrugProperties(selectedDrug);
        setCompoundData(d1);
        if (isComparing) {
          const d2 = await api.getDrugProperties(compareDrug);
          setCompareData(d2);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchProps();
  }, [selectedDrug, compareDrug, isComparing]);

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSmiles(true);
    setTimeout(() => setCopiedSmiles(false), 2000);
  };

  const evaluateRo5 = (cp: any) => {
    const mwPass = cp.mw <= 500;
    const logpPass = cp.xlogp <= 5.0;
    const hbdPass = cp.hbd <= 5;
    const hbaPass = cp.hba <= 10;
    const violations = [!mwPass, !logpPass, !hbdPass, !hbaPass].filter(Boolean).length;
    return { mwPass, logpPass, hbdPass, hbaPass, violations, compliant: violations <= 1 };
  };

  const ro5_1 = compoundData ? evaluateRo5(compoundData) : null;
  const ro5_2 = compareData ? evaluateRo5(compareData) : null;

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30 mb-2">
            <Dna className="w-3.5 h-3.5" />
            <span>Chemical Pharmacology & Cheminformatics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Molecular Structure & Physicochemical Descriptors
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Query NCBI PubChem PUG REST API for 2D topology, stereochemistry, SMILES strings, and Lipinski compliance.
          </p>
        </div>

        {/* Drug Selection & Compare Mode Toggle */}
        <div className="flex items-center space-x-2">
          <select
            value={selectedDrug}
            onChange={(e) => setSelectedDrug(e.target.value)}
            className="px-3.5 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {['Acetaminophen', 'Warfarin', 'Atorvastatin', 'Ibuprofen', 'Metformin', 'Azithromycin'].map(d => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>

          <button
            onClick={() => setIsComparing(!isComparing)}
            className={`px-3 py-2 rounded-xl text-xs font-semibold flex items-center space-x-1.5 transition-all ${
              isComparing
                ? 'bg-indigo-600 text-white'
                : 'bg-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            <ArrowRightLeft className="w-3.5 h-3.5" />
            <span>{isComparing ? 'Close Comparison' : 'Compare'}</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Single Compound or Comparison */}
      <div className={`grid gap-6 ${isComparing ? 'grid-cols-1 lg:grid-cols-2' : 'grid-cols-1'}`}>
        {/* Compound 1 Card */}
        {compoundData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <h2 className="text-2xl font-extrabold text-white">{compoundData.name}</h2>
                <span className="text-xs text-indigo-400 font-mono">PubChem CID: {compoundData.cid}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                ro5_1?.compliant
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                Lipinski Ro5: {ro5_1?.violations} Violations ({ro5_1?.compliant ? 'Drug-like' : 'Non-compliant'})
              </span>
            </div>

            {/* 2D Structure Preview */}
            <div className="flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <img
                src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compoundData.cid}/PNG`}
                alt={`${compoundData.name} 2D Structure`}
                className="max-h-56 object-contain filter invert contrast-125"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://pubchem.ncbi.nlm.nih.gov/images/structure_not_found.png';
                }}
              />
            </div>

            {/* Descriptors Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Formula</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.formula}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Molecular Weight</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.mw} g/mol</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">XLogP3-AA</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.xlogp}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Polar Surface (TPSA)</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.tpsa} Å²</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">H-Bond Donors</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.hbd}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">H-Bond Acceptors</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.hba}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Rotatable Bonds</span>
                <span className="text-white font-mono font-bold text-sm">{compoundData.rotatable_bonds}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Ro5 Violations</span>
                <span className="text-indigo-400 font-mono font-bold text-sm">{ro5_1?.violations}</span>
              </div>
            </div>

            {/* SMILES Code Block */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between text-slate-400 font-semibold">
                <span>Canonical SMILES</span>
                <button
                  onClick={() => copyToClipboard(compoundData.canonical_smiles)}
                  className="text-indigo-400 hover:text-indigo-300 flex items-center space-x-1"
                >
                  {copiedSmiles ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedSmiles ? 'Copied' : 'Copy SMILES'}</span>
                </button>
              </div>
              <code className="block bg-slate-950 p-3 rounded-xl text-cyan-300 font-mono break-all border border-slate-800 text-[11px]">
                {compoundData.canonical_smiles}
              </code>
            </div>

            {/* InChIKey */}
            <div className="text-xs text-slate-400 flex items-center justify-between">
              <span>InChIKey: <code className="text-slate-300 font-mono">{compoundData.inchi_key}</code></span>
              <a
                href={`https://pubchem.ncbi.nlm.nih.gov/compound/${compoundData.cid}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-400 hover:underline flex items-center space-x-1"
              >
                <span>PubChem Web</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>
        )}

        {/* Compound 2 Card (Comparison Mode) */}
        {isComparing && compareData && (
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
              <div>
                <select
                  value={compareDrug}
                  onChange={(e) => setCompareDrug(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-white text-sm font-bold focus:outline-none mb-1"
                >
                  {['Warfarin', 'Acetaminophen', 'Atorvastatin', 'Ibuprofen', 'Metformin', 'Azithromycin'].map(d => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </select>
                <span className="text-xs text-cyan-400 font-mono block">PubChem CID: {compareData.cid}</span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                ro5_2?.compliant
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40'
              }`}>
                Lipinski Ro5: {ro5_2?.violations} Violations
              </span>
            </div>

            {/* 2D Structure Preview */}
            <div className="flex justify-center bg-slate-950 p-6 rounded-2xl border border-slate-800">
              <img
                src={`https://pubchem.ncbi.nlm.nih.gov/rest/pug/compound/cid/${compareData.cid}/PNG`}
                alt={`${compareData.name} 2D Structure`}
                className="max-h-56 object-contain filter invert contrast-125"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = 'https://pubchem.ncbi.nlm.nih.gov/images/structure_not_found.png';
                }}
              />
            </div>

            {/* Descriptors Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Formula</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.formula}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Molecular Weight</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.mw} g/mol</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">XLogP3-AA</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.xlogp}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Polar Surface (TPSA)</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.tpsa} Å²</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">H-Bond Donors</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.hbd}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">H-Bond Acceptors</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.hba}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Rotatable Bonds</span>
                <span className="text-white font-mono font-bold text-sm">{compareData.rotatable_bonds}</span>
              </div>
              <div className="bg-slate-950/70 p-3 rounded-xl border border-slate-850">
                <span className="text-slate-400 block text-[11px]">Ro5 Violations</span>
                <span className="text-cyan-400 font-mono font-bold text-sm">{ro5_2?.violations}</span>
              </div>
            </div>

            {/* SMILES */}
            <div className="space-y-1.5 text-xs">
              <span className="font-semibold text-slate-400 block">Canonical SMILES</span>
              <code className="block bg-slate-950 p-3 rounded-xl text-cyan-300 font-mono break-all border border-slate-800 text-[11px]">
                {compareData.canonical_smiles}
              </code>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
