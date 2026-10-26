import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Incident, IncidentCategory, IncidentStatus, SeverityLevel } from '../types/incident';
import { Resource } from '../types/resource';
import { SystemNotification, UserProfile, UserRole } from '../types/user';
import { storageService } from '../services/storageService';
import { isSupabaseConfigured } from '../services/supabaseClient';
import { IncidentReportFormData, ResourceCreationFormData } from '../utils/validation';
import { useToast } from './ToastContext';

export type NavigationTab =
  | 'landing'
  | 'dashboard'
  | 'report'
  | 'incidents'
  | 'map'
  | 'resources'
  | 'analytics'
  | 'auth';

interface AppContextType {
  incidents: Incident[];
  resources: Resource[];
  notifications: SystemNotification[];
  currentUser: UserProfile;
  userProfiles: UserProfile[];
  isSupabaseMode: boolean;
  activeTab: NavigationTab;
  selectedIncident: Incident | null;
  searchQuery: string;
  categoryFilter: string;
  severityFilter: string;
  statusFilter: string;

  // Actions
  setActiveTab: (tab: NavigationTab) => void;
  setSelectedIncident: (incident: Incident | null) => void;
  setSearchQuery: (query: string) => void;
  setCategoryFilter: (category: string) => void;
  setSeverityFilter: (severity: string) => void;
  setStatusFilter: (status: string) => void;
  switchUserRole: (role: UserRole) => void;
  refreshData: () => void;
  resetDemoData: () => void;

  // Incident Operations
  submitIncidentReport: (formData: IncidentReportFormData) => Promise<Incident>;
  updateIncidentStatus: (id: string, newStatus: IncidentStatus, reason?: string) => void;
  addInternalNote: (incidentId: string, content: string) => void;
  overridePriority: (incidentId: string, tier: 'P1' | 'P2' | 'P3' | 'P4', rationale: string) => void;

  // Resource Operations
  assignResourceToIncident: (incidentId: string, resourceId: string, notes?: string) => boolean;
  releaseResource: (resourceId: string, incidentId: string) => void;
  createResource: (formData: ResourceCreationFormData) => Resource;
  toggleResourceStatus: (resourceId: string, newStatus: Resource['status']) => void;

  // Notifications
  markNotificationRead: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const toast = useToast();
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [notifications, setNotifications] = useState<SystemNotification[]>([]);
  const [userProfiles, setUserProfiles] = useState<UserProfile[]>([]);
  const [currentUser, setCurrentUser] = useState<UserProfile>(() => storageService.getCurrentUser());
  const [activeTab, setActiveTab] = useState<NavigationTab>('landing');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');

  const isSupabaseMode = isSupabaseConfigured();

