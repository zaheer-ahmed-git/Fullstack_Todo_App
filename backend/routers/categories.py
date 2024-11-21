"""Category management and lookup endpoints."""

from __future__ import annotations

from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select

from backend.database import get_session
from backend.models import Category, CategoryCreate, CategoryRead, Task

router = APIRouter(prefix="/api/categories", tags=["categories"])
SessionDep = Annotated[Session, Depends(get_session)]

DEFAULT_CATEGORIES = [
    {"name": "Work", "color": "#2563eb"},
    {"name": "Personal", "color": "#059669"},
    {"name": "Learning", "color": "#d97706"},
    {"name": "Urgent", "color": "#dc2626"},
]


def ensure_default_categories(session: Session) -> None:
    existing = session.exec(select(Category)).first()
    if existing:
        return
    for item in DEFAULT_CATEGORIES:
        session.add(Category(**item))
    session.commit()


@router.get("", response_model=list[CategoryRead])
def list_categories(session: SessionDep) -> list[Category]:
    ensure_default_categories(session)
    return list(session.exec(select(Category).order_by(Category.name)).all())


@router.post("", response_model=CategoryRead, status_code=status.HTTP_201_CREATED)
def create_category(payload: CategoryCreate, session: SessionDep) -> Category:
    duplicate = session.exec(
        select(Category).where(Category.name == payload.name)
    ).first()
    if duplicate:
        raise HTTPException(status_code=409, detail="Category already exists")
    category = Category.model_validate(payload)
    session.add(category)
    session.commit()
    session.refresh(category)
    return category


@router.get("/{category_id}", response_model=CategoryRead)
def get_category(category_id: int, session: SessionDep) -> Category:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")
    return category


@router.delete("/{category_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_category(category_id: int, session: SessionDep) -> None:
    category = session.get(Category, category_id)
    if not category:
        raise HTTPException(status_code=404, detail="Category not found")

    linked = session.exec(select(Task).where(Task.category_id == category_id)).first()
    if linked:
        raise HTTPException(
            status_code=400,
            detail="Cannot delete a category that still has tasks",
        )

    session.delete(category)
    session.commit()
