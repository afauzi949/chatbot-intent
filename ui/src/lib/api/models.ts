import type { AIModel } from '../../types';
import { mockModels } from '../mock/models';

/**
 * Infer human-friendly provider name based on model ID or owned_by
 */
export function inferProvider(id: string, ownedBy?: string): string {
  const lower = id.toLowerCase();
  if (lower.includes('gemini')) return 'Google';
  if (lower.includes('claude')) return 'Anthropic';
  if (
    lower.includes('gpt') ||
    lower.startsWith('o1') ||
    lower.startsWith('o3') ||
    lower.includes('text-embedding')
  ) {
    return 'OpenAI';
  }
  if (lower.includes('qwen')) return 'Qwen / Alibaba';
  if (lower.includes('deepseek')) return 'DeepSeek';
  if (lower.includes('llama') || lower.includes('meta')) return 'Meta';
  if (
    lower.includes('mistral') ||
    lower.includes('mixtral') ||
    lower.includes('codestral')
  ) {
    return 'Mistral AI';
  }
  if (lower.includes('gemma')) return 'Google';
  if (lower.includes('cohere') || lower.includes('command')) return 'Cohere';
  if (lower.includes('yi-') || lower.includes('01-ai')) return '01.AI';
  if (lower.includes('glm') || lower.includes('zhipu')) return 'Zhipu AI';

  if (
    ownedBy &&
    ownedBy !== 'system' &&
    ownedBy !== 'organization' &&
    ownedBy !== 'openai' &&
    ownedBy !== 'user'
  ) {
    return ownedBy.charAt(0).toUpperCase() + ownedBy.slice(1);
  }

  return 'Custom / Other';
}

/**
 * Clean and format model name for display
 */
export function formatModelName(id: string): string {
  // If id is like "google/gemini-pro" or "anthropic/claude-3", extract name
  const parts = id.split('/');
  const rawName = parts[parts.length - 1];

  // Capitalize nicely or replace dashes
  return rawName
    .split('-')
    .map((word) => {
      if (/^\d+(\.\d+)?$/.test(word)) return word;
      return word.charAt(0).toUpperCase() + word.slice(1);
    })
    .join(' ');
}

/**
 * Fetch available models from an OpenAI-compatible /models endpoint
 */
export async function fetchModelsFromApi(
  baseUrl: string,
  apiKey?: string
): Promise<AIModel[]> {
  if (!baseUrl) {
    throw new Error('Base URL is required to fetch models');
  }

  let cleanUrl = baseUrl.trim().replace(/\/+$/, '');

  // If URL doesn't already point to /models, append it
  if (!cleanUrl.endsWith('/models')) {
    cleanUrl = `${cleanUrl}/models`;
  }

  const headers: Record<string, string> = {
    Accept: 'application/json',
  };

  if (apiKey && apiKey.trim()) {
    headers['Authorization'] = `Bearer ${apiKey.trim()}`;
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

  try {
    const res = await fetch(cleanUrl, {
      method: 'GET',
      headers,
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP error ${res.status}: ${res.statusText}`);
    }

    const data = await res.json();

    // Standard OpenAI response format: { data: [{ id: "...", ... }] }
    // Or direct array: [ ... ]
    // Or custom format: { models: [ ... ] }
    let rawList: any[] = [];
    if (Array.isArray(data)) {
      rawList = data;
    } else if (data && Array.isArray(data.data)) {
      rawList = data.data;
    } else if (data && Array.isArray(data.models)) {
      rawList = data.models;
    } else {
      throw new Error('Unrecognized response format from /models endpoint');
    }

    if (rawList.length === 0) {
      throw new Error('No models returned from endpoint');
    }

    const parsedModels: AIModel[] = rawList.map((item) => {
      const id = typeof item === 'string' ? item : item.id || item.name;
      const ownedBy = typeof item === 'object' ? item.owned_by || item.provider : undefined;
      const provider = inferProvider(id, ownedBy);
      const name = typeof item === 'object' && item.name && item.name !== id
        ? item.name
        : formatModelName(id);

      return {
        id,
        name,
        provider,
        description: (typeof item === 'object' && item.description) || (ownedBy ? `Provider: ${ownedBy}` : undefined),
        enabled: true,
      };
    });

    // Sort by provider, then by name
    return parsedModels.sort((a, b) => {
      if (a.provider === b.provider) {
        return a.name.localeCompare(b.name);
      }
      return a.provider.localeCompare(b.provider);
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (err.name === 'AbortError') {
      throw new Error('Connection timed out while fetching models');
    }
    throw err;
  }
}

/**
 * Get models — tries to fetch from configured API, falls back to mock models
 */
export async function getModels(
  baseUrl?: string,
  apiKey?: string
): Promise<{ models: AIModel[]; source: 'api' | 'mock'; error?: string }> {
  if (baseUrl) {
    try {
      const apiModels = await fetchModelsFromApi(baseUrl, apiKey);
      return { models: apiModels, source: 'api' };
    } catch (err: any) {
      console.warn('Failed to fetch models from API, falling back to mock models:', err.message);
      return {
        models: mockModels,
        source: 'mock',
        error: err.message || 'Failed to fetch models from API',
      };
    }
  }

  return { models: mockModels, source: 'mock' };
}

export function getEnabledModels(models: AIModel[]): AIModel[] {
  return models.filter((m) => m.enabled);
}

export function getModelById(models: AIModel[], id: string): AIModel | undefined {
  return models.find((m) => m.id === id);
}

export function groupModelsByProvider(models: AIModel[]): Record<string, AIModel[]> {
  return models.reduce<Record<string, AIModel[]>>((acc, model) => {
    const provider = model.provider || 'Other';
    if (!acc[provider]) {
      acc[provider] = [];
    }
    acc[provider].push(model);
    return acc;
  }, {});
}
