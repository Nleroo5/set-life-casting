# Profile Fields Not Saving - Fix Summary

**Date:** 2026-02-05
**Issue:** Ethnicity, Height, Weight, Hair Length, Shirt Size, Pant measurements, Tattoos, and Facial Hair not saving

---

## 🚨 ROOT CAUSE

**7 profile fields were being silently dropped** during save because:
1. ❌ Database columns didn't exist
2. ❌ TypeScript interfaces were incomplete
3. ❌ Mapping functions weren't handling these fields

**Data Flow:**
```
Form Collects Data ✅
  ↓
User Hits Submit ✅
  ↓
handleSubmit() ✅
  ↓
createProfile() ✅
  ↓
mapProfileDataToRow() ❌ DROPS 7 FIELDS HERE!
  ↓
Database Insert ❌ Fields never reach database
```

---

## ✅ FIXES APPLIED

### 1. Database Migration Created ✅
**File:** `supabase/migrations/012_add_missing_profile_fields.sql`

Added 7 columns to profiles table:
- `hair_length` (text) - Hair length: Short, Medium, Long, Bald
- `shirt_size` (text) - Shirt size: S, M, L, XL, etc.
- `pant_waist` (int) - Pant waist in inches
- `pant_inseam` (int) - Pant inseam in inches
- `visible_tattoos` (boolean) - Has visible tattoos? (default: false)
- `tattoos_description` (text) - Description of tattoos
- `facial_hair` (text) - Facial hair type: Clean Shaven, Mustache, Beard, Goatee

---

### 2. TypeScript Interfaces Updated ✅
**File:** `src/lib/supabase/profiles.ts`

**Updated Appearance interface:**
```typescript
export interface Appearance {
  // ... existing fields
  hairLength?: string  // ✅ ADDED
}
```

**Updated Sizes interface:**
```typescript
export interface Sizes {
  // ... existing fields
  shirtSize?: string   // ✅ ADDED
  pantWaist?: number   // ✅ ADDED
  pantInseam?: number  // ✅ ADDED
}
```

**Updated Details interface:**
```typescript
export interface Details {
  visibleTattoos?: boolean       // ✅ ADDED
  tattoosDescription?: string    // ✅ ADDED
  facialHair?: string            // ✅ ADDED
  // ... existing fields
}
```

**Updated ProfileRow interface:**
- Added all 7 database column names

---

### 3. Mapping Functions Updated ✅
**File:** `src/lib/supabase/profiles.ts`

**Updated mapProfileDataToRow():**
```typescript
// Appearance mapping
if (data.appearance.hairLength !== undefined)
  row.hair_length = data.appearance.hairLength || null  // ✅ ADDED

// Sizes mapping
if (data.sizes.shirtSize !== undefined)
  row.shirt_size = data.sizes.shirtSize || null  // ✅ ADDED
if (data.sizes.pantWaist !== undefined)
  row.pant_waist = data.sizes.pantWaist || null  // ✅ ADDED
if (data.sizes.pantInseam !== undefined)
  row.pant_inseam = data.sizes.pantInseam || null  // ✅ ADDED

// Details mapping
if (data.details.visibleTattoos !== undefined)
  row.visible_tattoos = data.details.visibleTattoos ?? null  // ✅ ADDED
if (data.details.tattoosDescription !== undefined)
  row.tattoos_description = data.details.tattoosDescription || null  // ✅ ADDED
if (data.details.facialHair !== undefined)
  row.facial_hair = data.details.facialHair || null  // ✅ ADDED
```

**Updated mapRowToProfileData():**
- Added reverse mappings for all 7 fields
- Ensures data reads back correctly from database

---

## 📋 WHAT YOU NEED TO DO

### STEP 1: Run Database Migration (REQUIRED)

Go to your Supabase Dashboard:

1. Navigate to: https://supabase.com/dashboard
2. Select project: **set-life-casting**
3. Click **SQL Editor** in sidebar
4. Click **New Query**
5. Copy/paste entire file: `supabase/migrations/012_add_missing_profile_fields.sql`
6. Click **Run** (or Cmd+Enter / Ctrl+Enter)
7. Should see: "Success. No rows returned"

### STEP 2: Verify Columns Were Created

In SQL Editor, run this verification query:

```sql
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'profiles'
  AND column_name IN (
    'hair_length',
    'shirt_size',
    'pant_waist',
    'pant_inseam',
    'visible_tattoos',
    'tattoos_description',
    'facial_hair'
  )
ORDER BY column_name;
```

You should see 7 rows returned with all the new columns.

### STEP 3: Test Profile Creation

1. Go to http://localhost:3002
2. Create or edit a profile
3. Fill in ALL fields:
   - Ethnicity
   - Height
   - Weight
   - Hair Length
   - Shirt Size
   - Pant Waist
   - Pant Inseam
   - Tattoos (Yes/No + Description)
   - Facial Hair
4. Submit profile
5. Refresh page and verify ALL fields are still there

---

## 🎯 EXPECTED RESULTS

### Before Fix:
- ❌ 7 fields collected but dropped
- ❌ Data lost on save
- ❌ Fields empty after page refresh

### After Fix:
- ✅ All 7 fields save to database
- ✅ Data persists across sessions
- ✅ Profile complete and accurate

---

## 📊 Fields Status Table

| Field | Form Step | Database Column | Status |
|-------|-----------|-----------------|--------|
| Hair Length | Appearance | `hair_length` | ✅ Fixed |
| Shirt Size | Sizes | `shirt_size` | ✅ Fixed |
| Pant Waist | Sizes | `pant_waist` | ✅ Fixed |
| Pant Inseam | Sizes | `pant_inseam` | ✅ Fixed |
| Visible Tattoos | Details | `visible_tattoos` | ✅ Fixed |
| Tattoo Description | Details | `tattoos_description` | ✅ Fixed |
| Facial Hair | Details | `facial_hair` | ✅ Fixed |

---

## 📝 Files Modified

### Created:
- `supabase/migrations/012_add_missing_profile_fields.sql` - Database migration

### Updated:
- `src/lib/supabase/profiles.ts` - Interfaces and mapping functions

### Not Modified (Working Correctly):
- Form components (already collecting data correctly)
- Form schemas (already validating correctly)
- Profile creation page (already submitting correctly)

---

## ✅ Completion Checklist

- [x] Database migration created
- [x] TypeScript interfaces updated
- [x] Mapping functions updated (save)
- [x] Mapping functions updated (load)
- [x] Code compiles successfully
- [ ] **Database migration run in Supabase** ← YOU NEED TO DO THIS
- [ ] **Test profile creation** ← VERIFY IT WORKS

---

**Status:** Code changes complete. Waiting for you to run the database migration in Supabase.
