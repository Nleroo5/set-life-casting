# Phase 2: Database Schema Setup

**Status**: Ready to Run
**Duration**: 30-45 minutes
**Created**: 2026-02-04

---

## 📋 What You're Setting Up

You're creating 5 new tables in Supabase to replace Firebase Firestore:

1. **profiles** - User profile data (bio, measurements, experience)
2. **photos** - Photo metadata (files stored in Supabase Storage)
3. **projects** - Production projects/shows
4. **roles** - Casting calls/opportunities
5. **submissions** - Talent applications to roles

---

## ✅ Step 1: Run Database Migrations

### 1.1: Go to Supabase SQL Editor

1. Open [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: **Set Life Casting**
3. Go to **SQL Editor** (left sidebar)

### 1.2: Run Migration 006 (Profiles)

1. Click **New query**
2. Open `/Users/nicolasleroo/Desktop/set-life-casting/supabase/migrations/006_create_profiles_schema.sql`
3. Copy the entire SQL file
4. Paste into Supabase SQL Editor
5. Click **Run** (green button)
6. **Expected**: "Success. No rows returned"

### 1.3: Run Migration 007 (Photos)

1. Click **New query**
2. Open `007_create_photos_schema.sql`
3. Copy and paste
4. Click **Run**
5. **Expected**: "Success. No rows returned"

### 1.4: Run Migration 008 (Casting)

1. Click **New query**
2. Open `008_create_casting_schema.sql`
3. Copy and paste
4. Click **Run**
5. **Expected**: "Success. No rows returned"

---

## ✅ Step 2: Verify Tables Were Created

### 2.1: Check Table Editor

1. Go to **Table Editor** (left sidebar)
2. You should see these tables:
   - ✓ users (already exists)
   - ✓ profiles (NEW)
   - ✓ photos (NEW)
   - ✓ projects (NEW)
   - ✓ roles (NEW)
   - ✓ submissions (NEW)

### 2.2: Check RLS Policies

1. Go to **Authentication** → **Policies**
2. Find each table and verify policies exist:

**profiles** should have 4 policies:
- Users can read own profile
- Users can insert own profile
- Users can update own profile
- Users can delete own profile

**photos** should have 4 policies:
- Users can read own photos
- Users can insert own photos
- Users can update own photos
- Users can delete own photos

**projects** should have 2 policies:
- Anyone can view active projects
- Authenticated users can view all projects

**roles** should have 2 policies:
- Anyone can view open roles
- Authenticated users can view all roles

**submissions** should have 4 policies:
- Users can read own submissions
- Users can insert own submissions
- Users can update own submissions
- Users can delete own submissions

---

## ✅ Step 3: Create Supabase Storage Bucket

### 3.1: Create "photos" Bucket

1. Go to **Storage** (left sidebar)
2. Click **New bucket**
3. Bucket name: `photos`
4. **Public bucket**: ✓ Yes (check this box)
   - This allows photos to have public URLs
   - Alternatively, use private bucket + signed URLs
5. Click **Create bucket**

### 3.2: Add Storage Policies

1. Click on the `photos` bucket
2. Go to **Policies** tab
3. Click **New policy**

**Policy 1: Upload Policy**
- Policy name: `Users can upload own photos`
- Allowed operation: **INSERT**
- Policy definition:
```sql
bucket_id = 'photos' AND
auth.uid()::text = (storage.foldername(name))[1]
```
- Click **Save**

**Policy 2: Delete Policy**
- Policy name: `Users can delete own photos`
- Allowed operation: **DELETE**
- Policy definition:
```sql
bucket_id = 'photos' AND
auth.uid()::text = (storage.foldername(name))[1]
```
- Click **Save**

**Policy 3: Read Policy** (if bucket is public)
- Policy name: `Anyone can view photos`
- Allowed operation: **SELECT**
- Policy definition:
```sql
bucket_id = 'photos'
```
- Click **Save**

---

## ✅ Step 4: Verification Checklist

Run this verification query in SQL Editor:

```sql
-- Check all tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN ('users', 'profiles', 'photos', 'projects', 'roles', 'submissions')
ORDER BY table_name;
```

**Expected**: 6 rows returned

```sql
-- Check RLS is enabled on all tables
SELECT tablename, relrowsecurity as "RLS Enabled"
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE nspname = 'public'
  AND relname IN ('users', 'profiles', 'photos', 'projects', 'roles', 'submissions')
ORDER BY relname;
```

**Expected**: All tables show `RLS Enabled = true`

```sql
-- Count policies per table
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
  AND tablename IN ('users', 'profiles', 'photos', 'projects', 'roles', 'submissions')
GROUP BY tablename
ORDER BY tablename;
```

**Expected**:
- photos: 4 policies
- profiles: 4 policies
- projects: 2 policies
- roles: 2 policies
- submissions: 4 policies
- users: 3 policies (from earlier migration)

---

## ✅ Step 5: Test Insert (Optional)

Test that you can insert data into the new tables:

```sql
-- Test: Insert a test profile
INSERT INTO public.profiles (
  user_id,
  first_name,
  last_name,
  email,
  city,
  state
) VALUES (
  (SELECT id FROM public.users LIMIT 1),  -- Use existing user ID
  'Test',
  'User',
  'test@example.com',
  'Atlanta',
  'GA'
) RETURNING *;
```

**Expected**: 1 row inserted successfully

**Then delete it:**
```sql
DELETE FROM public.profiles WHERE first_name = 'Test' AND last_name = 'User';
```

---

## 🎯 Success Criteria

Phase 2 is complete when:

- [x] All 6 tables exist in Supabase
- [x] RLS is enabled on all tables
- [x] All policies are created
- [x] Storage bucket "photos" exists
- [x] Storage policies are configured
- [x] Verification queries all pass

---

## 🚨 Common Issues

### Issue: "function update_updated_at_column does not exist"

**Solution**: The function was created in migration 001. If it's missing, run:

```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

### Issue: "relation public.users does not exist"

**Solution**: Migration 001 wasn't run. Go back and run the users table migration first.

### Issue: Storage policies not working

**Solution**:
1. Check bucket is PUBLIC (for public URLs) or PRIVATE (for signed URLs)
2. Verify policy syntax exactly matches examples above
3. Test with authenticated user (use JWT token in storage client)

---

## 📊 What's Next?

After Phase 2 is complete:

**Phase 3**: Data Migration Scripts
- Export existing Firebase data
- Transform to Supabase format
- Import into new tables
- Migrate photos from Firebase Storage to Supabase Storage

**Estimated time for Phase 3**: 6-8 hours

---

**When you've completed all steps above, let me know and we'll move to Phase 3!**
