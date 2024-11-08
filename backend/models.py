"""Domain models for tasks, categories, and collaboration."""

from __future__ import annotations

from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlmodel import Field, SQLModel


def utcnow() -> datetime:
    return datetime.now(timezone.utc)


class TaskPriority(str, Enum):
    low = "low"
    medium = "medium"
    high = "high"


class TaskStatus(str, Enum):
    todo = "todo"
    in_progress = "in_progress"
    done = "done"


class CategoryBase(SQLModel):
    name: str = Field(min_length=1, max_length=80, index=True)
    color: str = Field(default="#0d9488", max_length=20)


class Category(CategoryBase, table=True):
    __tablename__ = "categories"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)


class CategoryCreate(CategoryBase):
    pass


class CategoryRead(CategoryBase):
    id: int
    created_at: datetime


class TaskBase(SQLModel):
    title: str = Field(min_length=1, max_length=200)
    description: str = Field(default="", max_length=4000)
    status: TaskStatus = TaskStatus.todo
    priority: TaskPriority = TaskPriority.medium
    category_id: Optional[int] = Field(default=None, foreign_key="categories.id")
    assignee: Optional[str] = Field(default=None, max_length=120)
    due_date: Optional[datetime] = None


class Task(TaskBase, table=True):
    __tablename__ = "tasks"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)
    updated_at: datetime = Field(default_factory=utcnow)


class TaskCreate(TaskBase):
    pass


class TaskUpdate(SQLModel):
    title: Optional[str] = Field(default=None, min_length=1, max_length=200)
    description: Optional[str] = Field(default=None, max_length=4000)
    status: Optional[TaskStatus] = None
    priority: Optional[TaskPriority] = None
    category_id: Optional[int] = None
    assignee: Optional[str] = Field(default=None, max_length=120)
    due_date: Optional[datetime] = None


class TaskRead(TaskBase):
    id: int
    created_at: datetime
    updated_at: datetime


class CommentBase(SQLModel):
    task_id: int = Field(foreign_key="tasks.id", index=True)
    author: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=4000)


class Comment(CommentBase, table=True):
    __tablename__ = "comments"

    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=utcnow)


class CommentCreate(SQLModel):
    author: str = Field(min_length=1, max_length=120)
    body: str = Field(min_length=1, max_length=4000)


class CommentRead(CommentBase):
    id: int
    created_at: datetime
