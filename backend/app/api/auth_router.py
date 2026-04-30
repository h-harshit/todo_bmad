from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import JSONResponse
from sqlmodel import Session, select
from app.models.user import User
from app.schemas.auth import LoginRequest, UserResponse
from app.services.auth_service import verify_password, hash_password, create_access_token
from app.dependencies import get_session, get_current_user

router = APIRouter(prefix="/auth", tags=["auth"])


def _set_auth_cookie(response: JSONResponse, email: str) -> JSONResponse:
    access_token = create_access_token(data={"sub": email})
    response.set_cookie(
        "access_token",
        access_token,
        httponly=True,
        secure=False,
        samesite="lax",
        max_age=1800,
    )
    return response


@router.post("/signup", status_code=201)
async def signup(request: LoginRequest, session: Session = Depends(get_session)):
    existing = session.exec(select(User).where(User.email == request.email)).first()
    if existing:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already registered")

    user = User(email=request.email, hashed_password=hash_password(request.password))
    session.add(user)
    session.commit()
    session.refresh(user)

    response = JSONResponse(status_code=201, content={"id": user.id, "email": user.email})
    return _set_auth_cookie(response, user.email)


@router.post("/login")
async def login(request: LoginRequest, session: Session = Depends(get_session)):
    statement = select(User).where(User.email == request.email)
    user = session.exec(statement).first()

    if not user or not verify_password(request.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    response = JSONResponse(
        status_code=200,
        content={"id": user.id, "email": user.email},
    )
    return _set_auth_cookie(response, user.email)

@router.post("/logout")
async def logout():
    response = JSONResponse(status_code=200, content={"status": "ok"})
    response.delete_cookie("access_token", httponly=True, secure=False, samesite="lax")
    return response

@router.get("/me")
async def get_me(user: User = Depends(get_current_user)) -> UserResponse:
    return UserResponse(id=user.id, email=user.email)
