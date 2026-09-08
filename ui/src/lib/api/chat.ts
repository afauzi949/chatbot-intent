import type { ChatMessage, ToolExecution } from '../../types';
import { mockMessages, getRandomMockResponse, getMockToolExecutions } from '../mock/messages';
import { loadApiConfiguration } from './config';
import { loadMCPServers } from './mcp';
import { getMemoryPromptContext } from './memory';

let messageStore: Record<string, ChatMessage[]> = { ...mockMessages };

export async function getMessages(conversationId: string): Promise<ChatMessage[]> {
  try {
    const res = await fetch(`/api/conversations/${conversationId}/messages`);
    if (res.ok) {
      const data: ChatMessage[] = await res.json();
      messageStore[conversationId] = data;
      return data;
    }
  } catch (err) {
    console.warn('Backend getMessages failed, using fallback:', err);
  }
  return messageStore[conversationId] || [];
}

export async function addMessage(
  conversationId: string,
  message: ChatMessage
): Promise<void> {
  if (!messageStore[conversationId]) {
    messageStore[conversationId] = [];
  }
  messageStore[conversationId] = [...messageStore[conversationId], message];

  try {
    await fetch(`/api/conversations/${conversationId}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(message),
    });
  } catch (err) {
    console.warn('Backend addMessage failed, saved locally:', err);
  }
}

export async function deleteMessagesFrom(
  conversationId: string,
  fromMessageId: string
): Promise<void> {
  try {
    await fetch(`/api/conversations/${conversationId}/messages?from=${fromMessageId}`, {
      method: 'DELETE',
    });
  } catch (err) {
    console.warn('Backend deleteMessagesFrom failed:', err);
  }

  const msgs = messageStore[conversationId] || [];
  const idx = msgs.findIndex((m) => m.id === fromMessageId);
  if (idx >= 0) {
    messageStore[conversationId] = msgs.slice(0, idx);
  }
}

export interface StreamCallbacks {
  onThinking: () => void;
  onToolExecution: (tools: ToolExecution[]) => void;
  onToken: (partialContent: string) => void;
  onComplete: (message: ChatMessage) => void;
}

/**
 * Stream real completions from an OpenAI-compatible API
 */
async function streamRealApi(
  conversationId: string,
  modelId: string,
  intent: string,
  callbacks: StreamCallbacks,
  signal: AbortSignal,
  skillPrompt?: string,
  skillId?: string
): Promise<boolean> {
  const config = loadApiConfiguration();
  if (!config.baseUrl || !config.apiKey) {
    return false;
  }

  let cleanUrl = config.baseUrl.trim().replace(/\/+$/, '');
  if (!cleanUrl.endsWith('/chat/completions')) {
    cleanUrl = `${cleanUrl}/chat/completions`;
  }

  const history = (await getMessages(conversationId)) || [];
  const apiMessages: Array<{ role: string; content: string }> = [];

  // Load active MCP connectors
  const activeConnectors = loadMCPServers().filter((s) => s.enabled);
  
  let systemContent = skillPrompt || '';
  if (activeConnectors.length > 0) {
    const connectorsInfo = activeConnectors
      .map(
        (s) =>
          `- [${s.name}] (URL: ${s.url}): ${
            (s.tools || []).join(', ') || 'Remote endpoints'
          }`
      )
      .join('\n');
    systemContent += `\n\n[Active MCP Connectors]\nAnda memiliki akses ke tools remote MCP berikut:\n${connectorsInfo}\nGunakan konteks ini secara relevan untuk menjawab pertanyaan pengguna.`;
  }

  // Load active long-term memory facts from backend (Milestone 8)
  const memoryContext = await getMemoryPromptContext();
  if (memoryContext.trim()) {
    systemContent = systemContent
      ? `${systemContent}\n\n${memoryContext.trim()}`
      : memoryContext.trim();
  }

  if (systemContent.trim()) {
    apiMessages.push({
      role: 'system',
      content: systemContent.trim(),
    });
  }

  const recentHistory = history.slice(-10);
  for (const m of recentHistory) {
    apiMessages.push({ role: m.role, content: m.content });
  }

  if (apiMessages.length === 0) return false;

  const startTime = Date.now();
  callbacks.onThinking();

  try {
    const res = await fetch(cleanUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${config.apiKey.trim()}`,
      },
      body: JSON.stringify({
        model: modelId,
        messages: apiMessages,
        stream: true,
      }),
      signal,
    });

    if (!res.ok || !res.body) {
      console.warn(`Real API returned HTTP ${res.status}, falling back to mock stream`);
      return false;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder('utf-8');
    let fullContent = '';
    let buffer = '';

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed || trimmed.startsWith(':')) continue;
        if (trimmed === 'data: [DONE]') break;
        if (trimmed.startsWith('data: ')) {
          try {
            const json = JSON.parse(trimmed.slice(6));
            const delta = json.choices?.[0]?.delta?.content || '';
            if (delta) {
              fullContent += delta;
              callbacks.onToken(fullContent);
            }
          } catch {
            // Ignore parse errors on chunks
          }
        }
      }
    }

    if (!fullContent) {
      return false;
    }

    const activeToolNames = activeConnectors.flatMap((s) => s.tools || [s.name]);
    const elapsed = Date.now() - startTime;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: fullContent,
      createdAt: new Date().toISOString(),
      modelId,
      skillId,
      intent: intent === 'auto' ? undefined : intent,
      mcpTools: activeToolNames.length > 0 ? activeToolNames.slice(0, 3) : undefined,
      responseTimeMs: elapsed,
    };

    await addMessage(conversationId, msg);
    callbacks.onComplete(msg);
    return true;
  } catch (err: any) {
    if (err.name === 'AbortError') {
      return true; // Cancelled intentionally
    }
    console.warn('Real API streaming failed, falling back to mock:', err);
    return false;
  }
}

