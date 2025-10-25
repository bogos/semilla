/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_POOL_REGISTRY_ADDRESS: string
  readonly VITE_LENDING_FACTORY_ADDRESS: string
  readonly VITE_RPC_URL: string
  readonly VITE_CHAIN_ID: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
