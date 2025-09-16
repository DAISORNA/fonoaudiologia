/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE?: string
  // agrega aquí más vars VITE_... si las usas
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
