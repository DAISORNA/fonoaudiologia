// frontend/src/pages/Chat.tsx
import { useCallback, useEffect, useRef, useState } from "react";

type ConnState = "idle" | "connecting" | "open" | "closed";

const WS_BASE = (import.meta.env.VITE_WS_BASE ?? "").trim() || "/api";

export default function Chat() {
  const [room, setRoom] = useState("lobby");
  const [list, setList] = useState<string[]>([]);
  const [state, setState] = useState<ConnState>("idle");
  const inputRef = useRef<HTMLInputElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const retryRef = useRef(0);
  const closedByUsRef = useRef(false);

  // arma la URL del WS según si WS_BASE es relativo (/api) o absoluto (ws://host:port)
  const url =
    WS_BASE.startsWith("ws")
      ? `${WS_BASE}/ws/chat/${encodeURIComponent(room)}`
      : `${location.protocol === "https:" ? "wss" : "ws"}://${location.host}${
          WS_BASE
        }/ws/chat/${encodeURIComponent(room)}`;

  // helper para no anidar callback dentro del handler
  const appendMessage = useCallback((msg: string) => {
    setList(prev => [...prev, msg]);
  }, []);

  // connect fuera de useEffect ↓
  const connect = useCallback(() => {
    setState("connecting");
    const ws = new WebSocket(url);
    wsRef.current = ws;

    ws.onopen = () => {
      retryRef.current = 0;
      setState("open");
    };

    ws.onmessage = (e) => {
      appendMessage(e.data);
    };

    ws.onclose = () => {
      setState("closed");
      if (!closedByUsRef.current) {
        const wait = Math.min(5000, 500 * (retryRef.current + 1)); // backoff simple (máx ~5s)
        retryRef.current++;
        setTimeout(connect, wait);
      }
    };

    ws.onerror = () => {
      // onclose maneja la reconexión
    };
  }, [url, appendMessage]);

  useEffect(() => {
    closedByUsRef.current = false;
    connect();

    return () => {
      closedByUsRef.current = true;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = () => {
    const v = inputRef.current?.value?.trim();
    if (!v || !wsRef.current || state !== "open") return;
    wsRef.current.send(v);
    if (inputRef.current) inputRef.current.value = "";
  };

  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">
        Chat (sala: {room}) <span className="text-xs text-gray-500">· {state}</span>
      </h2>
      <div className="flex gap-2 mb-4">
        <input
          className="input"
          placeholder="sala"
          value={room}
          onChange={(e) => setRoom(e.target.value)}
          disabled={state === "connecting"} // evitar cambiar sala justo mientras abre
        />
      </div>
      <div className="h-64 overflow-auto border rounded-lg p-3 bg-white mb-3">
        {list.map((m, i) => (
          <div key={i} className="text-sm py-0.5">• {m}</div>
        ))}
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} className="input" placeholder="Escribe un mensaje" disabled={state !== "open"} />
        <button className="btn btn-primary" onClick={send} disabled={state !== "open"}>
          Enviar
        </button>
      </div>
    </div>
  );
}
