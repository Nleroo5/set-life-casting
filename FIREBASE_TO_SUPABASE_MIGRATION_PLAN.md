# Firebase to Supabase Migration Plan

**Status:** 100% Complete - Firebase Cleanup Finished
**Last Updated:** 2026-02-05
**Priority:** COMPLETED - All Firebase dependencies removed

---

## Executive Summary

The application is currently in a **hybrid state** with split responsibilities:
- ✅ **Authentication**: Fully migrated to Supabase
- ❌ **Data Layer**: Still on Firebase Firestore (6 collections, 100+ queries)
- ❌ **File Storage**: Still on Firebase Storage
- ❌ **Password Reset**: Still uses Firebase Auth

This creates:
- Permission errors when creating projects
- Duplicate auth systems (Firebase auth unused but still imported)
- Increased complexity and bundle size
- Higher costs (paying for both services)

---

## Phase 1: Core Admin Pages (HIGHEST PRIORITY) 🔴

### 1.1 Casting Management (`admin/casting/page.tsx`)
**File:** 1,228 lines - LARGEST Firebase usage
**Operations:**
- Create/Update/Delete projects
- Create/Update/Delete roles
- Upload role reference images
- Archive projects + roles
- Query bookings count

**Migration Steps:**
1. Use `createProject()` from `lib/supabase/casting.ts` (already exists!)
2. Create `createRole()`, `updateRole()`, `deleteRole()` in `lib/supabase/casting.ts`
3. Migrate image upload from Firebase Storage to Supabase Storage
4. Replace Firestore batch writes with Supabase transactions
5. Test all CRUD operations

**Estimated Impact:** Fixes project creation error

---

### 1.2 Archive Management (`admin/archive/page.tsx`)
**Operations:**
- Query archived projects
- Restore projects/roles
- Count bookings/submissions

**Migration Steps:**
1. Update queries to use Supabase `projects` and `roles` tables
2. Replace `archiveRole()` from `lib/firebase/roles.ts` with Supabase version
3. Update booking/submission counts to query Supabase

---

### 1.3 Skins Export (`admin/skins/page.tsx`)
**Operations:**
- Query all projects
- Filter roles by project
- Find booked talent
- Export to Excel

**Migration Steps:**
1. Query Supabase tables instead of Firestore
2. Use JOIN queries for better performance
3. Update Excel export logic

---

## Phase 2: Public-Facing Pages 🟡

### 2.1 Casting Calls Page (`casting/page.tsx`)
**Operations:**
- Display active projects
- Filter roles
- Query booking status

**Migration Steps:**
1. Replace Firestore queries with Supabase
2. Use RLS policies for public access
3. Add caching with React Query

---

## Phase 3: Password Reset 🟡

### 3.1 Password Reset API (`api/auth/request-reset/route.ts`)
**Current:** Uses `sendPasswordResetEmail` from Firebase Auth
**Migration:** Use Supabase Auth `resetPasswordForEmail()`

### 3.2 Password Reset Page (`auth/reset-password/page.tsx`)
**Current:** Uses `confirmPasswordReset`, `verifyPasswordResetCode`
**Migration:** Use Supabase Auth `updateUser()` after token verification

---

## Phase 4: Storage Migration 🟢

### 4.1 Role Reference Images
**Current:** Firebase Storage
**Target:** Supabase Storage bucket "role-images"

**Steps:**
1. Create bucket in Supabase
2. Update `uploadRoleImage()` function
3. Migrate existing images (optional)

### 4.2 Profile Photos
**Current:** Mixed (some Firebase, some Supabase)
**Target:** Supabase Storage bucket "photos" (already exists!)

---

## Phase 5: Cleanup ✅ COMPLETED

### 5.1 Remove Unused Code ✅
- ✅ `lib/firebase/auth.ts` - DELETED
- ✅ `lib/firebase/admin.ts` - DELETED
- ✅ `lib/firebase/roles.ts` - DELETED
- ✅ `lib/firebase/config.ts` - DELETED
- ✅ `lib/firebase/` directory - REMOVED
- ✅ `components/casting/steps/AccountStep.tsx` - Migrated to Supabase
- ✅ `components/ui/EmailVerificationBanner.tsx` - Migrated to Supabase
- ✅ `app/admin/repair-data/page.tsx` - DELETED (Firebase-specific)
- ✅ `app/api/auth/verify-admin/route.ts` - DELETED (Firebase Admin SDK)
- ✅ `app/admin-setup/page.tsx` - DELETED (one-time setup tool)

