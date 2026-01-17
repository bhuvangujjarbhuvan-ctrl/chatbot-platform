import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function AppHome() {
  const navigate = useNavigate();
  const endRef = useRef(null);

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

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId],
  );

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId),
    [chats, selectedChatId],
  );

  function logout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  async function loadProjects() {
    setLoadingProjects(true);
    try {
      const res = await api.getProjects();
      setProjects(res.projects || []);

      // auto-select first project if none selected
      if (!selectedProjectId && res.projects?.length) {
        setSelectedProjectId(res.projects[0].id);
      }
    } catch (err) {
      alert(err.message || "Failed to load projects");
    } finally {
      setLoadingProjects(false);
    }
  }

  async function loadChats(projectId) {
    if (!projectId) return;
    setLoadingChats(true);
    try {
      const res = await api.getChats(projectId);
      setChats(res.chats || []);

      // auto-select first chat if none selected
      if (res.chats?.length) {
        setSelectedChatId(res.chats[0].id);
      } else {
        setSelectedChatId("");
        setMessages([]);
      }
    } catch (err) {
      alert(err.message || "Failed to load chats");
    } finally {
      setLoadingChats(false);
    }
  }

  async function loadMessages(chatId) {
    if (!chatId) return;
    setLoadingMessages(true);
    try {
      const res = await api.getMessages(chatId);
      setMessages(res.messages || []);
    } catch (err) {
      alert(err.message || "Failed to load messages");
    } finally {
      setLoadingMessages(false);
    }
  }

  async function createProject() {
    const name = prompt("Project name?", "My Agent");
    if (!name) return;

    const description = prompt("Description?", "Created from UI") || "";

    try {
      const res = await api.createProject({ name, description });
      await loadProjects();
      setSelectedProjectId(res.project.id);
    } catch (err) {
      alert(err.message || "Failed to create project");
    }
  }

  async function createChat() {
    if (!selectedProjectId) return alert("Select a project first");

    const title = prompt("Chat title?", "New Chat");
    if (!title) return;

    try {
      const res = await api.createChat(selectedProjectId, { title });
      await loadChats(selectedProjectId);
      setSelectedChatId(res.chat.id);
    } catch (err) {
      alert(err.message || "Failed to create chat");
    }
  }

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    if (!selectedChatId) return alert("Select or create a chat first");

    setInput("");
    setSending(true);

    // optimistic user message
    setMessages((prev) => [
      ...prev,
      { role: "user", content: text, id: `temp-${Date.now()}` },
    ]);

    try {
      const res = await api.sendMessage(selectedChatId, { content: text });
      setMessages((prev) => [...prev, res.assistantMessage]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          role: "assistant",
          content: `❌ ${err.message || "Request failed"}`,
          id: `err-${Date.now()}`,
        },
      ]);
    } finally {
      setSending(false);
    }
  }

  // auto scroll chat
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, sending]);

  // initial load
  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line
  }, []);

  // when project changes -> load chats
  useEffect(() => {
    if (selectedProjectId) {
      loadChats(selectedProjectId);
    }
    // eslint-disable-next-line
  }, [selectedProjectId]);

  // when chat changes -> load messages
  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
    // eslint-disable-next-line
  }, [selectedChatId]);

  return (
    <div className="app-shell">
      {/* TOP BAR */}
      <div className="topbar">
        <div className="topbar-left">
          <div className="logo-circle" />
          <div>
            <div className="top-title">Chatbot Platform</div>
            <div className="top-sub">
              Projects • Prompts • Chats • OpenRouter
            </div>
          </div>
        </div>

        <div className="topbar-right">
          <button className="btn btn-outline" onClick={createProject}>
            + Project
          </button>
          <button
            className="btn btn-outline"
            onClick={createChat}
            disabled={!selectedProjectId}
          >
            + Chat
          </button>
          <button className="btn btn-danger" onClick={logout}>
            Logout
          </button>
        </div>
      </div>

      {/* MAIN GRID */}
      <div className="main-grid">
        {/* PROJECTS */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Projects</div>
            <div className="panel-meta">
              {loadingProjects ? "Loading..." : `${projects.length}`}
            </div>
          </div>

          <div className="list">
            {projects.length === 0 && (
              <div className="empty">
                No projects yet. Click <b>+ Project</b>
              </div>
            )}

            {projects.map((p) => (
              <button
                key={p.id}
                className={`list-item ${
                  p.id === selectedProjectId ? "active" : ""
                }`}
                onClick={() => setSelectedProjectId(p.id)}
              >
                <div className="list-title">{p.name}</div>
                <div className="list-sub">{p.description || "No description"}</div>
              </button>
            ))}
          </div>
        </div>

        {/* CHATS */}
        <div className="panel">
          <div className="panel-head">
            <div className="panel-title">Chats</div>
            <div className="panel-meta">
              {loadingChats ? "Loading..." : `${chats.length}`}
            </div>
          </div>

          <div className="list">
            {!selectedProjectId && (
              <div className="empty">Select a project</div>
            )}

            {selectedProjectId && chats.length === 0 && (
              <div className="empty">
                No chats. Click <b>+ Chat</b>
              </div>
            )}

            {chats.map((c) => (
              <button
                key={c.id}
                className={`list-item ${
                  c.id === selectedChatId ? "active" : ""
                }`}
                onClick={() => setSelectedChatId(c.id)}
              >
                <div className="list-title">{c.title}</div>
                <div className="list-sub">
                  {new Date(c.createdAt).toLocaleString()}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* CHAT */}
        <div className="chat-panel">
          <div className="chat-head">
            <div>
              <div className="chat-title">
                {selectedProject ? selectedProject.name : "No Project"}
              </div>
              <div className="chat-sub">
                {selectedChat ? selectedChat.title : "Select a chat"}
              </div>
            </div>

            <div className="chat-status">
              {loadingMessages ? "Loading messages..." : "Ready"}
            </div>
          </div>

          <div className="chat-body">
            {(!selectedChatId || messages.length === 0) && (
              <div className="empty">
                {selectedChatId
                  ? "No messages yet. Say Hi 👋"
                  : "Select a chat to start"}
              </div>
            )}

            {messages.map((m) => (
              <div
                key={m.id}
                className={`bubble-row ${m.role === "user" ? "right" : "left"}`}
              >
                <div className={`bubble ${m.role}`}>
                  <div className="bubble-role">
                    {m.role === "user" ? "You" : "AI"}
                  </div>
                  <div className="bubble-text">{m.content}</div>
                </div>
              </div>
            ))}

            {sending && (
              <div className="bubble-row left">
                <div className="bubble assistant">
                  <div className="bubble-role">AI</div>
                  <div className="bubble-text">Typing...</div>
                </div>
              </div>
            )}

            <div ref={endRef} />
          </div>

          <div className="chat-inputbar">
            <input
              className="input"
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") sendMessage();
              }}
              disabled={!selectedChatId || sending}
            />
            <button
              className="btn btn-primary"
              onClick={sendMessage}
              disabled={!selectedChatId || sending}
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
