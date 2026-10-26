import { IncidentCategory, IncidentStatus, SeverityLevel } from '../types/incident';
import { ResourceType } from '../types/resource';
import { UserRole } from '../types/user';

export function formatDate(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return isoString;
  }
}

export function formatTimeAgo(isoString: string): string {
  try {
    const now = Date.now();
    const past = new Date(isoString).getTime();
    const diffSec = Math.floor((now - past) / 1000);

    if (diffSec < 60) return 'Just now';
    const diffMin = Math.floor(diffSec / 60);
    if (diffMin < 60) return `${diffMin}m ago`;
    const diffHr = Math.floor(diffMin / 60);
    if (diffHr < 24) return `${diffHr}h ago`;
    const diffDays = Math.floor(diffHr / 24);
    return `${diffDays}d ago`;
  } catch {
    return 'Recently';
  }
}

export function maskContactInfo(contact?: string, userRole?: UserRole): string {
  if (!contact) return 'Not provided';
  // Authorized coordinators and administrators can view real contact details
  if (userRole === 'COORDINATOR' || userRole === 'ADMINISTRATOR') {
    return contact;
  }
  // Mask for privacy
  if (contact.includes('@')) {
    const [name, domain] = contact.split('@');
    return `${name.slice(0, 2)}***@${domain}`;
  }
  return contact.replace(/(\d{3})\D*(\d{3})\D*(\d{4})/, '$1-***-$4');
}

export function getCategoryMeta(category: IncidentCategory): {
  label: string;
  iconName: string;
  badgeBg: string;
  color: string;
} {
  switch (category) {
    case 'ROAD_ACCIDENT':
      return { label: 'Road Accident', iconName: 'Car', badgeBg: 'bg-amber-500/10 text-amber-400 border-amber-500/20', color: '#f59e0b' };
    case 'MEDICAL_EMERGENCY':
      return { label: 'Medical Emergency', iconName: 'HeartPulse', badgeBg: 'bg-rose-500/10 text-rose-400 border-rose-500/20', color: '#f43f5e' };
    case 'FIRE_OUTBREAK':
      return { label: 'Fire Outbreak', iconName: 'Flame', badgeBg: 'bg-red-500/10 text-red-400 border-red-500/20', color: '#ef4444' };
    case 'FLOODING':
      return { label: 'Flooding & Storm', iconName: 'Waves', badgeBg: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20', color: '#06b6d4' };
    case 'BLOCKED_ROAD':
      return { label: 'Blocked Road / Hazard', iconName: 'ShieldAlert', badgeBg: 'bg-orange-500/10 text-orange-400 border-orange-500/20', color: '#f97316' };
    case 'MISSING_PERSON':
      return { label: 'Missing Person', iconName: 'UserSearch', badgeBg: 'bg-purple-500/10 text-purple-400 border-purple-500/20', color: '#a855f7' };
    case 'PUBLIC_SAFETY':
      return { label: 'Public Safety Threat', iconName: 'AlertTriangle', badgeBg: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20', color: '#eab308' };
    default:
      return { label: 'General Incident', iconName: 'Info', badgeBg: 'bg-slate-500/10 text-slate-400 border-slate-500/20', color: '#94a3b8' };
  }
}

export function getSeverityMeta(severity: SeverityLevel): {
  label: string;
  badgeClass: string;
  dotColor: string;
  priorityWeight: number;
} {
  switch (severity) {
    case 'CRITICAL':
      return {
        label: 'Critical',
        badgeClass: 'bg-red-500/15 text-red-300 border-red-500/30',
        dotColor: 'bg-red-500',
        priorityWeight: 4,
      };
    case 'HIGH':
      return {
        label: 'High',
        badgeClass: 'bg-orange-500/15 text-orange-300 border-orange-500/30',
        dotColor: 'bg-orange-500',
        priorityWeight: 3,
      };
    case 'MEDIUM':
      return {
        label: 'Medium',
        badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30',
        dotColor: 'bg-amber-400',
        priorityWeight: 2,
      };
    case 'LOW':
      return {
        label: 'Low',
        badgeClass: 'bg-slate-500/15 text-slate-300 border-slate-500/30',
        dotColor: 'bg-slate-400',
        priorityWeight: 1,
      };
  }
}

export function getStatusMeta(status: IncidentStatus): {
  label: string;
  badgeClass: string;
  stepIndex: number;
} {
  switch (status) {
    case 'REPORTED':
      return { label: 'Reported', badgeClass: 'bg-blue-500/15 text-blue-300 border-blue-500/30', stepIndex: 1 };
    case 'UNDER_REVIEW':
      return { label: 'Under Review', badgeClass: 'bg-amber-500/15 text-amber-300 border-amber-500/30', stepIndex: 2 };
    case 'VERIFIED':
      return { label: 'Verified', badgeClass: 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30', stepIndex: 3 };
    case 'ASSIGNED':
      return { label: 'Assigned', badgeClass: 'bg-purple-500/15 text-purple-300 border-purple-500/30', stepIndex: 4 };
    case 'IN_PROGRESS':
      return { label: 'In Progress', badgeClass: 'bg-sky-500/15 text-sky-300 border-sky-500/30', stepIndex: 5 };
    case 'RESOLVED':
      return { label: 'Resolved', badgeClass: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30', stepIndex: 6 };
    case 'REJECTED':
      return { label: 'Rejected', badgeClass: 'bg-rose-500/15 text-rose-300 border-rose-500/30', stepIndex: -1 };
    case 'DUPLICATE':
      return { label: 'Duplicate', badgeClass: 'bg-gray-500/15 text-gray-300 border-gray-500/30', stepIndex: -1 };
  }
}

export function getResourceTypeLabel(type: ResourceType): string {
  switch (type) {
    case 'FIRST_AID_VOLUNTEER':
      return 'First-Aid Volunteer';
    case 'MEDICAL_SUPPORT_TEAM':
      return 'Paramedic / Medical Team';
    case 'RESCUE_TEAM':
      return 'Search & Rescue Unit';
    case 'TRANSPORT_UNIT':
      return 'Heavy Transport / Fleet';
    case 'SUPPLY_DISTRIBUTION':
      return 'Supply & Food Distribution';
    case 'FIRE_HAZMAT':
      return 'Hazmat & Extrication Brigade';
  }
}
