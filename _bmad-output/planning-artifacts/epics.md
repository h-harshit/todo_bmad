---
stepsCompleted: ['step-01-validate-prerequisites', 'step-02-design-epics', 'step-03-create-stories']
inputDocuments: ['_bmad-output/planning-artifacts/prd.md', '_bmad-output/planning-artifacts/architecture.md']
---

# ToDo - Epic Breakdown

## Overview

This document provides the complete epic and story breakdown for ToDo, decomposing the requirements from the PRD and Architecture into implementable stories.

## Requirements Inventory

### Functional Requirements

FR1: User can sign up with an email and password to create an account
FR2: User can log in using credentials (email and password)
FR3: User can log out, ending their session
FR4: System maintains a persistent session across browser refreshes via HTTP-only cookies
FR5: Unauthenticated users are automatically redirected to the login page
FR6: Login screen toggles between Log In and Sign Up modes via a single link
FR7: Authenticated user can view their personal task board organised into three columns: To do, In progress, Done
FR8: Each column displays a task count badge and a colour-coded accent (gray / blue / green)
FR9: System displays an empty state in each column when no tasks are present
FR10: Board state persists between sessions — tasks are not lost when the user closes the browser
FR11: User can create a new task by providing a title (input only available in the To do column)
FR12: User can view all their tasks, each displayed in its current column
FR13: User can move a task from any column to any other column by dragging the card and dropping it on the destination column
FR14: Drop targets provide visual feedback (highlighted ring) while a card is being dragged over them
FR15: Task moves are applied optimistically; if the server rejects the move, the UI rolls back and surfaces an error
FR16: User can edit the title of an existing task by clicking it (inline edit with Save / Cancel, plus Enter / Escape shortcuts)
FR17: User can delete a task via a per-card menu, confirmed through a modal dialog
FR18: Task deletion is permanent — no undo or recovery mechanism required
FR19: All board and task routes require authentication — unauthenticated access is blocked
FR20: User is redirected to the board immediately after successful login or signup

### NonFunctional Requirements

NFR1: Initial board load completes in under 2 seconds on a standard broadband connection
NFR2: Task operations (create, edit, move, delete) provide immediate visual feedback with no perceptible delay
NFR3: No loading spinners for routine board interactions
NFR4: Application remains responsive with up to 200 tasks on the board
NFR5: User passwords stored hashed — never in plaintext
NFR6: All client-server communication over HTTPS
NFR7: Session tokens invalidated on logout
NFR8: Board data scoped strictly to the authenticated user — no cross-user data access possible
NFR9: No sensitive personal data collected beyond login credentials and task titles

### Additional Requirements

- AR1: Project scaffolded using `npm create vite@latest frontend -- --template react-ts` and manual FastAPI backend setup — this is the first story
- AR2: Docker Compose with three services (db, backend, frontend) configured as the foundation layer before any feature work
- AR3: PostgreSQL 15 schema (users + tasks tables with status enum) defined via Alembic migrations before feature development
- AR4: JWT authentication stored in HTTP-only cookies; FastAPI CORS configured with `allow_credentials=True` and explicit frontend origin
- AR5: All backend task queries must filter by `user_id` in task_service.py — enforced in service layer, not router
- AR6: All frontend API calls through `api.ts` `apiFetch` wrapper with `credentials: 'include'` — no raw fetch() in components
- AR7: snake_case field names in TypeScript interfaces must match API output exactly — no camelCase transformation layer
- AR8: GET /auth/me endpoint required for AuthContext session check on app load

### UX Design Requirements

No UX design document provided. UI implementation follows Tailwind CSS utility classes with clean, functional styling per architectural decision.

### FR Coverage Map

```
AR1: Epic 1 — Project scaffolding (Vite frontend + FastAPI backend)
AR2: Epic 1 — Docker Compose (db, backend, frontend services)
AR3: Epic 1 — DB schema + Alembic migrations (users + tasks tables)
FR1: Epic 2 — Login endpoint + login page
FR2: Epic 2 — Logout endpoint + client session clear
FR3: Epic 2 — Persistent JWT cookie session
FR4: Epic 2 — Redirect unauthenticated users to /login
FR14: Epic 2 — Auth-guarded routes (ProtectedRoute)
FR15: Epic 2 — Redirect to board on successful login
AR4: Epic 2 — JWT HTTP-only cookie auth + CORS configuration
AR8: Epic 2 — GET /auth/me endpoint for AuthContext on app load
FR5: Epic 3 — Three-column board view (Todo / In Progress / Done)
FR6: Epic 3 — Empty state per column
FR7: Epic 3 — Board state persists in PostgreSQL
FR8: Epic 3 — Create task (title only)
FR9: Epic 3 — View all tasks in their respective columns
FR10: Epic 3 — Move task between columns
FR11: Epic 3 — Edit task title inline
FR12: Epic 3 — Delete task
FR13: Epic 3 — Deletion is permanent, no undo
AR5: Epic 3 — user_id scoping in task_service.py
AR6: Epic 3 — apiFetch wrapper with credentials: include
AR7: Epic 3 — snake_case TypeScript interfaces
NFR1–NFR4: Epic 3 — Performance targets addressed in implementation
NFR5–NFR9: Epic 2 — Security requirements addressed in auth implementation
```

