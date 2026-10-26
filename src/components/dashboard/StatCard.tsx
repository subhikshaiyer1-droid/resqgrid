import React from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtext: string;
  icon: React.ReactNode;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral' | 'urgent';
  colorClass?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtext,
  icon,
  trend,
  trendType = 'neutral',
  colorClass = 'from-slate-800 to-slate-900 border-slate-700/80',
  onClick,
}) => {
  let badgeColor = 'text-slate-400 bg-slate-800';
  if (trendType === 'urgent') badgeColor = 'text-red-400 bg-red-500/10 border border-red-500/20';
  if (trendType === 'positive') badgeColor = 'text-emerald-400 bg-emerald-500/10 border border-emerald-500/20';
  if (trendType === 'negative') badgeColor = 'text-amber-400 bg-amber-500/10 border border-amber-500/20';

  return (
    <div
      onClick={onClick}
      className={`p-5 rounded-2xl bg-gradient-to-b ${colorClass} border shadow-lg relative overflow-hidden transition-all duration-200 ${
        onClick ? 'cursor-pointer hover:-translate-y-0.5 hover:shadow-xl hover:border-slate-600' : ''
      }`}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
          {title}
        </span>
        <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 text-slate-200">
          {icon}
        </div>
      </div>

      <div className="flex items-baseline justify-between gap-2">
        <span className="text-2xl sm:text-3xl font-extrabold font-mono text-white tracking-tight">
          {value}
        </span>
        {trend && (
          <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${badgeColor}`}>
            {trend}
          </span>
        )}
      </div>

      <p className="text-xs text-slate-400 mt-1 leading-snug">{subtext}</p>
    </div>
  );
};
