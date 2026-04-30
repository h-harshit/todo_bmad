# ToDo — BMAD-Driven Full-Stack Implementation

A personal task management app — three columns (To do / In progress / Done), per-user authentication, drag-and-drop, no collaboration overhead.

Built end-to-end using the **BMAD Methodology**: PRD → Architecture → UX → Epics → Implementation Readiness gate → Implementation → QA audits.

## At a glance

| | |
|---|---|
| Backend | FastAPI 0.128, SQLModel 0.0.14, Pydantic v2, JWT in HTTP-only cookies, bcrypt |
| Frontend | React 19, React Router 7, Tailwind 4, Vite 8 |
| Tests | **18** pytest integration · **45** vitest component · **19** Playwright E2E (incl. **5** a11y) |
| Coverage | Backend **90%** · Frontend **85%** |
| Lighthouse (prod) | **Perf 100** · A11y **96** · Best Practices **96** |
| WCAG | **0 critical / serious violations** at AA |
| Container | Multi-stage Dockerfiles, non-root users, healthchecks, dev/prod/test profiles |

## Quick start

### Run with Docker (recommended)
```bash
docker-compose --profile dev up
# frontend: http://localhost:5173
# backend:  http://localhost:8000  (health: /health)
```

Click **Sign up** at the bottom of the login form, enter any email + password, and you're in.

### Other profiles
```bash
docker-compose --profile prod up                            # multi-stage prod build
docker-compose --profile test run --rm backend-test         # backend pytest in container
```

### Run locally without Docker

**Backend**
```bash
cd backend
pip install -r requirements.txt
python3 -m uvicorn app.main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

## Test commands

```bash
# Backend integration tests + coverage
cd backend && python3 -m pytest tests/

# Frontend unit / component tests
cd frontend && npm test

# Frontend coverage report (HTML in coverage/)
cd frontend && npm run test:coverage

# E2E + accessibility (stack must be running)
cd frontend && npm run test:e2e

# E2E in interactive UI mode
cd frontend && npm run test:e2e:ui
```

## Repository layout

```
.
├── backend/                                # FastAPI app
│   ├── app/
│   │   ├── api/                            # auth_router, task_router
│   │   ├── services/                       # auth_service (JWT/bcrypt), task_service (user-scoped)
│   │   ├── models/                         # SQLModel: User, Task
│   │   ├── schemas/                        # Pydantic request/response
│   │   ├── dependencies.py                 # get_current_user, get_session
│   │   ├── config.py
│   │   └── main.py                         # FastAPI app, CORS, /health
│   ├── tests/                              # pytest integration tests
│   ├── conftest.py                         # in-memory SQLite fixture
│   ├── Dockerfile                          # multi-stage prod
│   ├── Dockerfile.dev                      # bind-mount + --reload
│   ├── pytest.ini                          # coverage configured (≥70% gate)
│   └── requirements.txt
│
├── frontend/                               # React 19 + Vite + Tailwind v4
│   ├── src/
│   │   ├── pages/                          # LoginPage, BoardPage
│   │   ├── components/                     # TaskCard, BoardColumn, ProtectedRoute
│   │   ├── context/                        # authContext
│   │   ├── api/api.ts                      # fetch wrapper, throws on non-2xx
│   │   ├── types/                          # User, Task
│   │   ├── App.tsx, main.tsx, index.css
│   ├── e2e/                                # Playwright tests
│   │   ├── auth.spec.ts
│   │   ├── tasks.spec.ts
│   │   ├── drag-and-drop.spec.ts
│   │   ├── accessibility.spec.ts
│   │   └── helpers.ts
│   ├── Dockerfile                          # multi-stage: vite build → nginx
│   ├── Dockerfile.dev
│   ├── nginx.conf                          # SPA fallback, asset caching
│   ├── playwright.config.ts
│   ├── vitest.config.ts                    # coverage thresholds
│   ├── tailwind.config.js, postcss.config.js
│   └── package.json
│
├── _bmad-output/
│   ├── planning-artifacts/                 # BMAD specs (frozen + version-controlled)
│   │   ├── prd.md
│   │   ├── architecture.md
│   │   ├── ux-design-specification.md
│   │   ├── epics.md
│   │   └── implementation-readiness-report-2026-04-29.md
│   └── qa-reports/                         # Phase 4 audits
│       ├── coverage-report.md
│       ├── accessibility-report.md
│       ├── performance-report.md
│       ├── security-review.md
│       ├── ai-integration-log.md
│       └── bmad-process.md
│
├── docker-compose.yml                      # dev / prod / test profiles
├── .env.example
└── README.md                               # this file
```

## Architecture summary

```
            ┌────────────────────────────┐
            │  Browser (React 19 SPA)    │
            │  - HTTP-only cookie holds  │
            │    JWT, never JS-readable  │
            └──────────────┬─────────────┘
                           │ fetch (credentials: include)
                           ▼
            ┌────────────────────────────┐
            │  FastAPI                   │
            │  - CORS scoped to FRONTEND │
            │  - get_current_user        │
            │     decorator on routes    │
            │  - service layer enforces  │
            │     user_id on every query │
            └──────────────┬─────────────┘
                           │
                           ▼
                     SQLite (or Postgres)
