# iGCSE Self-Study Foundation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the standalone foundation for the iGCSE Self-Study system: a new Hub repository, a dedicated Supabase project, secure roles/classes/account management, and a tested login/password-change flow, without touching Evidence Hub or the four live student apps.

**Architecture:** A new `igcse-self-study-hub` web app talks to a dedicated Supabase project. Supabase Auth owns passwords; application tables own roles, classes and memberships with RLS. This plan stops before instrumenting Paraphrasing, Reading, Essay Writing or Listening.

**Tech Stack:** Static web app (HTML/CSS/JS), Supabase Auth, Postgres, Row Level Security, Vitest/Playwright or equivalent browser tests as appropriate.

**Spec:** `docs/superpowers/specs/2026-10-13-igcse-self-study-hub-design.md`

## Global Constraints

- Do not modify Evidence Hub during this plan.
- Do not modify the four existing live student apps during this plan.
- Student accounts are admin/teacher controlled; no student self-registration.
- Roles are `admin`, `teacher`, `student`.
- Each student has exactly one active class membership at a time.
- A class may have multiple teachers.
- Passwords are handled only by Supabase Auth; never store plaintext passwords.
- Every exposed table uses RLS.
- Never expose a Supabase secret/service-role key in browser code.
- Authorization must not depend on user-editable metadata.
- Keep the backend independent from the Evidence Hub database.

## Review Focus

- A student manually calls the Data API for another student's row -> access must be denied by RLS.
- A teacher is assigned to Class A but guesses a Class B identifier -> no Class B students/activity may be returned.
- Two simultaneous transfers are attempted for one student -> database must preserve exactly one active class membership.
- A student's temporary-password flag is still true after login -> Hub must block normal navigation until password change succeeds.
- Supabase is temporarily unavailable after login page load -> user gets a clear failure state; no blank/broken page.

---

### Task 1: Create isolated Hub repository and test harness

**Files:**
- Create repo: `tobypottas-sketch/igcse-self-study-hub`
- Create: `index.html`
- Create: `src/app.js`
- Create: `src/config.js`
- Create: `src/auth.js`
- Create: `src/api.js`
- Create: `styles.css`
- Create: `tests/smoke.test.js`
- Create: `package.json`

**Interfaces:**
- Produces: `bootApp(): Promise<void>` in `src/app.js`
- Produces: `getSupabaseConfig(): { url: string, publishableKey: string }` in `src/config.js`

- [ ] **Step 1: Write the failing smoke test**

Assert that loading the Hub renders a root element and calls `bootApp()` without touching any existing app URL.

- [ ] **Step 2: Run the smoke test and verify failure**

Run: `npm test -- --run tests/smoke.test.js`
Expected: FAIL because the Hub files/functions do not exist.

- [ ] **Step 3: Create the minimal Hub shell and configuration boundary**

Implement `bootApp(): Promise<void>` and `getSupabaseConfig()` using only public/publishable client configuration.

- [ ] **Step 4: Run tests and verify pass**

Run: `npm test -- --run tests/smoke.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `chore: scaffold self-study hub`

---

### Task 2: Create dedicated Supabase schema and core constraints

**Files:**
- Create: `supabase/migrations/<generated>_self_study_foundation.sql`
- Create: `tests/sql/foundation.sql`

**Interfaces:**
- Produces tables: `profiles`, `classes`, `teacher_classes`, `student_class_memberships`, `apps`
- Produces role enum or equivalent constrained values: `admin`, `teacher`, `student`
- Produces uniqueness rule ensuring one active class membership per student

- [ ] **Step 1: Write SQL verification tests**

Assertions must cover table existence, allowed roles, foreign keys, and rejection of a second active membership for the same student.

- [ ] **Step 2: Run SQL tests and verify failure**

Run against the dedicated development Supabase database.
Expected: FAIL because schema is absent.

- [ ] **Step 3: Implement minimal schema**

Create the five tables, timestamps/audit columns, and a partial unique index or equivalent database constraint for one active membership per student.

- [ ] **Step 4: Run SQL tests and verify pass**

Expected: all assertions PASS.

- [ ] **Step 5: Run Supabase advisors/security checks**

Resolve any schema/security warnings relevant to these tables before committing.

- [ ] **Step 6: Commit**

Commit message: `feat: add self-study identity and class schema`

---

### Task 3: Add RLS and authorization policies

**Files:**
- Modify: `supabase/migrations/<generated>_self_study_foundation.sql` or add a second generated migration
- Create: `tests/sql/rls.sql`

**Interfaces:**
- Consumes: core tables from Task 2
- Produces: database-enforced access rules for admin, teacher and student roles

- [ ] **Step 1: Write failing RLS tests**

Cover: student own-profile read, student denied other-profile read, teacher assigned-class read, teacher denied unrelated-class read, admin full read.

- [ ] **Step 2: Run RLS tests and verify failure**

Expected: FAIL because policies are absent.

- [ ] **Step 3: Implement RLS policies**

Use authenticated user identity plus server-controlled authorization data. Do not authorize from user-editable metadata. Use `USING`/`WITH CHECK` correctly for updates.

- [ ] **Step 4: Run RLS tests and verify pass**

Expected: PASS for allowed cases and explicit denial for disallowed cases.

- [ ] **Step 5: Run security advisors again**

Expected: no unresolved high-risk findings for the new schema.

- [ ] **Step 6: Commit**

Commit message: `feat: secure self-study data with rls`

---

### Task 4: Implement controlled account provisioning

**Files:**
- Create: `src/admin/accounts.js`
- Create: `src/admin/classes.js`
- Create: `tests/admin-accounts.test.js`

**Interfaces:**
- Produces: `createStudentAccount(input)`
- Produces: `createTeacherAccount(input)`
- Produces: `assignTeacherToClass(teacherId, classId)`
- Produces: `assignStudentToClass(studentId, classId, changedBy)`
- Privileged auth creation runs only through a protected server/admin path; browser never receives a service-role key.

- [ ] **Step 1: Write failing account-management tests**

Assert: students cannot self-register; admin can create student/teacher accounts; created student profile has `must_change_password = true`.

- [ ] **Step 2: Run tests and verify failure**

Expected: FAIL because provisioning functions do not exist.

- [ ] **Step 3: Implement protected provisioning path**

Create Auth users with school email + temporary password, then create application profile/class membership. Roll back or report a clear error if profile creation fails after Auth user creation.

- [ ] **Step 4: Run tests and verify pass**

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add controlled account provisioning`

