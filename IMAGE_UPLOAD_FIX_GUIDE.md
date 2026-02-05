# Image Upload Fix Guide

**Issue:** Images not saving when creating profile
**Root Cause:** Supabase storage bucket doesn't exist
**Status:** READY TO FIX

---

## ⚠️ CRITICAL: Before You Start

You MUST complete these steps in Supabase dashboard BEFORE the code will work.

---

## Step 1: Create Storage Bucket (REQUIRED)

### In Supabase Dashboard:

1. Go to https://supabase.com/dashboard
2. Select your project: **set-life-casting** (inhdjjrahvhrdkbkiogw)
3. Click **Storage** in the left sidebar
4. Click **New Bucket** button
5. Configure bucket:
   - **Name:** `photos` (MUST be exactly this)
   - **Public bucket:** Toggle ON (so URLs work without signing)
   - **File size limit:** 50MB (recommended)
   - **Allowed MIME types:** Leave empty or add: `image/jpeg, image/jpg, image/png, image/webp`
6. Click **Create bucket**

**Verification:** You should now see "photos" bucket in the Storage list

---

## Step 2: Deploy Storage Policies (REQUIRED)

### In Supabase Dashboard:

1. Go to **SQL Editor** (in left sidebar)
2. Click **New Query**
3. Copy and paste the ENTIRE contents of:
   ```
   supabase/migrations/011_create_storage_bucket_policies.sql
   ```
4. Click **Run** (or press Cmd+Enter / Ctrl+Enter)
5. Wait for "Success. No rows returned"

**Verification:**
- Go to **Storage** → **photos** bucket → **Policies** tab
- You should see 4 policies:
  - ✓ Users can upload own photos
  - ✓ Users can delete own photos
  - ✓ Anyone can view photos
  - ✓ Users can update own photos

---

## Step 3: Test Upload

1. Go to http://localhost:3002
2. Sign up or log in
3. Go to **Create Profile** → **Photos** step
4. Upload a headshot and full body photo
5. Check that photos appear in the preview
6. Submit the profile

**Verification:**
- Go to Supabase Dashboard → **Storage** → **photos** bucket
- You should see a folder named with your user ID
- Inside the folder, you should see your uploaded photos

---

## Step 4: Verify Photos Table

### In Supabase Dashboard:

1. Go to **Table Editor**
2. Select **photos** table
3. You should see rows with:
   - ✓ user_id matching your auth user
   - ✓ url pointing to storage
   - ✓ storage_path with correct path
   - ✓ type as 'headshot' or 'fullbody'

---

## Expected Results After Fix

### Before (Current State):
- ❌ Upload attempts fail silently
- ❌ No photos in storage bucket
- ❌ photos table has broken URLs
- ❌ Profile creation appears to succeed but images missing

### After (Fixed):
- ✅ Upload succeeds with retry logic
- ✅ Photos visible in Supabase Storage
- ✅ photos table has working URLs
- ✅ Photos display on dashboard and profile pages

---

## Technical Details

### Storage Structure:
```
photos/                           (bucket name)
  └── {user-id}/                  (folder per user)
      ├── headshot_1738777200.jpg (timestamped filename)
      ├── fullbody_1738777205.jpg
      └── portfolio_1738777210.jpg
```

### Security Model:
- **Upload:** Users can only upload to their own folder (`{user_id}/`)
- **Delete:** Users can only delete their own photos
- **View:** Anyone can view photos (public URLs work)
- **Database:** RLS policies prevent users from modifying others' photo records

### How Upload Works:
1. User selects photo in PhotosStep component
2. Image compressed to <1MB using browser-image-compression
3. Uploaded to Supabase Storage: `photos/{user_id}/filename.jpg`
4. Public URL retrieved and saved to photos table
5. Photo linked to profile after profile creation

---

## Troubleshooting

### Issue: "Storage bucket not found"
**Solution:** Complete Step 1 above - create the bucket

### Issue: "New row violates row-level security policy"
**Solution:** Complete Step 2 above - deploy storage policies

### Issue: Upload succeeds but photos don't display
**Check:**
1. Bucket is set to PUBLIC (not private)
2. URLs in photos table start with `https://inhdjjrahvhrdkbkiogw.supabase.co/storage/v1/object/public/photos/`
3. Browser console for CORS errors

### Issue: "403 Forbidden" when viewing photos
**Solution:**
- Make sure bucket is PUBLIC
- Or implement signed URLs in code

### Issue: Photos upload but profile submission fails
**Check:**
1. Profiles table exists (run migration 006)
2. Users table has your user record
3. Browser console for errors

---

## Files Modified

### Created:
- `supabase/migrations/011_create_storage_bucket_policies.sql` - Storage policies

### Existing (no changes needed):
- `src/components/casting/steps/PhotosStep.tsx` - Upload UI (working)
- `src/lib/supabase/photos.ts` - Storage operations (working, just needs bucket)
- `src/app/profile/create/page.tsx` - Photo linking (working)

---

## Optional Improvements (Not Required)

These can be done later if needed:

### 1. Add Error Feedback to User
Currently errors are logged but user doesn't see them. Could add:
- Toast notifications for upload errors
- Retry button that's more visible
- Progress indicators

### 2. Remove Old Firebase Storage Config
If you're not using Firebase anymore:
- Delete `storage.rules` file
- Remove Firebase storage env vars

### 3. Add Photo Health Check
On profile view, verify photos are accessible:
- Ping photo URLs before displaying
- Show placeholder if photo URL is broken
- Provide "re-upload" option

---

## Support

If issues persist after completing Steps 1-2:
1. Check browser console for errors
2. Check Supabase logs: Dashboard → Logs → Storage Logs
3. Verify environment variables are loaded (restart dev server)
4. Test with a fresh user account

---

**Last Updated:** 2026-02-05
**Status:** Waiting for manual bucket creation in Supabase dashboard
