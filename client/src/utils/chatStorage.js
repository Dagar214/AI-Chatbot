const STORAGE_KEY = "ai-chatbot-demo:conversations";
const ACTIVE_KEY = "ai-chatbot-demo:activeId";

function generateId() {
  return `c_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

/** Creates a fresh, empty conversation. */
export function createConversation() {
  return {
    id: generateId(),
    title: "New conversation",
    messages: [],
    createdAt: Date.now(),
  };
}

/**
 * Loads saved conversations + which one was last active from localStorage.
 * Always returns at least one conversation (creates a fresh one if none
 * exist yet, or if saved data is missing/corrupted).
 */
export function loadConversations() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;

    if (Array.isArray(parsed) && parsed.length > 0) {
      const savedActiveId = localStorage.getItem(ACTIVE_KEY);
      const activeId = parsed.some((c) => c.id === savedActiveId)
        ? savedActiveId
        : parsed[0].id;
      return { conversations: parsed, activeId };
    }
  } catch {
    // fall through to fresh state below
  }

  const fresh = createConversation();
  return { conversations: [fresh], activeId: fresh.id };
}

/** Persists all conversations and which one is currently active. */
export function saveConversations(conversations, activeId) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    localStorage.setItem(ACTIVE_KEY, activeId);
  } catch {
    // ignore write errors (private browsing, quota, etc.)
  }
}

/** Turns a user's first message into a short sidebar title. */
export function titleFromMessage(text) {
  const trimmed = text.trim().replace(/\s+/g, " ");
  if (!trimmed) return "New conversation";
  return trimmed.length > 42 ? `${trimmed.slice(0, 42)}…` : trimmed;
}