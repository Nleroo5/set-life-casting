# Searchable Profiles Implementation

## Overview
This document explains the complete implementation of searchable profile data in Firebase Firestore, making it easy to find talent based on ANY physical attribute.

## Problem
Previously, profile data was scattered across multiple sections:
- `basicInfo` - Name, email, phone, city, state
- `appearance` - Gender, ethnicity, height, weight, hair, eyes, DOB
- `sizes` - Clothing sizes
- `details` - Tattoos, piercings, facial hair
- `photos` - Photo URLs

This made searching difficult because:
1. You had to query multiple nested fields
2. The skins export expected `physical.gender` but data was in `appearance.gender`
3. Booking snapshots didn't always have complete data
4. Firestore couldn't handle `undefined` values, causing sync issues

## Solution: Consolidated `physical` Field

### What We Built
A unified `physical` field that consolidates ALL searchable physical attributes into one place:

```typescript
physical: {
  // From appearance
  gender: "Male" | "Female" | string,
  ethnicity: ["Asian", "Pacific Islander"],
  height: "5'10\"",
  weight: 175,
  hairColor: "Black",
  hairLength: "Short",
  eyeColor: "Brown",
  dateOfBirth: "1990-01-15",

  // From sizes
  shirtSize: "L",
  pantsWaist: 32,
  pantsInseam: 32,
  dressSize: null,
  suitSize: "42R",
  shoeSize: "10.5",
  shoeSizeGender: "M",

  // From details
  visibleTattoos: false,
  tattoosDescription: null,
  piercings: false,
  piercingsDescription: null,
  facialHair: "Clean Shaven"
}
```

## Implementation Details

### 1. Profile Creation/Editing
**File:** `src/app/profile/create/page.tsx`

**Changes:**
- When users submit their profile, a consolidated `physical` field is automatically created
- When users edit their profile, the `physical` field is updated
- Auto-save during profile creation also updates the `physical` field
- All `undefined` values are replaced with `null` (Firestore requirement)

**Code:**
```typescript
const physical = {
  gender: formData.appearance?.gender || null,
  ethnicity: formData.appearance?.ethnicity || null,
  height: formData.appearance?.height || null,
  weight: formData.appearance?.weight || null,
  // ... all other fields
};

await setDoc(doc(db, "profiles", user.uid), {
  basicInfo: formData.basicInfo,
  appearance: formData.appearance,
  sizes: formData.sizes,
  details: formData.details,
  photos: finalPhotos,
  physical: physical, // ✅ NEW unified field
  updatedAt: new Date(),
}, { merge: true });
```

### 2. Skins Export Auto-Refresh
**File:** `src/app/admin/skins/page.tsx`

**Changes:**
- Added `sanitizeProfileData()` function to replace `undefined` with `null`
- Updated auto-refresh to use sanitized data
- Fixed useEffect dependency array to trigger properly when bookings load
- Enhanced logging to show gender and ethnicity values

**Code:**
```typescript
function sanitizeProfileData(profile: any): any {
  const sanitized = JSON.parse(JSON.stringify(profile, (key, value) => {
    return value === undefined ? null : value;
  }));

  // Ensure physical field exists
  if (!sanitized.physical) {
    sanitized.physical = {
      gender: null,
      ethnicity: null,
    };
  }

  return sanitized;
}
```

### 3. Migration Scripts

#### Profile Migration
**File:** `scripts/migrate-profiles-physical-field.ts`

**Purpose:** Add `physical` field to all existing profiles

**How to Run:**
```bash
npm run migrate:profiles
```

**What it does:**
- Reads all profiles from Firestore
- Creates consolidated `physical` field from appearance/sizes/details
- Updates each profile
- Logs progress with detailed output

#### Booking Migration
**File:** `scripts/migrate-bookings-physical-field.ts`

**Purpose:** Update booking snapshots with fresh profile data including `physical` field

**How to Run:**
```bash
npm run migrate:bookings
```

**What it does:**
- Reads all bookings
- Fetches current profile for each booking
- Sanitizes profile data (undefined → null)
- Updates booking's `talentProfile` snapshot
- Ensures gender/ethnicity appear in skins export

#### Run Both Migrations
```bash
npm run migrate:all
```

## Benefits

### 1. Easy Searching
Search for talent by ANY attribute with simple queries:

```typescript
// Find all female talent
const females = await getDocs(
  query(collection(db, "profiles"),
    where("physical.gender", "==", "Female"))
);

// Find talent with specific ethnicity
const asianTalent = await getDocs(
  query(collection(db, "profiles"),
    where("physical.ethnicity", "array-contains", "Asian"))
);

// Find talent by height range (requires composite index)
const tallTalent = await getDocs(
  query(collection(db, "profiles"),
    where("physical.height", ">=", "6'0\""),
    where("physical.height", "<=", "6'6\""))
);

// Find talent by size
const largeTalent = await getDocs(
  query(collection(db, "profiles"),
    where("physical.shirtSize", "==", "L"))
);
```

