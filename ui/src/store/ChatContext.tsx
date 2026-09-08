import React, { createContext, useContext, useState, useCallback, useEffect, useRef } from 'react';
import type {
  ChatMessage,
  Conversation,
  GenerationState,
  ToolExecution,
} from '../types';
import * as conversationsApi from '../lib/api/conversations';
import * as chatApi from '../lib/api/chat';

import { loadApiConfiguration } from '../lib/api/config';

interface ChatContextValue {
  // Conversations
  conversations: Conversation[];
  selectedConversationId: string | null;
  selectConversation: (id: string | null) => void;
  createConversation: (title?: string, modelId?: string) => Promise<Conversation>;
  renameConversation: (id: string, title: string) => Promise<void>;
  deleteConversation: (id: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;

  // Messages
  messages: ChatMessage[];
  streamingContent: string;
  toolExecutions: ToolExecution[];
  generationState: GenerationState;

  // Actions
  sendMessage: (
    content: string,
    modelId: string,
    intent: string,
    skillPrompt?: string,
    skillId?: string
  ) => Promise<void>;
  stopGeneration: () => void;
  regenerateLastResponse: (
    modelId: string,
    intent: string,
    skillPrompt?: string,
    skillId?: string
  ) => void;
  editAndResend: (
    messageId: string,
    newContent: string,
    modelId: string,
    intent: string,
    skillPrompt?: string,
    skillId?: string
  ) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function ChatProvider({ children }: { children: React.ReactNode }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [streamingContent, setStreamingContent] = useState('');
  const [toolExecutions, setToolExecutions] = useState<ToolExecution[]>([]);
  const [generationState, setGenerationState] = useState<GenerationState>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const cancelRef = useRef<(() => void) | null>(null);

  // Load conversations on mount
  useEffect(() => {
    conversationsApi.getConversations().then(setConversations);
  }, []);

  // Load messages when conversation changes
  useEffect(() => {
    if (selectedConversationId) {
      chatApi.getMessages(selectedConversationId).then(setMessages);
    } else {
      setMessages([]);
    }
    setStreamingContent('');
    setToolExecutions([]);
    setGenerationState('idle');
  }, [selectedConversationId]);

  const refreshConversations = useCallback(async () => {
    const convs = await conversationsApi.getConversations();
    setConversations(convs);
  }, []);

  const selectConversation = useCallback((id: string | null) => {
    // Stop any ongoing generation
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    setSelectedConversationId(id);
  }, []);

  const createConversation = useCallback(async (title?: string, modelId?: string) => {
    const fallbackModel = loadApiConfiguration().defaultModelId || 'gemini-3.7-flash';
    const conv = await conversationsApi.createConversation(
      title || 'New conversation',
      modelId || fallbackModel
    );
    await refreshConversations();
    setSelectedConversationId(conv.id);
    setMessages([]);
    return conv;
  }, [refreshConversations]);

  const renameConversation = useCallback(async (id: string, title: string) => {
    await conversationsApi.renameConversation(id, title);
    await refreshConversations();
  }, [refreshConversations]);

  const deleteConversation = useCallback(async (id: string) => {
    await conversationsApi.deleteConversation(id);
    if (selectedConversationId === id) {
      setSelectedConversationId(null);
      setMessages([]);
    }
    await refreshConversations();
  }, [selectedConversationId, refreshConversations]);

  const sendMessage = useCallback(
    async (
      content: string,
      modelId: string,
      intent: string,
      skillPrompt?: string,
      skillId?: string
    ) => {
      let convId = selectedConversationId;

      // Create conversation if none selected
      if (!convId) {
        const title = content.length > 40 ? content.slice(0, 40) + '…' : content;
        const conv = await conversationsApi.createConversation(title, modelId);
        convId = conv.id;
        setSelectedConversationId(convId);
        await refreshConversations();
      }

      // Add user message optimistically
      const userMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'user',
        content,
        skillId,
        createdAt: new Date().toISOString(),
      };
      await chatApi.addMessage(convId, userMsg);
      setMessages((prev) => [...prev, userMsg]);

      // Start streaming
      const currentConvId = convId;
      const stream = chatApi.simulateStream(
        currentConvId,
        modelId,
        intent,
        {
          onThinking: () => {
            setGenerationState('thinking');
            setStreamingContent('');
            setToolExecutions([]);
          },
          onToolExecution: (tools) => {
            setGenerationState('tool-executing');
            setToolExecutions([...tools]);
          },
          onToken: (partial) => {
            setGenerationState('streaming');
            setStreamingContent(partial);
          },
          onComplete: (msg) => {
            setMessages((prev) => [...prev, msg]);
            setStreamingContent('');
            setToolExecutions([]);
            setGenerationState('idle');
            cancelRef.current = null;
            refreshConversations();
          },
        },
        skillPrompt,
        skillId
      );

      cancelRef.current = stream.cancel;
    },
    [selectedConversationId, refreshConversations]
  );

  const stopGeneration = useCallback(() => {
    if (cancelRef.current) {
      cancelRef.current();
      cancelRef.current = null;
    }
    // If we have partial content, save it as a message
    if (streamingContent) {
      const partialMsg: ChatMessage = {
        id: `msg-${Date.now()}`,
        role: 'assistant',
        content: streamingContent + '\n\n*(Generation stopped)*',
        createdAt: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, partialMsg]);
    }
    setStreamingContent('');
    setToolExecutions([]);
    setGenerationState('idle');
  }, [streamingContent]);

