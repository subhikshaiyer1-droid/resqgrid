import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { RoleSwitcher } from './RoleSwitcher';
import {
  Bell,
  RotateCcw,
  Search,
  Database,
  Radio,
  Menu,
  X,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { formatTimeAgo } from '../../utils/formatters';

export const Navbar: React.FC<{ onMobileMenuToggle?: () => void }> = ({ onMobileMenuToggle }) => {
  const {
    isSupabaseMode,
    resetDemoData,
    notifications,
    markNotificationRead,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    activeTab,
    currentUser,
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Brand & Mobile Toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={onMobileMenuToggle}
            className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <button
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-2.5 group text-left"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 via-rose-500 to-amber-500 p-0.5 shadow-lg shadow-red-500/20 group-hover:shadow-red-500/40 transition-shadow">
              <div className="w-full h-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <Radio className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-base sm:text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-300 bg-clip-text text-transparent">
                  ResQGrid
                </span>
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider px-1.5 py-0.2 rounded bg-red-500/10 text-red-400 border border-red-500/20">
                  OPS
                </span>
              </div>
              <p className="text-[10px] text-slate-400 -mt-0.5 hidden sm:block">
                Smart Emergency Coordination
              </p>
            </div>
          </button>
        </div>

        {/* Center: Global Search Bar */}
        <div className="hidden md:flex flex-1 max-w-md mx-4">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (activeTab === 'landing') {
                  setActiveTab('dashboard');
                }
              }}
              placeholder="Search incidents, locations, units (Press / to search)..."
              className="w-full bg-slate-950/70 border border-slate-700/80 rounded-xl pl-10 pr-4 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/30 transition-all font-sans"
            />
          </div>
        </div>

        {/* Right: Mode Badge, Reset Demo, Notifications, Role Switcher */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Mode Pill */}
          <div
            className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border ${
              isSupabaseMode
                ? 'bg-emerald-950/50 text-emerald-300 border-emerald-500/30'
                : 'bg-slate-800/60 text-slate-300 border-slate-700/70'
            }`}
            title={
              isSupabaseMode
                ? 'Supabase backend connected with Row Level Security'
                : 'Demo Mode: Running locally with browser persistence'
            }
          >
            <Database className="w-3.5 h-3.5 text-slate-400" />
            <span className="hidden xl:inline text-slate-400">Mode:</span>
            <span>{isSupabaseMode ? 'Supabase Live' : 'Demo Sandbox'}</span>
          </div>

          {/* Reset Demo Data Button */}
          <button
            onClick={() => {
              if (window.confirm('Reset demo data to initial realistic seed state? This restores all 9 incidents and 6 units.')) {
                resetDemoData();
              }
            }}
            className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors"
            title="Reset to fresh demo seed data"
            aria-label="Reset demo data"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Notifications Button & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/80 transition-colors relative"
              aria-label="Open notifications"
            >
              <Bell className="w-4 h-4" />
              {unreadCount > 0 && (
                <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center animate-pulse">
                  {unreadCount}
                </span>
              )}
            </button>

            {showNotifications && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setShowNotifications(false)}
                  aria-hidden="true"
                />
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl z-50 text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95 overflow-hidden">
                  <div className="p-3 border-b border-slate-800 flex items-center justify-between bg-slate-950/50">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-400" />
                      <span className="font-bold text-xs">Dispatch Notifications</span>
                    </div>
                    <span className="text-[11px] font-mono text-slate-400">
                      {unreadCount} Unread
                    </span>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60">
                    {notifications.length === 0 ? (
                      <p className="p-4 text-xs text-center text-slate-400">
                        No active notifications.
                      </p>
                    ) : (
                      notifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => {
                            markNotificationRead(notif.id);
                            if (notif.incidentId) {
                              setActiveTab('incidents');
                            }
                          }}
                          className={`p-3 text-xs transition-colors cursor-pointer hover:bg-slate-800/50 ${
                            notif.read ? 'opacity-70' : 'bg-slate-800/20'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <span className="font-semibold text-slate-200">{notif.title}</span>
                            <span className="text-[10px] text-slate-400 font-mono">
                              {formatTimeAgo(notif.timestamp)}
                            </span>
                          </div>
                          <p className="text-slate-300 text-[11px] leading-relaxed">
                            {notif.message}
                          </p>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Role Switcher */}
          <RoleSwitcher />
        </div>
      </div>
    </header>
  );
};
