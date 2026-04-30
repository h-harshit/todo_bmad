---
stepsCompleted: ['step-01-init', 'step-02-discovery', 'step-02b-vision', 'step-02c-executive-summary', 'step-03-success', 'step-04-journeys', 'step-05-domain', 'step-06-innovation', 'step-07-project-type', 'step-08-scoping', 'step-09-functional', 'step-10-nonfunctional', 'step-11-polish', 'step-12-complete']
completedAt: '2026-04-29'
releaseMode: single-release
classification:
  projectType: web_app
  domain: general
  complexity: low
  projectContext: greenfield
inputDocuments: []
workflowType: 'prd'
briefCount: 0
researchCount: 0
brainstormingCount: 0
projectDocsCount: 0
---

# Product Requirements Document - ToDo

**Author:** Harshit
**Date:** 2026-04-29

## Executive Summary

A personal task management web application built for internal use. A single authenticated user sees their work across three states — Todo, In Progress, Done — with no collaboration overhead. The problem it solves is friction: most task tools are built for teams and impose complexity (sharing, permissions, notifications, integrations) that gets in the way of solo use.

### What Makes This Special

The differentiator is deliberate restraint. Where competing tools add features to justify their existence, this app removes them. No member management, no board sharing, no comments, no attachments — just three columns and the tasks in them. For personal use, fewer features is the feature. The app loads fast, does exactly what the user came to do, and nothing else.

## Project Classification

- **Project Type:** Web Application (SPA)
- **Domain:** General / Personal Productivity
- **Complexity:** Low — no regulated domain, no compliance requirements, no multi-tenant architecture
- **Project Context:** Greenfield

## Success Criteria

### User Success

- User logs in and sees their board immediately, with no friction
- Tasks are created, moved, and deleted without page reloads
- Board state persists — nothing is lost between sessions
- Routine actions feel instant; no loading spinners

### Business Success

- App is in active daily internal use
- Zero data loss incidents
- No supplementary tool needed alongside it

### Technical Success

- Authentication is reliable with secure session management
- Data persists correctly per user across sessions
- No critical bugs blocking the core workflow

### Measurable Outcomes

- Login → create task → move to Done completes in under 30 seconds
- Initial board load under 2 seconds on standard broadband

## Product Scope

**Release strategy:** Single release — the complete must-have feature set ships at once. Nice-to-haves are included if time allows but do not block release.

**Resource:** One developer; standard web stack.

### Must-Have Capabilities

- User authentication (login / logout, persistent session)
- Three-column board: Todo, In Progress, Done
- Create a task (title)
- Move a task between columns
- Edit a task title
- Delete a task
- Empty state UI for new users
- Auth-guarded routes (unauthenticated users redirect to login)

### Nice-to-Have Capabilities

- Task descriptions / notes
- Due dates
- Keyboard shortcuts
- Mobile-optimised layout

### Future Possibilities

- Search / filter tasks
- Task ordering within a column
- Simple activity log

### Risk Mitigation

**Technical:** Minimal risk — standard SPA with auth and CRUD. Primary mitigation: keep the stack boring and avoid over-engineering.

**Resource:** If time is short, drop nice-to-haves entirely. Must-haves are sufficient for a fully usable app.

## User Journeys

### Journey 1: The Daily Loop (Primary — Happy Path)

**Meet Harshit.** It's the start of his workday. He opens the app, logs in, and his board is exactly where he left it — three columns, tasks in their respective states.

He scans In Progress: two tasks. One is done — he moves it to Done. He picks the next item from Todo, moves it to In Progress. He adds a new task that just came up: types the title, saves. Done in fifteen seconds. He closes the tab. The board will be there tomorrow, unchanged.

**Reveals:** persistent session state, fast board render, drag-and-drop interaction between columns, inline task creation.

---

### Journey 2: First-Time Setup (Primary — Onboarding)

**First visit.** Harshit navigates to the app URL, is greeted with a login screen, enters credentials, and lands on an empty board — three columns, no tasks, a simple placeholder indicating what to do.

