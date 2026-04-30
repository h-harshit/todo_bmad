#!/bin/bash

# Todo App Setup Verification Script
# This script verifies that all dependencies are installed and configured correctly

set -e

echo "=================================="
echo "Todo App Setup Verification"
echo "=================================="
echo ""

# Color codes
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check marks
CHECK="✅"
FAIL="❌"
WARN="⚠️"

# Counters
PASS=0
FAIL_COUNT=0

check_command() {
    if command -v $1 &> /dev/null; then
        VERSION=$($1 --version 2>/dev/null || $1 -v 2>/dev/null | head -1)
        echo -e "${GREEN}${CHECK}${NC} $1: $VERSION"
        ((PASS++))
        return 0
    else
        echo -e "${RED}${FAIL}${NC} $1: NOT FOUND"
        ((FAIL_COUNT++))
        return 1
    fi
}

check_file() {
    if [ -f "$1" ]; then
        echo -e "${GREEN}${CHECK}${NC} $1"
        ((PASS++))
        return 0
    else
        echo -e "${RED}${FAIL}${NC} $1: MISSING"
        ((FAIL_COUNT++))
        return 1
    fi
}

check_python_package() {
    if python3 -c "import $1" 2>/dev/null; then
        VERSION=$(python3 -c "import $1; print(getattr($1, '__version__', 'installed'))" 2>/dev/null)
        echo -e "${GREEN}${CHECK}${NC} Python: $1 ($VERSION)"
        ((PASS++))
        return 0
    else
        echo -e "${RED}${FAIL}${NC} Python: $1 NOT FOUND"
        ((FAIL_COUNT++))
        return 1
    fi
}

# ==================== System ====================
echo ""
echo "System Requirements:"
check_command "python3"
check_command "node"
check_command "npm"
check_command "docker"
check_command "docker-compose"

# ==================== Files ====================
echo ""
echo "Project Files:"
check_file "backend/requirements.txt"
check_file "backend/Dockerfile"
check_file "backend/app/main.py"
check_file "backend/app/config.py"
check_file "backend/.env"
check_file "frontend/package.json"
check_file "frontend/Dockerfile"
check_file "frontend/.env"
check_file "docker-compose.yml"

# ==================== Backend ====================
echo ""
echo "Backend Dependencies:"
check_python_package "fastapi"
check_python_package "sqlmodel"
check_python_package "pydantic"
check_python_package "email_validator"
check_python_package "pytest"
check_python_package "httpx"

# ==================== Frontend ====================
echo ""
echo "Frontend Dependencies:"
cd frontend 2>/dev/null || { echo -e "${YELLOW}${WARN}${NC} Frontend directory not found"; ((FAIL_COUNT++)); }
if [ -d "frontend" ]; then
    if [ -d "node_modules" ]; then
        echo -e "${GREEN}${CHECK}${NC} npm: dependencies installed"
        ((PASS++))
    else
        echo -e "${RED}${FAIL}${NC} npm: dependencies NOT installed"
        ((FAIL_COUNT++))
    fi
    cd ..
fi

# ==================== Functionality ====================
echo ""
echo "Functionality Tests:"

# Test backend imports
if python3 -c "from app.main import app; print('Backend imports successfully')" 2>/dev/null >/dev/null; then
    echo -e "${GREEN}${CHECK}${NC} Backend: Imports successfully"
    ((PASS++))
else
    echo -e "${RED}${FAIL}${NC} Backend: Import error"
    ((FAIL_COUNT++))
fi

# Test backend pytest
cd backend 2>/dev/null && {
    if python3 -m pytest --co -q tests/ 2>/dev/null | grep -q "test_"; then
        echo -e "${GREEN}${CHECK}${NC} Backend: Tests discoverable"
        ((PASS++))
    else
        echo -e "${RED}${FAIL}${NC} Backend: Tests not found"
        ((FAIL_COUNT++))
    fi
    cd ..
}

# Test frontend vitest
cd frontend 2>/dev/null && {
    if npm test -- --listTests 2>/dev/null | grep -q "\.test\."; then
        echo -e "${GREEN}${CHECK}${NC} Frontend: Tests discoverable"
        ((PASS++))
    else
        echo -e "${RED}${FAIL}${NC} Frontend: Tests not found"
        ((FAIL_COUNT++))
    fi
    cd ..
}

# ==================== Configuration ====================
echo ""
echo "Configuration Files:"
check_file ".env.example"
check_file "SETUP.md"
check_file "QUICKSTART.md"
check_file "DOCKER_GUIDE.md"

# ==================== Summary ====================
echo ""
echo "=================================="
echo "Verification Summary"
echo "=================================="
echo -e "${GREEN}Passed:${NC} $PASS"
echo -e "${RED}Failed:${NC} $FAIL_COUNT"
echo ""

if [ $FAIL_COUNT -eq 0 ]; then
    echo -e "${GREEN}✅ All checks passed!${NC}"
    echo ""
    echo "Next steps:"
    echo "1. Backend:  cd backend && python3 -m uvicorn app.main:app --reload"
    echo "2. Frontend: cd frontend && npm run dev"
    echo "3. Or use Docker: docker-compose up"
    echo ""
    echo "Then open: http://localhost:5173"
    exit 0
else
    echo -e "${RED}❌ Some checks failed${NC}"
    echo ""
    echo "Failed items:"
    echo "- Install missing dependencies: pip3 install -r backend/requirements.txt"
    echo "- Install frontend: cd frontend && npm install"
    echo "- Or use Docker: docker-compose build && docker-compose up"
    echo ""
    exit 1
fi
