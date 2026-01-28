# Migration Scripts

This directory contains scripts for migrating and maintaining the Firebase Firestore database.

## Profile & Booking Physical Field Migration

### Problem
The original profile structure stored data in separate sections (`appearance`, `sizes`, `details`), but the skins export and search functionality needs a unified `physical` field with all searchable attributes.

### Solution
These migration scripts add a consolidated `physical` field to all profiles and bookings, making talent searchable by any physical attribute (gender, ethnicity, height, weight, etc.).

## Setup

1. **Download Firebase Service Account Key**
   - Go to Firebase Console → Project Settings → Service Accounts
   - Click "Generate New Private Key"
   - Save the JSON file as `firebase-service-account.json` in the project root
   - **IMPORTANT:** Add `firebase-service-account.json` to `.gitignore` (already done)

2. **Install Firebase Admin SDK**
   ```bash
   npm install firebase-admin
   ```

3. **Install TypeScript Execution Tool**
   ```bash
   npm install -D tsx
   ```

## Running Migrations

### Step 1: Migrate Profiles

This adds the `physical` field to all user profiles:

```bash
npx tsx scripts/migrate-profiles-physical-field.ts
```

**What it does:**
- Reads all profiles from Firestore
- Creates a consolidated `physical` field combining:
  - Appearance data (gender, ethnicity, height, weight, hair, eyes)
  - Sizes data (shirt, pants, dress, suit, shoes)
  - Details data (tattoos, piercings, facial hair)
- Updates each profile with the new `physical` field
- Replaces `undefined` values with `null` (Firestore requirement)

**Expected Output:**
```
🚀 Starting profile migration...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Found 45 profiles to migrate
  ✅ Updated John Smith
     Gender: Male, Ethnicity: ["Caucasian"]
  ✅ Updated Jane Doe
     Gender: Female, Ethnicity: ["Asian","Pacific Islander"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration complete!
   Updated: 45
   Skipped: 0
   Errors: 0
🎉 Migration finished successfully
```

### Step 2: Migrate Bookings

This updates booking snapshots with fresh profile data including the `physical` field:

```bash
npx tsx scripts/migrate-bookings-physical-field.ts
```

**What it does:**
- Reads all bookings from Firestore
- For each booking, fetches the current user profile
- Updates the `talentProfile` snapshot with fresh, sanitized profile data
- Ensures gender and ethnicity are populated for skins export
- Replaces `undefined` values with `null`

**Expected Output:**
```
🚀 Starting booking migration...
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 Found 23 bookings to migrate
  ✅ Updated booking abc123 for John Smith
     Gender: Male, Ethnicity: ["Caucasian"]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
✅ Migration complete!
   Updated: 23
   Skipped: 0
   Errors: 0
🎉 Migration finished successfully
```

## Post-Migration

After running these scripts:

1. **Verify in Firebase Console**
   - Check a few profiles - they should have a `physical` field
   - Check bookings - `talentProfile.physical` should exist

2. **Test Skins Export**
   - Go to Admin → Skins
   - Select bookings
   - Generate skins export
   - Gender and ethnicity should now appear correctly

3. **Test Search** (future feature)
   - Search for talent by gender, ethnicity, height, etc.
   - The consolidated `physical` field makes this efficient

## Ongoing Maintenance

The profile creation page (`src/app/profile/create/page.tsx`) has been updated to automatically create the `physical` field when:
- Users create new profiles
- Users edit existing profiles
- Auto-save occurs during profile creation

The skins verification system (`src/app/admin/skins/page.tsx`) now:
- Sanitizes profile data (replaces `undefined` with `null`)
- Auto-refreshes booking snapshots with current profile data
- Ensures gender and ethnicity are always populated

## Troubleshooting

### "Module not found: firebase-service-account.json"
- Make sure you downloaded the service account key from Firebase Console
- Place it in the project root (same directory as `package.json`)
- File name must be exactly `firebase-service-account.json`

### "Permission denied"
- The service account needs Firestore read/write permissions
- Check Firebase Console → IAM & Admin → Service Accounts
- Ensure the service account has "Cloud Datastore User" role

### "Profile not found"
- Some bookings may reference deleted user profiles
- These will be skipped automatically
- Check the console output for warnings

## Future Enhancements

### Add Firestore Indexes for Searching

Create composite indexes in Firebase Console → Firestore → Indexes:

1. **Search by Gender + Ethnicity**
   ```
   Collection: profiles
   Fields: physical.gender (Ascending), physical.ethnicity (Array-contains)
   ```

2. **Search by Height Range**
   ```
   Collection: profiles
   Fields: physical.height (Ascending), physical.gender (Ascending)
   ```

3. **Search by Size**
   ```
   Collection: profiles
   Fields: physical.shirtSize (Ascending), physical.gender (Ascending)
   ```

These indexes will enable fast, efficient searching of talent by any physical attribute!
