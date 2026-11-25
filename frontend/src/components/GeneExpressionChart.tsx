import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Dna, AlertCircle, Layers } from 'lucide-react';

interface GeneExpressionChartProps {
  geneZscores: Record<string, number>;
  cellLine: string;
  doseUm: number;
  timeHours: number;
  cluster: string;
  stressIndex: number;
}

export const GeneExpressionChart: React.FC<GeneExpressionChartProps> = ({
  geneZscores,
  cellLine,
  doseUm,
  timeHours,
  cluster,
  stressIndex
}) => {
  const chartData = Object.entries(geneZscores).map(([gene, z]) => ({
    gene,
    zscore: z,
    category: ['TP53', 'CASP3', 'CDKN1A'].includes(gene)
      ? 'Apoptosis / DNA Stress'
      : ['TNF', 'IL6'].includes(gene)
      ? 'Cytokine / Inflammatory'
      : ['HMOX1', 'SOD1'].includes(gene)
      ? 'Oxidative Defense'
      : 'Metabolic & Survival'
  }));

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-700/60 bg-[#0F172A]/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Dna className="w-4 h-4 text-[#06D6A0]" />
            LINCS L1000 Landmark Gene Expression Profile (Z-Scores)
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Experimental transcriptional modulation: Cell Line: <strong className="text-white">{cellLine}</strong> &bull; Dose: <strong className="text-white">{doseUm} µM</strong> &bull; Duration: <strong className="text-white">{timeHours}h</strong>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="px-2.5 py-1 rounded bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400">Stress Index: </span>
            <span className={`font-bold ${stressIndex > 0.6 ? 'text-rose-400' : 'text-emerald-400'}`}>
              {(stressIndex * 100).toFixed(0)}%
            </span>
          </div>
        </div>
      </div>

      {/* Bar Chart */}
      <div className="h-60 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 20 }}>
            <XAxis dataKey="gene" stroke="#94A3B8" fontSize={11} angle={-30} textAnchor="end" />
            <YAxis stroke="#94A3B8" fontSize={11} domain={[-4, 4]} tickFormatter={(v) => `${v > 0 ? '+' : ''}${v}`} />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white">Gene: {d.gene}</p>
                      <p className="text-slate-300">Pathway: <span className="text-cyan-400">{d.category}</span></p>
                      <p className={d.zscore > 0 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        Modulation (Z-score): {d.zscore > 0 ? `+${d.zscore}` : d.zscore}
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine y={0} stroke="#64748B" />
            <Bar dataKey="zscore" radius={[4, 4, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.zscore > 0 ? (entry.zscore > 1.5 ? '#F43F5E' : '#FB7185') : (entry.zscore < -1.5 ? '#3B82F6' : '#10B981')}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Cluster Assignment & Scientific Limitation */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="p-3 rounded-lg bg-slate-800/60 border border-slate-700/60">
          <span className="font-semibold text-slate-300 flex items-center gap-1.5 mb-1">
            <Layers className="w-3.5 h-3.5 text-[#06D6A0]" />
            Response Pattern Cluster:
          </span>
          <p className="text-white font-medium">{cluster}</p>
        </div>
        <div className="p-3 rounded-lg bg-amber-950/20 border border-amber-900/40 text-amber-200/90 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <p className="text-[11px] leading-relaxed">
            <strong>Biological Limitation:</strong> These are experimental in-vitro cell-line measurements, not direct measurements of whole-human-body organ responses.
          </p>
        </div>
      </div>
    </div>
  );
};
