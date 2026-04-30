---
stepsCompleted: ['step-01-init', 'step-02-context', 'step-03-starter', 'step-04-decisions', 'step-05-patterns', 'step-06-structure', 'step-07-validation', 'step-08-complete']
lastStep: 8
status: 'complete'
completedAt: '2026-04-29'
inputDocuments: ['_bmad-output/planning-artifacts/prd.md']
workflowType: 'architecture'
project_name: 'todo_bmad'
user_name: 'Harshit'
date: '2026-04-29'
---

# Architecture Decision Document

_This document builds collaboratively through step-by-step discovery. Sections are appended as we work through each architectural decision together._

## Project Context Analysis

### Requirements Overview

**Functional Requirements:**
15 FRs across 4 areas: Authentication & Session Management, Task Board display, Task Management (full CRUD), and Navigation & Routing. All FRs are straightforward CRUD operations with no complex business logic. The most architecturally significant constraint is that all board and task data must be strictly scoped to the authenticated user — no cross-user access is possible.

**Non-Functional Requirements:**
- Performance: <2s initial board load; immediate visual feedback on all task operations; responsive with up to 200 tasks
- Security: passwords hashed at rest; all traffic over HTTPS; session tokens invalidated on logout; user data isolation enforced at the API layer

**Scale & Complexity:**
- Primary domain: Full-stack web (SPA + REST API)
- Complexity level: Low — single user, no real-time, no multi-tenancy, no regulated domain, no integrations
- Estimated architectural components: Frontend SPA, REST API server, persistent database, auth layer

### Technical Constraints & Dependencies

- Client-side SPA: no SSR, client handles all routing and rendering
- REST API with JSON responses
- Modern browsers only (latest 2 versions of Chrome, Firefox, Safari, Edge)
- Desktop-first viewport; mobile graceful degradation only
- No real-time sync required; page refresh acceptable for multi-tab use
- No offline mode, no PWA, no push notifications

### Cross-Cutting Concerns Identified

- **Authentication:** Every non-login route requires an auth guard; unauthenticated requests redirect to login
- **Data scoping:** Every API query must filter by authenticated user ID — enforced server-side, not client-side
- **Error handling:** All API calls (create, move, edit, delete) need failure states visible to the user without crashing the board
- **State consistency:** Board UI must stay in sync with server state after each mutation

## Starter Template Evaluation

### Primary Technology Domain

Full-stack web: React SPA (frontend) + FastAPI REST API (backend) + PostgreSQL (database), containerised with Docker Compose.

### Starter Options Considered

**Option A — tiangolo/full-stack-fastapi-template (copier)**
Official reference implementation by the FastAPI author. Includes React + TypeScript frontend, FastAPI + SQLModel backend, Docker Compose, Alembic migrations, GitHub Actions CI/CD, and automatic HTTPS. Well-maintained but carries significant setup overhead appropriate for production SaaS — more than needed here.

**Option B — Manual scaffolding following tiangolo conventions (recommended)**
Use `npm create vite@latest` for the frontend and a hand-crafted FastAPI project structure that mirrors the tiangolo folder conventions without the CI/CD and HTTPS layers. Clean, minimal codebase without enterprise ceremony.

### Selected Approach: Manual scaffolding (tiangolo-aligned structure)

**Rationale:** The app is a simple single-user CRUD tool. The full copier template adds GitHub Actions, HTTPS, email services, and multi-tenant scaffolding that would require stripping out. A clean manual setup is faster to start and easier to understand.

**Frontend Initialization Command:**
```bash
npm create vite@latest frontend -- --template react-ts
```

**Backend Initialization:**
```bash
mkdir backend && cd backend
python -m venv .venv && source .venv/bin/activate
pip install fastapi==0.136.1 sqlmodel==0.0.38 alembic==1.18.4 psycopg2-binary uvicorn[standard]
```

### Architectural Decisions Provided by Starter

