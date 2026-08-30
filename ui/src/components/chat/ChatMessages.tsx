import React, { useRef, useEffect, useCallback } from 'react';
import { useChat } from '../../store/ChatContext';
import { useConfig } from '../../store/ConfigContext';
import { ChatMessage } from './ChatMessage';
import { ToolActivity } from './ToolActivity';
import { EmptyState } from './EmptyState';

export const ChatMessages: React.FC = () => {
  const {
    messages,
    streamingContent,
    toolExecutions,
    generationState,
    selectedConversationId,
    regenerateLastResponse,
    editAndResend,
    sendMessage,
  } = useChat();
  const { selectedModelId, selectedIntentId, skills, selectedSkillId } = useConfig();
  const activeSkill = skills.find((s) => s.id === selectedSkillId);

  const containerRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const userScrolledUp = useRef(false);

  // Auto-scroll logic
  const scrollToBottom = useCallback(() => {
    if (!userScrolledUp.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingContent, scrollToBottom]);

  // Detect user scrolling up
  const handleScroll = useCallback(() => {
    const el = containerRef.current;
    if (!el) return;
    const threshold = 100;
    userScrolledUp.current =
      el.scrollHeight - el.scrollTop - el.clientHeight > threshold;
  }, []);

  const handleRegenerate = useCallback(() => {
    regenerateLastResponse(
      selectedModelId,
      selectedIntentId,
      activeSkill?.systemPrompt,
      activeSkill?.id
    );
  }, [regenerateLastResponse, selectedModelId, selectedIntentId, activeSkill]);

  const handleEdit = useCallback(
    (messageId: string, newContent: string) => {
      editAndResend(
        messageId,
        newContent,
        selectedModelId,
        selectedIntentId,
        activeSkill?.systemPrompt,
        activeSkill?.id
      );
    },
    [editAndResend, selectedModelId, selectedIntentId, activeSkill]
  );

  const handleSuggestion = useCallback(
    (text: string) => {
      sendMessage(
        text,
        selectedModelId,
        selectedIntentId,
        activeSkill?.systemPrompt,
        activeSkill?.id
      );
    },
    [sendMessage, selectedModelId, selectedIntentId, activeSkill]
  );

  // Show empty state if no conversation or no messages
  if (!selectedConversationId && messages.length === 0 && generationState === 'idle') {
    return (
      <EmptyState content="" onSuggestionClick={handleSuggestion} />
    );
  }

  if (messages.length === 0 && generationState === 'idle') {
    return (
      <EmptyState content="" onSuggestionClick={handleSuggestion} />
    );
  }

  return (
    <div className="chat-messages" ref={containerRef} onScroll={handleScroll}>
      <div className="chat-messages-inner">
        {messages.map((msg, idx) => (
          <ChatMessage
            key={msg.id}
            message={msg}
            onRegenerate={
              msg.role === 'assistant' && idx === messages.length - 1
                ? handleRegenerate
                : undefined
            }
            onEdit={msg.role === 'user' ? handleEdit : undefined}
          />
        ))}

        {/* Tool execution activity */}
        {generationState === 'tool-executing' && toolExecutions.length > 0 && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-content-wrapper">
              <ToolActivity executions={toolExecutions} />
            </div>
          </div>
        )}

        {/* Thinking indicator */}
        {generationState === 'thinking' && (
          <div className="message assistant">
            <div className="message-avatar">AI</div>
            <div className="message-content-wrapper">
              <div className="thinking-indicator">
                <div className="thinking-dots">
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                  <div className="thinking-dot" />
                </div>
                <span className="thinking-text">Thinking...</span>
              </div>
            </div>
          </div>
        )}

        {/* Streaming message */}
        {generationState === 'streaming' && streamingContent && (
          <ChatMessage
            message={{
              id: 'streaming',
              role: 'assistant',
              content: streamingContent,
              createdAt: new Date().toISOString(),
            }}
            isStreaming
          />
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  );
};
