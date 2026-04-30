# How BMAD Guided the Implementation

This document traces how the **BMAD Methodology** (Brief → Methods → Architecture → Development) shaped the build of the ToDo application from a one-paragraph prompt to a tested, containerised, audited app.

---

## The flow at a glance

```
PRD (PM persona)
   ↓
Architecture (Architect persona)
   ↓
UX Design (UX persona)
   ↓
Epics & Stories (PM persona, decomposing into ACs)
   ↓
Implementation Readiness Check  ←──── Gate: catches gaps before any code is written
   ↓
Implementation (Developer persona, story by story)
   ↓
QA Audits: Coverage, A11y, Perf, Security
```

Each phase produces a **frozen artifact** that the next phase consumes. If a downstream phase needs to change something upstream (e.g., when drag-and-drop replaced the dropdown), the upstream artifact is **explicitly updated** — drift is not allowed.

---

## Phase 1: PRD (PM persona, `bmad-create-prd`)

**Input:** "users will have three sections: todo, progress, done; user logs in and uses this app; no member addition, no sharing; just a simple app."

**Output:** [`prd.md`](../planning-artifacts/prd.md) — 200 lines covering vision, target users, three user journeys (daily loop, first visit, mistake recovery), 20 functional requirements, NFRs (perf, security, a11y), and explicit non-goals (no comments, no sharing, no notifications).

**Why this matters:** the PRD's "deliberate restraint" framing locked the team into *removing* features when in doubt, not adding them. That single principle saved hours of feature debate later (no due dates, no labels, no priority — all proposed during the build, all rejected because the PRD said no).

---

## Phase 2: Architecture (Architect persona, `bmad-create-architecture`)

**Input:** the frozen PRD.

**Output:** [`architecture.md`](../planning-artifacts/architecture.md) — stack choices (FastAPI, React 19, SQLModel), component structure, exact API contract, JWT-cookie auth flow, deployment story, ADR-style rationale for each major choice.

**Concrete impact on the build:**

| PRD requirement | Architecture decision | Implementation result |
|---|---|---|
| FR4: persistent session | JWT in HTTP-only cookie, not localStorage | `auth_router.py:set_cookie` uses `httponly=True` |
| FR15: optimistic UI on move | Service-layer enforcement of user_id on every task op | `task_service.py:get_tasks(session, user_id)` |
| NFR: zero cross-user access | All task routes inject `user_id` from JWT | No path bypasses the user filter — verified in `test_tasks_user_scoped` |
| NFR: under 2s initial load | Single SPA bundle, no SSR | Lighthouse perf 100 / FCP 1.4s |

The architecture also forced the API contract to be settled before any code: `POST /auth/login` returns `{id, email}`, never the password hash, never the JWT in the body. Coding from this contract meant the backend and frontend agreed without negotiation.

---

## Phase 3: UX Design (UX persona, `bmad-create-ux-design`)

**Input:** PRD + Architecture.

**Output:** [`ux-design-specification.md`](../planning-artifacts/ux-design-specification.md) — wireframes for every screen, interaction specs for every action, design principles (e.g., "drag-and-drop interactions"), color tokens, typography rules.

**Concrete impact:** Without this, the AI would have produced a generic Tailwind layout. With this, the brand mark, gradient button, three-column color-coded board, hover-only menu, and confirmation modal all came directly from the spec. The two times the user pushed back on UI decisions ("UI is very simple", "logo and welcome should be inside the card") were both UX-spec-level concerns that the spec **didn't fully cover** — confirming the spec's value by showing where its gaps caused friction.

---

## Phase 4: Epics & Stories (PM persona, `bmad-create-epics-and-stories`)

**Input:** PRD + Architecture + UX.

**Output:** [`epics.md`](../planning-artifacts/epics.md) — 3 epics, 9 stories, each with full Given/When/Then acceptance criteria.

**Why this gates everything else:** every story is a **testable contract**. Examples:

> **Story 3.4 (post drag-and-drop refactor):**
> Given I am dragging a card over a column other than its current one
> When my pointer is over the column
> Then the column highlights as a drop target (blue ring) and the empty-state message reads "Drop here"

This single AC produced:
- The `isDragOver` state in `BoardColumn.tsx`
- The blue-ring class string
- The "Drop here" copy override
- The Playwright test in `drag-and-drop.spec.ts`
- The component test for `onDragOver`

One AC, five concrete deliverables. **The stories are the build plan.**

---

## Phase 5: Implementation Readiness Check (`bmad-check-implementation-readiness`)

**Input:** all the above.

