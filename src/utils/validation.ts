import { z } from 'zod';

export const incidentReportSchema = z.object({
  title: z
    .string()
    .min(5, 'Incident title must be at least 5 characters')
    .max(100, 'Title cannot exceed 100 characters'),
  category: z.enum([
    'ROAD_ACCIDENT',
    'MEDICAL_EMERGENCY',
    'FIRE_OUTBREAK',
    'FLOODING',
    'BLOCKED_ROAD',
    'MISSING_PERSON',
    'PUBLIC_SAFETY',
  ]),
  severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
  description: z
    .string()
    .min(15, 'Please provide a detailed description (at least 15 characters)')
    .max(1500, 'Description cannot exceed 1500 characters'),
  affectedCount: z.coerce
    .number()
    .int('Must be a whole number')
    .min(0, 'Affected people cannot be negative')
    .max(1000, 'Number cannot exceed 1,000'),
  locationName: z
    .string()
    .min(3, 'Location description or landmark must be at least 3 characters')
    .max(150, 'Location description cannot exceed 150 characters'),
  lat: z.coerce
    .number()
    .min(-90, 'Latitude must be between -90 and 90')
    .max(90, 'Latitude must be between -90 and 90'),
  lng: z.coerce
    .number()
    .min(-180, 'Longitude must be between -180 and 180')
    .max(180, 'Longitude must be between -180 and 180'),
  reporterName: z.string().optional(),
  reporterContact: z.string().optional(),
  imageUrl: z.string().optional(),
  consent: z.literal(true, {
    message: 'You must acknowledge the emergency safety disclaimer and accuracy statement.',
  }),
});

export type IncidentReportFormData = z.infer<typeof incidentReportSchema>;

export const resourceCreationSchema = z.object({
  name: z.string().min(3, 'Resource name must be at least 3 characters').max(80),
  type: z.enum([
    'FIRST_AID_VOLUNTEER',
    'MEDICAL_SUPPORT_TEAM',
    'RESCUE_TEAM',
    'TRANSPORT_UNIT',
    'SUPPLY_DISTRIBUTION',
    'FIRE_HAZMAT',
  ]),
  skills: z.string().min(3, 'Please list at least one skill or capability (comma separated)'),
  serviceArea: z.string().min(3, 'Service area or zone is required'),
  capacity: z.coerce.number().min(1, 'Capacity must be at least 1 person/unit').max(100),
  contactPerson: z.string().min(3, 'Contact lead name is required'),
  contactPhone: z.string().min(7, 'Valid contact phone number is required'),
});

export type ResourceCreationFormData = z.infer<typeof resourceCreationSchema>;
