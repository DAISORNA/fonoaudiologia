import { useEffect, useState } from 'react'
import { api } from '../lib/api'
import { Link } from 'react-router-dom'

type Patient = { id:number; first_name:string; last_name:string; diagnosis?:string|null }
export default function Patients(){
  const [items,setItems] = useState<Patient[]>([])
  const [form,setForm] = useState({ first_name:'', last_name:'', birth_date:'', diagnosis:'', notes:'' })
  async function load(){ const r = await api.get('/patients/'); setItems(r.data) }
  useEffect(()=>{ load() },[])
  async function create(){
    await api.post('/patients/', { ...form, birth_date: form.birth_date||null, diagnosis: form.diagnosis||null, notes: form.notes||null })
    setForm({ first_name:'', last_name:'', birth_date:'', diagnosis:'', notes:'' }); load()
  }
  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo paciente</h2>
        <div className="grid gap-3">
          <input className="input" placeholder="Nombre" value={form.first_name} onChange={e=>setForm({...form,first_name:e.target.value})}/>
          <input className="input" placeholder="Apellido" value={form.last_name} onChange={e=>setForm({...form,last_name:e.target.value})}/>
          <input className="input" placeholder="Fecha nacimiento (YYYY-MM-DD)" value={form.birth_date} onChange={e=>setForm({...form,birth_date:e.target.value})}/>
          <input className="input" placeholder="Diagnóstico" value={form.diagnosis} onChange={e=>setForm({...form,diagnosis:e.target.value})}/>
          <textarea className="input" placeholder="Notas" value={form.notes} onChange={e=>setForm({...form,notes:e.target.value})}/>
          <div className="flex justify-end"><button className="btn btn-primary" onClick={create}>Guardar</button></div>
        </div>
      </section>
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Pacientes</h2>
        <div className="divide-y">
          {items.map(p=>(
            <Link key={p.id} to={`/app/patients/${p.id}`} className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2">
              <div><div className="font-medium">{p.first_name} {p.last_name}</div><div className="text-sm text-gray-500">{p.diagnosis||'Sin diagnóstico'}</div></div>
              <div className="text-xs text-gray-500">#{p.id}</div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
