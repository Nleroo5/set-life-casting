# Set Life Casting - Authentication System Rebuild Specification

## 🎯 Project Overview

**Objective**: Complete rebuild of authentication system from Firebase to Supabase while preserving all existing design, layout, and non-auth functionality.

**Scope**: Authentication ONLY - submissions, roles, projects, and all other features remain on Firestore unchanged.

**Timeline**: 6-8 weeks (lean migration approach based on 2026 enterprise best practices)

**Status**: Specification Phase

---

## 📊 System Architecture

### Current State (Firebase Auth)
```
┌─────────────────────────────────────────────────┐
│              Next.js 14 App Router              │
├─────────────────────────────────────────────────┤
│ Authentication Layer (Firebase)                 │
│ - firebase/auth (client SDK)                    │
│ - firebase-admin (server SDK)                   │
│ - Cookie-based sessions (1hr expiry)            │
│ - AuthContext with userData loading             │
│ - Middleware route protection                   │
├─────────────────────────────────────────────────┤
│ Data Layer (Firestore - UNCHANGED)              │
│ - submissions collection                        │
│ - roles collection                              │
│ - projects collection                           │
│ - profiles collection                           │
└─────────────────────────────────────────────────┘
```

### Target State (Supabase Auth)
```
┌─────────────────────────────────────────────────┐
│              Next.js 14 App Router              │
├─────────────────────────────────────────────────┤
│ Authentication Layer (Supabase)                 │
│ - @supabase/ssr (2026 recommended package)      │
│ - PostgreSQL users table with RLS               │
│ - JWT-based sessions (refresh token rotation)   │
│ - AuthContext with Supabase hooks              │
│ - Middleware with updateSession                 │
├─────────────────────────────────────────────────┤
│ Data Layer (Firestore - UNCHANGED)              │
│ - submissions collection                        │
│ - roles collection                              │
│ - projects collection                           │
│ - profiles collection                           │
└─────────────────────────────────────────────────┘
```

---

## 🗄️ Database Schema

### Supabase PostgreSQL Schema

#### `auth.users` (Managed by Supabase Auth)
System table - automatically created by Supabase
- `id` (uuid, primary key)
- `email` (text, unique)
- `encrypted_password` (text)
- `email_confirmed_at` (timestamp)
- `created_at` (timestamp)
- `updated_at` (timestamp)

#### `public.users` (Custom User Metadata)
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text NOT NULL UNIQUE,
  role text NOT NULL CHECK (role IN ('admin', 'talent')),
  full_name text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own data
CREATE POLICY "Users can read own data"
  ON public.users
  FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own data
CREATE POLICY "Users can update own data"
  ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create index for role lookups
CREATE INDEX idx_users_role ON public.users(role);

-- Create trigger for updated_at
CREATE TRIGGER update_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
```

#### Database Function: `update_updated_at_column()`
```sql
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;
```

---

## 🔐 Authentication Flows

### 1. Signup Flow (Talent)

```
┌─────────┐      POST /auth/v1/signup      ┌──────────────┐
│ Browser │ ────────────────────────────────▶│   Supabase   │
│         │  { email, password }             │   Auth API   │
└─────────┘                                  └──────────────┘
     │                                              │
     │         ┌────────────────────────────────────┘
     │         │ 1. Create auth.users record
     │         │ 2. Send confirmation email
     │         │ 3. Return session tokens
     │         │
     │         ▼
     │    ┌──────────────┐
     │    │  PostgreSQL  │
     │    │  auth.users  │
     │    └──────────────┘
     │         │
     │         │ 4. Trigger: Create public.users record
     │         │
     │         ▼
     │    ┌──────────────┐
     │    │  PostgreSQL  │
     │    │public.users  │
     │    │ role='talent'│
     │    └──────────────┘
     │         │
     │◀────────┘ 5. Return success + session
     │
     │    6. Redirect to /profile/create
     ▼
