import React from 'react';
import { useApp } from '../context/AppContext';
import { StatCard } from '../components/dashboard/StatCard';
import { PriorityQueue } from '../components/dashboard/PriorityQueue';
import { ActivityFeed } from '../components/dashboard/ActivityFeed';
import { DashboardCharts } from '../components/dashboard/DashboardCharts';
import {
  AlertCircle,
  Clock,
  ShieldCheck,
  CheckCircle2,
  Truck,
  Flame,
  Radio,
  MapPin,
  PlusCircle,
  FileSpreadsheet,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { incidents, resources, setActiveTab, setSelectedIncident } = useApp();

  const totalCount = incidents.length;
  const openCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED' && i.status !== 'DUPLICATE'
  ).length;

  const criticalCount = incidents.filter(
    (i) => (i.severity === 'CRITICAL' || i.priority.tier === 'P1') && i.status !== 'RESOLVED'
  ).length;

  const unverifiedCount = incidents.filter((i) => i.status === 'REPORTED').length;
  const availableResources = resources.filter((r) => r.status === 'AVAILABLE').length;
  const resolvedCount = incidents.filter((i) => i.status === 'RESOLVED').length;

  // Calculate actual average response time from stored records
  // Time from createdAt to assignedAt (in minutes)
  const assignedRecords = incidents.filter((i) => i.assignedAt && i.createdAt);
  let avgResponseMinutes = 18; // default benchmark if no records
  if (assignedRecords.length > 0) {
    const totalMinutes = assignedRecords.reduce((sum, inc) => {
      const created = new Date(inc.createdAt).getTime();
      const assigned = new Date(inc.assignedAt!).getTime();
      return sum + Math.max(1, (assigned - created) / (1000 * 60));
    }, 0);
    avgResponseMinutes = Math.round(totalMinutes / assignedRecords.length);
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Emergency Operations Command Hub
            </h1>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time incident dispatching, GIS map coordination, and fleet triage
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => setActiveTab('map')}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors flex items-center gap-1.5"
          >
            <MapPin className="w-3.5 h-3.5 text-red-400" />
            <span>GIS Emergency Map</span>
          </button>

          <button
            onClick={() => setActiveTab('report')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-bold text-white shadow-lg shadow-red-950/40 transition-colors flex items-center gap-1.5"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Log New Emergency</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Open Incidents"
          value={openCount}
          subtext="Active emergency queue"
          icon={<Radio className="w-5 h-5 text-red-400" />}
          trend={`${openCount} Active`}
          trendType="urgent"
          colorClass="from-red-950/30 to-slate-900 border-red-500/20"
          onClick={() => setActiveTab('incidents')}
        />

        <StatCard
          title="Critical / P1 Triage"
          value={criticalCount}
          subtext="Immediate action required"
          icon={<Flame className="w-5 h-5 text-orange-400" />}
          trend={criticalCount > 0 ? 'Urgent Attention' : 'Cleared'}
          trendType={criticalCount > 0 ? 'urgent' : 'positive'}
          colorClass="from-amber-950/30 to-slate-900 border-amber-500/20"
          onClick={() => setActiveTab('incidents')}
        />

        <StatCard
          title="Available Fleet"
          value={`${availableResources} / ${resources.length}`}
          subtext="Units ready for dispatch"
          icon={<Truck className="w-5 h-5 text-emerald-400" />}
          trend="Deployable"
          trendType="positive"
          colorClass="from-emerald-950/30 to-slate-900 border-emerald-500/20"
          onClick={() => setActiveTab('resources')}
        />

        <StatCard
          title="Avg Dispatch Latency"
          value={`${avgResponseMinutes}m`}
          subtext="Calculated from demo records"
          icon={<Clock className="w-5 h-5 text-sky-400" />}
          trend="Target: <20m"
          trendType={avgResponseMinutes <= 20 ? 'positive' : 'negative'}
          colorClass="from-slate-900 to-slate-900/90 border-slate-800"
          onClick={() => setActiveTab('analytics')}
        />
      </div>

      {/* Secondary Metrics Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Awaiting Verification
            </span>
            <p className="text-xl font-mono font-bold text-amber-400 mt-0.5">
              {unverifiedCount} Reports
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Requires Dispatcher Review</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Total Logged Incidents
            </span>
            <p className="text-xl font-mono font-bold text-white mt-0.5">
              {totalCount} Total
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">Telemetry database</span>
        </div>

        <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
              Successfully Resolved
            </span>
            <p className="text-xl font-mono font-bold text-emerald-400 mt-0.5">
              {resolvedCount} Resolved
            </p>
          </div>
          <span className="text-xs text-slate-500 font-mono">100% Audit Tracked</span>
        </div>
      </div>

      {/* Visual Analytics Charts */}
      <DashboardCharts incidents={incidents} />

      {/* Priority Action Queue & Activity Feed Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <PriorityQueue incidents={incidents} limit={5} />
        <ActivityFeed incidents={incidents} limit={5} />
      </div>
    </div>
  );
};
