import React, { useState, useEffect } from 'react';
import {
  Activity, Shield, Dna, Database, BookOpen, User, CheckCircle2,
  Calendar, Zap, AlertTriangle, Layers, Heart, Sparkles, ArrowRightLeft
} from 'lucide-react';
import { api } from '../services/api';
import { PlatformMode, ThemeMode } from '../types';
import { ThemeSelector } from './ThemeSelector';

interface NavbarProps {
  platformMode: PlatformMode;
  setPlatformMode: (mode: PlatformMode) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenAuth: () => void;
  currentUser: any;
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  platformMode,
  setPlatformMode,
  activeTab,
  setActiveTab,
  onOpenAuth,
  currentUser,
  currentTheme,
  onSelectTheme
}) => {
  const [operatingMode, setOperatingMode] = useState<string>("REAL_MODEL_MODE");

  useEffect(() => {
    api.getModelsStatus()
      .then(res => setOperatingMode(res.operating_mode))
      .catch(() => setOperatingMode("REAL_MODEL_MODE"));
  }, []);

  // Dynamic Navigation Items
  const generalNavItems = [
    { id: 'general-dashboard', label: 'Dashboard', icon: Heart },
    { id: 'medicine-explorer-general', label: 'Medicine Explorer', icon: BookOpen },
    { id: 'general-simulator', label: '3D Body Simulator', icon: Activity },
    { id: 'smart-calendar', label: 'Smart Calendar', icon: Calendar },
    { id: 'drug-interaction', label: 'Drug Interactions', icon: Shield },
    { id: 'ai-guide', label: 'AI Medicine Guide', icon: Sparkles }
  ];

  const researcherNavItems = [
    { id: 'researcher-dashboard', label: 'Overview', icon: Zap },
    { id: 'simulator', label: '5-Step Simulator', icon: Dna },
    { id: 'molecular-explorer', label: 'Molecular Explorer', icon: Dna },
    { id: 'general-simulator', label: '3D Anatomy & Evidence', icon: Activity },
    { id: 'biological', label: 'LINCS L1000', icon: Layers },
    { id: 'explainable', label: 'Explainable AI', icon: Shield },
    { id: 'analytics', label: 'FAERS Safety', icon: Activity },
    { id: 'research', label: 'Datasets', icon: Database },
    { id: 'research-assistant', label: 'Research Assistant', icon: Zap },
    { id: 'about', label: 'About', icon: User }
  ];

  const currentNav = platformMode === 'general' ? generalNavItems : researcherNavItems;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800 bg-slate-950/95 backdrop-blur-md">
      {/* Top Banner: Dual Platform Switcher & Mode Badge */}
      <div className="bg-slate-900/90 border-b border-slate-850 px-4 sm:px-6 py-1.5 flex items-center justify-between text-xs">
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 font-medium hidden sm:inline">Active Platform:</span>
          <div className="inline-flex p-0.5 bg-slate-950 rounded-xl border border-slate-800">
            <button
              onClick={() => {
                setPlatformMode('general');
                setActiveTab('general-dashboard');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1.5 ${
                platformMode === 'general'
                  ? 'bg-teal-500 text-slate-950 shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Heart className="w-3 h-3" />
              <span>General User Platform</span>
            </button>
            <button
              onClick={() => {
                setPlatformMode('researcher');
                setActiveTab('researcher-dashboard');
              }}
              className={`px-3 py-1 rounded-lg font-bold text-[11px] transition-all flex items-center space-x-1.5 ${
                platformMode === 'researcher'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Zap className="w-3 h-3" />
              <span>Researcher Platform</span>
            </button>
          </div>
        </div>

        {/* Real Model Mode Badge & BioNex Attribution */}
        <div className="flex items-center space-x-3">
          <div
            className="flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 border border-emerald-500/40 text-emerald-300"
            title="Real Model Mode: Multi-Class XGBoost & PCA active"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>REAL_MODEL_MODE</span>
          </div>
          <span className="text-[10px] text-slate-500 hidden md:inline">
            BioNex &bull; VIT Bhopal University
          </span>
        </div>
      </div>

      {/* Main Navbar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Logo & Brand */}
          <div
            className="flex items-center gap-2.5 cursor-pointer"
            onClick={() => setActiveTab(platformMode === 'general' ? 'general-dashboard' : 'researcher-dashboard')}
          >
            <div className={`flex items-center justify-center w-8 h-8 rounded-xl shadow-md ${
              platformMode === 'general'
                ? 'bg-gradient-to-tr from-teal-400 to-emerald-400 text-slate-950'
                : 'bg-gradient-to-tr from-indigo-500 to-cyan-400 text-white'
            }`}>
              <Dna className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-extrabold tracking-tight text-white">MediSim<span className={platformMode === 'general' ? 'text-teal-400' : 'text-indigo-400'}>AI</span></span>
                <span className="text-[9px] uppercase font-bold px-1.5 py-0.2 rounded bg-slate-800 text-slate-300 border border-slate-700">v2.5</span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden lg:flex items-center gap-1 overflow-x-auto">
            {currentNav.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? platformMode === 'general'
                        ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                        : 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          {/* Right Actions: Theme Selector & Profile / Sign In */}
          <div className="flex items-center space-x-2">
            <ThemeSelector
              currentTheme={currentTheme}
              onSelectTheme={onSelectTheme}
            />

            <button
              onClick={onOpenAuth}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700 transition-all"
            >
              <User className="w-3.5 h-3.5 text-teal-400" />
              <span>{currentUser ? currentUser.full_name?.split(' ')[0] || 'Profile' : 'Consent & Profile'}</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
