/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_USDT_RECIPIENT: string
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv
} 