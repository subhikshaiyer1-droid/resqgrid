import { beforeEach, describe, expect, it } from 'vitest';
import { storageService } from '../services/storageService';

describe('Resource Assignment & Conflict Prevention Workflow', () => {
  beforeEach(() => {
    storageService.resetToSeedData();
  });

  it('successfully assigns an available resource to an unassigned incident', () => {
    // RES-MED-01 is AVAILABLE in seed data
    // RESQ-2026-1002 is REPORTED and unassigned
    const result = storageService.assignResourceToIncident(
      'RESQ-2026-1002',
      'RES-MED-01',
      'Elena Rostova',
      'COORDINATOR',
      'Immediate oxygen supply dispatch'
    );

    expect(result.success).toBe(true);
    expect(result.incident?.assignedResourceId).toBe('RES-MED-01');
    expect(result.resource?.status).toBe('DISPATCHED');
    expect(result.resource?.currentIncidentId).toBe('RESQ-2026-1002');
  });

  it('prevents double-booking an already dispatched resource to another incident', () => {
    // RES-FIRE-04 is already DISPATCHED to RESQ-2026-1003 in seed data
    const result = storageService.assignResourceToIncident(
      'RESQ-2026-1001',
      'RES-FIRE-04',
      'Elena Rostova',
      'COORDINATOR'
    );

    expect(result.success).toBe(false);
    expect(result.message).toContain('Conflict');
    expect(result.message).toContain('RESQ-2026-1003');
  });

  it('releases resource and marks assignment history completed when incident is resolved', () => {
    // Assign RES-MED-01 to RESQ-2026-1002
    storageService.assignResourceToIncident(
      'RESQ-2026-1002',
      'RES-MED-01',
      'Elena Rostova',
      'COORDINATOR'
    );

    // Resolve the incident
    const resolvedIncident = storageService.updateIncidentStatus(
      'RESQ-2026-1002',
      'RESOLVED',
      'Elena Rostova',
      'COORDINATOR',
      'Patient stabilized with auxiliary oxygen concentrator.'
    );

    expect(resolvedIncident.status).toBe('RESOLVED');
    expect(resolvedIncident.resolvedAt).toBeDefined();

    // The assigned resource RES-MED-01 must be released back to AVAILABLE
    const resource = storageService.getResourceById('RES-MED-01');
    expect(resource?.status).toBe('AVAILABLE');
    expect(resource?.currentIncidentId).toBeUndefined();
    expect(resource?.assignmentHistory[0].status).toBe('COMPLETED');
  });
});
