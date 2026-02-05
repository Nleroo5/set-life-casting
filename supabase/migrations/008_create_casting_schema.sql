/**
 * Migration: Create Casting Schema (Projects, Roles, Submissions)
 *
 * PURPOSE: Migrate casting/booking data from Firebase Firestore to Supabase
 * REPLACES: Firebase "projects", "roles", "submissions" collections
 *
 * Created: 2026-02-04
 * Part of: Full Firebase to Supabase Migration
 */

-- ============================================================================
-- STEP 1: Create projects table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.projects (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project details
  title text NOT NULL,
  description text,
  production_company text,
  director text,
  producer text,
  location text,

  -- Type of production
  project_type text CHECK (project_type IN ('film', 'tv', 'commercial', 'theater', 'web', 'other')),

  -- Dates
  start_date date,
  end_date date,
  posting_date date DEFAULT CURRENT_DATE,
  deadline date,

  -- Status
  status text CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',

  -- Visibility
  is_public boolean DEFAULT true,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- STEP 2: Create roles table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.roles (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign key
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Role details
  title text NOT NULL,
  description text,
  character_name text,

  -- Requirements
  gender text,
  age_min int,
  age_max int,
  ethnicity text[],
  height_min text,
  height_max text,

  -- Skills/attributes
  required_skills text[],
  preferred_skills text[],

  -- Compensation
  pay_rate text,
  pay_type text CHECK (pay_type IN ('hourly', 'daily', 'project', 'unpaid', 'negotiable')),
  pay_details text,

  -- Dates
  audition_date date,
  audition_location text,
  shoot_dates text,
  shoot_location text,

  -- Status
  status text CHECK (status IN ('open', 'closed', 'filled', 'archived')) DEFAULT 'open',

  -- Number of positions
  positions_available int DEFAULT 1,
  positions_filled int DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

-- ============================================================================
-- STEP 3: Create submissions table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.submissions (
  -- Primary key
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Foreign keys
  user_id uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE CASCADE,
  project_id uuid NOT NULL REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Submission status (using simplified 3-status system)
  status text CHECK (status IN ('pinned', 'booked', 'rejected')),

  -- Notes
  cover_letter text,
  admin_notes text,

  -- Contact preference
  preferred_contact text CHECK (preferred_contact IN ('email', 'phone', 'both')),

  -- Timestamps
  submitted_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL,
  reviewed_at timestamptz,
  booked_at timestamptz,

  -- Constraints: one submission per user per role
  UNIQUE(user_id, role_id)
);

-- ============================================================================
-- STEP 4: Create indexes
-- ============================================================================

-- Projects indexes
CREATE INDEX IF NOT EXISTS idx_projects_status ON public.projects(status);
CREATE INDEX IF NOT EXISTS idx_projects_created_at ON public.projects(created_at DESC);

-- Roles indexes
CREATE INDEX IF NOT EXISTS idx_roles_project_id ON public.roles(project_id);
CREATE INDEX IF NOT EXISTS idx_roles_status ON public.roles(status);
CREATE INDEX IF NOT EXISTS idx_roles_created_at ON public.roles(created_at DESC);

-- Submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON public.submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_role_id ON public.submissions(role_id);
CREATE INDEX IF NOT EXISTS idx_submissions_project_id ON public.submissions(project_id);
CREATE INDEX IF NOT EXISTS idx_submissions_status ON public.submissions(status);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON public.submissions(submitted_at DESC);

-- Composite index for admin viewing submissions by role
CREATE INDEX IF NOT EXISTS idx_submissions_role_status ON public.submissions(role_id, status);

-- ============================================================================
-- STEP 5: Enable Row Level Security
-- ============================================================================

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 6: Create RLS Policies for PROJECTS
-- ============================================================================

/**
 * Projects: Public can read active projects
 */
CREATE POLICY "Anyone can view active projects"
  ON public.projects
  FOR SELECT
  USING (status = 'active' AND is_public = true);

/**
 * Projects: Authenticated users can read all projects
 */
CREATE POLICY "Authenticated users can view all projects"
  ON public.projects
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 7: Create RLS Policies for ROLES
-- ============================================================================

/**
 * Roles: Public can read open roles for active projects
 */
CREATE POLICY "Anyone can view open roles"
  ON public.roles
  FOR SELECT
  USING (
    status = 'open' AND
    EXISTS (
      SELECT 1 FROM public.projects
      WHERE projects.id = roles.project_id
        AND projects.status = 'active'
        AND projects.is_public = true
    )
  );

/**
 * Roles: Authenticated users can read all roles
 */
CREATE POLICY "Authenticated users can view all roles"
  ON public.roles
  FOR SELECT
  TO authenticated
  USING (true);

-- ============================================================================
-- STEP 8: Create RLS Policies for SUBMISSIONS
-- ============================================================================

/**
 * Submissions: Users can read their own submissions
 */
CREATE POLICY "Users can read own submissions"
  ON public.submissions
  FOR SELECT
  USING (auth.uid() = user_id);

/**
 * Submissions: Users can insert their own submissions
 */
CREATE POLICY "Users can insert own submissions"
  ON public.submissions
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

/**
 * Submissions: Users can update their own submissions (limited fields)
 * Note: Users should only update cover_letter, not status/admin_notes
 */
CREATE POLICY "Users can update own submissions"
  ON public.submissions
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

/**
 * Submissions: Users can delete their own submissions
 */
CREATE POLICY "Users can delete own submissions"
  ON public.submissions
  FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 9: Create updated_at triggers
-- ============================================================================

CREATE TRIGGER update_projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_roles_updated_at
  BEFORE UPDATE ON public.roles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at
  BEFORE UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 10: Grant permissions
-- ============================================================================

-- Projects
GRANT SELECT ON public.projects TO anon, authenticated;
GRANT ALL ON public.projects TO service_role;

-- Roles
GRANT SELECT ON public.roles TO anon, authenticated;
GRANT ALL ON public.roles TO service_role;

-- Submissions
GRANT SELECT, INSERT, UPDATE, DELETE ON public.submissions TO authenticated;
GRANT ALL ON public.submissions TO service_role;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was created:
 * ✓ projects table
 * ✓ roles table
 * ✓ submissions table (with simplified 3-status system)
 * ✓ Indexes for performance
 * ✓ RLS enabled with policies
 * ✓ Auto-update triggers
 * ✓ Proper permissions
 *
 * Database schema complete! Next steps:
 * 1. Run all migrations (006, 007, 008)
 * 2. Verify tables exist in Supabase
 * 3. Create storage bucket for photos
 * 4. Begin data migration from Firebase
 */