### 2. Correct Skins Export
- Gender and ethnicity now auto-populate correctly
- No more undefined values
- Booking snapshots stay fresh with auto-verification
- Manual refresh button for on-demand updates

### 3. Data Integrity
- All `undefined` values converted to `null`
- Firestore won't throw errors anymore
- Profile data syncs correctly across the app
- Booking snapshots reflect current profile data

## Setup Instructions

### Step 1: Download Firebase Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your project
3. Click gear icon → Project Settings
4. Go to "Service Accounts" tab
5. Click "Generate New Private Key"
6. Save as `firebase-service-account.json` in project root
7. **IMPORTANT:** Never commit this file (already in `.gitignore`)

### Step 2: Run Profile Migration

```bash
npm run migrate:profiles
```

This will add the `physical` field to all existing profiles.

### Step 3: Run Booking Migration

```bash
npm run migrate:bookings
```

This will update all booking snapshots with fresh profile data.

### Step 4: Verify in Firebase Console

1. Open Firestore in Firebase Console
2. Check a few profiles - they should have `physical` field
3. Check bookings - `talentProfile.physical` should exist with gender/ethnicity

### Step 5: Test Skins Export

1. Go to Admin → Skins
2. Select a project and roles
3. Select bookings
4. Click "Generate Skins Preview"
5. Verify gender and ethnicity columns are populated

## Future Enhancements

### Composite Indexes for Advanced Searching

Create these indexes in Firebase Console → Firestore → Indexes for efficient searching:

1. **Gender + Ethnicity Search**
   ```
   Collection: profiles
   Fields:
     - physical.gender (Ascending)
     - physical.ethnicity (Array-contains)
   ```

2. **Height Range by Gender**
   ```
   Collection: profiles
   Fields:
     - physical.gender (Ascending)
     - physical.height (Ascending)
   ```

3. **Size-Based Search**
   ```
   Collection: profiles
   Fields:
     - physical.shirtSize (Ascending)
     - physical.gender (Ascending)
   ```

4. **Multi-Attribute Search**
   ```
   Collection: profiles
   Fields:
     - physical.gender (Ascending)
     - physical.ethnicity (Array-contains)
     - physical.height (Ascending)
   ```

### Build Search Interface

Create an advanced search page where casting directors can filter talent by:
- Gender
- Ethnicity (multi-select)
- Height range (slider)
- Weight range (slider)
- Age range (calculated from DOB)
- Hair color/length
- Eye color
- Clothing sizes
- Tattoos/piercings
- Facial hair

### Search Results Export

Add ability to:
- Save search filters as "casting templates"
- Export search results to Excel
- Email search results to producers
- Create projects directly from search results

## Maintenance

### Ongoing Profile Updates
The system automatically maintains the `physical` field when:
- Users create new profiles
- Users edit existing profiles
- Auto-save occurs during multi-step profile creation

### Booking Snapshots
The skins export page automatically:
- Verifies booking data when page loads
- Detects missing or stale data
- Auto-refreshes booking snapshots
- Sanitizes all data (undefined → null)

### Manual Refresh
If you ever need to refresh all bookings:
1. Go to Admin → Skins
2. Select bookings
3. Click "Check Profile Data" to diagnose issues
4. Click refresh button to manually update

## Troubleshooting

### Gender/Ethnicity Still Showing as Undefined

**Solution 1:** Run migrations
```bash
npm run migrate:all
```

**Solution 2:** Have users re-save their profiles
- Go to /profile/create
- Click through steps
- Submit (this will create the `physical` field)

**Solution 3:** Use "Check Profile Data" button
- Go to Admin → Skins
- Select bookings
- Click "Check Profile Data"
- Check console for diagnostic info

### Migration Script Errors

**Error:** "Module not found: firebase-service-account.json"
- Download service account key from Firebase Console
- Save as `firebase-service-account.json` in project root

**Error:** "Permission denied"
- Service account needs "Cloud Datastore User" role
- Check Firebase Console → IAM & Admin

**Error:** "Profile not found"
- Some bookings reference deleted users
- These are skipped automatically
- Check console output for warnings

## Resources

- [Firebase Admin SDK Documentation](https://firebase.google.com/docs/admin/setup)
- [Firestore Queries Guide](https://firebase.google.com/docs/firestore/query-data/queries)
- [Firestore Indexes Guide](https://firebase.google.com/docs/firestore/query-data/indexing)
- [Migration Scripts README](scripts/README.md)

## Summary

This implementation provides:
✅ Unified `physical` field for all searchable attributes
✅ Automatic data consolidation on profile save
✅ Migration scripts for existing data
✅ Sanitization of undefined values
✅ Auto-refresh for booking snapshots
✅ Correct gender/ethnicity in skins export
✅ Foundation for advanced talent searching

Now you can easily find talent based on ANY physical attribute!
