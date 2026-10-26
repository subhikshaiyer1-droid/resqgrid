-- ==============================================================================
-- ResQGrid — Smart Emergency Coordination Platform
-- Schema Migration: 20260101000000_resqgrid_schema.sql
-- PostgreSQL / Supabase Schema with Row Level Security (RLS)
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUM TYPES
CREATE TYPE user_role AS ENUM (
  'REPORTER',
  'VOLUNTEER',
  'COORDINATOR',
  'ADMINISTRATOR'
);

CREATE TYPE severity_level AS ENUM (
  'CRITICAL',
  'HIGH',
  'MEDIUM',
  'LOW'
);

CREATE TYPE incident_category AS ENUM (
  'ROAD_ACCIDENT',
  'MEDICAL_EMERGENCY',
  'FIRE_OUTBREAK',
  'FLOODING',
  'BLOCKED_ROAD',
  'MISSING_PERSON',
  'PUBLIC_SAFETY'
);

CREATE TYPE incident_status AS ENUM (
  'REPORTED',
  'UNDER_REVIEW',
  'VERIFIED',
  'ASSIGNED',
  'IN_PROGRESS',
  'RESOLVED',
  'REJECTED',
  'DUPLICATE'
);

CREATE TYPE resource_type AS ENUM (
  'FIRST_AID_VOLUNTEER',
  'MEDICAL_SUPPORT_TEAM',
  'RESCUE_TEAM',
  'TRANSPORT_UNIT',
  'SUPPLY_DISTRIBUTION',
  'FIRE_HAZMAT'
);

CREATE TYPE resource_status AS ENUM (
  'AVAILABLE',
  'DISPATCHED',
  'OFF_DUTY',
  'MAINTENANCE'
);

-- 2. USER PROFILES
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'REPORTER',
  badge_number TEXT,
  department TEXT,
  phone TEXT,
  avatar_url TEXT,
  assigned_resource_id TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. RESOURCES & RESPONSE FLEET
