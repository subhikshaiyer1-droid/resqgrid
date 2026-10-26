import React from 'react';
import { Resource } from '../../types/resource';
import { useApp } from '../../context/AppContext';
import { getResourceTypeLabel, maskContactInfo } from '../../utils/formatters';
import {
  Users,
  MapPin,
  Phone,
  Shield,
  Activity,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export const ResourceCard: React.FC<{ resource: Resource }> = ({ resource }) => {
  const { toggleResourceStatus, currentUser, incidents, setSelectedIncident } = useApp();

  const isAuthorized = currentUser.role === 'COORDINATOR' || currentUser.role === 'ADMINISTRATOR';

  let statusBadge = 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30';
  if (resource.status === 'DISPATCHED') statusBadge = 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30';
  if (resource.status === 'OFF_DUTY') statusBadge = 'bg-slate-500/10 text-slate-400 border-slate-500/30';
  if (resource.status === 'MAINTENANCE') statusBadge = 'bg-amber-500/10 text-amber-300 border-amber-500/30';

  const assignedIncident = resource.currentIncidentId
    ? incidents.find((i) => i.id === resource.currentIncidentId)
    : null;

  return (
    <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between hover:border-slate-700 transition-all">
      <div className="space-y-3">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
              {resource.id}
            </span>
            <h4 className="font-bold text-base text-white mt-1 leading-snug">
              {resource.name}
            </h4>
            <p className="text-xs text-indigo-400 font-medium">
              {getResourceTypeLabel(resource.type)}
            </p>
          </div>

          <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${statusBadge}`}>
            {resource.status}
          </span>
        </div>

        {/* Details list */}
        <div className="space-y-1.5 text-xs text-slate-300 pt-1">
          <div className="flex items-center gap-2">
            <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="truncate">{resource.serviceArea}</span>
          </div>

          <div className="flex items-center gap-2">
            <Users className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>Crew Capacity: <strong className="text-white">{resource.capacity} specialists</strong></span>
          </div>

          <div className="flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span className="font-mono truncate">
              {maskContactInfo(resource.contactPhone, currentUser.role)} ({resource.contactPerson})
            </span>
          </div>
        </div>

        {/* Skills Tags */}
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
            Operational Capabilities
          </span>
          <div className="flex flex-wrap gap-1.5">
            {resource.skills.map((skill, i) => (
              <span
                key={i}
                className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* Current Active Mission Banner */}
        {resource.status === 'DISPATCHED' && assignedIncident && (
          <div
            onClick={() => setSelectedIncident(assignedIncident)}
            className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs cursor-pointer hover:bg-indigo-950/60 transition-colors group"
          >
            <div className="flex items-center justify-between text-indigo-300 font-bold mb-0.5">
              <span>Active Deployment:</span>
              <ExternalLink className="w-3 h-3 group-hover:translate-x-0.5 transition-transform" />
            </div>
            <p className="font-bold text-white text-xs truncate">
              {assignedIncident.title}
            </p>
            <span className="text-[10px] text-slate-400 font-mono">
              Incident ID: {assignedIncident.id}
            </span>
          </div>
        )}
      </div>

      {/* Footer Quick Controls for Authorized Dispatchers */}
      {isAuthorized && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-400">Duty Status:</span>
          <select
            value={resource.status}
            onChange={(e) => toggleResourceStatus(resource.id, e.target.value as any)}
            className="bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1 text-xs text-white"
          >
            <option value="AVAILABLE">Available</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>
        </div>
      )}
    </div>
  );
};
