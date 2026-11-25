import React, { useState, useEffect } from 'react';
import { api } from '../../services/api';
import { CalendarOverview, ScheduledDose, CalendarSchedule } from '../../types';
import { Calendar as CalendarIcon, Clock, Plus, CheckCircle2, XCircle, AlertTriangle, ChevronLeft, ChevronRight, ShieldCheck } from 'lucide-react';

export const SmartCalendar: React.FC = () => {
  const [calendarData, setCalendarData] = useState<CalendarOverview | null>(null);
  const [activeView, setActiveView] = useState<'day' | 'week' | 'month'>('week');
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state for adding schedule
  const [newMed, setNewMed] = useState({
    medicine_name: '',
    brand_name: '',
    strength: '',
    dosage_form: 'Tablet',
    prescribed_dose: '1 tablet',
    frequency: 'Once daily',
    scheduled_times: ['09:00'],
    food_timing: 'After food',
    instructions: '',
    prescribing_doctor: ''
  });

  const loadCalendar = async () => {
    try {
      const data = await api.getCalendarOverview();
      setCalendarData(data);
    } catch (e) {
      console.error('Failed to load calendar', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendar();
  }, []);

  const handleUpdateStatus = async (doseId: string, status: string) => {
    try {
      await api.updateDoseStatus(doseId, status);
      await loadCalendar();
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMed.medicine_name || !newMed.strength) return;

    try {
      await api.addMedicationSchedule(newMed);
      setShowAddModal(false);
      setNewMed({
        medicine_name: '',
        brand_name: '',
        strength: '',
        dosage_form: 'Tablet',
        prescribed_dose: '1 tablet',
        frequency: 'Once daily',
        scheduled_times: ['09:00'],
        food_timing: 'After food',
        instructions: '',
        prescribing_doctor: ''
      });
      await loadCalendar();
    } catch (err) {
      console.error('Failed to add schedule', err);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-800 gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <CalendarIcon className="w-6 h-6 text-teal-400" />
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
              Smart Medicine Calendar & Reminders
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Track daily doses, log taken medicines, and manage reminders based on confirmed prescriptions.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Toggles */}
          <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveView('day')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'day' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Day
            </button>
            <button
              onClick={() => setActiveView('week')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'week' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Week
            </button>
            <button
              onClick={() => setActiveView('month')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeView === 'month' ? 'bg-teal-500 text-slate-950 font-bold' : 'text-slate-400 hover:text-white'
              }`}
            >
              Month
            </button>
          </div>

          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center space-x-1.5 px-4 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Add Medicine</span>
          </button>
        </div>
      </div>

      {/* Adherence Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 font-extrabold text-xl">
            {calendarData?.adherence_statistics.rate_percentage || 100}%
          </div>
          <div>
            <h3 className="text-sm font-bold text-white">
              Self-Reported Medication Adherence
            </h3>
            <p className="text-xs text-slate-400">
              Taken: {calendarData?.adherence_statistics.taken_doses} | Skipped: {calendarData?.adherence_statistics.skipped_doses} | Missed: {calendarData?.adherence_statistics.missed_doses}
            </p>
          </div>
        </div>

        <div className="bg-amber-950/20 border border-amber-800/40 px-3.5 py-2.5 rounded-xl text-xs text-amber-200 max-w-md">
          <span className="font-bold text-amber-300 block mb-0.5">Missed Dose Guideline:</span>
          Never take a double dose to compensate for a missed dose. Continue with your next scheduled dose.
        </div>
      </div>

      {/* Main Calendar Viewport */}
      {activeView === 'day' ? (
        /* DAY VIEW */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Today's Schedule ({calendarData?.current_date})</h2>
          <div className="grid grid-cols-1 gap-3">
            {calendarData?.today_schedule.map((dose) => (
              <div
                key={dose.dose_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-mono font-bold px-2 py-0.5 bg-slate-800 text-teal-300 rounded">
                      {dose.time}
                    </span>
                    <span className="text-base font-bold text-white">{dose.medicine_name}</span>
                    {dose.brand_name && <span className="text-xs text-slate-400">({dose.brand_name})</span>}
                    <span className="text-xs text-slate-400">• {dose.strength}</span>
                  </div>
                  <div className="text-xs text-slate-400">
                    {dose.food_timing} {dose.instructions && `• ${dose.instructions}`}
                  </div>
                </div>

                <div className="flex items-center space-x-2 shrink-0">
                  <button
                    onClick={() => handleUpdateStatus(dose.dose_id, 'Taken')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      dose.status === 'Taken'
                        ? 'bg-emerald-500 text-slate-950 font-bold'
                        : 'bg-emerald-600/30 text-emerald-400 hover:bg-emerald-600/50'
                    }`}
                  >
                    Taken
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(dose.dose_id, 'Skipped')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      dose.status === 'Skipped'
                        ? 'bg-amber-500 text-slate-950 font-bold'
                        : 'bg-amber-600/20 text-amber-400 hover:bg-amber-600/40'
                    }`}
                  >
                    Skip
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(dose.dose_id, 'Missed')}
                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                      dose.status === 'Missed'
                        ? 'bg-rose-500 text-white font-bold'
                        : 'bg-rose-600/20 text-rose-400 hover:bg-rose-600/40'
                    }`}
                  >
                    Missed
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* WEEKLY / MONTHLY SLOTS VIEW */
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-white">Weekly Schedule Grid</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {calendarData?.weekly_schedule.map((dose) => (
              <div
                key={dose.dose_id}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-3"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-300 font-mono">{dose.date}</span>
                  <span className="px-2 py-0.5 bg-slate-800 text-teal-400 rounded font-mono font-bold">
                    {dose.time}
                  </span>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white">
                    {dose.medicine_name} {dose.brand_name && `(${dose.brand_name})`}
                  </h4>
                  <p className="text-xs text-slate-400">{dose.strength} • {dose.food_timing}</p>
                </div>
                <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className={`px-2 py-0.5 rounded text-[11px] font-semibold ${
                    dose.status === 'Taken' ? 'bg-emerald-500/20 text-emerald-400' :
                    dose.status === 'Missed' ? 'bg-rose-500/20 text-rose-400' :
                    dose.status === 'Skipped' ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-300'
                  }`}>
                    {dose.status}
                  </span>
                  <button
                    onClick={() => handleUpdateStatus(dose.dose_id, 'Taken')}
                    className="text-xs text-teal-400 hover:underline"
                  >
                    Update Status
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Medication Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-lg font-bold text-white">
                Add Prescribed Medication Schedule
              </h3>
              <button onClick={() => setShowAddModal(false)} className="text-slate-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleCreateSchedule} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1 font-medium">Medicine Name (Generic)</label>
                <input
                  type="text"
                  required
                  value={newMed.medicine_name}
                  onChange={(e) => setNewMed({ ...newMed, medicine_name: e.target.value })}
                  placeholder="e.g. Paracetamol, Metformin"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Brand Name (Optional)</label>
                  <input
                    type="text"
                    value={newMed.brand_name}
                    onChange={(e) => setNewMed({ ...newMed, brand_name: e.target.value })}
                    placeholder="e.g. Dolo 650, Glycomet"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Strength</label>
                  <input
                    type="text"
                    required
                    value={newMed.strength}
                    onChange={(e) => setNewMed({ ...newMed, strength: e.target.value })}
                    placeholder="e.g. 500 mg, 20 mg"
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Scheduled Time</label>
                  <input
                    type="time"
                    value={newMed.scheduled_times[0]}
                    onChange={(e) => setNewMed({ ...newMed, scheduled_times: [e.target.value] })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1 font-medium">Food Timing</label>
                  <select
                    value={newMed.food_timing}
                    onChange={(e) => setNewMed({ ...newMed, food_timing: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                  >
                    <option>After food</option>
                    <option>Before food</option>
                    <option>With food</option>
                    <option>At bedtime</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1 font-medium">Doctor / Prescriber (Optional)</label>
                <input
                  type="text"
                  value={newMed.prescribing_doctor}
                  onChange={(e) => setNewMed({ ...newMed, prescribing_doctor: e.target.value })}
                  placeholder="e.g. Dr. Sharma"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white"
                />
              </div>

              <div className="pt-3 flex justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold rounded-xl"
                >
                  Save Schedule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
