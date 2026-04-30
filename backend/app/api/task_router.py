from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session
from typing import List
from app.models.user import User
from app.schemas.task import TaskCreate, TaskUpdate, TaskStatusUpdate, TaskResponse
from app.services import task_service
from app.dependencies import get_session, get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])

@router.get("")
async def list_tasks(
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> List[TaskResponse]:
    tasks = task_service.get_tasks(session, user.id)
    return [TaskResponse.model_validate(task) for task in tasks]

@router.post("", status_code=201)
async def create_task(
    task_data: TaskCreate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    task = task_service.create_task(session, task_data.title, user.id)
    return TaskResponse.model_validate(task)

@router.put("/{task_id}")
async def update_task(
    task_id: str,
    task_data: TaskUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    task = task_service.update_task(session, task_id, user.id, task_data.title)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return TaskResponse.model_validate(task)

@router.patch("/{task_id}/status")
async def update_task_status(
    task_id: str,
    status_data: TaskStatusUpdate,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
) -> TaskResponse:
    task = task_service.update_task_status(session, task_id, user.id, status_data.status)
    if not task:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found or invalid status")
    return TaskResponse.model_validate(task)

@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: str,
    user: User = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    success = task_service.delete_task(session, task_id, user.id)
    if not success:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Task not found")
    return None
