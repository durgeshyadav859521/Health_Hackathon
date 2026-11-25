import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { CalendarOverview, ScheduledDose, MedicationReminder } from '../../types';
import { Calendar, Clock, Pill, ShieldCheck, Heart, AlertCircle, CheckCircle2, ChevronRight, Sparkles, Activity } from 'lucide-react';

interface GeneralDashboardProps {
  onNavigate: (page: string) => void;
}

export const GeneralDashboard: React.FC<GeneralDashboardProps> = ({ onNavigate }) => {
  const [calendarData, setCalendarData] = useState<CalendarOverview | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOverview = async () => {
      try {
        const data = await api.getCalendarOverview();
        setCalendarData(data);
      } catch (e) {
        console.error('Failed to load dashboard overview', e);
      } finally {
        setLoading(false);
      }
    };
    fetchOverview();
  }, []);

  const handleDoseAction = async (doseId: string, status: string) => {
    try {
      await api.updateDoseStatus(doseId, status);
      const refreshed = await api.getCalendarOverview();
      setCalendarData(refreshed);
    } catch (e) {
      console.error('Failed to update dose status', e);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-teal-900/60 via-slate-900 to-emerald-950/40 border border-teal-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-teal-500/20 text-teal-300 rounded-full text-xs font-semibold border border-teal-500/30">
            <Heart className="w-3.5 h-3.5 fill-current" />
            <span>General User Platform – MediSim AI</span>
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
            Understand Your Medicines. Manage Your Health Schedule.
          </h1>
          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            Explore clear, doctor-verified explanations of your prescribed medicines, visualize their journey through your body, and keep track of daily doses with smart reminders.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('general-simulator')}
              className="px-5 py-2.5 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-teal-500/20 transition-all flex items-center space-x-2"
            >
              <Activity className="w-4 h-4" />
              <span>Explore 3D Body Simulator</span>
            </button>
            <button
              onClick={() => onNavigate('smart-calendar')}
              className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-medium text-xs sm:text-sm rounded-xl border border-slate-700 transition-all flex items-center space-x-2"
            >
              <Calendar className="w-4 h-4" />
              <span>Open Medicine Calendar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Quick Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-teal-500/10 text-teal-400 rounded-xl">
            <Pill className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Scheduled Today</div>
            <div className="text-2xl font-bold text-white">
              {calendarData?.today_schedule.length || 0} Doses
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Self-Reported Adherence</div>
            <div className="text-2xl font-bold text-emerald-400">
              {calendarData?.adherence_statistics.rate_percentage || 100}%
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Active Reminders</div>
            <div className="text-2xl font-bold text-cyan-400">
              {calendarData?.reminders.length || 0}
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-sm flex items-center space-x-4">
          <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-xl">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="text-xs text-slate-400 font-medium">Interaction Safety</div>
            <div className="text-xs font-bold text-slate-200 mt-1">
              Active Checker Available
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid: Today's Schedule & Reminders */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Medication Schedule */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Clock className="w-5 h-5 text-teal-400" />
              <h2 className="text-lg font-bold text-white">Today's Medication Schedule</h2>
            </div>
            <button
              onClick={() => onNavigate('smart-calendar')}
              className="text-xs text-teal-400 hover:text-teal-300 flex items-center space-x-1"
            >
              <span>View full calendar</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {calendarData && calendarData.today_schedule.length > 0 ? (
              calendarData.today_schedule.map((dose) => (
                <div
                  key={dose.dose_id}
                  className="bg-slate-900/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-4.5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 text-teal-300 rounded">
                        {dose.time}
                      </span>
                      <h4 className="text-base font-bold text-white">
                        {dose.medicine_name}
                      </h4>
                      {dose.brand_name && (
                        <span className="text-xs text-slate-400">({dose.brand_name})</span>
                      )}
                      <span className="text-xs text-slate-400">• {dose.strength}</span>
                    </div>
                    <div className="text-xs text-slate-400 flex items-center space-x-2">
                      <span>{dose.food_timing}</span>
                      {dose.instructions && <span>• {dose.instructions}</span>}
                    </div>
                  </div>

                  {/* Dose Action Buttons */}
                  <div className="flex items-center space-x-2 shrink-0">
                    {dose.status === 'Taken' ? (
                      <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-xs font-semibold rounded-xl flex items-center space-x-1.5">
                        <CheckCircle2 className="w-4 h-4" />
                        <span>Taken</span>
                      </span>
                    ) : (
                      <>
                        <button
                          onClick={() => handleDoseAction(dose.dose_id, 'Taken')}
                          className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl transition-all"
                        >
                          Mark Taken
                        </button>
                        <button
                          onClick={() => handleDoseAction(dose.dose_id, 'Skipped')}
                          className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium rounded-xl transition-all"
                        >
                          Skip
                        </button>
                      </>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-8 text-center text-slate-400 text-sm">
                No doses scheduled for today. Add a new prescription in the Smart Calendar!
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Smart Reminders & Safety Guidelines */}
        <div className="space-y-6">
          {/* Active Reminders Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Upcoming Reminders</span>
            </h3>

            <div className="space-y-2.5">
              {calendarData?.reminders.map((rem) => (
                <div
                  key={rem.id}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    rem.urgent
                      ? 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                      : 'bg-slate-950/60 border-slate-850 text-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between font-semibold">
                    <span>{rem.medicine}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {rem.time}
                    </span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">
                    {rem.message}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Missed Dose Golden Rule */}
          <div className="bg-teal-950/20 border border-teal-800/40 rounded-2xl p-4.5 space-y-2 text-xs text-teal-200">
            <div className="flex items-center space-x-2 font-bold text-teal-300">
              <ShieldCheck className="w-4 h-4" />
              <span>Important Medication Rule</span>
            </div>
            <p className="text-slate-300 leading-relaxed text-[11px]">
              If you ever miss a dose, take it as soon as you remember unless it is nearly time for your next dose. <strong className="text-teal-200">Never take a double dose</strong> to make up for a missed one.
            </p>
          </div>

          {/* Quick Links Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 space-y-2.5">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
              Explore More Tools
            </h4>
            <button
              onClick={() => onNavigate('drug-interaction')}
              className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-800 rounded-xl text-left text-xs font-medium text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Check Drug Interactions</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => onNavigate('ai-guide')}
              className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-800 rounded-xl text-left text-xs font-medium text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Ask AI Medicine Guide</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
            <button
              onClick={() => onNavigate('medicine-explorer-general')}
              className="w-full p-2.5 bg-slate-950/80 hover:bg-slate-800 rounded-xl text-left text-xs font-medium text-slate-200 flex items-center justify-between transition-colors"
            >
              <span>Explore Medicine Directory</span>
              <ChevronRight className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
