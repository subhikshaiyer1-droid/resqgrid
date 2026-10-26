import React from 'react';
import { useApp } from '../context/AppContext';
import { IncidentTable } from '../components/incident/IncidentTable';
import { exportIncidentsToCSV } from '../utils/exportCsv';
import { ClipboardList, PlusCircle, Download, FileSpreadsheet } from 'lucide-react';

export const IncidentsPage: React.FC = () => {
  const { incidents, setSelectedIncident, setActiveTab } = useApp();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-red-500/10 text-red-400 border border-red-500/20">
              <ClipboardList className="w-4 h-4" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Incident Management & Triage
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search, verify, prioritize, and assign emergency responses across all community reports
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => exportIncidentsToCSV(incidents)}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
            title="Download CSV export of incidents"
          >
            <Download className="w-3.5 h-3.5 text-slate-400" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Report Incident</span>
          </button>
        </div>
      </div>

      {/* Incident Table */}
      <IncidentTable
        incidents={incidents}
        onSelectIncident={(inc) => setSelectedIncident(inc)}
      />
    </div>
  );
};
