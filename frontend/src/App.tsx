import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { AuthModal } from './components/AuthModal';
import { PlatformMode, ThemeMode } from './types';

// General User Pages
import { GeneralDashboard } from './pages/general/GeneralDashboard';
import { MedicineExplorerGeneral } from './pages/general/MedicineExplorerGeneral';
import { GeneralBodySimulator } from './pages/general/GeneralBodySimulator';
import { SmartCalendar } from './pages/general/SmartCalendar';
import { DrugInteractionChecker } from './pages/general/DrugInteractionChecker';
import { AIMedicineGuide } from './pages/general/AIMedicineGuide';

// Researcher Platform Pages
import { ResearcherDashboard } from './pages/researcher/ResearcherDashboard';
import { MolecularExplorer } from './pages/researcher/MolecularExplorer';
import { ResearchAssistant } from './pages/researcher/ResearchAssistant';
import { Simulator } from './pages/Simulator';
import { BiologicalResponse } from './pages/BiologicalResponse';
import { ExplainableAI } from './pages/ExplainableAI';
import { AnalyticsDashboard } from './pages/AnalyticsDashboard';
import { ResearchDatasets } from './pages/ResearchDatasets';
import { About } from './pages/About';

export function App() {
  const [platformMode, setPlatformMode] = useState<PlatformMode>('general');
  const [activeTab, setActiveTab] = useState<string>('general-dashboard');
  const [selectedDrugForSim, setSelectedDrugForSim] = useState<string>('Acetaminophen');
  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [theme, setTheme] = useState<ThemeMode>(() => {
    return (localStorage.getItem('medisim-theme') as ThemeMode) || 'midnight';
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('medisim-theme', theme);
  }, [theme]);

  const handleSelectDrugForSimulation = (drugName: string) => {
    setSelectedDrugForSim(drugName);
    setPlatformMode('researcher');
    setActiveTab('simulator');
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 selection:bg-teal-400 selection:text-slate-950 transition-colors duration-250">
      {/* Top Navigation with Platform & Theme Switcher */}
      <Navbar
        platformMode={platformMode}
        setPlatformMode={setPlatformMode}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenAuth={() => setIsAuthOpen(true)}
        currentUser={currentUser}
        currentTheme={theme}
        onSelectTheme={setTheme}
      />

      {/* Main Viewport */}
      <main className="flex-1 pb-12">
        {/* GENERAL USER PLATFORM ROUTES */}
        {activeTab === 'general-dashboard' && (
          <GeneralDashboard onNavigate={(page) => setActiveTab(page)} />
        )}
        {activeTab === 'medicine-explorer-general' && (
          <MedicineExplorerGeneral onSelectForSimulation={handleSelectDrugForSimulation} />
        )}
        {activeTab === 'general-simulator' && (
          <GeneralBodySimulator />
        )}
        {activeTab === 'smart-calendar' && (
          <SmartCalendar />
        )}
        {activeTab === 'drug-interaction' && (
          <DrugInteractionChecker />
        )}
        {activeTab === 'ai-guide' && (
          <AIMedicineGuide />
        )}

        {/* RESEARCHER PLATFORM ROUTES */}
        {activeTab === 'researcher-dashboard' && (
          <ResearcherDashboard onNavigate={(page) => setActiveTab(page)} />
        )}
        {activeTab === 'simulator' && (
          <Simulator initialDrugName={selectedDrugForSim} />
        )}
        {activeTab === 'molecular-explorer' && (
          <MolecularExplorer />
        )}
        {activeTab === 'biological' && (
          <BiologicalResponse />
        )}
        {activeTab === 'explainable' && (
          <ExplainableAI />
        )}
        {activeTab === 'analytics' && (
          <AnalyticsDashboard />
        )}
        {activeTab === 'research' && (
          <ResearchDatasets />
        )}
        {activeTab === 'research-assistant' && (
          <ResearchAssistant />
        )}
        {activeTab === 'about' && (
          <About />
        )}
      </main>

      {/* Footer */}
      <Footer />

      {/* Auth & Informed Consent Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        setCurrentUser={setCurrentUser}
      />
    </div>
  );
}

export default App;
