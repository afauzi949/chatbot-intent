import React, { useState, useRef, useEffect } from 'react';
import { useConfig } from '../../store/ConfigContext';

interface Props {
  onOpenNewSkillModal: () => void;
}

export const SkillSelector: React.FC<Props> = ({ onOpenNewSkillModal }) => {
  const { skills, selectedSkillId, setSelectedSkillId } = useConfig();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const activeSkill = skills.find((s) => s.id === selectedSkillId) || skills[0];
  const enabledSkills = skills.filter((s) => s.enabled);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
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
        title={activeSkill ? `Skill: ${activeSkill.name}` : 'Pilih Skill'}
        style={{ gap: '6px' }}
      >
        <span>{activeSkill?.icon || '✦'}</span>
        <span style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {activeSkill?.name || 'Pilih Skill'}
        </span>
        <span style={{ fontSize: '10px' }}>▾</span>
      </button>

      {open && (
        <div className="popover" style={{ minWidth: '300px', maxWidth: '380px' }}>
          <div style={{ padding: '6px 8px 8px', borderBottom: '1px solid var(--border-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Pilih Active Skill ({enabledSkills.length})
            </span>
            <button
              style={{
                fontSize: '0.75rem',
                color: 'var(--accent-primary)',
                fontWeight: 500,
                cursor: 'pointer',
              }}
              onClick={() => {
                setOpen(false);
                onOpenNewSkillModal();
              }}
            >
              + Buat Skill
            </button>
          </div>

          <div style={{ maxHeight: '260px', overflowY: 'auto' }}>
            {enabledSkills.map((skill) => (
              <div
                key={skill.id}
                className={`popover-item ${skill.id === selectedSkillId ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedSkillId(skill.id);
                  setOpen(false);
                }}
                style={{ padding: '10px' }}
              >
                <span style={{ fontSize: '1.25rem', lineHeight: 1 }}>{skill.icon || '✦'}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div
                    className="popover-item-name"
                    style={{
                      fontWeight: skill.id === selectedSkillId ? 600 : 500,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                    }}
                  >
                    <span>{skill.name}</span>
                    {skill.isCustom && (
                      <span
                        style={{
                          fontSize: '0.625rem',
                          padding: '1px 5px',
                          borderRadius: 'var(--radius-full)',
                          background: 'rgba(59, 130, 246, 0.15)',
                          color: 'var(--accent-primary)',
                        }}
                      >
                        Custom
                      </span>
                    )}
                  </div>
                  {skill.description && (
                    <div
                      className="popover-item-desc"
                      style={{
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                        marginTop: '2px',
                      }}
                    >
                      {skill.description}
                    </div>
                  )}
                </div>
                {skill.id === selectedSkillId && (
                  <span className="popover-item-check" style={{ marginLeft: '6px' }}>✓</span>
                )}
              </div>
            ))}
          </div>

          <div style={{ padding: '8px', borderTop: '1px solid var(--border-secondary)', background: 'var(--bg-tertiary)' }}>
            <button
              className="btn btn-secondary"
              style={{ width: '100%', fontSize: '0.75rem', padding: '6px 12px' }}
              onClick={() => {
                setOpen(false);
                onOpenNewSkillModal();
              }}
            >
              + Tambah Skill Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
