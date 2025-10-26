// frontend/src/pages/Patients.tsx
import { useEffect, useMemo, useState } from 'react';
import {
  createPatient,
  listPatients,
  softDeletePatient,
  restorePatient,
  hardDeletePatient,
  me,
  type PatientPayload,
  type ListPatientsParams,
} from '../lib/api';
import { Link } from 'react-router-dom';

type Patient = {
  id: number;
  first_name: string;
  last_name: string;
  cedula?: string | null;
  birth_date?: string | null;
  diagnosis?: string | null;
  notes?: string | null;
  deleted_at?: string | null;
};

const SORT_OPTIONS = [
  { v: '-created_at', label: 'Más recientes' },
  { v: 'created_at',  label: 'Más antiguos' },
  { v: 'first_name',  label: 'Nombre A→Z' },
  { v: '-first_name', label: 'Nombre Z→A' },
  { v: 'last_name',   label: 'Apellido A→Z' },
  { v: '-last_name',  label: 'Apellido Z→A' },
  { v: 'birth_date',  label: 'Nacimiento ↑' },
  { v: '-birth_date', label: 'Nacimiento ↓' },
  { v: 'cedula',      label: 'Cédula ↑' },
  { v: '-cedula',     label: 'Cédula ↓' },
];

export default function Patients() {
  // filtros
  const [q, setQ] = useState('');
  const [cedula, setCedula] = useState('');
  const [diagnosis, setDiagnosis] = useState('');
  const [birthFrom, setBirthFrom] = useState('');
  const [birthTo, setBirthTo] = useState('');
  const [sort, setSort] = useState<ListPatientsParams['sort']>('-created_at');
  const [limit, setLimit] = useState(20);
  const [offset, setOffset] = useState(0);
  const [includeDeleted, setIncludeDeleted] = useState(false);

  // datos
  const [items, setItems] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  // form crear
  const [form, setForm] = useState<PatientPayload>({
    first_name: '',
    last_name: '',
    cedula: '',
    birth_date: '',
    diagnosis: '',
    notes: '',
  });

  useEffect(() => {
    (async () => {
      try { const u = await me(); setIsAdmin(u?.role === 'admin'); } catch { /* ignore */ }
    })();
  }, []);

  const params = useMemo(() => {
    const p: ListPatientsParams = { sort, limit, offset };
    if (q.trim()) p.q = q.trim();
    if (cedula.trim()) p.cedula = cedula.trim();
    if (diagnosis.trim()) p.diagnosis = diagnosis.trim();
    if (birthFrom) p.birth_from = birthFrom;
    if (birthTo) p.birth_to = birthTo;
    if (includeDeleted && isAdmin) p.include_deleted = true;
    return p;
  }, [q, cedula, diagnosis, birthFrom, birthTo, sort, limit, offset, includeDeleted, isAdmin]);

  async function load() {
    setLoading(true);
    try {
      const data = await listPatients(params);
      setItems(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, [params]);

  async function create() {
    const payload: PatientPayload = {
      ...form,
      birth_date: form.birth_date || null,
      diagnosis: form.diagnosis || null,
      notes: form.notes || null,
      cedula: form.cedula || null,
    };
    await createPatient(payload);
    setForm({ first_name:'', last_name:'', cedula:'', birth_date:'', diagnosis:'', notes:'' });
    // reseteo a primera página
    setOffset(0);
    load();
  }

  async function del(id: number) {
    if (!confirm('¿Eliminar (soft-delete) este paciente?')) return;
    await softDeletePatient(id);
    load();
  }

  async function restore(id: number) {
    await restorePatient(id);
    load();
  }

  async function hardDel(id: number) {
    if (!confirm('⚠ Esta acción borra definitivamente. ¿Continuar?')) return;
    await hardDeletePatient(id);
    load();
  }

  return (
    <div className="grid gap-6">
      {/* Filtros */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Buscar pacientes</h2>
        <div className="grid md:grid-cols-6 gap-3">
          <input
            className="input md:col-span-2"
            placeholder="Nombre / Apellido / Diagnóstico / Cédula"
            value={q}
            onChange={e=>setQ(e.target.value)}
          />
          <input className="input" placeholder="Cédula" value={cedula} onChange={e=>setCedula(e.target.value)} />
          <input className="input" placeholder="Diagnóstico" value={diagnosis} onChange={e=>setDiagnosis(e.target.value)} />
          <input className="input" type="date" value={birthFrom} onChange={e=>setBirthFrom(e.target.value)} />
          <input className="input" type="date" value={birthTo} onChange={e=>setBirthTo(e.target.value)} />
          <select className="input" value={sort} onChange={e=>setSort(e.target.value as any)}>
            {SORT_OPTIONS.map(o=> <option key={o.v} value={o.v}>{o.label}</option>)}
          </select>
          <select
            className="input"
            value={limit}
            onChange={e=>{ setLimit(Number(e.target.value)); setOffset(0); }}
          >
            {[10,20,50,100].map(n=> <option key={n} value={n}>{n} / pág.</option>)}
          </select>

          {isAdmin && (
            <label className="flex items-center gap-2 text-sm" htmlFor="includeDeleted">
              <input
                id="includeDeleted"
                type="checkbox"
                checked={includeDeleted}
                onChange={(e) => { setIncludeDeleted(e.target.checked); setOffset(0); }}
              />
              <span>Incluir eliminados</span>
            </label>
          )}

          <div className="md:col-span-6 flex gap-2 justify-end">
            <button
              className="btn"
              onClick={()=>{
                setQ(''); setCedula(''); setDiagnosis('');
                setBirthFrom(''); setBirthTo('');
                setSort('-created_at'); setOffset(0);
              }}
            >
              Limpiar
            </button>
            <button className="btn btn-primary" onClick={load}>Buscar</button>
          </div>
        </div>
      </section>

      {/* Crear */}
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo paciente</h2>
        <div className="grid md:grid-cols-6 gap-3">
          <input
            className="input"
            placeholder="Nombre"
            value={form.first_name}
            onChange={e=>setForm({...form, first_name:e.target.value})}
          />
          <input
            className="input"
            placeholder="Apellido"
            value={form.last_name}
            onChange={e=>setForm({...form, last_name:e.target.value})}
          />
          <input
            className="input"
            placeholder="Cédula"
            value={form.cedula||''}
            onChange={e=>setForm({...form, cedula:e.target.value})}
          />
          <input
            className="input"
            type="date"
            placeholder="Nacimiento"
            value={form.birth_date||''}
            onChange={e=>setForm({...form, birth_date:e.target.value})}
          />
          <input
            className="input md:col-span-2"
            placeholder="Diagnóstico"
            value={form.diagnosis||''}
            onChange={e=>setForm({...form, diagnosis:e.target.value})}
          />
          <textarea
            className="input md:col-span-6"
            placeholder="Notas"
            value={form.notes||''}
            onChange={e=>setForm({...form, notes:e.target.value})}
          />
          <div className="md:col-span-6 flex justify-end">
            <button className="btn btn-primary" onClick={create}>Guardar</button>
          </div>
        </div>
      </section>

      {/* Lista */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">
            Pacientes {loading && <span className="text-sm text-gray-500">cargando…</span>}
          </h2>
          <div className="flex items-center gap-2">
            <button className="btn" disabled={offset===0} onClick={()=>setOffset(Math.max(0, offset - limit))}>←</button>
            <span className="text-sm text-gray-600">offset {offset}</span>
            <button className="btn" onClick={()=>setOffset(offset + limit)}>→</button>
          </div>
        </div>
        <div className="divide-y">
          {items.map(p => (
            <div key={p.id} className="py-3 flex items-center justify-between">
              <div className="min-w-0">
                <div className="font-medium truncate">
                  <Link to={`/app/patients/${p.id}`} className="hover:underline">
                    {p.first_name} {p.last_name}
                  </Link>
                  {p.deleted_at && <span className="ml-2 text-xs text-red-600">[ELIMINADO]</span>}
                </div>
                <div className="text-sm text-gray-600">
                  {p.cedula ? `Cédula: ${p.cedula} · ` : ''}{p.diagnosis || 'Sin diagnóstico'}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {!p.deleted_at && <button className="btn" onClick={()=>del(p.id)}>Eliminar</button>}
                {p.deleted_at && <button className="btn" onClick={()=>restore(p.id)}>Restaurar</button>}
                {isAdmin && <button className="btn btn-outline" onClick={()=>hardDel(p.id)}>Borrar definitivo</button>}
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
