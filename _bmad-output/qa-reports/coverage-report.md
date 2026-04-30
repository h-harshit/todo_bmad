# Test Coverage Report

**Generated:** 2026-04-30
**Target:** ≥70% meaningful coverage

## Summary

| Suite | Statements | Branches | Functions | Lines | Status |
|---|---|---|---|---|---|
| **Backend** (pytest-cov) | 90.2% | — | — | 90.2% | ✅ |
| **Frontend** (@vitest/coverage-v8) | 85.4% | 75.3% | 85.7% | 87.0% | ✅ |
| **Combined target** | ≥70% | ≥70% | ≥70% | ≥70% | ✅ |

Both suites exceed the 70% target.

---

## Backend Coverage Detail

Run: `cd backend && python3 -m pytest tests/`

```
Name                           Stmts   Miss  Cover   Missing
------------------------------------------------------------
app/__init__.py                    0      0   100%
app/api/__init__.py                0      0   100%
app/api/auth_router.py            39      9    77%   27-37
app/api/task_router.py            34      0   100%
app/config.py                     10      0   100%
app/db/__init__.py                 0      0   100%
app/dependencies.py               35     10    71%   14-21, 24-25, 28-30, 43, 48
app/main.py                       18      3    83%   21, 29, 33
app/models/task.py                11      0   100%
app/models/user.py                 7      0   100%
app/schemas/auth.py                7      0   100%
app/schemas/task.py               16      0   100%
app/services/auth_service.py      24      1    96%    18
app/services/task_service.py      45      1    98%    37
------------------------------------------------------------
TOTAL                            246     24    90%
```

**Test counts:** 18 integration tests, all passing.

### Uncovered branches and rationale

- `auth_router.py:27-37` — the `/auth/signup` happy path runs but the `_set_auth_cookie` helper's branch when a custom expiry is passed is not exercised. **Acceptable**: feature-flagged path, low risk.
- `dependencies.py:14-30` — lazy engine init runs once per process; some branches (Postgres dialect detection) are not exercised in test runs that use SQLite only. **Acceptable**: dialect-specific branch covered by config substitution.
- `main.py:21` — the `@app.on_event("startup")` body that calls `create_db_and_tables()` runs only at app boot. Tests bypass this with their own session fixture. **Acceptable**: behaviour is verified indirectly by every test that hits a route.

---

## Frontend Coverage Detail

Run: `cd frontend && npm run test:coverage`

```
File              | % Stmts | % Branch | % Funcs | % Lines
------------------|---------|----------|---------|--------
All files         |   85.38 |    75.32 |   85.71 |   87.01
 components       |   82.81 |    74.28 |   76.19 |    86.20
  BoardColumn.tsx |   75.00 |    61.90 |   71.42 |    80.00
  TaskCard.tsx    |   88.88 |    92.85 |   78.57 |    90.90
 pages            |   84.44 |    75.00 |   91.30 |    84.81
  BoardPage.tsx   |   83.33 |    90.00 |   94.44 |    82.14
  LoginPage.tsx   |   87.50 |    60.00 |   80.00 |    91.30
```

**Test counts:** 45 component/unit tests, all passing.

### Excluded from coverage

These files are excluded because they are routing/composition shells that are exercised by E2E tests rather than unit tests:

- `App.tsx` — top-level router only
- `main.tsx` — React root mount
- `components/ProtectedRoute.tsx` — thin wrapper around `react-router-dom`'s `Navigate`
- `api/api.ts` — tested via integration in component tests (mocked) and end-to-end in Playwright

### Uncovered branches and rationale

- `BoardColumn.tsx:56-58, 62-63` — `handleDragLeave` early-return when `relatedTarget` is a child node. **Acceptable**: jsdom does not simulate drag events with a `relatedTarget`; this branch is exercised in Playwright drag-and-drop tests.
- `LoginPage.tsx:16, 103` — early redirect when `user` is already set on first render. Component test fixtures inject `user: null`; the redirect path is exercised in E2E.

---

## E2E Coverage (User Journeys)

| Journey | E2E test | Status |
|---|---|---|
| Sign up → board | `auth.spec.ts` | ✅ |
| Log in → board | `auth.spec.ts` | ✅ |
| Wrong credentials → error shown | `auth.spec.ts` | ✅ |
| Duplicate signup → error shown | `auth.spec.ts` | ✅ |
| Unauthenticated → redirect to /login | `auth.spec.ts` | ✅ |
| Create task | `tasks.spec.ts` | ✅ |
| Edit task inline | `tasks.spec.ts` | ✅ |
| Delete with confirmation | `tasks.spec.ts` | ✅ |
| Cancel delete | `tasks.spec.ts` | ✅ |
| Empty state in all columns | `tasks.spec.ts` | ✅ |
| Persistence across reload | `tasks.spec.ts` | ✅ |
| Drag TODO → In Progress | `drag-and-drop.spec.ts` | ✅ |
| Drag → Done | `drag-and-drop.spec.ts` | ✅ |
| Drag back from Done | `drag-and-drop.spec.ts` | ✅ |
| Column count badges | `drag-and-drop.spec.ts` | ✅ |

**E2E count:** 14 task/auth/dnd + 5 a11y = 19 tests, all passing.

---

## Reproducing locally

```bash
# Backend
cd backend
python3 -m pytest tests/                # produces term + HTML + JSON reports
open coverage_html/index.html           # browse report

# Frontend
cd frontend
npm run test:coverage                   # produces term + HTML + json-summary
open coverage/index.html

# E2E (stack must be running)
docker-compose --profile dev up -d
cd frontend && npm run test:e2e
```