**Language & Runtime:**
- Frontend: TypeScript + React 19, Vite 8.0 (Rolldown/Oxc bundler)
- Backend: Python 3.11+, FastAPI 0.136.1, async-capable

**ORM & Migrations:**
- SQLModel 0.0.38 (SQLAlchemy 2.0 + Pydantic V2 unified models)
- Alembic 1.18.4 for schema migrations

**Build Tooling:**
- Frontend: Vite 8 dev server + production build
- Backend: Uvicorn ASGI server

**Project Structure:**
```
project-root/
├── frontend/          # Vite React TypeScript SPA
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api/       # API client / fetch wrappers
│   │   └── main.tsx
│   └── vite.config.ts
├── backend/           # FastAPI application
│   ├── app/
│   │   ├── api/       # Route modules
│   │   ├── models/    # SQLModel DB models
│   │   ├── schemas/   # Pydantic request/response schemas
│   │   ├── services/  # Business logic
│   │   ├── db/        # DB config, session dependency
│   │   └── main.py
│   └── alembic/       # DB migrations
├── docker-compose.yml
└── .env
```

**Docker Compose Services:**
```yaml
services:
  db:
    image: postgres:15
    healthcheck: pg_isready
  backend:
    build: ./backend
    depends_on: db (healthy)
    ports: 8000
  frontend:
    build: ./frontend
    depends_on: backend
    ports: 5173 (dev) / 80 (prod)
```

**Development Experience:**
- Vite HMR for instant frontend updates
- Uvicorn `--reload` for backend hot reload
- Docker Compose for single-command local startup (`docker compose up`)

**Note:** Project scaffolding using the above commands should be the first implementation story.

## Core Architectural Decisions

### Decision Priority Analysis

**Critical Decisions (Block Implementation):**
- Auth method: JWT in HTTP-only cookies
- CORS: credentials-aware, explicit frontend origin
- Database schema: users + tasks tables with status enum
- Frontend routing: auth-guarded routes via React Router v7

**Important Decisions (Shape Architecture):**
- Styling: Tailwind CSS
- Data fetching: plain fetch + useState (no external data library)
- Auth state: React Context for login state propagation

**Deferred Decisions (Post-MVP):**
- CI/CD pipeline
- Monitoring and logging
- Production HTTPS termination (handled at Docker/reverse proxy layer)

### Data Architecture

**Database:** PostgreSQL 15

**ORM:** SQLModel 0.0.38 — unified SQLAlchemy 2.0 + Pydantic V2 models; one class serves as both DB model and API schema where appropriate.

**Migrations:** Alembic 1.18.4 — all schema changes via versioned migration files, never manual DDL.

**Schema:**
```
users
  id          UUID  PK
  email       TEXT  UNIQUE NOT NULL
  hashed_pw   TEXT  NOT NULL

tasks
  id          UUID  PK
  title       TEXT  NOT NULL
  status      ENUM  ('todo', 'in_progress', 'done')  DEFAULT 'todo'
  user_id     UUID  FK → users.id  NOT NULL
  created_at  TIMESTAMP  DEFAULT now()
  updated_at  TIMESTAMP  DEFAULT now()
```

**Caching:** None — no caching layer needed for this scale and access pattern.

### Authentication & Security

**Method:** JWT stored in HTTP-only cookie.

- Login endpoint issues a signed JWT and sets it as `Set-Cookie: access_token=<jwt>; HttpOnly; Secure; SameSite=Lax`
- Frontend never reads or stores the token — browser sends it automatically on every request
- Logout endpoint clears the cookie server-side
- JWT library: `python-jose` + `passlib[bcrypt]` for password hashing

**CORS Configuration:**
- FastAPI `CORSMiddleware` with `allow_credentials=True`
- Explicit allowed origin: frontend container URL (e.g. `http://localhost:5173` in dev)
- Allowed methods: GET, POST, PUT, DELETE, OPTIONS

