import React from 'react';
import { IncidentCategory, IncidentStatus, SeverityLevel } from '../../types/incident';
import { getCategoryMeta, getSeverityMeta, getStatusMeta } from '../../utils/formatters';
import {
  Car,
  HeartPulse,
  Flame,
  Waves,
  ShieldAlert,
  UserSearch,
  AlertTriangle,
  Info,
} from 'lucide-react';

export const SeverityBadge: React.FC<{ severity: SeverityLevel; className?: string }> = ({
  severity,
  className = '',
}) => {
  const meta = getSeverityMeta(severity);
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass} ${className}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${meta.dotColor} animate-pulse`} />
      {meta.label}
    </span>
  );
};

export const StatusBadge: React.FC<{ status: IncidentStatus; className?: string }> = ({
  status,
  className = '',
}) => {
  const meta = getStatusMeta(status);
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${meta.badgeClass} ${className}`}
    >
      {meta.label}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: IncidentCategory; className?: string }> = ({
  category,
  className = '',
}) => {
  const meta = getCategoryMeta(category);

  const renderIcon = () => {
    const iconClass = 'w-3.5 h-3.5 shrink-0';
    switch (category) {
      case 'ROAD_ACCIDENT':
        return <Car className={iconClass} />;
      case 'MEDICAL_EMERGENCY':
        return <HeartPulse className={iconClass} />;
      case 'FIRE_OUTBREAK':
        return <Flame className={iconClass} />;
      case 'FLOODING':
        return <Waves className={iconClass} />;
      case 'BLOCKED_ROAD':
        return <ShieldAlert className={iconClass} />;
      case 'MISSING_PERSON':
        return <UserSearch className={iconClass} />;
      case 'PUBLIC_SAFETY':
        return <AlertTriangle className={iconClass} />;
      default:
        return <Info className={iconClass} />;
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium border ${meta.badgeBg} ${className}`}
    >
      {renderIcon()}
      <span>{meta.label}</span>
    </span>
  );
};