## Epic List

### Epic 1: Project Foundation & Infrastructure
All services start with one command; database is ready with correct schema.
**Requirements covered:** AR1, AR2, AR3

### Epic 2: User Authentication
Users can securely log in, maintain their session across refreshes, and are protected from accessing the board without credentials.
**FRs covered:** FR1, FR2, FR3, FR4, FR14, FR15
**ARs covered:** AR4, AR8
**NFRs covered:** NFR5, NFR6, NFR7, NFR8, NFR9

### Epic 3: Task Board & Management
Users can view their personal three-column board, create and manage tasks, and move them through states from Todo to Done.
**FRs covered:** FR5, FR6, FR7, FR8, FR9, FR10, FR11, FR12, FR13
**ARs covered:** AR5, AR6, AR7
**NFRs covered:** NFR1, NFR2, NFR3, NFR4

---

## Epic 1: Project Foundation & Infrastructure

All services start with one command; database is ready with correct schema. No application features exist yet — this epic is purely the foundation every subsequent epic builds on.

### Story 1.1: Project Scaffolding

As a developer,
I want the frontend and backend directory structures created with all base files in place,
So that I can immediately start building features without spending time on project setup.

**Acceptance Criteria:**

**Given** I have cloned the repository
**When** I inspect the `frontend/` directory
**Then** it contains a working Vite + React + TypeScript app scaffolded via `npm create vite@latest frontend -- --template react-ts`
**And** Tailwind CSS, postcss, and `tailwind.config.js`/`postcss.config.js` are installed and configured
**And** `src/` contains: `main.tsx`, `App.tsx`, `types/index.ts`, `api/api.ts`, `context/authContext.tsx`, `components/` (empty), `pages/` (empty)
**And** `tsconfig.json` has strict mode enabled

**Given** I inspect the `backend/` directory
**When** I review its contents
**Then** it contains `requirements.txt` with pinned versions for FastAPI 0.136.1, SQLModel 0.0.38, Alembic 1.18.4, uvicorn, python-jose, passlib, psycopg2-binary
**And** `app/main.py` contains a minimal FastAPI application instance with no routes yet
**And** subdirectory structure exists: `app/models/`, `app/schemas/`, `app/api/`, `app/services/`, `app/db/`, `alembic/versions/`
**And** `app/config.py` reads `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_ORIGIN` from environment variables

**Given** I inspect the project root
**When** I review its contents
**Then** `.gitignore` excludes `__pycache__/`, `*.pyc`, `.env`, `node_modules/`, `.vite/`, `dist/`
**And** `.env.example` documents all required environment variables: `DATABASE_URL`, `SECRET_KEY`, `FRONTEND_ORIGIN`, `POSTGRES_USER`, `POSTGRES_PASSWORD`, `POSTGRES_DB`

---

### Story 1.2: Docker Compose Environment

As a developer,
I want all three services (database, backend, frontend) to start with a single command,
So that I can run the full application locally without manual service management.

**Acceptance Criteria:**

**Given** I have Docker and Docker Compose installed and a `.env` file with valid values
**When** I run `docker compose up`
**Then** three services start: `db` (postgres:15), `backend` (FastAPI on port 8000), `frontend` (Vite dev server on port 5173)
**And** the `backend` service does not start until the `db` service passes its health check (`pg_isready`)
**And** `http://localhost:8000/docs` returns the FastAPI OpenAPI UI
**And** `http://localhost:5173` returns the Vite React app

**Given** the services are running
**When** I edit a file in `frontend/src/`
**Then** the Vite dev server hot-reloads the change in the browser without a full page refresh

**Given** the services are running
**When** I edit a file in `backend/app/`
**Then** uvicorn reloads the backend automatically (via `--reload` flag)

