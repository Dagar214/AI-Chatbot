function Sidebar({ conversations, activeId, onSelect, onNewChat, onDelete, isOpen }) {
  return (
    <aside className={`sidebar ${isOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <span className="brand-icon">✨</span>
        <span className="brand-name">CampusAI</span>
      </div>

      <button className="new-chat-btn" onClick={onNewChat}>
        <span>+</span> New chat
      </button>

      <div className="sidebar-section-label">Conversations</div>

      <div className="conversation-list">
        {conversations.map((c) => (
          <div
            key={c.id}
            className={`conversation-item ${c.id === activeId ? "active" : ""}`}
            onClick={() => onSelect(c.id)}
          >
            <span className="conversation-icon">💬</span>
            <span className="conversation-title">{c.title}</span>
            <button
              className="conversation-delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(c.id);
              }}
              title="Delete conversation"
            >
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="sidebar-footer">
        <span className="footer-avatar">AI</span>
        <span>Gemini 2.5 Flash</span>
      </div>
    </aside>
  );
}

export default Sidebar; 