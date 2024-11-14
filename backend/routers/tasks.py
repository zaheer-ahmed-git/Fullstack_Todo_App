"""Task CRUD endpoints."""

from __future__ import annotations

from datetime import datetime, timezone
from typing import Annotated, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlmodel import Session, select

from backend.database import get_session
from backend.models import (
    Task,
    TaskCreate,
    TaskPriority,
    TaskRead,
    TaskStatus,
    TaskUpdate,
)

router = APIRouter(prefix="/api/tasks", tags=["tasks"])
SessionDep = Annotated[Session, Depends(get_session)]


@router.get("", response_model=list[TaskRead])
def list_tasks(
    session: SessionDep,
    status_filter: Optional[TaskStatus] = Query(default=None, alias="status"),
    priority: Optional[TaskPriority] = None,
    category_id: Optional[int] = None,
    assignee: Optional[str] = None,
    q: Optional[str] = None,
) -> list[Task]:
    statement = select(Task)
    if status_filter is not None:
        statement = statement.where(Task.status == status_filter)
    if priority is not None:
        statement = statement.where(Task.priority == priority)
    if category_id is not None:
        statement = statement.where(Task.category_id == category_id)
    if assignee:
        statement = statement.where(Task.assignee == assignee)
    if q:
        like = f"%{q}%"
        statement = statement.where(
            (Task.title.ilike(like)) | (Task.description.ilike(like))  # type: ignore[arg-type]
        )
    statement = statement.order_by(Task.updated_at.desc())  # type: ignore[attr-defined]
    return list(session.exec(statement).all())


@router.get("/{task_id}", response_model=TaskRead)
def get_task(task_id: int, session: SessionDep) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.post("", response_model=TaskRead, status_code=status.HTTP_201_CREATED)
def create_task(payload: TaskCreate, session: SessionDep) -> Task:
    task = Task.model_validate(payload)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.patch("/{task_id}", response_model=TaskRead)
def update_task(task_id: int, payload: TaskUpdate, session: SessionDep) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    data = payload.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(task, key, value)
    task.updated_at = datetime.now(timezone.utc)

    session.add(task)
    session.commit()
    session.refresh(task)
    return task


@router.delete("/{task_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_task(task_id: int, session: SessionDep) -> None:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    session.delete(task)
    session.commit()
