// ===========================
// AI Chatbot Type Definitions
// ===========================

export interface AIModel {
  id: string;
  provider: string;
  name: string;
  description?: string;
  enabled: boolean;
}

export interface MCPTool {
  id: string;
  name: string;
  description?: string;
  enabled: boolean;
  serverId?: string;
}

export interface MCPServer {
  id: string;
  name: string;
  url: string;
  description?: string;
  icon?: string;
  authHeader?: string;
  enabled: boolean;
  isCustom?: boolean;
  status: 'connected' | 'disconnected' | 'connecting' | 'error';
  toolsCount?: number;
  tools?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface Intent {
  id: string;
  name: string;
  description?: string;
}

export interface Skill {
  id: string;
  name: string;
  description: string;
  icon?: string;
  systemPrompt: string;
  enabled: boolean;
  isCustom?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface ToolExecution {
  id: string;
  name: string;
  status: 'running' | 'success' | 'error';
  durationMs?: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
  modelId?: string;
  skillId?: string;
  intent?: string;
  mcpTools?: string[];
  toolExecutions?: ToolExecution[];
  responseTimeMs?: number;
}

export interface Conversation {
  id: string;
  title: string;
  modelId: string;
  skillId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface APIConfiguration {
  provider: string;
  baseUrl: string;
  apiKey: string;
  defaultModelId: string;
  rasaUrl?: string;
  mcpUrl?: string;
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  enterToSend: boolean;
  compactMode: boolean;
  showMessageMetadata: boolean;
  showToolActivity: boolean;
}

export type GenerationState = 'idle' | 'thinking' | 'streaming' | 'tool-executing';
