/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_LLM_PROVIDER?: string;
  readonly VITE_LLM_BASE_URL?: string;
  readonly VITE_LLM_API_KEY?: string;
  readonly VITE_DEFAULT_MODEL?: string;
  readonly VITE_RASA_URL?: string;
  readonly VITE_MCP_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
