import React from 'react';
import { User, Award, ShieldCheck, Dna, BookOpen, HeartHandshake, Sparkles, GraduationCap } from 'lucide-react';

export const About: React.FC = () => {
  return (
    <div className="space-y-12 pb-16 max-w-5xl mx-auto px-4">
      {/* Hero Header */}
      <div className="text-center space-y-3 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#06D6A0]/15 text-[#00F5D4] text-xs font-semibold border border-[#06D6A0]/30">
          <GraduationCap className="w-3.5 h-3.5" />
          <span>BioNex &bull; VIT Bhopal University</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
          About MediSim AI
        </h2>
        <p className="text-sm text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Simulating and Explaining Drug Responses Using AI. Bridging the gap between general pharmaceutical monographs and individualized, evidence-based health exploration.
        </p>
      </div>

      {/* Project Metadata Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 grid grid-cols-1 sm:grid-cols-3 gap-6 text-xs">
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Project Title</span>
          <span className="text-sm font-bold text-white block mt-0.5">Simulating and Explaining Drug Responses Using AI</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Project Category</span>
          <span className="text-sm font-bold text-[#06D6A0] block mt-0.5">Predictive and Preventive Health Intelligence</span>
        </div>
        <div>
          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider block">Research Team</span>
          <span className="text-sm font-bold text-[#00F5D4] block mt-0.5">BioNex &bull; VIT Bhopal University</span>
        </div>
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-[#06D6A0]/15 flex items-center justify-center text-[#06D6A0]">
            <Dna className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">The Scientific Mission</h3>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Medicines do not act in a vacuum. A patient's age, baseline transaminases, renal filtration reserve, genetic polymorphisms, and chemical dosage fundamentally reshape drug responses. Our mission is to transform complex biomedical research into transparent, auditable, and interpretable intelligence for clinicians, researchers, and students.
          </p>
        </div>

        <div className="glass-panel p-6 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-3">
          <div className="w-9 h-9 rounded-xl bg-cyan-950/60 flex items-center justify-center text-[#00F5D4]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <h3 className="text-base font-bold text-white">Explainability & Transparency</h3>
          <p className="text-slate-300 leading-relaxed text-[11px]">
            Opaque AI models have no place in healthcare. MediSim AI applies Shapley Additive Explanations (SHAP) directly to tree gradients, decomposing every prediction into exact mathematical feature attributions. We clearly differentiate between experimental cell-line data, regulatory classifications, and clinical observations.
          </p>
        </div>
      </div>

      {/* Team BioNex Attribution */}
      <div className="glass-panel p-8 rounded-2xl border border-slate-700/80 bg-[#0F172A]/90 space-y-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#06D6A0] to-[#00F5D4] flex items-center justify-center text-[#0B132B] font-bold">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Team BioNex</h3>
            <p className="text-xs text-[#06D6A0] font-semibold">VIT Bhopal University &bull; Health Hackathon 2026</p>
          </div>
        </div>

        <p className="text-xs text-slate-300 leading-relaxed">
          Team BioNex is an interdisciplinary biomedical engineering and machine learning research team dedicated to advancing predictive health intelligence. MediSim AI represents our flagship initiative combining open biomedical science with explainable artificial intelligence.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2 text-xs">
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-white block">Biomedical Engineering</span>
            <span className="text-slate-400 text-[10px]">Pharmacological pathways & toxicology</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-white block">Machine Learning</span>
            <span className="text-slate-400 text-[10px]">Supervised classification & SHAP explainability</span>
          </div>
          <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
            <span className="font-bold text-white block">Full-Stack Architecture</span>
            <span className="text-slate-400 text-[10px]">FastAPI, React 19, TypeScript, Tailwind</span>
          </div>
        </div>
      </div>
    </div>
  );
};
