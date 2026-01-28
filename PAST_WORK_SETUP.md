# Past Work Feature - Setup Guide

## What Was Implemented

A simple "Past Work" section on the talent dashboard that shows:
- Role name
- Project title
- Date completed

That's it. No ratings, no notes, no extra features.

---

## Deployment Steps

### 1. Update Firestore Rules (REQUIRED)

The Firestore rules have been updated in the codebase, but you need to deploy them to Firebase.

**Steps:**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Select your Set Life Casting project
3. Click **Firestore Database** in left sidebar
4. Click **Rules** tab
5. Copy the updated rules from `firestore.rules` in this project
6. Paste into Firebase Console
7. Click **Publish**
8. Wait for "Rules published successfully" ✅

**What changed:**
- Talent can now read their own bookings (previously only admins could)
- Security: Talent can ONLY see bookings where `userId` matches their account

---

### 2. Deploy Code to Production

```bash
git add .
git commit -m "Add past work feature for talent dashboard

- Talent can now view roles they were booked for in archived projects
- Shows: role name, project title, date completed
- Minimal implementation (no ratings, notes, or badges)

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

git push origin main
```

Vercel will automatically deploy the changes.

---

### 3. Create Firestore Index (REQUIRED)

The query needs a composite index to work. Firebase will create it automatically.

**Automatic Creation (Recommended):**

1. After deploying code, log in to your app as a **talent user** (not admin)
2. Go to the dashboard
3. Open browser console (F12 or right-click → Inspect → Console)
4. You'll see an error like:
   ```
   FirebaseError: The query requires an index.
   You can create it here: https://console.firebase.google.com/...
   ```
5. **Click the link** in the error message
6. Firebase Console will open showing the required index
7. Click **"Create Index"**
8. Wait 2-5 minutes for the index to build
9. You'll see status change from "Building..." to **"Enabled"** ✅
10. Refresh the dashboard → Past work will now load!

**Manual Creation (Alternative):**

If you prefer to create the index proactively:

1. Go to Firebase Console → Firestore Database → **Indexes** tab
2. Click **"Add Index"**
3. Configure:
   - **Collection ID:** `bookings`
   - **Field 1:** `userId` - **Ascending**
   - **Field 2:** `archivedWithProject` - **Ascending**
   - **Field 3:** `updatedAt` - **Descending**
4. Click **"Create"**
5. Wait for status to show **"Enabled"** (2-5 minutes)

---

## Testing

### Quick Test

1. **Update Firestore rules** (Step 1 above)
2. **Deploy code** (Step 2 above)
3. **Create index** (Step 3 above)
4. **Archive a project with bookings:**
   - Log in as admin
   - Go to `/admin/casting`
   - Archive a completed project that has bookings
5. **Test as talent:**
   - Log out
   - Log in as the talent who was booked
   - Go to dashboard
   - Scroll down → You should see "Past Work" section
   - Verify it shows: role name, project title, date

---

## What Talent Will See

```
┌─────────────────────────────────┐
│  Past Work                      │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Lead Actor              │   │
│  │ Summer Music Video      │   │
│  │ Jun 2025                │   │
│  └─────────────────────────┘   │
│                                 │
│  ┌─────────────────────────┐   │
│  │ Supporting Role         │   │
│  │ Fashion Campaign        │   │
│  │ May 2025                │   │
│  └─────────────────────────┘   │
└─────────────────────────────────┘
```

Simple list showing past roles from archived projects.

---

## Troubleshooting

### Issue: "No past work yet" shows even though talent was booked

**Causes:**
1. Project hasn't been archived yet
2. Firestore index not created yet
3. Firestore rules not deployed

**Solutions:**
1. Archive the project from `/admin/casting`
2. Create the index (see Step 3 above)
3. Deploy the updated Firestore rules (see Step 1 above)

---

### Issue: "Missing or insufficient permissions" error

**Cause:** Firestore rules not deployed to Firebase

**Solution:**
1. Go to Firebase Console → Firestore → Rules
2. Copy rules from `firestore.rules` file
3. Paste and publish in Firebase Console

---

### Issue: "The query requires an index" error

**Cause:** Firestore index not created yet (this is expected on first run)

**Solution:**
1. Click the link in the error message
2. Create the index in Firebase Console
3. Wait 2-5 minutes
4. Refresh the page

---

## Technical Details

**Query:**
- Filters: `userId == user.uid` AND `archivedWithProject == true`
- Sorts: `updatedAt` descending (newest first)
- Limit: 20 most recent bookings

**Data Displayed:**
- `booking.roleName` - Role they played
- `booking.projectTitle` - Project name
- `booking.updatedAt` - Date completed

**Cost:**
- ~20 reads per page load
- Free tier: 50,000 reads/day
- This feature will cost $0 for typical usage

---

## Next Steps (Optional)

If you want to enhance this feature later, you could add:
- Filter by project type (film, TV, commercial)
- Search past work
- Export to PDF resume
- Public talent profile page

But for now, it's intentionally minimal - just showing past roles.

---

## Support

If you encounter issues:
1. Check browser console for errors
2. Verify Firestore rules are deployed
3. Verify index is created and enabled
4. Check that project is actually archived

All code changes are in:
- `firestore.rules` - Security rules
- `src/app/dashboard/page.tsx` - Dashboard UI
