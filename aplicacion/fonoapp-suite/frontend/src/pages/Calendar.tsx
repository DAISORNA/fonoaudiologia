// frontend/src/pages/Calendar.tsx
import { useEffect, useState } from 'react'
import { api } from '../lib/api'

export default function Calendar(){
  const [items,setItems] = useState<any[]>([])
  const [form,setForm] = useState({ patient_id:'', starts_at:'', ends_at:'', notes:'' })
  const [err,setErr] = useState<string>('')

  async function load(){
    const r = await api.get('/appointments/')
    setItems(r.data)
  }
  useEffect(()=>{ load() },[])

  async function create(){
    setErr('')
    try{
      if(!form.patient_id || !form.starts_at || !form.ends_at){
        setErr('Falta paciente, inicio o fin'); return
      }
      // <input type="datetime-local"> devuelve "YYYY-MM-DDTHH:MM"
      // Lo mandamos tal cual; Pydantic lo parsea sin problemas.
      await api.post('/appointments/', {
        patient_id: Number(form.patient_id),
        starts_at: form.starts_at,   // ej. "2025-10-02T04:28"
        ends_at:   form.ends_at,
        notes: form.notes || null
      })
      setForm({ patient_id:'', starts_at:'', ends_at:'', notes:'' })
      load()
    }catch(e:any){
      setErr(e?.response?.data?.detail || e.message || 'No se pudo crear la cita')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nueva cita</h2>
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="ID Paciente"
            value={form.patient_id}
            onChange={e=>setForm({...form,patient_id:e.target.value})}
          />
          <input
            className="input"
            type="datetime-local"
            value={form.starts_at}
            onChange={e=>setForm({...form,starts_at:e.target.value})}
          />
          <input
            className="input"
            type="datetime-local"
            value={form.ends_at}
            onChange={e=>setForm({...form,ends_at:e.target.value})}
          />
          <input
            className="input"
            placeholder="Notas"
            value={form.notes}
            onChange={e=>setForm({...form,notes:e.target.value})}
          />
          {err && <div className="text-red-600 text-sm">{err}</div>}
          <div className="flex justify-end gap-2">
            <button className="btn" onClick={()=>setForm({ patient_id:'', starts_at:'', ends_at:'', notes:'' })}>Limpiar</button>
            <button className="btn btn-primary" onClick={create}>Agendar</button>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Próximas citas</h2>
        <div className="divide-y">
          {items.map(a=>(
            <div key={a.id} className="py-3">
              <div className="font-medium">
                #{a.id} · Paciente #{a.patient_id}
              </div>
              <div className="text-sm text-gray-600">
                {a.starts_at} → {a.ends_at} · {a.status}
              </div>
              {a.notes && <div className="text-sm text-gray-500">{a.notes}</div>}
            </div>
          ))}
        </div>
      </section>
    </div>
  )
}
