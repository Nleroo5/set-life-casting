# Full Firebase to Supabase Migration Plan

**Goal**: Migrate ALL data from Firebase (Firestore + Storage) to Supabase (PostgreSQL + Storage)

**Status**: Planning Phase
**Created**: 2026-02-04
**Current**: Auth ✅ Complete | Data ⏳ Planning

---

## ✅ Phase 1: Authentication (COMPLETE)

- ✅ Supabase Auth setup
- ✅ User table created (public.users)
- ✅ Signup/Login flows migrated
- ✅ RLS policies configured
- ✅ Middleware updated
- ✅ Session management working

---

## 🎯 Phase 2: Database Schema Design (NEXT)

### Current Firebase Collections to Migrate:

1. **profiles** (Firestore)
   - User profile data (bio, measurements, experience, etc.)
   - Linked to auth user ID

2. **submissions** (Firestore)
   - Talent submissions to casting calls
   - Linked to profiles and roles

3. **roles** (Firestore)
   - Casting call roles/opportunities
   - Linked to projects

4. **projects** (Firestore)
   - Production projects with multiple roles

5. **photos** (Firebase Storage)
   - User headshots and portfolio images
   - Currently organized by user ID

### Proposed Supabase Schema:

```sql
-- Already exists
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  email text NOT NULL,
  role text NOT NULL CHECK (role IN ('admin', 'talent')),
  full_name text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW: Profiles table
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,

  -- Basic info
  first_name text,
  last_name text,
  phone text,
  city text,
  state text,

  -- Physical attributes
  height_feet int,
  height_inches int,
  weight int,
  chest text,
  waist text,
  hips text,
  inseam text,
  neck text,
  sleeve text,
  dress_size text,
  shoe_size text,

  -- Professional details
  bio text,
  experience text,
  skills text[],
  unions text[],

  -- Status
  profile_complete boolean DEFAULT false,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  UNIQUE(user_id)
);

-- NEW: Photos table (metadata, files in Supabase Storage)
CREATE TABLE public.photos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,

  -- Photo details
  type text NOT NULL CHECK (type IN ('headshot', 'fullbody', 'portfolio')),
  url text NOT NULL,
  storage_path text NOT NULL,

  -- Metadata
  file_size int,
  mime_type text,
  width int,
  height int,

  -- Order for portfolio
  display_order int DEFAULT 0,

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW: Projects table
CREATE TABLE public.projects (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Project details
  title text NOT NULL,
  description text,
  production_company text,
  director text,

  -- Dates
  start_date date,
  end_date date,

  -- Status
  status text CHECK (status IN ('active', 'closed', 'archived')) DEFAULT 'active',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW: Roles table (casting calls)
CREATE TABLE public.roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Role details
  title text NOT NULL,
  description text,

  -- Requirements
  gender text,
  age_min int,
  age_max int,
  ethnicity text[],

  -- Compensation
  pay_rate text,
  pay_type text CHECK (pay_type IN ('hourly', 'daily', 'project', 'unpaid')),

  -- Dates
  audition_date date,
  shoot_dates text,

  -- Status
  status text CHECK (status IN ('open', 'closed', 'archived')) DEFAULT 'open',

  -- Timestamps
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- NEW: Submissions table
CREATE TABLE public.submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),

  -- References
  user_id uuid REFERENCES public.users(id) ON DELETE CASCADE,
  profile_id uuid REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid REFERENCES public.roles(id) ON DELETE CASCADE,
  project_id uuid REFERENCES public.projects(id) ON DELETE CASCADE,

  -- Status
  status text CHECK (status IN ('pinned', 'booked', 'rejected')) DEFAULT null,

  -- Notes from admin
  admin_notes text,

  -- Timestamps
  submitted_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Ensure one submission per user per role
  UNIQUE(user_id, role_id)
);
```

---

## 📋 Phase 3: Data Migration Scripts

### Step 1: Export Firebase Data

Create scripts to export existing Firebase data:

```typescript
// scripts/export-firebase-data.ts
// Exports all collections to JSON files
```

