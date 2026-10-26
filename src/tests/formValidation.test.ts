import { describe, expect, it } from 'vitest';
import { incidentReportSchema } from '../utils/validation';

describe('Incident Report Form Zod Schema Validation', () => {
  it('validates a compliant incident report payload', () => {
    const validData = {
      title: 'Gas line rupture with sulfur smell',
      category: 'PUBLIC_SAFETY',
      severity: 'HIGH',
      description: 'Loud hissing sound near utility meter behind bakery. Strong gas odor detected.',
      affectedCount: 12,
      locationName: 'Baker Street & Pine St',
      lat: 37.7833,
      lng: -122.4167,
      reporterName: 'Jordan Vance',
      reporterContact: '+1 555 444 3322',
      consent: true,
    };

    const parsed = incidentReportSchema.safeParse(validData);
    expect(parsed.success).toBe(true);
  });

  it('rejects short title and descriptions under minimum length', () => {
    const invalidData = {
      title: 'Fire', // < 5 chars
      category: 'FIRE_OUTBREAK',
      severity: 'CRITICAL',
      description: 'Smoke here', // < 15 chars
      affectedCount: 2,
      locationName: 'Main St',
      lat: 37.77,
      lng: -122.41,
      consent: true,
    };

    const parsed = incidentReportSchema.safeParse(invalidData);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.title).toBeDefined();
      expect(fieldErrors.description).toBeDefined();
    }
  });

  it('enforces mandatory safety disclaimer consent acknowledgment', () => {
    const withoutConsent = {
      title: 'High-voltage wire down on school path',
      category: 'PUBLIC_SAFETY',
      severity: 'CRITICAL',
      description: 'Sparks flying across asphalt pavement during rainstorm.',
      affectedCount: 0,
      locationName: 'Lincoln Middle School Gate 2',
      lat: 37.75,
      lng: -122.45,
      consent: false, // Must be true!
    };

    const parsed = incidentReportSchema.safeParse(withoutConsent);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.consent).toBeDefined();
    }
  });

  it('validates coordinate boundaries', () => {
    const outOfBounds = {
      title: 'Valid emergency title for coordinates test',
      category: 'MEDICAL_EMERGENCY',
      severity: 'HIGH',
      description: 'Comprehensive description explaining medical situation on scene.',
      affectedCount: 1,
      locationName: 'Test Location',
      lat: 95.0, // Invalid latitude (> 90)
      lng: -122.4,
      consent: true,
    };

    const parsed = incidentReportSchema.safeParse(outOfBounds);
    expect(parsed.success).toBe(false);
    if (!parsed.success) {
      const fieldErrors = parsed.error.flatten().fieldErrors;
      expect(fieldErrors.lat).toBeDefined();
    }
  });
});