**Given** the `db` service is defined
**When** I inspect its configuration
**Then** PostgreSQL data is persisted in a named Docker volume so it survives `docker compose down` and `docker compose up` cycles
**And** the `POSTGRES_USER`, `POSTGRES_PASSWORD`, and `POSTGRES_DB` variables are sourced from the `.env` file

---

### Story 1.3: Database Schema and Migrations

As a developer,
I want the database schema created and managed through Alembic migrations,
So that the schema is version-controlled and reproducible across environments.

**Acceptance Criteria:**

**Given** the `db` service is running and `alembic.ini` is configured with `DATABASE_URL`
**When** I run `alembic upgrade head` inside the backend container
**Then** a `users` table is created with columns: `id` (UUID, primary key), `email` (TEXT, unique, not null), `hashed_password` (TEXT, not null)
**And** a `tasks` table is created with columns: `id` (UUID, primary key), `title` (TEXT, not null), `status` (ENUM: `todo`, `in_progress`, `done`, default `todo`), `user_id` (UUID, foreign key → `users.id`, not null), `created_at` (TIMESTAMP, default now), `updated_at` (TIMESTAMP, default now, auto-updated)
**And** running `alembic upgrade head` a second time is idempotent — no error, no duplicate tables

**Given** the migration has been applied
**When** I inspect `app/models/user.py` and `app/models/task.py`
**Then** the SQLModel class definitions for `User` and `Task` match the schema exactly — same column names (snake_case), same types, same constraints
**And** `Task` has a relationship to `User` via `user_id` foreign key

**Given** `alembic/env.py`
**When** I inspect it
**Then** it imports the SQLModel metadata so future model changes automatically generate migration scripts via `alembic revision --autogenerate`

---

## Epic 2: User Authentication

Users can securely log in, maintain their session across refreshes, and are blocked from accessing the board without credentials.

### Story 2.1: Backend Authentication API

As a developer,
I want signup, login, logout, and session-check endpoints implemented with JWT HTTP-only cookie authentication,
So that the frontend can securely authenticate users without storing tokens in accessible browser storage.

**Acceptance Criteria:**

**Given** a `POST /auth/signup` request with `{"email": "...", "password": "..."}` and an email that does not yet exist
**When** the endpoint processes the request
**Then** it creates a new user with a bcrypt-hashed password
**And** returns HTTP 201 with `{"id": "...", "email": "..."}`
**And** sets the `access_token` cookie so the user is logged in immediately

**Given** a `POST /auth/signup` request with an email that already exists
**When** the endpoint processes the request
**Then** it returns HTTP 409 with `{"detail": "Email already registered"}`
**And** no user is created and no cookie is set

**Given** a `POST /auth/login` request with `{"email": "...", "password": "..."}` and valid credentials
**When** the endpoint processes the request
**Then** it returns HTTP 200 with a JSON body `{"id": "...", "email": "..."}` (no password field)
**And** sets an HTTP-only, SameSite=Lax cookie named `access_token` containing a signed JWT
**And** the JWT payload includes `sub` (user email) and `exp` (expiry, configurable via env)

**Given** a `POST /auth/login` request with invalid credentials
**When** the endpoint processes the request
**Then** it returns HTTP 401 with `{"detail": "Invalid credentials"}`
**And** no cookie is set

**Given** a `POST /auth/logout` request
**When** the endpoint processes the request
**Then** it returns HTTP 200
**And** clears the `access_token` cookie (sets it with `max_age=0`)

**Given** a `GET /auth/me` request with a valid `access_token` cookie
**When** the `get_current_user` dependency resolves
**Then** it returns HTTP 200 with `{"id": "...", "email": "..."}`

**Given** a `GET /auth/me` request with no cookie or an expired/invalid JWT
**When** the `get_current_user` dependency resolves
**Then** it returns HTTP 401

**Given** the FastAPI application startup
**When** CORS middleware is configured
**Then** `allow_origins` is set to the value of `FRONTEND_ORIGIN` env var (e.g. `http://localhost:5173`)
**And** `allow_credentials=True` is set
**And** `allow_methods=["*"]` and `allow_headers=["*"]` are set

**Given** `app/services/auth_service.py`
**When** a new user is seeded or created
**Then** passwords are stored as bcrypt hashes via `passlib` — never in plaintext

---

### Story 2.2: Frontend Authentication UI and Session Management

As a user,
I want to sign up or log in with my credentials, have my session persist across browser refreshes, and be automatically redirected to the login page when not authenticated,
So that I can securely access my personal board without re-entering credentials on every visit.

**Acceptance Criteria:**

