# Authentication Rebuild - Deletion & Migration Plan

## 🎯 Overview

This document provides a step-by-step plan for what to delete, what to keep, and what to modify when replacing Firebase Auth with Supabase.

**Rule of Thumb**: If it's pure authentication, delete/replace it. If it touches Firestore data or Firebase Storage, keep it.

---

## 📁 File-by-File Analysis

### Category 1: DELETE (Auth-Only Files)

These files are ONLY used for Firebase Authentication and can be safely deleted:

#### ❌ Delete if exists:
```
src/lib/firebase/auth.ts                    [DELETE - Auth-only]
src/hooks/useFirebaseAuth.ts                [DELETE - Auth hooks]
src/utils/firebase-auth-helpers.ts          [DELETE - Auth utilities]
```

**Why safe to delete?** These files only handle authentication logic (login, signup, session management). Supabase replaces all of this.

**How to verify**: Search file contents for "firestore", "storage", "collection", "doc". If none found, it's auth-only.

---

### Category 2: ANALYZE CAREFULLY (Mixed Use)

These files contain BOTH auth and Firestore code. You must extract Firestore code before modifying.

#### ⚠️ `src/lib/firebase/config.ts`

**Current contents** (likely):
```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';           // ← AUTH: Remove
import { getFirestore } from 'firebase/firestore';  // ← KEEP: Firestore
import { getStorage } from 'firebase/storage';      // ← KEEP: Storage

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,  // ← AUTH: Remove
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);           // ← AUTH: Remove
export const firestore = getFirestore(app);  // ← KEEP
export const storage = getStorage(app);      // ← KEEP
```

**What to do**:
1. Remove `getAuth` import
2. Remove `export const auth = getAuth(app);` line
3. Keep everything else (Firestore, Storage still needed)

**After modification**:
```typescript
import { initializeApp } from 'firebase/app';
// import { getAuth } from 'firebase/auth'; ← DELETED
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,  // Still needed for Firestore
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
// export const auth = getAuth(app); ← DELETED
export const firestore = getFirestore(app);
export const storage = getStorage(app);
```

---

#### ⚠️ `src/lib/firebase/admin.ts`

**Current contents** (likely):
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';      // ← AUTH: Remove
import { getFirestore } from 'firebase-admin/firestore'; // ← KEEP

// ... initialization code ...

export const adminAuth = getAuth(app);       // ← AUTH: Remove
export const adminDb = getFirestore(app);    // ← KEEP

export async function verifyAdminRole(uid: string) { // ← AUTH: Remove
  // ... checks Firestore users collection for role ...
}

export async function verifyAdminToken(idToken: string) { // ← AUTH: Remove
  // ... verifies Firebase ID token ...
}
```

**What to do**:
1. Remove `getAuth` import
2. Remove `adminAuth` export
3. Remove `verifyAdminRole` function (Supabase handles this)
4. Remove `verifyAdminToken` function (Supabase handles this)
5. Keep `adminDb` and Firestore initialization

**After modification**:
```typescript
import { initializeApp, cert } from 'firebase-admin/app';
// import { getAuth } from 'firebase-admin/auth'; ← DELETED
import { getFirestore } from 'firebase-admin/firestore';

// ... initialization code (keep as is) ...

// export const adminAuth = getAuth(app); ← DELETED
export const adminDb = getFirestore(app);  // KEEP

// Delete verifyAdminRole and verifyAdminToken functions
```

---

### Category 3: MAJOR REWRITE (Auth Logic)

These files contain authentication logic and must be completely rewritten to use Supabase.

#### 🔄 `src/contexts/AuthContext.tsx` [MAJOR REWRITE]

**What it does now**: Manages Firebase auth state, loads user data from Firestore
**What it should do**: Manage Supabase auth state, load user data from PostgreSQL

**Replace**:
```typescript
// OLD:
import { onAuthStateChanged, signOut } from 'firebase/auth';
import { auth } from '@/lib/firebase/config';
import { getDoc, doc } from 'firebase/firestore';

