import React from 'react';
import { Incident } from '../../types/incident';
import { useApp } from '../../context/AppContext';
import { formatTimeAgo } from '../../utils/formatters';
import { Activity, Radio, Shield, Truck, CheckCircle2, AlertTriangle } from 'lucide-react';

export const ActivityFeed: React.FC<{ incidents: Incident[]; limit?: number }> = ({
  incidents,
  limit = 6,
}) => {
  const { setSelectedIncident } = useApp();

  // Flatten timeline events from all incidents and sort descending by timestamp
  const allEvents = incidents
    .flatMap((inc) =>
      inc.timeline.map((ev) => ({
        ...ev,
        incidentId: inc.id,
        incidentTitle: inc.title,
        incidentSeverity: inc.severity,
      }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, limit);

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'CREATED':
        return <Radio className="w-3.5 h-3.5 text-blue-400" />;
      case 'ASSIGNMENT':
        return <Truck className="w-3.5 h-3.5 text-indigo-400" />;
      case 'VERIFIED':
        return <Shield className="w-3.5 h-3.5 text-purple-400" />;
      case 'RESOLVED':
        return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Activity className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  return (
    <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-sm text-white">Live Audit Activity Feed</h3>
            <p className="text-[11px] text-slate-400">Chronological telemetry across all active channels</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-slate-800/60">
        {allEvents.map((ev) => (
          <div
            key={ev.id}
            onClick={() => {
              const target = incidents.find((i) => i.id === ev.incidentId);
              if (target) setSelectedIncident(target);
            }}
            className="py-3 first:pt-1 last:pb-1 flex items-start gap-3 hover:bg-slate-800/40 p-2 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="p-2 rounded-lg bg-slate-950 border border-slate-800 shrink-0 mt-0.5">
              {getEventIcon(ev.type)}
            </div>

            <div className="flex-1 min-w-0 space-y-0.5">
              <div className="flex items-center justify-between gap-2">
                <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-1 rounded border border-slate-800">
                  {ev.incidentId}
                </span>
                <span className="text-[10px] font-mono text-slate-500">
                  {formatTimeAgo(ev.timestamp)}
                </span>
              </div>

              <p className="text-xs text-slate-300 font-medium group-hover:text-white transition-colors leading-snug">
                {ev.description}
              </p>

              <div className="flex items-center gap-2 text-[10px] text-slate-400">
                <span className="font-semibold text-slate-300">{ev.actorName}</span>
                <span>•</span>
                <span className="uppercase tracking-wider">{ev.actorRole}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