CREATE TABLE IF NOT EXISTS public.resources (
  id TEXT PRIMARY KEY, -- e.g. 'RES-MED-01'
  name TEXT NOT NULL,
  type resource_type NOT NULL,
  status resource_status NOT NULL DEFAULT 'AVAILABLE',
  skills TEXT[] NOT NULL DEFAULT '{}',
  service_area TEXT NOT NULL,
  capacity INTEGER NOT NULL DEFAULT 1 CHECK (capacity >= 1),
  contact_person TEXT NOT NULL,
  contact_phone TEXT NOT NULL,
  current_incident_id TEXT,
  base_lat DOUBLE PRECISION,
  base_lng DOUBLE PRECISION,
  base_address TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 4. INCIDENTS
CREATE TABLE IF NOT EXISTS public.incidents (
  id TEXT PRIMARY KEY, -- e.g. 'RESQ-2026-1042'
  title TEXT NOT NULL CHECK (char_length(title) >= 5),
  category incident_category NOT NULL,
  severity severity_level NOT NULL,
  status incident_status NOT NULL DEFAULT 'REPORTED',
  description TEXT NOT NULL CHECK (char_length(description) >= 15),
  affected_count INTEGER NOT NULL DEFAULT 0 CHECK (affected_count >= 0),
  location_name TEXT NOT NULL,
  latitude DOUBLE PRECISION NOT NULL CHECK (latitude >= -90 AND latitude <= 90),
  longitude DOUBLE PRECISION NOT NULL CHECK (longitude >= -180 AND longitude <= 180),
  reporter_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  reporter_name TEXT,
  reporter_contact TEXT,
  image_url TEXT,
  priority_score INTEGER NOT NULL DEFAULT 50 CHECK (priority_score >= 0 AND priority_score <= 100),
  priority_tier TEXT NOT NULL DEFAULT 'P3',
  is_priority_overridden BOOLEAN NOT NULL DEFAULT FALSE,
  override_reason TEXT,
  verified_at TIMESTAMPTZ,
  verified_by TEXT,
  assigned_resource_id TEXT REFERENCES public.resources(id) ON DELETE SET NULL,
  assigned_resource_name TEXT,
  assigned_at TIMESTAMPTZ,
  resolved_at TIMESTAMPTZ,
  resolved_by TEXT,
  rejection_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. ASSIGNMENTS (Relationship & history between Incident and Resource)
CREATE TABLE IF NOT EXISTS public.assignments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  resource_id TEXT NOT NULL REFERENCES public.resources(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'ACTIVE' CHECK (status IN ('ACTIVE', 'COMPLETED', 'CANCELLED')),
  notes TEXT,
  assigned_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  completed_at TIMESTAMPTZ
);

-- 6. INCIDENT UPDATES & AUDIT TIMELINE
CREATE TABLE IF NOT EXISTS public.incident_updates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  incident_id TEXT NOT NULL REFERENCES public.incidents(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN ('CREATED', 'STATUS_CHANGE', 'ASSIGNMENT', 'NOTE', 'PRIORITY_OVERRIDE', 'VERIFIED', 'RESOLVED')),
  actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  actor_name TEXT NOT NULL,
  actor_role TEXT NOT NULL,
  description TEXT NOT NULL,
  previous_value TEXT,
  new_value TEXT,
  is_internal_note BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 7. NOTIFICATIONS
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('INFO', 'ALERT', 'ASSIGNMENT', 'VERIFICATION')),
  incident_id TEXT REFERENCES public.incidents(id) ON DELETE CASCADE,
  is_read BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 8. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_incidents_status ON public.incidents(status);
CREATE INDEX IF NOT EXISTS idx_incidents_severity ON public.incidents(severity);
CREATE INDEX IF NOT EXISTS idx_incidents_priority ON public.incidents(priority_score DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_created_at ON public.incidents(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_incidents_location ON public.incidents(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_resources_status ON public.resources(status);
CREATE INDEX IF NOT EXISTS idx_resources_type ON public.resources(type);
CREATE INDEX IF NOT EXISTS idx_updates_incident ON public.incident_updates(incident_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON public.notifications(user_id, is_read, created_at DESC);

-- 9. AUTOMATIC updated_at TRIGGER FUNCTION
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER update_profiles_modtime
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_incidents_modtime
  BEFORE UPDATE ON public.incidents
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE OR REPLACE TRIGGER update_resources_modtime
  BEFORE UPDATE ON public.resources
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- 10. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.incident_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Helper function to fetch requesting user's role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS user_role AS $$
  SELECT role FROM public.profiles WHERE id = auth.uid();
$$ LANGUAGE sql STABLE SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Incidents Policies
CREATE POLICY "Incidents are viewable by everyone"
  ON public.incidents FOR SELECT
  USING (true);

CREATE POLICY "Anyone (authenticated or anon) can report an incident"
  ON public.incidents FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Coordinators and Administrators can update incidents"
  ON public.incidents FOR UPDATE
  TO authenticated
  USING (
    public.get_current_user_role() IN ('COORDINATOR', 'ADMINISTRATOR')
    OR (auth.uid() = reporter_id AND status = 'REPORTED')
  );

CREATE POLICY "Administrators can delete incidents"
  ON public.incidents FOR DELETE
  TO authenticated
  USING (public.get_current_user_role() = 'ADMINISTRATOR');

-- Resources Policies
CREATE POLICY "Resources are viewable by all authenticated users"
  ON public.resources FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Coordinators and Administrators can manage resources"
  ON public.resources FOR ALL
  TO authenticated
  USING (public.get_current_user_role() IN ('COORDINATOR', 'ADMINISTRATOR'));

-- Incident Updates Policies
CREATE POLICY "Public updates are viewable by all"
  ON public.incident_updates FOR SELECT
  USING (
    is_internal_note = FALSE
    OR public.get_current_user_role() IN ('COORDINATOR', 'ADMINISTRATOR')
  );

CREATE POLICY "Authenticated users can post updates"
  ON public.incident_updates FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Notifications Policies
CREATE POLICY "Users view only their notifications"
  ON public.notifications FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can mark their notifications as read"
  ON public.notifications FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);
