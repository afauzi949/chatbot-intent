import React, { useState, useCallback, useRef, useEffect } from 'react';
import type { ChatMessage as ChatMessageType } from '../../types';
import { useConfig } from '../../store/ConfigContext';

interface Props {
  message: ChatMessageType;
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onEdit?: (messageId: string, newContent: string) => void;
}

export const ChatMessage: React.FC<Props> = ({
  message,
  isStreaming,
  onRegenerate,
  onEdit,
}) => {
  const { settings, models, skills } = useConfig();
  const [showDetails, setShowDetails] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editContent, setEditContent] = useState(message.content);
  const [copied, setCopied] = useState(false);
  const editTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto focus, move cursor to end, and auto-resize height when entering edit mode
  useEffect(() => {
    if (editing && editTextareaRef.current) {
      const el = editTextareaRef.current;
      el.focus();
      el.selectionStart = el.selectionEnd = el.value.length;
      el.style.height = 'auto';
      el.style.height = `${Math.max(el.scrollHeight, 40)}px`;
    }
  }, [editing]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setEditContent(e.target.value);
    e.target.style.height = 'auto';
    e.target.style.height = `${Math.max(e.target.scrollHeight, 40)}px`;
  };

  const model = message.modelId
    ? models.find((m) => m.id === message.modelId)
    : undefined;

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: no-op
    }
  }, [message.content]);

  const handleEditSubmit = useCallback(() => {
    if (editContent.trim() && onEdit) {
      onEdit(message.id, editContent.trim());
    }
    setEditing(false);
  }, [editContent, message.id, onEdit]);

  const handleEditCancel = useCallback(() => {
    setEditContent(message.content);
    setEditing(false);
  }, [message.content]);

  const handleEditKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleEditSubmit();
      }
      if (e.key === 'Escape') {
        handleEditCancel();
      }
    },
    [handleEditSubmit, handleEditCancel]
  );

  // Render content — for assistant we use a simple approach without react-markdown
  // (to avoid external dependency complexity)
  const renderMarkdown = (content: string) => {
    // Convert markdown to HTML (simplified)
    let html = content;

    // Code blocks
    html = html.replace(/```(\w*)\n([\s\S]*?)```/g, (_match, lang, code) => {
      const escaped = code
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
      return `<pre><code class="language-${lang}">${escaped}</code></pre>`;
    });

    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');

    // Headers
    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');

    // Bold
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

    // Italic
    html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');

    // Horizontal rule
    html = html.replace(/^---$/gm, '<hr/>');

    // Blockquote
    html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>');

    // Tables
    html = html.replace(
      /\|(.+)\|\n\|[-| :]+\|\n((?:\|.+\|\n?)*)/g,
      (_match, headerRow, bodyRows) => {
        const headers = headerRow
          .split('|')
          .map((h: string) => h.trim())
          .filter(Boolean);
        const rows = bodyRows
          .trim()
          .split('\n')
          .map((row: string) =>
            row
              .split('|')
              .map((c: string) => c.trim())
              .filter(Boolean)
          );

        let table = '<table><thead><tr>';
        headers.forEach((h: string) => {
          table += `<th>${h}</th>`;
        });
        table += '</tr></thead><tbody>';
        rows.forEach((row: string[]) => {
          table += '<tr>';
          row.forEach((cell: string) => {
            table += `<td>${cell}</td>`;
          });
          table += '</tr>';
        });
        table += '</tbody></table>';
        return table;
      }
    );

    // Unordered lists
    html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, '<ul>$1</ul>');

    // Ordered lists
    html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');

    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');

    // Line breaks (but not inside pre/table)
    html = html.replace(/\n\n/g, '</p><p>');
    html = html.replace(/\n/g, '<br/>');

    // Wrap in paragraph if not already structured
    if (!html.startsWith('<')) {
      html = `<p>${html}</p>`;
    }

    return html;
  };

  return (
    <div className={`message ${message.role} ${editing ? 'is-editing' : ''}`}>
      {message.role === 'assistant' && (
        <div className="message-avatar">AI</div>
      )}
      <div className="message-content-wrapper">
        {/* Message bubble / ChatGPT-style Edit Box */}
        {editing ? (
          <div className="gpt-edit-card">
            <textarea
              ref={editTextareaRef}
              className="gpt-edit-textarea"
              value={editContent}
              onChange={handleTextareaChange}
              onKeyDown={handleEditKeyDown}
              rows={1}
            />
            <div className="gpt-edit-actions">
              <button
                type="button"
                className="gpt-btn-cancel"
                onClick={handleEditCancel}
              >
                Batal
              </button>
              <button
                type="button"
                className="gpt-btn-send"
                onClick={handleEditSubmit}
                disabled={!editContent.trim()}
              >
                Kirim
              </button>
            </div>
          </div>
        ) : (
          <div className="message-bubble">
            {message.role === 'assistant' ? (
              <div
                dangerouslySetInnerHTML={{ __html: renderMarkdown(message.content) }}
              />
            ) : (
              <span>{message.content}</span>
            )}
            {isStreaming && <span className="streaming-cursor">▌</span>}
          </div>
        )}

        {/* Actions */}
        {!editing && !isStreaming && (
          <div className="message-actions">
            <button className="message-action-btn" onClick={handleCopy}>
              {copied ? '✓ Copied' : '⎘ Copy'}
            </button>
            {message.role === 'assistant' && onRegenerate && (
              <button className="message-action-btn" onClick={onRegenerate}>
                ↻ Regenerate
              </button>
            )}
            {message.role === 'user' && onEdit && (
              <button
                className="message-action-btn"
                onClick={() => setEditing(true)}
              >
                ✎ Edit
              </button>
            )}
          </div>
        )}

        {/* Metadata for assistant messages */}
        {message.role === 'assistant' &&
          !isStreaming &&
          settings.showMessageMetadata &&
          (model || message.responseTimeMs || message.skillId) && (
            <div className="message-metadata">
              <span>
                {message.skillId && (
                  <span style={{ marginRight: '6px' }}>
                    {skills.find((s) => s.id === message.skillId)?.icon}{' '}
                    {skills.find((s) => s.id === message.skillId)?.name} ·
                  </span>
                )}
                {model?.name || message.modelId}
                {message.responseTimeMs
                  ? ` · ${(message.responseTimeMs / 1000).toFixed(1)}s`
                  : ''}
              </span>
              {(message.intent || message.mcpTools?.length || message.skillId) && (
                <span
                  className="metadata-toggle"
                  onClick={() => setShowDetails(!showDetails)}
                >
                  {showDetails ? '▾ Hide' : '▸ Details'}
                </span>
              )}
            </div>
          )}

        {showDetails && (
          <div className="message-metadata-details">
            {message.skillId && (
              <div className="metadata-row">
                <span className="metadata-label">Skill</span>
                <span className="metadata-value">
                  {skills.find((s) => s.id === message.skillId)?.icon}{' '}
                  {skills.find((s) => s.id === message.skillId)?.name || message.skillId}
                </span>
              </div>
            )}
            {message.intent && (
              <div className="metadata-row">
                <span className="metadata-label">Intent</span>
                <span className="metadata-value">{message.intent}</span>
              </div>
            )}
            {message.mcpTools && message.mcpTools.length > 0 && (
              <div className="metadata-row">
                <span className="metadata-label">Tools</span>
                <span className="metadata-value">
                  {message.mcpTools.join(', ')}
                </span>
              </div>
            )}
            {model && (
              <div className="metadata-row">
                <span className="metadata-label">Model</span>
                <span className="metadata-value">{model.name}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