**Given** I navigate to the app root (`/`) without a valid session
**When** the `AuthContext` initialises (calls `GET /auth/me` via `apiFetch`)
**Then** I am redirected to `/login`

**Given** I am on the `/login` page in Log In mode
**When** I enter valid credentials and submit the form
**Then** `POST /auth/login` is called via `apiFetch` with `credentials: 'include'`
**And** on success I am redirected to `/board`
**And** the `AuthContext` user state is populated with the returned user object

**Given** I am on the `/login` page
**When** I click the "Sign up" link below the form
**Then** the form switches to Sign Up mode (button label and copy update accordingly)
**And** any prior error message is cleared

**Given** I am on the `/login` page in Sign Up mode
**When** I submit a valid email and password
**Then** `POST /auth/signup` is called via `apiFetch` with `credentials: 'include'`
**And** on success I am logged in and redirected to `/board`
**And** if the email is already registered, a clear error is shown and I remain on the page

**Given** I am on the `/login` page in either mode
**When** the API returns a non-2xx response
**Then** the API client throws an error
**And** an error message is displayed below the form (e.g. "Invalid email or password" or "Could not create account")
**And** I remain on the login page

**Given** I am logged in and refresh the browser
**When** the app reloads and `AuthContext` calls `GET /auth/me`
**Then** the existing session is detected (cookie is sent automatically)
**And** I am taken directly to `/board` without seeing the login page

**Given** I am on the board and click "Log out"
**When** `POST /auth/logout` is called
**Then** the session cookie is cleared server-side
**And** the `AuthContext` user state is set to `null`
**And** I am redirected to `/login`

**Given** any route under `/board`
**When** I am not authenticated (no valid session)
**Then** `ProtectedRoute` redirects me to `/login`

**Given** `src/api/api.ts`
**When** I inspect the `apiFetch` function
**Then** every call includes `credentials: 'include'`
**And** no component in the codebase calls `fetch()` directly — all calls go through `apiFetch`

---

## Epic 3: Task Board & Management

Users can view their personal three-column board, create and manage tasks, and move them between columns.

### Story 3.1: Backend Task API

As a developer,
I want full CRUD task endpoints implemented with user-scoped data access,
So that authenticated users can manage their tasks via the API with no risk of cross-user data leakage.

**Acceptance Criteria:**

**Given** a `GET /tasks` request with a valid session
**When** `task_service.get_tasks(user_id)` is called
**Then** it returns only tasks where `tasks.user_id = current_user.id`
**And** the response is a JSON array of task objects with fields: `id`, `title`, `status`, `user_id`, `created_at`, `updated_at` (all snake_case)
**And** tasks belonging to other users are never included in the response

**Given** a `POST /tasks` request with `{"title": "My task"}` and a valid session
**When** the endpoint creates the task
**Then** a new task row is inserted with `status = "todo"` and `user_id = current_user.id`
**And** the response is the created task object with HTTP 201

**Given** a `PUT /tasks/{id}` request with `{"title": "Updated title"}` and a valid session
**When** `task_service.update_task(task_id, user_id, data)` is called
**Then** the task title is updated only if `tasks.user_id = current_user.id`
**And** if the task does not exist or belongs to another user, HTTP 404 is returned

**Given** a `PATCH /tasks/{id}/status` request with `{"status": "in_progress"}` and a valid session
**When** `task_service.update_task_status(task_id, user_id, status)` is called
**Then** the task status is updated only if `tasks.user_id = current_user.id`
**And** `status` must be one of `todo`, `in_progress`, `done` — any other value returns HTTP 422

**Given** a `DELETE /tasks/{id}` request with a valid session
**When** `task_service.delete_task(task_id, user_id)` is called
**Then** the task is permanently deleted only if `tasks.user_id = current_user.id`
**And** if not found or belongs to another user, HTTP 404 is returned
**And** the response is HTTP 204 with no body

**Given** `app/services/task_service.py`
**When** I inspect every query
**Then** every query filters by `user_id` — no query returns tasks without a `user_id` filter

**Given** any task route
**When** the request has no valid session cookie
**Then** the `get_current_user` dependency returns HTTP 401 before the route handler executes

---

### Story 3.2: Three-Column Board View

As a user,
I want to see my tasks organised across three columns — Todo, In Progress, Done — with an empty state when a column has no tasks,
So that I can understand my work at a glance.

**Acceptance Criteria:**

