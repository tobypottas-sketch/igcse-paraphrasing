# iGCSE Self-Study Hub — Design Specification

Date: 2026-10-13
Status: Design approved in conversation; implementation not yet started

## 1. Purpose

Create a shared iGCSE self-study ecosystem around four existing student apps:

- Paraphrasing
- Reading
- Essay Writing
- Listening

The system must let students sign in once, use all four apps, and have meaningful activity recorded centrally. Teachers must be able to see class and student activity. The long-term destination for teacher-facing analytics is Evidence Hub (EH), but EH must remain untouched until the new feature is complete, tested, and ready to transplant.

## 2. Core constraints

1. Do not modify Evidence Hub during initial development.
2. Do not require Microsoft Entra / school-tenant administrator access for version 1.
3. Student accounts are teacher/admin controlled; students cannot self-register.
4. Students may change their password after first login.
5. Roles are Admin, Teacher, and Student.
6. Each student belongs to one current class at a time.
7. A class may have multiple teachers.
8. All teachers attached to a class may see the full activity/history of students in that class.
9. Students can transfer between classes without losing historical activity.
10. Existing Bitly links and existing app deployments must remain usable.
11. The four apps stay as separate repositories and deployments initially.
12. The new system must be designed so more iGCSE apps can be added later without redesigning the data model.

## 3. Recommended architecture

Use three isolated layers.

### A. Student Self-Study Hub

A new standalone web app/repository that provides:

- sign-in
- forced password change on first login
- student home page
- four app launcher cards
- account settings
- student progress summary
- logout

The Hub is the canonical entry point, but direct links to existing apps remain valid.

### B. Shared Self-Study backend

Use a dedicated Supabase project, separate from Evidence Hub.

Responsibilities:

- authentication
- user roles
- classes
- teacher-class assignments
- student-class membership
- transfer history
- app registry
- activity events
- sessions
- progress summaries
- audit fields
- Row Level Security

EH does not own this data during initial development.

### C. Teacher Analytics prototype

Build a standalone teacher/admin dashboard outside EH first.

Responsibilities:

- class overview
- student drill-down
- recent activity
- app-by-app activity
- session counts
- attempts
- accuracy where relevant
- completion measures
- weak-skill signals
- student transfer management
- class/teacher assignment management

Only after this prototype is stable and accepted is the teacher-facing module transplanted into EH.

## 4. Authentication model

Version 1 uses Supabase email/password authentication.

### Account creation

- Admin/authorised teacher creates student accounts.
- Students cannot self-register.
- Each student account uses the student's school email address.
- Admin supplies an initial temporary password.
- A `must_change_password` flag forces a password change after first successful login.
- Passwords are managed by Supabase Auth and are never stored as plaintext in application tables.

### Future Microsoft sign-in

Microsoft school SSO may be added later if school IT/Entra access becomes available. The v1 data model must not depend on Microsoft-specific identifiers.

## 5. Roles and permissions

### Admin

Can:

- create teachers
- create students
- create classes
- assign teachers to classes
- transfer students between classes
- deactivate accounts
- view all self-study activity
- manage app registry and system settings

### Teacher

Can:

- view assigned classes
- view all students in assigned classes
- view full self-study activity/history for those students
- view class-level analytics
- view student-level analytics

Teacher permissions do not extend to unrelated classes.

### Student

Can:

- access the Hub
- launch all enabled student apps
- view own progress only
- change own password

Students cannot view other students, teacher dashboards, or class-level analytics.

## 6. Class membership and transfers

A student has one active class membership at a time.

A class can have multiple teachers.

Transfers use a history model rather than overwriting the student's class with no trace.

A transfer records:

- student id
- previous class id
- new class id
- effective timestamp
- changed by user id

Historical activity remains attached to the student permanently. Reporting can distinguish activity by the class membership active at the time the event occurred.

After transfer:

- the new class teachers see the student going forward
- old class teachers no longer see new activity unless they also teach the new class or have admin rights
- historical reporting remains internally intact

## 7. App integration model

