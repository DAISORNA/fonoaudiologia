/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL del API. En dev: '/api'. En prod: '/api' (Nginx) o 'https://api.tu-dominio.com'. */
  readonly VITE_API_BASE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