onAuthStateChanged(auth, async (user) => {
  // Load userData from Firestore users collection
});

// NEW:
import { createClient } from '@/lib/supabase/config';

const supabase = createClient();
supabase.auth.onAuthStateChange((_event, session) => {
  // Load userData from public.users table
});
```

**Full replacement code**: See AUTH_REBUILD_SPEC.md, AuthContext section

**CRITICAL**: Keep same interface so other components don't break
```typescript
// Keep this export interface unchanged:
interface AuthContextType {
  user: User | null;
  userData: UserData | null;
  isAdmin: boolean;
  loading: boolean;
  signOut: () => Promise<void>;
}
```

---

#### 🔄 `src/middleware.ts` [MAJOR REWRITE]

**What it does now**: Checks firebase-token cookie, verifies with Firebase Admin
**What it should do**: Check Supabase session, verify with Supabase client

**Replace**:
```typescript
// OLD:
const token = request.cookies.get('firebase-token')?.value;
if (!token) return redirect('/login');
const decodedToken = await adminAuth.verifyIdToken(token);
// Check role in Firestore

// NEW:
const supabase = createServerClient(...);
const { data: { user } } = await supabase.auth.getUser();
if (!user) return redirect('/login');
// Check role in public.users table
await supabase.auth.updateSession(); // CRITICAL
```

**Full replacement code**: See AUTH_REBUILD_SPEC.md, Middleware section

**CRITICAL**: Must call `updateSession()` or app will behave weirdly

---

#### 🔄 `src/app/login/page.tsx` [MAJOR REWRITE]

**What changes**: Replace Firebase login with Supabase login
**What stays same**: ENTIRE visual design (colors, fonts, layout, styling)

**Replace**:
```typescript
// OLD:
import { signInWithEmailAndPassword } from 'firebase/auth';
await signInWithEmailAndPassword(auth, email, password);

// NEW:
import { createClient } from '@/lib/supabase/config';
const supabase = createClient();
await supabase.auth.signInWithPassword({ email, password });
```

**Full replacement code**: See AUTH_REBUILD_SPEC.md, Login Page section

**CRITICAL**: Check `email_confirmed_at` before allowing login

---

#### 🔄 `src/app/signup/page.tsx` [MAJOR REWRITE]

**What changes**: Replace Firebase signup with Supabase signup
**What stays same**: ENTIRE visual design

**Replace**:
```typescript
// OLD:
import { createUserWithEmailAndPassword } from 'firebase/auth';
await createUserWithEmailAndPassword(auth, email, password);
// Create Firestore user document