```

### 2. Login Flow

```
┌─────────┐      POST /auth/v1/token       ┌──────────────┐
│ Browser │ ────────────────────────────────▶│   Supabase   │
│         │  { email, password }             │   Auth API   │
└─────────┘                                  └──────────────┘
     │                                              │
     │         ┌────────────────────────────────────┘
     │         │ 1. Verify credentials
     │         │ 2. Check email_confirmed_at
     │         │ 3. Generate JWT tokens
     │         │    - access_token (1hr)
     │         │    - refresh_token (30d)
     │         │
     │◀────────┘ 4. Return session
     │
     │    5. Set cookies via middleware
     │       - sb-access-token
     │       - sb-refresh-token
     │
     │    6. Fetch user metadata from public.users
     │
     │    7. Check role and redirect:
     │       - admin → /admin/submissions
     │       - talent → /dashboard
     ▼
```

### 3. Middleware Protection Flow

```
Request to /admin/*
     │
     ▼
┌──────────────────────────────────────┐
│         middleware.ts                │
│                                      │
│  1. Call cookies() to opt out cache │
│  2. Create Supabase server client   │
│  3. Call supabase.auth.getUser()    │
│     ├─ No session? → /login         │
│     └─ Has session? ↓               │
│  4. Fetch public.users by user.id   │
│     ├─ role != 'admin'? → /         │
│     └─ role == 'admin'? → Continue  │
│  5. CRITICAL: updateSession()       │
│     (prevents weird app behavior)   │
└──────────────────────────────────────┘
     │
     ▼
  Proceed to /admin/* page
```

### 4. Email Verification Flow

```
User signs up
     │
     ▼
Supabase sends email
     │
     ▼
User clicks link → /auth/v1/verify
     │
     ▼
Supabase updates email_confirmed_at
     │
     ▼
Redirect to app with session
     │
     ▼
AuthContext checks emailVerified
     │
     ├─ Not verified? → Show banner "Check your email"
     └─ Verified? → Allow profile submission
```

---

## 🔑 API Contracts

### Authentication Endpoints (Supabase Built-in)

#### `POST /auth/v1/signup`
**Request:**
```json
{
  "email": "talent@example.com",
  "password": "SecurePassword123!",
  "options": {
    "data": {
      "full_name": "John Doe",
      "role": "talent"
    }
  }
}
```

**Response (201):**
```json
{
  "user": {
    "id": "uuid",
    "email": "talent@example.com",
    "email_confirmed_at": null,
    "user_metadata": {
      "full_name": "John Doe",
      "role": "talent"
    }
  },
  "session": {
    "access_token": "jwt...",
    "refresh_token": "jwt...",
    "expires_in": 3600
  }
}
```

#### `POST /auth/v1/token?grant_type=password`
**Request:**
```json
{
  "email": "talent@example.com",
  "password": "SecurePassword123!"
}
```

**Response (200):**
```json
{
  "access_token": "jwt...",
  "refresh_token": "jwt...",
  "expires_in": 3600,
  "user": {
    "id": "uuid",
    "email": "talent@example.com"
  }
}
```

#### `POST /auth/v1/logout`
**Request:**
```json
{
  "scope": "global"
}
```

**Response (204):**
No content

### Custom Endpoints (Next.js API Routes)

#### `GET /api/user/profile`
**Headers:**
```
Authorization: Bearer <access_token>
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "talent@example.com",
  "role": "talent",
  "full_name": "John Doe",
  "created_at": "2026-02-02T10:00:00Z"
}
```

#### `PATCH /api/user/profile`
**Headers:**
```
Authorization: Bearer <access_token>
```

**Request:**
```json
{
  "full_name": "Jane Doe"
}
```

**Response (200):**
```json
{
  "id": "uuid",
  "email": "talent@example.com",
  "role": "talent",
  "full_name": "Jane Doe",
  "updated_at": "2026-02-02T10:30:00Z"
}
```

---

## 🎨 Design System (Preserved from Current)

### Color Tokens
```css
/* Primary Palette */
--accent: #8B5CF6;        /* Purple - Primary actions, admin */
--secondary: #1F2937;     /* Dark gray - Text, headers */
--danger: #EF4444;        /* Red - Errors, delete actions */
--success: #10B981;       /* Green - Success states */
--warning: #F59E0B;       /* Amber - Warnings, pinned */

