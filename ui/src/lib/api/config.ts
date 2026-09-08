import type { APIConfiguration } from '../../types';

const STORAGE_KEY = 'chatbot-api-config';

export function loadApiConfiguration(): APIConfiguration {
  const envBaseUrl = import.meta.env.VITE_LLM_BASE_URL || '';
  const envApiKey = import.meta.env.VITE_LLM_API_KEY || '';
  const envProvider = import.meta.env.VITE_LLM_PROVIDER || 'Custom';
  const envDefaultModel = import.meta.env.VITE_DEFAULT_MODEL || 'gemini-3.7-flash';
  const envRasaUrl = import.meta.env.VITE_RASA_URL || 'http://localhost:5005';
  const envMcpUrl = import.meta.env.VITE_MCP_URL || 'http://localhost:8000';

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as APIConfiguration;
      return {
        provider: parsed.provider || envProvider,
        baseUrl: parsed.baseUrl || envBaseUrl,
        apiKey: parsed.apiKey || envApiKey,
        defaultModelId: parsed.defaultModelId || envDefaultModel,
        rasaUrl: parsed.rasaUrl || envRasaUrl,
        mcpUrl: parsed.mcpUrl || envMcpUrl,
      };
    }
  } catch {
    // Ignore parse errors
  }
  return {
    provider: envProvider,
    baseUrl: envBaseUrl,
    apiKey: envApiKey,
    defaultModelId: envDefaultModel,
    rasaUrl: envRasaUrl,
    mcpUrl: envMcpUrl,
  };
}

export function saveApiConfiguration(config: APIConfiguration): void {
  // Prototype warning: storing API key in localStorage is not secure
  // In production, this should use a secure backend
  localStorage.setItem(STORAGE_KEY, JSON.stringify(config));
}

export async function testConnection(config: APIConfiguration): Promise<{
  success: boolean;
  message: string;
}> {
  // Mock — in production this would call the actual API
  await new Promise((r) => setTimeout(r, 1500));

  if (!config.baseUrl) {
    return { success: false, message: 'Base URL is required' };
  }
  if (!config.apiKey) {
    return { success: false, message: 'API Key is required' };
  }

  // Simulate success for demo
  return { success: true, message: 'Connection successful' };
}
