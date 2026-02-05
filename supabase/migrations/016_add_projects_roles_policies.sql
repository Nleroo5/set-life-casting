/**
 * Migration 016: Add Admin Policies for Projects and Roles Tables
 *
 * PROBLEM: Admins getting 403 errors when accessing projects/roles
 * SOLUTION: Add full CRUD policies for admin users on projects and roles tables
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- PROJECTS TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Admins can read all projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can insert projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can update projects" ON public.projects;
DROP POLICY IF EXISTS "Admins can delete projects" ON public.projects;

-- Allow admins to SELECT (read) all projects
CREATE POLICY "Admins can read all projects"
  ON public.projects
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to INSERT (create) new projects
CREATE POLICY "Admins can insert projects"
  ON public.projects
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to UPDATE existing projects
CREATE POLICY "Admins can update projects"
  ON public.projects
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to DELETE projects
CREATE POLICY "Admins can delete projects"
  ON public.projects
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- ROLES TABLE POLICIES
-- ============================================================================

-- Drop existing policies if they exist (safe to re-run)
DROP POLICY IF EXISTS "Admins can read all roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can insert roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can update roles" ON public.roles;
DROP POLICY IF EXISTS "Admins can delete roles" ON public.roles;

-- Allow admins to SELECT (read) all roles
CREATE POLICY "Admins can read all roles"
  ON public.roles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to INSERT (create) new roles
CREATE POLICY "Admins can insert roles"
  ON public.roles
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to UPDATE existing roles
CREATE POLICY "Admins can update roles"
  ON public.roles
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- Allow admins to DELETE roles
CREATE POLICY "Admins can delete roles"
  ON public.roles
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1
      FROM public.users
      WHERE users.id = auth.uid()
        AND users.role = 'admin'
    )
  );

-- ============================================================================
-- PUBLIC ACCESS POLICIES (for casting calls page)
-- ============================================================================

-- Drop existing public policies if they exist
DROP POLICY IF EXISTS "Public can read active projects" ON public.projects;
DROP POLICY IF EXISTS "Public can read open roles" ON public.roles;

-- Allow public to read active, public projects
CREATE POLICY "Public can read active projects"
  ON public.projects
  FOR SELECT
  USING (
    status = 'active'
    AND is_public = true
  );

-- Allow public to read open roles from active projects
CREATE POLICY "Public can read open roles"
  ON public.roles
  FOR SELECT
  USING (
    status = 'open'
    AND EXISTS (
      SELECT 1
      FROM public.projects
      WHERE projects.id = roles.project_id
        AND projects.status = 'active'
        AND projects.is_public = true
    )
  );

-- ============================================================================
-- VERIFICATION QUERIES
-- ============================================================================

SELECT '=== PROJECTS POLICIES ===' as section;

SELECT
  policyname,
  cmd as operation,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'projects'
ORDER BY policyname;

SELECT '=== ROLES POLICIES ===' as section;

SELECT
  policyname,
  cmd as operation,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename = 'roles'
ORDER BY policyname;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Expected result: Should see 6 policies for each table
-- Projects: 4 admin policies + 1 public policy = 5 total
-- Roles: 4 admin policies + 1 public policy = 5 total
