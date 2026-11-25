import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { OrganEvidence, DrugJourney, DrugJourneyStage } from '../../types';
import { HumanBody3D } from '../../components/HumanBody3D';
import { SimulationTimeline } from '../../components/SimulationTimeline';
import { OrganEvidenceOverlay } from '../../components/OrganEvidenceOverlay';
import { Activity, Pill, AlertCircle, Info, Sparkles, ShieldCheck } from 'lucide-react';

const POPULAR_MEDICINES = [
  'Acetaminophen (Paracetamol / Dolo 650)',
  'Warfarin (Blood Thinner)',
  'Atorvastatin (Cholesterol / Storvas)',
  'Ibuprofen (Pain & Inflammation / Brufen)',
  'Metformin (Blood Sugar / Glycomet)'
];

export const GeneralBodySimulator: React.FC = () => {
  const [selectedMedicine, setSelectedMedicine] = useState<string>('Acetaminophen');
  const [organEvidence, setOrganEvidence] = useState<OrganEvidence[]>([]);
  const [journey, setJourney] = useState<DrugJourney | null>(null);
  const [currentStageIndex, setCurrentStageIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1.0);
  const [selectedOrganId, setSelectedOrganId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Fetch organ evidence and drug journey on medicine change
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const cleanName = selectedMedicine.split(' ')[0];
        const [evRes, journeyRes] = await Promise.all([
          api.getDrugOrganEvidence(cleanName),
          api.getDrugJourney(cleanName, 'Oral')
        ]);
        setOrganEvidence(evRes.organs);
        setJourney(journeyRes);
        setCurrentStageIndex(0);
        setIsPlaying(false);
      } catch (e) {
        console.error('Failed to load organ evidence or journey', e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [selectedMedicine]);

  // Handle timeline playback timer
  useEffect(() => {
    if (!isPlaying || !journey) return;

    const currentStage = journey.stages[currentStageIndex];
    const duration = (currentStage?.duration_seconds || 3.0) * 1000 / playbackSpeed;

    const timer = setTimeout(() => {
      if (currentStageIndex < journey.stages.length - 1) {
        setCurrentStageIndex(prev => prev + 1);
      } else {
        setIsPlaying(false); // Stop at end of journey
      }
    }, duration);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStageIndex, journey, playbackSpeed]);

  const activeStage = journey?.stages[currentStageIndex] || null;
  const activeEvidence = selectedOrganId ? organEvidence.find(e => e.organ_id === selectedOrganId) || null : null;

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Header & Medicine Picker */}
      <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-slate-800 gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30 mb-2">
            <Activity className="w-3.5 h-3.5" />
            <span>Signature Feature – Animated 3D Body Simulator</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Visualize How Medicine Travels Through Your Body
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Rotate the 3D model, watch the animated absorption and clearance journey, and click any organ to inspect documented evidence.
          </p>
        </div>

        {/* Medicine Selector Dropdown */}
        <div className="flex items-center space-x-2 shrink-0">
          <Pill className="w-4 h-4 text-teal-400" />
          <select
            value={selectedMedicine}
            onChange={(e) => setSelectedMedicine(e.target.value)}
            className="px-4 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-teal-500 shadow-lg"
          >
            {POPULAR_MEDICINES.map((med) => (
              <option key={med} value={med.split(' ')[0]}>
                {med}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Main Simulation Viewport Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: 3D Body Canvas */}
        <div className="lg:col-span-7 space-y-4">
          <HumanBody3D
            organEvidenceList={organEvidence}
            selectedOrganId={selectedOrganId}
            onSelectOrgan={(id) => setSelectedOrganId(id)}
            currentStage={activeStage}
          />
        </div>

        {/* Right 5 Cols: Organ Details Panel or Guide */}
        <div className="lg:col-span-5 space-y-4">
          {selectedOrganId && activeEvidence ? (
            <OrganEvidenceOverlay
              evidence={activeEvidence}
              onClose={() => setSelectedOrganId(null)}
            />
          ) : (
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-4 shadow-xl">
              <div className="flex items-center space-x-2 text-teal-400 font-bold text-sm">
                <Sparkles className="w-4 h-4" />
                <span>Interactive Anatomy Guide</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Click on any highlighted organ (e.g. <strong>Liver</strong>, <strong>Heart</strong>, <strong>Kidneys</strong>, <strong>Stomach</strong>) on the 3D model to reveal its biological function, metabolism role, and scientific evidence for <strong>{selectedMedicine}</strong>.
              </p>

              <div className="space-y-2 pt-2 border-t border-slate-800 text-xs">
                <span className="font-semibold text-slate-400 block">Quick Inspect:</span>
                <div className="flex flex-wrap gap-1.5">
                  {organEvidence.filter(e => e.status !== 'grey').map((e) => (
                    <button
                      key={e.organ_id}
                      onClick={() => setSelectedOrganId(e.organ_id)}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl capitalize font-medium transition-colors"
                    >
                      {e.name} ({e.status})
                    </button>
                  ))}
                </div>
              </div>

              {/* Scientific Honesty Notice */}
              <div className="bg-slate-950/70 p-3.5 rounded-xl border border-slate-850 text-[11px] text-slate-400 leading-relaxed">
                <ShieldCheck className="w-4 h-4 text-teal-400 mb-1" />
                These visual states reflect population-level biomedical research. They do not claim to detect damage or diagnose your body.
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Timeline Controller */}
      {journey && (
        <SimulationTimeline
          journey={journey}
          currentStageIndex={currentStageIndex}
          onSelectStage={(idx) => setCurrentStageIndex(idx)}
          isPlaying={isPlaying}
          onTogglePlay={() => setIsPlaying(!isPlaying)}
          onReset={() => {
            setCurrentStageIndex(0);
            setIsPlaying(false);
          }}
          playbackSpeed={playbackSpeed}
          onChangeSpeed={(s) => setPlaybackSpeed(s)}
        />
      )}
    </div>
  );
};
