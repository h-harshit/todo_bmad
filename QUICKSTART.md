# Todo App - Quick Start Guide

## Overview
A full-stack todo application built with React 19, FastAPI, and SQLModel, with comprehensive test coverage throughout.

**Status:** ✅ All 64 tests passing (18 backend, 46 frontend)

## Prerequisites
- Python 3.9+
- Node.js 18+
- npm or yarn

## Quick Start

### 1. Backend Setup

```bash
cd backend

# Install dependencies
pip install -r requirements.txt

# Run integration tests
python3 -m pytest tests/ -v

# Start development server
python3 -m uvicorn app.main:app --reload
```

Backend runs on: http://localhost:8000

### 2. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run component tests
npm test

# Start development server
npm run dev
```

Frontend runs on: http://localhost:5173 (or shown in terminal)

### 3. Access the Application

Open your browser to the frontend URL and:

1. **Login**: Create an account or use test credentials
   - Email: test@example.com
   - Password: any value (will be created on first login)

2. **Create Tasks**: Enter task in the "TODO" column

3. **Manage Tasks**: 
   - Click task title to edit
   - Use ↓ button to move between columns
   - Use ⋯ menu for delete

## Test Commands

### Run All Backend Tests
```bash
cd backend
python3 -m pytest tests/ -v
```

### Run All Frontend Tests
```bash
cd frontend
npm test
```

### Run Frontend Tests with UI
```bash
cd frontend
npm run test:ui
```

## API Endpoints

### Authentication
- `POST /auth/login` - Login with email/password
- `POST /auth/logout` - Logout user
- `GET /auth/me` - Get current user

### Tasks
- `GET /tasks` - List user's tasks
- `POST /tasks` - Create new task
- `PUT /tasks/{id}` - Update task title
- `PATCH /tasks/{id}/status` - Update task status
- `DELETE /tasks/{id}` - Delete task

## Project Structure

**Backend** - FastAPI + SQLModel
- `app/api/` - Route handlers
- `app/services/` - Business logic
- `app/models/` - Database models
- `app/schemas/` - Request/response schemas
- `tests/` - Integration tests

**Frontend** - React 19 + Tailwind CSS
- `src/pages/` - Page components (Login, Board)
- `src/components/` - UI components (TaskCard, BoardColumn)
- `src/context/` - State management (AuthContext)
- `src/api/` - API client

## Key Features

✅ User authentication with JWT tokens
✅ Task CRUD operations
✅ User-scoped data access
✅ Three-column board layout
✅ Inline task editing
✅ Task status workflow
✅ Delete confirmation modals
✅ Loading and error states
✅ Responsive design

## Technology Stack

**Backend**
- FastAPI (web framework)
- SQLModel (ORM)
- Pydantic v2 (validation)
- bcrypt (password hashing)
- JWT (authentication)
- pytest (testing)

**Frontend**
- React 19 (UI)
- React Router v7 (routing)
- Tailwind CSS (styling)
- Vitest (testing)
- @testing-library/react (testing utilities)

## Test Results

```
Backend Tests:   18 PASSED ✅
├─ Authentication: 7 tests
└─ Tasks: 11 tests

Frontend Tests:  46 PASSED ✅
├─ LoginPage: 4 tests
├─ BoardPage: 12 tests
├─ BoardColumn: 10 tests
├─ TaskCard: 12 tests
└─ AuthContext: 7 tests

Total: 64 PASSED ✅
```

## Common Issues

### "Cannot find module '@testing-library/react'"
```bash
cd frontend
npm install
```

### Backend won't start
```bash
cd backend
pip install -r requirements.txt
```

### Tests fail with "Port already in use"
```bash
# Kill the process on port 8000
lsof -ti:8000 | xargs kill -9
```

### CORS errors
Backend CORS is configured for `http://localhost:5173`. Ensure frontend is running on this port.

## Development Tips

1. **Hot Reload**: Both frontend and backend support hot reload during development
2. **Database**: Uses SQLite (tests use in-memory, app uses `app.db`)
3. **Debugging**: Use browser DevTools for frontend, print statements or debugger for backend
4. **Testing**: Write tests as you develop - all features already have test coverage

## Next Steps

- [ ] Add E2E tests with Playwright
- [ ] Add database migrations with Alembic
- [ ] Implement user profiles
- [ ] Add task categories or tags
- [ ] Add due dates and reminders

## Support

For issues or questions, check:
- Backend logs: `python3 -m uvicorn app.main:app --reload`
- Frontend console: Browser DevTools → Console
- Test output: Run tests with `-v` flag
- Documentation: Check docstrings in code files

---

**Built with the BMAD Methodology**
- Phase 1: Specifications (PRD, Architecture, Epics/Stories)
- Phase 2: Backend Implementation + Integration Tests
- Phase 3: Frontend Implementation + Component Tests
