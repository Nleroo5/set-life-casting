/**
 * Migration 017: Add 'vertical short' to project types
 *
 * CHANGE: Expand project_type CHECK constraint to include 'vertical short'
 * REASON: Support vertical short-form content (TikTok, Instagram Reels, YouTube Shorts, etc.)
 *
 * Created: 2026-02-05
 */

-- ============================================================================
-- ALTER PROJECT TYPE CONSTRAINT
-- ============================================================================

-- Drop existing constraint
ALTER TABLE public.projects
  DROP CONSTRAINT IF EXISTS projects_project_type_check;

-- Create new constraint with 'vertical short' added
ALTER TABLE public.projects
  ADD CONSTRAINT projects_project_type_check
  CHECK (project_type IN ('film', 'tv', 'commercial', 'theater', 'web', 'vertical short', 'other'));

-- ============================================================================
-- VERIFICATION QUERY
-- ============================================================================

-- Check that constraint was updated
SELECT
  conname AS constraint_name,
  pg_get_constraintdef(oid) AS constraint_definition
FROM pg_constraint
WHERE conname = 'projects_project_type_check';

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Expected result: Constraint should now include all types:
-- 'film', 'tv', 'commercial', 'theater', 'web', 'vertical short', 'other'
