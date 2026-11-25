import React from 'react';
import { OrganEvidence } from '../types';
import { ShieldAlert, BookOpen, Dna, Activity, X, AlertTriangle, ExternalLink } from 'lucide-react';

interface OrganEvidenceOverlayProps {
  evidence: OrganEvidence | null;
  onClose: () => void;
}

const STATUS_BADGES: Record<string, { label: string; bg: string; text: string; border: string }> = {
  blue: { label: 'Selected Organ', bg: 'bg-blue-500/10', text: 'text-blue-400', border: 'border-blue-500/30' },
  green: { label: 'Normal / Standard Tolerability', bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30' },
  yellow: { label: 'Precautionary / Biological Response', bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30' },
  orange: { label: 'Documented Adverse Effect / Toxicity', bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30' },
  red: { label: 'Boxed Warning / High Regulatory Concern', bg: 'bg-rose-500/10', text: 'text-rose-400', border: 'border-rose-500/30' },
  grey: { label: 'Baseline / Insufficient Organ-Specific Data', bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/30' }
};

export const OrganEvidenceOverlay: React.FC<OrganEvidenceOverlayProps> = ({
  evidence,
  onClose
}) => {
  if (!evidence) return null;

  const badge = STATUS_BADGES[evidence.status] || STATUS_BADGES.grey;

  return (
    <div className="bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-5 shadow-2xl flex flex-col space-y-4 max-w-xl">
      {/* Header */}
      <div className="flex items-start justify-between border-b border-slate-800 pb-3">
        <div>
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-white capitalize">
              {evidence.name}
            </h3>
            <span className="text-xs px-2.5 py-0.5 bg-slate-800 text-slate-300 rounded-full font-medium">
              {evidence.system}
            </span>
          </div>
          <div className="mt-1.5">
            <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold border ${badge.bg} ${badge.text} ${badge.border}`}>
              {badge.label}
            </span>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Physiological Role */}
      <div className="space-y-1.5 text-xs">
        <h4 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Activity className="w-3.5 h-3.5 text-cyan-400" />
          <span>Basic Function & Clearance Role</span>
        </h4>
        <p className="text-slate-400 leading-relaxed bg-slate-950/60 p-2.5 rounded-lg border border-slate-850">
          {evidence.basic_function} {evidence.metabolic_role}
        </p>
      </div>

      {/* Drug Effect Category & Mechanism */}
      <div className="space-y-1.5 text-xs">
        <h4 className="font-semibold text-slate-300 flex items-center space-x-1.5">
          <Dna className="w-3.5 h-3.5 text-indigo-400" />
          <span>Documented Pharmacological Mechanism</span>
        </h4>
        <p className="text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-850">
          {evidence.mechanism}
        </p>
      </div>

      {/* Biomarkers & Evidence Source */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Relevant Biomarkers
          </span>
          <div className="flex flex-wrap gap-1">
            {evidence.biomarkers && evidence.biomarkers.length > 0 ? (
              evidence.biomarkers.map((b, i) => (
                <span key={i} className="px-1.5 py-0.5 bg-slate-800/80 text-cyan-300 rounded text-[10px]">
                  {b}
                </span>
              ))
            ) : (
              <span className="text-slate-500 text-[10px]">Standard clinical chemistry</span>
            )}
          </div>
        </div>

        <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-850 space-y-1">
          <span className="text-[11px] font-semibold text-slate-400 block">
            Evidence Source & Type
          </span>
          <span className="text-slate-300 text-[11px] font-medium block truncate">
            {evidence.evidence_source}
          </span>
          <span className="text-cyan-400 text-[10px] block">
            {evidence.evidence_type}
          </span>
        </div>
      </div>

      {/* Mandatory Non-Diagnostic Disclaimer */}
      <div className="bg-amber-950/20 border border-amber-900/40 p-3 rounded-xl flex items-start space-x-2.5 text-xs text-amber-300/90 leading-relaxed">
        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-amber-200 block mb-0.5">Scientific Limitation Notice</span>
          {evidence.limitations}
        </div>
      </div>
    </div>
  );
};
