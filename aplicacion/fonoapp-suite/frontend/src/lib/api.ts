// frontend/src/lib/api.ts
import axios, { AxiosError } from 'axios';

const baseURL = (import.meta.env.VITE_API_BASE ?? '').trim() || '/api';

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: 'application/json',
  },
});

// Adjunta token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo centralizado de 401
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('token');
      if (!location.pathname.startsWith('/login')) location.href = '/login';
    }
    return Promise.reject(err);
  }
);

// ---------- AUTH ----------
export async function me() {
  const r = await api.get('/auth/me');
  return r.data;
}

export async function login(email: string, password: string) {
  // El backend espera OAuth2PasswordRequestForm (form-url-encoded: username/password)
  const form = new URLSearchParams();
  form.append('username', email);
  form.append('password', password);
  const r = await api.post('/auth/login', form, {
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  });
  return r.data;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  role: 'admin'|'therapist'|'assistant'|'patient';
}) {
  const r = await api.post('/auth/register', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return r.data;
}

// ---------- PATIENTS ----------
export type PatientPayload = {
  first_name: string;
  last_name: string;
  cedula?: string | null;
  birth_date?: string | null;  // YYYY-MM-DD
  diagnosis?: string | null;
  notes?: string | null;
  user_id?: number | null;
};

export type ListPatientsParams = {
  q?: string;
  diagnosis?: string;
  cedula?: string;
  birth_from?: string;   // YYYY-MM-DD
  birth_to?: string;     // YYYY-MM-DD
  created_from?: string; // YYYY-MM-DD
  created_to?: string;   // YYYY-MM-DD
  sort?: 'id'|'-id'|'created_at'|'-created_at'|'first_name'|'-first_name'|'last_name'|'-last_name'|'birth_date'|'-birth_date'|'cedula'|'-cedula';
  limit?: number;
  offset?: number;
  include_deleted?: boolean;
};

export async function listPatients(params: ListPatientsParams = {}) {
  const r = await api.get('/patients/', { params });
  return r.data;
}

export async function getPatient(id: number) {
  const r = await api.get(`/patients/${id}`);
  return r.data;
}

export async function getPatientByCedula(doc: string) {
  const r = await api.get(`/patients/by-cedula/${encodeURIComponent(doc)}`);
  return r.data;
}

export async function createPatient(payload: PatientPayload) {
  const r = await api.post('/patients/', payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return r.data;
}

export async function updatePatient(id: number, payload: Partial<PatientPayload>) {
  const r = await api.put(`/patients/${id}`, payload, {
    headers: { 'Content-Type': 'application/json' },
  });
  return r.data;
}

export async function softDeletePatient(id: number) {
  await api.delete(`/patients/${id}`);
}

export async function restorePatient(id: number) {
  const r = await api.post(`/patients/${id}/restore`, {});
  return r.data;
}

export async function hardDeletePatient(id: number) {
  await api.delete(`/patients/${id}/hard`);
}