/* Background */
--bg-primary: #FFFFFF;
--bg-secondary: #F9FAFB;
--bg-accent: #F3F4F6;

/* Text */
--text-primary: #1F2937;
--text-secondary: #6B7280;
--text-light: #9CA3AF;

/* Borders */
--border-default: #E5E7EB;
--border-accent: rgba(139, 92, 246, 0.2);
```

### Typography
```css
/* Headings */
font-family: 'Galindo', cursive;

/* Body Text */
font-family: 'Outfit', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem;    /* 12px */
--text-sm: 0.875rem;   /* 14px */
--text-base: 1rem;     /* 16px */
--text-lg: 1.125rem;   /* 18px */
--text-xl: 1.25rem;    /* 20px */
--text-2xl: 1.5rem;    /* 24px */
--text-3xl: 1.875rem;  /* 30px */
```

### Component Classes (Tailwind)

#### Button Variants
```tsx
// Primary (Purple)
className="bg-accent text-white hover:bg-purple-700 px-4 py-2 rounded-lg"

// Outline
className="border border-accent text-accent bg-white hover:bg-purple-50 px-4 py-2 rounded-lg"

// Danger
className="bg-danger text-white hover:bg-red-600 px-4 py-2 rounded-lg"

// Success
className="bg-success text-white hover:bg-green-600 px-4 py-2 rounded-lg"
```

#### Badge Variants
```tsx
// Default (Gray)
className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700"

// Success (Green)
className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700"

// Warning (Yellow)
className="px-2 py-1 text-xs rounded-full bg-amber-100 text-amber-700"

// Danger (Red)
className="px-2 py-1 text-xs rounded-full bg-red-100 text-red-700"
```

#### Input Fields
```tsx
className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
```

---

## 📱 Wireframes

### Login Page (`/login`)
```
╔════════════════════════════════════════════════════════╗
║                    SET LIFE CASTING                    ║
║                      [Logo/Brand]                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║              Welcome Back                              ║
║              Sign in to your account                   ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Email                                      │    ║
║    │ ┌────────────────────────────────────────┐│    ║
║    │ │ your@email.com                         ││    ║
║    │ └────────────────────────────────────────┘│    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Password                                   │    ║
║    │ ┌────────────────────────────────────────┐│    ║
║    │ │ ••••••••••••                            ││    ║
║    │ └────────────────────────────────────────┘│    ║
║    │                      [Forgot Password?]   │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │          [Sign In] (Purple Button)         │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║         Don't have an account? [Sign Up]              ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Features:
- Email/password fields with validation
- "Forgot Password?" link (triggers Supabase password reset)
- Redirect parameter support (?redirect=/admin/submissions)
- Error messages in red below form
- Loading state on button click
```

### Signup Page (`/signup`)
```
╔════════════════════════════════════════════════════════╗
║                    SET LIFE CASTING                    ║
║                      [Logo/Brand]                      ║
╠════════════════════════════════════════════════════════╣
║                                                        ║
║              Create Your Account                       ║
║              Join as talent or admin                   ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Full Name                                  │    ║
║    │ ┌────────────────────────────────────────┐│    ║
║    │ │ John Doe                                ││    ║
║    │ └────────────────────────────────────────┘│    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Email                                      │    ║
║    │ ┌────────────────────────────────────────┐│    ║
║    │ │ your@email.com                         ││    ║
║    │ └────────────────────────────────────────┘│    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ Password                                   │    ║
║    │ ┌────────────────────────────────────────┐│    ║
║    │ │ ••••••••••••                            ││    ║
║    │ └────────────────────────────────────────┘│    ║
║    │ Must be at least 8 characters             │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │ I am signing up as:                        │    ║
║    │  ( ) Talent  (•) Admin                     │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║    ┌────────────────────────────────────────────┐    ║
║    │        [Create Account] (Purple Button)    │    ║
║    └────────────────────────────────────────────┘    ║
║                                                        ║
║         Already have an account? [Sign In]            ║
║                                                        ║
╚════════════════════════════════════════════════════════╝

