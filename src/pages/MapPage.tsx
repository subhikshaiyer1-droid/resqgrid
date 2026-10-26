import React from 'react';
import { useApp } from '../context/AppContext';
import { IncidentMap } from '../components/map/IncidentMap';
import { SeverityBadge, StatusBadge } from '../components/incident/StatusBadge';
import { PriorityScoreBadge } from '../components/incident/PriorityScoreBadge';
import { formatTimeAgo } from '../utils/formatters';
import { MapPin, Navigation, Eye, PlusCircle } from 'lucide-react';

export const MapPage: React.FC = () => {
  const { incidents, setSelectedIncident, setActiveTab } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <MapPin className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Live GIS Emergency Coordination Map
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Geospatial overview of active incident locations, severity perimeters, and field units
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Pin New Report</span>
          </button>
        </div>
      </div>

      {/* Main Map Component */}
      <IncidentMap className="h-[620px] w-full" />

      {/* Quick Incident Reel Below Map */}
      <div className="space-y-2">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400">
          Geolocated Incidents on Display ({incidents.length})
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {incidents.slice(0, 6).map((inc) => (
            <div
              key={inc.id}
              onClick={() => setSelectedIncident(inc)}
              className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all cursor-pointer flex items-start justify-between gap-3 group"
            >
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] font-bold text-slate-400">
                    {inc.id}
                  </span>
                  <SeverityBadge severity={inc.severity} />
                  <StatusBadge status={inc.status} />
                </div>
                <h4 className="font-bold text-xs text-slate-200 group-hover:text-white transition-colors truncate">
                  {inc.title}
                </h4>
                <p className="text-[11px] text-slate-400 truncate flex items-center gap-1">
                  <MapPin className="w-3 h-3 text-red-400 shrink-0" />
                  <span>{inc.locationName}</span>
                </p>
              </div>

              <PriorityScoreBadge priority={inc.priority} showBreakdown={false} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
