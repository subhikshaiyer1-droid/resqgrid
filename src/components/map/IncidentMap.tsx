import React, { useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import L from 'leaflet';
import { Incident } from '../../types/incident';
import { useApp } from '../../context/AppContext';
import { SeverityBadge, StatusBadge } from '../incident/StatusBadge';
import { PriorityScoreBadge } from '../incident/PriorityScoreBadge';
import { MapPin, Users, ExternalLink, Filter, Layers } from 'lucide-react';

const createCustomIcon = (severity: string, category: string) => {
  let bgColor = '#ef4444';
  let ringColor = 'rgba(239, 68, 68, 0.4)';

  if (severity === 'HIGH') {
    bgColor = '#f97316';
    ringColor = 'rgba(249, 115, 22, 0.4)';
  } else if (severity === 'MEDIUM') {
    bgColor = '#f59e0b';
    ringColor = 'rgba(245, 158, 11, 0.4)';
  } else if (severity === 'LOW') {
    bgColor = '#64748b';
    ringColor = 'rgba(100, 116, 139, 0.3)';
  }

  const html = `
    <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
      <div style="position: absolute; width: 100%; height: 100%; border-radius: 50%; background-color: ${ringColor}; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
      <div style="width: 26px; height: 26px; border-radius: 50%; background-color: ${bgColor}; border: 2.5px solid white; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.3); display: flex; align-items: center; justify-content: center; color: white; font-weight: bold; font-size: 11px;">
        !
      </div>
    </div>
  `;

  return L.divIcon({
    className: 'custom-emergency-pin',
    html,
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
  });
};

export const IncidentMap: React.FC<{
  incidentsList?: Incident[];
  className?: string;
  defaultCenter?: [number, number];
  defaultZoom?: number;
  highlightId?: string;
}> = ({
  incidentsList,
  className = 'h-[500px]',
  defaultCenter = [37.7749, -122.4194],
  defaultZoom = 13,
  highlightId,
}) => {
  const { incidents: allIncidents, setSelectedIncident } = useApp();
  const incidents = incidentsList || allIncidents;

  const [activeFilter, setActiveFilter] = useState<'ALL' | 'CRITICAL' | 'UNASSIGNED'>('ALL');

  const filtered = incidents.filter((inc) => {
    if (activeFilter === 'CRITICAL') return inc.severity === 'CRITICAL';
    if (activeFilter === 'UNASSIGNED') return !inc.assignedResourceId && inc.status !== 'RESOLVED';
    return true;
  });

  return (
    <div className={`relative rounded-2xl overflow-hidden border border-slate-800 shadow-xl bg-slate-950 ${className}`}>
      {/* Top Filter Overlay */}
      <div className="absolute top-3 right-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-1.5 flex items-center gap-1 shadow-lg text-xs">
        <Filter className="w-3.5 h-3.5 text-slate-400 ml-1.5" />
        <button
          onClick={() => setActiveFilter('ALL')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeFilter === 'ALL'
              ? 'bg-slate-700 text-white font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          All ({incidents.length})
        </button>
        <button
          onClick={() => setActiveFilter('CRITICAL')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeFilter === 'CRITICAL'
              ? 'bg-red-600 text-white font-bold'
              : 'text-slate-400 hover:text-red-400'
          }`}
        >
          Critical ({incidents.filter((i) => i.severity === 'CRITICAL').length})
        </button>
        <button
          onClick={() => setActiveFilter('UNASSIGNED')}
          className={`px-2.5 py-1 rounded-lg font-medium transition-colors ${
            activeFilter === 'UNASSIGNED'
              ? 'bg-amber-600 text-white font-bold'
              : 'text-slate-400 hover:text-amber-400'
          }`}
        >
          Pending Dispatch ({incidents.filter((i) => !i.assignedResourceId && i.status !== 'RESOLVED').length})
        </button>
      </div>

      {/* Map Legend */}
      <div className="absolute bottom-3 left-3 z-20 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-xl p-2.5 shadow-lg text-[11px] text-slate-300 hidden sm:block">
        <p className="font-bold text-slate-200 mb-1.5 flex items-center gap-1.5">
          <Layers className="w-3.5 h-3.5 text-slate-400" />
          <span>Incident Severity</span>
        </p>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-red-500" />
            <span>Critical Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-500" />
            <span>High Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Medium Severity</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span>Low Severity</span>
          </div>
        </div>
      </div>

      <MapContainer
        center={defaultCenter}
        zoom={defaultZoom}
        scrollWheelZoom={true}
        className="w-full h-full"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {filtered.map((inc) => {
          if (!inc.coordinates || isNaN(inc.coordinates.lat) || isNaN(inc.coordinates.lng)) {
            return null;
          }

          const isCritical = inc.severity === 'CRITICAL';

          return (
            <React.Fragment key={inc.id}>
              {isCritical && (
                <Circle
                  center={[inc.coordinates.lat, inc.coordinates.lng]}
                  radius={450}
                  pathOptions={{
                    color: '#ef4444',
                    fillColor: '#ef4444',
                    fillOpacity: 0.15,
                    weight: 1.5,
                  }}
                />
              )}
              <Marker
                position={[inc.coordinates.lat, inc.coordinates.lng]}
                icon={createCustomIcon(inc.severity, inc.category)}
              >
                <Popup className="resqgrid-popup">
                  <div className="p-1 max-w-xs text-slate-900">
                    <div className="flex items-center justify-between gap-2 mb-1.5">
                      <span className="font-mono text-[10px] font-bold text-slate-600">
                        {inc.id}
                      </span>
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700">
                        {inc.severity}
                      </span>
                    </div>

                    <h4 className="font-bold text-xs text-slate-900 leading-tight mb-1">
                      {inc.title}
                    </h4>

                    <p className="text-[11px] text-slate-600 line-clamp-2 mb-2">
                      {inc.description}
                    </p>

                    <div className="flex items-center gap-3 text-[11px] text-slate-600 mb-2.5">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{inc.locationName}</span>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        <Users className="w-3 h-3 text-slate-400" />
                        <span>{inc.affectedCount} impacted</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setSelectedIncident(inc)}
                      className="w-full py-1.5 px-3 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span>Open Incident Drawer</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>
                </Popup>
              </Marker>
            </React.Fragment>
          );
        })}
      </MapContainer>
    </div>
  );
};