**Token validation:** FastAPI dependency (`get_current_user`) decodes and validates JWT on every protected route, returning the `user_id` for data scoping.

### API & Communication Patterns

**Design:** REST with FastAPI auto-generated OpenAPI docs (`/docs` enabled in dev, disabled in prod).

**Route structure:**
```
POST   /auth/login
POST   /auth/logout
GET    /tasks          → returns tasks for authenticated user only
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
PATCH  /tasks/{id}/status   → move between columns
```

**Error handling:** FastAPI `HTTPException` with standard HTTP status codes; JSON body `{"detail": "message"}`. No custom error envelope.

**Data scoping:** Every query in task endpoints filters by `user_id` extracted from the validated JWT — enforced in the service layer, not the route handler.

### Frontend Architecture

**Routing:** React Router v7 — two route groups:
- Public: `/login`
- Protected (auth-guarded): `/` (board)

Auth guard implemented as a wrapper component that checks auth state; redirects to `/login` if unauthenticated.

**Auth state:** React Context (`AuthContext`) holds current user state (authenticated / unauthenticated). Populated on app load by a `/auth/me` check.

**Styling:** Tailwind CSS — utility classes only, no component library.

**Data fetching:** Plain `fetch` with `credentials: 'include'` + `useState` / `useEffect` for loading and error states. A thin `api.ts` wrapper handles the fetch base URL and common headers.

**State after mutations:** After each create/move/edit/delete, re-fetch the task list to keep UI in sync with server. No optimistic updates for MVP.

### Infrastructure & Deployment

**Local dev:** `docker compose up` starts all three services (db, backend, frontend) with hot reload enabled on both frontend (Vite HMR) and backend (Uvicorn `--reload`).

**Environment config:** Single `.env` at project root; injected into containers via `docker-compose.yml` `env_file`. Variables: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_ORIGIN`, `POSTGRES_*`.

**Production:** Same Docker Compose file with a multi-stage frontend build (Vite build → Nginx static serve). No CI/CD for MVP.

### Decision Impact Analysis

**Implementation Sequence:**
1. Docker Compose + DB setup (foundation)
2. Backend: models + migrations (schema first)
3. Backend: auth endpoints (login/logout/me with cookie JWT)
4. Backend: task CRUD endpoints
5. Frontend: Vite scaffold + React Router + Tailwind
6. Frontend: login page + AuthContext
7. Frontend: board page + task operations

**Cross-Component Dependencies:**
- Cookie auth requires CORS `allow_credentials` — must be set before any frontend API call
- Task endpoints depend on auth middleware — auth must work before tasks
- Frontend AuthContext must resolve before rendering protected routes

## Implementation Patterns & Consistency Rules

### Critical Conflict Points Identified

6 areas where agents could make incompatible choices: JSON field naming across the language boundary, API response envelope, error format, file naming conventions, component organisation, and fetch credential handling.

### Naming Patterns

**Database & Python (backend) — snake_case throughout:**
```python
# Table names: plural snake_case
class Task(SQLModel, table=True):
    __tablename__ = "tasks"
    user_id: uuid.UUID = Field(foreign_key="users.id")
    created_at: datetime

# File names: snake_case
task_router.py / task_service.py / task_model.py
```

**API JSON field naming — snake_case (no transformation):**
FastAPI returns snake_case by default. TypeScript interfaces use snake_case to match. No camelCase transformation layer.
```typescript
// Correct
interface Task { id: string; title: string; status: string; user_id: string; }
// Wrong — do not transform
interface Task { userId: string; createdAt: string; }
```

**API endpoints — plural nouns, lowercase:**
```
/auth/login  /auth/logout  /auth/me
/tasks       /tasks/{id}   /tasks/{id}/status
```

**Frontend files & components:**
```
PascalCase  → component files:  TaskCard.tsx, BoardColumn.tsx, LoginPage.tsx
camelCase   → utility files:    api.ts, authContext.tsx, useAuth.ts
```

**React components:** PascalCase. Functions/variables/hooks: camelCase.

### Structure Patterns

**Frontend — by feature, not by type:**
```
src/
  components/      # Shared/reusable UI only
  pages/           # Route-level components (LoginPage, BoardPage)
  api/             # api.ts — all fetch calls live here, nowhere else
  context/         # authContext.tsx
  types/           # TypeScript interfaces (Task, User)
