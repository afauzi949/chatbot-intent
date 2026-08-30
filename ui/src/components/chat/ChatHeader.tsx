import React from 'react';
import { useConfig } from '../../store/ConfigContext';
import { ModelSelector } from '../model/ModelSelector';
import { SkillSelector } from '../skill/SkillSelector';

export const ChatHeader: React.FC = () => {
  const {
    sidebarOpen,
    setSidebarOpen,
    setSettingsOpen,
    setSkillsModalOpen,
    mcpServers,
    setConnectorsModalOpen,
  } = useConfig();

  const connectedCount = mcpServers.filter((s) => s.enabled).length;

  return (
    <header className="chat-header">
      <div className="chat-header-left">
        <button
          className="sidebar-toggle"
          onClick={() => setSidebarOpen(!sidebarOpen)}
          title="Toggle sidebar"
        >
          ☰
        </button>
        <span className="chat-header-title">AI Chat</span>
      </div>
      <div className="chat-header-right" style={{ gap: '8px' }}>
        <button
          className="popover-trigger"
          onClick={() => setConnectorsModalOpen(true)}
          title="Manage Remote MCP Connectors"
          style={{ gap: '6px' }}
        >
          <span>🔌</span>
          <span className="hide-mobile">Connectors</span>
          {connectedCount > 0 && (
            <span
              style={{
                fontSize: '0.625rem',
                background: 'var(--accent-success)',
                color: 'white',
                padding: '1px 5px',
                borderRadius: 'var(--radius-full)',
                fontWeight: 700,
              }}
            >
              {connectedCount}
            </span>
          )}
        </button>
        <SkillSelector onOpenNewSkillModal={() => setSkillsModalOpen(true)} />
        <ModelSelector />
        <button
          className="sidebar-toggle"
          onClick={() => setSettingsOpen(true)}
          title="Settings"
        >
          ⚙
        </button>
      </div>
    </header>
  );
};
