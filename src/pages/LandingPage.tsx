import React from 'react';
import { useApp } from '../context/AppContext';
import {
  Radio,
  ShieldAlert,
  ArrowRight,
  MapPin,
  Truck,
  BarChart3,
  CheckCircle2,
  PhoneCall,
  Clock,
  Layers,
  Sparkles,
  Code2,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setActiveTab, incidents, resources } = useApp();

  const openCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED' && i.status !== 'DUPLICATE'
  ).length;

  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;
  const availableResources = resources.filter((r) => r.status === 'AVAILABLE').length;

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative pt-6 sm:pt-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="relative rounded-3xl bg-gradient-to-b from-slate-900 via-slate-900/95 to-slate-950 border border-slate-800 p-8 sm:p-14 shadow-2xl overflow-hidden">
          {/* Subtle background glow */}
          <div className="absolute top-0 right-1/4 w-96 h-96 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-1/4 w-96 h-96 bg-indigo-600/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-3xl mx-auto text-center space-y-6">
            {/* Live operational badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/30 text-red-300 text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-ping" />
              <span>Smart Emergency Coordination & Community Dispatch</span>
            </div>

            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-[1.15]">
              Unified Crisis Triage &{' '}
              <span className="bg-gradient-to-r from-red-400 via-rose-300 to-amber-300 bg-clip-text text-transparent">
                Rapid Resource Grid
              </span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl mx-auto">
              ResQGrid empowers communities and crisis coordinators to report urgent incidents,
              prioritize requests through transparent rule-based triage scoring, manage volunteer fleets,
              and coordinate GIS dispatches from one command center.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveTab('report')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 font-bold text-sm text-white shadow-lg shadow-red-950/50 hover:shadow-red-900/50 transition-all flex items-center justify-center gap-2 group"
              >
                <span>Report an Incident</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>

              <button
                onClick={() => setActiveTab('dashboard')}
                className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 font-bold text-sm text-slate-200 hover:text-white border border-slate-700 shadow-md transition-all flex items-center justify-center gap-2"
              >
                <span>Explore Operations Hub</span>
              </button>
            </div>

            {/* Live Stats Bar */}
            <div className="pt-8 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-left">
              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Active Emergencies
                </span>
                <p className="font-mono text-2xl font-black text-red-400 mt-0.5">{openCount}</p>
                <span className="text-[10px] text-slate-400">Queue in progress</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Available Fleet
                </span>
                <p className="font-mono text-2xl font-black text-emerald-400 mt-0.5">
                  {availableResources}
                </p>
                <span className="text-[10px] text-slate-400">Units ready to roll</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Resolved Incidents
                </span>
                <p className="font-mono text-2xl font-black text-sky-400 mt-0.5">{resolvedCount}</p>
                <span className="text-[10px] text-slate-400">Successfully closed</span>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/50 border border-slate-800/60">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                  Prioritization
                </span>
                <p className="font-mono text-2xl font-black text-amber-400 mt-0.5">4-Factor</p>
                <span className="text-[10px] text-slate-400">Rule-based scoring</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Safety Notice Card */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-5 rounded-2xl bg-red-950/40 border border-red-500/30 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-sm text-red-300">
                Portfolio Engineering Demonstration Only
              </h3>
              <p className="text-xs text-red-200/90 leading-snug mt-0.5">
                ResQGrid is a simulated software platform and does not contact police, fire, or ambulance
                dispatchers. For life-threatening emergencies, call your local authorities immediately.
              </p>
            </div>
          </div>

          <a
            href="tel:911"
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 font-bold text-xs text-white flex items-center gap-2 shadow-lg shrink-0 transition-colors"
          >
            <PhoneCall className="w-3.5 h-3.5" />
            <span>Emergency: Dial 911 / 112</span>
          </a>
        </div>
      </section>

      {/* Feature Capabilities Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            Engineered for High-Pressure Coordination
          </h2>
          <p className="text-xs sm:text-sm text-slate-400">
            A production-ready stack designed around real crisis response workflows
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="p-3 rounded-xl bg-red-500/10 text-red-400 border border-red-500/20 w-fit">
              <Radio className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Smart Rule-Based Triage</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Transparent 4-factor scoring algorithm calculating urgency (0–100) from severity, affected count,
              waiting duration, and verification status with manual override auditing.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="p-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 w-fit">
              <MapPin className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Interactive GIS Incident Map</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Live OpenStreetMap integration via Leaflet with dynamic severity pins, pulsing danger circles,
              category filters, and interactive location pickers for report submissions.
            </p>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl space-y-3">
            <div className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 w-fit">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-white">Conflict-Safe Fleet Dispatch</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Volunteer and resource management preventing double-booking active response units, maintaining
              deployment history logs, and auto-releasing teams upon incident resolution.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works Workflow Illustration */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-red-400 bg-red-500/10 px-2 py-0.5 rounded border border-red-500/20">
            End-To-End Architecture
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
            How Incident Dispatching Operates
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-red-400">
              01
            </span>
            <h4 className="font-bold text-sm text-white">Citizen Report Ingestion</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Users submit incidents with photos, location picker map, affected people count, and category tags.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-amber-400">
              02
            </span>
            <h4 className="font-bold text-sm text-white">Rule-Based Prioritization</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Scoring engine normalizes severity, affected groups, and waiting minutes into an actionable P1–P4 queue.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-indigo-400">
              03
            </span>
            <h4 className="font-bold text-sm text-white">Verification & Dispatch</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Coordinators verify evidence and dispatch specialized units with conflict protection.
            </p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-3 relative">
            <span className="w-7 h-7 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center font-mono font-bold text-xs text-emerald-400">
              04
            </span>
            <h4 className="font-bold text-sm text-white">Telemetry & Resolution</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audit trail logs all actions, releases response units, and generates analytics with CSV export.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 border-t border-slate-800 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <p className="font-semibold text-slate-400">
            ResQGrid — Smart Emergency Coordination Platform
          </p>
          <p className="text-[11px] mt-0.5">
            Full-stack TypeScript portfolio demonstration with Supabase & Leaflet GIS.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab('auth')}
            className="hover:text-slate-300 transition-colors"
          >
            Role Simulation Guide
          </button>
          <button
            onClick={() => setActiveTab('dashboard')}
            className="hover:text-slate-300 transition-colors"
          >
            Operations Hub
          </button>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 hover:text-white transition-colors"
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>GitHub Repository</span>
          </a>
        </div>
      </footer>
    </div>
  );
};
