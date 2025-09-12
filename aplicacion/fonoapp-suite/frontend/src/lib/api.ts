import axios from 'axios'
export const api = axios.create({ baseURL: import.meta.env.VITE_API_BASE || '/api' })
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token'); if (token) { config.headers = config.headers || {}; config.headers.Authorization = `Bearer ${token}` }
  return config
})
export async function me(){ const r = await api.get('/auth/me'); return r.data }
