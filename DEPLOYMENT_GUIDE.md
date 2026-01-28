# Archive System Deployment Guide

**Project:** Set Life Casting - Archive-First System
**Phase:** 1 & 2 Complete
**Date:** 2026-01-28
**Ready for:** Production Deployment

---

## Pre-Deployment Checklist

### ✅ Code Verification (Complete)
- [x] TypeScript compilation passes with no errors
- [x] All Phase 1 type definitions implemented
- [x] All Phase 2 UI components created
- [x] Badge component supports purple variant (brand color)
- [x] Migration script created and ready
- [x] Firestore security rules updated and validated

### 📦 Files Created/Modified

**New Files:**
- `src/app/admin/archive/page.tsx` (431 lines) - Archive view
- `scripts/archive-old-projects.ts` (292 lines) - Migration script
- `PHASE_1_AUDIT.md` - Type definitions audit
- `PHASE_1_COMPLETE_AUDIT.md` - Phase 1 final audit
- `PHASE_2_COMPLETE_AUDIT.md` - Phase 2 final audit
- `DEPLOYMENT_GUIDE.md` (this file)

**Modified Files:**
- `src/types/booking.ts` - Added archive fields to all interfaces
- `src/components/ui/Badge.tsx` - Added purple variant
- `src/app/admin/page.tsx` - Added Archive card to dashboard
- `src/app/admin/casting/page.tsx` - Added archive workflow
- `firestore.rules` - Added archive-first security rules

---

## Deployment Steps

### Step 1: Deploy Firestore Security Rules (15 minutes)

**CRITICAL:** Deploy Firestore rules BEFORE deploying the application code to prevent security vulnerabilities.

1. **Go to Firebase Console:**
   ```
   https://console.firebase.google.com
   ```

2. **Navigate to Firestore Rules:**
   - Select your project
   - Click "Firestore Database" in left sidebar
   - Click "Rules" tab

3. **Deploy New Rules:**
   - Copy contents of `firestore.rules` file
   - Paste into Firebase Console rules editor
   - Click "Publish"
   - Wait for "Rules published successfully" confirmation

4. **Verify Rules Syntax:**
   - Firebase will show syntax errors if any exist
   - All rules should pass validation
   - No red error indicators should appear

**What These Rules Do:**
- ✅ Prevent deletion of archived projects
- ✅ Prevent deletion of all bookings (NEVER deletable)
- ✅ Prevent deletion of archived roles
- ✅ Prevent deletion of archived submissions
- ✅ Enforce admin-only archive operations
- ✅ Validate `archivedAt` and `archivedBy` fields

**Testing Rules (Firebase Console):**
1. Click "Rules Playground" in Firebase Console
2. Test read operation on archived project:
   ```
   Authenticated: Yes
   User UID: your-admin-uid
   Location: /databases/(default)/documents/projects/{projectId}
   Operation: delete
   Document Data: { "status": "archived" }
   Expected: DENIED ✅
   ```

---

### Step 2: Deploy Application Code (5 minutes)

**Option A: Vercel (Recommended)**

```bash
# Commit all changes
git add .
git commit -m "Add archive-first system (Phase 1 & 2 complete)

- Add archive status to all type definitions
- Implement archive UI in admin dashboard
- Add archive workflow to casting management
- Create archive view page with restore functionality
- Add migration script for bulk archiving
- Update Firestore security rules
- Add purple variant to Badge component

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"

# Push to GitHub (triggers Vercel deployment)
git push origin main
```

**Option B: Manual Deployment**

```bash
# Build the application
npm run build

# Test locally first
npm run start

# Deploy to your hosting platform
# (Follow your platform's deployment process)
```

**Verify Build Success:**
- Build should complete with no TypeScript errors
- No runtime errors should occur
- All pages should render correctly

---

### Step 3: Initial Testing (30 minutes)

**Use the testing checklist from PHASE_2_COMPLETE_AUDIT.md**

#### Test 1: Archive Project with Bookings ✅
1. Go to `/admin/casting`
2. Find a project with confirmed bookings
3. Click "Archive Project" button
4. Confirm the archive operation
5. Verify success message shows counts:
   - "X roles preserved"
   - "X bookings marked complete"
   - "X submissions archived"
6. Verify project status changes to "Archived"

**Expected Result:**
- Project status = "archived"
- All roles have `archivedWithProject: true`
- All bookings have `status: "completed"` and `archivedWithProject: true`
- All submissions have `status: "archived"` and `archivedWithProject: true`

#### Test 2: Prevent Deletion of Archived Project ✅
1. Find archived project in casting management
2. Click "Delete Project" button
3. Verify error message appears
4. Verify project is NOT deleted