  const loadData = useCallback(() => {
    const incs = storageService.getIncidents();
    const res = storageService.getResources();
    const notifs = storageService.getNotifications();
    const users = storageService.getUserProfiles();
    const current = storageService.getCurrentUser();

    setIncidents(incs);
    setResources(res);
    setNotifications(notifs);
    setUserProfiles(users);
    setCurrentUser(current);

    // Keep selectedIncident synchronized if open
    setSelectedIncident((prev) => {
      if (!prev) return null;
      return incs.find((i) => i.id === prev.id) || null;
    });
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const switchUserRole = useCallback(
    (targetRole: UserRole) => {
      const matching = userProfiles.find((u) => u.role === targetRole);
      if (matching) {
        const updated = storageService.setCurrentUser(matching.id);
        setCurrentUser(updated);
        toast.info(
          `Switched to ${matching.role} Role`,
          `Simulating session as ${matching.fullName} (${matching.department || 'Operations'})`
        );
      }
    },
    [userProfiles, toast]
  );

  const resetDemoData = useCallback(() => {
    storageService.resetToSeedData();
    loadData();
    setSelectedIncident(null);
    toast.success('Demo Data Reset', 'Restored 9 realistic incidents, 6 response teams, and initial timeline logs.');
  }, [loadData, toast]);

  const submitIncidentReport = async (formData: IncidentReportFormData): Promise<Incident> => {
    const newInc = storageService.createIncident(
      {
        title: formData.title,
        category: formData.category as IncidentCategory,
        severity: formData.severity as SeverityLevel,
        status: 'REPORTED',
        description: formData.description,
        affectedCount: formData.affectedCount,
        locationName: formData.locationName,
        coordinates: {
          lat: formData.lat,
          lng: formData.lng,
        },
        reporterName: formData.reporterName || currentUser.fullName || 'Anonymous Citizen',
        reporterContact: formData.reporterContact,
        imageUrl: formData.imageUrl,
      },
      currentUser.fullName,
      currentUser.role
    );

    loadData();
    toast.success('Emergency Report Logged', `Incident ${newInc.id} registered in dispatch queue.`);
    return newInc;
  };

  const updateIncidentStatus = useCallback(
    (id: string, newStatus: IncidentStatus, reason?: string) => {
      try {
        const updated = storageService.updateIncidentStatus(
          id,
          newStatus,
          currentUser.fullName,
          currentUser.role,
          reason
        );
        loadData();
        setSelectedIncident(updated);
        toast.success('Status Updated', `${updated.id} is now ${newStatus}`);
      } catch (err: any) {
        toast.error('Update Failed', err.message);
      }
    },
    [currentUser, loadData, toast]
  );

  const addInternalNote = useCallback(
    (incidentId: string, content: string) => {
      try {
        const updated = storageService.addInternalNote(incidentId, {
          authorId: currentUser.id,
          authorName: currentUser.fullName,
          authorRole: currentUser.role,
          content,
        });
        loadData();
        setSelectedIncident(updated);
        toast.success('Coordination Note Saved');
      } catch (err: any) {
        toast.error('Failed to add note', err.message);
      }
    },
    [currentUser, loadData, toast]
  );

  const overridePriority = useCallback(
    (incidentId: string, tier: 'P1' | 'P2' | 'P3' | 'P4', rationale: string) => {
      try {
        const updated = storageService.overrideIncidentPriority(
          incidentId,
          tier,
          rationale,
          currentUser.fullName
        );
        loadData();
        setSelectedIncident(updated);
        toast.warning('Priority Overridden', `Incident tier changed to ${tier}`);
      } catch (err: any) {
        toast.error('Priority override failed', err.message);
      }
    },
    [currentUser, loadData, toast]
  );

  const assignResourceToIncident = useCallback(
    (incidentId: string, resourceId: string, notes?: string): boolean => {
      const result = storageService.assignResourceToIncident(
        incidentId,
        resourceId,
        currentUser.fullName,
        currentUser.role,
        notes
      );

      if (result.success) {
        loadData();
        if (result.incident) setSelectedIncident(result.incident);
        toast.success('Resource Dispatched', result.message);
        return true;
      } else {
        toast.error('Assignment Prevented', result.message);
        return false;
      }
    },
    [currentUser, loadData, toast]
  );

  const releaseResource = useCallback(
    (resourceId: string, incidentId: string) => {
      storageService.releaseResourceFromIncident(resourceId, incidentId);
      loadData();
      toast.info('Resource Released', 'Unit marked available for new dispatches.');
    },
    [loadData, toast]
  );

  const createResource = useCallback(
    (formData: ResourceCreationFormData): Resource => {
      const skillsArray = formData.skills
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);

      const created = storageService.createResource({
        name: formData.name,
        type: formData.type,
        status: 'AVAILABLE',
        skills: skillsArray,
        serviceArea: formData.serviceArea,
        capacity: formData.capacity,
        contactPerson: formData.contactPerson,
        contactPhone: formData.contactPhone,
      });

      loadData();
      toast.success('Resource Enrolled', `${created.name} is now available in directory.`);
      return created;
    },
    [loadData, toast]
  );

  const toggleResourceStatus = useCallback(
    (resourceId: string, newStatus: Resource['status']) => {
      storageService.updateResource(resourceId, { status: newStatus });
      loadData();
      toast.info('Resource Status Changed', `Unit status set to ${newStatus}`);
    },
    [loadData, toast]
  );

  const markNotificationRead = useCallback((id: string) => {
    storageService.markNotificationRead(id);
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  }, []);

  return (
    <AppContext.Provider
      value={{
        incidents,
        resources,
        notifications,
        currentUser,
        userProfiles,
        isSupabaseMode,
        activeTab,
        selectedIncident,
        searchQuery,
        categoryFilter,
        severityFilter,
        statusFilter,
        setActiveTab,
        setSelectedIncident,
        setSearchQuery,
        setCategoryFilter,
        setSeverityFilter,
        setStatusFilter,
        switchUserRole,
        refreshData: loadData,
        resetDemoData,
        submitIncidentReport,
        updateIncidentStatus,
        addInternalNote,
        overridePriority,
        assignResourceToIncident,
        releaseResource,
        createResource,
        toggleResourceStatus,
        markNotificationRead,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
