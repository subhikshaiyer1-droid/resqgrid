export type SeverityLevel = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';

export type IncidentCategory =
  | 'ROAD_ACCIDENT'
  | 'MEDICAL_EMERGENCY'
  | 'FIRE_OUTBREAK'
  | 'FLOODING'
  | 'BLOCKED_ROAD'
  | 'MISSING_PERSON'
  | 'PUBLIC_SAFETY';

export type IncidentStatus =
  | 'REPORTED'
  | 'UNDER_REVIEW'
  | 'VERIFIED'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'RESOLVED'
  | 'REJECTED'
  | 'DUPLICATE';

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  type: 'CREATED' | 'STATUS_CHANGE' | 'ASSIGNMENT' | 'NOTE' | 'PRIORITY_OVERRIDE' | 'VERIFIED' | 'RESOLVED';
  actorName: string;
  actorRole: string;
  description: string;
  previousValue?: string;
  newValue?: string;
}

export interface InternalNote {
  id: string;
  authorId: string;
  authorName: string;
  authorRole: string;
  content: string;
  createdAt: string;
}

export interface PriorityBreakdown {
  totalScore: number; // 0 - 100
  tier: 'P1' | 'P2' | 'P3' | 'P4';
  tierLabel: string;
  severityScore: number;    // 45% weight
  affectedScore: number;    // 25% weight
  waitingScore: number;     // 20% weight
  verificationScore: number;// 10% weight
  rationale: string[];
  isOverridden?: boolean;
  overriddenBy?: string;
  overrideReason?: string;
}

export interface Incident {
  id: string; // e.g. "RESQ-2026-1042"
  title: string;
  category: IncidentCategory;
  severity: SeverityLevel;
  status: IncidentStatus;
  description: string;
  affectedCount: number;
  locationName: string;
  coordinates: Coordinates;
  reporterName?: string;
  reporterContact?: string; // Private, visible only to authorized users
  imageUrl?: string;
  createdAt: string;
  updatedAt: string;
  verifiedAt?: string;
  verifiedBy?: string;
  assignedResourceId?: string;
  assignedResourceName?: string;
  assignedAt?: string;
  resolvedAt?: string;
  resolvedBy?: string;
  rejectionReason?: string;
  priority: PriorityBreakdown;
  timeline: IncidentTimelineEvent[];
  internalNotes: InternalNote[];
}
