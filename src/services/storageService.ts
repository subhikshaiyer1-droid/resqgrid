import { Incident, IncidentStatus, IncidentTimelineEvent, InternalNote, PriorityBreakdown } from '../types/incident';
import { Resource, ResourceAssignment, ResourceStatus } from '../types/resource';
import { SystemNotification, UserProfile } from '../types/user';
import { INITIAL_INCIDENTS, INITIAL_NOTIFICATIONS, INITIAL_RESOURCES, INITIAL_USER_PROFILES } from './mockData';
import { computeSmartPriorityScore } from '../utils/priorityEngine';

const STORAGE_KEYS = {
  INCIDENTS: 'resqgrid_incidents_v1',
  RESOURCES: 'resqgrid_resources_v1',
  NOTIFICATIONS: 'resqgrid_notifications_v1',
  USER_PROFILES: 'resqgrid_users_v1',
  CURRENT_USER_ID: 'resqgrid_current_user_id_v1',
};

// In-memory fallback for SSR and test environments where localStorage is absent
const memoryStore: Record<string, string> = {};

const safeStorage = {
  getItem: (key: string): string | null => {
    if (typeof window !== 'undefined' && window.localStorage) {
      return window.localStorage.getItem(key);
    }
    return memoryStore[key] ?? null;
  },
  setItem: (key: string, value: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(key, value);
    } else {
      memoryStore[key] = value;
    }
  },
  removeItem: (key: string): void => {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.removeItem(key);
    } else {
      delete memoryStore[key];
    }
  },
};

class StorageService {
  private hasInitialized = false;

  constructor() {
    this.ensureInitialized();
  }

  public ensureInitialized(): void {
    if (this.hasInitialized) return;

    if (!safeStorage.getItem(STORAGE_KEYS.INCIDENTS)) {
      this.resetToSeedData();
    }
    this.hasInitialized = true;
  }

