import React, { useState } from 'react';
import type { Skill, MCPServer } from '../../types';
import { useConfig } from '../../store/ConfigContext';
import { testMCPServer } from '../../lib/api/mcp';
import { SkillModal } from '../skill/SkillModal';
import { AddConnectorModal } from '../mcp/AddConnectorModal';

type SettingsTab = 'general' | 'skills' | 'connectors' | 'models' | 'interface';

export const SettingsPanel: React.FC = () => {
  const {
    settingsOpen,
    setSettingsOpen,
    settings,
    updateSettings,
    apiConfig,
    models,
    toggleModelEnabled,
    modelsSource,
    isLoadingModels,
    modelsError,
    fetchModels,
    skills,
    toggleSkillEnabled,
    deleteSkill,
    resetSkills,
    mcpServers,
    toggleMCPServer,
    deleteMCPServer,
  } = useConfig();

  const [tab, setTab] = useState<SettingsTab>('general');
  const [skillToEdit, setSkillToEdit] = useState<Skill | null>(null);
  const [skillModalOpen, setSkillModalOpen] = useState(false);
  const [connectorToEdit, setConnectorToEdit] = useState<MCPServer | null>(null);
  const [addConnectorOpen, setAddConnectorOpen] = useState(false);
  const [testingConnectorId, setTestingConnectorId] = useState<string | null>(null);
  const [connectorTestResults, setConnectorTestResults] = useState<Record<string, { success: boolean; message: string }>>({});

  const handleTestConnector = async (server: MCPServer) => {
    setTestingConnectorId(server.id);
    const res = await testMCPServer(server.url, server.authHeader);
    setConnectorTestResults((prev) => ({
      ...prev,
      [server.id]: { success: res.success, message: res.message },
    }));
    setTestingConnectorId(null);
  };
  const [modelSearch, setModelSearch] = useState('');

  if (!settingsOpen) return null;

  return (
    <div className="modal-overlay" onClick={() => setSettingsOpen(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2 className="modal-title">Settings</h2>
          <button className="modal-close" onClick={() => setSettingsOpen(false)}>
            ✕
          </button>
        </div>

        <div className="modal-tabs">
          {(['general', 'skills', 'connectors', 'models', 'interface'] as SettingsTab[]).map((t) => (
            <button
              key={t}
              className={`modal-tab ${tab === t ? 'active' : ''}`}
              onClick={() => setTab(t)}
            >
              {t.charAt(0).toUpperCase() + t.slice(1)}
            </button>
          ))}
        </div>

        <div className="modal-body">
          {/* General Tab */}
          {tab === 'general' && (
            <>
              <div className="setting-group">
                <label className="setting-label">Theme</label>
                <select
                  className="setting-select"
                  value={settings.theme}
                  onChange={(e) =>
                    updateSettings({ theme: e.target.value as 'dark' | 'light' | 'system' })
                  }
                >
                  <option value="dark">Dark</option>
                  <option value="light">Light</option>
                  <option value="system">System</option>
                </select>
              </div>

              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-label">Enter to send</span>
                  <span className="setting-toggle-desc">
                    Press Enter to send messages, Shift+Enter for new line
                  </span>
                </div>
                <div
                  className={`toggle ${settings.enterToSend ? 'on' : ''}`}
                  onClick={() => updateSettings({ enterToSend: !settings.enterToSend })}
                >
                  <div className="toggle-knob" />
                </div>
              </div>
            </>
          )}

          {/* Skills Tab */}
          {tab === 'skills' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span className="setting-label" style={{ marginBottom: 0 }}>AI Skills ({skills.length})</span>
                  <div className="setting-description" style={{ marginBottom: 0 }}>
                    Kustomisasi instruksi dan persona AI khusus untuk berbagai kebutuhan.
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    className="btn btn-secondary"
                    style={{ fontSize: '0.75rem', padding: '6px 10px' }}
                    onClick={() => {
                      if (window.confirm('Kembalikan daftar skill ke bawaan awal?')) {
                        resetSkills();
                      }
                    }}
                    title="Reset daftar skill ke bawaan awal"
                  >
                    ↺ Reset Default
                  </button>
                  <button
                    className="btn btn-primary"
                    style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                    onClick={() => {
                      setSkillToEdit(null);
                      setSkillModalOpen(true);
                    }}
                  >
                    + Tambah Skill
                  </button>
                </div>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {skills.map((skill) => (
                  <div
                    key={skill.id}
                    className="model-list-item"
                    style={{ alignItems: 'flex-start', padding: '12px 0' }}
                  >
                    <span style={{ fontSize: '1.5rem', marginRight: '10px', lineHeight: 1 }}>
                      {skill.icon || '✦'}
                    </span>
                    <div className="model-list-info" style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span className="model-list-name">{skill.name}</span>
                        {skill.isCustom ? (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: 'var(--accent-primary)',
                              fontWeight: 600,
                            }}
                          >
                            Custom
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(107, 114, 128, 0.15)',
                              color: 'var(--text-tertiary)',
                              fontWeight: 600,
                            }}
                          >
                            Built-in
                          </span>
                        )}
                      </div>
                      <span className="model-list-provider" style={{ marginTop: '2px' }}>
                        {skill.description}
                      </span>
                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '0.6875rem',
                          color: 'var(--text-tertiary)',
                          background: 'var(--bg-tertiary)',
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {skill.systemPrompt}
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setSkillToEdit(skill);
                          setSkillModalOpen(true);
                        }}
                        title="Edit skill"
                      >
                        ✎
                      </button>

                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--accent-error)',
                          background: 'rgba(239, 68, 68, 0.1)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          if (window.confirm(`Hapus skill "${skill.name}"?`)) {
                            deleteSkill(skill.id);
                          }
                        }}
                        title="Hapus skill"
                      >
                        ✕
                      </button>

                      <div
                        className={`toggle ${skill.enabled ? 'on' : ''}`}
                        onClick={() => toggleSkillEnabled(skill.id)}
                        title={skill.enabled ? 'Nonaktifkan' : 'Aktifkan'}
                      >
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Connectors (MCP) Tab */}
          {tab === 'connectors' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <span className="setting-label" style={{ marginBottom: 0 }}>
                    Remote MCP Connectors ({mcpServers.length})
                  </span>
                  <div className="setting-description" style={{ marginBottom: 0 }}>
                    Hubungkan multiple remote MCP servers untuk integrasi database, APIs, dan tools internal.
                  </div>
                </div>
                <button
                  className="btn btn-primary"
                  style={{ fontSize: '0.75rem', padding: '6px 12px' }}
                  onClick={() => {
                    setConnectorToEdit(null);
                    setAddConnectorOpen(true);
                  }}
                >
                  + Add Custom Connector
                </button>
              </div>

              <div style={{ maxHeight: '340px', overflowY: 'auto' }}>
                {mcpServers.map((server) => (
                  <div
                    key={server.id}
                    className="model-list-item"
                    style={{ alignItems: 'flex-start', padding: '12px 0' }}
                  >
                    <span style={{ fontSize: '1.5rem', marginRight: '10px', lineHeight: 1 }}>
                      {server.icon || '🔌'}
                    </span>
                    <div className="model-list-info" style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                        <span className="model-list-name">{server.name}</span>
                        {server.isCustom ? (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 5px',
                              borderRadius: 'var(--radius-full)',
                              background: 'rgba(59, 130, 246, 0.15)',
                              color: 'var(--accent-primary)',
                              fontWeight: 600,
                            }}
                          >
                            Custom
                          </span>
                        ) : (
                          <span
                            style={{
                              fontSize: '0.625rem',
                              padding: '1px 5px',
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
                            color: server.enabled ? 'var(--accent-success)' : 'var(--text-tertiary)',
                            fontWeight: 500,
                          }}
                        >
                          {server.enabled ? '● Connected' : '○ Disconnected'}
                        </span>
                      </div>
                      <span className="model-list-provider" style={{ marginTop: '2px' }}>
                        {server.description}
                      </span>
                      <div
                        style={{
                          marginTop: '4px',
                          fontSize: '0.6875rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-tertiary)',
                          padding: '3px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontFamily: 'var(--font-mono)',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {server.url}
                      </div>

                      {connectorTestResults[server.id] && (
                        <div
                          style={{
                            marginTop: '6px',
                            padding: '3px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.6875rem',
                            background: connectorTestResults[server.id].success
                              ? 'rgba(16, 185, 129, 0.15)'
                              : 'rgba(239, 68, 68, 0.15)',
                            color: connectorTestResults[server.id].success
                              ? 'var(--accent-success)'
                              : 'var(--accent-error)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            fontWeight: 500,
                          }}
                        >
                          <span>{connectorTestResults[server.id].success ? '✓' : '✗'}</span>
                          <span>{connectorTestResults[server.id].message}</span>
                        </div>
                      )}
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '3px',
                        }}
                        onClick={() => handleTestConnector(server)}
                        disabled={testingConnectorId === server.id}
                        title="Uji koneksi ke endpoint MCP ini"
                      >
                        <span>{testingConnectorId === server.id ? '⏳' : '⚡'}</span>
                        <span>Test</span>
                      </button>

                      <button
                        style={{
                          padding: '4px 8px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)',
                          background: 'var(--bg-tertiary)',
                          cursor: 'pointer',
                        }}
                        onClick={() => {
                          setConnectorToEdit(server);
                          setAddConnectorOpen(true);
                        }}
                        title="Edit / Modifikasi connector"
                      >
                        ✎
                      </button>

                      {server.isCustom && (
                        <button
                          style={{
                            padding: '4px 8px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            color: 'var(--accent-error)',
                            background: 'rgba(239, 68, 68, 0.1)',
                            cursor: 'pointer',
                          }}
                          onClick={() => {
                            if (window.confirm(`Hapus custom connector "${server.name}"?`)) {
                              deleteMCPServer(server.id);
                            }
                          }}
                          title="Hapus connector"
                        >
                          ✕
                        </button>
                      )}

                      <button
                        className={`btn ${server.enabled ? 'btn-secondary' : 'btn-primary'}`}
                        style={{
                          padding: '4px 10px',
                          fontSize: '0.75rem',
                          minWidth: '82px',
                        }}
                        onClick={() => toggleMCPServer(server.id)}
                      >
                        {server.enabled ? 'Disconnect' : 'Connect'}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Models Tab */}
          {tab === 'models' && (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div>
                  <span className="setting-label" style={{ marginBottom: 0 }}>Available Models ({models.length})</span>
                  <div className="setting-description" style={{ marginBottom: 0 }}>
                    {modelsSource === 'api' ? 'Discovered dynamically from configured Base URL' : 'Using default mock models'}
                  </div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      fontSize: '0.6875rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      background: modelsSource === 'api' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                      color: modelsSource === 'api' ? 'var(--accent-success)' : 'var(--text-tertiary)',
                      fontWeight: 600,
                    }}
                  >
                    {modelsSource === 'api' ? 'LIVE API' : 'MOCK'}
                  </span>
                  <button
                    className="btn btn-secondary"
                    style={{ padding: '4px 10px', fontSize: '0.75rem' }}
                    onClick={() => fetchModels()}
                    disabled={isLoadingModels || !apiConfig.baseUrl}
                  >
                    {isLoadingModels ? 'Loading...' : '↻ Reload Models'}
                  </button>
                </div>
              </div>

              {modelsError && (
                <div className="connection-status error" style={{ margin: '8px 0 12px' }}>
                  <span>⚠ {modelsError} (showing fallback models)</span>
                </div>
              )}

              {models.length > 5 && (
                <input
                  type="text"
                  className="setting-input"
                  placeholder="Filter models by name, id, or provider..."
                  value={modelSearch}
                  onChange={(e) => setModelSearch(e.target.value)}
                  style={{ marginBottom: '12px', fontSize: '0.8125rem' }}
                />
              )}

              <div style={{ maxHeight: '320px', overflowY: 'auto' }}>
                {models
                  .filter((m) =>
                    modelSearch.trim()
                      ? m.name.toLowerCase().includes(modelSearch.toLowerCase()) ||
                        m.id.toLowerCase().includes(modelSearch.toLowerCase()) ||
                        m.provider.toLowerCase().includes(modelSearch.toLowerCase())
                      : true
                  )
                  .map((model) => (
                    <div key={model.id} className="model-list-item">
                      <div className="model-list-info" style={{ flex: 1, minWidth: 0, paddingRight: '12px' }}>
                        <span className="model-list-name" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {model.name}
                        </span>
                        <span className="model-list-provider" style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          <strong style={{ color: 'var(--text-secondary)' }}>{model.provider}</strong> · <code style={{ fontSize: '0.6875rem' }}>{model.id}</code>
                          {model.description ? ` · ${model.description}` : ''}
                        </span>
                      </div>
                      <div
                        className={`toggle ${model.enabled ? 'on' : ''}`}
                        onClick={() => toggleModelEnabled(model.id)}
                        title={model.enabled ? 'Click to disable' : 'Click to enable'}
                      >
                        <div className="toggle-knob" />
                      </div>
                    </div>
                  ))}
              </div>
            </>
          )}

          {/* Interface Tab */}
          {tab === 'interface' && (
            <>
              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-label">Compact mode</span>
                  <span className="setting-toggle-desc">
                    Reduce spacing between messages
                  </span>
                </div>
                <div
                  className={`toggle ${settings.compactMode ? 'on' : ''}`}
                  onClick={() =>
                    updateSettings({ compactMode: !settings.compactMode })
                  }
                >
                  <div className="toggle-knob" />
                </div>
              </div>

              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-label">
                    Show message metadata
                  </span>
                  <span className="setting-toggle-desc">
                    Display model and response time below assistant messages
                  </span>
                </div>
                <div
                  className={`toggle ${settings.showMessageMetadata ? 'on' : ''}`}
                  onClick={() =>
                    updateSettings({
                      showMessageMetadata: !settings.showMessageMetadata,
                    })
                  }
                >
                  <div className="toggle-knob" />
                </div>
              </div>

              <div className="setting-toggle-row">
                <div className="setting-toggle-info">
                  <span className="setting-toggle-label">Show tool activity</span>
                  <span className="setting-toggle-desc">
                    Display MCP tool execution indicators during generation
                  </span>
                </div>
                <div
                  className={`toggle ${settings.showToolActivity ? 'on' : ''}`}
                  onClick={() =>
                    updateSettings({
                      showToolActivity: !settings.showToolActivity,
                    })
                  }
                >
                  <div className="toggle-knob" />
                </div>
              </div>
            </>
          )}
        </div>
      </div>

      {skillModalOpen && (
        <SkillModal
          skillToEdit={skillToEdit}
          onClose={() => {
            setSkillModalOpen(false);
            setSkillToEdit(null);
          }}
        />
      )}

      {addConnectorOpen && (
        <AddConnectorModal
          connectorToEdit={connectorToEdit}
          onClose={() => {
            setAddConnectorOpen(false);
            setConnectorToEdit(null);
          }}
        />
      )}
    </div>
  );
};
