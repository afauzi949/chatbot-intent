import React, { useEffect } from 'react';
import { ChatProvider, useChat } from './store/ChatContext';
import { ConfigProvider, useConfig } from './store/ConfigContext';
import { ConversationSidebar } from './components/sidebar/ConversationSidebar';
import { ChatHeader } from './components/chat/ChatHeader';
import { ChatMessages } from './components/chat/ChatMessages';
import { MessageComposer } from './components/chat/MessageComposer';
import { SettingsPanel } from './components/settings/SettingsPanel';
import { SkillModal } from './components/skill/SkillModal';
import { ConnectorsModal } from './components/mcp/ConnectorsModal';

const ChatApp: React.FC = () => {
  const { createConversation, stopGeneration } = useChat();
  const {
    setSidebarOpen,
    skillsModalOpen,
    setSkillsModalOpen,
    connectorsModalOpen,
    setConnectorsModalOpen,
    selectedModelId,
  } = useConfig();

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      // Ctrl/Cmd + N — New chat
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        createConversation(undefined, selectedModelId);
      }

      // Ctrl/Cmd + K — Focus search
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSidebarOpen(true);
        // Focus the search input
        setTimeout(() => {
          const input = document.querySelector('.sidebar-search input') as HTMLInputElement;
          input?.focus();
        }, 100);
      }

      // Esc — Stop generation
      if (e.key === 'Escape') {
        stopGeneration();
      }
    };

    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [createConversation, stopGeneration, setSidebarOpen]);

  return (
    <div className="app-layout">
      <ConversationSidebar />
      <main className="chat-area">
        <ChatHeader />
        <ChatMessages />
        <MessageComposer />
      </main>
      <SettingsPanel />
      {skillsModalOpen && (
        <SkillModal onClose={() => setSkillsModalOpen(false)} />
      )}
      {connectorsModalOpen && (
        <ConnectorsModal onClose={() => setConnectorsModalOpen(false)} />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ConfigProvider>
      <ChatProvider>
        <ChatApp />
      </ChatProvider>
    </ConfigProvider>
  );
};

export default App;
