import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

export default function Dashboard(){
  const [stats, setStats] = useState<any>({ patients:0, appointments:0, recent:[] })
  useEffect(()=>{ (async()=>{
    const ps = await api.get('/patients/'); const ap = await api.get('/appointments/')
    setStats({ patients: ps.data.length, appointments: ap.data.length, recent: ap.data.slice(0,10).map((a:any)=>({ x:a.starts_at, y:1 })) })
  })() },[])
  return (
    <div className="grid md:grid-cols-3 gap-6">
      <div className="card p-6"><div className="text-sm text-gray-500">Pacientes</div><div className="text-3xl font-semibold">{stats.patients}</div></div>
      <div className="card p-6"><div className="text-sm text-gray-500">Citas programadas</div><div className="text-3xl font-semibold">{stats.appointments}</div></div>
      <div className="card p-6 md:col-span-3">
        <div className="text-sm text-gray-500 mb-2">Citas recientes</div>
        <div style={{width:'100%', height:240}}>
          <ResponsiveContainer><LineChart data={stats.recent}><XAxis dataKey="x"/><YAxis/><Tooltip/><Line type="monotone" dataKey="y" dot={false} /></LineChart></ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}