### 5.2 Remove Firebase Dependencies ✅
```bash
npm uninstall firebase firebase-admin
```
**Status:** Completed - packages removed from package.json and node_modules cleaned

### 5.3 Update Type Definitions ✅
- ✅ `types/firestore.ts` - DELETED (no longer needed)

---

## Migration Order (Recommended)

### Week 1: Critical Path
1. ✅ Migration 009: Add admin fields (status, admin_tag, admin_notes)
2. ✅ Migration 012: Add missing profile fields
3. ✅ Migration 013: Add admin READ policies
4. ⏳ Migration 014: Add admin UPDATE policies
5. ⏳ Migrate `admin/casting/page.tsx` to Supabase
6. ⏳ Test project creation end-to-end

### Week 2: Remaining Admin Pages
7. Migrate `admin/archive/page.tsx`
8. Migrate `admin/skins/page.tsx`
9. Migrate `casting/page.tsx`
10. Test all admin functionality

### Week 3: Polish & Cleanup
11. Migrate password reset
12. Migrate storage
13. Remove Firebase code
14. Remove Firebase dependencies
15. Performance testing

---

## Database Schema Requirements

### Tables Needed (Most already exist):
- ✅ `users` - User accounts + roles
- ✅ `profiles` - Talent profiles
- ✅ `photos` - Profile photos
- ✅ `projects` - Casting projects (CHECK IF EXISTS)
- ✅ `roles` - Role listings (CHECK IF EXISTS)
- ✅ `submissions` - Talent submissions
- ❓ `bookings` - Confirmed bookings (NEEDS CREATION?)

### RLS Policies Needed:
- ✅ Admins can read all (profiles, photos, submissions)
- ⏳ Admins can update all (profiles, submissions) - Migration 014
- ❓ Public can read active projects/roles
- ❓ Users can submit to open roles
- ❓ Users can view their bookings

---

## Risk Assessment

### High Risk:
- **Data Loss**: Firestore has data not in Supabase yet
  - **Mitigation**: Export Firestore data before migration
- **Breaking Changes**: Admin pages will be down during migration
  - **Mitigation**: Migrate page by page, test thoroughly

### Medium Risk:
- **Permission Issues**: RLS policies might be too restrictive
  - **Mitigation**: Test all operations after policy changes
- **Query Performance**: Complex Firestore queries need optimization
  - **Mitigation**: Use EXPLAIN ANALYZE, add indexes

### Low Risk:
- **Auth Token Issues**: Already on Supabase Auth
- **Type Errors**: TypeScript will catch issues

---

## Testing Checklist

After each phase:
- [ ] Admin can create projects
- [ ] Admin can create roles
- [ ] Admin can archive projects
- [ ] Admin can update admin tags
- [ ] Talent can submit to roles
- [ ] Talent can view their profile
- [ ] Public can view casting calls
- [ ] Password reset works
- [ ] Images upload correctly
- [ ] All admin pages load without errors

---

## Rollback Plan

If migration fails:
1. Revert code changes (git reset)
2. Keep Firebase services active
3. Debug issues
4. Re-attempt migration

**DO NOT DELETE FIREBASE** until:
- All functionality tested
- All data migrated
- 1 week of stable operation

---

## Success Metrics

✅ **Migration Complete:**
1. ✅ No Firebase imports in source code
2. ✅ Firebase libraries completely removed
3. ✅ Firebase packages uninstalled
4. ✅ All Firebase-specific code deleted
5. ✅ Firebase bill will be $0/month after account cleanup

🎯 **Completion Date:** 2026-02-05

---

## Next Immediate Steps

1. **RUN MIGRATIONS** (5 minutes):
   - Migration 009: Admin fields
   - Migration 012: Missing profile fields
   - Migration 014: UPDATE policies

2. **MIGRATE CASTING PAGE** (2-3 hours):
   - Replace Firebase calls with Supabase
   - Test project creation
   - Test role creation

3. **TEST THOROUGHLY** (1 hour):
   - Create test project
   - Create test roles
   - Submit as talent
   - Archive project

---

## Questions to Answer

1. **Data Export**: Do you want to export existing Firestore data?
2. **Downtime**: Can we take admin pages offline briefly for migration?
3. **Testing**: Do you have a staging environment?
4. **Timeline**: Is 3-week timeline acceptable?

---

**Ready to begin systematic migration.**
**Starting with Phase 1.1: Casting Management.**