```

**Backend — one file per domain concern:**
```
app/
  api/             # Routers: auth_router.py, task_router.py
  models/          # SQLModel models: user.py, task.py
  schemas/         # Request/response schemas (if separate from models)
  services/        # Business logic: task_service.py
  db/              # session.py (get_db dependency)
  main.py          # App init, middleware, router registration
```

**Tests:** Co-located — `TaskCard.test.tsx` next to `TaskCard.tsx`; `test_task_service.py` next to `task_service.py`.

### Format Patterns

**API response — direct, no envelope:**
```json
// Correct — return the resource directly
[{"id": "...", "title": "Buy milk", "status": "todo"}]

// Wrong — do not wrap in {data: ..., meta: ...}
{"data": [...], "success": true}
```

**Error responses — FastAPI default, no custom envelope:**
```json
{"detail": "Task not found"}
```

**Dates — ISO 8601 strings, always UTC:**
```json
{"created_at": "2026-04-29T12:00:00Z"}
```

**Status enum values — lowercase with underscore:**
```
"todo" | "in_progress" | "done"
```

### Communication Patterns

**All frontend fetch calls — via `api.ts` only:**
```typescript
// api.ts — the ONLY place fetch is called
const BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';
export async function apiFetch(path: string, init?: RequestInit) {
  return fetch(`${BASE}${path}`, {
    ...init,
    credentials: 'include',          // always — cookie auth
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });
}
// All other files import apiFetch — never call fetch() directly
```

**Loading and error state — local useState, consistent shape:**
```typescript
const [tasks, setTasks] = useState<Task[]>([]);
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState<string | null>(null);
```

**Auth guard — single `ProtectedRoute` component:**
```tsx
// Wrap all board routes with one component; never inline auth checks
<Route element={<ProtectedRoute />}>
  <Route path="/" element={<BoardPage />} />
</Route>
```

### Process Patterns

**Error handling — surface to user, never swallow:**
```typescript
// After every mutation: catch, set error state, do not crash
try { ... } catch { setError('Failed to update task. Please try again.'); }
```

**State sync after mutation — always re-fetch, no optimistic updates:**
```typescript
await apiFetch(`/tasks/${id}/status`, { method: 'PATCH', body: ... });
await loadTasks(); // always re-fetch after any write
```

**Backend data scoping — always in service layer, never in router:**
```python
# task_service.py — filter by user_id here
def get_tasks(db, user_id: UUID) -> list[Task]:
    return db.exec(select(Task).where(Task.user_id == user_id)).all()

# task_router.py — pass user_id from dependency, do not query directly
@router.get("/tasks")
def list_tasks(current_user=Depends(get_current_user), db=Depends(get_db)):
    return task_service.get_tasks(db, current_user.id)
