import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Sliders, Info, BarChart2, TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { api } from '../services/api';
import { ShapWaterfallChart } from '../components/ShapWaterfallChart';

export const ExplainableAI: React.FC = () => {
  const [globalImportance, setGlobalImportance] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // What-If Simulator State
  const [whatIfLogp, setWhatIfLogp] = useState<number>(3.5);
  const [whatIfDose, setWhatIfDose] = useState<number>(1000);
  const [whatIfTpsa, setWhatIfTpsa] = useState<number>(45.0);
  const [whatIfMw, setWhatIfMw] = useState<number>(320.0);
  const [whatIfReactive, setWhatIfReactive] = useState<boolean>(true);

  useEffect(() => {
    api.getGlobalExplainability()
      .then(res => {
        setGlobalImportance(res.feature_importances || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  // Compute live dynamic what-if SHAP waterfall based on slider states
  const ruleOfTwo = whatIfDose >= 100 && whatIfLogp >= 3.0 ? 1 : 0;
  const logDose = Math.log10(whatIfDose + 1.0);

  const rule2Shift = ruleOfTwo === 1 ? 0.22 : -0.09;
  const reactiveShift = whatIfReactive ? 0.25 : -0.07;
  const doseShift = (logDose - 2.0) * 0.10;
  const logpShift = (whatIfLogp - 2.0) * 0.09;
  const tpsaShift = whatIfTpsa > 70.0 ? -0.07 : 0.05;
  const mwShift = whatIfMw > 500.0 ? 0.04 : -0.03;

  const dynamicContributions = [
    { feature: 'rule_of_two', display_name: 'FDA Rule of 2 (Dose ≥100mg & LogP ≥3)', value: ruleOfTwo, shap_value: Number(rule2Shift.toFixed(4)) },
    { feature: 'reactive_metabolite', display_name: 'Reactive Metabolite Potential', value: whatIfReactive ? 1 : 0, shap_value: Number(reactiveShift.toFixed(4)) },
    { feature: 'log_dose', display_name: 'Daily Exposure Dose (Log Scale)', value: Number(logDose.toFixed(2)), shap_value: Number(doseShift.toFixed(4)) },
    { feature: 'logp', display_name: 'Lipophilicity (XLogP)', value: whatIfLogp, shap_value: Number(logpShift.toFixed(4)) },
    { feature: 'tpsa', display_name: 'Polar Surface Area (TPSA)', value: whatIfTpsa, shap_value: Number(tpsaShift.toFixed(4)) },
    { feature: 'mw', display_name: 'Molecular Weight (g/mol)', value: whatIfMw, shap_value: Number(mwShift.toFixed(4)) }
  ].sort((a, b) => Math.abs(b.shap_value) - Math.abs(a.shap_value));

  const predictedScore = 0.33 + rule2Shift + reactiveShift + doseShift + logpShift + tpsaShift + mwShift;
  const predictedCategory = predictedScore >= 0.65
    ? 'v-Most-DILI-concern (High Hepatic Risk)'
    : predictedScore >= 0.40
    ? 'v-Less-DILI-concern (Moderate / Reversible)'
    : 'v-No-DILI-concern (Verified Negative Control)';

  const scientificSummary = dynamicContributions.filter(c => c.shap_value > 0.03).map(c => c.display_name).join(', ');

  return (
    <div className="space-y-8 pb-16 max-w-7xl mx-auto px-4">
      {/* Header */}
      <div>
        <h2 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-2.5">
          <Shield className="w-6 h-6 text-[#06D6A0]" />
          Explainable AI (SHAP) Workbench
        </h2>
        <p className="text-xs text-slate-400 mt-1">
          Explore global feature importance rankings and interact with our live "What-If" parameter attribution simulator.
        </p>
      </div>

      {/* Global Feature Importance Section */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold uppercase tracking-wider text-[#06D6A0] flex items-center gap-2">
              <BarChart2 className="w-4 h-4" />
              Global Feature Importance (Mean |SHAP| across FDA DILIrank 2.0)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Derived from model gradient trees trained on the FDA LTKB benchmark dataset.
            </p>
          </div>
          <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 text-xs font-mono">
            Algorithm: TreeExplainer
          </span>
        </div>

        <div className="h-64 w-full mt-4">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={globalImportance.slice(0, 8)}
              layout="vertical"
              margin={{ top: 5, right: 30, left: 160, bottom: 5 }}
            >
              <XAxis type="number" stroke="#94A3B8" fontSize={11} />
              <YAxis
                type="category"
                dataKey="display_name"
                stroke="#CBD5E1"
                fontSize={11}
                width={150}
                tick={{ fill: '#E2E8F0' }}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900 border border-slate-700 p-2.5 rounded-lg text-xs">
                        <p className="font-bold text-white">{d.display_name}</p>
                        <p className="text-[#06D6A0]">Mean |SHAP|: {d.importance.toFixed(4)}</p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Bar dataKey="importance" fill="#06D6A0" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* "What-If" Parameter Attribution Simulator */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-6">
        <div>
          <div className="flex items-center gap-2">
            <Sliders className="w-5 h-5 text-[#00F5D4]" />
            <h3 className="text-base font-bold text-white">Interactive "What-If" Feature Sensitivity Simulator</h3>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Adjust chemical parameters to observe how individual SHAP values shift risk attribution in real time.
          </p>
        </div>

        {/* Sliders Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 p-4 rounded-xl bg-slate-900/90 border border-slate-800 text-xs">
          {/* XLogP */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-slate-300 font-semibold">Lipophilicity (XLogP):</label>
              <span className="font-mono text-cyan-300 font-bold">{whatIfLogp}</span>
            </div>
            <input
              type="range"
              min="-1.5"
              max="7.5"
              step="0.1"
              value={whatIfLogp}
              onChange={(e) => setWhatIfLogp(Number(e.target.value))}
              className="w-full accent-[#06D6A0]"
            />
            <span className="text-[10px] text-slate-500">LogP ≥ 3 is part of FDA Rule of 2</span>
          </div>

          {/* Daily Dose */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-slate-300 font-semibold">Daily Dose (mg):</label>
              <span className="font-mono text-cyan-300 font-bold">{whatIfDose} mg</span>
            </div>
            <input
              type="range"
              min="10"
              max="3000"
              step="50"
              value={whatIfDose}
              onChange={(e) => setWhatIfDose(Number(e.target.value))}
              className="w-full accent-[#06D6A0]"
            />
            <span className="text-[10px] text-slate-500">Dose ≥ 100 mg triggers hepatic exposure</span>
          </div>

          {/* TPSA */}
          <div className="space-y-1">
            <div className="flex justify-between">
              <label className="text-slate-300 font-semibold">Polar Surface (TPSA):</label>
              <span className="font-mono text-cyan-300 font-bold">{whatIfTpsa} Å²</span>
            </div>
            <input
              type="range"
              min="10"
              max="180"
              step="5"
              value={whatIfTpsa}
              onChange={(e) => setWhatIfTpsa(Number(e.target.value))}
              className="w-full accent-[#06D6A0]"
            />
            <span className="text-[10px] text-slate-500">Higher polar surface improves solubility</span>
          </div>

          {/* Reactive Metabolite Toggle */}
          <div className="space-y-1 flex flex-col justify-center">
            <label className="text-slate-300 font-semibold mb-1">Reactive Metabolite Formation:</label>
            <button
              onClick={() => setWhatIfReactive(!whatIfReactive)}
              className={`py-2 px-3 rounded-lg font-bold transition-all text-xs ${
                whatIfReactive
                  ? 'bg-rose-950/80 text-rose-300 border border-rose-700'
                  : 'bg-emerald-950/80 text-emerald-300 border border-emerald-700'
              }`}
            >
              {whatIfReactive ? 'Detected / Known Liability' : 'No Reactive Metabolites'}
            </button>
          </div>
        </div>

        {/* Dynamic Prediction Summary Badge */}
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="text-slate-400 block text-[11px]">Dynamic Simulated Classification:</span>
            <span className="text-sm font-extrabold text-white">{predictedCategory}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-400">FDA Rule of 2 Status:</span>
            <span className={`px-2.5 py-0.5 rounded font-bold ${ruleOfTwo === 1 ? 'bg-rose-950 text-rose-300 border border-rose-800' : 'bg-emerald-950 text-emerald-300 border border-emerald-800'}`}>
              {ruleOfTwo === 1 ? 'Positive (High Lipophilic Dose)' : 'Negative (Safe Range)'}
            </span>
          </div>
        </div>

        {/* Live Waterfall Chart */}
        <ShapWaterfallChart
          baseValue={0.33}
          contributions={dynamicContributions}
          scientificSummary={
            scientificSummary
              ? `Dynamic risk elevation is currently driven by ${scientificSummary}.`
              : 'Parameters are situated within favorable low-toxicity thresholds.'
          }
        />
      </div>
    </div>
  );
};