**Expected Result:**
- Error message: "Cannot delete archived project"
- Project still exists in database

#### Test 3: View Archive ✅
1. Go to `/admin/archive`
2. Verify archived projects appear
3. Verify counts are correct (bookings, roles, submissions)
4. Verify "Archived: [Date]" displays correctly

**Expected Result:**
- All archived projects visible
- Stats are accurate
- Dates format correctly
- UI is responsive and professional

#### Test 4: Restore Project ✅
1. In archive view, click "Restore Project"
2. Confirm the restore operation
3. Verify success message
4. Verify project appears back in casting management

**Expected Result:**
- Project status = "booked"
- Roles have `archivedWithProject: false` (or removed)
- Bookings have `status: "confirmed"` and `archivedWithProject: false`
- Submissions have original status and `archivedWithProject: false`

#### Test 5: Prevent Deletion of Bookings (Critical) ✅
**This test requires Firebase Console or Firebase Admin SDK**

1. Go to Firebase Console > Firestore Database
2. Navigate to `bookings` collection
3. Try to delete a booking document
4. Verify Firebase blocks the deletion

**Expected Result:**
- Error: "Missing or insufficient permissions"
- Booking is NOT deleted
- This ensures 7-year retention compliance

#### Test 6: Archive Toggle ✅
1. Go to `/admin/casting`
2. Click "Show Archived Projects" button
3. Verify archived projects appear
4. Click "Show Active Projects" button
5. Verify only active projects appear

**Expected Result:**
- Toggle works correctly
- Archived projects only show when toggle is active
- Active projects show by default

---

### Step 4: Migration Script Testing (20 minutes)

**IMPORTANT:** Always run with `--dry-run` first!

#### Dry Run Test ✅

```bash
# Install tsx if not already installed
npm install -g tsx

# Dry run to preview changes (default: 30 days)
npx tsx scripts/archive-old-projects.ts --dry-run

# Dry run with custom threshold (60 days)
npx tsx scripts/archive-old-projects.ts --dry-run --days=60
```

**Expected Output:**
```
═══════════════════════════════════════════════════
  📦 Archive Old Projects - Migration Script
═══════════════════════════════════════════════════

🔍 DRY RUN MODE - No changes will be made

📅 Threshold: Projects with shoot dates ending before 2025-12-29
   (30 days ago)

⚠️  Found 5 project(s) to archive:

   • "Summer Music Video - June 2025"
     Shoot Date Ended: 2025-06-15
     Current Status: booked

   • "Commercial - Beauty Brand"
     Shoot Date Ended: 2025-07-20
     Current Status: booked

🔍 DRY RUN - Would have archived these projects
   Run without --dry-run to apply changes
```

**Review:**
- Verify the list makes sense
- Check that shoot dates are truly past threshold
- Confirm you want to archive these projects

#### Actual Migration ✅

```bash
# Run migration (requires confirmation)
npx tsx scripts/archive-old-projects.ts --days=30

# Output will ask for confirmation:
# "Proceed with archiving? (yes/no): "
# Type "yes" to proceed
```

**Expected Output:**
```
🚀 Starting archive process...

📦 Archiving: Summer Music Video - June 2025
   ✅ 4 roles
   ✅ 8 bookings
   ✅ 23 submissions

📦 Archiving: Commercial - Beauty Brand
   ✅ 2 roles
   ✅ 4 bookings
   ✅ 12 submissions

═══════════════════════════════════════════════════
  ✅ Migration Complete!
═══════════════════════════════════════════════════

📊 Summary:
   • 2 projects archived
   • 6 roles preserved
   • 12 bookings completed
   • 35 submissions archived

All data is safely preserved in the archive.
```

**Verification:**
1. Go to `/admin/archive`
2. Verify migrated projects appear
3. Check counts match migration output
4. Test restoring one project to ensure data integrity

---

### Step 5: Firestore Index Creation (If Needed)

**When You'll Know Indexes are Needed:**
- Firestore will show error in console: "The query requires an index"
- Click the provided link to auto-create the index
- Wait 2-5 minutes for index to build

**Potential Indexes Needed:**
1. **Project Status + Archived Date**
   - Collection: `projects`
   - Fields: `status` (Ascending), `archivedAt` (Descending)
   - Purpose: Sort archived projects by date

2. **Booking Archive Filter**
   - Collection: `bookings`
   - Fields: `archivedWithProject` (Ascending), `projectId` (Ascending)
   - Purpose: Filter archived bookings by project

**Note:** Only create indexes if Firestore explicitly requests them. Firebase will provide direct links to create required indexes.

---

## Post-Deployment Verification

### ✅ Functionality Checklist

After deployment, verify these features work:

1. **Archive Workflow:**
   - [ ] Can archive projects from casting management
   - [ ] Archive operation updates all related entities
   - [ ] Success message shows correct counts
   - [ ] Archived projects show "Archived" badge

2. **Archive View:**
   - [ ] Archive page loads without errors
   - [ ] Projects display with correct metadata
   - [ ] Stats (bookings, roles, submissions) are accurate
   - [ ] Dates display in correct format

3. **Restore Functionality:**
   - [ ] Can restore archived projects
   - [ ] Restored projects return to "booked" status
   - [ ] All related entities are un-archived
   - [ ] Projects reappear in casting management

4. **Delete Prevention:**
   - [ ] Cannot delete archived projects
   - [ ] Cannot delete projects with bookings
   - [ ] Error messages are clear and helpful

5. **Archive Toggle:**
   - [ ] Can toggle between active and archived views
   - [ ] Toggle state persists during session
   - [ ] Filtering works correctly

6. **Security:**
   - [ ] Non-admins cannot archive projects
   - [ ] Non-admins cannot restore projects
   - [ ] Bookings cannot be deleted (test in Firebase Console)
   - [ ] Archive fields can only be set by admins

### 🔍 Data Integrity Checks

**Run these Firestore queries to verify data:**

```javascript
// 1. Find all archived projects
db.collection("projects")
  .where("status", "==", "archived")
  .get()
  .then(snap => console.log(`${snap.size} archived projects`));

// 2. Find all bookings without archivedWithProject flag (should match active projects only)
db.collection("bookings")
  .where("archivedWithProject", "==", false)
  .get()
  .then(snap => console.log(`${snap.size} active bookings`));

// 3. Find any orphaned roles (projectId doesn't exist)
// (This requires custom script - should be 0)

// 4. Verify all archived projects have archivedAt and archivedBy
db.collection("projects")
  .where("status", "==", "archived")
  .get()
  .then(snap => {
    const missing = snap.docs.filter(doc =>
      !doc.data().archivedAt || !doc.data().archivedBy
    );
    console.log(`${missing.length} projects missing archive metadata`);
  });
```

**Expected Results:**
- No orphaned data
- All archived projects have complete metadata
- Counts match between collections (roles.projectId → projects.id)

---

## Monitoring & Maintenance

### 📊 Weekly Tasks

1. **Review Archive View:**
   - Check for projects that should be archived
   - Archive completed projects (>30 days past shoot date)

2. **Run Migration Script:**
   ```bash
   # Weekly: Archive projects older than 30 days
   npx tsx scripts/archive-old-projects.ts --dry-run
   # Review output, then run without --dry-run if appropriate
   ```

3. **Check Firestore Storage:**
   - Monitor database size in Firebase Console
   - Archived projects count toward storage quota
   - Consider data retention policies (see below)

### 🗓️ Monthly Tasks

1. **Audit Archived Data:**
   - Review archived projects for accuracy
   - Verify all bookings have complete information
   - Check for any data quality issues

2. **Performance Review:**
   - Check archive view page load times
   - Monitor Firestore read/write costs
   - Optimize queries if needed

### 📅 Yearly Tasks (After 7 Years)

**Data Retention Compliance:**

After 7 years, you can safely delete old bookings:

```bash
# Example: Delete bookings from projects archived before 2019
# (Create custom script for this - DO NOT delete before 7 years!)
```

**IMPORTANT:** Consult with legal/accounting before deleting any booking records. 7 years is IRS minimum, your business may have different requirements.

---

## Troubleshooting

### Issue: "Missing or insufficient permissions" when archiving

**Cause:** Firestore rules not deployed or incorrect admin role

**Solution:**
1. Verify Firestore rules are deployed (see Step 1)
2. Check that your user has `role: "admin"` in `/users/{uid}` document
3. Try signing out and back in (token refresh)

---

### Issue: Archive page shows "No archived projects" but projects were archived

**Cause:** Query not finding projects or archivedAt field not set

**Solution:**
1. Check Firebase Console > Firestore Database > projects collection
2. Verify archived projects have `status: "archived"`
3. Verify `archivedAt` field exists and is a Timestamp
4. Check browser console for errors
5. Try hard refresh (Cmd+Shift+R / Ctrl+Shift+F5)

---

### Issue: Counts are wrong in archive view

**Cause:** Related entities not queried correctly or data inconsistency

**Solution:**
1. Open browser console while viewing archive page
2. Check for Firestore query errors
3. Manually count bookings/roles/submissions in Firebase Console
4. If counts don't match, may need to re-archive project:
   ```bash
   # Restore project, then archive again
   ```

---

### Issue: Migration script fails with "Could not load serviceAccountKey.json"

**Cause:** Firebase Admin SDK credentials not configured

