import React, { useState } from 'react';
import { Incident } from '../../types/incident';
import { useApp } from '../../context/AppContext';
import { CategoryBadge, SeverityBadge, StatusBadge } from './StatusBadge';
import { PriorityScoreBadge } from './PriorityScoreBadge';
import { formatTimeAgo, formatDate } from '../../utils/formatters';
import {
  Search,
  Filter,
  Eye,
  CheckCircle,
  Truck,
  ChevronLeft,
  ChevronRight,
  ShieldAlert,
} from 'lucide-react';

export const IncidentTable: React.FC<{
  incidents: Incident[];
  onSelectIncident: (inc: Incident) => void;
}> = ({ incidents, onSelectIncident }) => {
  const {
    searchQuery,
    setSearchQuery,
    categoryFilter,
    setCategoryFilter,
    severityFilter,
    setSeverityFilter,
    statusFilter,
    setStatusFilter,
    updateIncidentStatus,
    currentUser,
  } = useApp();

  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const isCoordinator = currentUser.role === 'COORDINATOR' || currentUser.role === 'ADMINISTRATOR';

  // Apply filters
  const filtered = incidents.filter((inc) => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matches =
        inc.id.toLowerCase().includes(q) ||
        inc.title.toLowerCase().includes(q) ||
        inc.locationName.toLowerCase().includes(q) ||
        (inc.assignedResourceName && inc.assignedResourceName.toLowerCase().includes(q));
      if (!matches) return false;
    }

    // Category filter
    if (categoryFilter !== 'ALL' && inc.category !== categoryFilter) {
      return false;
    }

    // Severity filter
    if (severityFilter !== 'ALL' && inc.severity !== severityFilter) {
      return false;
    }

    // Status filter
    if (statusFilter !== 'ALL' && inc.status !== statusFilter) {
      return false;
    }

    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const paginated = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  return (
    <div className="space-y-4">
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 shadow-lg flex flex-col md:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            placeholder="Search by ID, keyword, street, landmark, assigned unit..."
            className="w-full bg-slate-950 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder:text-slate-500 focus:outline-none focus:border-red-500/50"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Categories</option>
            <option value="ROAD_ACCIDENT">Road Accident</option>
            <option value="MEDICAL_EMERGENCY">Medical Emergency</option>
            <option value="FIRE_OUTBREAK">Fire Outbreak</option>
            <option value="FLOODING">Flooding</option>
            <option value="BLOCKED_ROAD">Blocked Road</option>
            <option value="MISSING_PERSON">Missing Person</option>
            <option value="PUBLIC_SAFETY">Public Safety</option>
          </select>

          {/* Severity Filter */}
          <select
            value={severityFilter}
            onChange={(e) => {
              setSeverityFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="REPORTED">Reported</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="VERIFIED">Verified</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
          </select>

          {(searchQuery || categoryFilter !== 'ALL' || severityFilter !== 'ALL' || statusFilter !== 'ALL') && (
            <button
              onClick={() => {
                setSearchQuery('');
                setCategoryFilter('ALL');
                setSeverityFilter('ALL');
                setStatusFilter('ALL');
                setCurrentPage(1);
              }}
              className="px-2.5 py-2 text-xs text-red-400 hover:text-red-300 font-semibold underline"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Table Container */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
              <tr>
                <th className="py-3.5 px-4">Incident & ID</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Severity</th>
                <th className="py-3.5 px-4">Priority Score</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Location</th>
                <th className="py-3.5 px-4">Assigned Unit</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-slate-400">
                    No incidents match your active filters or search query.
                  </td>
                </tr>
              ) : (
                paginated.map((inc) => (
                  <tr
                    key={inc.id}
                    onClick={() => onSelectIncident(inc)}
                    className="hover:bg-slate-800/40 transition-colors cursor-pointer group"
                  >
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono text-[10px] font-bold text-slate-400 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                          {inc.id}
                        </span>
                        <p className="font-bold text-xs text-slate-200 group-hover:text-white transition-colors max-w-xs truncate">
                          {inc.title}
                        </p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <CategoryBadge category={inc.category} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <SeverityBadge severity={inc.severity} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <PriorityScoreBadge priority={inc.priority} />
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      <StatusBadge status={inc.status} />
                    </td>

                    <td className="py-3.5 px-4">
                      <span className="text-slate-300 max-w-[150px] truncate block" title={inc.locationName}>
                        {inc.locationName}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap">
                      {inc.assignedResourceName ? (
                        <span className="text-indigo-400 font-medium">
                          {inc.assignedResourceName}
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">None</span>
                      )}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-slate-400 font-mono text-[11px]">
                      {formatTimeAgo(inc.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 whitespace-nowrap text-right">
                      <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                        {isCoordinator && inc.status === 'REPORTED' && (
                          <button
                            onClick={() => updateIncidentStatus(inc.id, 'VERIFIED')}
                            className="p-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 transition-colors"
                            title="Quick Verify Incident"
                          >
                            <CheckCircle className="w-3.5 h-3.5" />
                          </button>
                        )}

                        <button
                          onClick={() => onSelectIncident(inc)}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-800 hover:bg-red-600 text-slate-200 hover:text-white font-semibold text-xs transition-colors flex items-center gap-1"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>Details</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span>
            Showing <strong className="text-white">{filtered.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</strong> to{' '}
            <strong className="text-white">
              {Math.min(currentPage * pageSize, filtered.length)}
            </strong>{' '}
            of <strong className="text-white">{filtered.length}</strong> incidents
          </span>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
              aria-label="Previous page"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-slate-300">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-white transition-colors"
              aria-label="Next page"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
