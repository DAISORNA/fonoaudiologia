from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from typing import Dict, List

router = APIRouter()

# In-memory rooms for demo; for production use Redis/pubsub
class ConnectionManager:
    def __init__(self):
        self.rooms: Dict[str, List[WebSocket]] = {}

    async def connect(self, room: str, ws: WebSocket):
        await ws.accept()
        self.rooms.setdefault(room, []).append(ws)

    def disconnect(self, room: str, ws: WebSocket):
        if room in self.rooms and ws in self.rooms[room]:
            self.rooms[room].remove(ws)
            if not self.rooms[room]:
                self.rooms.pop(room, None)

    async def broadcast(self, room: str, message: str, sender: WebSocket | None = None):
        for conn in list(self.rooms.get(room, [])):
            if conn is not sender:
                await conn.send_text(message)

manager = ConnectionManager()

@router.websocket("/ws/chat/{room}")
async def ws_chat(ws: WebSocket, room: str):
    await manager.connect(room, ws)
    try:
        while True:
            data = await ws.receive_text()
            await manager.broadcast(room, data, sender=ws)
    except WebSocketDisconnect:
        manager.disconnect(room, ws)

@router.websocket("/ws/signal/{room}")
async def ws_signal(ws: WebSocket, room: str):
    # Simple signaling for WebRTC (offer/answer/candidates as text JSON)
    await manager.connect(room, ws)
    try:
        while True:
            msg = await ws.receive_text()
            await manager.broadcast(room, msg, sender=ws)
    except WebSocketDisconnect:
        manager.disconnect(room, ws)
