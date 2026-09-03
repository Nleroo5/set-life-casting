/**
 * Migration 021: Close the signup privilege-escalation path and bring the
 * new-user trigger into the repo.
 *
 * From the 2026-09-03 login/dashboard audit:
 *   F-01  handle_new_user() read `role` from raw_user_meta_data, which is
 *         client-supplied via supabase.auth.signUp({ options: { data } }).
 *         Anyone holding the public anon key could create an admin account.
 *   F-02  The AFTER INSERT trigger on auth.users that calls handle_new_user()
 *         existed only in the live database, not in any migration. A fresh
 *         environment built from this repo produced no public.users rows.
 *
 * Idempotent and safe to run in the Supabase SQL editor or via
 * `supabase db push`. Run the VERIFICATION queries at the bottom afterwards.
 */

-- ============================================================================
-- FIX 1 (CRITICAL): new accounts are always 'talent'
-- ----------------------------------------------------------------------------
-- Role is never read from signup metadata. Admins are promoted by an operator
-- using the service role, never by the account itself.
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
    'talent',
    NEW.raw_user_meta_data->>'full_name'
  )
  ON CONFLICT (id) DO UPDATE
    SET email     = EXCLUDED.email,
        full_name = COALESCE(public.users.full_name, EXCLUDED.full_name);
  RETURN NEW;
END;
$$;

-- ============================================================================
-- FIX 2: the auth.users trigger itself, so the repo can rebuild the database
-- ----------------------------------------------------------------------------
-- The live trigger was created outside migrations under an unknown name.
-- Drop every non-internal trigger on auth.users that calls handle_new_user
-- (whatever it is called), then create the canonical one.
-- ============================================================================
DO $$
DECLARE t record;
BEGIN
  FOR t IN
    SELECT tg.tgname
    FROM pg_trigger tg
    JOIN pg_proc p ON p.oid = tg.tgfoid
    WHERE tg.tgrelid = 'auth.users'::regclass
      AND NOT tg.tgisinternal
      AND p.proname = 'handle_new_user'
  LOOP
    EXECUTE format('DROP TRIGGER %I ON auth.users', t.tgname);
  END LOOP;
END $$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- ============================================================================
-- FIX 3: block direct client INSERTs with an elevated role
-- ----------------------------------------------------------------------------
-- The "Users can insert own user record" policy (003) only checks
-- auth.uid() = id, so a client could INSERT its own row with role = 'admin'
-- if the trigger above were ever missing. Force 'talent' for the
-- 'authenticated' role regardless of what the client sends. This is a BEFORE
-- INSERT trigger, so it also covers the INSERT half of the signup page's
-- upsert; the existing users_block_role_change (020) covers the UPDATE half.
-- service_role / postgres are unaffected.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.force_talent_role_on_insert()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF current_user = 'authenticated' THEN
    NEW.role := 'talent';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS users_force_talent_on_insert ON public.users;
CREATE TRIGGER users_force_talent_on_insert
  BEFORE INSERT ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.force_talent_role_on_insert();

-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: handle_new_user no longer references metadata role
--   SELECT pg_get_functiondef('public.handle_new_user'::regproc) LIKE '%raw_user_meta_data->>''role''%' AS still_reads_role;
--   -- expected: false
--
-- V2: exactly one trigger on auth.users calls handle_new_user, named on_auth_user_created
--   SELECT tg.tgname FROM pg_trigger tg JOIN pg_proc p ON p.oid = tg.tgfoid
--   WHERE tg.tgrelid = 'auth.users'::regclass AND NOT tg.tgisinternal AND p.proname = 'handle_new_user';
--
-- V3: insert guard exists
--   SELECT tgname FROM pg_trigger WHERE tgrelid = 'public.users'::regclass AND tgname = 'users_force_talent_on_insert';
--
-- V4: audit existing admins — every row here should be someone you recognise
--   SELECT id, email, full_name, created_at FROM public.users WHERE role = 'admin' ORDER BY created_at;
