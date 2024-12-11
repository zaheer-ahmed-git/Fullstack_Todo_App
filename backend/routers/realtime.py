"""WebSocket endpoint for real-time task events."""

from __future__ import annotations

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

from backend.realtime import manager

router = APIRouter(tags=["realtime"])


@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket) -> None:
    await manager.connect(websocket)
    try:
        while True:
            # Keep the socket alive; clients may send pings or ignore.
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
