import React, { useState, useRef, useEffect } from 'react';
import { Palette, Check, Sun, Moon, Sparkles, Dna, ShieldCheck } from 'lucide-react';
import { ThemeMode } from '../types';

interface ThemeSelectorProps {
  currentTheme: ThemeMode;
  onSelectTheme: (theme: ThemeMode) => void;
}

interface ThemeOption {
  id: ThemeMode;
  name: string;
  tagline: string;
  icon: React.ElementType;
  colors: {
    bg: string;
    card: string;
    accent: string;
    text: string;
  };
}

const THEME_OPTIONS: ThemeOption[] = [
  {
    id: 'midnight',
    name: 'Midnight Navy',
    tagline: 'Default AI Biomedical Research aesthetic with deep navy and cyan glow',
    icon: Moon,
    colors: {
      bg: '#0B132B',
      card: '#1C2541',
      accent: '#06D6A0',
      text: '#F8FAFC'
    }
  },
  {
    id: 'cyber-emerald',
    name: 'Bio-Cyber Emerald',
    tagline: 'Obsidian biolab dark mode with neon emerald and mint green signals',
    icon: Sparkles,
    colors: {
      bg: '#09090b',
      card: '#18181b',
      accent: '#10B981',
      text: '#ECFDF5'
    }
  },
  {
    id: 'deep-indigo',
    name: 'Deep Research Indigo',
    tagline: 'Cosmic deep indigo with electric violet and cyan highlights',
    icon: Dna,
    colors: {
      bg: '#0b0914',
      card: '#15102a',
      accent: '#818CF8',
      text: '#EEF2FF'
    }
  },
  {
    id: 'clinical-light',
    name: 'Clinical Light',
    tagline: 'Clean hospital-grade medical white with crisp navy typography',
    icon: Sun,
    colors: {
      bg: '#F8FAFC',
      card: '#FFFFFF',
      accent: '#0D9488',
      text: '#0F172A'
    }
  }
];

export const ThemeSelector: React.FC<ThemeSelectorProps> = ({
  currentTheme,
  onSelectTheme
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const activeOption = THEME_OPTIONS.find(t => t.id === currentTheme) || THEME_OPTIONS[0];
  const ActiveIcon = activeOption.icon;

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-900/90 hover:bg-slate-800 text-slate-200 border border-slate-700/80 transition-all shadow-sm hover:border-teal-500/40"
        title="Customize Application Theme"
      >
        <Palette className="w-3.5 h-3.5 text-teal-400" />
        <span className="hidden sm:inline font-medium">{activeOption.name}</span>
        <span
          className="w-2.5 h-2.5 rounded-full border border-white/20 shadow-xs"
          style={{ backgroundColor: activeOption.colors.accent }}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 shadow-2xl z-50 space-y-2 animate-in fade-in slide-in-from-top-2 duration-150">
          <div className="px-2 py-1.5 border-b border-slate-800 flex items-center justify-between">
            <span className="text-xs font-bold text-white uppercase tracking-wider flex items-center space-x-1.5">
              <Palette className="w-3.5 h-3.5 text-teal-400" />
              <span>Theme Appearance</span>
            </span>
            <span className="text-[10px] text-slate-400 font-mono">4 Modes</span>
          </div>

          <div className="space-y-1.5 pt-1">
            {THEME_OPTIONS.map((theme) => {
              const isSelected = currentTheme === theme.id;
              const Icon = theme.icon;
              return (
                <button
                  key={theme.id}
                  onClick={() => {
                    onSelectTheme(theme.id);
                    setIsOpen(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-3 ${
                    isSelected
                      ? 'bg-slate-800/90 border-teal-500/50 shadow-md ring-1 ring-teal-500/30'
                      : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  {/* Theme Color Preview Swatch */}
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 border border-white/10 shadow-sm"
                    style={{ backgroundColor: theme.colors.bg }}
                  >
                    <Icon className="w-4 h-4" style={{ color: theme.colors.accent }} />
                  </div>

                  <div className="flex-1 min-w-0 space-y-0.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-white truncate">
                        {theme.name}
                      </span>
                      {isSelected && (
                        <Check className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                      )}
                    </div>
                    <p className="text-[10px] text-slate-400 leading-tight line-clamp-1">
                      {theme.tagline}
                    </p>

                    {/* Palette Dots */}
                    <div className="flex items-center space-x-1 pt-1">
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.colors.bg }}
                        title="Background"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.colors.card }}
                        title="Surface / Card"
                      />
                      <span
                        className="w-2.5 h-2.5 rounded-full border border-white/20"
                        style={{ backgroundColor: theme.colors.accent }}
                        title="Primary Accent"
                      />
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