**Output:** [`implementation-readiness-report-2026-04-29.md`](../planning-artifacts/implementation-readiness-report-2026-04-29.md) — gap analysis.

**What it caught (before any code was written):**
1. The PRD said "click-to-move or drag-and-drop"; the stories assumed click-to-move; the UX spec said "no drag-and-drop". Three documents, three answers. Forced an explicit decision.
2. Task card affordances were under-specified. Was it a bottom action bar? A dropdown? A right-click menu? Forced a wireframe-level decision.

Without this gate, both ambiguities would have surfaced mid-implementation and forced rework. The IR check **paid for itself before any code ran**.

---

## Phase 6: Implementation (Developer persona, story-by-story)

Each story was implemented as:

1. Read the AC.
2. Write the failing test (component or integration).
3. Write code until the test passes.
4. Add the E2E test for the user-visible journey.
5. Move to the next story.

**Backend story 2.1 (Auth API)** produced:
- `auth_router.py` with login / logout / signup / me endpoints
- `auth_service.py` with bcrypt + JWT
- `tests/test_auth.py` — 7 integration tests, one per AC

**Frontend story 2.2 (Auth UI)** produced:
- `LoginPage.tsx`, `authContext.tsx`
- `LoginPage.test.tsx`, `authContext.test.tsx` — component tests
- `e2e/auth.spec.ts` — full Playwright journeys

The story-test-implementation-test loop kept us from accidentally building features the PRD didn't ask for: every commit traces back to a story; every story traces back to a PRD requirement.

---

## Phase 7: QA Audits

After all stories were implemented, four parallel audits ran:

| Audit | Tool | Output | Result |
|---|---|---|---|
| Coverage | pytest-cov, @vitest/coverage-v8 | [`coverage-report.md`](./coverage-report.md) | Backend 90%, Frontend 85% |
| Accessibility | @axe-core/playwright + Lighthouse | [`accessibility-report.md`](./accessibility-report.md) | 0 critical/serious WCAG AA violations |
| Performance | Lighthouse | [`performance-report.md`](./performance-report.md) | Production: 100/96/96 |
| Security | Manual code audit (OWASP Top 10) | [`security-review.md`](./security-review.md) | No critical findings |

The a11y audit caught two real issues (color contrast and unlabeled inputs) that were fixed before the audit was signed off. **Without an automated audit gate, both would have shipped.**

---

## Cycle: spec drift after the drag-and-drop refactor

The single most instructive moment in the build was when the user asked to replace the move-task dropdown with drag-and-drop **after** all the specs had been written.

**What we did:**
1. Updated `TaskCard.tsx` and `BoardColumn.tsx` with HTML5 DnD.
2. Updated `BoardPage.tsx` with optimistic update + rollback.
3. Updated tests (component + Playwright).
4. **Updated the PRD's FR13–FR15.**
5. **Updated the UX spec's interaction principle** from "no drag-and-drop" to "drag-and-drop".
6. **Updated Story 3.4's acceptance criteria** to use Given/When/Then for the new interaction.

The methodology required the upstream specs to follow the implementation reality. If we'd skipped steps 4–6, the next person reading the PRD would have built the wrong thing. **Spec drift is the single most common failure mode in spec-driven development**, and BMAD's discipline of "update upstream first when downstream changes" is what prevented it here.

---

## What BMAD did NOT do

For honesty's sake:

- **BMAD did not write the code.** The specs were inputs to an AI agent (Claude Code) that generated the implementation. BMAD provided structure, not substance.
- **BMAD did not catch every gap.** The "should we use SQLite or Postgres" decision was made silently during implementation; it was never explicitly in any spec. BMAD's templates don't have a "data store flexibility" prompt that would have surfaced this.
- **BMAD did not prevent the user from intervening.** UX decisions ("logo and name should be in one row inside the card") were UX-spec-level concerns; the spec was not detailed enough to prevent these. The user had to drive several rounds of UI iteration.
- **BMAD did not generate the QA audits.** The audits had to be requested explicitly. The methodology defines them as Phase 4 deliverables; the agent did not run them proactively.

---

## Net assessment

For a small project like this todo app, BMAD's process discipline added ~30% to the upfront time spent on specs vs. just "vibe-coding" with an AI. In return:

- Every requirement traces to code traces to tests.
- Three real ambiguities were caught before code was written.
- When scope changed (drag-and-drop refactor), the system stayed coherent because all upstream artifacts were updated in lockstep.
- QA audits ran against a known-good spec, not "whatever the code does".

For a larger project — multi-developer, multi-month — the upfront investment compounds further. The methodology is over-engineered for a 10-line CLI; it is appropriately-engineered for anything an outside reviewer needs to understand.
