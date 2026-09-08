import type { AIModel } from '../../types';

export const mockModels: AIModel[] = [
  {
    id: 'gemini-3.7-flash',
    provider: 'Google',
    name: 'Gemini 3.7 Flash',
    description: 'Fast and efficient',
    enabled: true,
  },
  {
    id: 'gemini-3.1-pro',
    provider: 'Google',
    name: 'Gemini 3.1 Pro',
    description: 'Advanced reasoning',
    enabled: true,
  },
  {
    id: 'claude-sonnet-4.6',
    provider: 'Anthropic',
    name: 'Claude Sonnet 4.6',
    description: 'Fast and capable',
    enabled: true,
  },
  {
    id: 'claude-opus-4.6',
    provider: 'Anthropic',
    name: 'Claude Opus 4.6',
    description: 'Deep reasoning',
    enabled: true,
  },
];