Features:
- Full name, email, password fields
- Role selection (talent/admin radio buttons)
- Password requirements shown
- Email verification notice after signup
- Error messages in red below form
```

### Admin Dashboard (`/admin/submissions`) - LAYOUT UNCHANGED
```
╔════════════════════════════════════════════════════════════════╗
║ [Logo] SET LIFE   [Projects▼] [Submissions] [Roles]  [Logout] ║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  Submissions                                    👤 Admin Name  ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  [Filter: All Projects ▼] [Status: All ▼]  🔍 [Search...]     ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │ □  📸 John Doe        Role: Lead Actor    [Pinned] (🟡)  │ ║
║  │    Chicago, IL        Project: Film Title                │ ║
║  │    Submitted: 2h ago                      [View Details] │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │ □  📸 Jane Smith      Role: Supporting    [Booked] (🟢)  │ ║
║  │    Los Angeles, CA    Project: TV Series                 │ ║
║  │    Submitted: 1d ago                      [View Details] │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │ □  📸 Mike Johnson    Role: Extra         [New] (⚪)      │ ║
║  │    New York, NY       Project: Commercial                │ ║
║  │    Submitted: 3d ago                      [View Details] │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  [Pin Selected] [Book Selected] [Reject Selected]             ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

IMPORTANT:
- Design and layout preserved EXACTLY as is
- Only authentication mechanism changes (Firebase → Supabase)
- Submissions data still from Firestore
- Role checking now from Supabase public.users table
```

### Talent Dashboard (`/dashboard`) - LAYOUT UNCHANGED
```
╔════════════════════════════════════════════════════════════════╗
║ [Logo] SET LIFE   [Browse Roles] [Dashboard] [Profile] [Logout]║
╠════════════════════════════════════════════════════════════════╣
║                                                                ║
║  My Submissions                              👤 Talent Name    ║
║  ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━  ║
║                                                                ║
║  ┌──────────────────────────────────────────────────────────┐ ║
║  │  Lead Actor - Film Title                                 │ ║
║  │  Status: Under Review                         [View ▸]   │ ║
║  │  Submitted: 2 days ago                                   │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │  Supporting Role - TV Series                             │ ║
║  │  Status: Booked ✓ (Green)                     [View ▸]   │ ║
║  │  Submitted: 1 week ago                                   │ ║
║  ├──────────────────────────────────────────────────────────┤ ║
║  │  Extra - Commercial                                      │ ║
║  │  Status: Not Selected                         [View ▸]   │ ║
║  │  Submitted: 2 weeks ago                                  │ ║
║  └──────────────────────────────────────────────────────────┘ ║
║                                                                ║
║  No active submissions? [Browse Open Roles]                   ║
║                                                                ║
╚════════════════════════════════════════════════════════════════╝

