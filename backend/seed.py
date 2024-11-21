"""Optional seed script for demo categories and sample tasks."""

from __future__ import annotations

from sqlmodel import Session, select

from backend.database import engine, init_db
from backend.models import Category, Task, TaskPriority, TaskStatus
from backend.routers.categories import ensure_default_categories


def seed() -> None:
    init_db()
    with Session(engine) as session:
        ensure_default_categories(session)
        if session.exec(select(Task)).first():
            print("Tasks already present; skipping task seed.")
            return

        work = session.exec(select(Category).where(Category.name == "Work")).first()
        learning = session.exec(
            select(Category).where(Category.name == "Learning")
        ).first()

        samples = [
            Task(
                title="Draft sprint board",
                description="Set up columns for backlog, doing, and done.",
                status=TaskStatus.in_progress,
                priority=TaskPriority.high,
                category_id=work.id if work else None,
                assignee="zaheer",
            ),
            Task(
                title="Read FastAPI websockets docs",
                description="Prepare notes for live task updates.",
                status=TaskStatus.todo,
                priority=TaskPriority.medium,
                category_id=learning.id if learning else None,
                assignee="zaheer",
            ),
        ]
        for task in samples:
            session.add(task)
        session.commit()
        print(f"Seeded {len(samples)} sample tasks.")


if __name__ == "__main__":
    seed()