```

### Enforcement Guidelines

**All agents MUST:**
- Use snake_case field names in TypeScript interfaces (match API output exactly)
- Call the backend exclusively through `api.ts` — no raw `fetch()` elsewhere
- Filter all task queries by `user_id` in the service layer
- Return direct resources from API endpoints — no response envelopes
- Use `{"detail": "message"}` for all error responses (FastAPI default)
- Set `credentials: 'include'` on every fetch call (handled by `apiFetch`)
- Validate JWT and extract `user_id` via the `get_current_user` FastAPI dependency on every protected endpoint

**Anti-patterns to avoid:**
- `fetch()` called directly in a component — use `apiFetch` from `api.ts`
- `userId` or `createdAt` in TypeScript interfaces (camelCase transforms)
- Querying tasks without `WHERE user_id = ?` filter
- Wrapping API responses in `{data: ..., success: ...}` envelopes
- Inline auth checks in components instead of `ProtectedRoute`

## Project Structure & Boundaries

### Complete Project Directory Structure

```
todo-app/
├── .env                          # All env vars (gitignored)
├── .env.example                  # Committed template
├── .gitignore
├── docker-compose.yml
│
├── frontend/                     # Vite + React + TypeScript SPA
│   ├── Dockerfile
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── src/
│       ├── main.tsx              # App entry point
│       ├── App.tsx               # Router setup, ProtectedRoute wiring
│       ├── types/
│       │   └── index.ts          # Task, User interfaces (snake_case)
│       ├── api/
│       │   └── api.ts            # apiFetch wrapper + all API calls
│       ├── context/
│       │   └── authContext.tsx   # AuthContext + AuthProvider
│       ├── components/
│       │   ├── ProtectedRoute.tsx
│       │   ├── BoardColumn.tsx   # Single column (Todo/In Progress/Done)
│       │   └── TaskCard.tsx      # Individual task card
│       └── pages/
│           ├── LoginPage.tsx     # FR1 — login form
│           └── BoardPage.tsx     # FR5, FR8–FR13 — main board
│
├── backend/                      # FastAPI + SQLModel + Alembic
│   ├── Dockerfile
│   ├── requirements.txt
│   ├── alembic.ini
│   ├── alembic/
│   │   ├── env.py
│   │   └── versions/             # Migration files
│   └── app/
│       ├── main.py               # FastAPI init, CORS middleware, router registration
│       ├── config.py             # Settings (SECRET_KEY, DATABASE_URL, FRONTEND_ORIGIN)
│       ├── db/
│       │   └── session.py        # get_db dependency, engine setup
│       ├── models/
│       │   ├── user.py           # User SQLModel table
│       │   └── task.py           # Task SQLModel table + StatusEnum
│       ├── schemas/
│       │   ├── auth.py           # LoginRequest, TokenResponse schemas
│       │   └── task.py           # TaskCreate, TaskUpdate, TaskStatusUpdate schemas
│       ├── api/
│       │   ├── auth_router.py    # POST /auth/login, POST /auth/logout, GET /auth/me
│       │   └── task_router.py    # GET/POST /tasks, PUT/DELETE/PATCH /tasks/{id}
│       ├── services/
│       │   ├── auth_service.py   # JWT creation/validation, password hashing
│       │   └── task_service.py   # Task CRUD, always scoped by user_id
│       └── dependencies.py       # get_current_user FastAPI dependency
```

### Architectural Boundaries

**API Boundaries:**

| Boundary | Location | Responsibility |
|---|---|---|
| Public auth | `POST /auth/login` | Issues JWT cookie; no auth required |
| Auth guard | `dependencies.py → get_current_user` | Validates cookie JWT on every protected route |
| Task API | `task_router.py` | All task mutations; delegates to service |
| Data scope | `task_service.py` | Every query filtered by `user_id` |

**Component Boundaries:**

| Component | Owns | Does not own |
|---|---|---|
| `authContext.tsx` | Login state, `/auth/me` check on load | Routing decisions |
| `ProtectedRoute.tsx` | Route-level auth redirect | Auth state (reads from context) |
| `BoardPage.tsx` | Task list state, load/error states | Individual task rendering |
| `TaskCard.tsx` | Single task display and edit trigger | Task list or column logic |
| `api.ts` | All `fetch` calls, `credentials: 'include'` | UI state |

**Data Boundaries:**

- `task_service.py` is the only layer that touches the `tasks` table
- `auth_service.py` is the only layer that touches the `users` table and JWT logic
- Routers call services only — they never query the DB directly

### Requirements to Structure Mapping

**FR1–FR2 (Login / Logout):** `auth_router.py` → `auth_service.py` → cookie set/clear; `LoginPage.tsx` → `api.ts`

**FR3 (Persistent session):** `dependencies.py get_current_user` validates cookie on every request; `authContext.tsx` calls `/auth/me` on app load

**FR4 (Redirect unauthenticated):** `ProtectedRoute.tsx` reads `AuthContext`; redirects to `/login` if null

**FR5 (Three-column board):** `BoardPage.tsx` renders three `BoardColumn.tsx` instances, passing filtered task lists

**FR6 (Empty state):** `BoardColumn.tsx` renders placeholder when task list for that status is empty

**FR7 (Persistent board state):** PostgreSQL via `task_service.py`; tasks survive session end

**FR8–FR9 (Create / View tasks):** `BoardPage.tsx` calls `api.ts → GET /tasks`; inline create form posts to `POST /tasks`

**FR10 (Move task):** `TaskCard.tsx` triggers `PATCH /tasks/{id}/status`; `BoardPage.tsx` re-fetches after

**FR11 (Edit title):** `TaskCard.tsx` inline edit → `PUT /tasks/{id}`

**FR12–FR13 (Delete, permanent):** `TaskCard.tsx` delete button → `DELETE /tasks/{id}`; no confirmation dialog

**FR14–FR15 (Auth-guarded routes / post-login redirect):** `App.tsx` route config with `ProtectedRoute`; `LoginPage.tsx` redirects to `/` on success

### Data Flow

```
User action (click/form)
  → Component (BoardPage / TaskCard / LoginPage)
  → api.ts apiFetch (credentials: include)
  → FastAPI router (auth cookie validated by get_current_user)
  → Service layer (user_id scoped query)
  → PostgreSQL
  → JSON response (snake_case)
  → Component setState → re-render