**Given** I am logged in and navigate to `/board`
**When** the `BoardPage` component mounts
**Then** `GET /tasks` is called via `apiFetch` and the response populates the board
**And** tasks with `status = "todo"` appear in the Todo column
**And** tasks with `status = "in_progress"` appear in the In Progress column
**And** tasks with `status = "done"` appear in the Done column

**Given** a column has no tasks
**When** I view that column
**Then** an empty state message is displayed (e.g. "No tasks here yet")
**And** the column is still visible with its header

**Given** the board has loaded
**When** I inspect the page layout
**Then** all three columns are visible side-by-side in a horizontal layout on desktop viewports
**And** each column displays its title (Todo / In Progress / Done)

**Given** the board data is fetching on initial load
**When** the request is in flight
**Then** no loading spinner is shown — the columns render immediately (empty or with cached data)

---

### Story 3.3: Create Task

As a user,
I want to create a new task by typing a title and saving it,
So that I can add work items to my board without leaving the page.

**Acceptance Criteria:**

**Given** I am on the board page
**When** I interact with the task creation UI in the Todo column
**Then** a text input is visible for entering the task title

**Given** I have typed a title and submit (click a button or press Enter)
**When** the form submits
**Then** `POST /tasks` is called via `apiFetch` with `{"title": "<entered title>"}`
**And** on success the task list is re-fetched (`GET /tasks`) and the new task appears in the Todo column
**And** the input field is cleared after successful creation

**Given** I submit the form with an empty title
**When** validation runs
**Then** no API call is made
**And** the empty input is highlighted or an inline error is shown

**Given** the task is created successfully
**When** the board re-renders
**Then** the new task card appears in the Todo column without a page reload

---

### Story 3.4: Move Task Between Columns (Drag and Drop)

As a user,
I want to drag a task card and drop it onto any column,
So that I can update its status quickly without opening menus.

**Acceptance Criteria:**

**Given** I am viewing a task card
**When** I press and hold the card with my pointer
**Then** the card becomes draggable (cursor changes to grabbing, card shows reduced opacity and slight rotation as a drag affordance)

**Given** I am dragging a card over a column other than its current one
**When** my pointer is over the column
**Then** the column highlights as a drop target (blue ring) and the empty-state message reads "Drop here"

**Given** I release the card on a target column
**When** the drop occurs
**Then** the task immediately moves into the target column in the UI (optimistic update)
**And** `PATCH /tasks/{id}/status` is called with the corresponding status value (`todo`, `in_progress`, or `done`)
**And** on success the card stays in the new column with the server-confirmed task data

**Given** I drop a card on the same column it came from
**When** the drop occurs
**Then** no API call is made and no state changes

**Given** a task is in the Done column
**When** I drag it back to In Progress
**Then** the move succeeds — all column transitions are reversible

**Given** the move API call fails (network error or 4xx)
**When** the error response is received
**Then** the optimistic update is rolled back and the task returns to its original column
**And** an error banner is shown to the user

---

### Story 3.5: Edit Task Title

As a user,
I want to edit the title of an existing task inline,
So that I can correct or update task descriptions without leaving the board.

**Acceptance Criteria:**

**Given** I am viewing a task card
**When** I click on the task title or an edit icon
**Then** the title text transforms into an editable input field pre-filled with the current title

**Given** the title is in edit mode and I change the text and confirm (press Enter or click a save button)
**When** the save action triggers
**Then** `PUT /tasks/{id}` is called with `{"title": "<new title>"}`
**And** on success the task list is re-fetched and the updated title appears on the card
**And** the input returns to display mode

**Given** the title is in edit mode and I press Escape or click a cancel control
**When** the cancel action triggers
**Then** no API call is made
**And** the original title is restored and the input returns to display mode

**Given** I try to save an empty title
**When** the save is attempted
**Then** no API call is made
**And** the empty field is highlighted or an inline error is shown

---

### Story 3.6: Delete Task

As a user,
I want to delete a task permanently,
So that I can remove work items I no longer need.

**Acceptance Criteria:**

**Given** I am viewing a task card
**When** I click a delete button or icon on the card
**Then** a confirmation prompt is shown (e.g. "Delete this task?" with Confirm / Cancel)

**Given** I confirm the deletion
**When** the delete action triggers
**Then** `DELETE /tasks/{id}` is called via `apiFetch`
**And** on success the task list is re-fetched and the task no longer appears on the board
**And** no undo option is provided — the deletion is permanent

**Given** I cancel the confirmation prompt
**When** the cancel action triggers
**Then** no API call is made and the task remains on the board

**Given** the delete API call fails
**When** the error response is received
**Then** the task remains visible on the board
**And** an error message is shown to the user
