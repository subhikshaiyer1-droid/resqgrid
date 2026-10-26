import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { ResourceCard } from '../components/resource/ResourceCard';
import { AddResourceModal } from '../components/resource/AddResourceModal';
import { exportResourcesToCSV } from '../utils/exportCsv';
import { Users2, Plus, Download, Filter, ShieldCheck } from 'lucide-react';

export const ResourcesPage: React.FC = () => {
  const { resources, currentUser } = useApp();
  const [showAddModal, setShowAddModal] = useState(false);
  const [typeFilter, setTypeFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isAuthorized = currentUser.role === 'COORDINATOR' || currentUser.role === 'ADMINISTRATOR';

  const availableCount = resources.filter((r) => r.status === 'AVAILABLE').length;
  const dispatchedCount = resources.filter((r) => r.status === 'DISPATCHED').length;
  const offDutyCount = resources.filter((r) => r.status === 'OFF_DUTY').length;

  const filtered = resources.filter((r) => {
    if (typeFilter !== 'ALL' && r.type !== typeFilter) return false;
    if (statusFilter !== 'ALL' && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Users2 className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Volunteers & Response Fleet
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Maintain deployment readiness, manage capabilities, and track active unit assignments
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportResourcesToCSV(resources)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Download CSV list of resources"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export Fleet CSV</span>
          </button>

          {isAuthorized && (
            <button
              onClick={() => setShowAddModal(true)}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white shadow-lg shadow-indigo-950/40 transition-colors flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Enroll Resource</span>
            </button>
          )}
        </div>
      </div>

      {/* Capacity Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-emerald-400 uppercase tracking-wider">
              Available Units
            </span>
            <p className="text-2xl font-mono font-bold text-white mt-0.5">{availableCount}</p>
          </div>
          <span className="text-xs text-emerald-400 font-mono">Immediate Staging</span>
        </div>

        <div className="p-4 rounded-xl bg-indigo-950/30 border border-indigo-500/20 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
              Actively Dispatched
            </span>
            <p className="text-2xl font-mono font-bold text-white mt-0.5">{dispatchedCount}</p>
          </div>
          <span className="text-xs text-indigo-400 font-mono">On-Scene Operations</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Off Duty / Standby
            </span>
            <p className="text-2xl font-mono font-bold text-slate-300 mt-0.5">{offDutyCount}</p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Reserve Capacity</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2">
          <Filter className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
          >
            <option value="ALL">All Resource Types</option>
            <option value="MEDICAL_SUPPORT_TEAM">Paramedic / Medical Team</option>
            <option value="FIRE_HAZMAT">Hazmat & Extrication Brigade</option>
            <option value="RESCUE_TEAM">Search & Rescue Taskforce</option>
            <option value="FIRST_AID_VOLUNTEER">First-Aid Volunteer Squad</option>
            <option value="TRANSPORT_UNIT">Municipal Heavy Fleet</option>
            <option value="SUPPLY_DISTRIBUTION">Supply & Water Distribution</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-1.5 text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="AVAILABLE">Available</option>
            <option value="DISPATCHED">Dispatched</option>
            <option value="OFF_DUTY">Off Duty</option>
            <option value="MAINTENANCE">Maintenance</option>
          </select>

          {(typeFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setTypeFilter('ALL');
                setStatusFilter('ALL');
              }}
              className="text-red-400 hover:text-red-300 font-semibold underline"
            >
              Reset
            </button>
          )}
        </div>

        <span className="text-slate-400 font-mono">
          Showing {filtered.length} of {resources.length} registered teams
        </span>
      </div>

      {/* Resource Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((res) => (
          <ResourceCard key={res.id} resource={res} />
        ))}
      </div>

      {/* Add Resource Modal */}
      <AddResourceModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} />
    </div>
  );
};