The four current apps remain independently deployed:

- `igcse-paraphrasing`
- `igcse-reading`
- `igcse-essay-writing`
- `igcse-listening`

Each app receives a small shared tracking/auth integration layer.

Each app identifies itself using a stable app key, for example:

- `paraphrasing`
- `reading`
- `essay_writing`
- `listening`

The shared integration layer must be small and app-agnostic. Existing app logic should not be rewritten merely to support tracking.

If a user opens an app directly while unauthenticated, the intended end-state is:

1. redirect to Hub login
2. authenticate
3. return to the original app

Direct Bitly links therefore remain useful.

## 8. Activity event model

Do not track meaningless page noise. Track events that provide educational or engagement value.

Base event fields:

- event id
- user id
- class id at event time
- app key
- session id
- event type
- activity key
- skill/topic key where relevant
- result metadata where relevant
- timestamp

Possible event types include:

- `app_opened`
- `activity_started`
- `activity_completed`
- `question_attempted`
- `answer_correct`
- `answer_incorrect`
- `score_recorded`
- `progress_saved`

Not every app must emit every event type.

### Time-on-task

Do not claim precise learning time from a browser tab being open.

Track active session windows using conservative engagement rules such as recent interaction/heartbeat signals. Teacher UI should label this as `active time` or `engaged time`, not exact study duration.

## 9. App-specific analytics

### Paraphrasing

Potential metrics:

- attempts
- correct/incorrect answers
- activity/set completion
- accuracy
- weak skill category
- recent practice

The existing app already stores local progress in browser storage. Remote tracking should complement, not immediately replace, local resilience.

### Reading

Potential metrics:

- tasks attempted
- questions answered
- accuracy
- text/task completion
- reading question types where identifiable
- inference/detail/main-idea weaknesses where identifiable

### Essay Writing

Potential metrics:

- activities opened
- planning stages completed
- drafting tasks completed
- rubric/self-check activity
- saved/submitted practice state where applicable

Do not invent accuracy scores where the app does not actually auto-mark validly.

### Listening

Potential metrics:

- exercise opened
- playback started
- questions attempted
- accuracy where automatically marked
- exercise completion
- replay/retry behaviour where educationally meaningful

Avoid logging raw audio-control noise unless it supports a useful teacher signal.

## 10. Teacher dashboard design

The standalone prototype should have two main levels.

### Class overview

Show:

- student
- last active
- activity this week
- apps used
- attempts
- accuracy where comparable
- completion indicator
- weakest identifiable skill

Avoid combining unlike metrics into a misleading single percentage.

### Student drill-down

Show:

- overall recent activity
- app-by-app breakdown
- session/activity timeline
- attempts and completion
- accuracy where valid
- weak-skill signals
- current class
- transfer history where teacher/admin permissions allow

The teacher dashboard should privilege actionable evidence over decorative charts.

## 11. Data model

Initial logical tables/entities:

### `profiles`

- auth user id
- role
- display name
- school email
- active flag
- must_change_password

### `classes`

- class id
- class name
- active flag

### `teacher_classes`

Many-to-many join between teachers and classes.

### `student_class_memberships`

- student id
- class id
- start time
- end time nullable
- changed by

Exactly one active membership per student.

### `apps`

- app key
- display name
- launch URL
- enabled flag

### `study_sessions`

- session id
- student id
- app key
- class id snapshot
- started at
- last active at
- ended at nullable

### `activity_events`

- event id
- session id
- student id
- class id snapshot
- app key
- event type
- activity key
- skill key nullable
- numeric score nullable
- correct nullable
- metadata JSON with a tightly controlled schema
- created at

### Optional derived summaries

Derived class/student summaries should be created only after event collection is stable. Do not prematurely duplicate aggregate data.

## 12. Security and RLS

All tables exposed through the Supabase Data API must use Row Level Security.

Rules:

- students can read/write only activity attributable to their own authenticated user
- students can read only their own profile/progress
- teachers can read students/activity only where a valid teacher-class assignment exists
- admins can access all self-study data
- public/anonymous access cannot read student data
- service-role/secret keys must never be exposed in browser code
- role/authorisation decisions must not rely on user-editable user metadata

