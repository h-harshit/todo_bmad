from fastapi.testclient import TestClient
from sqlmodel import Session
from app.models.task import Task

def test_list_tasks_empty(client: TestClient, test_user_token: str):
    client.cookies.set("access_token", test_user_token)
    response = client.get("/tasks")

    assert response.status_code == 200
    assert response.json() == []

def test_create_task(client: TestClient, test_user_token: str, test_user):
    client.cookies.set("access_token", test_user_token)
    response = client.post(
        "/tasks",
        json={"title": "Buy milk"},
    )

    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Buy milk"
    assert data["status"] == "todo"
    assert data["user_id"] == test_user.id

def test_list_tasks(client: TestClient, test_user_token: str, test_user: Session):
    client.cookies.set("access_token", test_user_token)

    client.post("/tasks", json={"title": "Task 1"})
    client.post("/tasks", json={"title": "Task 2"})

    response = client.get("/tasks")

    assert response.status_code == 200
    tasks = response.json()
    assert len(tasks) == 2
    assert tasks[0]["title"] == "Task 1"
    assert tasks[1]["title"] == "Task 2"

def test_update_task(client: TestClient, test_user_token: str, test_user, session: Session):
    client.cookies.set("access_token", test_user_token)

    create_response = client.post("/tasks", json={"title": "Old title"})
    task_id = create_response.json()["id"]

    response = client.put(
        f"/tasks/{task_id}",
        json={"title": "New title"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["title"] == "New title"
    assert data["id"] == task_id

def test_update_task_not_found(client: TestClient, test_user_token: str):
    client.cookies.set("access_token", test_user_token)
    response = client.put(
        "/tasks/nonexistent",
        json={"title": "New title"},
    )

    assert response.status_code == 404

def test_update_task_status(client: TestClient, test_user_token: str, test_user):
    client.cookies.set("access_token", test_user_token)

    create_response = client.post("/tasks", json={"title": "Test task"})
    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}/status",
        json={"status": "in_progress"},
    )

    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "in_progress"

def test_update_task_status_invalid(client: TestClient, test_user_token: str):
    client.cookies.set("access_token", test_user_token)

    create_response = client.post("/tasks", json={"title": "Test task"})
    task_id = create_response.json()["id"]

    response = client.patch(
        f"/tasks/{task_id}/status",
        json={"status": "invalid_status"},
    )

    assert response.status_code == 404

def test_delete_task(client: TestClient, test_user_token: str, test_user):
    client.cookies.set("access_token", test_user_token)

    create_response = client.post("/tasks", json={"title": "Task to delete"})
    task_id = create_response.json()["id"]

    response = client.delete(f"/tasks/{task_id}")

    assert response.status_code == 204

    get_response = client.get("/tasks")
    assert len(get_response.json()) == 0

def test_delete_task_not_found(client: TestClient, test_user_token: str):
    client.cookies.set("access_token", test_user_token)
    response = client.delete("/tasks/nonexistent")

    assert response.status_code == 404

def test_tasks_user_scoped(client: TestClient, test_user_token: str, session: Session):
    client.cookies.set("access_token", test_user_token)

    client.post("/tasks", json={"title": "User 1 Task"})

    response = client.get("/tasks")
    assert len(response.json()) == 1
    assert response.json()[0]["title"] == "User 1 Task"

def test_list_tasks_unauthorized(client: TestClient):
    response = client.get("/tasks")

    assert response.status_code == 401
