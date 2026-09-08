import React, { useState, useEffect } from 'react';
import type { Skill } from '../../types';
import { useConfig } from '../../store/ConfigContext';

interface Props {
  skillToEdit?: Skill | null;
  onClose: () => void;
}

const EMOJI_PRESETS = ['✦', '🏝️', '💳', '🧠', '💻', '📊', '✍️', '⚡', '🔍', '🛡️', '🎓', '🌐'];

export const SkillModal: React.FC<Props> = ({ skillToEdit, onClose }) => {
  const { addSkill, updateSkill, deleteSkill } = useConfig();

  const [name, setName] = useState('');
  const [icon, setIcon] = useState('✦');
  const [description, setDescription] = useState('');
  const [systemPrompt, setSystemPrompt] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (skillToEdit) {
      setName(skillToEdit.name);
      setIcon(skillToEdit.icon || '✦');
      setDescription(skillToEdit.description);
      setSystemPrompt(skillToEdit.systemPrompt);
    } else {
      setName('');
      setIcon('✦');
      setDescription('');
      setSystemPrompt('');
    }
  }, [skillToEdit]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Nama skill wajib diisi');
      return;
    }
    if (!systemPrompt.trim()) {
      setError('System Prompt / Instruksi skill wajib diisi');
      return;
    }

    if (skillToEdit) {
      updateSkill(skillToEdit.id, {
        name: name.trim(),
        icon: icon.trim() || '✦',
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
      });
    } else {
      addSkill({
        name: name.trim(),
        icon: icon.trim() || '✦',
        description: description.trim(),
        systemPrompt: systemPrompt.trim(),
        enabled: true,
      });
    }

    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
        <div className="modal-header">
          <h2 className="modal-title">
            {skillToEdit ? 'Edit AI Skill' : 'Tambah Skill Baru'}
          </h2>
          <button className="modal-close" onClick={onClose}>
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
          <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {error && (
              <div className="connection-status error" style={{ margin: 0 }}>
                <span>⚠ {error}</span>
              </div>
            )}

            {/* Icon / Emoji */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label">Icon / Emoji</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <input
                  type="text"
                  className="setting-input"
                  value={icon}
                  onChange={(e) => setIcon(e.target.value)}
                  maxLength={4}
                  style={{ width: '60px', textAlign: 'center', fontSize: '1.25rem' }}
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

            {/* Skill Name */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label">Nama Skill *</label>
              <input
                type="text"
                className="setting-input"
                placeholder="Contoh: Analis Sentimen, Pemandu Wisata..."
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setError('');
                }}
                autoFocus
              />
            </div>

            {/* Description */}
            <div className="setting-group" style={{ marginBottom: 0 }}>
              <label className="setting-label">Deskripsi Singkat</label>
              <input
                type="text"
                className="setting-input"
                placeholder="Contoh: Menjawab seputar kuliner dan akomodasi lokal"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>

            {/* System Prompt */}
            <div className="setting-group" style={{ marginBottom: 0, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <label className="setting-label">
                System Prompt / Instruksi Khusus *
              </label>
              <div className="setting-description" style={{ marginBottom: '6px' }}>
                Instruksikan persona, peran, batasan, atau gaya bicara yang harus dipatuhi AI saat skill ini aktif.
              </div>
              <textarea
                className="setting-input"
                style={{
                  minHeight: '120px',
                  fontFamily: 'var(--font-mono)',
                  fontSize: '0.8125rem',
                  lineHeight: '1.5',
                  resize: 'vertical',
                }}
                placeholder="Contoh: Anda adalah asisten ahli pariwisata Banggai Kepulauan. Fokuskan jawaban pada detail rute, estimasi biaya, dan rekomendasi pantai terbaik..."
                value={systemPrompt}
                onChange={(e) => {
                  setSystemPrompt(e.target.value);
                  setError('');
                }}
              />
            </div>
          </div>

          <div style={{ padding: '16px 24px', borderTop: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
            {skillToEdit ? (
              <button
                type="button"
                className="btn"
                style={{
                  color: 'var(--accent-error)',
                  background: 'rgba(239, 68, 68, 0.1)',
                  border: '1px solid rgba(239, 68, 68, 0.2)',
                  fontSize: '0.8125rem',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                }}
                onClick={() => {
                  if (window.confirm(`Hapus skill "${skillToEdit.name}"?`)) {
                    deleteSkill(skillToEdit.id);
                    onClose();
                  }
                }}
              >
                <span>🗑</span>
                <span>Hapus Skill</span>
              </button>
            ) : <div />}

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="btn btn-secondary" onClick={onClose}>
                Batal
              </button>
              <button type="submit" className="btn btn-primary">
                {skillToEdit ? 'Simpan Perubahan' : 'Buat Skill'}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