IMPORTANT:
- Design and layout preserved EXACTLY as is
- Only authentication mechanism changes
- Talent sees simplified status (Under Review, Booked, Not Selected)
- Email verification banner shows if email not confirmed
```

---

## 🗑️ Files to Delete & Modify

### DELETE These Files (Auth-Related Only)

#### If Dedicated to Firebase Auth
```
src/lib/firebase/auth.ts            [DELETE if exists]
src/hooks/useFirebaseAuth.ts        [DELETE if exists]
src/utils/firebase-auth.ts          [DELETE if exists]
```

**IMPORTANT**: Extract Firestore initialization before deleting:
- If `src/lib/firebase/config.ts` contains both auth AND Firestore, extract Firestore to new file first
- If `src/lib/firebase/admin.ts` contains both, extract Firestore Admin to new file first

### MODIFY These Files (Replace Firebase with Supabase)

#### Core Auth Files
```
src/contexts/AuthContext.tsx        [MAJOR REWRITE]
src/middleware.ts                   [MAJOR REWRITE]
src/app/login/page.tsx              [MAJOR REWRITE]
src/app/signup/page.tsx             [MAJOR REWRITE]
```

#### Configuration
```
.env.local                          [UPDATE]
package.json                        [UPDATE dependencies]
```

### CREATE These New Files

```
src/lib/supabase/config.ts          [NEW - Client initialization]
src/lib/supabase/server.ts          [NEW - Server helpers]
src/lib/supabase/admin.ts           [NEW - Admin operations]
```

### KEEP UNCHANGED (Firestore Operations)

```
src/lib/firebase/roles.ts           [NO CHANGES]
src/lib/firebase/submissions.ts     [NO CHANGES - if exists]
src/lib/firebase/projects.ts        [NO CHANGES - if exists]
src/lib/firebase/storage.ts         [NO CHANGES]
src/app/admin/submissions/page.tsx  [NO CHANGES to logic]
src/app/admin/roles/page.tsx        [NO CHANGES to logic]
src/app/dashboard/page.tsx          [NO CHANGES to logic]
```

---

## 🚀 Implementation Phases

### Phase 1: Supabase Setup (Week 1)
**Goal**: Configure Supabase project and database schema

**Tasks**:
- [ ] Create Supabase project at https://supabase.com
- [ ] Configure project settings (URL, anon key, service role key)
- [ ] Set up PostgreSQL database schema (run SQL migrations)
- [ ] Create `public.users` table with RLS policies
- [ ] Configure email templates for verification/password reset
- [ ] Test signup/login via Supabase dashboard
- [ ] Document environment variables needed

**Deliverables**:
- Supabase project URL: `https://[PROJECT_REF].supabase.co`
- Anon key and service role key
- SQL migration script (`supabase/migrations/001_users_table.sql`)
- Updated `.env.local.example` template

**Validation**:
- ✅ Can manually create user in Supabase dashboard
- ✅ Email verification emails send successfully
- ✅ RLS policies prevent unauthorized access (test with dummy users)

---

### Phase 2: Core Authentication Migration (Weeks 2-3)
**Goal**: Replace Firebase auth with Supabase while keeping app functional

**Tasks**:

#### 2.1: Install Dependencies
```bash
npm install @supabase/supabase-js @supabase/ssr
```

#### 2.2: Create Supabase Configuration Files

**File: `src/lib/supabase/config.ts`**
```typescript
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}
```

**File: `src/lib/supabase/server.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { cookies } from 'next/headers'

export function createClient() {
  const cookieStore = cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return cookieStore.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
}
```

**File: `src/lib/supabase/admin.ts`**
```typescript
import { createClient } from '@supabase/supabase-js'

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function getUserRole(userId: string): Promise<string | null> {
  const { data, error } = await supabaseAdmin
    .from('users')
    .select('role')
    .eq('id', userId)
    .single()

  if (error) return null
  return data?.role || null
}
```

#### 2.3: Update Middleware

**File: `src/middleware.ts`**
```typescript
import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // CRITICAL: Call cookies() before Supabase to opt out of caching
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return request.cookies.get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value,
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: CookieOptions) {
          request.cookies.set({
            name,
            value: '',
            ...options,
          })
          response = NextResponse.next({
            request: {
              headers: request.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Check if user is authenticated
  const { data: { user } } = await supabase.auth.getUser()

  // Protect /admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    if (!user) {
      return NextResponse.redirect(
        new URL(`/login?redirect=${request.nextUrl.pathname}`, request.url)
      )
    }

    // Check if user is admin
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', user.id)
      .single()

    if (userData?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // CRITICAL: Update session to prevent weird app behavior
  await supabase.auth.updateSession()

  return response
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
}
```

