/**
 * Migration 023: submissions only to open roles; populate profiles.age.
 *
 * From the 2026-09-06 live test of production:
 *   L-04  /casting/submit/<id> accepted a submission to a role whose status
 *         was 'closed'. Closed roles are hidden from /casting but their ids are
 *         readable by any talent (policy from 016), so the page check added in
 *         the same commit is backed by this trigger.
 *   L-07  profiles.age was never populated; the app now derives it from
 *         date_of_birth on every save, and this backfills existing rows.
 *
 * Idempotent. Run the VERIFICATION queries at the bottom afterwards.
 */

-- ============================================================================
-- 1. submissions: the role must be open
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_open_role_for_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  role_status text;
BEGIN
  SELECT status INTO role_status FROM public.roles WHERE id = NEW.role_id;
  IF role_status IS DISTINCT FROM 'open' THEN
    RAISE EXCEPTION 'This role is no longer accepting submissions.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_require_open_role ON public.submissions;
CREATE TRIGGER submissions_require_open_role
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_open_role_for_submission();

-- ============================================================================
-- 2. profiles.age: backfill from date_of_birth
-- ============================================================================
UPDATE public.profiles
   SET age = date_part('year', age(current_date, date_of_birth))::int
 WHERE date_of_birth IS NOT NULL
   AND age IS DISTINCT FROM date_part('year', age(current_date, date_of_birth))::int;

-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: trigger exists
--   SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.submissions'::regclass AND tgname = 'submissions_require_open_role';
--
-- V2: no profile with a date of birth lacks an age
--   SELECT count(*) FROM public.profiles WHERE date_of_birth IS NOT NULL AND age IS NULL;
--   -- expected: 0
--
-- NOTE on L-02 (dates of birth stored one day late by the old date picker):
-- rows saved before this deploy are most likely +1 day. This migration does NOT
-- shift them, because a row edited more than once may be +2 and a row entered by
-- an admin may be correct. If you want the one-day correction applied to every
-- row saved before 2026-09-06, run:
--   UPDATE public.profiles SET date_of_birth = date_of_birth - 1
--   WHERE date_of_birth IS NOT NULL AND updated_at < '2026-09-06';
-- and then re-run the age backfill above.
