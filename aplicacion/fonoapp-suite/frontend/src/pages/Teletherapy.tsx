import { useEffect, useRef, useState } from 'react'

export default function Teletherapy(){
  const [room,setRoom] = useState('sala1')
  const localRef = useRef<HTMLVideoElement>(null)
  const remoteRef = useRef<HTMLVideoElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  const pcRef = useRef<RTCPeerConnection | null>(null)

  const start = async () => {
    const pc = new RTCPeerConnection({ iceServers: [{ urls: 'stun:stun.l.google.com:19302' }] })
    pc.onicecandidate = (e)=> e.candidate && wsRef.current?.send(JSON.stringify({ type:'candidate', candidate:e.candidate }))
    pc.ontrack = (e)=> { if(remoteRef.current){ remoteRef.current.srcObject = e.streams[0] } }
    pcRef.current = pc

    const stream = await navigator.mediaDevices.getUserMedia({ video:true, audio:true })
    if(localRef.current){ localRef.current.srcObject = stream }
    stream.getTracks().forEach(t=> pc.addTrack(t, stream))

    const ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/api/realtime/ws/signal/'+room)
    ws.onmessage = async (ev)=>{
      const msg = JSON.parse(ev.data)
      if(msg.type==='offer'){
        await pc.setRemoteDescription(msg)
        const ans = await pc.createAnswer()
        await pc.setLocalDescription(ans)
        ws.send(JSON.stringify(pc.localDescription))
      } else if(msg.type==='answer'){
        await pc.setRemoteDescription(msg)
      } else if(msg.type==='candidate'){
        await pc.addIceCandidate(msg.candidate)
      }
    }
    wsRef.current = ws
  }

  const call = async () => {
    const pc = pcRef.current!
    const offer = await pc.createOffer()
    await pc.setLocalDescription(offer)
    wsRef.current?.send(JSON.stringify(offer))
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Teleterapia (demo P2P)</h2>
        <div className="grid gap-2">
          <input className="input" value={room} onChange={e=>setRoom(e.target.value)} placeholder="sala"/>
          <div className="flex gap-2">
            <button className="btn btn-outline" onClick={start}>Iniciar</button>
            <button className="btn btn-primary" onClick={call}>Llamar</button>
          </div>
          <p className="text-sm text-gray-600">Abre esta página en otro navegador/PC con la misma sala para conectar.</p>
        </div>
      </section>
      <section className="card p-6">
        <div className="grid gap-3">
          <video ref={localRef} muted autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
          <video ref={remoteRef} autoPlay playsInline className="w-full rounded-lg bg-black aspect-video" />
        </div>
      </section>
    </div>
  )
}
