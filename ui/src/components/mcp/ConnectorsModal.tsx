import React, { useState } from 'react';
import type { MCPServer } from '../../types';
import { useConfig } from '../../store/ConfigContext';
import { AddConnectorModal } from './AddConnectorModal';
import { testMCPServer } from '../../lib/api/mcp';

interface Props {
  onClose: () => void;
}

type FilterTab = 'all' | 'connected' | 'not-connected';

export const ConnectorsModal: React.FC<Props> = ({ onClose }) => {
  const { mcpServers, toggleMCPServer, deleteMCPServer } = useConfig();

  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FilterTab>('all');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editingConnector, setEditingConnector] = useState<MCPServer | null>(null);
  const [testingId, setTestingId] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleTest = async (server: MCPServer) => {
    setTestingId(server.id);
    const res = await testMCPServer(server.url, server.authHeader);
    setTestResults((prev) => ({
      ...prev,
      [server.id]: { success: res.success, message: res.message },
    }));
    setTestingId(null);
  };

  const filteredServers = mcpServers.filter((server) => {
    // Tab filter
    if (filter === 'connected' && !server.enabled) return false;
    if (filter === 'not-connected' && server.enabled) return false;

    // Search filter
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      server.name.toLowerCase().includes(q) ||
      server.url.toLowerCase().includes(q) ||
      (server.description && server.description.toLowerCase().includes(q))
    );
  });

  const popularServers = mcpServers.filter((s) => !s.isCustom).slice(0, 3);
  const customCount = mcpServers.filter((s) => s.isCustom).length;
  const connectedCount = mcpServers.filter((s) => s.enabled).length;

  return (
    <div className="modal-overlay" onClick={onClose} style={{ zIndex: 1000 }}>
      <div
        className="modal"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '780px', maxHeight: '85vh', width: '92vw', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}
      >
        {/* Header matching screenshot */}
        <div
          style={{
            padding: '20px 24px 16px',
            borderBottom: '1px solid var(--border-secondary)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '16px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <h2 className="modal-title" style={{ fontSize: '1.35rem', fontWeight: 600, margin: 0 }}>
              Connectors (MCP)
            </h2>
            <span
              style={{
                fontSize: '0.75rem',
                padding: '2px 8px',
                borderRadius: 'var(--radius-full)',
                background: connectedCount > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                color: connectedCount > 0 ? 'var(--accent-success)' : 'var(--text-tertiary)',
                fontWeight: 600,
              }}
            >
              {connectedCount} Connected
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1, justifyContent: 'flex-end' }}>
            {/* Search Input */}
            <div style={{ position: 'relative', minWidth: '180px', maxWidth: '280px', flex: 1 }}>
              <input
                type="text"
                placeholder="Search connectors..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  width: '100%',
                  padding: '7px 12px 7px 32px',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-tertiary)',
                  fontSize: '0.8125rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
              <span
                style={{
                  position: 'absolute',
                  left: '10px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-tertiary)',
                  fontSize: '0.8125rem',
                  pointerEvents: 'none',
                }}
              >
                🔍
              </span>
            </div>

            {/* Add Button */}
            <button
              className="btn btn-primary"
              style={{ padding: '7px 14px', fontSize: '0.8125rem', display: 'flex', alignItems: 'center', gap: '6px' }}
              onClick={() => {
                setEditingConnector(null);
                setIsAddOpen(true);
              }}
            >
              <span>+</span>
              <span>Add custom</span>
            </button>

            <button className="modal-close" onClick={onClose} style={{ marginLeft: '4px' }}>
              ✕
            </button>
          </div>
        </div>

        {/* Filter tabs: All, Connected, Not connected */}
        <div
          style={{
            padding: '12px 24px 0',
            display: 'flex',
            gap: '8px',
            borderBottom: '1px solid var(--border-secondary)',
          }}
        >
          {(
            [
              { id: 'all', label: 'All', count: mcpServers.length },
              { id: 'connected', label: 'Connected', count: connectedCount },
              { id: 'not-connected', label: 'Not connected', count: mcpServers.length - connectedCount },
            ] as const
          ).map((t) => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id)}
              style={{
                padding: '8px 16px',
                fontSize: '0.8125rem',
                fontWeight: 500,
                borderBottom: filter === t.id ? '2px solid var(--accent-primary)' : '2px solid transparent',
                color: filter === t.id ? 'var(--text-primary)' : 'var(--text-tertiary)',
                background: 'transparent',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              {t.label} ({t.count})
            </button>
          ))}
        </div>

        <div className="modal-body" style={{ padding: '20px 24px', flex: 1, overflowY: 'auto' }}>
          {/* Quick Popular/Pre-built section on 'all' tab if no search */}
          {filter === 'all' && !search && popularServers.length > 0 && (
            <div style={{ marginBottom: '24px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '12px' }}>
                Pre-built Connectors
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                {popularServers.map((server) => (
                  <div
                    key={server.id}
                    style={{
                      padding: '14px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: '1px solid var(--border-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{ fontSize: '1.4rem' }}>{server.icon || '🔌'}</span>
                      <div style={{ overflow: 'hidden' }}>
                        <div style={{ fontSize: '0.8125rem', fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {server.name}
                        </div>
                        <div style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                          {server.toolsCount || 2} tools
                        </div>
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'transparent',
                          border: '1px solid var(--border-secondary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => handleTest(server)}
                        disabled={testingId === server.id}
                        title="Uji koneksi ke endpoint MCP ini"
                      >
                        {testingId === server.id ? '⏳' : '⚡'}
                      </button>
                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'transparent',
                          border: '1px solid var(--border-secondary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setEditingConnector(server);
                          setIsAddOpen(true);
                        }}
                        title="Edit / Modifikasi connector"
                      >
                        ✎
                      </button>
                      <button
                        className={`btn ${server.enabled ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          minWidth: '76px',
                          borderRadius: 'var(--radius-sm)',
                        }}
                        onClick={() => toggleMCPServer(server.id)}
                      >
                        {server.enabled ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Connectors List */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {search ? `Search Results (${filteredServers.length})` : `All Remote MCP Connectors (${filteredServers.length})`}
              </div>
              {customCount > 0 && (
                <span style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>
                  {customCount} Custom added
                </span>
              )}
            </div>

            {filteredServers.length === 0 ? (
              <div
                style={{
                  padding: '40px 20px',
                  textAlign: 'center',
                  color: 'var(--text-tertiary)',
                  background: 'var(--bg-tertiary)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px dashed var(--border-primary)',
                }}
              >
                <div style={{ fontSize: '2rem', marginBottom: '8px' }}>🔌</div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                  Tidak ada connector ditemukan
                </div>
                <p style={{ fontSize: '0.75rem', margin: '4px 0 16px' }}>
                  {search ? 'Coba gunakan kata kunci pencarian yang lain' : 'Tambahkan custom MCP server pertama Anda sekarang'}
                </p>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.8125rem' }}
                  onClick={() => setIsAddOpen(true)}
                >
                  + Tambah Custom Connector
                </button>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {filteredServers.map((server) => (
                  <div
                    key={server.id}
                    style={{
                      padding: '14px 16px',
                      borderRadius: 'var(--radius-md)',
                      background: 'var(--bg-tertiary)',
                      border: server.enabled ? '1px solid var(--accent-primary-alpha, rgba(59, 130, 246, 0.25))' : '1px solid var(--border-secondary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '16px',
                    }}
                  >
                    {/* Left: Icon & Info */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', flex: 1, minWidth: 0 }}>
                      <span style={{ fontSize: '1.6rem', marginTop: '2px', lineHeight: 1 }}>
                        {server.icon || '🔌'}
                      </span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                          <span style={{ fontSize: '0.875rem', fontWeight: 600 }}>
                            {server.name}
                          </span>
                          {server.isCustom ? (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(59, 130, 246, 0.15)',
                                color: 'var(--accent-primary)',
                                fontWeight: 600,
                              }}
                            >
                              Custom MCP
                            </span>
                          ) : (
                            <span
                              style={{
                                fontSize: '0.625rem',
                                padding: '1px 6px',
                                borderRadius: 'var(--radius-full)',
                                background: 'rgba(107, 114, 128, 0.15)',
                                color: 'var(--text-tertiary)',
                                fontWeight: 600,
                              }}
                            >
                              Pre-built
                            </span>
                          )}
                          <span
                            style={{
                              fontSize: '0.6875rem',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                              color: server.enabled ? 'var(--accent-success)' : 'var(--text-tertiary)',
                            }}
                          >
                            <span
                              style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: server.enabled ? 'var(--accent-success)' : 'var(--text-tertiary)',
                                display: 'inline-block',
                              }}
                            />
                            {server.enabled ? 'Connected' : 'Disconnected'}
                          </span>
                        </div>

                        {server.description && (
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                            {server.description}
                          </div>
                        )}

                        <div style={{ marginTop: '6px', display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                          <code
                            style={{
                              fontSize: '0.6875rem',
                              fontFamily: 'var(--font-mono)',
                              background: 'var(--bg-primary)',
                              padding: '2px 6px',
                              borderRadius: 'var(--radius-sm)',
                              color: 'var(--text-secondary)',
                            }}
                          >
                            {server.url}
                          </code>
                          {server.tools && server.tools.length > 0 && (
                            <span style={{ fontSize: '0.6875rem', color: 'var(--text-tertiary)' }}>
                              Tools: {server.tools.join(', ')}
                            </span>
                          )}
                        </div>

                        {testResults[server.id] && (
                          <div
                            style={{
                              marginTop: '8px',
                              padding: '4px 10px',
                              borderRadius: 'var(--radius-sm)',
                              fontSize: '0.6875rem',
                              background: testResults[server.id].success
                                ? 'rgba(16, 185, 129, 0.15)'
                                : 'rgba(239, 68, 68, 0.15)',
                              color: testResults[server.id].success
                                ? 'var(--accent-success)'
                                : 'var(--accent-error)',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '6px',
                              fontWeight: 500,
                            }}
                          >
                            <span>{testResults[server.id].success ? '✓' : '✗'}</span>
                            <span>{testResults[server.id].message}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Right: Actions */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <button
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                        onClick={() => handleTest(server)}
                        disabled={testingId === server.id}
                        title="Uji koneksi ke remote endpoint MCP"
                      >
                        <span>{testingId === server.id ? '⏳' : '⚡'}</span>
                        <span>{testingId === server.id ? 'Testing...' : 'Test'}</span>
                      </button>

                      <button
                        style={{
                          padding: '6px 10px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-secondary)',
                          border: '1px solid var(--border-primary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setEditingConnector(server);
                          setIsAddOpen(true);
                        }}
                        title="Edit / Modifikasi connector"
                      >
                        ✎ Edit
                      </button>

                      {server.isCustom && (
                        <button
                          style={{
                            padding: '6px 10px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            color: 'var(--accent-error)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: 'none',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (window.confirm(`Hapus custom connector "${server.name}"?`)) {
                              deleteMCPServer(server.id);
                            }
                          }}
                          title="Delete connector"
                        >
                          ✕
                        </button>
                      )}

                      <button
                        className={`btn ${server.enabled ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          padding: '6px 14px',
                          fontSize: '0.8125rem',
                          minWidth: '92px',
                        }}
                        onClick={() => toggleMCPServer(server.id)}
                      >
                        {server.enabled ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Submodal for Add / Edit custom connector */}
      {isAddOpen && (
        <AddConnectorModal
          connectorToEdit={editingConnector}
          onClose={() => {
            setIsAddOpen(false);
            setEditingConnector(null);
          }}
        />
      )}
    </div>
  );
};
