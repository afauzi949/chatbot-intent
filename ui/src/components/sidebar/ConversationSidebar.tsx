import React, { useState, useCallback, useEffect, useRef } from 'react';
import { useChat } from '../../store/ChatContext';
import { useConfig } from '../../store/ConfigContext';
import { groupConversationsByDate } from '../../lib/api/conversations';

export const ConversationSidebar: React.FC = () => {
  const {
    conversations,
    selectedConversationId,
    selectConversation,
    createConversation,
    renameConversation,
    deleteConversation,
    searchQuery,
    setSearchQuery,
  } = useChat();
  const { sidebarOpen, setSidebarOpen, setSettingsOpen, selectedModelId } = useConfig();

  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [contextMenu, setContextMenu] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);
  const contextMenuRef = useRef<HTMLDivElement>(null);

  // Filter conversations
  const filtered = searchQuery
    ? conversations.filter((c) =>
        c.title.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : conversations;

  const groups = groupConversationsByDate(filtered);

  // Close context menu on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        contextMenuRef.current &&
        !contextMenuRef.current.contains(e.target as Node)
      ) {
        setContextMenu(null);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNewChat = useCallback(() => {
    createConversation(undefined, selectedModelId);
    // Close sidebar on mobile
    if (window.innerWidth < 1024) {
      setSidebarOpen(false);
    }
  }, [createConversation, setSidebarOpen, selectedModelId]);

  const handleSelect = useCallback(
    (id: string) => {
      selectConversation(id);
      if (window.innerWidth < 1024) {
        setSidebarOpen(false);
      }
    },
    [selectConversation, setSidebarOpen]
  );

  const handleContextMenu = useCallback(
    (e: React.MouseEvent, id: string) => {
      e.preventDefault();
      setContextMenu({ id, x: e.clientX, y: e.clientY });
    },
    []
  );

  const handleRenameStart = useCallback(
    (id: string, currentTitle: string) => {
      setRenamingId(id);
      setRenameValue(currentTitle);
      setContextMenu(null);
    },
    []
  );

  const handleRenameSubmit = useCallback(() => {
    if (renamingId && renameValue.trim()) {
      renameConversation(renamingId, renameValue.trim());
    }
    setRenamingId(null);
  }, [renamingId, renameValue, renameConversation]);

  const handleDelete = useCallback(
    (id: string) => {
      deleteConversation(id);
      setContextMenu(null);
    },
    [deleteConversation]
  );

  return (
    <>
      {/* Backdrop for mobile */}
      {sidebarOpen && window.innerWidth < 1024 && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <aside className={`sidebar ${sidebarOpen ? '' : 'collapsed'}`}>
        <div className="sidebar-header">
          <button className="sidebar-new-chat" onClick={handleNewChat}>
            <span>+</span>
            <span>New Chat</span>
          </button>

          <div className="sidebar-search">
            <svg className="sidebar-search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="M21 21l-4.35-4.35" />
            </svg>
            <input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        <div className="sidebar-conversations">
          {groups.map((group) => (
            <div key={group.label}>
              <div className="sidebar-group-label">{group.label}</div>
              {group.conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`conversation-item ${
                    conv.id === selectedConversationId ? 'active' : ''
                  }`}
                  onClick={() => handleSelect(conv.id)}
                  onContextMenu={(e) => handleContextMenu(e, conv.id)}
                >
                  {renamingId === conv.id ? (
                    <input
                      className="rename-input"
                      value={renameValue}
                      onChange={(e) => setRenameValue(e.target.value)}
                      onBlur={handleRenameSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRenameSubmit();
                        if (e.key === 'Escape') setRenamingId(null);
                      }}
                      autoFocus
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <>
                      <span className="conversation-item-title">{conv.title}</span>
                      <div className="conversation-item-actions">
                        <button
                          className="conversation-item-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleRenameStart(conv.id, conv.title);
                          }}
                          title="Rename"
                        >
                          ✎
                        </button>
                        <button
                          className="conversation-item-action"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(conv.id);
                          }}
                          title="Delete"
                        >
                          ✕
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>
          ))}

          {filtered.length === 0 && (
            <div style={{ padding: '20px 10px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.8125rem' }}>
              {searchQuery ? 'No conversations found' : 'No conversations yet'}
            </div>
          )}
        </div>

        <div className="sidebar-footer">
          <button
            className="sidebar-settings-btn"
            onClick={() => setSettingsOpen(true)}
          >
            <span>⚙</span>
            <span>Settings</span>
          </button>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="context-menu"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <div
            className="context-menu-item"
            onClick={() => {
              const conv = conversations.find((c) => c.id === contextMenu.id);
              if (conv) handleRenameStart(conv.id, conv.title);
            }}
          >
            ✎ Rename
          </div>
          <div
            className="context-menu-item danger"
            onClick={() => handleDelete(contextMenu.id)}
          >
            ✕ Delete
          </div>
        </div>
      )}
    </>
  );
};
