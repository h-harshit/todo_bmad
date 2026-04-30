from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.dependencies import create_db_and_tables
from app.api import auth_router, task_router

app = FastAPI(title="todo_bmad API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[settings.FRONTEND_ORIGIN],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Create database tables on startup (lazy initialization)
@app.on_event("startup")
async def startup_event():
    create_db_and_tables()

# Include routers
app.include_router(auth_router.router)
app.include_router(task_router.router)

@app.get("/")
async def root():
    return {"message": "todo_bmad API"}

@app.get("/health")
async def health():
    return {"status": "ok"}