#### 2.4: Update AuthContext

**File: `src/contexts/AuthContext.tsx`**
```typescript
'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { User } from '@supabase/supabase-js'
import { createClient } from '@/lib/supabase/config'

interface UserData {
  id: string
  email: string
  role: 'admin' | 'talent'
  full_name?: string
}

interface AuthContextType {
  user: User | null
  userData: UserData | null
  isAdmin: boolean
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userData: null,
  isAdmin: false,
  loading: true,
  signOut: async () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userData, setUserData] = useState<UserData | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setLoading(false)
      }
    })

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
      if (session?.user) {
        loadUserData(session.user.id)
      } else {
        setUserData(null)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function loadUserData(userId: string) {
    const { data, error } = await supabase
      .from('users')
      .select('id, email, role, full_name')
      .eq('id', userId)
      .single()

    if (!error && data) {
      setUserData(data as UserData)
    }
    setLoading(false)
  }

  async function signOut() {
    await supabase.auth.signOut()
    setUser(null)
    setUserData(null)
  }

  const isAdmin = userData?.role === 'admin'

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
```

#### 2.5: Update Login Page

**File: `src/app/login/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/config'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirect = searchParams.get('redirect') || '/dashboard'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    if (!data.user?.email_confirmed_at) {
      setError('Please verify your email before logging in')
      await supabase.auth.signOut()
      setLoading(false)
      return
    }

    // Get user role to determine redirect
    const { data: userData } = await supabase
      .from('users')
      .select('role')
      .eq('id', data.user.id)
      .single()

    if (userData?.role === 'admin') {
      router.push(redirect.startsWith('/admin') ? redirect : '/admin/submissions')
    } else {
      router.push('/dashboard')
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-galindo)' }}>
            Welcome Back
          </h2>
          <p className="mt-2 text-sm text-gray-600">Sign in to your account</p>
        </div>

        <form onSubmit={handleLogin} className="mt-8 space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <div className="mt-2 text-right">
              <Link href="/reset-password" className="text-sm text-accent hover:underline">
                Forgot Password?
              </Link>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link href="/signup" className="text-accent hover:underline">
            Sign Up
          </Link>
        </p>
      </div>
    </div>
  )
}
```

#### 2.6: Update Signup Page

**File: `src/app/signup/page.tsx`**
```typescript
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/config'
import { supabaseAdmin } from '@/lib/supabase/admin'
import Link from 'next/link'

export default function SignupPage() {
  const router = useRouter()

  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'talent' | 'admin'>('talent')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const supabase = createClient()

  async function handleSignup(e: React.FormEvent) {
    e.preventDefault()
    setError('')
    setLoading(true)

    // Sign up user with Supabase Auth
    const { data, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
          role: role,
        },
      },
    })

    if (signUpError) {
      setError(signUpError.message)
      setLoading(false)
      return
    }

    if (!data.user) {
      setError('Signup failed. Please try again.')
      setLoading(false)
      return
    }

    // Create user record in public.users table
    const { error: insertError } = await supabase
      .from('users')
      .insert({
        id: data.user.id,
        email: data.user.email,
        role: role,
        full_name: fullName,
      })

    if (insertError) {
      setError('Failed to create user profile. Please contact support.')
      setLoading(false)
      return
    }

    // Show success message
    alert('Account created! Please check your email to verify your account.')
    router.push('/login')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-galindo)' }}>
            Create Your Account
          </h2>
          <p className="mt-2 text-sm text-gray-600">Join as talent or admin</p>
        </div>

        <form onSubmit={handleSignup} className="mt-8 space-y-6">
          <div>
            <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-accent focus:border-transparent"
            />
            <p className="mt-1 text-xs text-gray-500">Must be at least 8 characters</p>
          </div>

          <div>
            <p className="block text-sm font-medium text-gray-700 mb-2">I am signing up as:</p>
            <div className="space-y-2">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="talent"
                  checked={role === 'talent'}
                  onChange={(e) => setRole('talent')}
                  className="mr-2"
                />
                <span>Talent</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="role"
                  value="admin"
                  checked={role === 'admin'}
                  onChange={(e) => setRole('admin')}
                  className="mr-2"
                />
                <span>Admin</span>
              </label>
            </div>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-white py-2 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link href="/login" className="text-accent hover:underline">
            Sign In
          </Link>
        </p>
      </div>
    </div>
  )
}
```

