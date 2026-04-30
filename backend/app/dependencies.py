from fastapi import Depends, HTTPException, status, Request
from sqlmodel import Session, create_engine, SQLModel, select
from sqlalchemy.pool import StaticPool
from typing import Generator
import os
from app.config import settings
from app.models.user import User
from app.services.auth_service import decode_token

_engine = None

def get_engine():
    global _engine
    if _engine is None:
        _engine = create_engine(
            settings.DATABASE_URL,
            echo=False,
            connect_args={"check_same_thread": False} if "sqlite" in settings.DATABASE_URL else {},
            poolclass=StaticPool if "sqlite" in settings.DATABASE_URL else None,
        )
    return _engine

def create_db_and_tables():
    engine = get_engine()
    SQLModel.metadata.create_all(engine)

def get_session() -> Generator[Session, None, None]:
    engine = get_engine()
    with Session(engine) as session:
        yield session

async def get_current_user(request: Request, session: Session = Depends(get_session)) -> User:
    token = request.cookies.get("access_token")
    if not token:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    payload = decode_token(token)
    if not payload:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    email = payload.get("sub")
    if not email:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

    statement = select(User).where(User.email == email)
    user = session.exec(statement).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return user
