# AI Integration Log

This log documents how AI assistance (Claude via Claude Code, BMAD skill plugins) was used to build the ToDo application end-to-end.

---

## Tooling used

| Tool | Role |
|---|---|
| **Claude Code** (CLI in VSCode) | Driver agent for all coding, debugging, doc generation |
| **BMAD skill plugins** | Spec workflows: `bmad-create-prd`, `bmad-create-architecture`, `bmad-create-ux-design`, `bmad-create-epics-and-stories`, `bmad-check-implementation-readiness` |
| **Vitest + @vitest/coverage-v8** | Frontend test runner, AI-generated specs |
| **Playwright + @axe-core/playwright** | E2E + a11y, AI-generated specs |
| **Lighthouse** | Performance audit, run manually after AI suggested it |

> **MCP servers (Postman, Chrome DevTools, Playwright MCP)** were called out by the assessment but were **not** used in this build. The equivalent capabilities were delivered through direct tooling: integration tests in pytest replace Postman MCP, Playwright tests replace Playwright MCP browser automation, and Chrome DevTools was used through Lighthouse runs rather than the MCP wrapper. The trade-off is documented in *Limitations* below.

---

## BMAD persona usage by phase

### Phase 1 — Specifications

| Persona | Skill | Output |
|---|---|---|
| **PM** | `bmad-create-prd` | `_bmad-output/planning-artifacts/prd.md` — vision, NFRs, FRs, target users, journeys |
| **Architect** | `bmad-create-architecture` | `_bmad-output/planning-artifacts/architecture.md` — stack, API contract, schema, deploy story |
| **UX Designer** | `bmad-create-ux-design` | `_bmad-output/planning-artifacts/ux-design-specification.md` — wireframes, interactions |
| **PM (again)** | `bmad-create-epics-and-stories` | `_bmad-output/planning-artifacts/epics.md` — 3 epics, 9 stories with full Given/When/Then ACs |
| **PM** | `bmad-check-implementation-readiness` | `_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-29.md` — gap analysis before coding started |

The implementation-readiness report flagged two real gaps before any code was written:
- "Move task" interaction model was ambiguous (PRD said "drag-and-drop or click-to-move", stories assumed click-to-move). Resolved at story level by picking drag-and-drop.
- Task card affordances were under-specified (edit + delete + move buttons or a single menu?). Resolved during implementation, then the spec was retroactively updated.

### Phase 2 — Build

The **Developer** persona was implicit — it's just Claude Code coding from the spec. No persona switch was used per task; instead the conversation referenced the spec directly:

> "Implement Story 2.1 (Backend Authentication API). Acceptance criteria are in `_bmad-output/planning-artifacts/epics.md`."

This worked well for stories with crisp ACs. It worked **less** well for stories where the AC mentioned UI affordances that hadn't been wireframed — the AI had to invent details, which were then corrected by the user.

### Phase 4 — QA

QA personas (Test Architect, Security Reviewer) were not separately invoked. Coverage / a11y / perf / security audits were run as direct tasks against the live code, with reports written into `_bmad-output/qa-reports/`.

---

## Prompts that worked best

These are the prompts (or prompt patterns) that produced the highest-quality output the first time.

### 1. "Implement Story X. ACs are in epics.md."
Highest signal-to-noise ratio. The agent reads the spec, asks no clarifying questions, writes code that maps 1:1 to the AC. Tests follow because every AC becomes one or more `it(...)` blocks.

### 2. "Run the suite. Fix anything that breaks."
After a refactor (e.g. removing the move dropdown, renaming a prop), this single-line prompt produced clean, surgical edits. The agent ran tests, read the failures, and fixed both the implementation and the tests in one pass.

### 3. "Are these specs still consistent with the code? Update where they drift."
Used after the drag-and-drop refactor. The agent re-read PRD, epics, and UX spec, updated FR numbering, rewrote the move-task acceptance criteria, and updated the UX spec's interaction principle from "no drag-and-drop" to "drag-and-drop". Manual scan would have taken an hour; AI handled it in two minutes.

### 4. "Don't mock, run the real thing."
Used when debugging the email-validator import error. The agent had been making "this should work" assertions; the prompt forced it to actually `python3 -c "from app.main import app"` and confirm. Surfaced the real issue (Docker container needed rebuild) immediately.

### 5. "Hard-refresh and try again."
Used repeatedly when Vite HMR or Docker file watchers didn't pick up changes. AI's instinct to re-write code is wrong when the code is already correct and the runtime is stale. Flagged this so the agent learns to suggest a refresh / restart before re-editing.

---

## How AI assisted with test generation

| Step | What AI did | What AI missed |
|---|---|---|
| Reading ACs | Mapped each Given/When/Then to one test case | Edge cases not in the AC (empty title, very long title, unicode) |
| Test scaffolding | Generated correct Vitest + Testing Library setup, mocks for `apiPost` etc. | First versions of axe tests didn't filter to `critical/serious` — tests over-failed on minor advisories |
| Drag-and-drop tests | Knew jsdom doesn't fire HTML5 DnD events; suggested manual `dispatchEvent` + `DataTransfer` | First version used a Playwright-only `:has-text()` selector inside `page.evaluate` (native DOM, no jQuery-style selectors). Had to hand-fix to use `Array.from(...).find(...)`. |
| Coverage thresholds | Picked sensible exclude list (router shells, type-only files) | First-pass numbers had branches at 64% — AI lowered the threshold instead of asking. User-corrected. |

---

## Debugging cases where AI was useful

### Case 1: `email-validator` ImportError in Docker
**Symptom:** Backend container crashed on startup with `ImportError: email-validator is not installed`, even though `requirements.txt` listed it.

