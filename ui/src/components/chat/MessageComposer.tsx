import React, { useState, useRef, useCallback, useEffect } from 'react';
import { useChat } from '../../store/ChatContext';
import { useConfig } from '../../store/ConfigContext';

export const MessageComposer: React.FC = () => {
  const { sendMessage, stopGeneration, generationState } = useChat();
  const {
    selectedModelId,
    selectedIntentId,
    settings,
    skills,
    selectedSkillId,
  } = useConfig();

  const [content, setContent] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const isGenerating = generationState !== 'idle';
  const activeSkill = skills.find((s) => s.id === selectedSkillId);

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (el) {
      el.style.height = 'auto';
      el.style.height = Math.min(el.scrollHeight, 200) + 'px';
    }
  }, [content]);

  const handleSend = useCallback(() => {
    if (!content.trim() || isGenerating) return;
    sendMessage(
      content.trim(),
      selectedModelId,
      selectedIntentId,
      activeSkill?.systemPrompt,
      activeSkill?.id
    );
    setContent('');
    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [content, isGenerating, sendMessage, selectedModelId, selectedIntentId, activeSkill]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey && settings.enterToSend) {
        e.preventDefault();
        handleSend();
      }
    },
    [handleSend, settings.enterToSend]
  );

  return (
    <div className="composer">
      <div className="composer-inner">
        <textarea
          ref={textareaRef}
          className="composer-textarea"
          placeholder="Ask anything..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onKeyDown={handleKeyDown}
          rows={1}
          disabled={isGenerating}
        />
        <div className="composer-toolbar">
          <div className="composer-toolbar-left">
            {activeSkill && (
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '5px',
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-full)',
                  background: 'var(--bg-active)',
                  fontSize: '0.6875rem',
                  color: 'var(--text-secondary)',
                }}
                title={`Active Skill: ${activeSkill.name}\n${activeSkill.description}`}
              >
                <span>{activeSkill.icon || '✦'}</span>
                <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {activeSkill.name}
                </span>
              </div>
            )}
          </div>

          <div className="composer-toolbar-right">
            {isGenerating ? (
              <button className="send-btn stop" onClick={stopGeneration} title="Stop generating">
                ■
              </button>
            ) : (
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={!content.trim()}
                title="Send message"
              >
                ↑
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
