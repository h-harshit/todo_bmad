# Docker Setup Guide

## Running with Docker Compose

### Quick Start

```bash
# Build and start all services
docker-compose up

# Or in detached mode
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Clean up everything (including volumes)
docker-compose down -v
```

### Services

- **Backend**: http://localhost:8000
- **Frontend**: http://localhost:5173

## Setup

### Prerequisites

- Docker: https://www.docker.com/products/docker-desktop
- Docker Compose: Usually included with Docker Desktop

### Verify Installation

```bash
docker --version
docker-compose --version
```

## Building

### Build All Images

```bash
docker-compose build
```

### Build Specific Service

```bash
# Just backend
docker-compose build backend

# Just frontend
docker-compose build frontend
```

### Rebuild Without Cache

```bash
docker-compose build --no-cache
```

## Running

### Start Services

```bash
# Foreground (see logs)
docker-compose up

# Background
docker-compose up -d
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f backend
docker-compose logs -f frontend

# Last 100 lines
docker-compose logs --tail=100 backend
```

### Stop Services

```bash
# Stop (preserve data)
docker-compose stop

# Stop and remove containers
docker-compose down

# Remove everything including volumes
docker-compose down -v
```

## Troubleshooting

### Backend Issues

**"ImportError: email-validator is not installed"**

This error should be resolved by the updated Dockerfile. If you still see it:

```bash
# Rebuild without cache
docker-compose build --no-cache backend

# Start fresh
docker-compose down -v
docker-compose up
```

**Backend container crashes**

```bash
# Check logs
docker-compose logs backend

# Rebuild and restart
docker-compose build backend
docker-compose up backend
```

**Port 8000 already in use**

```bash
# Option 1: Stop other services
docker-compose down

# Option 2: Use different port in docker-compose.yml
# Change "8000:8000" to "8001:8000"
```

### Frontend Issues

**"Cannot connect to API"**

Ensure backend is running:
```bash
docker-compose logs backend
docker-compose restart backend
```

**Port 5173 already in use**

```bash
# Check what's using the port
lsof -ti:5173 | xargs kill -9

# Or use different port
# Change "5173:5173" to "3000:5173" in docker-compose.yml
```

**Hot reload not working**

This is normal in Docker. Refresh browser manually to see changes.

### Database Issues

**Database not persisting**

SQLite stores data in `app.db` which should persist due to the volume mount. If data is lost:

```bash
# Check volume
docker-compose down -v  # WARNING: Deletes data
docker-compose up
```

**Reset database**

```bash
# Stop containers
docker-compose down

# Remove database file
rm backend/app.db

# Restart
docker-compose up
```

## File Permissions

If you get permission errors on macOS/Linux:

```bash
# Make backend executable
chmod -R 755 backend/

# Make frontend executable  
chmod -R 755 frontend/

# Rebuild and restart
docker-compose build
docker-compose up
```

## Environment Variables

### Set in docker-compose.yml

```yaml
environment:
  DATABASE_URL: sqlite:///app.db
  SECRET_KEY: your-secret-key
  FRONTEND_ORIGIN: http://localhost:5173
  VITE_API_URL: http://localhost:8000
```

### Override at Runtime

```bash
# Set individual variable
docker-compose run -e DATABASE_URL=sqlite:///test.db backend python3 -m pytest tests/

# Set from .env file
docker-compose --env-file .env.production up
```

## Networking

### Access Services

**From host machine**:
- Backend: http://localhost:8000
- Frontend: http://localhost:5173

**Between containers**:
- Backend: http://backend:8000
- Frontend: http://frontend:5173

### Debug Networking

```bash
# Enter container shell
docker-compose exec backend bash
docker-compose exec frontend sh

# Test connection from backend container
docker-compose exec backend ping frontend

# Test connection to backend
docker-compose exec frontend wget http://backend:8000/health
```

## Development vs Production

### Development (Current)

```yaml
# docker-compose.yml
services:
  backend:
    command: uvicorn app.main:app --host 0.0.0.0 --reload
  frontend:
    command: npm run dev -- --host 0.0.0.0
```

### Production

Create `docker-compose.prod.yml`:

```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    environment:
      DATABASE_URL: postgresql://user:pass@db:5432/todo
      SECRET_KEY: ${SECRET_KEY}
      FRONTEND_ORIGIN: https://yourdomain.com
    ports:
      - "8000:8000"
    depends_on:
      - db
  
  db:
    image: postgres:15
    environment:
      POSTGRES_PASSWORD: ${DB_PASSWORD}
      POSTGRES_DB: todo
    volumes:
      - postgres_data:/var/lib/postgresql/data

  frontend:
    build:
      context: ./frontend
      args:
        VITE_API_URL: https://api.yourdomain.com
    ports:
      - "80:5173"

volumes:
  postgres_data:
```

Run with:
```bash
docker-compose -f docker-compose.prod.yml up
```

## Monitoring

### View Container Stats

```bash
# CPU, memory, network usage
docker stats

# Specific container
docker stats todo_bmad-backend
```

### View Container Events

```bash
docker-compose events
```

## Scaling

### Run Multiple Instances

```bash
# Scale backend to 3 instances
docker-compose up --scale backend=3

# But only one frontend
docker-compose up --scale backend=3 frontend
```

Note: Requires load balancer (nginx, HAProxy) for multiple backend instances.

## Cleanup

### Remove Unused Images

```bash
docker image prune
```

### Remove Unused Volumes

```bash
docker volume prune
```

### Full Cleanup

```bash
# Stop and remove everything
docker-compose down -v

# Remove all unused Docker resources
docker system prune -a --volumes
```

## Testing in Docker

### Run Backend Tests

```bash
docker-compose run backend python3 -m pytest tests/ -v
```

### Run Frontend Tests

```bash
docker-compose run frontend npm test
```

### Run All Tests

```bash
docker-compose run backend python3 -m pytest tests/ -v && \
docker-compose run frontend npm test
```

## Performance Tips

1. **Use .dockerignore**: Skip unnecessary files during build
2. **Multi-stage builds**: For optimized production images
3. **Cache layers**: Order Dockerfile commands for better caching
4. **Volume mounts**: For development code changes without rebuilds

## Security

⚠️ **Development Only**:
- Default `SECRET_KEY` should be changed
- Enable only what's needed
- Use strong passwords for databases

**Production**:
- Use strong `SECRET_KEY`
- Configure SSL/TLS
- Use environment files for secrets
- Never commit `.env` files with real secrets
- Use Docker secrets for production

## Useful Commands

```bash
# Build all images
docker-compose build

# Start in background
docker-compose up -d

# View logs
docker-compose logs -f

# Execute command in container
docker-compose exec backend bash

# Run one-off command
docker-compose run backend python3 -m pytest tests/

# Stop all services
docker-compose stop

# Stop and remove
docker-compose down

# Remove everything
docker-compose down -v

# Check service status
docker-compose ps

# Validate compose file
docker-compose config

# Pull latest images
docker-compose pull
```

## Next Steps

1. ✅ Docker setup complete
2. Run `docker-compose up` to start services
3. Access frontend at http://localhost:5173
4. Login and test the application
5. View logs with `docker-compose logs -f`
6. Stop with `Ctrl+C` or `docker-compose down`

## Support

For Docker issues:
- Check logs: `docker-compose logs`
- Rebuild: `docker-compose build --no-cache`
- Clean start: `docker-compose down -v && docker-compose up`
- Docker docs: https://docs.docker.com/
