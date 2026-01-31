# Set Life Casting - Claude Code Guidelines

## 🎯 Project Overview

**What**: Next.js 14 casting platform connecting talent with production companies
**Stack**: Next.js 14 (App Router), TypeScript, Firebase (Auth, Firestore, Storage), Tailwind CSS
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

### Debug Logging
**WHEN TO REMOVE**: Debug console.log statements should be removed once debugging is complete, unless the user wants to keep them.

**CURRENT DEBUG LOGS** (ask before removing):
- `[MIDDLEWARE DEBUG]` in src/middleware.ts
- `[LOGIN DEBUG]` in src/app/login/page.tsx
- `[AUTH CONTEXT DEBUG]` in src/contexts/AuthContext.tsx
- `[TALENT PROFILE DEBUG]` in src/app/admin/talent/[userId]/page.tsx

---

## 📁 Project Structure

### Key Directories
```
src/
├── app/                    # Next.js App Router pages
│   ├── admin/             # Admin-only pages (protected by middleware)
│   ├── profile/create/    # Multi-step profile creation form
│   ├── login/             # Login page
│   └── signup/            # Signup page
├── components/
│   ├── casting/steps/     # Profile creation form steps
│   └── ui/                # Reusable UI components
├── contexts/
│   └── AuthContext.tsx    # Firebase auth + Firestore user data
├── lib/
│   ├── firebase/          # Firebase config and utilities
│   ├── schemas/           # Zod validation schemas
│   └── utils/             # Utility functions
└── middleware.ts          # Route protection (checks firebase-token cookie)
```

### Critical Files
- **src/middleware.ts**: Protects /admin routes, checks firebase-token cookie
- **src/contexts/AuthContext.tsx**: Manages auth state, userData loading, token refresh
- **src/lib/schemas/casting.ts**: Profile form validation schemas
- **src/app/profile/create/page.tsx**: Multi-step profile creation
- **src/app/admin/submissions/page.tsx**: Admin submission review

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

### Run Tests
```bash
npm test
```

### Lint Code
```bash
npm run lint
```

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

### Firebase Patterns
- Auth state managed by AuthContext
- Use Firestore converters where needed
- Cookie-based auth tokens for middleware (expires 1 hour)
- Profile data stored in "profiles" collection keyed by userId

### Styling
- Use Tailwind CSS utility classes
- Follow existing color scheme (accent, secondary, danger, success)
- Use custom fonts: Galindo (headings), Outfit (body)

---

## 🔒 Security & Authentication

### Current Architecture
1. **Middleware** (src/middleware.ts): Checks firebase-token cookie on /admin routes
2. **Client Auth** (AuthContext): Manages user state, role checking
3. **Firestore Rules**: Server-side role enforcement (not in codebase)

### Auth Flow
- Login sets firebase-token cookie (1 hour expiry)
- Middleware intercepts /admin routes, checks cookie
- If cookie missing/expired, redirects to /login?redirect=[original-path]
- Login page respects redirect parameter for all users (including admins)
- AuthContext loads userData from Firestore and checks isAdmin

**IMPORTANT**: Never remove router from useEffect dependencies - this was fixed to prevent infinite redirect loops.

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

### After Making Changes
1. Commit with clear, descriptive messages
2. Include "Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
3. DO NOT push unless explicitly requested
4. DO NOT create documentation files (*.md, README) unless explicitly requested

### Git Safety
- NEVER use destructive commands (reset --hard, push --force) without explicit request
- NEVER skip hooks (--no-verify, --no-gpg-sign)
- NEVER amend commits unless specifically asked
- Prefer staging specific files over "git add -A"

---

## 🧪 Testing & Quality

### Before Committing
- Ensure no TypeScript errors
- Run linter if available
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
- Modifying authentication, security, or data validation logic
- Removing debug logs or comments

**YOU CAN PROCEED** without asking when:
- The request is clear and specific
- The change is a simple bug fix
- You're following an established pattern in the codebase

---

## 📝 Notes

- Localhost runs on port 3002, not 3000
- Firebase config uses environment variables
- Email verification required before profile submission
- Admin role stored in Firestore users collection
- Photo upload uses Firebase Storage with compression

---

**Last Updated**: 2026-01-31