```

### Development Workflow

**Start everything:** `docker compose up` — db, backend (hot reload), frontend (HMR)

**Run a migration:** `docker compose exec backend alembic upgrade head`

**Backend API docs (dev only):** `http://localhost:8000/docs`

**Frontend dev server:** `http://localhost:5173`

## Architecture Validation Results

### Coherence Validation ✅

**Decision Compatibility:**
All technology choices are mutually compatible. React 19 + Vite 8 + TypeScript is a well-established combination. FastAPI 0.136 + SQLModel 0.0.38 + SQLAlchemy 2.0 + Alembic 1.18.4 are designed to work together. python-jose and passlib[bcrypt] are the standard FastAPI auth libraries. PostgreSQL 15 is fully supported by SQLAlchemy 2.0. No version conflicts identified.

HTTP-only cookie auth and FastAPI CORS with `allow_credentials=True` are coherent — standard and well-documented pattern for SPA + FastAPI.

**Pattern Consistency:**
snake_case used consistently throughout Python and TypeScript interfaces. `apiFetch` centralises all fetch calls with `credentials: 'include'`. Service layer enforces `user_id` scoping. All patterns align with technology choices.

**Structure Alignment:**
Routers delegate to services, services own DB access, components consume `api.ts` only. Boundaries are clean and non-overlapping.

### Requirements Coverage Validation ✅

**All 15 FRs covered:**

| FR | Covered By |
|---|---|
| FR1 Login | `POST /auth/login` → `auth_service.py` → `LoginPage.tsx` |
| FR2 Logout | `POST /auth/logout` → cookie cleared → `authContext.tsx` |
| FR3 Persistent session | JWT cookie + `get_current_user` dependency + `GET /auth/me` on app load |
| FR4 Redirect unauth | `ProtectedRoute.tsx` reads `AuthContext` |
| FR5 Three-column board | `BoardPage.tsx` + three `BoardColumn.tsx` instances |
| FR6 Empty state | `BoardColumn.tsx` conditional render |
| FR7 Persistent state | PostgreSQL via `task_service.py` |
| FR8 Create task | `POST /tasks` + inline form in `BoardPage.tsx` |
| FR9 View tasks | `GET /tasks` → `BoardPage.tsx` state |
| FR10 Move task | `PATCH /tasks/{id}/status` + re-fetch |
| FR11 Edit title | `PUT /tasks/{id}` + inline edit in `TaskCard.tsx` |
| FR12 Delete task | `DELETE /tasks/{id}` + re-fetch |
| FR13 Permanent deletion | No undo mechanism in architecture |
| FR14 Auth-guarded routes | `ProtectedRoute.tsx` + `get_current_user` on backend |
| FR15 Post-login redirect | `LoginPage.tsx` redirects to `/` on success |