---

### Task 5: Implement login and forced first-password change

**Files:**
- Modify: `index.html`
- Modify: `src/auth.js`
- Modify: `src/app.js`
- Create: `src/views/login.js`
- Create: `src/views/change-password.js`
- Create: `tests/auth-flow.test.js`

**Interfaces:**
- Produces: `signIn(email, password): Promise<AuthResult>`
- Produces: `changePassword(newPassword): Promise<void>`
- Produces: `getCurrentProfile(): Promise<Profile>`
- `bootApp()` routes authenticated users with `must_change_password=true` only to the password-change view.

- [ ] **Step 1: Write failing auth-flow tests**

Cover valid login, invalid login, mandatory password-change gate, successful password change clearing the flag, and Supabase-unavailable error state.

- [ ] **Step 2: Run tests and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement login + change-password flow**

Keep copy concise and student-friendly. Do not add app launcher functionality yet beyond a protected placeholder home view.

- [ ] **Step 4: Run tests and verify pass**

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add secure student login flow`

---

### Task 6: Implement class assignment and transfer service

**Files:**
- Modify: `src/admin/classes.js`
- Create: `tests/class-transfer.test.js`
- Add migration only if a database function/transaction is needed

**Interfaces:**
- Produces: `transferStudent(studentId, newClassId, changedBy): Promise<TransferResult>`
- Guarantees one transaction closes the old membership and opens the new membership.

- [ ] **Step 1: Write failing transfer tests**

Cover: normal transfer, same-class no-op/rejection, concurrent-transfer protection, preserved old membership history, exactly one active membership after transfer.

- [ ] **Step 2: Run tests and verify failure**

Expected: FAIL.

- [ ] **Step 3: Implement transactional transfer logic**

Prefer a database transaction/function or equivalent atomic path rather than two unrelated browser writes.

- [ ] **Step 4: Run tests and verify pass**

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add safe student class transfers`

---

### Task 7: Seed app registry and protected Hub home placeholder

**Files:**
- Create: `supabase/seed.sql` or equivalent seed file
- Create: `src/views/home.js`
- Modify: `src/app.js`
- Create: `tests/home-access.test.js`

**Interfaces:**
- Seeds app keys: `paraphrasing`, `reading`, `essay_writing`, `listening`
- Produces: `renderHome(profile, apps)`
- No instrumentation changes to the four live apps in this task.

- [ ] **Step 1: Write failing home/access tests**

Assert: authenticated changed-password student sees four enabled app records; unauthenticated user sees login; disabled app is hidden; student cannot see teacher/admin controls.

- [ ] **Step 2: Run tests and verify failure**

Expected: FAIL.

- [ ] **Step 3: Seed registry and render protected home**

Use the current four app launch URLs as configuration data, not hard-coded throughout the UI.

- [ ] **Step 4: Run tests and verify pass**

Expected: PASS.

- [ ] **Step 5: Commit**

Commit message: `feat: add protected self-study hub home`

---

### Task 8: Foundation verification and handoff

**Files:**
- Create: `docs/foundation-verification.md`

**Interfaces:**
- Produces verified foundation ready for the next plan: shared tracking contract.

- [ ] **Step 1: Run full automated test suite**

Run: `npm test`
Expected: PASS.

- [ ] **Step 2: Run SQL/RLS verification suite**

Expected: all identity, role, class, membership and policy checks PASS.

- [ ] **Step 3: Manually verify critical user journeys**

Verify admin-created student -> temporary password login -> forced password change -> protected Hub home; two teachers assigned to one class; transfer retains history.

- [ ] **Step 4: Confirm isolation**

Verify no commits were made to Evidence Hub and no commits were made to `igcse-paraphrasing`, `igcse-reading`, `igcse-essay-writing`, or `igcse-listening` production branches as part of implementation.

- [ ] **Step 5: Record verification evidence and commit**

Commit message: `docs: verify self-study foundation`

## Next Plan Boundary

After this plan passes review, write a separate plan for the **shared tracking contract and session/event ingestion**. Only after that is verified should the four apps be instrumented one at a time. Evidence Hub remains out of scope until the final transplant plan.
