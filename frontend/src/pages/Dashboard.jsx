import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { LogOut, Plus, Send, MessageSquare } from "lucide-react";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const bottomRef = useRef(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId),
    [chats, selectedChatId]
  );

  function scrollToBottom() {
    setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 50);
  }

  async function loadUser() {
    const data = await api.me();
    setUser(data.user);
  }

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const data = await api.listProjects();
      setProjects(data.projects || []);
      if (!selectedProjectId && data.projects?.[0]?.id) {
        setSelectedProjectId(data.projects[0].id);
      }
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadChats(projectId) {
    if (!projectId) return;
    setLoadingChats(true);
    try {
      const data = await api.listChats(projectId);
      setChats(data.chats || []);
      if (!selectedChatId && data.chats?.[0]?.id) {
        setSelectedChatId(data.chats[0].id);
      }
    } finally {
      setLoadingChats(false);
    }
  }

  async function loadMessages(chatId) {
    if (!chatId) return;
    setLoadingMessages(true);
    try {
      const data = await api.getMessages(chatId);
      setMessages(data.messages || []);
      scrollToBottom();
    } finally {
      setLoadingMessages(false);
    }
  }

  async function handleCreateProject() {
    const name = prompt("Project name?");
    if (!name) return;

    const data = await api.createProject({
      name,
      description: "My chatbot project",
    });

    await loadProjects();
    setSelectedProjectId(data.project.id);
    setSelectedChatId("");
    setMessages([]);
  }

  async function handleCreateChat() {
    if (!selectedProjectId) return;

    const title = prompt("Chat title?") || "New Chat";

    const data = await api.createChat(selectedProjectId, { title });

    await loadChats(selectedProjectId);
    setSelectedChatId(data.chat.id);
    setMessages([]);
  }

  async function handleSend() {
    if (!selectedChatId) {
      alert("Create/select a chat first");
      return;
    }

    const text = input.trim();
    if (!text) return;

    setInput("");

    // optimistic UI
    const tempUserMsg = {
      id: crypto.randomUUID(),
      chatId: selectedChatId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    scrollToBottom();

    setSending(true);
    try {
      const data = await api.sendMessage(selectedChatId, { content: text });

      // add assistant message
      if (data?.assistantMessage) {
        setMessages((prev) => [...prev, data.assistantMessage]);
      }
      scrollToBottom();
    } catch (e) {
      alert(e.message);
    } finally {
      setSending(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    loadUser();
    loadProjects();
  }, []);

  useEffect(() => {
    if (selectedProjectId) {
      setSelectedChatId("");
      setMessages([]);
      loadChats(selectedProjectId);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>🤖</div>
          <div>
            <div style={styles.brandTitle}>Chatbot Platform</div>
            <div style={styles.brandSub}>{user ? user.email : "Loading..."}</div>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <span>Projects</span>
          <button style={styles.iconBtn} onClick={handleCreateProject} title="Create Project">
            <Plus size={18} />
          </button>
        </div>

        <div style={styles.list}>
          {loadingProjects ? (
            <div style={styles.muted}>Loading projects...</div>
          ) : projects.length === 0 ? (
            <div style={styles.muted}>No projects yet</div>
          ) : (
            projects.map((p) => (
              <button
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                style={{
                  ...styles.listItem,
                  ...(p.id === selectedProjectId ? styles.listItemActive : {}),
                }}
              >
                <div style={{ fontWeight: 600 }}>{p.name}</div>
                <div style={styles.smallMuted}>{p.description || "No description"}</div>
              </button>
            ))
          )}
        </div>

        <div style={styles.sectionHeader}>
          <span>Chats</span>
          <button style={styles.iconBtn} onClick={handleCreateChat} title="Create Chat">
            <MessageSquare size={18} />
          </button>
        </div>

        <div style={styles.list}>
          {loadingChats ? (
            <div style={styles.muted}>Loading chats...</div>
          ) : chats.length === 0 ? (
            <div style={styles.muted}>No chats yet</div>
          ) : (
            chats.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedChatId(c.id)}
                style={{
                  ...styles.listItem,
                  ...(c.id === selectedChatId ? styles.listItemActive : {}),
                }}
              >
                <div style={{ fontWeight: 600 }}>{c.title}</div>
                <div style={styles.smallMuted}>{c.id.slice(0, 8)}...</div>
              </button>
            ))
          )}
        </div>

        <button style={styles.logoutBtn} onClick={logout}>
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main */}
      <main style={styles.main}>
        <div style={styles.topBar}>
          <div>
            <div style={styles.chatTitle}>
              {selectedProject ? selectedProject.name : "Select a project"}
            </div>
            <div style={styles.chatSub}>
              {selectedChat ? selectedChat.title : "Select or create a chat"}
            </div>
          </div>
        </div>

        <div style={styles.chatArea}>
          {loadingMessages ? (
            <div style={styles.muted}>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div style={styles.emptyState}>
              <div style={styles.emptyTitle}>Start chatting ✨</div>
              <div style={styles.emptySub}>
                Create a chat and send your first message.
              </div>
            </div>
          ) : (
            messages.map((m) => (
              <div
                key={m.id}
                style={{
                  ...styles.msgRow,
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    ...styles.msgBubble,
                    ...(m.role === "user" ? styles.userBubble : styles.aiBubble),
                  }}
                >
                  <div style={styles.msgRole}>{m.role === "user" ? "You" : "AI"}</div>
                  <div style={styles.msgText}>{m.content}</div>
                </div>
              </div>
            ))
          )}

          {sending && (
            <div style={{ ...styles.msgRow, justifyContent: "flex-start" }}>
              <div style={{ ...styles.msgBubble, ...styles.aiBubble, opacity: 0.7 }}>
                <div style={styles.msgRole}>AI</div>
                <div style={styles.msgText}>Typing...</div>
              </div>
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        <div style={styles.inputBar}>
          <input
            style={styles.input}
            placeholder="Type a message..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
          />
          <button style={styles.sendBtn} onClick={handleSend} disabled={sending}>
            <Send size={18} />
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

const styles = {
  page: {
    height: "100vh",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    background: "linear-gradient(135deg, #0f172a, #111827)",
    color: "#fff",
    fontFamily: "system-ui, sans-serif",
  },
  sidebar: {
    borderRight: "1px solid rgba(255,255,255,0.08)",
    padding: 16,
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(12px)",
  },
  brand: {
    display: "flex",
    gap: 12,
    alignItems: "center",
    padding: 12,
    borderRadius: 16,
    background: "rgba(255,255,255,0.05)",
  },
  brandLogo: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
    fontSize: 20,
  },
  brandTitle: { fontWeight: 800, fontSize: 16 },
  brandSub: { fontSize: 12, opacity: 0.75 },
  sectionHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 6,
    fontWeight: 700,
    opacity: 0.9,
  },
  iconBtn: {
    border: "none",
    cursor: "pointer",
    borderRadius: 12,
    padding: 8,
    background: "rgba(255,255,255,0.08)",
    color: "#fff",
  },
  list: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
    overflow: "auto",
    paddingRight: 4,
    maxHeight: 220,
  },
  listItem: {
    textAlign: "left",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    padding: 12,
    borderRadius: 14,
    cursor: "pointer",
    color: "#fff",
  },
  listItemActive: {
    background: "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  muted: { opacity: 0.7, fontSize: 13 },
  smallMuted: { opacity: 0.65, fontSize: 12, marginTop: 2 },
  logoutBtn: {
    marginTop: "auto",
    border: "none",
    cursor: "pointer",
    borderRadius: 14,
    padding: 12,
    display: "flex",
    gap: 10,
    alignItems: "center",
    justifyContent: "center",
    background: "rgba(239,68,68,0.2)",
    color: "#fff",
    fontWeight: 700,
  },
  main: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
  },
  topBar: {
    padding: 16,
    borderBottom: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(12px)",
  },
  chatTitle: { fontSize: 18, fontWeight: 800 },
  chatSub: { fontSize: 13, opacity: 0.75, marginTop: 2 },
  chatArea: {
    flex: 1,
    overflow: "auto",
    padding: 18,
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  msgRow: { display: "flex" },
  msgBubble: {
    maxWidth: "70%",
    padding: "12px 14px",
    borderRadius: 18,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(255,255,255,0.06)",
  },
  userBubble: {
    background: "linear-gradient(135deg, rgba(34,197,94,0.25), rgba(59,130,246,0.25))",
  },
  aiBubble: {
    background: "rgba(255,255,255,0.05)",
  },
  msgRole: { fontSize: 12, opacity: 0.75, marginBottom: 6, fontWeight: 700 },
  msgText: { whiteSpace: "pre-wrap", lineHeight: 1.4 },
  emptyState: {
    marginTop: 60,
    textAlign: "center",
    opacity: 0.9,
  },
  emptyTitle: { fontSize: 22, fontWeight: 900 },
  emptySub: { opacity: 0.7, marginTop: 6 },
  inputBar: {
    padding: 14,
    borderTop: "1px solid rgba(255,255,255,0.08)",
    display: "flex",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    backdropFilter: "blur(12px)",
  },
  input: {
    flex: 1,
    padding: "12px 14px",
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },
  sendBtn: {
    border: "none",
    cursor: "pointer",
    borderRadius: 14,
    padding: "12px 14px",
    display: "flex",
    gap: 8,
    alignItems: "center",
    fontWeight: 800,
    color: "#fff",
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
  },
};