He creates his first task. Then another. Then moves one. Within two minutes he understands the entire app. There is nothing left to discover because there is nothing hidden.

**Reveals:** auth flow (login → board), empty state handling, zero-friction task creation, no onboarding wizard needed.

---

### Journey 3: Mistake Recovery (Primary — Edge Case)

**Harshit moved a task to Done by accident.** He clicks it, moves it back to In Progress. No confirmation dialogs, no undo toasts — just a direct move. If he accidentally deletes a task, it is gone — acceptable for a personal tool at this simplicity level.

**Reveals:** column moves must be reversible (moving back is sufficient), deletion is permanent and acceptable, no complex undo needed.

---

### Journey Requirements Summary

| Capability | Revealed By |
|---|---|
| User authentication | All journeys |
| Persistent board state | Daily loop, onboarding |
| Create / edit / delete task | All journeys |
| Move task between columns | Daily loop, mistake recovery |
| Empty state UI | Onboarding |
| No admin, API, or multi-user surface | Scope — single user only |

## Web Application Specific Requirements

### Technical Architecture

- **Rendering:** Client-side SPA — no SSR required
- **Routing:** Client-side protected routes; unauthenticated requests redirect to login
- **State:** Local component state sufficient for MVP; no complex global state management needed
- **API:** REST backend with JSON; session-based or token-based auth

### Browser Support

- **Target:** Latest 2 versions of Chrome, Firefox, Safari, Edge
- **Excluded:** Internet Explorer and legacy browsers
- **Mobile browsers:** Graceful degradation acceptable; not a primary target

### Responsive Design

- **Primary target:** Desktop viewport
- **Mobile:** Layout must not break on smaller screens; optimisation is post-MVP

### Accessibility

- No formal compliance required (WCAG not mandated)
- Keyboard-navigable core actions preferred but not enforced for this release

## Functional Requirements

### Authentication & Session Management

- **FR1:** User can sign up with an email and password to create an account
- **FR2:** User can log in using credentials (email and password)
- **FR3:** User can log out, ending their session
- **FR4:** System maintains a persistent session across browser refreshes via HTTP-only cookies
- **FR5:** Unauthenticated users are automatically redirected to the login page
- **FR6:** Login screen toggles between Log In and Sign Up modes via a single link

### Task Board

- **FR7:** Authenticated user can view their personal task board organised into three columns: To do, In progress, Done
- **FR8:** Each column displays a task count badge and a colour-coded accent (gray / blue / green)
- **FR9:** System displays an empty state in each column when no tasks are present
- **FR10:** Board state persists between sessions — tasks are not lost when the user closes the browser

### Task Management

- **FR11:** User can create a new task by providing a title (input is only available in the To do column)
- **FR12:** User can view all their tasks, each displayed in its current column
- **FR13:** User can move a task from any column to any other column by dragging the card and dropping it on the destination column
- **FR14:** Drop targets provide visual feedback (highlighted ring) while a card is being dragged over them
- **FR15:** Task moves are applied optimistically; if the server rejects the move, the UI rolls back and surfaces an error
- **FR16:** User can edit the title of an existing task by clicking it (inline edit with Save / Cancel, plus Enter / Escape shortcuts)
- **FR17:** User can delete a task via a per-card menu, confirmed through a modal dialog
- **FR18:** Task deletion is permanent — no undo or recovery mechanism required

### Navigation & Routing

- **FR19:** All board and task routes require authentication — unauthenticated access is blocked
- **FR20:** User is redirected to the board immediately after successful login or signup

## Non-Functional Requirements

### Performance

- Initial board load completes in under 2 seconds on a standard broadband connection
- Task operations (create, edit, move, delete) provide immediate visual feedback with no perceptible delay
- No loading spinners for routine board interactions
- Application remains responsive with up to 200 tasks on the board

### Security

- User passwords stored hashed — never in plaintext
- All client-server communication over HTTPS
- Session tokens invalidated on logout
- Board data scoped strictly to the authenticated user — no cross-user data access possible
- No sensitive personal data collected beyond login credentials and task titles
