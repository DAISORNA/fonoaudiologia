import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Calendar(){
  const [items,setItems] = useState<any[]>([])
  const [form,setForm] = useState<any>({ patient_id:'', starts_at:'', ends_at:'', notes:'' })
  async function load(){ const r = await api.get('/appointments/'); setItems(r.data) }
  useEffect(()=>{ load() },[])
  async function create(){
    await api.post('/appointments/', { ...form, patient_id: Number(form.patient_id) })
    setForm({ patient_id:'', starts_at:'', ends_at:'', notes:'' }); load()
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nueva cita</h2>
        <div className="grid gap-3">
          <input className="input" placeholder="ID Paciente" value={form.patient_id} onChange={e=>setForm({...form,patient_id:e.target.value})}/>
          <input className="input" placeholder="Inicio (YYYY-MM-DD HH:MM)" value={form.starts_at} onChange={e=>setForm({...form,starts_at:e.target.value})}/>
          <input className="input" placeholder="Fin (YYYY-MM-DD HH:MM)" value={form.ends_at} onChange={e=>setForm({...form,ends_at:e.target.value})}/>
          <input className="input" placeholder="Notas" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
          <div className="flex justify-end"><button className="btn btn-primary" onClick={create}>Agendar</button></div>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Próximas citas</h2>
        <div className="divide-y">
          {items.map(a=>(
            <div key={a.id} className="py-3">
              <div className="font-medium">{a.starts_at} → {a.ends_at}</div>
              <div className="text-sm text-gray-600">Paciente #{a.patient_id} · {a.status}</div>
              {a.notes && <div className="text-sm text-gray-500">{a.notes}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
