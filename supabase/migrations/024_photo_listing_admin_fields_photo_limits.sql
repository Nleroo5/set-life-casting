/**
 * Migration 024: stop anonymous photo listing, protect admin-only fields,
 * cap photos per user, store a role's reference image.
 *
 * From the 2026-11-14 audit of production:
 *   S-01  Anyone holding the public anon key could LIST the whole `photos`
 *         bucket (74 talent folders, 402 files) and download every photo.
 *         Policy "Anyone can view photos" (011) gave SELECT on every object
 *         to every role. A public bucket serves its files by URL without any
 *         SELECT policy; what that policy added was listing for everyone
 *         (and the SELECT an owner needs to delete their own file, which the
 *         narrower policies below keep).
 *   S-02  "Users can update own profile" (006) has no column restriction, so
 *         a talent could change their own admin_tag, admin_notes and status
 *         (un-archive themselves, tag themselves green).
 *   S-03  "Users can update own submission cover letter" (010) has no column
 *         restriction either: a talent could mark their own submission
 *         'booked' and appear on a skin, or insert one already booked.
 *   D-01  The 8-photo limit (1 headshot, 1 full body, 6 additional) existed
 *         only in the upload form.
 *   F-01  The admin form uploads a reference image per role, but there was no
 *         column to keep it in and no policy allowing the upload.
 *
 * Idempotent: safe to run more than once.
 *
 * HOW TO RUN (Supabase dashboard > SQL Editor):
 *   - Paste the WHOLE file and run it with nothing selected (if text is
 *     selected, only the selection runs).
 *   - The editor asks you to confirm because the file drops policies. That is
 *     expected.
 *   - If it stops with "Stopped before changing anything", nothing was
 *     changed: the message lists a storage policy this file does not know
 *     about. Send that message back before going further.
 *   - When it succeeds, the result grid shows the storage policies now in
 *     place (see the last statement).
 */

-- ============================================================================
-- 0. Safety check: no surprises on storage.objects
-- ----------------------------------------------------------------------------
-- The bucket and its first policies were created by hand, so production may
-- hold a policy the repo has never seen. Any SELECT or ALL policy on
-- storage.objects can grant read (and therefore listing) access, and dropping
-- one blind could break something else. So: if anything other than the known
-- names exists, stop and report it instead of guessing.
-- ============================================================================
DO $$
DECLARE
  unexpected text;
BEGIN
  SELECT string_agg(
           format('%I  [%s, roles %s]  USING %s', policyname, cmd, roles::text, coalesce(qual, '(none)')),
           E'\n')
    INTO unexpected
    FROM pg_policies
   WHERE schemaname = 'storage'
     AND tablename = 'objects'
     AND cmd IN ('SELECT', 'ALL')
     AND policyname NOT IN (
       'Anyone can view photos',
       'Users can read own photo files',
       'Admins can read all photo files'
     );

  IF unexpected IS NOT NULL THEN
    RAISE EXCEPTION E'Stopped before changing anything. Storage policies this migration does not know about can also grant read access:\n%', unexpected;
  END IF;
END;
$$;

-- ============================================================================
-- 1. Storage: no more listing of the photos bucket
-- ----------------------------------------------------------------------------
-- Existing photo URLs (/storage/v1/object/public/photos/...) keep working: a
-- public bucket does not consult RLS for downloads by URL. What goes away is
-- the ability to enumerate folders and files.
--
-- The app still needs to read its own objects: storage `remove()` selects the
-- object before deleting it, so owners keep SELECT on their own folder. The
-- narrow policies are created before the broad one is dropped, so there is no
-- moment at which an owner cannot delete their own photo.
-- ============================================================================
DROP POLICY IF EXISTS "Users can read own photo files" ON storage.objects;
CREATE POLICY "Users can read own photo files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

