import React, { useState } from 'react';
import { X, Shield, Lock, Mail, User, CheckCircle2, Trash2, AlertTriangle } from 'lucide-react';
import { api } from '../services/api';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: any;
  setCurrentUser: (user: any) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  setCurrentUser
}) => {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [consentGiven, setConsentGiven] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    try {
      if (isRegister) {
        if (!consentGiven) {
          setError('Informed research consent is required to create a researcher account.');
          return;
        }
        const res = await api.register({
          email,
          password,
          full_name: fullName,
          consent_given: consentGiven
        });
        if (res.user) {
          setCurrentUser(res.user);
          setSuccessMsg('Account created successfully!');
          setTimeout(() => onClose(), 1200);
        } else {
          setError(res.detail || 'Registration failed');
        }
      } else {
        const res = await api.login({ email, password });
        if (res.user) {
          setCurrentUser(res.user);
          setSuccessMsg('Signed in successfully!');
          setTimeout(() => onClose(), 1000);
        } else {
          setError(res.detail || 'Invalid email or password');
        }
      }
    } catch (err: any) {
      setError(err.message || 'Authentication error');
    }
  };

  const handleDeleteData = async () => {
    if (!currentUser?.email) return;
    if (confirm('Are you sure you want to delete all personal baseline data and history? This cannot be undone.')) {
      await api.deleteUserData(currentUser.email);
      setCurrentUser(null);
      setSuccessMsg('All personal records have been permanently purged.');
      setTimeout(() => onClose(), 1500);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-md glass-panel p-6 rounded-2xl border border-slate-700 bg-[#0F172A] shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
        >
          <X className="w-5 h-5" />
        </button>

        {currentUser ? (
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-[#06D6A0] to-[#00F5D4] flex items-center justify-center text-[#0B132B] font-bold text-lg">
                {currentUser.full_name?.charAt(0) || 'U'}
              </div>
              <div>
                <h3 className="text-base font-bold text-white">{currentUser.full_name || 'Active Researcher'}</h3>
                <p className="text-xs text-slate-400">{currentUser.email}</p>
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40 text-xs text-emerald-300 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>Informed biomedical research consent verified and active.</span>
            </div>

            {successMsg && (
              <div className="p-2.5 rounded bg-emerald-900/30 text-emerald-300 text-xs font-medium">
                {successMsg}
              </div>
            )}

            <div className="pt-4 border-t border-slate-800 space-y-2">
              <button
                onClick={() => setCurrentUser(null)}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Sign Out
              </button>
              <button
                onClick={handleDeleteData}
                className="w-full py-2 rounded-lg text-xs font-semibold bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 border border-rose-800/40 flex items-center justify-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                Purge All My Data (GDPR / Privacy)
              </button>
            </div>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Shield className="w-5 h-5 text-[#06D6A0]" />
              <h3 className="text-lg font-bold text-white">
                {isRegister ? 'Create Researcher Account' : 'Sign In to MediSim AI'}
              </h3>
            </div>
            <p className="text-xs text-slate-400 mb-5">
              Access customized simulation profiles, download scientific reports, and manage research baselines.
            </p>

            {error && (
              <div className="mb-4 p-2.5 rounded bg-rose-950/40 border border-rose-800/50 text-rose-300 text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {successMsg && (
              <div className="mb-4 p-2.5 rounded bg-emerald-950/40 border border-emerald-800/50 text-emerald-300 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{successMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3">
              {isRegister && (
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Full Name</label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      required
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      placeholder="Dr. Jane Doe / Researcher"
                      className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06D6A0]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Email Address</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="researcher@institution.edu"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06D6A0]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 uppercase mb-1">Password</label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-9 pr-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-[#06D6A0]"
                  />
                </div>
              </div>

              {isRegister && (
                <div className="pt-2">
                  <label className="flex items-start gap-2 cursor-pointer text-[11px] text-slate-300">
                    <input
                      type="checkbox"
                      checked={consentGiven}
                      onChange={(e) => setConsentGiven(e.target.checked)}
                      className="mt-0.5 rounded border-slate-700 text-[#06D6A0] focus:ring-[#06D6A0]"
                    />
                    <span>
                      I consent to the educational use of baseline data and acknowledge that MediSim AI is an investigational research prototype, not a medical diagnosis device.
                    </span>
                  </label>
                </div>
              )}

              <button
                type="submit"
                className="w-full mt-2 py-2.5 rounded-lg text-xs font-bold bg-gradient-to-r from-[#06D6A0] to-[#00F5D4] text-[#0B132B] hover:opacity-95 shadow-lg shadow-[#06D6A0]/20 transition-all"
              >
                {isRegister ? 'Create Researcher Account' : 'Sign In'}
              </button>
            </form>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => {
                  setIsRegister(!isRegister);
                  setError(null);
                }}
                className="text-xs text-[#00F5D4] hover:underline"
              >
                {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Register"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
