import React, { useState, useEffect } from 'react';
import { Database, ExternalLink, ShieldCheck, AlertCircle, CheckCircle2, BookOpen } from 'lucide-react';
import { api } from '../services/api';
import { DatasetInfo } from '../types';

export const ResearchDatasets: React.FC = () => {
  const [datasets, setDatasets] = useState<DatasetInfo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.getDatasetsStatus()
      .then(res => setDatasets(res.datasets || []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Database className="w-6 h-6 text-[#06D6A0]" />
          Biomedical Research Datasets & Scientific Provenance
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Complete documentation of scientific data sources, official API integrations, record counts, and research limitations.
        </p>
      </div>

      {/* Dataset Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {datasets.map((d) => (
          <div
            key={d.id}
            className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4 hover:border-[#06D6A0]/40 transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {d.name}
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">Provider: {d.provider}</p>
                </div>
                <a
                  href={d.source_url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                  title="Visit official database"
                >
                  <ExternalLink className="w-4 h-4 text-[#06D6A0]" />
                </a>
              </div>

              <div className="flex flex-wrap items-center gap-2 text-[10px] font-mono">
                <span className="px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                  Version: {d.version}
                </span>
                <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Records: {d.record_count}
                </span>
              </div>

              <div className="text-xs space-y-2">
                <div>
                  <span className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider block">Scientific Purpose:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {d.purpose}
                  </p>
                </div>

                <div>
                  <span className="font-semibold text-slate-300 text-[10px] uppercase tracking-wider block">MediSim AI Usage:</span>
                  <p className="text-slate-300 mt-0.5 leading-relaxed text-[11px] bg-slate-900/60 p-2.5 rounded-lg border border-slate-800">
                    {d.usage}
                  </p>
                </div>
              </div>
            </div>

            {/* Caveat Banner */}
            <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200/90 text-[11px] flex items-start gap-2 mt-4">
              <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">
                <strong>Scientific Boundary:</strong> {d.caveats}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
