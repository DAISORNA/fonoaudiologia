import { useEffect, useMemo, useState } from "react";
import { api } from "../lib/api";

type Appt = {
  id: number;
  patient_id: number;
  starts_at: string; // ISO UTC desde el backend
  ends_at: string;   // ISO UTC
  status?: string;
  notes?: string;
};

export default function Calendar() {
  const [items, setItems] = useState<Appt[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // formulario: guardamos en formato datetime-local (YYYY-MM-DDTHH:mm)
  const [form, setForm] = useState({
    patient_id: "",
    starts_at: "",
    ends_at: "",
    notes: "",
  });

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const r = await api.get<Appt[]>("/appointments/");
      setItems(r.data);
    } catch (e: any) {
      setError(e?.message ?? "Error al cargar citas");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  // mínimo: ahora + 5 minutos
  const minDateTime = useMemo(() => {
    const d = new Date();
    d.setMinutes(d.getMinutes() + 5);
    return toDatetimeLocal(d); // YYYY-MM-DDTHH:mm
  }, []);

  function toDatetimeLocal(d: Date) {
    // devuelve YYYY-MM-DDTHH:mm en hora local
    const pad = (n: number) => String(n).padStart(2, "0");
    const yyyy = d.getFullYear();
    const mm = pad(d.getMonth() + 1);
    const dd = pad(d.getDate());
    const hh = pad(d.getHours());
    const mi = pad(d.getMinutes());
    return `${yyyy}-${mm}-${dd}T${hh}:${mi}`;
  }

  function toIsoUtc(dtLocal: string) {
    // convierte "YYYY-MM-DDTHH:mm" (local) a ISO UTC
    return new Date(dtLocal).toISOString();
  }

  const disabled =
    !form.patient_id ||
    !form.starts_at ||
    !form.ends_at ||
    new Date(form.ends_at) <= new Date(form.starts_at);

  async function create() {
    if (disabled) return;
    setLoading(true);
    setError(null);
    try {
      await api.post("/appointments/", {
        patient_id: Number(form.patient_id),
        starts_at: toIsoUtc(form.starts_at),
        ends_at: toIsoUtc(form.ends_at),
        notes: form.notes || null,
      });
      setForm({ patient_id: "", starts_at: "", ends_at: "", notes: "" });
      await load();
    } catch (e: any) {
      setError(e?.response?.data?.detail ?? e?.message ?? "Error al agendar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Nueva cita</h2>
        <div className="grid gap-3">
          <input
            className="input"
            type="number"
            min={1}
            placeholder="ID Paciente"
            value={form.patient_id}
            onChange={(e) =>
              setForm({ ...form, patient_id: e.target.value })
            }
            required
          />

          <input
            className="input"
            type="datetime-local"
            step={900} // 15 minutos
            min={minDateTime}
            placeholder="Inicio"
            value={form.starts_at}
            onChange={(e) =>
              setForm({ ...form, starts_at: e.target.value })
            }
            required
          />

          <input
            className="input"
            type="datetime-local"
            step={900}
            min={form.starts_at || minDateTime}
            placeholder="Fin"
            value={form.ends_at}
            onChange={(e) =>
              setForm({ ...form, ends_at: e.target.value })
            }
            required
          />

          <input
            className="input"
            placeholder="Notas"
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
          />

          <div className="flex items-center justify-between text-sm">
            {error && <span className="text-red-600">{error}</span>}
            <div className="flex gap-2 ml-auto">
              <button
                className="btn"
                type="button"
                onClick={() =>
                  setForm({ patient_id: "", starts_at: "", ends_at: "", notes: "" })
                }
              >
                Limpiar
              </button>
              <button
                className="btn btn-primary"
                onClick={create}
                disabled={disabled || loading}
              >
                {loading ? "Guardando..." : "Agendar"}
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="card p-6">
        <h2 className="text-lg font-semibold mb-4">Próximas citas</h2>
        {loading && items.length === 0 ? (
          <div className="text-sm text-gray-600">Cargando…</div>
        ) : (
          <div className="divide-y">
            {items.map((a) => (
              <div key={a.id} className="py-3">
                <div className="font-medium">
                  {new Date(a.starts_at).toLocaleString()} →{" "}
                  {new Date(a.ends_at).toLocaleString()}
                </div>
                <div className="text-sm text-gray-600">
                  Paciente #{a.patient_id} · {a.status ?? "—"}
                </div>
                {a.notes && (
                  <div className="text-sm text-gray-500">{a.notes}</div>
                )}
              </div>
            ))}
            {items.length === 0 && (
              <div className="text-sm text-gray-600">Sin citas aún.</div>
            )}
          </div>
        )}
      </section>
    </div>
  );
}