export function simulateStream(
  conversationId: string,
  modelId: string,
  intent: string,
  callbacks: StreamCallbacks,
  skillPrompt?: string,
  skillId?: string
): { cancel: () => void } {
  let cancelled = false;
  const abortController = new AbortController();

  const run = async () => {
    // Try real API first if configured
    const usedRealApi = await streamRealApi(
      conversationId,
      modelId,
      intent,
      callbacks,
      abortController.signal,
      skillPrompt,
      skillId
    );

    if (usedRealApi || cancelled) {
      return;
    }

    // Fallback: Mock stream simulation
    const responseText = getRandomMockResponse();
    const toolExecutions = getMockToolExecutions();
    const startTime = Date.now();

    // Phase 1: Thinking
    callbacks.onThinking();
    await new Promise((r) => setTimeout(r, 600 + Math.random() * 400));
    if (cancelled) return;

    // Phase 2: Tool execution (if any active MCP connector is enabled)
    const activeConnectors = loadMCPServers().filter((s) => s.enabled);
    const currentTools: ToolExecution[] = activeConnectors.length > 0
      ? activeConnectors.slice(0, 2).map((conn) => ({
          id: `tool-${conn.id}`,
          name: `${conn.name}: ${conn.tools?.[0] || 'remote_query'}`,
          status: 'running' as const,
        }))
      : toolExecutions;

    if (currentTools.length > 0) {
      const runningTools: ToolExecution[] = currentTools.map((t) => ({
        ...t,
        status: 'running' as const,
        durationMs: undefined,
      }));
      callbacks.onToolExecution(runningTools);

      for (let i = 0; i < currentTools.length; i++) {
        await new Promise((r) => setTimeout(r, 300 + Math.random() * 400));
        if (cancelled) return;
        runningTools[i] = { ...currentTools[i], status: 'success' };
        callbacks.onToolExecution([...runningTools]);
      }
      await new Promise((r) => setTimeout(r, 200));
      if (cancelled) return;
    }

    // Phase 3: Stream tokens
    let current = '';
    for (let i = 0; i < responseText.length; i++) {
      if (cancelled) return;
      current += responseText[i];
      callbacks.onToken(current);
      const ch = responseText[i];
      const delay = ch === '\n' ? 30 : ch === '.' || ch === ',' ? 40 : 8 + Math.random() * 12;
      await new Promise((r) => setTimeout(r, delay));
    }

    if (cancelled) return;

    const elapsed = Date.now() - startTime;
    const msg: ChatMessage = {
      id: `msg-${Date.now()}`,
      role: 'assistant',
      content: responseText,
      createdAt: new Date().toISOString(),
      modelId,
      skillId,
      intent: intent === 'auto' ? undefined : intent,
      mcpTools: currentTools.map((t) => t.name),
      toolExecutions: currentTools,
      responseTimeMs: elapsed,
    };

    await addMessage(conversationId, msg);
    callbacks.onComplete(msg);
  };

  run();

  return {
    cancel: () => {
      cancelled = true;
      abortController.abort();
    },
  };
}