  public resetToSeedData(): void {
    safeStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(INITIAL_INCIDENTS));
    safeStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(INITIAL_RESOURCES));
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(INITIAL_NOTIFICATIONS));
    safeStorage.setItem(STORAGE_KEYS.USER_PROFILES, JSON.stringify(INITIAL_USER_PROFILES));
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, INITIAL_USER_PROFILES[0].id); // Default Coordinator
  }

  // Incidents
  public getIncidents(): Incident[] {
    this.ensureInitialized();
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.INCIDENTS);
      if (!data) return INITIAL_INCIDENTS;
      const parsed: Incident[] = JSON.parse(data);
      // Recompute dynamic waiting score for real-time fidelity
      return parsed.map((inc) => ({
        ...inc,
        priority: inc.priority.isOverridden
          ? inc.priority
          : computeSmartPriorityScore({
              severity: inc.severity,
              affectedCount: inc.affectedCount,
              createdAt: inc.createdAt,
              status: inc.status,
            }),
      }));
    } catch (e) {
      console.error('Failed to load incidents from storage', e);
      return INITIAL_INCIDENTS;
    }
  }

  public getIncidentById(id: string): Incident | undefined {
    return this.getIncidents().find((i) => i.id === id);
  }

  public createIncident(
    rawIncident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt' | 'priority' | 'timeline' | 'internalNotes'>,
    authorName = 'Citizen Reporter',
    authorRole = 'REPORTER'
  ): Incident {
    const incidents = this.getIncidents();
    const timestamp = new Date().toISOString();
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const id = `RESQ-2026-${randomSuffix}`;

    const priority = computeSmartPriorityScore({
      severity: rawIncident.severity,
      affectedCount: rawIncident.affectedCount,
      createdAt: timestamp,
      status: rawIncident.status || 'REPORTED',
    });

    const initialEvent: IncidentTimelineEvent = {
      id: `EV-${randomSuffix}-1`,
      timestamp,
      type: 'CREATED',
      actorName: authorName,
      actorRole: authorRole,
      description: `Report submitted: "${rawIncident.title}" at ${rawIncident.locationName}.`,
    };

    const newIncident: Incident = {
      ...rawIncident,
      id,
      createdAt: timestamp,
      updatedAt: timestamp,
      priority,
      timeline: [initialEvent],
      internalNotes: [],
    };

    const updated = [newIncident, ...incidents];
    safeStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(updated));

    // Trigger notification
    this.addNotification({
      title: 'New Incident Submitted',
      message: `Report ${id}: ${newIncident.title} (${newIncident.severity})`,
      type: 'ALERT',
      incidentId: id,
    });

    return newIncident;
  }

  public updateIncident(id: string, updates: Partial<Incident>): Incident {
    const incidents = this.getIncidents();
    const index = incidents.findIndex((i) => i.id === id);
    if (index === -1) {
      throw new Error(`Incident with ID ${id} not found.`);
    }

    const current = incidents[index];
    const timestamp = new Date().toISOString();

    const updatedIncident: Incident = {
      ...current,
      ...updates,
      updatedAt: timestamp,
    };

    // Recompute priority if not overridden
    if (!updatedIncident.priority.isOverridden) {
      updatedIncident.priority = computeSmartPriorityScore({
        severity: updatedIncident.severity,
        affectedCount: updatedIncident.affectedCount,
        createdAt: updatedIncident.createdAt,
        status: updatedIncident.status,
      });
    }

    incidents[index] = updatedIncident;
    safeStorage.setItem(STORAGE_KEYS.INCIDENTS, JSON.stringify(incidents));
    return updatedIncident;
  }

  public updateIncidentStatus(
    id: string,
    newStatus: IncidentStatus,
    actorName: string,
    actorRole: string,
    reason?: string
  ): Incident {
    const incident = this.getIncidentById(id);
    if (!incident) throw new Error(`Incident ${id} not found`);

    const timestamp = new Date().toISOString();
    const oldStatus = incident.status;

    const event: IncidentTimelineEvent = {
      id: `EV-${Date.now()}`,
      timestamp,
      type: newStatus === 'RESOLVED' ? 'RESOLVED' : newStatus === 'VERIFIED' ? 'VERIFIED' : 'STATUS_CHANGE',
      actorName,
      actorRole,
      description: reason
        ? `Status changed from ${oldStatus} to ${newStatus}. Rationale: ${reason}`
        : `Status transitioned from ${oldStatus} to ${newStatus}.`,
      previousValue: oldStatus,
      newValue: newStatus,
    };

    const updates: Partial<Incident> = {
      status: newStatus,
      timeline: [event, ...incident.timeline],
    };

    if (newStatus === 'VERIFIED') {
      updates.verifiedAt = timestamp;
      updates.verifiedBy = `${actorName} (${actorRole})`;
    } else if (newStatus === 'RESOLVED') {
      updates.resolvedAt = timestamp;
      updates.resolvedBy = `${actorName} (${actorRole})`;

      // If a resource was assigned, release the resource back to AVAILABLE
      if (incident.assignedResourceId) {
        this.releaseResourceFromIncident(incident.assignedResourceId, incident.id);
      }
    } else if (newStatus === 'REJECTED' || newStatus === 'DUPLICATE') {
      updates.rejectionReason = reason || 'Unverified or duplicate report rejected by coordinator.';
      if (incident.assignedResourceId) {
        this.releaseResourceFromIncident(incident.assignedResourceId, incident.id);
      }
    }

    return this.updateIncident(id, updates);
  }

  public addInternalNote(incidentId: string, note: Omit<InternalNote, 'id' | 'createdAt'>): Incident {
    const incident = this.getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const timestamp = new Date().toISOString();
    const newNote: InternalNote = {
      ...note,
      id: `NOTE-${Date.now()}`,
      createdAt: timestamp,
    };

    const timelineEvent: IncidentTimelineEvent = {
      id: `EV-${Date.now()}`,
      timestamp,
      type: 'NOTE',
      actorName: note.authorName,
      actorRole: note.authorRole,
      description: `Internal Note added: "${note.content.slice(0, 60)}${note.content.length > 60 ? '...' : ''}"`,
    };

    return this.updateIncident(incidentId, {
      internalNotes: [newNote, ...incident.internalNotes],
      timeline: [timelineEvent, ...incident.timeline],
    });
  }

  public overrideIncidentPriority(
    incidentId: string,
    overrideTier: 'P1' | 'P2' | 'P3' | 'P4',
    rationale: string,
    actorName: string
  ): Incident {
    const incident = this.getIncidentById(incidentId);
    if (!incident) throw new Error(`Incident ${incidentId} not found`);

    const timestamp = new Date().toISOString();
    const scoreMap = { P1: 95, P2: 75, P3: 50, P4: 25 };
    const labelMap = {
      P1: 'P1 — Critical Immediate Action (Manual Override)',
      P2: 'P2 — High Urgency (Manual Override)',
      P3: 'P3 — Elevated Priority (Manual Override)',
      P4: 'P4 — Standard Queue (Manual Override)',
    };

    const updatedPriority: PriorityBreakdown = {
      ...incident.priority,
      tier: overrideTier,
      totalScore: scoreMap[overrideTier],
      tierLabel: labelMap[overrideTier],
      isOverridden: true,
      overriddenBy: actorName,
      overrideReason: rationale,
      rationale: [`Manual Coordinator Override by ${actorName}: ${rationale}`, ...incident.priority.rationale],
    };

    const timelineEvent: IncidentTimelineEvent = {
      id: `EV-${Date.now()}`,
      timestamp,
      type: 'PRIORITY_OVERRIDE',
      actorName,
      actorRole: 'COORDINATOR',
      description: `Priority manually overridden to ${overrideTier}. Reason: ${rationale}`,
      previousValue: incident.priority.tier,
      newValue: overrideTier,
    };

    return this.updateIncident(incidentId, {
      priority: updatedPriority,
      timeline: [timelineEvent, ...incident.timeline],
    });
  }

  // Resources
  public getResources(): Resource[] {
    this.ensureInitialized();
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.RESOURCES);
      return data ? JSON.parse(data) : INITIAL_RESOURCES;
    } catch {
      return INITIAL_RESOURCES;
    }
  }

  public getResourceById(id: string): Resource | undefined {
    return this.getResources().find((r) => r.id === id);
  }

  public updateResource(id: string, updates: Partial<Resource>): Resource {
    const resources = this.getResources();
    const index = resources.findIndex((r) => r.id === id);
    if (index === -1) throw new Error(`Resource ${id} not found`);

    const updated = { ...resources[index], ...updates };
    resources[index] = updated;
    safeStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(resources));
    return updated;
  }

  public createResource(raw: Omit<Resource, 'id' | 'assignmentHistory' | 'lastActive'>): Resource {
    const resources = this.getResources();
    const id = `RES-${raw.type.slice(0, 4)}-${Math.floor(10 + Math.random() * 89)}`;
    const newResource: Resource = {
      ...raw,
      id,
      assignmentHistory: [],
      lastActive: new Date().toISOString(),
    };
    const updated = [newResource, ...resources];
    safeStorage.setItem(STORAGE_KEYS.RESOURCES, JSON.stringify(updated));
    return newResource;
  }

  // Conflict-Safe Assignment
  public assignResourceToIncident(
    incidentId: string,
    resourceId: string,
    actorName: string,
    actorRole: string,
    notes?: string
  ): { success: boolean; message: string; incident?: Incident; resource?: Resource } {
    const incident = this.getIncidentById(incidentId);
    const resource = this.getResourceById(resourceId);

    if (!incident) return { success: false, message: `Incident ${incidentId} was not found.` };
    if (!resource) return { success: false, message: `Resource ${resourceId} was not found.` };

    // Prevent conflicting assignment if resource is already dispatched to another active incident
    if (resource.status === 'DISPATCHED' && resource.currentIncidentId && resource.currentIncidentId !== incidentId) {
      return {
        success: false,
        message: `Conflict: ${resource.name} is currently dispatched to incident ${resource.currentIncidentId} ("${resource.currentIncidentTitle}"). Please release or reassign them first.`,
      };
    }

    // Release any previous resource assigned to this incident
    if (incident.assignedResourceId && incident.assignedResourceId !== resourceId) {
      this.releaseResourceFromIncident(incident.assignedResourceId, incident.id);
    }

    const timestamp = new Date().toISOString();
    const assignmentId = `ASG-${Date.now()}`;

    // Update resource state
    const newAssignment: ResourceAssignment = {
      id: assignmentId,
      incidentId: incident.id,
      incidentTitle: incident.title,
      assignedAt: timestamp,
      status: 'ACTIVE',
      notes,
    };

    const updatedResource = this.updateResource(resourceId, {
      status: 'DISPATCHED',
      currentAssignmentId: assignmentId,
      currentIncidentId: incident.id,
      currentIncidentTitle: incident.title,
      lastActive: timestamp,
      assignmentHistory: [newAssignment, ...(resource.assignmentHistory || [])],
    });

    // Update incident state
    const timelineEvent: IncidentTimelineEvent = {
      id: `EV-${Date.now()}`,
      timestamp,
      type: 'ASSIGNMENT',
      actorName,
      actorRole,
      description: `Dispatched ${resource.name} (${resource.type}). ${notes ? `Note: ${notes}` : ''}`,
      newValue: resource.name,
    };

    const updatedIncident = this.updateIncident(incidentId, {
      assignedResourceId: resource.id,
      assignedResourceName: resource.name,
      assignedAt: timestamp,
      status: incident.status === 'REPORTED' || incident.status === 'UNDER_REVIEW' ? 'ASSIGNED' : incident.status,
      timeline: [timelineEvent, ...incident.timeline],
    });

    this.addNotification({
      title: 'Unit Dispatched',
      message: `${resource.name} assigned to ${incident.id}: ${incident.title}`,
      type: 'ASSIGNMENT',
      incidentId: incident.id,
    });

    return {
      success: true,
      message: `Successfully dispatched ${resource.name} to ${incident.id}.`,
      incident: updatedIncident,
      resource: updatedResource,
    };
  }

  public releaseResourceFromIncident(resourceId: string, incidentId: string): void {
    const resource = this.getResourceById(resourceId);
    if (!resource) return;

    const timestamp = new Date().toISOString();
    const updatedHistory = (resource.assignmentHistory || []).map((asg) =>
      asg.incidentId === incidentId && asg.status === 'ACTIVE'
        ? { ...asg, status: 'COMPLETED' as const, completedAt: timestamp }
        : asg
    );

    this.updateResource(resourceId, {
      status: 'AVAILABLE',
      currentAssignmentId: undefined,
      currentIncidentId: undefined,
      currentIncidentTitle: undefined,
      lastActive: timestamp,
      assignmentHistory: updatedHistory,
    });
  }

  // Notifications
  public getNotifications(): SystemNotification[] {
    this.ensureInitialized();
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.NOTIFICATIONS);
      return data ? JSON.parse(data) : INITIAL_NOTIFICATIONS;
    } catch {
      return INITIAL_NOTIFICATIONS;
    }
  }

  public addNotification(notif: Omit<SystemNotification, 'id' | 'timestamp' | 'read'>): SystemNotification {
    const notifs = this.getNotifications();
    const newNotif: SystemNotification = {
      ...notif,
      id: `NOTIF-${Date.now()}`,
      timestamp: new Date().toISOString(),
      read: false,
    };
    const updated = [newNotif, ...notifs];
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated.slice(0, 30)));
    return newNotif;
  }

  public markNotificationRead(id: string): void {
    const notifs = this.getNotifications();
    const updated = notifs.map((n) => (n.id === id ? { ...n, read: true } : n));
    safeStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(updated));
  }

  // User Profiles
  public getUserProfiles(): UserProfile[] {
    this.ensureInitialized();
    try {
      const data = safeStorage.getItem(STORAGE_KEYS.USER_PROFILES);
      return data ? JSON.parse(data) : INITIAL_USER_PROFILES;
    } catch {
      return INITIAL_USER_PROFILES;
    }
  }

  public getCurrentUser(): UserProfile {
    this.ensureInitialized();
    const currentId = safeStorage.getItem(STORAGE_KEYS.CURRENT_USER_ID);
    const users = this.getUserProfiles();
    const found = users.find((u) => u.id === currentId);
    return found || users[0];
  }

  public setCurrentUser(userId: string): UserProfile {
    const users = this.getUserProfiles();
    const found = users.find((u) => u.id === userId);
    if (!found) throw new Error('User not found');
    safeStorage.setItem(STORAGE_KEYS.CURRENT_USER_ID, userId);
    return found;
  }
}

export const storageService = new StorageService();
