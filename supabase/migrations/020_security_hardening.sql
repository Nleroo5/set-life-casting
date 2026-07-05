/**
 * Migration 020: Security hardening — from the live login/DB QA audit (2026-07)
 *
 * Each fix below was PROVEN against the live database with integration tests:
 *   - Any authenticated user could set their own role to 'admin' (privilege escalation).
 *   - New signups landed in public.users with full_name = NULL (trigger dropped it).
 *   - Deleting an auth user left an orphaned public.users row.
 *
 * This migration is idempotent and safe to run in the Supabase SQL editor or via
 * `supabase db push`. Run the VERIFICATION queries at the bottom afterwards.
 */

-- ============================================================================
-- FIX 1 (CRITICAL): block users from changing their own role
-- ----------------------------------------------------------------------------
-- The existing "Users can update own data" policy has:
--     WITH CHECK ( role = (SELECT role FROM public.users WHERE id = auth.uid()) )
-- which is ineffective: the subquery re-reads the row being updated and sees the
-- NEW role, so the check is always true. Enforce with a BEFORE UPDATE trigger that
-- runs as the CALLER (security invoker) and rejects role changes from the
-- 'authenticated' role. service_role / postgres / supabase_auth_admin are unaffected,
-- so middleware (service role) and the dashboard can still manage roles.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.prevent_self_role_change()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.role IS DISTINCT FROM OLD.role AND current_user = 'authenticated' THEN
    RAISE EXCEPTION 'Changing your own role is not permitted';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_block_role_change ON public.users;
CREATE TRIGGER users_block_role_change
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_self_role_change();

-- ============================================================================
-- FIX 2: capture full_name from signup metadata
-- ----------------------------------------------------------------------------
-- The new-user handler (conventionally public.handle_new_user, created outside the
-- repo migrations) inserts id/email/role but not full_name. This CREATE OR REPLACE
-- updates that function's body in place; the existing AFTER INSERT trigger on
-- auth.users keeps calling it, so no trigger changes are needed.
--
-- NOTE: if your handler is named something OTHER than handle_new_user, this is a
-- harmless no-op — tell me the real name (see verification query V2) and I'll adjust.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, email, role, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'talent'),
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET email     = EXCLUDED.email,
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX 3: ensure public.users deletes cascade when the auth user is deleted
-- ----------------------------------------------------------------------------
-- Adaptively finds the existing FK (whatever its name), drops it, and re-adds it
-- with ON DELETE CASCADE. Safe to run repeatedly.
-- ============================================================================
DO $$
DECLARE fk_name text;
BEGIN
  SELECT conname INTO fk_name
  FROM pg_constraint
  WHERE conrelid = 'public.users'::regclass
    AND contype = 'f'
    AND confrelid = 'auth.users'::regclass
  LIMIT 1;

  IF fk_name IS NOT NULL THEN
    EXECUTE format('ALTER TABLE public.users DROP CONSTRAINT %I', fk_name);
  END IF;

  ALTER TABLE public.users
    ADD CONSTRAINT users_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: role-change guard trigger exists
--   SELECT tgname FROM pg_trigger WHERE tgrelid='public.users'::regclass AND tgname='users_block_role_change';
-- V2: confirm the new-user handler name + that it references full_name
--   SELECT p.proname, pg_get_functiondef(p.oid) LIKE '%full_name%' AS sets_full_name
--   FROM pg_trigger t JOIN pg_proc p ON p.oid=t.tgfoid
--   WHERE t.tgrelid='auth.users'::regclass;
-- V3: FK is ON DELETE CASCADE (confdeltype should be 'c')
--   SELECT conname, confdeltype FROM pg_constraint
--   WHERE conrelid='public.users'::regclass AND contype='f' AND confrelid='auth.users'::regclass;
