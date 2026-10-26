import React, { useState } from 'react';
import { PriorityBreakdown } from '../../types/incident';
import { Shield, Info, ArrowUpRight, CheckCircle2 } from 'lucide-react';

export const PriorityScoreBadge: React.FC<{
  priority: PriorityBreakdown;
  showBreakdown?: boolean;
  className?: string;
}> = ({ priority, showBreakdown = true, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  let tierColor = 'text-slate-400 bg-slate-800/80 border-slate-700';
  let barColor = 'bg-slate-500';

  if (priority.tier === 'P1') {
    tierColor = 'text-red-400 bg-red-950/60 border-red-500/40 shadow-sm shadow-red-900/20';
    barColor = 'bg-red-500';
  } else if (priority.tier === 'P2') {
    tierColor = 'text-amber-400 bg-amber-950/60 border-amber-500/40';
    barColor = 'bg-amber-500';
  } else if (priority.tier === 'P3') {
    tierColor = 'text-sky-400 bg-sky-950/60 border-sky-500/40';
    barColor = 'bg-sky-500';
  }

  return (
    <div className={`relative inline-block ${className}`}>
      <button
        type="button"
        onClick={() => showBreakdown && setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-2.5 py-1 rounded-lg border text-xs font-semibold transition-all hover:brightness-110 ${tierColor}`}
        title="Click to view rule-based scoring calculation"
      >
        <span className="flex items-center gap-1 font-mono font-bold tracking-tight">
          <Shield className="w-3.5 h-3.5" />
          {priority.tier}
        </span>
        <span className="text-slate-400">|</span>
        <span className="font-mono">{priority.totalScore}</span>
        {priority.isOverridden && (
          <span className="text-[10px] uppercase font-bold text-amber-300 bg-amber-500/20 px-1 rounded">
            Override
          </span>
        )}
        {showBreakdown && <Info className="w-3 h-3 opacity-60 ml-0.5" />}
      </button>

      {/* Breakdown Popover */}
      {showBreakdown && isOpen && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          <div className="absolute right-0 top-full mt-2 w-80 p-4 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-slate-100 text-xs backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div>
                <span className="font-mono text-xs font-bold text-red-400">
                  {priority.tierLabel}
                </span>
                <p className="text-[11px] text-slate-400 mt-0.5">Rule-Based Priority Engine</p>
              </div>
              <div className="text-right">
                <span className="text-xl font-mono font-bold">{priority.totalScore}</span>
                <span className="text-slate-500 text-[10px]">/100</span>
              </div>
            </div>

            {/* Score Bar */}
            <div className="w-full bg-slate-800 rounded-full h-1.5 mb-4 overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${barColor}`}
                style={{ width: `${priority.totalScore}%` }}
              />
            </div>

            {/* Contributing Factors */}
            <div className="space-y-2 mb-3">
              <p className="font-semibold text-slate-300 text-[11px] uppercase tracking-wider">
                Contributing Factor Weights
              </p>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Reported Severity (45%)</span>
                <span className="font-mono font-medium text-slate-200">
                  {priority.severityScore}/100 <span className="text-slate-500 text-[10px]">({(priority.severityScore * 0.45).toFixed(1)} pts)</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">People Affected (25%)</span>
                <span className="font-mono font-medium text-slate-200">
                  {priority.affectedScore}/100 <span className="text-slate-500 text-[10px]">({(priority.affectedScore * 0.25).toFixed(1)} pts)</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1 border-b border-slate-800/60">
                <span className="text-slate-400">Queue Waiting Time (20%)</span>
                <span className="font-mono font-medium text-slate-200">
                  {priority.waitingScore}/100 <span className="text-slate-500 text-[10px]">({(priority.waitingScore * 0.20).toFixed(1)} pts)</span>
                </span>
              </div>

              <div className="flex items-center justify-between py-1">
                <span className="text-slate-400">Verification Status (10%)</span>
                <span className="font-mono font-medium text-slate-200">
                  {priority.verificationScore}/100 <span className="text-slate-500 text-[10px]">({(priority.verificationScore * 0.10).toFixed(1)} pts)</span>
                </span>
              </div>
            </div>

            {/* Rationale explanation */}
            {priority.rationale && priority.rationale.length > 0 && (
              <div className="pt-2 border-t border-slate-800">
                <p className="font-semibold text-slate-400 text-[10px] uppercase mb-1.5">
                  Calculation Rationale
                </p>
                <ul className="space-y-1 text-slate-300 text-[11px]">
                  {priority.rationale.map((r, i) => (
                    <li key={i} className="flex items-start gap-1.5 leading-snug">
                      <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{r}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {priority.isOverridden && (
              <div className="mt-2.5 p-2 rounded bg-amber-500/10 border border-amber-500/30 text-[11px] text-amber-200">
                <p className="font-bold">Manual Coordinator Override</p>
                <p className="opacity-90 mt-0.5">{priority.overrideReason || 'Rationale logged.'}</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
};