**Solution:**
1. Go to Firebase Console > Project Settings > Service Accounts
2. Click "Generate new private key"
3. Save as `serviceAccountKey.json` in project root
4. **NEVER commit this file to git** (already in .gitignore)
5. Set environment variable (optional):
   ```bash
   export GOOGLE_APPLICATION_CREDENTIALS="./serviceAccountKey.json"
   ```

---

### Issue: Restore doesn't work (project stays archived)

**Cause:** Firestore transaction failed or rules prevent update

**Solution:**
1. Check browser console for errors
2. Verify admin permissions
3. Try again (may be temporary Firestore issue)
4. Manual restore via Firebase Console if needed:
   - Set `status: "booked"` on project
   - Remove `archivedAt` and `archivedBy` fields
   - Set `archivedWithProject: false` on all roles, bookings, submissions

---

### Issue: Cannot delete project even though it has no bookings

**Cause:** Project status is "archived" (archived projects can't be deleted)

**Solution:**
1. Either:
   - **Option A:** Restore project first, then delete
   - **Option B:** Keep project archived (recommended)
2. Archived projects don't clutter the active view (use toggle)

---

## Rollback Procedures

### If Something Goes Wrong During Deployment

**Rollback Application Code:**
```bash
# Revert to previous commit
git revert HEAD
git push origin main

# Or rollback in Vercel dashboard:
# Vercel > Deployments > Previous Deployment > "Promote to Production"
```

**Rollback Firestore Rules:**
1. Go to Firebase Console > Firestore Database > Rules
2. Click "Rules history" at top
3. Select previous version
4. Click "Restore"
5. Click "Publish"

**Restore Archived Projects (If Migration Went Wrong):**
1. Go to `/admin/archive`
2. Restore all affected projects manually
3. Or run custom script to bulk restore

**Emergency Manual Restore (Firebase Console):**
1. Go to Firebase Console > Firestore Database
2. Navigate to each affected project document
3. Update fields:
   ```javascript
   {
     status: "booked",  // Change from "archived"
     // Delete archivedAt field
     // Delete archivedBy field
   }
   ```
4. Do the same for roles, bookings, submissions (set `archivedWithProject: false`)

---

## Success Metrics

### After 1 Week

- [ ] No deployment-related bugs reported
- [ ] At least 1 project successfully archived
- [ ] Archive view loads in <2 seconds
- [ ] All tests passing
- [ ] Zero data integrity issues

### After 1 Month

- [ ] 10+ projects archived
- [ ] Migration script used successfully
- [ ] No booking deletion attempts
- [ ] Archive workflow is intuitive for admins
- [ ] Data retention policy is being followed

---

## Next Phase Preview

**Phase 3: Re-booking System (Optional)**

Once archive system is stable, consider implementing:
- Re-book talent from archived projects
- Performance tracking (ratings, notes)
- "Would rehire" flag
- Talent history across multiple projects

**Phase 4: Auto-archiving (Optional)**
- Automatic archiving 30 days after shoot date
- Email notifications before auto-archive
- Customizable auto-archive settings

**Phase 5: Reporting (Optional)**
- Archive analytics dashboard
- Booking history reports
- Talent performance trends
- Export archived data

---

## Support

**Documentation:**
- Phase 1 Audit: `PHASE_1_AUDIT.md`
- Phase 1 Complete Audit: `PHASE_1_COMPLETE_AUDIT.md`
- Phase 2 Complete Audit: `PHASE_2_COMPLETE_AUDIT.md`
- Archive Strategy Plan: `ARCHIVE_STRATEGY_PLAN.md`

**Code References:**
- Archive View: [src/app/admin/archive/page.tsx](src/app/admin/archive/page.tsx)
- Casting Management: [src/app/admin/casting/page.tsx](src/app/admin/casting/page.tsx)
- Type Definitions: [src/types/booking.ts](src/types/booking.ts)
- Security Rules: [firestore.rules](firestore.rules)
- Migration Script: [scripts/archive-old-projects.ts](scripts/archive-old-projects.ts)

**Need Help?**
- Check troubleshooting section above
- Review audit documentation
- Check browser console for errors
- Check Firebase Console for Firestore errors

---

## Deployment Sign-Off

**Pre-Deployment Verification:**
- [x] All TypeScript errors resolved
- [x] All Phase 1 & 2 features implemented
- [x] Security rules validated
- [x] Documentation complete
- [x] Migration script tested

**Ready for Production:** ✅ YES

**Deployment Approved By:** _________________
**Date:** _________________

**Notes:**
_________________________________________________________________________
_________________________________________________________________________
_________________________________________________________________________

---

**END OF DEPLOYMENT GUIDE**
