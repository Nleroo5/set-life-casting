# 🎯 CLAUDE: READ THIS BEFORE ANY AUTH WORK

**Last Updated**: 2026-02-04 (Phase 2 Complete)
**Current Phase**: 3 - Update Middleware
**Current Task**: Ready to start Phase 3

---

## ⚠️ CRITICAL PROTOCOL

Before making ANY code changes:
1. ✅ Read this file
2. ✅ Read AUTH_PROGRESS.md
3. ✅ Check git status
4. ✅ Verify current phase prerequisites complete

After making ANY change:
1. ✅ Create git commit immediately
2. ✅ Update AUTH_PROGRESS.md
3. ✅ Update this file with next task
4. ✅ Request user validation

---

## 📍 CURRENT STATE

### What's Been Done
- ✅ Created specification documents
  - AUTH_REBUILD_SPEC.md (technical details)
  - AUTH_REBUILD_CLAUDE.md (implementation guide)
  - AUTH_DELETION_PLAN.md (file management)
  - AUTH_REBUILD_GUIDE.md (getting started)
- ✅ User approved professional implementation approach
- ✅ Phase 0 COMPLETE - Infrastructure setup (commit c5d0f2b)
  - CLAUDE_READ_THIS_FIRST.md
  - AUTH_PROGRESS.md
  - 7 code templates
- ✅ Phase 1 COMPLETE - Supabase Database Setup (commit 382aebe)
  - public.users table created
  - RLS enabled with 3 policies
  - Checkpoint: AUTH_PHASE1_COMPLETE.md
- ✅ Phase 2 COMPLETE - Create Supabase Client Files
  - Browser client (config.ts) created
  - Server client (server.ts) created with Next.js 16 async cookies
  - Admin client (admin.ts) created with helper functions
  - Environment variables configured
  - Build verified successful
  - Checkpoint: AUTH_PHASE2_COMPLETE.md

### Current Phase Details
**Phase**: 3 - Update Middleware
**Goal**: Replace Firebase token validation with Supabase session checking
**Status**: Ready to start

---

## 🎯 NEXT TASK

**Task ID**: MIDDLEWARE-001
**Description**: Update middleware to use Supabase server client
**Action**: Replace Firebase imports with Supabase in src/middleware.ts
**Validation**: Middleware compiles without errors
**Progress**: Phase 2 ✅ → Phase 3 Ready to Start

---

## 📊 PHASE OVERVIEW

### Phase 0: Setup (Current) ⏳
- Create tracking files
- Create code templates
- Create validation scripts
- **Exit Criteria**: All infrastructure files created

### Phase 1: Supabase Database Setup 🔜
- Set up Supabase project
- Run SQL migrations
- Configure RLS policies
- **Exit Criteria**: Can create users in Supabase dashboard

### Phase 2: Create Supabase Client Files 🔜
- Create config.ts (browser client)
- Create server.ts (server client)
- Create admin.ts (admin client)
- **Exit Criteria**: All files compile without errors

### Phase 3: Update Middleware 🔜
- Replace Firebase auth check with Supabase
- Implement updateSession()
- Test /admin protection
- **Exit Criteria**: Admin routes protected correctly

### Phase 4: Update AuthContext 🔜
- Replace Firebase hooks with Supabase
- Maintain same interface
- Test auth state management
- **Exit Criteria**: Auth context loads user data

### Phase 5: Update Login/Signup Pages 🔜
- Update login page (preserve design)
- Update signup page (preserve design)
- Test full auth flow
- **Exit Criteria**: Can sign up and log in

### Phase 6: Cleanup & Final Testing 🔜
- Remove old Firebase auth code
- Run all 8 test scenarios
- Final validation
- **Exit Criteria**: All tests pass, no errors

---

## 🔗 REFERENCE DOCUMENTS

| Document | Purpose | When to Read |
|----------|---------|-------------|
| AUTH_REBUILD_SPEC.md | Technical specification | Need code examples or architecture details |
| AUTH_REBUILD_CLAUDE.md | Implementation guide | Need step-by-step instructions |
| AUTH_DELETION_PLAN.md | File management | Need to know what to delete/keep |
| AUTH_PROGRESS.md | Progress tracker | Start of every session |
| CLAUDE_READ_THIS_FIRST.md | Session anchor | Before EVERY action |

---

## 🚨 IF CHAT COMPACTS

### Recovery Procedure
1. Read this file (shows current state)
2. Read AUTH_PROGRESS.md (shows what's complete)
3. Run `git log --oneline -10` (shows recent commits)
4. Read template for current task
5. Resume exactly where left off

### Context Anchors (Never Lost)
- ✅ This file (on disk)
- ✅ AUTH_PROGRESS.md (on disk)
- ✅ Git commits (permanent history)
- ✅ Template files (reference code)
- ✅ Validation scripts (test commands)

---

## 🔐 SUPABASE CREDENTIALS

**Project URL**: https://inhdkjjrahvhrdkbkiogw.supabase.co
**Anon Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaGRqanJhaHZocmRrYmtpb2d3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzAwNjkxNDAsImV4cCI6MjA4NTY0NTE0MH0.0rAYfBG2tZ2NJWCECBiGmhbK2Ei6g21-HxEWUZEi_kU
**Service Role Key**: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImluaGRqanJhaHZocmRrYmtpb2d3Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3MDA2OTE0MCwiZXhwIjoyMDg1NjQ1MTQwfQ.7bZWUaUNKHCnLTznrDqHSMFi4NzkkEM60SQWcIw2GCo

---

## 🎨 DESIGN PRESERVATION RULES

**NEVER CHANGE**:
- Colors (Purple #8B5CF6, etc.)
- Fonts (Galindo, Outfit)
- Button/input styling
- Layout/spacing
- Component structure

**ONLY CHANGE**:
- Authentication mechanism (Firebase → Supabase)
- Auth-related imports
- Session management logic

---

## 📋 VALIDATION REQUIREMENTS

Every task must pass validation before marking complete:
- **Compile Test**: `npm run build` succeeds
- **Type Check**: `npx tsc --noEmit` succeeds
- **Functional Test**: Feature works as expected
- **User Confirmation**: User validates and approves

---

## 🔄 WORKFLOW PATTERN

```
1. Read CLAUDE_READ_THIS_FIRST.md ← YOU ARE HERE
2. Read AUTH_PROGRESS.md
3. Identify next task
4. Read template file (if coding task)
5. Make ONE focused change
6. Create git commit
7. Update AUTH_PROGRESS.md
8. Update CLAUDE_READ_THIS_FIRST.md
9. Request user validation
10. Wait for approval
11. GOTO 1
```

---

## ✅ READY TO PROCEED

**Current Action**: Create AUTH_PROGRESS.md tracking file
**After This**: Create template files
**Then**: Create validation scripts
**Finally**: Begin Phase 1 implementation

---

**Remember**: Professional = Methodical, Documented, Validated, Checkpointed
