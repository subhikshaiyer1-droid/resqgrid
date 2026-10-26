import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { Incident } from '../../types/incident';
import { getCategoryMeta } from '../../utils/formatters';

interface ChartsProps {
  incidents: Incident[];
}

export const DashboardCharts: React.FC<ChartsProps> = ({ incidents }) => {
  // 1. Group incidents by day/date for trend chart
  const dateMap: Record<string, { date: string; total: number; resolved: number }> = {};

  // Sort chronological
  const sorted = [...incidents].sort(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  sorted.forEach((inc) => {
    const day = new Date(inc.createdAt).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
    });
    if (!dateMap[day]) {
      dateMap[day] = { date: day, total: 0, resolved: 0 };
    }
    dateMap[day].total += 1;
    if (inc.status === 'RESOLVED') {
      dateMap[day].resolved += 1;
    }
  });

  const trendData = Object.values(dateMap);

  // 2. Category Breakdown
  const categoryCounts: Record<string, number> = {};
  incidents.forEach((inc) => {
    categoryCounts[inc.category] = (categoryCounts[inc.category] || 0) + 1;
  });

  const categoryData = Object.entries(categoryCounts).map(([cat, count]) => {
    const meta = getCategoryMeta(cat as any);
    return {
      name: meta.label,
      value: count,
      color: meta.color,
    };
  });

  // 3. Severity Distribution
  const severityMap = {
    CRITICAL: 0,
    HIGH: 0,
    MEDIUM: 0,
    LOW: 0,
  };

  incidents.forEach((inc) => {
    if (severityMap[inc.severity] !== undefined) {
      severityMap[inc.severity] += 1;
    }
  });

  const severityData = [
    { name: 'Critical', count: severityMap.CRITICAL, fill: '#ef4444' },
    { name: 'High', count: severityMap.HIGH, fill: '#f97316' },
    { name: 'Medium', count: severityMap.MEDIUM, fill: '#f59e0b' },
    { name: 'Low', count: severityMap.LOW, fill: '#64748b' },
  ];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Trend Area Chart (2 Cols on lg) */}
      <div className="lg:col-span-2 rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4">
        <div>
          <h3 className="font-bold text-sm text-white">Incident Influx & Resolution Timeline</h3>
          <p className="text-[11px] text-slate-400">
            Real-time trend analysis computed from stored incident logs
          </p>
        </div>

        <div className="h-64 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="totalIncidentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="resolvedIncidentsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                </linearGradient>
              </defs>
              <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} allowDecimals={false} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="total"
                name="Reported Incidents"
                stroke="#ef4444"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#totalIncidentsGrad)"
              />
              <Area
                type="monotone"
                dataKey="resolved"
                name="Resolved Cases"
                stroke="#10b981"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#resolvedIncidentsGrad)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Category Donut Chart (1 Col) */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-xl space-y-4 flex flex-col justify-between">
        <div>
          <h3 className="font-bold text-sm text-white">Incident Types Distribution</h3>
          <p className="text-[11px] text-slate-400">Proportional division across incident categories</p>
        </div>

        <div className="h-48 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={categoryData}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={4}
                dataKey="value"
              >
                {categoryData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '12px',
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Legend List */}
        <div className="grid grid-cols-2 gap-1.5 pt-2 border-t border-slate-800 text-[11px]">
          {categoryData.slice(0, 6).map((c, i) => (
            <div key={i} className="flex items-center gap-1.5 truncate">
              <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
              <span className="truncate text-slate-300">{c.name}</span>
              <span className="font-mono font-bold text-slate-400 ml-auto">({c.value})</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
