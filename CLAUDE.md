# Set Life Casting - Claude Code Guidelines

## 🎯 Project Overview

**What**: Next.js casting platform connecting talent with production companies
**Stack**: Next.js 16 (App Router), React 19, TypeScript, Supabase (Auth, Postgres with RLS, Storage), Tailwind CSS 4
**Purpose**: Allow talent to create profiles and submit to casting calls; admins review and manage submissions

---

## ⚠️ CRITICAL CONSTRAINTS

### NEVER Add Unsolicited Features
**IMPORTANT**: ONLY implement features, enhancements, or refactoring that are EXPLICITLY requested by the user. Do NOT:
- Add new features "for completeness"
- Refactor code that wasn't mentioned
- Add error handling, validation, or edge cases beyond what was asked
- Create abstractions, helpers, or utilities not specifically requested
- Add comments, docstrings, or type annotations to unchanged code
- Suggest "improvements" or "best practices" unless directly asked

**YOU MUST**: Ask for clarification if the scope is unclear rather than assuming what's needed.

### File Modification Rules
**IMPORTANT**: When fixing a bug or adding a feature:
- ONLY modify files directly related to the requested change
- Do NOT touch surrounding code "while you're in there"
- Do NOT clean up unrelated code
- Do NOT add defensive programming beyond what was requested
- If you think additional changes are needed, ASK FIRST

### Logging
All logging goes through `src/lib/logger.ts`. In production it emits only `logger.error`; `debug`/`info`/`warn` are suppressed. Do not add raw `console.log` calls.

---

