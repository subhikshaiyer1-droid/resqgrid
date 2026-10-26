import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { UserRole } from '../../types/user';
import { Shield, ChevronDown, Check, UserCheck } from 'lucide-react';

export const RoleSwitcher: React.FC = () => {
  const { currentUser, switchUserRole } = useApp();
  const [isOpen, setIsOpen] = useState(false);

  const roles: { role: UserRole; title: string; desc: string; badge: string }[] = [
    {
      role: 'COORDINATOR',
      title: 'Coordinator (Elena R.)',
      desc: 'Verify incidents, dispatch units, priority override',
      badge: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      role: 'ADMINISTRATOR',
      title: 'Administrator (Marcus V.)',
      desc: 'Full system oversight, fleet & policy settings',
      badge: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      role: 'VOLUNTEER',
      title: 'Volunteer / Unit (Dr. Chen)',
      desc: 'Field response, mission tracking, status updates',
      badge: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
    },
    {
      role: 'REPORTER',
      title: 'Citizen Reporter',
      desc: 'Submit incident alerts, view public status',
      badge: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 border border-slate-700 text-xs text-slate-200 transition-all font-medium"
        title="Switch simulated role to test permissions"
      >
        <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
        <span className="hidden sm:inline text-slate-400">Role:</span>
        <span className="font-semibold text-white">{currentUser.role}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} aria-hidden="true" />
          <div className="absolute right-0 top-full mt-2 w-72 p-2 rounded-xl bg-slate-900/95 border border-slate-700/80 shadow-2xl z-50 text-slate-200 backdrop-blur-xl animate-in fade-in zoom-in-95">
            <div className="px-3 py-2 border-b border-slate-800 mb-1">
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-300">
                <UserCheck className="w-3.5 h-3.5 text-indigo-400" />
                <span>Simulate Role & Permissions</span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Test UI permissions instantly across all emergency personas
              </p>
            </div>

            <div className="space-y-1">
              {roles.map((item) => {
                const isActive = currentUser.role === item.role;
                return (
                  <button
                    key={item.role}
                    onClick={() => {
                      switchUserRole(item.role);
                      setIsOpen(false);
                    }}
                    className={`w-full text-left p-2.5 rounded-lg text-xs transition-colors flex items-start justify-between gap-2 ${
                      isActive ? 'bg-indigo-600/20 border border-indigo-500/30 text-white' : 'hover:bg-slate-800 text-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold">{item.title}</span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5 leading-snug">{item.desc}</p>
                    </div>
                    {isActive && <Check className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />}
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
