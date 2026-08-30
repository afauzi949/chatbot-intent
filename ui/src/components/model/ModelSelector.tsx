import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../../store/ConfigContext';
import { groupModelsByProvider } from '../../lib/api/models';

export const ModelSelector: React.FC = () => {
  const {
    models,
    selectedModelId,
    setSelectedModelId,
    modelsSource,
    isLoadingModels,
    modelsError,
    fetchModels,
    apiConfig,
  } = useConfig();

  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  const selectedModel = models.find((m) => m.id === selectedModelId);
  const enabledModels = models.filter((m) => m.enabled);

  const filteredModels = search.trim()
    ? enabledModels.filter(
        (m) =>
          m.name.toLowerCase().includes(search.toLowerCase()) ||
          m.id.toLowerCase().includes(search.toLowerCase()) ||
          m.provider.toLowerCase().includes(search.toLowerCase())
      )
    : enabledModels;

  const grouped = groupModelsByProvider(filteredModels);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="popover-wrapper" ref={ref}>
      <button
        className="popover-trigger"
        onClick={() => setOpen(!open)}
        title={selectedModel ? `${selectedModel.name} (${selectedModel.id})` : 'Select Model'}
      >
        <span style={{ maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {selectedModel?.name || 'Select Model'}
        </span>
        {isLoadingModels ? (
          <span style={{ fontSize: '11px', animation: 'spin 1s linear infinite', display: 'inline-block' }}>
            ◌
          </span>
        ) : (
          <span style={{ fontSize: '10px' }}>▾</span>
        )}
      </button>

      {open && (
        <div className="popover" style={{ minWidth: '280px', maxWidth: '360px' }}>
          {/* Header with Search and Refresh */}
          <div style={{ padding: '6px 8px 8px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                Select AI Model
              </span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span
                  style={{
                    fontSize: '0.625rem',
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-full)',
                    background: modelsSource === 'api' ? 'rgba(16, 185, 129, 0.15)' : 'rgba(107, 114, 128, 0.15)',
                    color: modelsSource === 'api' ? 'var(--accent-success)' : 'var(--text-tertiary)',
                    fontWeight: 600,
                  }}
                >
                  {modelsSource === 'api' ? 'LIVE API' : 'MOCK'}
                </span>
                <button
                  style={{
                    padding: '2px 6px',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)',
                    cursor: 'pointer',
                  }}
                  onClick={() => fetchModels()}
                  disabled={isLoadingModels || !apiConfig.baseUrl}
                  title={apiConfig.baseUrl ? 'Refresh models from API' : 'Configure Base URL first'}
                >
                  {isLoadingModels ? '◌' : '↻'}
                </button>
              </div>
            </div>

            {/* Search filter if more than 4 models */}
            {enabledModels.length > 4 && (
              <input
                type="text"
                placeholder="Search models..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                autoFocus
                style={{
                  width: '100%',
                  padding: '6px 8px',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-primary)',
                  background: 'var(--bg-tertiary)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)',
                  outline: 'none',
                }}
              />
            )}
          </div>

          {/* Error notice if API fetch failed */}
          {modelsError && (
            <div
              style={{
                margin: '6px 8px',
                padding: '6px 8px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(239, 68, 68, 0.1)',
                color: 'var(--accent-error)',
                fontSize: '0.6875rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <span>Error loading from API: using fallback</span>
              <button
                style={{ color: 'var(--accent-primary)', textDecoration: 'underline', cursor: 'pointer', fontSize: '0.6875rem' }}
                onClick={() => fetchModels()}
              >
                Retry
              </button>
            </div>
          )}

          {/* Model items grouped by provider */}
          <div style={{ maxHeight: '280px', overflowY: 'auto' }}>
            {Object.keys(grouped).length === 0 ? (
              <div style={{ padding: '16px', textAlign: 'center', color: 'var(--text-tertiary)', fontSize: '0.75rem' }}>
                No models found
              </div>
            ) : (
              Object.entries(grouped).map(([provider, providerModels]) => (
                <React.Fragment key={provider}>
                  <div className="popover-group-label" style={{ position: 'sticky', top: 0, background: 'var(--bg-elevated)', zIndex: 1 }}>
                    {provider} ({providerModels.length})
                  </div>
                  {providerModels.map((model) => (
                    <div
                      key={model.id}
                      className={`popover-item ${model.id === selectedModelId ? 'selected' : ''}`}
                      onClick={() => {
                        setSelectedModelId(model.id);
                        setOpen(false);
                        setSearch('');
                      }}
                    >
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div
                          className="popover-item-name"
                          style={{
                            fontWeight: model.id === selectedModelId ? 600 : 400,
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                          }}
                        >
                          {model.name}
                        </div>
                        <div
                          className="popover-item-desc"
                          style={{
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                            fontFamily: 'var(--font-mono)',
                            fontSize: '0.6875rem',
                          }}
                        >
                          {model.id}
                        </div>
                      </div>
                      {model.id === selectedModelId && (
                        <span className="popover-item-check" style={{ marginLeft: '6px' }}>✓</span>
                      )}
                    </div>
                  ))}
                </React.Fragment>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