## 📁 Project Structure

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin-only pages (protected by middleware + RLS)
│   ├── api/auth/          # Password-reset request route
│   ├── auth/              # callback (PKCE code exchange) + reset-password
│   ├── dashboard/         # Talent dashboard (client-guarded)
│   ├── profile/create/    # Multi-step profile creation form
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/
│   ├── casting/steps/     # Profile creation form steps
│   ├── sections/          # Homepage sections
│   └── ui/                # Reusable UI components
├── contexts/
│   └── AuthContext.tsx    # Supabase auth state + public.users row (role)
├── lib/
│   ├── supabase/          # config.ts (browser), server.ts (server/API), data modules
│   ├── schemas/           # Zod validation schemas
│   └── utils/             # Utility functions (redirect.ts validates ?redirect=)
└── middleware.ts          # Protects /admin: session check + service-role role lookup
supabase/
└── migrations/            # Schema, RLS policies, triggers — the DB is defined here
```

### Critical Files
- **src/middleware.ts**: Protects `/admin/*`; fails closed if the role lookup errors
- **src/contexts/AuthContext.tsx**: Manages session, loads `public.users` row, exposes `isAdmin`
- **src/lib/supabase/config.ts**: `createClient()` for client components (singleton in the browser)
- **src/lib/supabase/server.ts**: `createClient()` for route handlers / server components
- **src/lib/schemas/casting.ts**: Profile form validation schemas
- **src/app/profile/create/page.tsx**: Multi-step profile creation
- **src/app/admin/submissions/page.tsx**: Admin submission review
- **supabase/migrations/020_security_hardening.sql**, **021_close_signup_role_escalation.sql**: role-change guards and the `auth.users` → `public.users` trigger

---

## 🔧 Development Commands

### Start Development Server
```bash
npm run dev
# Server runs on http://localhost:3002
```

### Build for Production
```bash
npm run build
```

### Lint Code
```bash
npm run lint
```

There is no test suite. Verify changes with `npx tsc --noEmit`, a lint comparison (the repo has a pre-existing lint baseline of ~110 errors, mostly `no-explicit-any` in `src/lib/supabase/*`; the bar is *no new problems* in the files you touched), and a manual check in the browser.

---

## 🎨 Code Style & Patterns

### TypeScript
- Use TypeScript for all .tsx and .ts files
- Prefer type inference over explicit types where possible
- Use Zod schemas for runtime validation

### React Patterns
- Use "use client" directive for client components
- Prefer functional components with hooks
- Use useForm with react-hook-form + Zod for forms
- Keep components focused and single-responsibility

### Supabase Patterns
- Auth state managed by AuthContext; never call `getSession` in components
- Client components use `createClient()` from `@/lib/supabase/config`; route handlers use `@/lib/supabase/server`
- Data access lives in `src/lib/supabase/*.ts` (profiles, photos, submissions, casting, roles) — call those, don't inline queries in pages
- All tables have RLS; admin access is `public.users.role = 'admin'`
- Profile data stored in `profiles` keyed by `user_id`; photos in `photos`

### Styling
- Use Tailwind CSS utility classes
- Follow existing color scheme (accent, secondary, danger, success)
- Use custom fonts: `--font-galindo` (Lilita One, headings), `--font-outfit` (Outfit, body)

---

## 🔒 Security & Authentication

### Current Architecture
1. **Middleware** (src/middleware.ts): on `/admin/*`, verifies the Supabase session with `auth.getUser()`, then reads `public.users.role` with the service-role key. Non-admin or lookup error → redirect. `/dashboard` is guarded client-side only; its data is protected by RLS.
2. **Client Auth** (AuthContext): loads the `public.users` row, exposes `user`, `userData`, `isAdmin`, `loading`, `logout`
3. **Row Level Security** (supabase/migrations): every table; policies are the actual data boundary
4. **Role guards** (migrations 020/021): `role` is set to `'talent'` by trigger on signup; `authenticated` users can neither insert nor update a row to any other role. Admins are promoted only via the service role.

### Auth Flow
- Signup → Supabase sends a confirmation email → `/auth/callback` exchanges the PKCE code → `public.users` row was created by the `on_auth_user_created` trigger
- Login requires `email_confirmed_at`; unverified users are signed back out with a message
- `?redirect=` on `/login` and `?next=` on `/auth/callback` are validated by `validateRedirectUrl` — never redirect to a raw query value
- Password reset: `/api/auth/request-reset` → email → `/auth/callback?next=/auth/reset-password` → `updateUser`. The user is signed in after the exchange.
- `NEXT_PUBLIC_SITE_URL` must be set in every environment (it is the base of every emailed link)

**IMPORTANT**: The middleware's role lookup must keep failing closed. The admin layout deliberately does not gate on `isAdmin` (see its comment), so the middleware is the only thing between a non-admin and the admin UI.

---

## 🚀 Workflow Rules

### Before Making Changes
1. **YOU MUST** read relevant files first - NEVER propose changes to unread code
2. If the task is non-trivial, use EnterPlanMode and get user approval
3. For multi-step tasks, use TodoWrite to track progress

### When Making Changes
1. Make ONLY the requested changes - no extras
2. Avoid over-engineering - simpler is better
3. Don't add backwards-compatibility hacks
4. If something is unused, delete it completely (no `// removed` comments)
5. Schema or policy changes go in a new numbered file under `supabase/migrations/` — never edit an applied migration

### After Making Changes
1. Commit with clear, descriptive messages
2. Include the `Co-Authored-By` trailer for the Claude model that made the change
3. DO NOT push unless explicitly requested
4. DO NOT create documentation files (*.md, README) unless explicitly requested

### Git Safety
- NEVER use destructive commands (reset --hard, push --force) without explicit request
- NEVER skip hooks (--no-verify, --no-gpg-sign)
- NEVER amend commits unless specifically asked
- Prefer staging specific files over "git add -A"

---

## 🧪 Quality

### Before Committing
- `npx tsc --noEmit` passes
- `npm run lint` shows no new problems in the files you changed
- Test changed functionality manually

### Required Photos
- Headshot (type: "headshot") - REQUIRED
- Full body (type: "fullbody") - REQUIRED
- Up to 6 additional photos allowed

---

## ❓ When to Ask Questions

**YOU MUST ASK** before:
- Making architectural decisions with multiple valid approaches
- Refactoring code beyond the immediate fix
- Adding features that seem implied but weren't explicitly stated
- Modifying authentication, security, RLS policies, or data validation logic
- Removing comments

**YOU CAN PROCEED** without asking when:
- The request is clear and specific
- The change is a simple bug fix
- You're following an established pattern in the codebase

---

## 📝 Notes

- Localhost runs on port 3002, not 3000
- If `next dev`, `tsc` or `eslint` hang at ~0% CPU: this repo lives on an iCloud-synced Desktop and macOS evicts `node_modules` files (`ls -lO` shows `dataless`). Run tooling from a copy outside iCloud, or move the repo out of iCloud
- Supabase config uses `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (server only)
- Email verification required before login and before profile submission
- Admin role is `public.users.role = 'admin'`
- Photo upload uses Supabase Storage with compression
- The site logo is `public/images/logo.png`

---

**Last Updated**: 2026-09-03
