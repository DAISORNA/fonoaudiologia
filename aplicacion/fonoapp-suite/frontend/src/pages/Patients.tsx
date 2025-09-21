import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";
import { Link } from "react-router-dom";

type Patient = { id:number; first_name:string; last_name:string; diagnosis?:string|null };

export default function Patients(){
  const [items,setItems] = useState<Patient[]>([]);
  const [loading,setLoading] = useState(false);
  const [error,setError] = useState<string|null>(null);

  const [form,setForm] = useState({
    first_name: "",
    last_name: "",
    birth_date: "", // YYYY-MM-DD (date input)
    diagnosis: "",
    notes: ""
  });

  async function load(){
    try {
      setLoading(true); setError(null);
      const r = await api.get("/patients/");
      setItems(r.data);
    } catch (e:any) {
      setError(e?.message ?? "Error al cargar pacientes");
    } finally {
      setLoading(false);
    }
  }
  useEffect(()=>{ load() },[]);

  const today = useMemo(
    () => new Date().toISOString().slice(0,10), // YYYY-MM-DD
    []
  );

  const canSave = form.first_name.trim() && form.last_name.trim();

  async function create(){
    if(!canSave) return;
    try{
      setLoading(true); setError(null);
      await api.post("/patients/", {
        ...form,
        // asegura null cuando esté vacío
        birth_date: form.birth_date || null,
        diagnosis: form.diagnosis || null,
        notes: form.notes || null
      });
      setForm({ first_name:"", last_name:"", birth_date:"", diagnosis:"", notes:"" });
      await load();
    }catch(e:any){
      setError(e?.response?.data?.detail ?? e?.message ?? "Error al guardar");
    }finally{
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nuevo paciente</h2>
        <div className="grid gap-3">
          <input
            className="input"
            placeholder="Nombre"
            value={form.first_name}
            onChange={e=>setForm({...form,first_name:e.target.value})}
            required
          />
          <input
            className="input"
            placeholder="Apellido"
            value={form.last_name}
            onChange={e=>setForm({...form,last_name:e.target.value})}
            required
          />

          {/* Calendario nativo: día/mes/año */}
          <input
            className="input"
            type="date"
            value={form.birth_date}
            onChange={e=>setForm({...form,birth_date:e.target.value})}
            max={today}           // no permite fechas futuras
            placeholder="Fecha nacimiento"
          />

          <input
            className="input"
            placeholder="Diagnóstico"
            value={form.diagnosis}
            onChange={e=>setForm({...form,diagnosis:e.target.value})}
          />
          <textarea
            className="input"
            placeholder="Notas"
            value={form.notes}
            onChange={e=>setForm({...form,notes:e.target.value})}
            rows={3}
          />

          <div className="flex items-center justify-between text-sm">
            {error && <span className="text-red-600">{error}</span>}
            <div className="flex gap-2 ml-auto">
              <button className="btn" type="button"
                onClick={()=>setForm({ first_name:"", last_name:"", birth_date:"", diagnosis:"", notes:"" })}
              >
                Limpiar
              </button>
              <button className="btn btn-primary" onClick={create} disabled={!canSave || loading}>
                {loading ? "Guardando..." : "Guardar"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Pacientes</h2>
        {loading && items.length===0 ? (
          <div className="text-sm text-gray-600">Cargando…</div>
        ) : (
          <div className="divide-y">
            {items.map(p=>(
              <Link key={p.id} to={`/app/patients/${p.id}`}
                className="py-3 flex items-center justify-between hover:bg-gray-50 rounded-lg px-2"
              >
                <div>
                  <div className="font-medium">{p.first_name} {p.last_name}</div>
                  <div className="text-sm text-gray-500">{p.diagnosis || "Sin diagnóstico"}</div>
                </div>
                <div className="text-xs text-gray-500">#{p.id}</div>
              </Link>
            ))}
            {items.length===0 && <div className="text-sm text-gray-600">Sin pacientes aún.</div>}
          </div>
        )}
      </section>
    </div>
  );
}
