import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import type { AIModel, MCPTool, MCPServer, Intent, Skill, APIConfiguration, AppSettings } from '../types';
import { mockModels } from '../lib/mock/models';
import { mockMCPTools } from '../lib/mock/mcp';
import { mockIntents } from '../lib/mock/intents';
import { loadApiConfiguration, saveApiConfiguration as saveConfig } from '../lib/api/config';
import { getModels } from '../lib/api/models';
import { loadSkills, saveSkills, createSkill, resetSkillsToDefault } from '../lib/api/skills';
import { loadMCPServers, saveMCPServers, createMCPServer } from '../lib/api/mcp';

interface ConfigContextValue {
  // Models
  models: AIModel[];
  selectedModelId: string;
  setSelectedModelId: (id: string) => void;
  toggleModelEnabled: (id: string) => void;
  modelsSource: 'api' | 'mock';
  isLoadingModels: boolean;
  modelsError: string | null;
  fetchModels: (customBaseUrl?: string, customApiKey?: string) => Promise<void>;

  // Skills
  skills: Skill[];
  selectedSkillId: string | null;
  setSelectedSkillId: (id: string | null) => void;
  addSkill: (input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>) => Skill;
  updateSkill: (id: string, patch: Partial<Skill>) => void;
  deleteSkill: (id: string) => void;
  resetSkills: () => void;
  toggleSkillEnabled: (id: string) => void;
  skillsModalOpen: boolean;
  setSkillsModalOpen: (open: boolean) => void;