// NEW:
import { createClient } from '@/lib/supabase/config';
const supabase = createClient();
await supabase.auth.signUp({ email, password });
// Create public.users record
```

**Full replacement code**: See AUTH_REBUILD_SPEC.md, Signup Page section

**CRITICAL**: Two-step process (auth signup + database record creation)

---

### Category 4: KEEP UNCHANGED (Firestore Operations)

These files use Firestore for data operations. DO NOT MODIFY THEM.

#### ✅ `src/lib/firebase/roles.ts` [NO CHANGES]

**Why keep?** Manages casting roles in Firestore. Nothing to do with auth.

**What it does**: CRUD operations on Firestore `roles` collection
- `createRole(projectId, roleData)`
- `updateRole(roleId, updates)`
- `deleteRole(roleId)`
- `archiveRole(roleId)`

**Verification**: File should have zero Firebase Auth imports. Only Firestore.

---

#### ✅ `src/lib/firebase/storage.ts` [NO CHANGES]

**Why keep?** Manages photo uploads to Firebase Storage. Nothing to do with auth.

**What it does**:
- Upload talent headshots
- Upload full-body photos
- Compress images
- Generate download URLs

**Verification**: File should have zero Firebase Auth imports. Only Storage.

---

#### ✅ `src/lib/firebase/submissions.ts` [NO CHANGES - if exists]

**Why keep?** Manages submissions in Firestore. Nothing to do with auth.

**What it does**: CRUD operations on Firestore `submissions` collection

---

#### ✅ `src/lib/firebase/projects.ts` [NO CHANGES - if exists]

**Why keep?** Manages projects in Firestore. Nothing to do with auth.

**What it does**: CRUD operations on Firestore `projects` collection

---

### Category 5: CREATE NEW (Supabase Files)

These are new files you'll create for Supabase authentication.

#### ✨ `src/lib/supabase/config.ts` [CREATE NEW]

**Purpose**: Browser client for React components

**Code**: See AUTH_REBUILD_SPEC.md

**When to use**: In client components, pages that run in browser

---

#### ✨ `src/lib/supabase/server.ts` [CREATE NEW]

**Purpose**: Server client for middleware, API routes, server components

**Code**: See AUTH_REBUILD_SPEC.md

**When to use**: In middleware.ts, API routes, server components

**CRITICAL**: Different cookie handling than browser client

---

#### ✨ `src/lib/supabase/admin.ts` [CREATE NEW]

**Purpose**: Admin client with service role key (bypasses RLS)

**Code**: See AUTH_REBUILD_SPEC.md

**When to use**: Admin operations that need to bypass Row Level Security

---

### Category 6: MODIFY CONFIG

#### 🔧 `.env.local` [UPDATE]

**Current** (Firebase):
```env
NEXT_PUBLIC_FIREBASE_API_KEY=...
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=...
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=...
NEXT_PUBLIC_FIREBASE_APP_ID=...
FIREBASE_CLIENT_EMAIL=...
FIREBASE_PRIVATE_KEY=...
```

**After** (Supabase + Firebase):
```env
# Supabase (NEW)
NEXT_PUBLIC_SUPABASE_URL=https://[project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...

# Firebase (KEEP - for Firestore & Storage)
NEXT_PUBLIC_FIREBASE_API_KEY=...        # KEEP (Firestore needs it)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=...     # KEEP
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=... # KEEP
NEXT_PUBLIC_FIREBASE_APP_ID=...         # KEEP

