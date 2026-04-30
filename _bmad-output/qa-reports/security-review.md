# Security Review

**Generated:** 2026-04-30
**Scope:** Application code (frontend + backend), Docker images, CORS / cookie / auth flow.
**Methodology:** Manual code audit against OWASP Top 10, dependency surface review, runtime configuration review.

## Result: ✅ No critical or high-severity findings

All findings are either already mitigated, accepted for the threat model (single-user / personal app), or tracked as recommendations for production hardening.

---

## OWASP Top 10 (2021) checklist

| # | Category | Status | Notes |
|---|---|---|---|
| A01 | Broken Access Control | ✅ Mitigated | All task routes call `task_service` with `user_id` from the JWT; no path bypasses the user filter. |
| A02 | Cryptographic Failures | ✅ Mitigated | bcrypt for passwords (cost 12). JWT signed with HS256. HTTP-only cookies. |
| A03 | Injection | ✅ Mitigated | SQLModel + parameterized queries; no string-concat SQL. Pydantic validates all inputs. |
| A04 | Insecure Design | ⚠ Accepted | No rate limiting, no CSRF token. Acceptable for a single-user personal app, **must** be added if multi-tenant. |
| A05 | Security Misconfiguration | ✅ Mitigated | Non-root containers, multi-stage builds, .dockerignore prevents leaking `.env` / `app.db`. |
| A06 | Vulnerable Components | ⚠ Recommendation | No automated dependency scanning yet. See "Recommendations". |
| A07 | Identification & Authentication Failures | ✅ Mitigated | JWT with expiry, bcrypt password storage, login throttling absent (see A04). |
| A08 | Software & Data Integrity | ✅ Mitigated | No deserialization of untrusted data; no eval / dynamic imports. |
| A09 | Security Logging & Monitoring | ⚠ Recommendation | Application logs are stdout-only. Suitable for `docker logs` review; not aggregated. |
| A10 | Server-Side Request Forgery | ✅ N/A | App does not make outbound HTTP calls based on user input. |

---

## Detailed findings

### 1. Authentication & session handling — ✅ correctly implemented

**Audit:** `app/services/auth_service.py`, `app/api/auth_router.py`, `app/dependencies.py`.

- Passwords hashed with **bcrypt** (`bcrypt==4.1.2`) before storage. Never logged, never returned in responses.
- Login compares using `bcrypt.checkpw` — constant-time, correct.
- JWT tokens signed with **HS256**, payload includes `sub` (email) and `exp` (configurable, defaults to 30 min).
- Token delivered as **HTTP-only cookie** (`access_token`), `SameSite=Lax`, `secure=False` (dev only — see recommendation).
- `/auth/me` validates the JWT and returns 401 on missing / invalid / expired token. Correct error path.
- Logout sends `delete_cookie` with the same attributes, properly clearing the cookie.
- Password is **never** echoed in API responses (verified in `UserResponse` schema — only `id` and `email`).

### 2. SQL injection — ✅ not exploitable

**Audit:** `app/services/task_service.py`, `app/services/auth_service.py`.

- All queries built with SQLModel's `select()` + `.where()` — fully parameterized.
- No raw SQL anywhere in the codebase. `grep -rn "execute\|text(" backend/app/` yields no string-built queries.

### 3. Cross-Site Scripting (XSS) — ✅ not exploitable in the React tree

**Audit:** All `.tsx` files.

- React **escapes by default** — every place we render user content (`{task.title}`, `{user.email}`) goes through React's text escaping.
- **No use of `dangerouslySetInnerHTML`** anywhere (`grep -rn "dangerouslySetInnerHTML" frontend/src/` is empty).
- No `eval`, no `Function()`, no inline event-handler injection.
- Task titles are stored verbatim and rendered as text content. Even a payload like `<script>alert(1)</script>` would display as literal text.

### 4. Cross-Origin Resource Sharing (CORS) — ✅ correctly scoped

**Audit:** `app/main.py`.

