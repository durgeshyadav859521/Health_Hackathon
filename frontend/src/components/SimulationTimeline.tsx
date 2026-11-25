import React, { useEffect, useState } from 'react';
import { DrugJourney, DrugJourneyStage } from '../types';
import { Play, Pause, RotateCcw, ChevronLeft, ChevronRight, FastForward, Clock } from 'lucide-react';

interface SimulationTimelineProps {
  journey: DrugJourney;
  currentStageIndex: number;
  onSelectStage: (index: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
  onReset: () => void;
  playbackSpeed: number;
  onChangeSpeed: (speed: number) => void;
}

export const SimulationTimeline: React.FC<SimulationTimelineProps> = ({
  journey,
  currentStageIndex,
  onSelectStage,
  isPlaying,
  onTogglePlay,
  onReset,
  playbackSpeed,
  onChangeSpeed
}) => {
  const currentStage = journey.stages[currentStageIndex];

  return (
    <div className="w-full bg-slate-900/90 backdrop-blur-md rounded-2xl border border-slate-800 p-4 shadow-xl">
      {/* Current Stage Card */}
      {currentStage && (
        <div className="mb-4 bg-slate-950/70 rounded-xl p-3.5 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 text-xs font-semibold rounded-md">
                Stage {currentStage.stage_number} of {journey.total_stages}
              </span>
              <h4 className="text-sm font-bold text-white tracking-wide">
                {currentStage.title}
              </h4>
              <span className="text-xs text-slate-400">
                ({currentStage.target_system})
              </span>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
              {currentStage.description}
            </p>
          </div>

          <div className="shrink-0 text-right text-xs">
            <span className="text-slate-400">Primary Clearance / Action Site: </span>
            <span className="text-cyan-300 font-medium capitalize bg-cyan-950/60 px-2 py-1 rounded border border-cyan-800/50">
              {currentStage.primary_organ}
            </span>
          </div>
        </div>
      )}

      {/* Stage Steps Indicator */}
      <div className="grid grid-cols-6 gap-2 mb-4">
        {journey.stages.map((stage, idx) => {
          const isActive = idx === currentStageIndex;
          const isPassed = idx < currentStageIndex;
          return (
            <button
              key={stage.stage_number}
              onClick={() => onSelectStage(idx)}
              className={`p-2 rounded-xl text-left transition-all border ${
                isActive
                  ? 'bg-cyan-950/70 border-cyan-500 text-white shadow-lg shadow-cyan-900/20'
                  : isPassed
                  ? 'bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700'
                  : 'bg-slate-950/30 border-slate-850 text-slate-500 hover:text-slate-300'
              }`}
            >
              <div className="text-[10px] font-mono text-cyan-400/80 mb-0.5">
                0{stage.stage_number}
              </div>
              <div className="text-xs font-semibold truncate">
                {stage.title}
              </div>
              <div className="text-[10px] text-slate-400 truncate capitalize mt-0.5">
                {stage.primary_organ}
              </div>
            </button>
          );
        })}
      </div>

      {/* Control Buttons & Speed */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/60">
        <div className="flex items-center space-x-2">
          <button
            onClick={onReset}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 rounded-lg transition-colors"
            title="Reset to Stage 1"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            onClick={() => onSelectStage(Math.max(0, currentStageIndex - 1))}
            disabled={currentStageIndex === 0}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors"
            title="Previous Stage"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={onTogglePlay}
            className="flex items-center space-x-1.5 px-4 py-2 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-medium text-xs rounded-lg shadow-md transition-all"
          >
            {isPlaying ? (
              <>
                <Pause className="w-3.5 h-3.5 fill-current" />
                <span>Pause</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Play Journey</span>
              </>
            )}
          </button>
          <button
            onClick={() => onSelectStage(Math.min(journey.stages.length - 1, currentStageIndex + 1))}
            disabled={currentStageIndex === journey.stages.length - 1}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/60 hover:bg-slate-800 disabled:opacity-40 rounded-lg transition-colors"
            title="Next Stage"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Speed Controls */}
        <div className="flex items-center space-x-2">
          <span className="text-xs text-slate-400 flex items-center space-x-1">
            <Clock className="w-3.5 h-3.5" />
            <span>Speed:</span>
          </span>
          {[0.5, 1.0, 2.0].map(s => (
            <button
              key={s}
              onClick={() => onChangeSpeed(s)}
              className={`px-2 py-1 text-xs font-medium rounded transition-all ${
                playbackSpeed === s
                  ? 'bg-slate-700 text-cyan-300 font-bold border border-cyan-500/40'
                  : 'text-slate-400 hover:text-white bg-slate-800/40'
              }`}
            >
              {s}x
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};