# Firebase Auth (DELETE - no longer needed)
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=... # DELETE
# FIREBASE_CLIENT_EMAIL=...             # DELETE (auth only)
# FIREBASE_PRIVATE_KEY=...              # DELETE (auth only)
```

**Why keep some Firebase vars?** Firestore and Storage still need Firebase config.

---

#### 🔧 `package.json` [UPDATE]

**Add**:
```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.45.0",
    "@supabase/ssr": "^0.5.0"
  }
}
```

**Keep**:
```json
{
  "dependencies": {
    "firebase": "^10.x.x",        // KEEP (Firestore, Storage)
    "firebase-admin": "^12.x.x"   // KEEP (Admin Firestore)
  }
}
```

**Install**:
```bash
npm install @supabase/supabase-js @supabase/ssr
```

---

## 🗑️ Deletion Checklist

Use this checklist when cleaning up:

### Phase 1: Identify Auth-Only Files
- [ ] Search codebase for files with "auth" in name
- [ ] Check each file: does it import from 'firebase/auth'?
- [ ] Check each file: does it import from 'firebase-admin/auth'?
- [ ] If yes to both above and no Firestore imports → mark for deletion

### Phase 2: Extract Firestore from Mixed Files
- [ ] Open `src/lib/firebase/config.ts`
- [ ] Remove `getAuth` import
- [ ] Remove `export const auth` line
- [ ] Keep all Firestore and Storage code
- [ ] Open `src/lib/firebase/admin.ts`
- [ ] Remove `getAuth` import
- [ ] Remove `adminAuth` export
- [ ] Remove `verifyAdminRole` function
- [ ] Remove `verifyAdminToken` function
- [ ] Keep `adminDb` and all Firestore code

### Phase 3: Delete Auth-Only Imports Across Codebase
- [ ] Search for: `import { auth } from '@/lib/firebase/config'`
- [ ] Replace with: (delete line - use Supabase instead)
- [ ] Search for: `import { adminAuth } from '@/lib/firebase/admin'`
- [ ] Replace with: (delete line - use Supabase instead)
- [ ] Search for: `from 'firebase/auth'`
- [ ] Replace all with Supabase equivalents

### Phase 4: Remove Firebase Auth Cookies (if custom cookie logic exists)
- [ ] Search for: `firebase-token`
- [ ] Remove custom cookie setting logic
- [ ] Supabase handles cookies automatically

### Phase 5: Clean Up Environment Variables
- [ ] Remove `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN` from .env.local
- [ ] Remove `FIREBASE_CLIENT_EMAIL` (if auth-only)
- [ ] Remove `FIREBASE_PRIVATE_KEY` (if auth-only)
- [ ] Keep all other Firebase vars (Firestore/Storage need them)

---

## 🔍 Search & Replace Guide

Use these VS Code/editor searches to find what needs changing:

### Search 1: Find Firebase Auth Imports
```
Search: import.*firebase/auth
Files: **/*.ts, **/*.tsx
```
**What to do**: Replace with Supabase imports

### Search 2: Find Firebase Auth Function Calls
```
Search: signInWithEmailAndPassword|createUserWithEmailAndPassword|signOut
Files: **/*.ts, **/*.tsx
```
**What to do**: Replace with Supabase equivalents

### Search 3: Find Firestore User Role Checks
```
Search: collection\(.*['"]users['"]
Files: **/*.ts, **/*.tsx
```
**What to do**: Review each - some may be Firestore queries that should stay

### Search 4: Find Firebase Token Verification
```
Search: verifyIdToken|firebase-token
Files: **/*.ts, **/*.tsx
```
**What to do**: Replace with Supabase session checks

### Search 5: Find Auth Context Usage
```
Search: useAuth\(\)
Files: **/*.tsx
```
**What to do**: Review to ensure AuthContext interface unchanged

---

## 📊 Before & After Comparison

### File Count

**Before**:
```
src/lib/firebase/
├── config.ts           (auth + firestore + storage)
├── admin.ts            (auth + firestore)
├── auth.ts             (auth only) ← DELETE
├── roles.ts            (firestore only)
└── storage.ts          (storage only)

src/contexts/
└── AuthContext.tsx     (Firebase auth)

src/middleware.ts       (Firebase token check)
```

**After**:
```
src/lib/firebase/
├── config.ts           (firestore + storage only)
├── admin.ts            (firestore only)
├── roles.ts            (firestore only)
└── storage.ts          (storage only)

src/lib/supabase/       ← NEW DIRECTORY
├── config.ts           (browser client)
├── server.ts           (server client)
└── admin.ts            (admin client)

src/contexts/
└── AuthContext.tsx     (Supabase auth)

src/middleware.ts       (Supabase session check)
```

---

## ⚠️ Common Mistakes to Avoid

### Mistake 1: Deleting Firestore Initialization
**Wrong**: Delete entire `src/lib/firebase/config.ts`
**Right**: Remove only auth-related lines, keep Firestore init

### Mistake 2: Forgetting to Create public.users Records
**Wrong**: Only call `supabase.auth.signUp()`
**Right**: Also insert into `public.users` table after signup

### Mistake 3: Changing AuthContext Interface
**Wrong**: Change return type of `useAuth()` hook
**Right**: Keep interface identical, only change implementation

### Mistake 4: Deleting Firebase Env Vars
**Wrong**: Remove `NEXT_PUBLIC_FIREBASE_API_KEY` (Firestore needs it)
**Right**: Only remove `FIREBASE_AUTH_DOMAIN` (auth-specific)

### Mistake 5: Not Testing After Each Change
**Wrong**: Delete 10 files, then test
**Right**: Delete 1 file, test, commit, repeat

---

## 🧪 Validation After Deletion

After completing deletions, run these checks:

### Check 1: Build Succeeds
```bash
npm run build
```
**Expected**: No errors about missing Firebase auth imports

### Check 2: No Auth Imports Remain
```bash
grep -r "firebase/auth" src/
```
**Expected**: Zero results (or only in comments)

### Check 3: Firestore Still Works
```bash
# Start dev server
npm run dev
# Test: View submissions page
# Expected: Submissions load from Firestore
```

### Check 4: Storage Still Works
```bash
# Test: Upload a photo in profile creation
# Expected: Upload succeeds to Firebase Storage
```

### Check 5: Login Works
```bash
# Test: Log in with Supabase account
# Expected: Successful login, redirected to dashboard
```

---

## 📝 Step-by-Step Deletion Procedure

Follow this exact order to minimize errors:

### Step 1: Commit Current State
```bash
git add .
git commit -m "Checkpoint before auth migration"
```

### Step 2: Create Supabase Files First
```bash
mkdir -p src/lib/supabase
touch src/lib/supabase/config.ts
touch src/lib/supabase/server.ts
touch src/lib/supabase/admin.ts
```
(Add code from AUTH_REBUILD_SPEC.md)

### Step 3: Update AuthContext
- Copy new implementation from AUTH_REBUILD_SPEC.md
- Test that app still compiles

### Step 4: Update Middleware
- Copy new implementation from AUTH_REBUILD_SPEC.md
- Test that /admin protection works

### Step 5: Update Login/Signup Pages
- Copy new implementations from AUTH_REBUILD_SPEC.md
- Test signup and login flows

### Step 6: Clean Up firebase/config.ts
- Remove `getAuth` import
- Remove `auth` export
- Test that Firestore queries still work

### Step 7: Clean Up firebase/admin.ts
- Remove `getAuth` import
- Remove `adminAuth` export
- Remove auth helper functions
- Test that Firestore admin operations still work

### Step 8: Delete Auth-Only Files (if they exist)
```bash
rm src/lib/firebase/auth.ts
rm src/hooks/useFirebaseAuth.ts
```

### Step 9: Update Environment Variables
- Add Supabase vars
- Remove auth-specific Firebase vars
- Keep Firestore/Storage vars

### Step 10: Update package.json
```bash
npm install @supabase/supabase-js @supabase/ssr
npm run build  # Verify no errors
```

### Step 11: Run Full Test Suite
- Test all 8 auth scenarios from AUTH_REBUILD_SPEC.md
- Test submissions page (Firestore)
- Test role management (Firestore)
- Test photo upload (Firebase Storage)

### Step 12: Commit Clean State
```bash
git add .
git commit -m "Complete: Replace Firebase Auth with Supabase"
```

---

## 🚨 Emergency Rollback

If something breaks:

```bash
# Revert to checkpoint
git reset --hard HEAD~1

# Or revert specific commit
git revert <commit-hash>
```

**Data Loss**: None - Firestore data unchanged, Supabase is new database

---

## ✅ Completion Checklist

You're done when:

- [ ] Zero `firebase/auth` imports in codebase
- [ ] Zero `firebase-admin/auth` imports in codebase
- [ ] `npm run build` succeeds
- [ ] Login works with Supabase
- [ ] Signup works with Supabase
- [ ] Email verification works
- [ ] Admin access protection works
- [ ] Talent blocked from admin routes
- [ ] Submissions page loads (Firestore working)
- [ ] Roles page loads (Firestore working)
- [ ] Photo upload works (Firebase Storage working)
- [ ] No console errors on any page
- [ ] Design looks identical to before

---

**Last Updated**: 2026-02-02
**Version**: 1.0
