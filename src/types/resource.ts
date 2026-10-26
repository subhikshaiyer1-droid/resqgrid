export type ResourceType =
  | 'FIRST_AID_VOLUNTEER'
  | 'MEDICAL_SUPPORT_TEAM'
  | 'RESCUE_TEAM'
  | 'TRANSPORT_UNIT'
  | 'SUPPLY_DISTRIBUTION'
  | 'FIRE_HAZMAT';

export type ResourceStatus = 'AVAILABLE' | 'DISPATCHED' | 'OFF_DUTY' | 'MAINTENANCE';

export interface ResourceSkill {
  id: string;
  name: string;
}

export interface ResourceAssignment {
  id: string;
  incidentId: string;
  incidentTitle: string;
  assignedAt: string;
  completedAt?: string;
  status: 'ACTIVE' | 'COMPLETED' | 'CANCELLED';
  notes?: string;
}

export interface Resource {
  id: string; // e.g. "RES-MED-01"
  name: string;
  type: ResourceType;
  status: ResourceStatus;
  skills: string[];
  serviceArea: string;
  capacity: number;
  contactPerson: string;
  contactPhone: string; // Restricted to authorized users
  currentAssignmentId?: string;
  currentIncidentId?: string;
  currentIncidentTitle?: string;
  assignmentHistory: ResourceAssignment[];
  baseLocation?: {
    lat: number;
    lng: number;
    address: string;
  };
  lastActive: string;
}
