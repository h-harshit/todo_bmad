from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.user import User
from app.services.auth_service import hash_password

def test_login_success(client: TestClient, session: Session):
    user = User(email="test@example.com", hashed_password=hash_password("password123"))
    session.add(user)
    session.commit()

    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "password123"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == "test@example.com"
    assert data["id"] == user.id
    assert "access_token" in response.cookies

def test_login_invalid_password(client: TestClient, session: Session):
    user = User(email="test@example.com", hashed_password=hash_password("password123"))
    session.add(user)
    session.commit()

    response = client.post(
        "/auth/login",
        json={"email": "test@example.com", "password": "wrongpassword"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_login_user_not_found(client: TestClient):
    response = client.post(
        "/auth/login",
        json={"email": "nonexistent@example.com", "password": "password123"},
    )

    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid credentials"

def test_logout(client: TestClient, test_user_token: str):
    client.cookies.set("access_token", test_user_token)
    response = client.post("/auth/logout")

    assert response.status_code == 200
    assert "access_token" not in response.cookies or response.cookies["access_token"] == ""

def test_get_me_success(client: TestClient, test_user: User, test_user_token: str):
    client.cookies.set("access_token", test_user_token)
    response = client.get("/auth/me")

    assert response.status_code == 200
    data = response.json()
    assert data["email"] == test_user.email
    assert data["id"] == test_user.id

def test_get_me_unauthorized(client: TestClient):
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert "Not authenticated" in response.json()["detail"]

def test_get_me_invalid_token(client: TestClient):
    client.cookies.set("access_token", "invalid_token")
    response = client.get("/auth/me")

    assert response.status_code == 401
    assert "Invalid token" in response.json()["detail"]
