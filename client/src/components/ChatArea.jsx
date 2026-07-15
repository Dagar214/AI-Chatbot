import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../services/chatApi.js";
import { useSpeechRecognition } from "../hooks/useSpeechRecognition.js";
import { speakText } from "../hooks/useSpeechSynthesis.js";
import { titleFromMessage } from "../utils/chatStorage.js";

const SUGGESTIONS = [
  { icon: "🎓", title: "Explain a concept", subtitle: "Break down a complex topic" },
  { icon: "✍️", title: "Write something", subtitle: "Draft structured content" },
  { icon: "🔍", title: "Research help", subtitle: "Find relevant information fast" },
  { icon: "💡", title: "Brainstorm ideas", subtitle: "Get creative suggestions and plans" },
];

// Haryanvi doesn't have its own browser speech-recognition locale — it's
// close enough to Hindi that selecting Hindi works reasonably well for it.
const VOICE_LANGUAGES = [
  { code: "en-US", label: "English" },
  { code: "hi-IN", label: "हिंदी (+ हरियाणवी)" },
  { code: "pa-IN", label: "ਪੰਜਾਬੀ" },
];

function ChatArea({ conversation, onUpdateConversation, onToggleSidebar }) {
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [voiceReplyEnabled, setVoiceReplyEnabled] = useState(true);
  const [voiceLang, setVoiceLang] = useState("en-US");
  const messagesEndRef = useRef(null);

  const messages = conversation.messages;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Builds the Gemini-style history array. Gemini requires history to
  // start with role "user", so we drop any leading non-user messages.
  const buildHistory = (msgs) => {
    const firstUserIndex = msgs.findIndex((m) => m.role === "user");
    if (firstUserIndex === -1) return [];
    return msgs.slice(firstUserIndex).map((m) => ({
      role: m.role,
      parts: [{ text: m.text }],
    }));
  };

  const handleSend = async (textToSend) => {
    const text = (textToSend ?? input).trim();
    if (!text || isLoading) return;

    const historyBeforeThisMessage = buildHistory(messages);
    const userMessage = { role: "user", text };

    onUpdateConversation((c) => ({
      ...c,
      title: c.messages.length === 0 ? titleFromMessage(text) : c.title,
      messages: [...c.messages, userMessage],
    }));
    setInput("");
    setIsLoading(true);

    try {
      const reply = await sendMessage(text, historyBeforeThisMessage);
      onUpdateConversation((c) => ({
        ...c,
        messages: [...c.messages, { role: "model", text: reply }],
      }));
      if (voiceReplyEnabled) speakText(reply, voiceLang);
    } catch (err) {
      onUpdateConversation((c) => ({
        ...c,
        messages: [
          ...c.messages,
          { role: "model", text: "Sorry, I couldn't reach the server. Is it running?" },
        ],
      }));
    } finally {
      setIsLoading(false);
    }
  };

  const { startListening, isListening, isSupported } = useSpeechRecognition(
    (transcript) => {
      setInput(transcript);
      handleSend(transcript);
    },
    voiceLang
  );

  const handleKeyDown = (e) => {
    if (e.key === "Enter") handleSend();
  };

  const handleExport = () => {
    const lines = messages.map(
      (m) => `${m.role === "user" ? "You" : "Assistant"}: ${m.text}`
    );
    const blob = new Blob([lines.join("\n\n")], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${conversation.title.replace(/[^a-z0-9]/gi, "-").toLowerCase()}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return (
    <main className="chat-area">
      <header className="chat-area-header">
        <button className="hamburger-btn" onClick={onToggleSidebar} title="Toggle conversations">
          ☰
        </button>
        <h2>{conversation.title}</h2>
        <button
          className="icon-btn"
          onClick={handleExport}
          title="Export conversation as .txt"
          disabled={messages.length === 0}
        >
          ⬇
        </button>
      </header>

      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">✨</div>
          <h1>How can I help you today?</h1>
          <p>Your AI assistant, powered by Gemini. Ask anything — by typing or by voice.</p>

          <div className="suggestion-grid">
            {SUGGESTIONS.map((s) => (
              <button
                key={s.title}
                className="suggestion-card"
                onClick={() => handleSend(s.title)}
              >
                <span className="suggestion-icon">{s.icon}</span>
                <span className="suggestion-title">{s.title}</span>
                <span className="suggestion-subtitle">{s.subtitle}</span>
              </button>
            ))}
          </div>
        </div>
      ) : (
        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`chat-bubble ${msg.role}`}>
              {msg.text}
            </div>
          ))}
          {isLoading && <div className="chat-bubble model typing">Thinking...</div>}
          <div ref={messagesEndRef} />
        </div>
      )}

      <div className="chat-input-bar">
        <div className="chat-input-row">
          <select
            className="lang-select"
            value={voiceLang}
            onChange={(e) => setVoiceLang(e.target.value)}
            title="Voice input language"
            disabled={isLoading}
          >
            {VOICE_LANGUAGES.map((l) => (
              <option key={l.code} value={l.code}>
                {l.label}
              </option>
            ))}
          </select>

          <button
            className={`mic-btn ${isListening ? "listening" : ""}`}
            onClick={startListening}
            title={isSupported ? "Speak your message" : "Voice input not supported in this browser"}
            disabled={isLoading}
          >
            🎤
          </button>

          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={isListening ? "Listening..." : "Message AI Assistant..."}
            disabled={isLoading}
          />

          <button
            className="send-btn"
            onClick={() => handleSend()}
            disabled={isLoading || !input.trim()}
          >
            ➤
          </button>
        </div>

        <label className="voice-toggle">
          <input
            type="checkbox"
            checked={voiceReplyEnabled}
            onChange={(e) => setVoiceReplyEnabled(e.target.checked)}
          />
          Read replies aloud
        </label>
      </div>
    </main>
  );
}

export default ChatArea;