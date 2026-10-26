import React from 'react';
import { Incident } from '../../types/incident';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, StatusBadge, CategoryBadge } from '../incident/StatusBadge';
import { PriorityScoreBadge } from '../incident/PriorityScoreBadge';
import { formatTimeAgo } from '../../utils/formatters';
import { AlertCircle, Clock, MapPin, Users, ArrowRight, ShieldAlert } from 'lucide-react';

export const PriorityQueue: React.FC<{ incidents: Incident[]; limit?: number }> = ({
  incidents,
  limit = 5,
}) => {
  const { setSelectedIncident, setActiveTab } = useApp();

  // Filter only active, unresolved incidents, sorted by highest priority score
  const activeQueue = incidents
    .filter((i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED' && i.status !== 'DUPLICATE')
    .sort((a, b) => b.priority.totalScore - a.priority.totalScore)
    .slice(0, limit);

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
            <ShieldAlert className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Smart Triage Priority Queue</h3>
            <p className="text-[11px] text-slate-400">
              Ranked dynamically by severity, impacted persons, queue wait, and verification
            </p>
          </div>
        </div>
        <button
          onClick={() => setActiveTab('incidents')}
          className="text-xs font-semibold text-red-400 hover:text-red-300 flex items-center gap-1 transition-colors"
        >
          <span>View All ({incidents.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {activeQueue.length === 0 ? (
        <div className="text-center py-8 text-slate-500 text-xs">
          No active emergency incidents in priority queue.
        </div>
      ) : (
        <div className="divide-y divide-slate-800/80">
          {activeQueue.map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="py-3.5 first:pt-1 last:pb-1 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-800/40 p-2 rounded-xl transition-colors cursor-pointer group"
            >
              <div className="space-y-1.5 min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    {inc.id}
                  </span>
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge status={inc.status} />
                  <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-slate-400" />
                    {formatTimeAgo(inc.createdAt)}
                  </span>
                </div>

                <h4 className="font-bold text-xs sm:text-sm text-slate-200 group-hover:text-white transition-colors truncate">
                  {inc.title}
                </h4>

                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <span className="flex items-center gap-1 truncate max-w-[200px]">
                    <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                    <span className="truncate">{inc.locationName}</span>
                  </span>
                  <span className="flex items-center gap-1 shrink-0">
                    <Users className="w-3 h-3 text-slate-400" />
                    <span>{inc.affectedCount} impacted</span>
                  </span>
                  {inc.assignedResourceName ? (
                    <span className="text-indigo-400 text-[11px] font-medium truncate">
                      Unit: {inc.assignedResourceName}
                    </span>
                  ) : (
                    <span className="text-amber-400 text-[11px] font-bold bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                      Unassigned
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0 self-end sm:self-center">
                <PriorityScoreBadge priority={inc.priority} />
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedIncident(inc);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 group-hover:bg-red-600 text-slate-200 group-hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                >
                  <span>Dispatch</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