**NFR Coverage:**
- Performance <2s: Vite production build + direct SQL queries ✓
- Immediate feedback: local `isLoading` state + re-fetch pattern ✓
- 200 tasks: single query well within PostgreSQL capacity at this scale ✓
- Passwords hashed: `passlib[bcrypt]` ✓
- HTTPS: enforced at deployment layer; `SameSite=Lax` cookie ✓
- Session invalidation on logout: `auth_router.py` clears cookie ✓
- User data isolation: `user_id` filter in `task_service.py` ✓

### Implementation Readiness Validation ✅

All 15 FRs map to specific files. All critical decisions documented with versions. Anti-patterns documented. Enforcement guidelines clear. Decision completeness, structure completeness, and pattern completeness all verified.

### Gap Analysis Results

**Minor Gap — `/auth/me` endpoint added to route structure:**
Referenced in AuthContext description but omitted from the explicit API route table. Corrected route structure:
```
GET    /auth/me        → returns current user from JWT cookie (used by authContext on app load)
POST   /auth/login
POST   /auth/logout
GET    /tasks
POST   /tasks
PUT    /tasks/{id}
DELETE /tasks/{id}
PATCH  /tasks/{id}/status
```

**Minor Gap — Testing frameworks:**
- Backend: `pytest` + `pytest-asyncio`
- Frontend: `Vitest` (ships with Vite, zero-config)

No critical gaps remain.

### Architecture Completeness Checklist

**Requirements Analysis**
- [x] Project context thoroughly analyzed
- [x] Scale and complexity assessed
- [x] Technical constraints identified
- [x] Cross-cutting concerns mapped

**Architectural Decisions**
- [x] Critical decisions documented with versions
- [x] Technology stack fully specified
- [x] Integration patterns defined
- [x] Performance considerations addressed

**Implementation Patterns**
- [x] Naming conventions established
- [x] Structure patterns defined
- [x] Communication patterns specified
- [x] Process patterns documented

**Project Structure**
- [x] Complete directory structure defined
- [x] Component boundaries established
- [x] Integration points mapped
- [x] Requirements to structure mapping complete

### Architecture Readiness Assessment

**Overall Status:** READY FOR IMPLEMENTATION

**Confidence Level:** High — simple, well-understood stack, clean boundaries, all FRs traced to specific files.

**Key Strengths:**
- Every FR maps to a named file — no ambiguity for implementation agents
- Cookie auth + CORS pattern is coherent and secure for this deployment model
- `apiFetch` centralisation prevents credential-handling drift across agents
- Service layer scoping makes user data isolation impossible to accidentally bypass

**Areas for Future Enhancement:**
- Add pytest + Vitest test scaffolding in the project tree
- Add NGINX reverse proxy config for production if needed
- Consider token refresh strategy if JWT expiry becomes an issue

### Implementation Handoff

**AI Agent Guidelines:**
- Follow all architectural decisions exactly as documented
- Use `apiFetch` from `api.ts` exclusively — no raw `fetch()` in components
- Filter every task query by `user_id` in `task_service.py`
- Use snake_case field names in TypeScript interfaces to match API output
- Re-fetch task list after every mutation — no optimistic updates

**First Implementation Priority:**
```bash
# Step 1: Scaffold the project
mkdir todo-app && cd todo-app
npm create vite@latest frontend -- --template react-ts
mkdir backend
# Then: docker-compose.yml → DB → backend models/migrations → auth → tasks → frontend
```
