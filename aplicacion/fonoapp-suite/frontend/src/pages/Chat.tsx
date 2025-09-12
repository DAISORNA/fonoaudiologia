import { useEffect, useRef, useState } from 'react'

export default function Chat(){
  const [room,setRoom] = useState('lobby')
  const [list,setList] = useState<string[]>([])
  const inputRef = useRef<HTMLInputElement>(null)
  const wsRef = useRef<WebSocket | null>(null)
  useEffect(()=>{
    const ws = new WebSocket((location.protocol==='https:'?'wss':'ws')+'://'+location.host+'/api/realtime/ws/chat/'+room)
    ws.onmessage = (e)=> setList(prev=>[...prev, e.data])
    wsRef.current = ws
    return ()=> ws.close()
  },[room])
  const send = ()=>{
    const v = inputRef.current!.value
    if(!v || !wsRef.current) return
    wsRef.current.send(v); inputRef.current!.value=''
  }
  return (
    <div className="card p-6">
      <h2 className="text-lg font-semibold mb-4">Chat (sala: {room})</h2>
      <div className="flex gap-2 mb-4">
        <input className="input" placeholder="sala" value={room} onChange={e=>setRoom(e.target.value)} />
      </div>
      <div className="h-64 overflow-auto border rounded-lg p-3 bg-white mb-3">
        {list.map((m,i)=>(<div key={i} className="text-sm py-0.5">• {m}</div>))}
      </div>
      <div className="flex gap-2">
        <input ref={inputRef} className="input" placeholder="Escribe un mensaje"/>
        <button className="btn btn-primary" onClick={send}>Enviar</button>
      </div>
    </div>
  )
}
