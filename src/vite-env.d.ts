/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SINGLE_FILE?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
