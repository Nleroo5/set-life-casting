/**
 * Migration 022: A profile cannot be completed or submitted without its
 * required photos (one headshot + one full body).
 *
 * From the 2026-09-03 database audit:
 *   - profiles.profile_complete could be set true with zero photos. The only
 *     check was a client-side alert in /profile/create.
 *   - /casting/submit skipped the photos step for anyone whose text sections
 *     were filled in, so a talent with no photos could submit for a role
 *     through the normal UI.
 *   - Deleting a headshot after completion left a "complete" profile with no
 *     photo. Photo replacement in the app is delete-then-upload, so deletes
 *     must not be blocked; instead the profile is un-completed and the final
 *     submit re-completes it once photos are back.
 *   - photos.profile_id was only linked after profile creation, and a failed
 *     link was swallowed. Admin screens load photos by profile_id, so those
 *     submissions showed no photo. The profile row exists from step 1, so
 *     the link can be made at insert time.
 *
 * Idempotent. Run the VERIFICATION queries at the bottom afterwards.
 */

-- ============================================================================
-- 1. The rule, in one place
-- ----------------------------------------------------------------------------
-- SECURITY DEFINER so the check sees the user's photos regardless of which
-- role fires the trigger or how photo RLS evolves. Reads only.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.user_has_required_photos(p_user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT
    EXISTS (SELECT 1 FROM public.photos WHERE user_id = p_user_id AND type = 'headshot')
    AND
    EXISTS (SELECT 1 FROM public.photos WHERE user_id = p_user_id AND type = 'fullbody');
$$;

-- ============================================================================
-- 2. profiles: profile_complete = true requires the photos
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_photos_before_complete()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.profile_complete IS TRUE
     AND NOT public.user_has_required_photos(NEW.user_id) THEN
    RAISE EXCEPTION 'A headshot and a full body photo are required before your profile can be completed.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS profiles_require_photos ON public.profiles;
CREATE TRIGGER profiles_require_photos
  BEFORE INSERT OR UPDATE OF profile_complete ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_photos_before_complete();

-- ============================================================================
-- 3. submissions: submitting for a role requires the photos
-- ----------------------------------------------------------------------------
-- This is the real "publish" moment — the point an admin sees the talent.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.enforce_photos_before_submission()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NOT public.user_has_required_photos(NEW.user_id) THEN
    RAISE EXCEPTION 'A headshot and a full body photo are required before you can submit for a role.'
      USING ERRCODE = 'check_violation';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS submissions_require_photos ON public.submissions;
CREATE TRIGGER submissions_require_photos
  BEFORE INSERT ON public.submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.enforce_photos_before_submission();

-- ============================================================================
-- 4. photos: losing a required photo un-completes the profile
-- ----------------------------------------------------------------------------
-- Fires after a delete, or after a photo's type/owner changes. SECURITY
-- DEFINER because the profile update must succeed whoever removed the photo.
-- ============================================================================
CREATE OR REPLACE FUNCTION public.uncomplete_profile_if_photos_missing()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF OLD.type IN ('headshot', 'fullbody')
     AND NOT public.user_has_required_photos(OLD.user_id) THEN
    UPDATE public.profiles
       SET profile_complete = false
     WHERE user_id = OLD.user_id
       AND profile_complete IS TRUE;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS photos_uncomplete_profile ON public.photos;
CREATE TRIGGER photos_uncomplete_profile
  AFTER DELETE OR UPDATE OF type, user_id ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.uncomplete_profile_if_photos_missing();

-- ============================================================================
-- 5. photos: link to the profile at insert time when the caller didn't
-- ============================================================================
CREATE OR REPLACE FUNCTION public.link_photo_to_profile()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.profile_id IS NULL THEN
    SELECT id INTO NEW.profile_id
      FROM public.profiles
     WHERE user_id = NEW.user_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS photos_link_profile ON public.photos;
CREATE TRIGGER photos_link_profile
  BEFORE INSERT ON public.photos
  FOR EACH ROW
  EXECUTE FUNCTION public.link_photo_to_profile();

-- ============================================================================
-- 6. Bring existing rows in line with the rule
-- ============================================================================
-- Link any photo that was uploaded but never linked (its profile exists now).
UPDATE public.photos ph
   SET profile_id = pr.id
  FROM public.profiles pr
 WHERE ph.profile_id IS NULL
   AND pr.user_id = ph.user_id;

-- Un-complete any profile marked complete without its required photos.
UPDATE public.profiles
   SET profile_complete = false
 WHERE profile_complete IS TRUE
   AND NOT public.user_has_required_photos(user_id);

-- ============================================================================
-- VERIFICATION QUERIES (run after applying)
-- ============================================================================
-- V1: all four triggers exist
--   SELECT tgrelid::regclass AS "table", tgname FROM pg_trigger
--   WHERE tgname IN ('profiles_require_photos','submissions_require_photos','photos_uncomplete_profile','photos_link_profile')
--   ORDER BY 1, 2;
--   -- expected: 4 rows
--
-- V2: no complete profile lacks its photos
--   SELECT count(*) FROM public.profiles
--   WHERE profile_complete AND NOT public.user_has_required_photos(user_id);
--   -- expected: 0
--
-- V3: no unlinked photo whose profile exists
--   SELECT count(*) FROM public.photos ph JOIN public.profiles pr ON pr.user_id = ph.user_id
--   WHERE ph.profile_id IS NULL;
--   -- expected: 0
--
-- V4: existing submissions from talent with no required photos (informational —
--     these predate the rule; the trigger only guards new inserts)
--   SELECT s.id, u.email, s.submitted_at FROM public.submissions s
--   JOIN public.users u ON u.id = s.user_id
--   WHERE NOT public.user_has_required_photos(s.user_id)
--   ORDER BY s.submitted_at DESC;
