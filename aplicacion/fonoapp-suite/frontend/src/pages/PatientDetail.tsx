// frontend/src/pages/PatientDetail.tsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getPatient, updatePatient, softDeletePatient, restorePatient, hardDeletePatient, me } from '../lib/api';

export default function PatientDetail(){
  const { id } = useParams();
  const nav = useNavigate();
  const [patient,setPatient] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName]   = useState('');
  const [cedula, setCedula]       = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [notes, setNotes]         = useState('');

  async function load(){
    const p = await getPatient(Number(id));
    setPatient(p);
    setFirstName(p.first_name||''); setLastName(p.last_name||'');
    setCedula(p.cedula||''); setBirthDate(p.birth_date||'');
    setDiagnosis(p.diagnosis||''); setNotes(p.notes||'');
  }

  useEffect(()=>{ (async()=>{ try{ const u=await me(); setIsAdmin(u?.role==='admin'); }catch{} })(); },[]);
  useEffect(()=>{ load(); },[id]);

  async function save(){
    await updatePatient(Number(id), {
      first_name: firstName,
      last_name: lastName,
      cedula: cedula || null,
      birth_date: birthDate || null,
      diagnosis: diagnosis || null,
      notes: notes || null,
    });
    load();
  }

  async function del(){
    if (!confirm('¿Eliminar (soft-delete) este paciente?')) return;
    await softDeletePatient(Number(id));
    load();
  }

  async function restore(){
    await restorePatient(Number(id));
    load();
  }

  async function hardDel(){
    if (!confirm('⚠ Esta acción borra definitivamente. ¿Continuar?')) return;
    await hardDeletePatient(Number(id));
    nav('/app/patients');
  }

  if(!patient) return <p>Cargando…</p>;
  return (
    <div className="grid gap-6">
      <div className="card p-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Paciente #{patient.id} {patient.deleted_at && <span className="ml-2 text-xs text-red-600">[ELIMINADO]</span>}</h2>
          <div className="flex gap-2">
            {!patient.deleted_at && <button className="btn" onClick={del}>Eliminar</button>}
            {patient.deleted_at && <button className="btn" onClick={restore}>Restaurar</button>}
            {isAdmin && <button className="btn btn-outline" onClick={hardDel}>Borrar definitivo</button>}
          </div>
        </div>
      </div>

      <div className="card p-6">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label>Nombre</label>
            <input className="input mt-1" value={firstName} onChange={e=>setFirstName(e.target.value)} />
          </div>
          <div>
            <label>Apellido</label>
            <input className="input mt-1" value={lastName} onChange={e=>setLastName(e.target.value)} />
          </div>
          <div>
            <label>Cédula</label>
            <input className="input mt-1" value={cedula} onChange={e=>setCedula(e.target.value)} />
          </div>
          <div>
            <label>Fecha nacimiento</label>
            <input className="input mt-1" type="date" value={birthDate || ''} onChange={e=>setBirthDate(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label>Diagnóstico</label>
            <input className="input mt-1" value={diagnosis || ''} onChange={e=>setDiagnosis(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <label>Notas</label>
            <textarea className="input mt-1" value={notes || ''} onChange={e=>setNotes(e.target.value)} />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button className="btn btn-primary" onClick={save}>Guardar cambios</button>
          </div>
        </div>
      </div>
    </div>
  );
}
