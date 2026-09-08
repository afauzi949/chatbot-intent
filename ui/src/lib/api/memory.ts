export interface MemoryFact {
  id: string;
  userId?: string;
  content: string;
  source: string;
  isActive: boolean;
  sourceConversationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PromptContextResponse {
  count: number;
  promptContext: string;
}

/**
 * Fetch all active long-term memories from the backend
 */
export async function getActiveMemories(): Promise<MemoryFact[]> {
  try {
    const res = await fetch('/api/memory');
    if (!res.ok) {
      console.warn(`Failed to fetch memories: HTTP ${res.status}`);
      return [];
    }
    return await res.json();
  } catch (err) {
    console.warn('Backend memory API unreachable:', err);
    return [];
  }
}

/**
 * Fetch pre-formatted memory context ready for system prompt injection
 */
export async function getMemoryPromptContext(): Promise<string> {
  try {
    const res = await fetch('/api/memory/prompt-context');
    if (!res.ok) return '';
    const data: PromptContextResponse = await res.json();
    return data.promptContext || '';
  } catch {
    return '';
  }
}

/**
 * Explicitly save or update a memory fact
 */
export async function saveMemory(
  content: string,
  sourceConversationId?: string
): Promise<MemoryFact | null> {
  try {
    const res = await fetch('/api/memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        content,
        sourceConversationId,
        source: 'explicit',
      }),
    });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Failed to save memory to backend:', err);
    return null;
  }
}

/**
 * Soft delete / forget a memory fact
 */
export async function deleteMemory(id: string): Promise<boolean> {
  try {
    const res = await fetch(`/api/memory/${id}`, {
      method: 'DELETE',
    });
    return res.ok;
  } catch (err) {
    console.warn('Failed to delete memory from backend:', err);
    return false;
  }
}
