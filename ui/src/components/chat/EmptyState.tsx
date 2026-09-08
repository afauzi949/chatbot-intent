import React from 'react';
import { useConfig } from '../../store/ConfigContext';

interface Props {
  content?: string;
  onSuggestionClick: (text: string) => void;
}

const defaultSuggestions = [
  'Jelaskan konsep dasar NLP dan intent classification',
  'Bantu review dan berikan saran perbaikan kode',
  'Buat draf pesan profesional untuk kebutuhan kerja',
  'Ringkas dan jelaskan poin penting dari suatu topik',
];

export const EmptyState: React.FC<Props> = ({ onSuggestionClick }) => {
  const { skills, selectedSkillId, setSkillsModalOpen, models, selectedModelId } = useConfig();
  const activeSkill = skills.find((s) => s.id === selectedSkillId) || null;
  const currentModel = models.find((m) => m.id === selectedModelId);

  return (
    <div className="empty-state">
      <div className="empty-state-icon" style={{ fontSize: '2rem' }}>
        {activeSkill ? (activeSkill.icon || '✦') : '🤖'}
      </div>
      <div>
        <h1 className="empty-state-title" style={{ marginBottom: '6px' }}>
          {activeSkill
            ? activeSkill.name
            : currentModel?.name
            ? `Chat dengan ${currentModel.name}`
            : 'How can I help you today?'}
        </h1>
        <p className="empty-state-subtitle">
          {activeSkill
            ? activeSkill.description || 'Ask a question, explore an idea, or start working with your AI assistant.'
            : 'Pesan akan langsung diteruskan ke Agent AI sesuai model yang dipilih (tanpa batasan skill).'}
        </p>
      </div>

      <div className="empty-state-suggestions">
        {defaultSuggestions.map((s) => (
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
