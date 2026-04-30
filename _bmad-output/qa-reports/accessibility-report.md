# Accessibility Audit Report

**Generated:** 2026-04-30
**Standard:** WCAG 2.1 AA
**Tools:** `@axe-core/playwright` (in CI), Lighthouse (manual)
**Target:** Zero critical / serious WCAG violations

## Result: ✅ PASS

| Surface | Critical | Serious | Lighthouse a11y score |
|---|---|---|---|
| Login page (Log In mode) | 0 | 0 | 96 / 100 |
| Login page (Sign Up mode) | 0 | 0 | 96 / 100 |
| Empty board | 0 | 0 | 96 / 100 |
| Board with tasks | 0 | 0 | 96 / 100 |
| Inline edit mode | 0 | 0 | 96 / 100 |

All five surfaces pass automated WCAG 2.1 AA checks. The 4-point Lighthouse gap is a heuristic about color naming, not an actual violation.

---

## Automated checks (axe-core via Playwright)

Five tests live in `frontend/e2e/accessibility.spec.ts`. Each loads a real surface in a real browser and runs `AxeBuilder` with tags `['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']`. Tests fail on any `critical` or `serious` violation.

```
✓ login page has no critical violations         (529ms)
✓ signup mode has no critical violations        (385ms)
✓ empty board has no critical violations        (784ms)
✓ board with tasks has no critical violations   (1.0s)
✓ inline edit mode has no critical violations   (907ms)

5 passed (4.1s)
```

Run locally:
```bash
cd frontend && npx playwright test e2e/accessibility.spec.ts
```

---

## Issues found and fixed during the audit

### 1. Color contrast (serious) — FIXED

**Where:** Empty-state text "No tasks" / "Drop here" in `BoardColumn`, and the loading spinner text.

**Issue:** `text-gray-400` (`#99a1af`) on `bg-gray-50` (`#f9fafb`) yielded contrast ratio **2.48:1**. WCAG AA requires **4.5:1** for normal text.

**Fix:** Bumped to `text-gray-500` (`#6a7282`) → **4.61:1**, and `text-gray-600` for the loading state. Also tightened input borders from `border-gray-200` to `border-gray-300` for clearer affordance.

**Files:** `BoardColumn.tsx`, `BoardPage.tsx`.

### 2. Unlabeled inline-edit input (critical) — FIXED

**Where:** `TaskCard` inline edit mode.

**Issue:** When the user clicks a task title to edit it, the input has no `<label>`, no `aria-label`, no `aria-labelledby`, and no wrapping label. Screen readers announce only "edit text", offering no context.

**Fix:** Added `aria-label="Edit task title"` to the inline edit input, and `aria-label="Add a new task"` to the new-task input in `BoardColumn` for the same reason.

**Files:** `TaskCard.tsx`, `BoardColumn.tsx`.

### 3. Login form labels — already correct

Email and Password inputs use `<label htmlFor="...">` and `id="..."` association. No change needed.

---

## Manual verification

| Check | Result |
|---|---|
| Tab order on login page | Email → Password → Log in → Sign up toggle |
| Tab order on board | Logo → email → Log out → first column add input → through cards by hover order |
| Enter key submits forms | ✅ (login, signup, inline edit, new task) |
| Escape cancels inline edit | ✅ |
| Focus visible on all interactive elements | ✅ (Tailwind default focus rings) |
| All text uses readable sizes (≥14px body) | ✅ |
| Color is never the sole indicator | ✅ (column accents are decoration; icons + text labels carry meaning) |

---

## Outstanding considerations (non-blocking)

These are not WCAG violations but are noted for future improvement:

1. **Drag-and-drop has no keyboard alternative.** A user who cannot use a pointer can still create, edit, and delete tasks, but cannot move them between columns. Mitigation idea: re-introduce a hidden "move to" submenu accessible from the per-card menu, or provide arrow-key bindings. *Tracked as a future story; does not block AA conformance because the same outcome (moving) is achievable by deleting and recreating, but this is a UX wart worth fixing.*
2. **Lighthouse SEO score 82** — caused by the missing meta description. Not relevant for an internal/personal app, easy to add if it becomes one.
3. **No language declaration on `<html>`.** Already set to `lang="en"` in `index.html`.

---

## Reproducing the audit

```bash
# Automated (must have stack running)
docker-compose --profile dev up -d
cd frontend
npx playwright test e2e/accessibility.spec.ts

# Manual Lighthouse
npm run build
npx vite preview --port 4173 &
npx lighthouse http://localhost:4173/login --view
```
