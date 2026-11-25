import React, { useState } from 'react';
import { api } from '../../services/api';
import { AssistantResponse } from '../../types';
import { Bot, Send, Sparkles, AlertCircle, BookOpen, ShieldAlert, User, HelpCircle } from 'lucide-react';

interface ChatMessage {
  sender: 'user' | 'assistant';
  text: string;
  citations?: string[];
  isEmergency?: boolean;
}

const SAMPLE_QUESTIONS = [
  'What is Paracetamol (Dolo 650) used for?',
  'How should I take Metformin with meals?',
  'What are the common side effects of Atorvastatin?',
  'What should I do if I miss a dose of Warfarin?'
];

export const AIMedicineGuide: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      sender: 'assistant',
      text: "Hello! I am the **MediSim AI Medicine Guide**. Ask me questions about prescribed medicines, how they work in simple terms, precautions, or missed-dose instructions. \n\n*Note: I am an educational guide, not a doctor. I do not prescribe or alter medications.*",
      citations: ['U.S. FDA Drug Labeling', 'PubChem Biomedical Knowledgebase', 'CDSCO India Registry']
    }
  ]);
  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q) return;

    const userMsg: ChatMessage = { sender: 'user', text: q };
    setMessages(prev => [...prev, userMsg]);
    if (!queryToSend) setInputQuery('');
    setLoading(true);

    try {
      const res = await api.askAIAssistant(q, 'general');
      const botMsg: ChatMessage = {
        sender: 'assistant',
        text: res.response,
        citations: res.citations,
        isEmergency: res.is_emergency
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (e) {
      setMessages(prev => [
        ...prev,
        {
          sender: 'assistant',
          text: "I encountered an error querying the medical knowledgebase. Please check your network connection and try again."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto px-4 sm:px-6 py-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
          <Bot className="w-3.5 h-3.5" />
          <span>Grounded RAG Medicine Assistant</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          AI Medicine Guide
        </h1>
        <p className="text-xs sm:text-sm text-slate-300">
          Plain-language answers grounded in official FDA labels, PubChem, and CDSCO data.
        </p>
      </div>

      {/* Quick Suggestion Chips */}
      <div className="space-y-1.5">
        <span className="text-xs text-slate-400 font-medium">Frequently Asked Questions:</span>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_QUESTIONS.map((sq, i) => (
            <button
              key={i}
              onClick={() => handleSend(sq)}
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl text-xs border border-slate-800 transition-colors flex items-center space-x-1.5"
            >
              <HelpCircle className="w-3 h-3 text-teal-400" />
              <span>{sq}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Chat Messages Container */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-2xl h-[480px] flex flex-col justify-between overflow-hidden">
        <div className="overflow-y-auto space-y-4 pr-2">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start space-x-3 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed space-y-2 ${
                  msg.sender === 'user'
                    ? 'bg-teal-600 text-white font-medium self-end rounded-br-none'
                    : msg.isEmergency
                    ? 'bg-rose-950/40 border border-rose-800 text-rose-200'
                    : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                }`}
              >
                <div className="whitespace-pre-wrap">{msg.text}</div>

                {/* Grounded Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-slate-800 text-[10px] text-slate-400 space-y-0.5">
                    <span className="font-bold text-teal-400 block">Sources & Citations:</span>
                    {msg.citations.map((c, ci) => (
                      <div key={ci}>• {c}</div>
                    ))}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 shrink-0">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center space-x-2 text-xs text-teal-400 bg-slate-950/60 p-3 rounded-2xl border border-slate-800 w-fit">
              <Sparkles className="w-4 h-4 animate-spin" />
              <span>Searching medical references and verifying evidence...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="pt-3 border-t border-slate-800 flex items-center space-x-2">
          <input
            type="text"
            value={inputQuery}
            onChange={(e) => setInputQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder="Ask anything about medicines, precautions, or food interactions..."
            className="flex-1 px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-teal-500 text-xs"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputQuery.trim() || loading}
            className="p-2.5 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 text-slate-950 font-bold rounded-2xl transition-all shadow-md"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Safety Notice Banner */}
      <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 flex items-center space-x-3 text-xs text-slate-400">
        <AlertCircle className="w-4 h-4 text-teal-400 shrink-0" />
        <p>
          MediSim AI is an educational platform. Never stop or alter prescribed medications without consulting a qualified healthcare professional.
        </p>
      </div>
    </div>
  );
};