Admin account creation and other privileged actions must occur through a protected admin path, not through unrestricted client-side calls.

## 13. Failure behaviour

Student learning should not be destroyed by a temporary backend/network failure.

Apps should:

- continue functioning where practical
- retain existing local progress mechanisms
- queue or gracefully skip non-critical analytics events when backend writes fail
- never block an answer submission merely because analytics failed

Teacher analytics may show delayed data if events could not sync.

## 14. Evidence Hub isolation boundary

During all initial development:

- no commits to the Evidence Hub repository
- no changes to EH Supabase schema
- no changes to EH auth
- no edits to EH navigation
- no edits to EH Student Profiles
- no edits to EH banners/styles/renderers/controllers

The Self-Study system must be independently demonstrable and testable before EH integration begins.

## 15. Final EH transplant

Only after the standalone teacher dashboard is accepted:

1. inspect latest EH `main`
2. identify the actual live navigation, renderer, controller, and style ownership for the chosen destination
3. add one isolated Self-Study destination/module
4. reuse the already-tested teacher UI patterns rather than redesigning inside EH
5. connect read-only teacher analytics to the Self-Study backend initially
6. do not merge Self-Study data into EH tables unless a later design explicitly justifies it
7. verify existing EH workflows are unaffected

The transplant must be removable without damaging either EH or the Self-Study system.

## 16. Implementation phases

### Phase 1 — foundation

- create dedicated Self-Study Supabase project
- create new Hub repository
- define auth/roles/classes/schema/RLS
- create admin-controlled account workflow

### Phase 2 — Hub

- login
- forced password change
- launcher
- basic own-progress view

### Phase 3 — shared tracking contract

- define event API/client
- validate event ingestion and RLS
- establish session behaviour

### Phase 4 — instrument apps one at a time

Recommended order:

1. Paraphrasing
2. Reading
3. Essay Writing
4. Listening

After each app, verify no regression in its existing functionality before moving to the next.

### Phase 5 — standalone teacher dashboard

- class overview
- student drill-down
- app breakdown
- transfer controls
- account/class administration as scoped

### Phase 6 — classroom pilot

- dummy accounts first
- small real-student pilot
- verify identity, activity accuracy, permissions, transfers, and network-failure behaviour

### Phase 7 — EH transplant

Only after the standalone system is stable and approved.

## 17. Testing requirements

Minimum test coverage must include:

- student cannot self-register
- temporary-password flow works
- password change works
- student cannot access another student's data
- teacher cannot access an unrelated class
- two teachers can access the same assigned class
- admin can manage all classes
- transfer closes old membership and opens new membership
- historical activity survives transfer
- direct app URL returns correctly through authentication flow
- tracking failure does not break app learning functionality
- each app reports correct app/activity identifiers
- teacher dashboard summaries match underlying events
- EH remains untouched until Phase 7

## 18. Non-goals for version 1

Do not add unless separately approved:

- Microsoft SSO
- parent accounts
- student messaging/chat
- gamification economy/badges
- leaderboards
- AI-generated teacher judgements
- automatic intervention creation in EH
- cross-school tenancy
- rebuilding the four apps into one monolith

## 19. Success criteria

The system is ready for EH transplant when:

1. students can sign in with teacher-controlled accounts
2. students can access all four apps through the Hub
3. each app records meaningful activity reliably
4. teachers can see all students in assigned classes
5. shared teachers see the same class evidence
6. class transfers work without losing history
7. teacher analytics are useful enough for self-study supervision
8. privacy/RLS checks pass
9. temporary backend failures do not break student practice
10. no EH code or database changes were required to achieve the above

## 20. Decision summary

Chosen architecture: dedicated Self-Study Hub + dedicated Supabase backend + separate existing app deployments + standalone teacher analytics, followed by a late, isolated EH transplant.

This intentionally prioritises Evidence Hub stability and reversibility over early integration.