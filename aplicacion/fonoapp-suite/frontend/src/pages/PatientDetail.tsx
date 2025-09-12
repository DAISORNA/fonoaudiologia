import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../lib/api'

export default function PatientDetail(){
  const { id } = useParams()
  const [patient,setPatient] = useState<any>(null)
  const [plans,setPlans] = useState<any[]>([])
  const [logs,setLogs] = useState<any[]>([])
  const [assigns,setAssigns] = useState<any[]>([])
  const [newGoal,setNewGoal] = useState('')
  const [planTitle,setPlanTitle] = useState('Plan inicial')
  const [progress,setProgress] = useState('')

  async function load(){
    const p = await api.get(`/patients/${id}`); setPatient(p.data)
    const pl = await api.get(`/plans/patient/${id}`); setPlans(pl.data)
    if(pl.data[0]){ const lg = await api.get(`/plans/${pl.data[0].id}/logs`); setLogs(lg.data) }
    const asg = await api.get(`/assignments/patient/${id}`); setAssigns(asg.data)
  }
  useEffect(()=>{ load() },[id])

  async function createPlan(){
    const plan = await api.post('/plans/', { patient_id:Number(id), title: planTitle, goals: newGoal ? [{title:newGoal, target:10, metric:'aciertos'}] : [] })
    setPlanTitle('Plan'); setNewGoal(''); load()
  }
  async function addLog(){
    if(!plans[0]) return
    const obj:any = {}; obj[0]= Number(progress||0)
    await api.post(`/plans/${plans[0].id}/logs`, { plan_id: plans[0].id, progress: obj, notes: 'Sesión' })
    setProgress(''); load()
  }
  async function addAssign(){
    const title = prompt('Título de tarea para casa'); if(!title) return
    await api.post('/assignments/', { patient_id:Number(id), title })
    load()
  }

  if(!patient) return <p>Cargando...</p>
  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <h2 className="text-lg font-semibold mb-2">{patient.first_name} {patient.last_name}</h2>
        <p className="text-sm text-gray-600">{patient.diagnosis || 'Sin diagnóstico'}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <section className="card p-6">
          <h3 className="font-semibold mb-3">Plan de tratamiento</h3>
          <div className="grid gap-2">
            <input className="input" placeholder="Título del plan" value={planTitle} onChange={e=>setPlanTitle(e.target.value)}/>
            <input className="input" placeholder="Objetivo (opcional)" value={newGoal} onChange={e=>setNewGoal(e.target.value)}/>
            <button className="btn btn-primary" onClick={createPlan}>Crear plan</button>
          </div>
          <div className="mt-4 text-sm text-gray-600">{plans.length} plan(es)</div>
        </section>

        <section className="card p-6">
          <h3 className="font-semibold mb-3">Progreso (sesiones)</h3>
          <div className="grid gap-2">
            <input className="input" placeholder="Valor progreso (0-10)" value={progress} onChange={e=>setProgress(e.target.value)}/>
            <button className="btn btn-primary" onClick={addLog}>Añadir sesión</button>
          </div>
          <ul className="mt-4 text-sm text-gray-600">{logs.map((l:any)=>(<li key={l.id}>Sesión #{l.id} · {JSON.stringify(l.progress)}</li>))}</ul>
        </section>

        <section className="card p-6">
          <h3 className="font-semibold mb-3">Tareas para casa</h3>
          <button className="btn btn-primary" onClick={addAssign}>Nueva tarea</button>
          <ul className="mt-4 text-sm text-gray-600">{assigns.map((a:any)=>(<li key={a.id}>• {a.title} ({a.status})</li>))}</ul>
        </section>
      </div>
    </div>
  )
}
