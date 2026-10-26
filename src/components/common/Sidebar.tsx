import React from 'react';
import { NavigationTab, useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  ClipboardList,
  MapPin,
  Users2,
  BarChart3,
  PlusCircle,
  Home,
  Shield,
  KeyRound,
  X,
} from 'lucide-react';

export const Sidebar: React.FC<{
  mobileOpen?: boolean;
  onCloseMobile?: () => void;
}> = ({ mobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab, incidents, resources, currentUser } = useApp();

  const openIncidentsCount = incidents.filter(
    (i) => i.status !== 'RESOLVED' && i.status !== 'REJECTED' && i.status !== 'DUPLICATE'
  ).length;

  const availableResourcesCount = resources.filter((r) => r.status === 'AVAILABLE').length;

  const navItems: {
    tab: NavigationTab;
    label: string;
    icon: React.ReactNode;
    badge?: number;
    badgeColor?: string;
    allowedRoles?: string[];
  }[] = [
    {
      tab: 'landing',
      label: 'Public Overview',
      icon: <Home className="w-4 h-4" />,
    },
    {
      tab: 'dashboard',
      label: 'Operations Hub',
      icon: <LayoutDashboard className="w-4 h-4" />,
      badge: openIncidentsCount,
      badgeColor: 'bg-red-500/20 text-red-400 border border-red-500/30',
    },
    {
      tab: 'incidents',
      label: 'Incident Queue',
      icon: <ClipboardList className="w-4 h-4" />,
      badge: openIncidentsCount,
      badgeColor: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    },
    {
      tab: 'map',
      label: 'Live GIS Map',
      icon: <MapPin className="w-4 h-4" />,
    },
    {
      tab: 'resources',
      label: 'Volunteers & Fleet',
      icon: <Users2 className="w-4 h-4" />,
      badge: availableResourcesCount,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30',
    },
    {
      tab: 'analytics',
      label: 'Analytics & Export',
      icon: <BarChart3 className="w-4 h-4" />,
    },
    {
      tab: 'auth',
      label: 'Access & Auth',
      icon: <KeyRound className="w-4 h-4" />,
    },
  ];

  const handleNavClick = (tab: NavigationTab) => {
    setActiveTab(tab);
    if (onCloseMobile) onCloseMobile();
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 border-r border-slate-800 text-slate-200 w-64 select-none">
      {/* Mobile Header with close button */}
      <div className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between">
        <span className="font-bold text-sm text-white">ResQGrid Navigation</span>
        <button
          onClick={onCloseMobile}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          aria-label="Close menu"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Primary CTA: Report Incident */}
      <div className="p-4">
        <button
          onClick={() => handleNavClick('report')}
          className={`w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl font-bold text-xs tracking-wide transition-all shadow-lg ${
            activeTab === 'report'
              ? 'bg-red-600 text-white shadow-red-900/50 ring-2 ring-red-400'
              : 'bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white shadow-red-950/40 hover:shadow-red-900/40'
          }`}
        >
          <PlusCircle className="w-4 h-4" />
          <span>REPORT AN INCIDENT</span>
        </button>
      </div>

      {/* Nav List */}
      <nav className="flex-1 px-3 py-2 space-y-1 overflow-y-auto">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
          Core Workflows
        </div>
        {navItems.map((item) => {
          const isActive = activeTab === item.tab;
          return (
            <button
              key={item.tab}
              onClick={() => handleNavClick(item.tab)}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-red-500/10 text-white border border-red-500/30 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className={isActive ? 'text-red-400' : 'text-slate-400'}>{item.icon}</span>
                <span>{item.label}</span>
              </div>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* User Persona footer */}
      <div className="p-4 border-t border-slate-800 bg-slate-950/60">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-slate-200 shrink-0">
            {currentUser.fullName.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{currentUser.fullName}</p>
            <div className="flex items-center gap-1.5 mt-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider truncate">
                {currentUser.role}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:block shrink-0 sticky top-16 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 flex flex-col h-full animate-in slide-in-from-left duration-200">
            {content}
          </div>
        </div>
      )}
    </>
  );
};
