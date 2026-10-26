import React, { useState } from 'react';
import { AlertTriangle, X, ShieldAlert, PhoneCall } from 'lucide-react';

export const SafetyBanner: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed top-2 right-4 z-50 text-[11px] font-semibold bg-red-600/90 hover:bg-red-500 text-white px-2.5 py-1 rounded-full shadow-lg border border-red-400/40 flex items-center gap-1.5 backdrop-blur-sm transition-all"
        title="View Emergency Safety Notice"
      >
        <AlertTriangle className="w-3 h-3" />
        <span>Portfolio Demo Notice</span>
      </button>
    );
  }

  return (
    <aside
      aria-label="Emergency Services Disclaimer"
      className="bg-gradient-to-r from-red-950/90 via-slate-900/95 to-red-950/90 border-b border-red-500/30 text-slate-200 px-4 py-2 text-xs relative z-40 backdrop-blur-md"
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2.5 text-center sm:text-left">
          <span className="p-1 rounded-md bg-red-500/20 text-red-400 border border-red-500/30 shrink-0">
            <ShieldAlert className="w-4 h-4" />
          </span>
          <p className="leading-snug">
            <strong className="text-red-400 font-bold uppercase tracking-wider mr-1.5 text-[11px] bg-red-500/10 px-1.5 py-0.5 rounded border border-red-500/20">
              Demo Simulation Notice
            </strong>
            This is a portfolio project demonstration.
            <span className="text-red-200 font-medium"> Reports do NOT dispatch real-world emergency services.</span>
            {' '}If you or someone else is in immediate danger, dial your local emergency services directly.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <a
            href="tel:911"
            className="flex items-center gap-1 text-[11px] font-bold text-red-300 hover:text-white bg-red-500/20 hover:bg-red-500/40 px-2 py-0.5 rounded border border-red-500/30 transition-colors"
          >
            <PhoneCall className="w-3 h-3 text-red-400" />
            <span>Dial 911 / 112</span>
          </a>
          <button
            onClick={() => setIsVisible(false)}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded transition-colors"
            aria-label="Dismiss disclaimer banner"
            title="Minimize disclaimer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
