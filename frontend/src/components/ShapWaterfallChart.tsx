import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell, ReferenceLine } from 'recharts';
import { Shield, Sparkles, TrendingUp, TrendingDown, Info } from 'lucide-react';
import { ShapContribution } from '../types';

interface ShapWaterfallChartProps {
  baseValue: number;
  contributions: ShapContribution[];
  scientificSummary: string;
}

export const ShapWaterfallChart: React.FC<ShapWaterfallChartProps> = ({
  baseValue,
  contributions,
  scientificSummary
}) => {
  // Format data for Recharts horizontal bar chart
  const chartData = contributions.map(c => ({
    name: c.display_name,
    shap: c.shap_value,
    value: c.value,
    direction: c.shap_value > 0 ? 'Increases Concern' : 'Reduces Concern'
  }));

  return (
    <div className="glass-panel p-5 rounded-xl border border-slate-700/60 bg-[#0F172A]/90">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-700/60">
        <div>
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#06D6A0]" />
            SHAP Explainable AI: Feature Attribution Decomposition
          </h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Quantifying individual feature contributions relative to population baseline (E[f(x)] = {baseValue.toFixed(3)})
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs">
          <span className="flex items-center gap-1.5 text-rose-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
            Elevates Risk
          </span>
          <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
            <span className="w-2.5 h-2.5 rounded bg-emerald-500"></span>
            Protective / Lowers
          </span>
        </div>
      </div>

      {/* Recharts Bar Chart */}
      <div className="h-64 w-full mt-4">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 140, bottom: 5 }}
          >
            <XAxis type="number" stroke="#94A3B8" fontSize={11} domain={['auto', 'auto']} tickFormatter={(v) => v.toFixed(2)} />
            <YAxis
              type="category"
              dataKey="name"
              stroke="#CBD5E1"
              fontSize={11}
              width={130}
              tick={{ fill: '#E2E8F0' }}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg shadow-xl text-xs space-y-1">
                      <p className="font-bold text-white">{d.name}</p>
                      <p className="text-slate-300">Feature Value: <span className="text-cyan-400 font-semibold">{d.value}</span></p>
                      <p className={d.shap > 0 ? "text-rose-400 font-semibold" : "text-emerald-400 font-semibold"}>
                        SHAP Contribution: {d.shap > 0 ? `+${d.shap.toFixed(4)}` : d.shap.toFixed(4)} ({d.direction})
                      </p>
                    </div>
                  );
                }
                return null;
              }}
            />
            <ReferenceLine x={0} stroke="#64748B" strokeDasharray="3 3" />
            <Bar dataKey="shap" radius={[4, 4, 4, 4]}>
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.shap > 0 ? '#F43F5E' : '#10B981'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scientific Plain-English Summary */}
      <div className="mt-4 p-3 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs">
        <div className="flex items-start gap-2">
          <Info className="w-4 h-4 text-[#00F5D4] shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-white">Model Attribution Rationale:</span>{' '}
            <span className="text-slate-300 leading-relaxed">{scientificSummary}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
