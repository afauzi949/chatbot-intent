import type { Conversation } from '../../types';
import { mockConversations } from '../mock/conversations';

let fallbackConversations = [...mockConversations];

export async function getConversations(): Promise<Conversation[]> {
  try {
    const res = await fetch('/api/conversations');
    if (res.ok) {
      const data: Conversation[] = await res.json();
      return data;
    }
  } catch (err) {
    console.warn('Backend conversations API unavailable, using fallback mock:', err);
  }

  // Fallback to mock data if backend unavailable
  return [...fallbackConversations].sort(
    (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  );
}

export async function createConversation(title: string, modelId: string): Promise<Conversation> {
  try {
    const res = await fetch('/api/conversations', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, modelId }),
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend create conversation failed, using fallback:', err);
  }

  const now = new Date().toISOString();
  const conv: Conversation = {
    id: `conv-${Date.now()}`,
    title,
    modelId,
    createdAt: now,
    updatedAt: now,
  };
  fallbackConversations = [conv, ...fallbackConversations];
  return conv;
}

export async function renameConversation(id: string, title: string): Promise<void> {
  try {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title }),
    });
    if (res.ok) return;
  } catch (err) {
    console.warn('Backend rename conversation failed, updating local fallback:', err);
  }

  fallbackConversations = fallbackConversations.map((c) =>
    c.id === id ? { ...c, title, updatedAt: new Date().toISOString() } : c
  );
}

export async function deleteConversation(id: string): Promise<void> {
  try {
    const res = await fetch(`/api/conversations/${id}`, {
      method: 'DELETE',
    });
    if (res.ok) return;
  } catch (err) {
    console.warn('Backend delete conversation failed, updating local fallback:', err);
  }

  fallbackConversations = fallbackConversations.filter((c) => c.id !== id);
}

export function groupConversationsByDate(
  convs: Conversation[]
): { label: string; conversations: Conversation[] }[] {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime();
  const yesterdayStart = todayStart - 86400000;
  const weekStart = todayStart - 86400000 * 7;

  const groups: { label: string; conversations: Conversation[] }[] = [
    { label: 'Today', conversations: [] },
    { label: 'Yesterday', conversations: [] },
    { label: 'Previous 7 Days', conversations: [] },
    { label: 'Earlier', conversations: [] },
  ];

  for (const conv of convs) {
    const t = new Date(conv.updatedAt).getTime();
    if (t >= todayStart) {
      groups[0].conversations.push(conv);
    } else if (t >= yesterdayStart) {
      groups[1].conversations.push(conv);
    } else if (t >= weekStart) {
      groups[2].conversations.push(conv);
    } else {
      groups[3].conversations.push(conv);
    }
  }

  return groups.filter((g) => g.conversations.length > 0);
}