DROP POLICY IF EXISTS "Admins can read all photo files" ON storage.objects;
CREATE POLICY "Admins can read all photo files"
  ON storage.objects
  FOR SELECT
  TO authenticated
  USING (
    bucket_id = 'photos'
    AND EXISTS (
      SELECT 1
        FROM public.users
       WHERE users.id = auth.uid()
         AND users.role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- ============================================================================
-- 2. profiles: admin_tag, admin_notes and status belong to admins
-- ----------------------------------------------------------------------------
-- RLS cannot restrict columns, so a trigger puts back whatever a non-admin
-- tries to write. It restores rather than raises so an ordinary profile save
-- that happens to carry these columns still succeeds.
--
-- Trusted callers are the service role, the SQL editor and migrations: they
-- carry no user id. A request from the API as `anon` or `authenticated`
-- without a user id is NOT trusted, so this does not depend on which write
-- policies exist for anon.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
BEGIN
  IF auth.uid() IS NULL AND coalesce(jwt_role, '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := 'active';
    NEW.admin_tag := NULL;
    NEW.admin_notes := NULL;
  ELSE
    NEW.status := OLD.status;
    NEW.admin_tag := OLD.admin_tag;
    NEW.admin_notes := OLD.admin_notes;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_protect_admin_fields ON public.profiles;
CREATE TRIGGER profiles_protect_admin_fields
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_admin_fields();

-- A talent could otherwise get round the trigger by deleting their profile and
-- creating a new one (which starts active, untagged, with no notes). No screen
-- lets a talent delete their profile; admins and the service role still can.
DROP POLICY IF EXISTS "Users can delete own profile" ON public.profiles;

-- ============================================================================
-- 3. submissions: review fields belong to admins
-- ----------------------------------------------------------------------------
-- A talent creates a submission as "new" and may edit their cover letter and
-- contact preference. Status, admin notes, the review timestamps and which
-- role/project/profile the submission points at are not theirs to change.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_submission_review_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
BEGIN
  IF auth.uid() IS NULL AND coalesce(jwt_role, '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  IF EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin') THEN
    RETURN NEW;
  END IF;

  IF TG_OP = 'INSERT' THEN
    NEW.status := NULL;
    NEW.admin_notes := NULL;
    NEW.reviewed_at := NULL;
    NEW.booked_at := NULL;
  ELSE
    NEW.status := OLD.status;
    NEW.admin_notes := OLD.admin_notes;
    NEW.reviewed_at := OLD.reviewed_at;
    NEW.booked_at := OLD.booked_at;
    NEW.user_id := OLD.user_id;
    NEW.profile_id := OLD.profile_id;
    NEW.role_id := OLD.role_id;
    NEW.project_id := OLD.project_id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_protect_review_fields ON public.submissions;
CREATE TRIGGER submissions_protect_review_fields
  BEFORE INSERT OR UPDATE ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_submission_review_fields();

-- Same bypass as for profiles: a rejected talent could delete the submission
-- and submit again as "new". No screen lets a talent delete a submission;
-- admins and the service role still can, and deleting a role or project still
-- removes its submissions.
DROP POLICY IF EXISTS "Users can delete own submissions" ON public.submissions;

-- ============================================================================
-- 4. photos: one headshot, one full body, six additional per user
-- ----------------------------------------------------------------------------
-- Checked when a signed-in user adds a photo row, and when one is re-typed or
-- moved to another user (otherwise six "additional" rows could be turned into
-- six headshots). Existing rows are not touched; an account that is already
-- over a limit must remove photos before it can add one of that type.
-- This limits rows in public.photos. It does not limit files in storage.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_photo_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  jwt_role text := nullif(current_setting('request.jwt.claims', true), '')::jsonb ->> 'role';
  existing_count integer;
  allowed integer;
BEGIN
  IF auth.uid() IS NULL AND coalesce(jwt_role, '') NOT IN ('anon', 'authenticated') THEN
    RETURN NEW;
  END IF;

  -- An update that keeps the type and the owner cannot push anything over a limit
  IF TG_OP = 'UPDATE'
     AND NEW.type IS NOT DISTINCT FROM OLD.type
     AND NEW.user_id IS NOT DISTINCT FROM OLD.user_id THEN
    RETURN NEW;
  END IF;

  allowed := CASE NEW.type WHEN 'headshot' THEN 1 WHEN 'fullbody' THEN 1 ELSE 6 END;

  SELECT count(*) INTO existing_count
    FROM public.photos
   WHERE user_id = NEW.user_id
     AND type = NEW.type
     AND id IS DISTINCT FROM NEW.id;

  IF existing_count >= allowed THEN
    RAISE EXCEPTION 'You already have the maximum number of % photos (%). Remove one before uploading another.',
      CASE NEW.type WHEN 'headshot' THEN 'headshot' WHEN 'fullbody' THEN 'full body' ELSE 'additional' END,
      allowed
      USING ERRCODE = 'check_violation';
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS photos_enforce_limits ON public.photos;
CREATE TRIGGER photos_enforce_limits
  BEFORE INSERT OR UPDATE OF type, user_id ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_photo_limits();

-- ============================================================================
-- 5. roles: keep the reference image the admin uploads
-- ----------------------------------------------------------------------------
-- The form uploads to photos/role-references/<file>. Talent uploads are
-- confined to their own <user id>/ folder (011), so admins need their own
-- INSERT policy for that folder.
-- ============================================================================
ALTER TABLE public.roles
  ADD COLUMN IF NOT EXISTS reference_image_url text;

DROP POLICY IF EXISTS "Admins can upload role reference files" ON storage.objects;
CREATE POLICY "Admins can upload role reference files"
  ON storage.objects
  FOR INSERT
  TO authenticated
  WITH CHECK (
    bucket_id = 'photos'
    AND (storage.foldername(name))[1] = 'role-references'
    AND EXISTS (
      SELECT 1
        FROM public.users
       WHERE users.id = auth.uid()
         AND users.role = 'admin'
    )
  );

-- Make the new column visible to the API straight away
NOTIFY pgrst, 'reload schema';

-- ============================================================================
-- RESULT: the policies now on storage.objects (shown in the editor's grid)
-- ----------------------------------------------------------------------------
-- Expected for SELECT / ALL: exactly "Admins can read all photo files" and
-- "Users can read own photo files". Any other SELECT or ALL row is a problem.
-- ============================================================================
SELECT policyname, cmd, roles::text AS roles
  FROM pg_policies
 WHERE schemaname = 'storage'
   AND tablename = 'objects'
 ORDER BY cmd, policyname;

-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: no SELECT or ALL policy on storage.objects other than the two new ones.
--   SELECT policyname, cmd, roles, qual FROM pg_policies
--    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd IN ('SELECT', 'ALL');
--   -- expected: "Users can read own photo files", "Admins can read all photo files"
--
-- V2: the three triggers exist.
--   SELECT tgrelid::regclass AS table, tgname FROM pg_trigger
--    WHERE tgname IN ('profiles_protect_admin_fields', 'submissions_protect_review_fields', 'photos_enforce_limits');
--   -- expected: 3 rows
--
-- V3: the column exists.
--   SELECT column_name FROM information_schema.columns
--    WHERE table_schema = 'public' AND table_name = 'roles' AND column_name = 'reference_image_url';
--   -- expected: 1 row
--
-- V4: accounts already over a photo limit (they cannot add that type until cleaned up).
--   SELECT user_id, type, count(*) FROM public.photos GROUP BY user_id, type
--   HAVING count(*) > CASE type WHEN 'portfolio' THEN 6 ELSE 1 END;
--
-- V5: talents can no longer delete their own profile or submission.
--   SELECT tablename, policyname FROM pg_policies
--    WHERE schemaname = 'public' AND tablename IN ('profiles', 'submissions') AND cmd = 'DELETE';
--   -- expected: no "Users can delete own ..." rows
--
-- From outside the database, with only the anon key:
--   POST /storage/v1/object/list/photos  {"prefix":"","limit":100}  -> []
--   GET  <any existing photo URL>                                   -> 200
--
-- ============================================================================
-- ROLLBACK (only if something goes wrong; this re-opens anonymous listing)
-- ============================================================================
--   DROP POLICY IF EXISTS "Users can read own photo files" ON storage.objects;
--   DROP POLICY IF EXISTS "Admins can read all photo files" ON storage.objects;
--   DROP POLICY IF EXISTS "Admins can upload role reference files" ON storage.objects;
--   DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;
--   CREATE POLICY "Anyone can view photos" ON storage.objects FOR SELECT USING (bucket_id = 'photos');
--   DROP TRIGGER IF EXISTS profiles_protect_admin_fields ON public.profiles;
--   DROP TRIGGER IF EXISTS submissions_protect_review_fields ON public.submissions;
--   DROP TRIGGER IF EXISTS photos_enforce_limits ON public.photos;
--   DROP FUNCTION IF EXISTS public.protect_profile_admin_fields();
--   DROP FUNCTION IF EXISTS public.protect_submission_review_fields();
--   DROP FUNCTION IF EXISTS public.enforce_photo_limits();
--   CREATE POLICY "Users can delete own profile" ON public.profiles FOR DELETE USING (auth.uid() = user_id);
--   CREATE POLICY "Users can delete own submissions" ON public.submissions FOR DELETE USING (auth.uid() = user_id);
-- Leave roles.reference_image_url in place: the app writes it.
