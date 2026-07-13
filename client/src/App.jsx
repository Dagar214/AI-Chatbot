import { useState, useEffect } from "react";
import Sidebar from "./components/Sidebar.jsx";
import ChatArea from "./components/ChatArea.jsx";
import {
  loadConversations,
  saveConversations,
  createConversation,
} from "./utils/chatStorage.js";

function App() {
  const initial = loadConversations();
  const [conversations, setConversations] = useState(initial.conversations);
  const [activeId, setActiveId] = useState(initial.activeId);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Persist to localStorage any time the conversations or active
  // selection change, so everything survives a refresh.
  useEffect(() => {
    saveConversations(conversations, activeId);
  }, [conversations, activeId]);

  const activeConversation =
    conversations.find((c) => c.id === activeId) || conversations[0];

  const handleNewChat = () => {
    const conv = createConversation();
    setConversations((prev) => [conv, ...prev]);
    setActiveId(conv.id);
    setSidebarOpen(false);
  };

  const handleSelectConversation = (id) => {
    setActiveId(id);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = (id) => {
    setConversations((prev) => {
      const filtered = prev.filter((c) => c.id !== id);

      if (filtered.length === 0) {
        const fresh = createConversation();
        setActiveId(fresh.id);
        return [fresh];
      }

      if (id === activeId) setActiveId(filtered[0].id);
      return filtered;
    });
  };

  // Passed down to ChatArea so it can update only the active
  // conversation (add messages, set a title) without touching the rest.
  const updateActiveConversation = (updater) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === activeId ? updater(c) : c))
    );
  };

  return (
    <div className="app-shell">
      <div className="app-bg" aria-hidden="true">
        <span className="bg-blob bg-blob-1" />
        <span className="bg-blob bg-blob-2" />
        <span className="bg-blob bg-blob-3" />
      </div>

      <Sidebar
        conversations={conversations}
        activeId={activeConversation.id}
        onSelect={handleSelectConversation}
        onNewChat={handleNewChat}
        onDelete={handleDeleteConversation}
        isOpen={sidebarOpen}
      />
      {sidebarOpen && (
        <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />
      )}

      <ChatArea
        key={activeConversation.id}
        conversation={activeConversation}
        onUpdateConversation={updateActiveConversation}
        onToggleSidebar={() => setSidebarOpen((v) => !v)}
      />
    </div>
  );
}

export default App;