```

Full details in [`_bmad-output/planning-artifacts/architecture.md`](_bmad-output/planning-artifacts/architecture.md).

## Documentation map

| Document | What it covers |
|---|---|
| [**PRD**](_bmad-output/planning-artifacts/prd.md) | Vision, target users, FRs, NFRs, journeys |
| [**Architecture**](_bmad-output/planning-artifacts/architecture.md) | Stack, API contract, schema, deploy story |
| [**UX Spec**](_bmad-output/planning-artifacts/ux-design-specification.md) | Wireframes, interaction details, design principles |
| [**Epics & Stories**](_bmad-output/planning-artifacts/epics.md) | 3 epics, 9 stories with Given/When/Then ACs |
| [**Implementation Readiness**](_bmad-output/planning-artifacts/implementation-readiness-report-2026-04-29.md) | Gap analysis run before coding started |
| [**Coverage report**](_bmad-output/qa-reports/coverage-report.md) | Per-file numbers, gates, exclusions |
| [**Accessibility audit**](_bmad-output/qa-reports/accessibility-report.md) | WCAG AA, axe-core in CI, Lighthouse |
| [**Performance audit**](_bmad-output/qa-reports/performance-report.md) | Lighthouse, Core Web Vitals, bundle |
| [**Security review**](_bmad-output/qa-reports/security-review.md) | OWASP Top 10 walkthrough, findings |
| [**AI integration log**](_bmad-output/qa-reports/ai-integration-log.md) | What AI was used for, prompts, limitations |
| [**BMAD process**](_bmad-output/qa-reports/bmad-process.md) | How the methodology shaped the build |

## Environment configuration

`.env` files are provided in `backend/` and `frontend/`. Templates in `.env.example`.

| Var | Default (dev) | Notes |
|---|---|---|
| `DATABASE_URL` | `sqlite:///app.db` (local) / `sqlite:////data/app.db` (Docker) | Postgres URL works too |
| `SECRET_KEY` | `dev-secret-change-me` | **Must rotate before prod** — see security review |
| `FRONTEND_ORIGIN` | `http://localhost:5173` | CORS allow-origin |
| `VITE_API_URL` | `http://localhost:8000` | Embedded into frontend bundle at build time in `prod` profile |

## Health checks

- Backend: `GET /health` returns `{"status":"ok"}`
- Container `HEALTHCHECK` directives in both Dockerfiles
- `docker-compose ps` shows health status; downstream services use `condition: service_healthy`

## Common operations

```bash
# Reset the database (dev)
rm backend/app.db
docker-compose --profile dev restart backend

# Tail logs
docker-compose logs -f backend
docker-compose logs -f frontend

# Run a backend shell
docker-compose --profile dev exec backend bash

# Re-run all tests from scratch
cd backend && python3 -m pytest tests/
cd ../frontend && npm test && npm run test:e2e
```

## Troubleshooting

**`ImportError: email-validator is not installed`**
The container was built before `email-validator` landed in `requirements.txt`. Rebuild without cache:
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose --profile dev up
```

**Vite isn't picking up file changes**
Common Docker-on-Mac issue with file watchers. Restart the frontend container:
```bash
docker-compose --profile dev restart frontend
```

**`tasks.filter is not a function`**
Old `api.ts` cached in browser. Hard-refresh (`Cmd+Shift+R`).

**Tailwind utility classes not applying**
Check `frontend/src/index.css` uses `@import "tailwindcss";` (v4 syntax), not the v3 `@tailwind base; ...` directives.

**Login returns 401 even with correct credentials**
You probably haven't signed up yet. Click "Sign up" at the bottom of the login form.

## Contributing

This is an assessment artifact — no contribution flow. If you fork it, the BMAD specs in `_bmad-output/planning-artifacts/` are the source of truth; update them before changing behaviour, not after.

---

Built with the BMAD Methodology · React 19 · FastAPI · Tailwind 4 · Playwright · Docker
