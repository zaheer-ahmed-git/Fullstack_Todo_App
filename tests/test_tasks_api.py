"""Task and category API smoke tests."""

from __future__ import annotations

from fastapi.testclient import TestClient


def test_health(client: TestClient) -> None:
    response = client.get("/api/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert "Task Manager" in body["app"]


def test_task_crud_and_category_filter(client: TestClient) -> None:
    category = client.post(
        "/api/categories",
        json={"name": "Ops", "color": "#2563eb"},
    )
    assert category.status_code == 201
    category_id = category.json()["id"]

    created = client.post(
        "/api/tasks",
        json={
            "title": "Rotate secrets",
            "description": "Quarterly credential rotation",
            "status": "todo",
            "priority": "high",
            "category_id": category_id,
            "assignee": "zaheer",
        },
    )
    assert created.status_code == 201
    task_id = created.json()["id"]

    listed = client.get("/api/tasks", params={"category_id": category_id})
    assert listed.status_code == 200
    assert len(listed.json()) == 1

    updated = client.patch(
        f"/api/tasks/{task_id}",
        json={"status": "done"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "done"

    deleted = client.delete(f"/api/tasks/{task_id}")
    assert deleted.status_code == 204


def test_comments_collaboration(client: TestClient) -> None:
    task = client.post(
        "/api/tasks",
        json={
            "title": "Pair on board UI",
            "description": "",
            "status": "in_progress",
            "priority": "medium",
            "category_id": None,
            "assignee": "alex",
        },
    )
    task_id = task.json()["id"]

    comment = client.post(
        f"/api/tasks/{task_id}/comments",
        json={"author": "sam", "body": "Looks good — ship it."},
    )
    assert comment.status_code == 201

    thread = client.get(f"/api/tasks/{task_id}/comments")
    assert thread.status_code == 200
    assert len(thread.json()) == 1
    assert thread.json()[0]["author"] == "sam"
