/**
 * Migration: Create Users Table with Row Level Security
 *
 * PURPOSE: Store custom user metadata (role, full_name, etc.)
 * LINKED TO: auth.users table (Supabase Auth manages passwords/emails)
 *
 * IMPORTANT: This table is separate from auth.users
 * - auth.users: Managed by Supabase (authentication)
 * - public.users: Managed by us (authorization/metadata)
 *
 * Created: 2026-02-02
 * Author: Set Life Casting Team
 */

-- ============================================================================
-- STEP 1: Create the users table
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.users (
  -- Primary key: Same as auth.users.id
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,

  -- User information
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'talent')),
  full_name text,

  -- Timestamps
  created_at timestamp with time zone DEFAULT now() NOT NULL,
  updated_at timestamp with time zone DEFAULT now() NOT NULL
);

-- ============================================================================
-- STEP 2: Create indexes for performance
-- ============================================================================

-- Index for role-based queries (used by middleware)
CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);

-- Index for email lookups (if needed)
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users(email);

-- ============================================================================
-- STEP 3: Enable Row Level Security (RLS)
-- ============================================================================

-- Enable RLS on the users table
-- This means ALL queries will be filtered by RLS policies
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 4: Create RLS Policies
-- ============================================================================

/**
 * POLICY 1: Users can read their own data
 *
 * Allows: SELECT where auth.uid() = id
 * Use case: User viewing their own profile
 */
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

/**
 * POLICY 2: Users can update their own data (except role)
 *
 * Allows: UPDATE where auth.uid() = id
 * Prevents: Changing own role (handled by WITH CHECK)
 * Use case: User updating their profile
 */
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (
    -- Prevent users from changing their own role
    role = (SELECT role FROM public.users WHERE id = auth.uid())
  );

/**
 * POLICY 3: Admins can read all users
 *
 * Allows: SELECT if current user is admin
 * Use case: Admin viewing user list, checking permissions
 */
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

/**
 * POLICY 4: Service role can do anything
 *
 * Note: Service role bypasses RLS automatically
 * This policy is just for documentation
 * Used for: User creation during signup, admin operations
 */

-- ============================================================================
-- STEP 5: Create trigger for updated_at
-- ============================================================================

/**
 * Function: update_updated_at_column()
 *
 * PURPOSE: Automatically update updated_at timestamp
 * TRIGGERED: Before any UPDATE on public.users
 */
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger that calls the function
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- STEP 6: Grant permissions
-- ============================================================================

-- Allow authenticated users to insert (for signup)
-- Note: RLS policies still apply
GRANT SELECT, INSERT, UPDATE ON public.users TO authenticated;

-- Allow service role full access (bypasses RLS)
GRANT ALL ON public.users TO service_role;

-- ============================================================================
-- VERIFICATION QUERIES (Run these after migration to test)
-- ============================================================================

/**
 * Test 1: Check table exists
 * Expected: Table public.users exists with correct columns
 */
-- SELECT * FROM information_schema.tables WHERE table_name = 'users';

/**
 * Test 2: Check RLS is enabled
 * Expected: relrowsecurity = true
 */
-- SELECT relrowsecurity FROM pg_class WHERE relname = 'users';

/**
 * Test 3: List all policies
 * Expected: 3 policies (read own, update own, admin read all)
 */
-- SELECT policyname, cmd, qual FROM pg_policies WHERE tablename = 'users';

/**
 * Test 4: Check trigger exists
 * Expected: update_users_updated_at trigger exists
 */
-- SELECT trigger_name FROM information_schema.triggers WHERE event_object_table = 'users';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

/**
 * What was created:
 * ✓ public.users table with id, email, role, full_name
 * ✓ Indexes on role and email
 * ✓ Row Level Security enabled
 * ✓ 3 RLS policies (read own, update own, admin read all)
 * ✓ Auto-update trigger for updated_at
 * ✓ Proper permissions granted
 *
 * Next steps:
 * 1. Run this migration in Supabase SQL editor
 * 2. Test by creating a user manually
 * 3. Verify RLS policies work correctly
 */
