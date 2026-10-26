import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types/user';
import { isSupabaseConfigured, supabase } from '../services/supabaseClient';
import { useToast } from '../context/ToastContext';
import {
  ShieldCheck,
  KeyRound,
  User,
  CheckCircle2,
  Lock,
  Database,
  ArrowRight,
  Info,
  Layers,
} from 'lucide-react';

export const AuthPage: React.FC = () => {
  const { currentUser, switchUserRole, userProfiles, setActiveTab } = useApp();
  const toast = useToast();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);

  const isSupabaseReady = isSupabaseConfigured();

  const handleSupabaseAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isSupabaseReady || !supabase) {
      toast.warning(
        'Supabase Credentials Not Configured',
        'Running in local sandbox mode. Use the instant role selector below to test permissions.'
      );
      return;
    }

    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        toast.success('Account Created', 'Check your email for confirmation instructions.');
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        toast.success('Signed In via Supabase Auth');
      }
    } catch (err: any) {
      toast.error('Authentication Error', err.message);
    } finally {
      setLoading(false);
    }
  };

  const personaDetails: Record<
    UserRole,
    { badge: string; capabilities: string[]; restrictions: string[] }
  > = {
    COORDINATOR: {
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
      capabilities: [
        'Verify or reject community reports',
        'Dispatch response units with conflict prevention',
        'Override automated priority score with audit rationale',
        'Add internal coordination notes',
        'View unmasked private reporter contact details',
      ],
      restrictions: ['Cannot modify system schema or delete master admin profiles'],
    },
    ADMINISTRATOR: {
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
      capabilities: [
        'Complete system oversight & policy tuning',
        'Enroll new volunteers and fleet response assets',
        'Database migration and RLS management',
        'Full read & write access across all tables',
      ],
      restrictions: ['All sensitive changes are logged in the audit trail'],
    },
    VOLUNTEER: {
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
      capabilities: [
        'View assignments designated to own response unit',
        'Update on-duty / off-duty readiness status',
        'Submit mission status updates',
      ],
      restrictions: ['Cannot dispatch other teams or override priority scores'],
    },
    REPORTER: {
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
      capabilities: [
        'Submit incident reports with GPS pin and photos',
        'Track progress of submitted incidents in the public queue',
      ],
      restrictions: [
        'Private phone numbers of other reporters are masked',
        'Cannot access internal dispatcher notes or dispatch units',
      ],
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header */}
      <div className="space-y-1 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Authentication & Role-Based Permissions
            </h1>
            <p className="text-xs text-slate-400">
              Supabase Auth integration with instant reviewer persona simulation
            </p>
          </div>
        </div>
      </div>

      {/* Backend Mode Status Banner */}
      <div
        className={`p-4 rounded-xl border text-xs flex items-center justify-between gap-4 ${
          isSupabaseReady
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-200'
            : 'bg-slate-900 border-slate-800 text-slate-300'
        }`}
      >
        <div className="flex items-center gap-3">
          <Database className="w-5 h-5 text-indigo-400 shrink-0" />
          <div>
            <p className="font-bold text-white">
              {isSupabaseReady
                ? 'Connected to Live Supabase Cloud Instance'
                : 'Interactive Demo Sandbox Mode (LocalStorage Persistence)'}
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              {isSupabaseReady
                ? 'Row Level Security (RLS) is active. Auth tokens verified against Supabase auth.users.'
                : 'No Supabase credentials detected in environment. Full functionality is available in sandbox mode.'}
            </p>
          </div>
        </div>

        <div className="shrink-0 text-right">
          <span className="font-mono text-xs px-2.5 py-1 rounded-full bg-slate-800 text-slate-200 border border-slate-700">
            Current: {currentUser.role}
          </span>
        </div>
      </div>

      {/* Instant Reviewer Persona Simulator */}
      <div className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-white">
            Instant Persona Simulator for Portfolio Review
          </h2>
          <p className="text-xs text-slate-400">
            Click any persona below to switch permissions and test UI access boundaries instantly:
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {userProfiles.map((profile) => {
            const isCurrent = currentUser.id === profile.id;
            const details = personaDetails[profile.role];

            return (
              <div
                key={profile.id}
                onClick={() => switchUserRole(profile.role)}
                className={`p-5 rounded-2xl border transition-all cursor-pointer relative ${
                  isCurrent
                    ? 'bg-indigo-950/40 border-indigo-500/50 shadow-xl ring-2 ring-indigo-500/20'
                    : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-bold text-white">
                      {profile.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-white">{profile.fullName}</h3>
                      <p className="text-xs text-slate-400">{profile.department}</p>
                    </div>
                  </div>

                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${details.badge}`}>
                    {profile.role}
                  </span>
                </div>

                <div className="space-y-2 text-xs pt-2 border-t border-slate-800/80">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                      Granted Permissions:
                    </span>
                    <ul className="space-y-1 text-slate-300 text-[11px]">
                      {details.capabilities.map((cap, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{cap}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-rose-400 block mb-1">
                      Security Boundaries:
                    </span>
                    <ul className="space-y-1 text-slate-400 text-[11px]">
                      {details.restrictions.map((res, i) => (
                        <li key={i} className="flex items-start gap-1.5">
                          <Lock className="w-3.5 h-3.5 text-rose-400 shrink-0 mt-0.5" />
                          <span>{res}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {isCurrent && (
                  <div className="mt-4 pt-2 border-t border-indigo-500/30 flex items-center justify-between text-indigo-300 font-bold text-xs">
                    <span>Active Session</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Supabase Real Auth Form Box */}
      <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 space-y-4">
        <div>
          <h3 className="font-bold text-sm text-white">Live Supabase Authentication Form</h3>
          <p className="text-xs text-slate-400">
            For production deployment with a real Supabase URL and Anon Key
          </p>
        </div>

        <form onSubmit={handleSupabaseAuth} className="space-y-3 max-w-md text-xs">
          <div>
            <label className="block text-slate-300 font-medium mb-1">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="responder@domain.org"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              disabled={!isSupabaseReady}
            />
          </div>

          <div>
            <label className="block text-slate-300 font-medium mb-1">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-white"
              disabled={!isSupabaseReady}
            />
          </div>

          <div className="pt-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={loading || !isSupabaseReady}
              className="px-5 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white font-bold text-xs transition-colors"
            >
              {loading ? 'Authenticating...' : isSignUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-xs text-slate-400 hover:text-white underline"
            >
              {isSignUp ? 'Already registered? Sign In' : 'Create new Supabase account'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