```python
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],   # exact, not "*"
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

- `allow_origins` is the explicit frontend origin, never `*`. Required because `allow_credentials=True` plus `*` would be rejected by the browser anyway.
- Cookie flow works correctly cross-origin in dev (localhost:5173 → localhost:8000).

### 5. CSRF — ⚠ Accepted risk for current threat model

The app uses HTTP-only cookies for session; without a CSRF token, a malicious site could in theory trigger an authenticated `POST /tasks` if the user is logged in.

**Why accepted (for now):**
- `SameSite=Lax` blocks the most common CSRF vectors (GET-based image loads, form submissions from third-party sites).
- The app has no destructive multi-user interactions. The worst a CSRF could do is create / move a task in the victim's own board.
- The browser blocks cross-origin form submissions to `/auth/login` because the response sets a cookie that requires CORS preflight, which the malicious origin won't have.

**Mitigation if app becomes multi-user / business-critical:** Adopt double-submit cookie pattern or move to short-lived bearer tokens in `Authorization` header.

### 6. Brute-force / credential stuffing — ⚠ no rate limiting

There is no per-IP or per-account rate limit on `/auth/login` or `/auth/signup`. An attacker could attempt unlimited password guesses.

**Mitigation if exposed publicly:** Add `slowapi` or similar middleware, throttle to e.g. 5 login attempts per IP per minute, lock accounts after 10 failures with exponential backoff.

### 7. Cookie flags — ⚠ `Secure=False` in dev

In `auth_router.py`, the `Secure` flag is `False` so cookies work over plain HTTP in localhost. This **must** flip to `True` before production deployment behind HTTPS.

**Mitigation:** Read from env: `secure=os.getenv("COOKIE_SECURE", "false").lower() == "true"`. Set `COOKIE_SECURE=true` in prod compose / deployment env.

### 8. Secrets in `docker-compose.yml` — ⚠ accepted for dev

`SECRET_KEY: dev-secret-change-me` is in the dev compose file as a literal. Acceptable for local dev. The `prod` profile already reads from env: `SECRET_KEY: ${SECRET_KEY:-change-me-in-production}`.

**Mitigation for prod:** never commit a real secret. Use `.env.production` (gitignored) or a secrets manager.

### 9. Container hardening — ✅ baseline good

- Backend `Dockerfile` runs as non-root `app` user. Read-only WORKDIR for code. `/data` (the SQLite directory) is the only writable path.
- Frontend `Dockerfile` (prod) runs nginx as non-root `nginx` user. No shell login (`/usr/sbin/nologin`).
- Multi-stage builds drop build-time tooling (`build-essential`, `npm`); runtime images contain only the venv / static files.
- `.dockerignore` excludes `.env`, `*.db`, `node_modules`, source maps from build context — prevents accidental leakage into image layers.
- Health checks defined in both Dockerfiles and surfaced via `docker-compose ps`.

### 10. Dependency surface — ⚠ no automated scanning

Frontend pinned to `^4.x` / `^19.x` ranges; backend pinned to exact versions. No tooling currently runs `npm audit` / `pip-audit` / Dependabot.

**Mitigation:**
- Run `npm audit --omit=dev --audit-level=high` and `pip-audit` in CI (recommended for production).
- At time of this review:
  - `npm audit`: 0 vulnerabilities reported.
  - Backend deps: no known CVEs at pinned versions.

---

## Recommendations (priority order)

1. **Pre-prod (must):**
   - Set `Secure=True` on the auth cookie behind HTTPS.
   - Rotate `SECRET_KEY` to a 256-bit random value, store in a secrets manager.
   - Enable `npm audit` and `pip-audit` in CI; gate merges on no high-severity issues.
2. **If exposed publicly (should):**
   - Add login rate limiting.
   - Add CSRF tokens or move to header-based auth for state-changing endpoints.
   - Enable structured request logging with correlation IDs.
3. **Hardening (could):**
   - Move from SQLite to Postgres with TLS-only connections.
   - Add a Web Application Firewall (Cloudflare / AWS WAF) in front of the nginx container.
   - Set CSP header in nginx (`Content-Security-Policy: default-src 'self'`).
   - Subresource integrity for any externally-loaded assets (currently none).

---

## Files audited

| File | Concerns checked |
|---|---|
| `backend/app/api/auth_router.py` | Auth flow, cookie handling, error responses |
| `backend/app/api/task_router.py` | Authorization on each route |
| `backend/app/services/auth_service.py` | Password hashing, JWT generation/validation |
| `backend/app/services/task_service.py` | User-scoped queries |
| `backend/app/dependencies.py` | `get_current_user` enforcement |
| `backend/app/main.py` | CORS configuration |
| `backend/app/models/user.py` | Password field never serialized |
| `frontend/src/api/api.ts` | Credentials handling, error propagation |
| `frontend/src/context/authContext.tsx` | Token never stored client-side |
| `frontend/src/components/*.tsx` | XSS via task content |
| `docker-compose.yml` | Secret handling, network isolation |
| `backend/Dockerfile`, `frontend/Dockerfile` | Non-root user, multi-stage, image surface |
| `.dockerignore` × 2 | Secret / DB exclusion |
