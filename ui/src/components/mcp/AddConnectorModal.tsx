import React, { useState, useEffect } from 'react';
import type { MCPServer } from '../../types';
import { useConfig } from '../../store/ConfigContext';
import { testMCPServer } from '../../lib/api/mcp';

interface Props {
  onClose: () => void;
  connectorToEdit?: MCPServer | null;
}

const EMOJI_PRESETS = ['🔌', '🐘', '🏝️', '🤖', '🎯', '🐙', '💳', '⚙️', '🌐', '📊', '🔍', '⚡'];

export const AddConnectorModal: React.FC<Props> = ({ onClose, connectorToEdit }) => {
  const { addMCPServer, updateMCPServer } = useConfig();

  const [name, setName] = useState(connectorToEdit?.name || '');
  const [icon, setIcon] = useState(connectorToEdit?.icon || '🔌');
  const [url, setUrl] = useState(connectorToEdit?.url || '');
  const [authHeader, setAuthHeader] = useState(connectorToEdit?.authHeader || '');
  const [description, setDescription] = useState(connectorToEdit?.description || '');
  const [loading, setLoading] = useState(false);
  const [testingOnly, setTestingOnly] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const handleStandaloneTest = async () => {
    if (!url.trim()) {
      setStatusMessage({ type: 'error', text: 'Remote MCP server URL wajib diisi untuk menguji koneksi' });
      return;
    }
    setTestingOnly(true);
    setStatusMessage(null);
    const res = await testMCPServer(url.trim(), authHeader.trim());
    setStatusMessage({
      type: res.success ? 'success' : 'error',
      text: res.message,
    });
    setTestingOnly(false);
  };

  // Sync state whenever connectorToEdit changes
  useEffect(() => {
    if (connectorToEdit) {
      setName(connectorToEdit.name);
      setIcon(connectorToEdit.icon || '🔌');
      setUrl(connectorToEdit.url);
      setAuthHeader(connectorToEdit.authHeader || '');
      setDescription(connectorToEdit.description || '');
      setStatusMessage(null);
    } else {
      setName('');
      setIcon('🔌');
      setUrl('');
      setAuthHeader('');
      setDescription('');
      setStatusMessage(null);
    }
  }, [connectorToEdit]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setStatusMessage({ type: 'error', text: 'Name wajib diisi' });
      return;
    }

    if (!url.trim()) {
      setStatusMessage({ type: 'error', text: 'Remote MCP server URL wajib diisi' });
      return;
    }

    setLoading(true);
    setStatusMessage(null);

    // Test connection first
    const testResult = await testMCPServer(url.trim(), authHeader.trim());

    if (!testResult.success) {
      setLoading(false);
      setStatusMessage({ type: 'error', text: testResult.message });
      return;
    }

    if (connectorToEdit) {
      updateMCPServer(connectorToEdit.id, {
        name: name.trim(),
        icon: icon.trim() || '🔌',
        url: url.trim(),
        authHeader: authHeader.trim() || undefined,
        description: description.trim() || undefined,
        status: 'connected',
        enabled: true,
      });
    } else {
      addMCPServer({
        name: name.trim(),
        icon: icon.trim() || '🔌',
        url: url.trim(),
        authHeader: authHeader.trim() || undefined,
        description: description.trim() || 'Custom Remote MCP Server',
        enabled: true,
        toolsCount: testResult.toolsCount || 3,
      });
    }

    setLoading(false);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '520px', borderRadius: '16px' }}
      >
        <div className="modal-header" style={{ padding: '20px 24px 12px' }}>
          <h2 className="modal-title" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
            {connectorToEdit ? `Edit connector: ${connectorToEdit.name}` : 'Add custom connector'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="modal-body" style={{ padding: '12px 24px 20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <p style={{ margin: 0, fontSize: '0.8125rem', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {connectorToEdit
                ? 'Modifikasi detail konfigurasi, URL remote endpoint, atau kredensial connector ini.'
                : 'Hubungkan asisten AI ke data dan tools internal Anda melalui Remote MCP (Model Context Protocol).'}
            </p>

            {statusMessage && (
              <div
                className={`connection-status ${statusMessage.type === 'success' ? 'success' : 'error'}`}
                style={{ margin: 0 }}
              >
                <span>{statusMessage.type === 'success' ? '✓' : '✗'} {statusMessage.text}</span>
              </div>
            )}

            {/* Icon / Emoji */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Icon / Emoji
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="setting-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                  style={{ width: '56px', textAlign: 'center', fontSize: '1.25rem' }}
                />
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {EMOJI_PRESETS.map((emoji) => (
                    <button
                      type="button"
                      key={emoji}
                      onClick={() => setIcon(emoji)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: 'var(--radius-sm)',
                        border: icon === emoji ? '1px solid var(--accent-primary)' : '1px solid var(--border-primary)',
                        background: icon === emoji ? 'var(--bg-active)' : 'var(--bg-tertiary)',
                        fontSize: '1rem',
                        cursor: 'pointer',
                      }}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Name input */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Name *
              </label>
              <input
                type="text"
                className="setting-input"
                placeholder="Contoh: Local Database Connector, Weather MCP..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setStatusMessage(null);
                }}
                autoFocus
              />
              <span className="setting-description" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                Shown in the connectors list.
              </span>
            </div>

            {/* Remote MCP server URL input */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Remote MCP server URL *
              </label>
              <input
                type="url"
                className="setting-input"
                placeholder="https://mcp.example.com/mcp"
                value={url}
                onChange={(e) => {
                  setUrl(e.target.value);
                  setStatusMessage(null);
                }}
              />
              <span className="setting-description" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                The HTTP/HTTPS address where the server accepts MCP requests, for example <code>http://localhost:8000/mcp</code>.
              </span>
            </div>

            {/* Optional Authorization Header */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Authorization Token (Optional)
              </label>
              <input
                type="password"
                className="setting-input"
                placeholder="Bearer token or API secret"
                value={authHeader}
                onChange={(e) => setAuthHeader(e.target.value)}
              />
              <span className="setting-description" style={{ marginTop: '4px', fontSize: '0.75rem' }}>
                Optional credentials for authenticated MCP endpoints.
              </span>
            </div>

            {/* Optional Description */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label" style={{ fontSize: '0.8125rem', fontWeight: 500 }}>
                Description (Optional)
              </label>
              <input
                type="text"
                className="setting-input"
                placeholder="Ringkasan fungsi connector..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* Security notice matching the screenshot */}
            <div
              style={{
                padding: '12px 14px',
                borderRadius: 'var(--radius-md)',
                background: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-secondary)',
                fontSize: '0.75rem',
                color: 'var(--text-tertiary)',
                lineHeight: 1.5,
              }}
            >
              Only use connectors from developers and servers you trust. Ensure the remote MCP endpoint is accessible and accepts incoming tool executions.
            </div>
          </div>

          <div
            style={{
              padding: '16px 24px',
              borderTop: '1px solid var(--border-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'flex-end',
              gap: '10px',
              background: 'var(--bg-secondary)',
              borderRadius: '0 0 16px 16px',
            }}
          >
            <button
              type="button"
              className="btn btn-secondary"
              onClick={handleStandaloneTest}
              disabled={loading || testingOnly || !url.trim()}
              style={{
                marginRight: 'auto',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                fontSize: '0.8125rem',
              }}
              title="Uji koneksi ke endpoint sebelum menyimpan"
            >
              <span>{testingOnly ? '⏳' : '⚡'}</span>
              <span>{testingOnly ? 'Testing...' : 'Test Connection'}</span>
            </button>

            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={loading || testingOnly}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ minWidth: '100px' }}
            >
              {loading ? 'Connecting...' : connectorToEdit ? 'Save Changes' : 'Continue'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