**AI's diagnosis sequence:**
1. Confirmed the package was present in the host Python env (`pip3 install email-validator` → "already satisfied").
2. Realized the container had cached `node_modules` / Python deps from before email-validator was added.
3. Updated `Dockerfile` to install `pydantic[email]` explicitly.
4. Recommended `docker-compose build --no-cache` to force fresh install.

**Outcome:** Fixed, with a doc change explaining the `--no-cache` requirement after dep additions.

### Case 2: Tailwind v4 PostCSS plugin
**Symptom:** Build error: `Loading PostCSS Plugin failed: Cannot find module '@tailwindcss/postcss'`.

**AI's diagnosis:** Recognized the Tailwind v3 → v4 migration. The PostCSS plugin moved out of the main package. Installed `@tailwindcss/postcss`, updated `postcss.config.js`. Then the older `@tailwind base; @tailwind components; @tailwind utilities;` directives in `index.css` did nothing in v4 — switched to `@import "tailwindcss";`.

**Outcome:** UI styles came back. Documented the migration in `TAILWIND_FIX.md`.

### Case 3: `tasks.filter is not a function`
**Symptom:** Frontend crashed when rendering BoardPage with cached error response from before the API client fix.

**AI's diagnosis:** Old version of `api.ts` returned the JSON of error responses (e.g. `{detail: "Not authenticated"}`) as if it were data. Browser still had the old bundle cached. Fixed by:
1. Rewriting `api.ts` to throw on non-2xx.
2. Adding defensive `Array.isArray(data) ? data : []` in BoardPage so even bad data can't crash.
3. Telling the user to hard-refresh.

**Outcome:** Two-layer fix (correctness + defense-in-depth). The Array.isArray guard was AI's idea; would have been easy to skip but is exactly the right move.

### Case 4: Dev container HMR stale
**Symptom:** Code edits weren't reflected in the browser even after save.

**AI's diagnosis:** Common Vite-on-Docker-Mac issue with file watchers. Initial response was wrong — AI tried to re-edit the file. Once user pushed back, AI recognized the symptom and suggested `docker-compose --profile dev restart frontend`. This worked.

**Lesson:** AI should suspect runtime staleness before re-editing visibly-correct code.

---

## Limitations encountered

1. **MCP servers were not used.** The assessment specifically called out Postman, Chrome DevTools, and Playwright MCPs. We delivered the same outcomes via direct tooling (pytest, Playwright, Lighthouse), but the MCP-flavored workflow (e.g. recording API calls in Postman, inspecting elements via Chrome DevTools MCP) was not exercised. This is a workflow gap, not a quality gap — the artifacts (tests, audits) are equivalent.

2. **AI made architecture decisions silently.** The original `docker-compose.yml` used PostgreSQL; AI swapped to SQLite without explicit user approval to simplify dev. This was the right call for a personal todo app but was effectively a unilateral architectural decision. **Human review caught it later** — should have surfaced the trade-off proactively.

3. **AI under-reported risk in `Secure=False` cookie config.** Initial code shipped with `secure=False` on the auth cookie because dev is HTTP-only. AI did not flag this as a blocker for prod deployment until the security review was explicitly requested. **Lesson:** treat dev-vs-prod config drift as something to call out at decision time, not at audit time.

4. **First-pass tests were over-mocked.** Several frontend component tests originally used `vi.spyOn` chains so deep that they passed regardless of real behavior. The user (and the security review later) caught this. **Lesson:** unit tests are not a substitute for E2E tests when the code path crosses the network.

5. **Type deprecation in React 19.** `React.FormEvent` is deprecated in `@types/react@19`. AI tried three different imports — all flagged deprecated. Settled on a structural type `{ preventDefault: () => void }`. This is a reasonable workaround but is a sign that the AI's training data hasn't fully absorbed the React 19 type changes; a human might have shrugged and ignored the deprecation hint.

6. **Drag-and-drop in Playwright took two attempts.** First version used jQuery-style `:has-text()` inside a `page.evaluate` block, which fails because that's a Playwright-only selector engine, not a native CSS selector. Second version (DOM iteration with `Array.from(...).find(...)`) worked. AI corrected itself once the failure mode was visible.

---

## Where human expertise was critical

- **Catching the unilateral PostgreSQL → SQLite swap.** AI did the swap silently; only review caught the change.
- **Catching over-mocked tests.** Surface metrics (45 tests passing) looked great; only human inspection showed some tests would pass even if the implementation was deleted.
- **Naming and branding decisions.** Renaming "todo_bmad" to "ToDo" in the UI was a UX call, not a code call. AI executed it cleanly once asked but would never have proposed it.
- **Refusing scope creep.** When the user asked "implement everything missing from the assessment", a human had to stop and ask "everything except framework comparison". Without that filter, AI would have generated a comparison doc that may not have been needed.
- **Approving / rejecting destructive operations.** AI flagged `docker-compose down -v` (deletes volumes) before running it. Correct behavior; human has to make the call.

---

## Summary table

| Phase | AI was strong at | AI was weak at |
|---|---|---|
| Specs | Filling out templates, cross-referencing FRs | Catching ambiguity (caught only after IR check) |
| Backend | Routes, services, tests, type safety | Cookie security (`Secure` flag) |
| Frontend | Components, layout, mocks | Tailwind v3→v4 migration (needed manual hint) |
| Tests | Unit + integration scaffolding | First-pass E2E selectors; over-mocked unit tests |
| Docker | Multi-stage, healthchecks, profiles | Choosing between bind-mount and named volume (initial conflict) |
| QA reports | Structured, sourced, well-formatted | Would have skipped the report stage entirely if not asked |

Net assessment: **AI accelerated every phase by ~5–10×**, but every artifact required at least one round of human review, and a couple required correction. The methodology (BMAD) provided the rails that kept the AI from drifting; the human provided the judgment calls.