  const regenerateLastResponse = useCallback(
    (
      modelId: string,
      intent: string,
      skillPrompt?: string,
      skillId?: string
    ) => {
      if (!selectedConversationId || messages.length === 0) return;

      // Find last assistant message and remove it
      const lastAssistantIdx = [...messages].reverse().findIndex((m) => m.role === 'assistant');
      if (lastAssistantIdx === -1) return;

      const idx = messages.length - 1 - lastAssistantIdx;
      const lastUserMsg = messages.slice(0, idx).reverse().find((m) => m.role === 'user');
      if (!lastUserMsg) return;

      // Remove the last assistant message
      const newMessages = messages.slice(0, idx);
      setMessages(newMessages);

      // Re-send
      const convId = selectedConversationId;
      const stream = chatApi.simulateStream(
        convId,
        modelId,
        intent,
        {
          onThinking: () => {
            setGenerationState('thinking');
            setStreamingContent('');
            setToolExecutions([]);
          },
          onToolExecution: (tools) => {
            setGenerationState('tool-executing');
            setToolExecutions([...tools]);
          },
          onToken: (partial) => {
            setGenerationState('streaming');
            setStreamingContent(partial);
          },
          onComplete: (msg) => {
            setMessages((prev) => [...prev, msg]);
            setStreamingContent('');
            setToolExecutions([]);
            setGenerationState('idle');
            cancelRef.current = null;
          },
        },
        skillPrompt,
        skillId
      );

      cancelRef.current = stream.cancel;
    },
    [selectedConversationId, messages]
  );

  const editAndResend = useCallback(
    async (
      messageId: string,
      newContent: string,
      modelId: string,
      intent: string,
      skillPrompt?: string,
      skillId?: string
    ) => {
      if (!selectedConversationId) return;

      // Delete messages from this point
      await chatApi.deleteMessagesFrom(selectedConversationId, messageId);

      const msgIdx = messages.findIndex((m) => m.id === messageId);
      const newMessages = messages.slice(0, msgIdx);
      setMessages(newMessages);

      // Send the edited message
      await sendMessage(newContent, modelId, intent, skillPrompt, skillId);
    },
    [selectedConversationId, messages, sendMessage]
  );

  const value: ChatContextValue = {
    conversations,
    selectedConversationId,
    selectConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
    messages,
    streamingContent,
    toolExecutions,
    generationState,
    sendMessage,
    stopGeneration,
    regenerateLastResponse,
    editAndResend,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
}

export function useChat(): ChatContextValue {
  const ctx = useContext(ChatContext);
  if (!ctx) throw new Error('useChat must be used within ChatProvider');
  return ctx;
}