**Deliverables**:
- ✅ Working login/signup with Supabase
- ✅ Middleware protecting /admin routes
- ✅ AuthContext providing same interface to components
- ✅ No Firebase auth code remaining

**Validation**:
- ✅ User can sign up and receive verification email
- ✅ User can log in after verifying email
- ✅ Admin user can access /admin routes
- ✅ Talent user redirected away from /admin
- ✅ Session persists across page refreshes

---

### Phase 3: Testing & Validation (Week 4)

**Goal**: Ensure all auth flows work perfectly

**Test Scenarios**:

1. **Talent Signup & Email Verification**
2. **Admin Signup & Dashboard Access**
3. **Login with Redirect Parameter**
4. **Email Not Verified Error Handling**
5. **Password Reset Flow**
6. **Unauthorized Admin Access Attempt**
7. **Session Expiry & Auto-Refresh**
8. **Concurrent Sessions**

(See full test scenarios in Testing section below)

---

### Phase 4: Environment Variables Migration (Week 5)

**Update `.env.local`**:

```env
# DELETE (if only used for auth):
# NEXT_PUBLIC_FIREBASE_API_KEY=...
# NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=...

# KEEP (for Firestore):
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-bucket

# ADD:
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

### Phase 5: Cleanup (Week 6)

**Tasks**:
- [ ] Remove unused Firebase auth imports
- [ ] Delete old Firebase auth files (if separate from Firestore)
- [ ] Update package.json (remove firebase auth if separate)
- [ ] Update documentation
- [ ] Remove auth-related debug logs

---

## 🧪 Testing Strategy

### Test Scenarios

#### 1. Talent Signup Flow
```
Steps:
1. Navigate to /signup
2. Enter email, password, full name
3. Select "Talent" role
4. Click "Create Account"
5. Check email for verification link
6. Click verification link
7. Redirected to /login
8. Log in with credentials
9. Redirected to /dashboard

Expected:
- User created in auth.users
- User created in public.users with role='talent'
- Email verification sent
- Can access /dashboard after login
- Cannot access /admin routes

Test Data:
- Email: talent-test@example.com
- Password: TestPassword123!
- Full Name: Test Talent
```

#### 2. Admin Signup Flow
```
Steps:
1. Navigate to /signup
2. Enter credentials, select "Admin"
3. Verify email
4. Log in
5. Redirected to /admin/submissions

Expected:
- User created with role='admin'
- Can access /admin routes
- Cannot be blocked by middleware

Test Data:
- Email: admin-test@example.com
- Password: AdminPassword123!
```

#### 3. Login with Redirect
```
Steps:
1. Logout (clear session)
2. Navigate to /admin/submissions
3. Redirected to /login?redirect=/admin/submissions
4. Enter admin credentials
5. Submit login

Expected:
- Middleware catches unauthorized access
- Redirected to login with redirect param preserved
- After login, redirected to /admin/submissions (not /dashboard)
```

#### 4. Email Not Verified
```
Steps:
1. Create account but don't click verification link
2. Attempt to log in

