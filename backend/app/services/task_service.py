from sqlmodel import Session, select
from app.models.task import Task
from datetime import datetime
from typing import List, Optional

def get_tasks(session: Session, user_id: str) -> List[Task]:
    statement = select(Task).where(Task.user_id == user_id)
    return session.exec(statement).all()

def get_task(session: Session, task_id: str, user_id: str) -> Optional[Task]:
    statement = select(Task).where(Task.id == task_id, Task.user_id == user_id)
    return session.exec(statement).first()

def create_task(session: Session, title: str, user_id: str) -> Task:
    task = Task(title=title, user_id=user_id, status="todo")
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def update_task(session: Session, task_id: str, user_id: str, title: str) -> Optional[Task]:
    task = get_task(session, task_id, user_id)
    if not task:
        return None
    task.title = title
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def update_task_status(session: Session, task_id: str, user_id: str, status: str) -> Optional[Task]:
    if status not in ["todo", "in_progress", "done"]:
        return None
    task = get_task(session, task_id, user_id)
    if not task:
        return None
    task.status = status
    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def delete_task(session: Session, task_id: str, user_id: str) -> bool:
    task = get_task(session, task_id, user_id)
    if not task:
        return False
    session.delete(task)
    session.commit()
    return True
