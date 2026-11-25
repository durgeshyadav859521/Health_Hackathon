import React, { useState } from 'react';
import { api } from '../../services/api';
import { AssistantResponse } from '../../types';
import { Zap, Send, Dna, Database, AlertCircle, BookOpen, Terminal, Sparkles } from 'lucide-react';

interface ResearchMessage {
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
}

const SCIENTIFIC_PROMPTS = [
  'What is the metabolic clearance pathway and CYP enzyme selectivity of Warfarin?',
  'Explain the mechanism of NAPQI formation and glutathione depletion for Acetaminophen.',
  'What landmark genes are most perturbed by Atorvastatin in LINCS L1000 HEPG2 cells?',
  'Summarize CPIC Level 1A guidelines for CYP2C9 and VKORC1.'
];

export const ResearchAssistant: React.FC = () => {
  const [messages, setMessages] = useState<ResearchMessage[]>([
    {
      sender: 'assistant',
      text: "### Scientific Research Assistant – BioNex AI\nReady to analyze pharmacokinetic profiles, Cytochrome P450 biotransformation, LINCS transcriptomics, and CPIC pharmacogenomic guidelines. All queries are resolved via grounded RAG over official biomedical benchmarks.",
      citations: [
        'NCBI PubChem PUG REST API',
        'FDA DILIrank 2.0 Benchmark',
        'LINCS L1000 Phase II Transcriptomics',
        'CPIC / PharmGKB Level 1A Guidelines'
      ]
    }
  ]);
  const [queryInput, setQueryInput] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (qToSend?: string) => {
    const q = (qToSend || queryInput).trim();
    if (!q) return;

    setMessages(prev => [...prev, { sender: 'user', text: q }]);
    if (!qToSend) setQueryInput('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(q, 'researcher');
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: res.response,
          citations: res.citations
        }
      ]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "Error executing scientific retrieval against biomedical datasets."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-xs font-semibold border border-indigo-500/30 mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Biomedical Knowledge Retrieval Engine</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Research AI Assistant
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Grounded molecular pharmacology, enzyme kinetics, and benchmark toxicogenomics.
          </p>
        </div>
      </div>

      {/* Suggested Inquiries */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-400 font-medium">Benchmark Inquiries:</span>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {SCIENTIFIC_PROMPTS.map((sp, i) => (
            <button
              key={i}
              onClick={() => handleSend(sp)}
              className="p-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-left text-xs border border-slate-800 transition-colors flex items-start space-x-2"
            >
              <Terminal className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
              <span className="line-clamp-2">{sp}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Terminal Box */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl h-[520px] flex flex-col justify-between overflow-hidden">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300 shrink-0">
                  <Zap className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium self-end rounded-br-none'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{m.text}</div>

                {m.citations && m.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800/80 text-[10px] text-slate-400 space-y-0.5">
                    <span className="font-bold text-indigo-400 block">Verified References:</span>
                    {m.citations.map((c, ci) => (
                      <div key={ci}>• {c}</div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-indigo-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 w-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Synthesizing pharmacological literature and dataset records...</span>
            </div>
          )}
        </div>

        {/* Input Field */}
        <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={queryInput}
            onChange={(e) => setQueryInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Query molecular mechanism, CYP450 clearance, or LINCS L1000 perturbation..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 text-xs font-mono"
          />
          <button
            onClick={() => handleSend()}
            disabled={!queryInput.trim() || loading}
            className="p-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-bold rounded-2xl transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