  // MCP Servers & Connectors (Multi-Server)
  mcpServers: MCPServer[];
  addMCPServer: (input: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt' | 'isCustom' | 'status'>) => MCPServer;
  updateMCPServer: (id: string, patch: Partial<MCPServer>) => void;
  deleteMCPServer: (id: string) => void;
  toggleMCPServer: (id: string) => void;
  connectorsModalOpen: boolean;
  setConnectorsModalOpen: (open: boolean) => void;

  // Legacy MCP Tools
  mcpTools: MCPTool[];
  toggleMCPTool: (id: string) => void;

  // Intent
  intents: Intent[];
  selectedIntentId: string;
  setSelectedIntentId: (id: string) => void;

  // API Config
  apiConfig: APIConfiguration;
  saveApiConfiguration: (config: APIConfiguration) => void;

  // Settings
  settings: AppSettings;
  updateSettings: (patch: Partial<AppSettings>) => void;

  // Theme
  resolvedTheme: 'dark' | 'light';

  // Sidebar
  sidebarOpen: boolean;
  setSidebarOpen: (open: boolean) => void;

  // Settings panel
  settingsOpen: boolean;
  setSettingsOpen: (open: boolean) => void;
}

const SETTINGS_KEY = 'chatbot-settings';

function loadSettings(): AppSettings {
  try {
    const stored = localStorage.getItem(SETTINGS_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // Ignore
  }
  return {
    theme: 'dark',
    enterToSend: true,
    compactMode: false,
    showMessageMetadata: true,
    showToolActivity: true,
  };
}

const ConfigContext = createContext<ConfigContextValue | null>(null);

export function ConfigProvider({ children }: { children: React.ReactNode }) {
  const [apiConfig, setApiConfig] = useState<APIConfiguration>(loadApiConfiguration);
  const [selectedModelId, setSelectedModelId] = useState(
    () => loadApiConfiguration().defaultModelId || 'gemini-3.7-flash'
  );
  const [models, setModels] = useState<AIModel[]>(mockModels);
  const [modelsSource, setModelsSource] = useState<'api' | 'mock'>('mock');
  const [isLoadingModels, setIsLoadingModels] = useState(false);
  const [modelsError, setModelsError] = useState<string | null>(null);

  // Skills state
  const [skills, setSkills] = useState<Skill[]>(loadSkills);
  const [selectedSkillId, setSelectedSkillId] = useState<string | null>(null);
  const [skillsModalOpen, setSkillsModalOpen] = useState(false);

  // MCP Servers state (Multiple MCPs)
  const [mcpServers, setMcpServers] = useState<MCPServer[]>(loadMCPServers);
  const [connectorsModalOpen, setConnectorsModalOpen] = useState(false);

  const [mcpTools, setMcpTools] = useState<MCPTool[]>(mockMCPTools);
  const [intents] = useState<Intent[]>(mockIntents);
  const [selectedIntentId, setSelectedIntentId] = useState('auto');
  const [settings, setSettings] = useState<AppSettings>(loadSettings);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Fetch models dynamically from API
  const fetchModels = useCallback(async (customBaseUrl?: string, customApiKey?: string) => {
    const url = customBaseUrl ?? apiConfig.baseUrl;
    const key = customApiKey ?? apiConfig.apiKey;
    if (!url) return;

    setIsLoadingModels(true);
    setModelsError(null);

    try {
      const result = await getModels(url, key);
      setModels(result.models);
      setModelsSource(result.source);
      if (result.error) {
        setModelsError(result.error);
      }

      // Auto-select valid model
      setSelectedModelId((prevId) => {
        const exists = result.models.some((m) => m.id === prevId);
        if (exists) return prevId;
        const defaultMatch = result.models.find(
          (m) => m.id === apiConfig.defaultModelId || m.id.toLowerCase().includes(apiConfig.defaultModelId.toLowerCase())
        );
        if (defaultMatch) return defaultMatch.id;
        return result.models[0]?.id || prevId;
      });
    } catch (err: any) {
      setModelsError(err.message || 'Failed to fetch models');
    } finally {
      setIsLoadingModels(false);
    }
  }, [apiConfig.baseUrl, apiConfig.apiKey, apiConfig.defaultModelId]);

  // Initial fetch on mount if Base URL is configured
  useEffect(() => {
    if (apiConfig.baseUrl) {
      fetchModels();
    }
  }, [fetchModels, apiConfig.baseUrl]);

  // Skill actions
  const addSkill = useCallback(
    (input: Omit<Skill, 'id' | 'createdAt' | 'updatedAt' | 'isCustom'>) => {
      const newSkill = createSkill(input);
      setSkills((prev) => {
        const next = [newSkill, ...prev];
        saveSkills(next);
        return next;
      });
      setSelectedSkillId(newSkill.id);
      return newSkill;
    },
    []
  );

  const updateSkill = useCallback((id: string, patch: Partial<Skill>) => {
    setSkills((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
      );
      saveSkills(next);
      return next;
    });
  }, []);

  const deleteSkill = useCallback(
    (id: string) => {
      setSkills((prev) => {
        const next = prev.filter((s) => s.id !== id);
        saveSkills(next);
        return next;
      });
      setSelectedSkillId((prev) => (prev === id ? null : prev));
    },
    []
  );

  const resetSkills = useCallback(() => {
    const defs = resetSkillsToDefault();
    setSkills(defs);
    setSelectedSkillId(null);
  }, []);

  const toggleSkillEnabled = useCallback((id: string) => {
    setSkills((prev) => {
      const next = prev.map((s) => (s.id === id ? { ...s, enabled: !s.enabled } : s));
      saveSkills(next);
      return next;
    });
  }, []);

  // MCP Server actions (Multi-server)
  const addMCPServer = useCallback(
    (input: Omit<MCPServer, 'id' | 'createdAt' | 'updatedAt' | 'isCustom' | 'status'>) => {
      const newServer = createMCPServer(input);
      setMcpServers((prev) => {
        const next = [newServer, ...prev];
        saveMCPServers(next);
        return next;
      });
      return newServer;
    },
    []
  );

  const updateMCPServer = useCallback((id: string, patch: Partial<MCPServer>) => {
    setMcpServers((prev) => {
      const next = prev.map((s) =>
        s.id === id ? { ...s, ...patch, updatedAt: new Date().toISOString() } : s
      );
      saveMCPServers(next);
      return next;
    });
  }, []);

  const deleteMCPServer = useCallback((id: string) => {
    setMcpServers((prev) => {
      const next = prev.filter((s) => s.id !== id);
      saveMCPServers(next);
      return next;
    });
  }, []);

  const toggleMCPServer = useCallback((id: string) => {
    setMcpServers((prev) => {
      const next = prev.map((s) =>
        s.id === id
          ? {
              ...s,
              enabled: !s.enabled,
              status: !s.enabled ? ('connected' as const) : ('disconnected' as const),
            }
          : s
      );
      saveMCPServers(next);
      return next;
    });
  }, []);

  // Resolve theme
  const resolvedTheme = settings.theme === 'system'
    ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : settings.theme;

  // Apply theme to document
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', resolvedTheme);
  }, [resolvedTheme]);

  const toggleModelEnabled = useCallback((id: string) => {
    setModels((prev) =>
      prev.map((m) => (m.id === id ? { ...m, enabled: !m.enabled } : m))
    );
  }, []);

  const toggleMCPTool = useCallback((id: string) => {
    setMcpTools((prev) =>
      prev.map((t) => (t.id === id ? { ...t, enabled: !t.enabled } : t))
    );
  }, []);

  const saveApiConfiguration = useCallback((config: APIConfiguration) => {
    setApiConfig(config);
    saveConfig(config);
    if (config.baseUrl) {
      fetchModels(config.baseUrl, config.apiKey);
    }
  }, [fetchModels]);

  const updateSettings = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const next = { ...prev, ...patch };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const value: ConfigContextValue = {
    models,
    selectedModelId,
    setSelectedModelId,
    toggleModelEnabled,
    modelsSource,
    isLoadingModels,
    modelsError,
    fetchModels,
    skills,
    selectedSkillId,
    setSelectedSkillId,
    addSkill,
    updateSkill,
    deleteSkill,
    resetSkills,
    toggleSkillEnabled,
    skillsModalOpen,
    setSkillsModalOpen,
    mcpServers,
    addMCPServer,
    updateMCPServer,
    deleteMCPServer,
    toggleMCPServer,
    connectorsModalOpen,
    setConnectorsModalOpen,
    mcpTools,
    toggleMCPTool,
    intents,
    selectedIntentId,
    setSelectedIntentId,
    apiConfig,
    saveApiConfiguration,
    settings,
    updateSettings,
    resolvedTheme,
    sidebarOpen,
    setSidebarOpen,
    settingsOpen,
    setSettingsOpen,
  };

  return <ConfigContext.Provider value={value}>{children}</ConfigContext.Provider>;
}

export function useConfig(): ConfigContextValue {
  const ctx = useContext(ConfigContext);
  if (!ctx) throw new Error('useConfig must be used within ConfigProvider');
  return ctx;
}
