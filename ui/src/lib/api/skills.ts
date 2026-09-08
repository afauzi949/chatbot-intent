import type { Skill } from '../../types';
import { defaultSkills } from '../mock/skills';

const SKILLS_STORAGE_KEY = 'chatbot-custom-skills';

export function loadSkills(): Skill[] {
  try {
    const stored = localStorage.getItem(SKILLS_STORAGE_KEY);
    if (stored) {
      const skills = JSON.parse(stored);
      if (Array.isArray(skills)) {
        return skills;
      }
    }
  } catch (err) {
    console.error('Failed to parse skills from localStorage:', err);
  }
  return defaultSkills;
}

export function resetSkillsToDefault(): Skill[] {
  saveSkills(defaultSkills);
  return defaultSkills;
}

export function saveSkills(skills: Skill[]): void {
  try {
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skills));
  } catch (err) {
    console.error('Failed to save skills to localStorage:', err);
  }
}

export function createSkill(
  input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>
): Skill {
  const now = new Date().toISOString();
  const newSkill: Skill = {
    id: `skill-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    ...input,
    isCustom: true,
    createdAt: now,
    updatedAt: now,
  };
  return newSkill;
}
