# Development Setup Guide

This guide explains how to set up and run the todo application locally.

## What Was Fixed

1. **Missing email-validator dependency**: Added to requirements.txt and installed
2. **PostgreSQL configuration**: Switched from PostgreSQL to SQLite for simpler local development
3. **Environment configuration**: Created .env files for both backend and frontend

## Prerequisites

- Python 3.9 or higher
- Node.js 18 or higher
- npm or yarn

## Backend Setup

### 1. Install Dependencies

```bash
cd backend
pip3 install -r requirements.txt
```

### 2. Environment Configuration

The `.env` file is already created with SQLite configuration:

```env
DATABASE_URL=sqlite:///app.db
SECRET_KEY=your-secret-key-change-in-production
FRONTEND_ORIGIN=http://localhost:5173
```

To change the database location, edit `backend/.env`:
- `sqlite:///app.db` - Local file database (default)
- `sqlite:///:memory:` - In-memory database (for testing)
- `postgresql://user:password@host:port/dbname` - PostgreSQL (if needed)

### 3. Run Tests

```bash
# Run all backend tests
python3 -m pytest tests/ -v

# Run specific test file
python3 -m pytest tests/test_auth.py -v

# Run with coverage
python3 -m pytest tests/ --cov=app
```

### 4. Start Development Server

```bash
python3 -m uvicorn app.main:app --reload
```

Backend runs on: **http://localhost:8000**

Available endpoints:
- `GET /` - Health check
- `GET /health` - Status endpoint
- `POST /auth/login` - Login
- `POST /auth/logout` - Logout
- `GET /auth/me` - Current user
- `GET /tasks` - List tasks
- `POST /tasks` - Create task
- `PUT /tasks/{id}` - Update task
- `PATCH /tasks/{id}/status` - Change status
- `DELETE /tasks/{id}` - Delete task

## Frontend Setup

### 1. Install Dependencies

```bash
cd frontend
npm install
```

### 2. Environment Configuration

The `.env` file is already created:

```env
VITE_API_URL=http://localhost:8000
```

### 3. Run Tests

```bash
# Run all component tests
npm test

# Run tests with UI
npm run test:ui

# Run tests in watch mode
npm test -- --watch
```

### 4. Start Development Server

```bash
npm run dev
```

Frontend runs on: **http://localhost:5173**

### 5. Build for Production

```bash
npm run build
npm run preview
```

## Running Full Stack with Docker

### Option 1: Docker Compose (Simplified)

```bash
# Build and start all services
docker-compose up

# Run in detached mode
docker-compose up -d

# Stop services
docker-compose down

# View logs
docker-compose logs -f
```

This runs:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

### Option 2: Manual Terminal Setup (Recommended for Development)

**Terminal 1 - Backend:**
```bash
cd backend
python3 -m uvicorn app.main:app --reload
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Tests (Optional):**
```bash
# Run tests in watch mode
cd frontend
npm test -- --watch
```

## Database

### SQLite (Default)

- **Location**: `backend/app.db`
- **Best for**: Local development, testing
- **Reset**: Delete `app.db` file and restart backend
- **No setup required**: Database and tables auto-created on startup

### PostgreSQL (Optional)

To use PostgreSQL instead:

1. Install PostgreSQL locally or via Docker
2. Update `backend/.env`:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/todo_bmad
   ```
3. Start PostgreSQL and create database:
   ```bash
   createdb -U user todo_bmad
   ```
4. Run migrations (if needed):
   ```bash
   alembic upgrade head
   ```

## Troubleshooting

### Backend Issues

**"email-validator is not installed"**
```bash
pip3 install email-validator
# Or reinstall all dependencies:
pip3 install -r requirements.txt
```

**"ModuleNotFoundError"**
```bash
# Install missing dependencies
pip3 install -r requirements.txt
```

**"Database already in use"**
```bash
# Stop any running backend processes
# Or delete app.db and restart:
rm backend/app.db
python3 -m uvicorn app.main:app --reload
```

**"Address already in use"**
```bash
# Kill process on port 8000
lsof -ti:8000 | xargs kill -9

# Or use different port
python3 -m uvicorn app.main:app --reload --port 8001
```

### Frontend Issues

**"Cannot find module"**
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

**"Port 5173 already in use"**
```bash
# Kill process on port 5173
lsof -ti:5173 | xargs kill -9

# Or use different port
npm run dev -- --port 3000
```

**Tests fail with "navigation to another Document"**
This is a known jsdom warning and doesn't affect test results. All tests should still pass.

### Database Issues

**Reset database completely:**
```bash
# Remove SQLite file
rm backend/app.db

# Restart backend
python3 -m uvicorn app.main:app --reload
```

**Check database tables:**
```bash
# SQLite
sqlite3 backend/app.db ".tables"

# View schema
sqlite3 backend/app.db ".schema"
```

## Environment Files

### backend/.env (Created)
```env
DATABASE_URL=sqlite:///app.db
SECRET_KEY=your-secret-key-change-in-production
FRONTEND_ORIGIN=http://localhost:5173
```

### frontend/.env (Created)
```env
VITE_API_URL=http://localhost:8000
```

### .env.example (Reference)
Template for environment variables. Copy to `.env` and customize.

## File Permissions

If you get permission errors:

```bash
# Make scripts executable
chmod +x backend/app/main.py
chmod +x frontend/package.json

# Or for entire directory
chmod -R 755 backend/
chmod -R 755 frontend/
```

## Verification Checklist

- [ ] Python 3.9+ installed: `python3 --version`
- [ ] Node.js 18+ installed: `node --version`
- [ ] Dependencies installed: Run `pip3 install -r requirements.txt` and `npm install`
- [ ] Backend tests pass: `python3 -m pytest tests/ -v`
- [ ] Frontend tests pass: `npm test`
- [ ] Backend starts: `python3 -m uvicorn app.main:app --reload`
- [ ] Frontend starts: `npm run dev`
- [ ] Can login: Access http://localhost:5173 and login
- [ ] Can create tasks: Add tasks in the TODO column
- [ ] Can manage tasks: Edit, move, and delete tasks

## Performance Tips

1. **Frontend**: Use `npm run dev` with `--open` flag to auto-open browser
2. **Backend**: Use `--reload` flag for hot-reload during development
3. **Tests**: Run with `--watch` flag for continuous testing
4. **Database**: SQLite is fine for development; use PostgreSQL for production

## Security Notes

⚠️ **Development Only**:
- `SECRET_KEY` should be changed in production
- `FRONTEND_ORIGIN` should match your production domain
- Remove `--reload` flag in production

For production deployment, see your hosting provider's documentation.

## Next Steps

1. ✅ Backend setup complete - 18 tests passing
2. ✅ Frontend setup complete - 46 tests passing
3. 🚀 Run locally and test the application
4. 📦 Deploy to production (Vercel, AWS, etc.)
5. 🔐 Configure environment variables for production