Expected:
- Error: "Please verify your email before logging in"
- User logged out
- Cannot proceed
```

#### 5. Password Reset Flow
```
Steps:
1. Navigate to /login
2. Click "Forgot Password?"
3. Enter email
4. Check inbox for reset link
5. Click link
6. Enter new password
7. Log in with new password

Expected:
- Password reset email sent by Supabase
- Old password no longer works
- New password allows login
```

#### 6. Unauthorized Admin Access
```
Steps:
1. Log in as talent
2. Navigate to /admin/submissions

Expected:
- Middleware checks role
- Role is 'talent', not 'admin'
- Redirected to / (home)
```

#### 7. Session Expiry
```
Steps:
1. Log in
2. Wait for access token expiry (or manually expire)
3. Navigate to protected page

Expected:
- Session auto-refreshes using refresh token
- User stays logged in
- No interruption
```

#### 8. Concurrent Sessions
```
Steps:
1. Log in on Chrome
2. Log in on Firefox (same account)
3. Log out on Chrome
4. Check Firefox

Expected:
- Both sessions independent
- Logout in one doesn't affect other
```

---

## 🔒 Security Requirements

### Password Requirements
- Minimum 8 characters
- Enforced by Supabase Auth

### Session Security
- Access tokens: 1 hour expiry
- Refresh tokens: 30 days expiry
- Refresh token rotation enabled
- HTTP-only cookies
- SameSite=Lax
- HTTPS enforced in production

### Email Verification
- Required before login
- Verification links expire after 24 hours

### Row Level Security
```sql
-- Users can read own data
CREATE POLICY "Users can read own data"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

-- Admins can read all users
CREATE POLICY "Admins can read all users"
  ON public.users FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Users cannot change their role
CREATE POLICY "Users cannot change role"
  ON public.users FOR UPDATE
  USING (auth.uid() = id)
  WITH CHECK (role = (SELECT role FROM public.users WHERE id = auth.uid()));
```

---

## 📊 Success Metrics

### Functional
- ✅ 100% auth flows working
- ✅ 0 Firebase auth code remaining
- ✅ All features working
- ✅ Email verification enforced

### Performance
- ✅ Login page load < 1.5s
- ✅ Middleware response < 200ms
- ✅ Session refresh < 500ms

### Security
- ✅ RLS policies prevent unauthorized access
- ✅ No session hijacking vulnerabilities
- ✅ HTTPS enforced
- ✅ No hardcoded secrets

---

## 🔄 Rollback Plan

### If Issues During Deployment

**Option 1: Git Rollback**
```bash
git revert <commit-hash>
git push origin main
```

**Option 2: Feature Flag**
```typescript
const AUTH_PROVIDER = process.env.NEXT_PUBLIC_AUTH_PROVIDER || 'supabase';
// Toggle between 'firebase' and 'supabase'
```

---

## 📚 Research References

1. **Supabase Official Docs**: https://supabase.com/docs/guides/auth/quickstarts/nextjs
   - @supabase/ssr package (2026 recommended)
   - Must call updateSession() in middleware

2. **Next.js 14 + Supabase**: https://supabase.com/docs/guides/auth/server-side
   - Server-side auth patterns
   - Cookie management

3. **Enterprise Migration**: Microsoft Auth Modernization 2026
   - Timeline: 6-8 weeks (lean)
   - Least-privilege access

4. **Firebase to Supabase**: Official migration guide
   - Run both backends in parallel
   - Migrate auth first, then data

---

## 🎯 Definition of Done

- [ ] All 8 test scenarios pass
- [ ] No Firebase auth code remains
- [ ] Documentation updated
- [ ] Supabase configured in production
- [ ] Environment variables documented
- [ ] Security audit completed
- [ ] Performance benchmarks met
- [ ] Rollback plan tested
- [ ] Email templates customized
- [ ] Admin access restricted correctly
- [ ] Firestore data still accessible
- [ ] Design/layout unchanged

---

**Last Updated**: 2026-02-02
**Version**: 1.0
**Status**: Ready for Implementation
