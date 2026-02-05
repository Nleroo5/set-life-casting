-- Check Migration Status: Which parts are already done?

-- 1. Check if new columns exist
SELECT
  'Columns Check' as check_type,
  column_name,
  CASE
    WHEN column_name IS NOT NULL THEN '✅ EXISTS'
    ELSE '❌ MISSING'
  END as status
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'status', 'admin_tag', 'admin_notes',  -- Migration 009
    'hair_length', 'shirt_size', 'pant_waist', 'pant_inseam',  -- Migration 012
    'visible_tattoos', 'tattoos_description', 'facial_hair'  -- Migration 012
  )
ORDER BY column_name;

-- 2. Check if policies exist
SELECT
  'Policies Check' as check_type,
  policyname,
  tablename,
  '✅ EXISTS' as status
FROM pg_policies
WHERE schemaname = 'public'
  AND policyname IN (
    'Admins can update all profiles',
    'Admins can update all submissions',
    'Admins can read all profiles',
    'Admins can read all photos',
    'Admins can read all submissions'
  )
ORDER BY tablename, policyname;
