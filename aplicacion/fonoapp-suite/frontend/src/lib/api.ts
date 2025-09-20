// frontend/src/lib/api.ts
import axios, { AxiosError } from "axios";

const baseURL = (import.meta.env.VITE_API_BASE ?? "").trim() || "/api";

export const api = axios.create({
  baseURL,
  timeout: 15000,
  headers: {
    Accept: "application/json",
  },
});

// Adjunta token si existe
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers || {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Manejo centralizado de errores y 401
api.interceptors.response.use(
  (r) => r,
  (err: AxiosError<any>) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("token");
      if (!location.pathname.startsWith("/login")) location.href = "/login";
    }
    return Promise.reject(err);
  }
);

// Helpers de alto nivel
export async function me() {
  const r = await api.get("/auth/me");
  return r.data;
}

export async function registerUser(payload: {
  full_name: string;
  email: string;
  password: string;
  role: "admin" | "therapist" | "assistant" | "patient";
}) {
  const r = await api.post("/auth/register", payload);
  return r.data;
}

/**
 * Login: el backend espera x-www-form-urlencoded con *username* y *password*
 */
export async function login(email: string, password: string) {
  const body = new URLSearchParams({ username: email, password });
  const r = await api.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return r.data;
}
