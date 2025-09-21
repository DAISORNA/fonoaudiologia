// frontend/src/pages/Teletherapy.tsx
import { useEffect, useRef, useState } from "react";

type WSState = "idle" | "starting" | "ready" | "calling" | "in-call";

export default function Teletherapy() {
  const [room, setRoom] = useState("sala1");
  const [state, setState] = useState<WSState>("idle");
  const localRef = useRef<HTMLVideoElement>(null);
  const remoteRef = useRef<HTMLVideoElement>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  const wsURL =
    (location.protocol === "https:" ? "wss" : "ws") +
    "://" +
    location.host +
    "/api/ws/signal/" +
    encodeURIComponent(room);

  function waitForOpen(ws: WebSocket) {
    if (ws.readyState === WebSocket.OPEN) return Promise.resolve();
    return new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("WS timeout")), 10000);
      ws.addEventListener("open", () => {
        clearTimeout(timer);
        resolve();
      });
      ws.addEventListener("error", () => {
        clearTimeout(timer);
        reject(new Error("WS error"));
      });
    });
  }

  async function start() {
    if (state !== "idle" && state !== "ready") return;
    setState("starting");

    // 1) Medios locales
    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    localStreamRef.current = stream;
    if (localRef.current) localRef.current.srcObject = stream;

    // 2) RTCPeerConnection
    const pc = new RTCPeerConnection({
      iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
    });
    pc.onicecandidate = (e) => {
      if (e.candidate && wsRef.current?.readyState === WebSocket.OPEN) {
        wsRef.current.send(
          JSON.stringify({
            type: "candidate",
            candidate: {
              candidate: e.candidate.candidate,
              sdpMid: e.candidate.sdpMid,
              sdpMLineIndex: e.candidate.sdpMLineIndex,
            },
          })
        );
      }
    };
    pc.ontrack = (e) => {
      if (remoteRef.current) remoteRef.current.srcObject = e.streams[0];
    };
    stream.getTracks().forEach((t) => pc.addTrack(t, stream));
    pcRef.current = pc;

    // 3) WebSocket señalización
    const ws = new WebSocket(wsURL);
    ws.onclose = () => console.log("[WS] cerrado");
    ws.onerror = (e) => console.warn("[WS] error", e);
    ws.onmessage = async (ev) => {
      try {
        const msg = JSON.parse(ev.data);
        if (!pcRef.current) return;

        if (msg.type === "offer") {
          await pcRef.current.setRemoteDescription({ type: "offer", sdp: msg.sdp });
          const answer = await pcRef.current.createAnswer();
          await pcRef.current.setLocalDescription(answer);
          ws.send(JSON.stringify({ type: "answer", sdp: answer.sdp }));
          setState("in-call");
        } else if (msg.type === "answer") {
          await pcRef.current.setRemoteDescription({ type: "answer", sdp: msg.sdp });
          setState("in-call");
        } else if (msg.type === "candidate" && msg.candidate) {
          try {
            await pcRef.current.addIceCandidate(new RTCIceCandidate(msg.candidate));
          } catch (err) {
            console.warn("Error addIceCandidate", err);
          }
        }
      } catch (err) {
        console.warn("Mensaje WS inválido", err);
      }
    };
    wsRef.current = ws;

    await waitForOpen(ws);
    setState("ready");
  }

  async function call() {
    if (state !== "ready" || !pcRef.current || !wsRef.current) return;
    setState("calling");
    const offer = await pcRef.current.createOffer();
    await pcRef.current.setLocalDescription(offer);
    wsRef.current.send(JSON.stringify({ type: "offer", sdp: offer.sdp }));
  }

  function hangup() {
    // Cierra WS
    try {
      if (wsRef.current && wsRef.current.readyState === WebSocket.OPEN) wsRef.current.close();
    } catch {}
    wsRef.current = null;

    // Cierra PC
    try {
      pcRef.current?.getSenders().forEach((s) => s.track && s.track.stop());
      pcRef.current?.close();
    } catch {}
    pcRef.current = null;

    // Detén medios locales
    try {
      localStreamRef.current?.getTracks().forEach((t) => t.stop());
    } catch {}
    localStreamRef.current = null;

    // Limpia videos
    if (localRef.current) localRef.current.srcObject = null;
    if (remoteRef.current) remoteRef.current.srcObject = null;

    setState("idle");
  }

  useEffect(() => {
    // Limpieza al desmontar
    return () => hangup();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canStart = state === "idle" || state === "ready";
  const canCall = state === "ready";
  const canHangup = state === "calling" || state === "in-call";

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Teleterapia (demo P2P)</h2>
        <div className="grid gap-2">
          <input
            className="input"
            value={room}
            onChange={(e) => setRoom(e.target.value)}
            placeholder="sala"
            disabled={state !== "idle"}
          />
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={start} disabled={!canStart}>
              {state === "starting" ? "Iniciando..." : "Iniciar"}
            </button>
            <button className="btn btn-primary" onClick={call} disabled={!canCall}>
              Llamar
            </button>
            <button className="btn" onClick={hangup} disabled={!canHangup}>
              Colgar
            </button>
          </div>
          <p className="text-sm text-gray-600">
            Abre esta página en otro navegador/PC con la misma sala para conectar.
          </p>
          <p className="text-xs text-gray-500">Estado: {state}</p>
        </div>
      </section>
      <section className="card p-6">
        <div className="grid gap-3">
          <video ref={localRef} muted autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
          <video ref={remoteRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
        </div>
      </section>
    </div>
  );
}
