/**
 * Migration 024: stop anonymous photo listing, protect admin-only fields,
 * cap photos per user, store a role's reference image.
 *
 * From the 2026-11-14 audit of production:
 *   S-01  Anyone holding the public anon key could LIST the whole `photos`
 *         bucket (74 talent folders, 402 files) and download every photo.
 *         Policy "Anyone can view photos" (011) gave SELECT on every object
 *         to every role. A public bucket serves its files by URL without any
 *         SELECT policy, so that policy only ever enabled listing.
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
 * Run the VERIFICATION queries at the bottom afterwards.
 */

-- ============================================================================
-- 1. Storage: no more listing of the photos bucket
-- ----------------------------------------------------------------------------
-- Existing photo URLs (/storage/v1/object/public/photos/...) keep working: a
-- public bucket does not consult RLS for downloads by URL. What goes away is
-- the ability to enumerate folders and files.
--
-- The app still needs to read its own objects: storage `remove()` selects the
-- object before deleting it, so owners keep SELECT on their own folder.
-- ============================================================================
DROP POLICY IF EXISTS "Anyone can view photos" ON storage.objects;

-- The bucket and its first policies were created by hand, so the broad policy
-- may exist under another name. Drop any other SELECT policy on the photos
-- bucket; the two created below are the only ones that should exist.
DO $$
DECLARE
  p record;
BEGIN
  FOR p IN
    SELECT policyname
      FROM pg_policies
     WHERE schemaname = 'storage'
       AND tablename = 'objects'
       AND cmd = 'SELECT'
       AND qual LIKE '%photos%'
       AND policyname NOT IN ('Users can read own photo files', 'Admins can read all photo files')
  LOOP
    EXECUTE format('DROP POLICY %I ON storage.objects', p.policyname);
    RAISE NOTICE 'Dropped storage SELECT policy: %', p.policyname;
  END LOOP;
END;
$$;

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

-- ============================================================================
-- 2. profiles: admin_tag, admin_notes and status belong to admins
-- ----------------------------------------------------------------------------
-- RLS cannot restrict columns, so a trigger puts back whatever a non-admin
-- tries to write. It restores rather than raises so an ordinary profile save
-- that happens to carry these columns still succeeds.
--
-- auth.uid() is NULL for the service role, the SQL editor and migrations;
-- those are trusted. (anon is also NULL, but has no write policy at all.)
-- ============================================================================
CREATE OR REPLACE FUNCTION public.protect_profile_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
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
BEGIN
  IF auth.uid() IS NULL THEN
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

-- ============================================================================
-- 4. photos: one headshot, one full body, six additional per user
-- ----------------------------------------------------------------------------
-- Applies to inserts made by signed-in users. Existing rows are not touched;
-- an account that is already over a limit must remove photos before it can
-- add one of that type.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_photo_limits()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  existing_count integer;
  allowed integer;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN NEW;
  END IF;

  allowed := CASE NEW.type WHEN 'headshot' THEN 1 WHEN 'fullbody' THEN 1 ELSE 6 END;

  SELECT count(*) INTO existing_count
    FROM public.photos
   WHERE user_id = NEW.user_id
     AND type = NEW.type;

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
  BEFORE INSERT ON public.photos
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
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: SELECT policies on the photos bucket. Expected: exactly the two below.
--   SELECT policyname, roles, qual FROM pg_policies
--    WHERE schemaname = 'storage' AND tablename = 'objects' AND cmd = 'SELECT';
--   -- "Users can read own photo files", "Admins can read all photo files"
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
-- From outside the database, with only the anon key:
--   POST /storage/v1/object/list/photos  {"prefix":"","limit":100}  -> []
--   GET  <any existing photo URL>                                   -> 200