### Step 2: Transform Data

Convert Firebase document structure to Supabase table rows:

```typescript
// scripts/transform-data.ts
// Converts Firebase docs to Supabase rows
// Handles ID mapping, date conversion, etc.
```

### Step 3: Import to Supabase

Bulk insert data into Supabase:

```typescript
// scripts/import-to-supabase.ts
// Uses Supabase admin client to bulk insert
```

### Step 4: Migrate Storage

Transfer Firebase Storage files to Supabase Storage:

```typescript
// scripts/migrate-storage.ts
// Downloads from Firebase Storage
// Uploads to Supabase Storage
// Updates photo URLs in database
```

---

## 🔄 Phase 4: Update Application Code

### Files to Update:

1. **Profile Creation** (`src/app/profile/create/page.tsx`)
   - Replace Firestore calls with Supabase
   - Update storage upload to Supabase Storage

2. **Admin Submissions** (`src/app/admin/submissions/page.tsx`)
   - Replace Firestore queries with Supabase
   - Update status management

3. **Admin Talent Profile** (`src/app/admin/talent/[userId]/page.tsx`)
   - Replace Firestore with Supabase

4. **Casting Pages** (`src/app/casting/*`)
   - Update role fetching to Supabase
   - Update submission creation to Supabase

5. **Firebase Utilities** (`src/lib/firebase/*`)
   - Delete or deprecate Firebase Firestore code
   - Keep only if needed for legacy data

---

## 🧪 Phase 5: Testing

### Test Checklist:

- [ ] User can create profile
- [ ] Photos upload to Supabase Storage
- [ ] User can submit to casting calls
- [ ] Admin can view submissions
- [ ] Admin can update submission status
- [ ] Admin can view talent profiles
- [ ] All queries return correct data
- [ ] RLS policies protect data correctly
- [ ] No Firebase errors in console

---

## 🚀 Phase 6: Deployment & Cleanup

1. Deploy to production
2. Monitor for errors
3. Backup Firebase data (for rollback)
4. After 1 week of stable operation:
   - Remove Firebase dependencies
   - Delete Firebase Firestore collections
   - Delete Firebase Storage files
   - Update environment variables

---

## ⚠️ Important Considerations

### Downtime Strategy

**Option A: Zero Downtime** (Recommended)
- Dual-write to both Firebase and Supabase during transition
- Switch reads from Firebase to Supabase gradually
- No user-facing downtime

**Option B: Maintenance Window**
- Schedule downtime (e.g., 2-4 hours)
- Migrate all data at once
- Simpler but requires downtime

### Data Integrity

- Run data validation scripts
- Compare record counts: Firebase vs Supabase
- Verify foreign key relationships
- Check photo URLs work correctly

### Rollback Plan

- Keep Firebase credentials active for 1 month
- Export all migrated data from Supabase
- Document rollback procedure
- Test rollback on staging environment

---

## 📊 Estimated Timeline

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 2 | Schema design & RLS policies | 4-6 hours |
| 3 | Data migration scripts | 6-8 hours |
| 3 | Storage migration | 2-4 hours |
| 4 | Update application code | 8-12 hours |
| 5 | Testing | 4-6 hours |
| 6 | Deployment | 2-4 hours |

**Total**: 26-40 hours of work

---

## 🎯 Next Steps

**Immediate Actions:**

1. ✅ Create this plan document
2. ⏳ Design complete Supabase schema
3. ⏳ Create RLS policies for new tables
4. ⏳ Run migrations to create tables
5. ⏳ Write data export scripts
6. ⏳ Test with sample data

**Do you want to proceed with Phase 2 (Schema Design)?**

---

## 📝 Notes

- This is a **large migration** (26-40 hours estimated)
- Can be done in stages (profiles first, then submissions, etc.)
- Authentication is already complete (8 hours already invested)
- Total migration would be ~34-48 hours

**Alternative**: If timeline is too long, we can keep Firebase for data and just use Supabase for auth (current hybrid state works fine).
