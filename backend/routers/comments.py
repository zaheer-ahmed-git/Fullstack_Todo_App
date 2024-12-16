"""Task comment endpoints for lightweight collaboration."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from backend.database import get_session
from backend.models import Comment, CommentCreate, CommentRead, Task
from backend.realtime import manager

router = APIRouter(prefix="/api/tasks/{task_id}/comments", tags=["comments"])
SessionDep = Annotated[Session, Depends(get_session)]


def _require_task(session: Session, task_id: int) -> Task:
    task = session.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Task not found")
    return task


@router.get("", response_model=list[CommentRead])
def list_comments(task_id: int, session: SessionDep) -> list[Comment]:
    _require_task(session, task_id)
    statement = (
        select(Comment)
        .where(Comment.task_id == task_id)
        .order_by(Comment.created_at.asc())  # type: ignore[attr-defined]
    )
    return list(session.exec(statement).all())


@router.post("", response_model=CommentRead, status_code=status.HTTP_201_CREATED)
async def create_comment(
    task_id: int, payload: CommentCreate, session: SessionDep
) -> Comment:
    _require_task(session, task_id)
    comment = Comment(task_id=task_id, author=payload.author, body=payload.body)
    session.add(comment)
    session.commit()
    session.refresh(comment)
    await manager.broadcast(
        "comment.created",
        CommentRead.model_validate(comment).model_dump(mode="json"),
    )
    return comment
