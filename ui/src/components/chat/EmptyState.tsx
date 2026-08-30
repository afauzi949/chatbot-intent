import React from 'react';
import { useConfig } from '../../store/ConfigContext';

interface Props {
  content?: string;
  onSuggestionClick: (text: string) => void;
}

const suggestions = [
  'Cari wisata pantai di Banggai Kepulauan',
  'Cek transaksi dengan RRN 123456789012',
  'Informasi rute dan penginapan Bangkep',
  'Bantu buat dataset intent Rasa NLU',
];

export const EmptyState: React.FC<Props> = ({ onSuggestionClick }) => {
  const { skills, selectedSkillId, setSkillsModalOpen } = useConfig();
  const activeSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];

  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>
        {activeSkill?.icon || '✦'}
      </div>
      <div>
        <h1 className="empty-state-title" style={{ marginBottom: '6px' }}>
          {activeSkill?.name || 'How can I help?'}
        </h1>
        <p className="empty-state-subtitle">
          {activeSkill?.description ||
            'Ask a question, explore an idea, or start working with your AI assistant.'}
        </p>
      </div>

      <div className="empty-state-suggestions">
        {suggestions.map((s) => (
          <button
            key={s}
            className="suggestion-chip"
            onClick={() => onSuggestionClick(s)}
          >
            {s}
          </button>
        ))}
      </div>

      <div style={{ marginTop: '8px' }}>
        <button
          style={{
            fontSize: '0.75rem',
            color: 'var(--text-tertiary)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: 'var(--radius-full)',
            border: '1px dashed var(--border-primary)',
            background: 'transparent',
            cursor: 'pointer',
            transition: 'all var(--transition-fast)',
          }}
          onClick={() => setSkillsModalOpen(true)}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = 'var(--accent-primary)';
            e.currentTarget.style.color = 'var(--text-primary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = 'var(--border-primary)';
            e.currentTarget.style.color = 'var(--text-tertiary)';
          }}
        >
          <span>✦</span>
          <span>Kustomisasi atau Tambah Skill Baru</span>
        </button>
      </div>
    </div>
  );
};
