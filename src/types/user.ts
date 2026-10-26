export type UserRole = 'REPORTER' | 'VOLUNTEER' | 'COORDINATOR' | 'ADMINISTRATOR';

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  avatarUrl?: string;
  phone?: string;
  badgeNumber?: string;
  department?: string;
  assignedResourceId?: string; // If this user is linked to a volunteer/resource team
  createdAt: string;
}

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'INFO' | 'ALERT' | 'ASSIGNMENT' | 'VERIFICATION';
  timestamp: string;
  read: boolean;
  incidentId?: string;
}
