import { useEffect, useMemo, useRef, useState } from "react";
import { api } from "../api";
import { LogOut, Plus, Send, MessageSquare, Settings, Trash2, Pencil, RefreshCw } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default function Dashboard() {
  const [user, setUser] = useState(null);

  const [projects, setProjects] = useState([]);
  const [selectedProjectId, setSelectedProjectId] = useState("");

  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState("");

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [editingChatId, setEditingChatId] = useState("");
  const [editingChatTitle, setEditingChatTitle] = useState("");

  const [loadingProjects, setLoadingProjects] = useState(false);
  const [loadingChats, setLoadingChats] = useState(false);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  const [showSettings, setShowSettings] = useState(false);
  const [prompts, setPrompts] = useState([]);
  const [newPromptTitle, setNewPromptTitle] = useState("");
  const [newPromptContent, setNewPromptContent] = useState("");
  const [newPromptIsDefault, setNewPromptIsDefault] = useState(true);
  const [loadingPrompts, setLoadingPrompts] = useState(false);
  const [savingPrompt, setSavingPrompt] = useState(false);

  const [activeModal, setActiveModal] = useState(null);
  const [modalInput, setModalInput] = useState("");
  const [toasts, setToasts] = useState([]);

  const addToast = (message, type = "info") => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const bottomRef = useRef(null);

  const selectedProject = useMemo(
    () => projects.find((p) => p.id === selectedProjectId),
    [projects, selectedProjectId]
  );

  const [searchQuery, setSearchQuery] = useState("");

  const selectedChat = useMemo(
    () => chats.find((c) => c.id === selectedChatId),
    [chats, selectedChatId]
  );

  const filteredChats = useMemo(() => {
    return chats.filter((c) =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [chats, searchQuery]);

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

  function triggerCreateProject() {
    setModalInput("");
    setActiveModal("createProject");
  }

  async function submitCreateProject() {
    const name = modalInput.trim();
    if (!name) {
      addToast("Project name is required", "error");
      return;
    }
    try {
      const data = await api.createProject({
        name,
        description: "My chatbot project",
      });
      await loadProjects();
      setSelectedProjectId(data.project.id);
      setSelectedChatId("");
      setMessages([]);
      setActiveModal(null);
      addToast(`Project "${name}" created!`, "success");
    } catch (e) {
      addToast(e.message || "Failed to create project", "error");
    }
  }

  function triggerCreateChat() {
    if (!selectedProjectId) {
      addToast("Select a project first", "warning");
      return;
    }
    setModalInput("");
    setActiveModal("createChat");
  }

  async function submitCreateChat() {
    if (!selectedProjectId) return;
    const title = modalInput.trim() || "New Chat";
    try {
      const data = await api.createChat(selectedProjectId, { title });
      await loadChats(selectedProjectId);
      setSelectedChatId(data.chat.id);
      setMessages([]);
      setActiveModal(null);
      addToast(`Chat "${title}" created!`, "success");
    } catch (e) {
      addToast(e.message || "Failed to create chat", "error");
    }
  }

  async function handleDeleteProject(projectId, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this project and all its chats?")) return;
    try {
      await api.deleteProject(projectId);
      addToast("Project deleted successfully", "success");
      if (selectedProjectId === projectId) {
        setSelectedProjectId("");
        setSelectedChatId("");
        setMessages([]);
      }
      await loadProjects();
    } catch (err) {
      addToast(err.message || "Failed to delete project", "error");
    }
  }

  async function handleDeleteChat(chatId, e) {
    e.stopPropagation();
    if (!confirm("Are you sure you want to delete this chat and its history?")) return;
    try {
      await api.deleteChat(chatId);
      addToast("Chat deleted successfully", "success");
      if (selectedChatId === chatId) {
        setSelectedChatId("");
        setMessages([]);
      }
      await loadChats(selectedProjectId);
    } catch (err) {
      addToast(err.message || "Failed to delete chat", "error");
    }
  }

  async function handleRenameChat(chatId) {
    const title = editingChatTitle.trim();
    if (!title) {
      addToast("Chat title cannot be empty", "warning");
      return;
    }
    try {
      await api.updateChat(chatId, { title });
      addToast("Chat renamed successfully", "success");
      setChats((prev) =>
        prev.map((c) => (c.id === chatId ? { ...c, title } : c))
      );
      setEditingChatId("");
    } catch (err) {
      addToast(err.message || "Failed to rename chat", "error");
    }
  }

  function handleExportMarkdown() {
    if (messages.length === 0) {
      addToast("No messages to export", "warning");
      return;
    }
    const title = selectedChat?.title || "chat-history";
    const markdownContent = messages
      .filter((m) => m.content !== "")
      .map((m) => {
        const roleName = m.role === "user" ? "You" : "AI";
        return `### ${roleName} (${new Date(m.createdAt).toLocaleString()})\n\n${m.content}\n`;
      })
      .join("\n---\n\n");

    const blob = new Blob([markdownContent], { type: "text/markdown;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "-")}.md`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Chat history exported as Markdown!", "success");
  }

  function handleExportJson() {
    if (messages.length === 0) {
      addToast("No messages to export", "warning");
      return;
    }
    const title = selectedChat?.title || "chat-history";
    const jsonContent = JSON.stringify(messages, null, 2);
    const blob = new Blob([jsonContent], { type: "application/json;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, "-")}.json`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addToast("Chat history exported as JSON!", "success");
  }

  async function handleSend() {
    if (!selectedChatId) {
      addToast("Create/select a chat first", "warning");
      return;
    }

    const text = input.trim();
    if (!text) return;

    setInput("");
    setSending(true);

    // 1) Add user message optimistically
    const tempUserMsg = {
      id: crypto.randomUUID(),
      chatId: selectedChatId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempUserMsg]);
    scrollToBottom();

    // 2) Add placeholders for streaming assistant message
    const tempAiId = "temp-ai-message";
    const tempAiMsg = {
      id: tempAiId,
      chatId: selectedChatId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, tempAiMsg]);
    scrollToBottom();

    try {
      await api.sendMessageStream(selectedChatId, { content: text }, {
        onUserMessage: (userMsg) => {
          setMessages((prev) => prev.map((m) => (m.id === tempUserMsg.id ? userMsg : m)));
        },
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAiId ? { ...m, content: m.content + chunk } : m
            )
          );
          scrollToBottom();
        },
        onDone: (assistantMsg) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? assistantMsg : m))
          );
          setSending(false);
          scrollToBottom();
        },
        onError: (err) => {
          addToast(err.message || "Stream failed", "error");
          setMessages((prev) => prev.filter((m) => m.id !== tempAiId));
          setSending(false);
        }
      });
    } catch (e) {
      addToast(e.message, "error");
      setMessages((prev) => prev.filter((m) => m.id !== tempAiId));
      setSending(false);
    }
  }

  async function handleRegenerate(messageId) {
    if (sending) return;
    setSending(true);

    const msgIndex = messages.findIndex((m) => m.id === messageId);
    if (msgIndex === -1) {
      setSending(false);
      return;
    }

    const messagesBefore = messages.slice(0, msgIndex);
    const tempAiId = "temp-ai-message";
    const tempAiMsg = {
      id: tempAiId,
      chatId: selectedChatId,
      role: "assistant",
      content: "",
      createdAt: new Date().toISOString(),
    };

    setMessages([...messagesBefore, tempAiMsg]);
    scrollToBottom();

    try {
      await api.regenerateMessageStream(selectedChatId, messageId, {
        onChunk: (chunk) => {
          setMessages((prev) =>
            prev.map((m) =>
              m.id === tempAiId ? { ...m, content: m.content + chunk } : m
            )
          );
          scrollToBottom();
        },
        onDone: (assistantMsg) => {
          setMessages((prev) =>
            prev.map((m) => (m.id === tempAiId ? assistantMsg : m))
          );
          setSending(false);
          scrollToBottom();
          addToast("Response regenerated successfully!", "success");
        },
        onError: (err) => {
          addToast(err.message || "Regeneration failed", "error");
          loadMessages(selectedChatId);
          setSending(false);
        },
      });
    } catch (e) {
      addToast(e.message || "Failed to regenerate", "error");
      loadMessages(selectedChatId);
      setSending(false);
    }
  }

  async function loadPrompts(projectId) {
    if (!projectId) return;
    setLoadingPrompts(true);
    try {
      const data = await api.getPrompts(projectId);
      setPrompts(data.prompts || []);
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingPrompts(false);
    }
  }

  async function handleCreatePrompt(e) {
    e.preventDefault();
    if (!selectedProjectId) return;
    if (!newPromptTitle.trim() || !newPromptContent.trim()) {
      addToast("Title and Content are required.", "warning");
      return;
    }
    setSavingPrompt(true);
    try {
      await api.createPrompt(selectedProjectId, {
        title: newPromptTitle,
        content: newPromptContent,
        isDefault: newPromptIsDefault,
      });
      setNewPromptTitle("");
      setNewPromptContent("");
      await loadPrompts(selectedProjectId);
      addToast("Prompt added successfully!", "success");
    } catch (err) {
      addToast(err.message || "Failed to create prompt", "error");
    } finally {
      setSavingPrompt(false);
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
      setSearchQuery("");
      setMessages([]);
      loadChats(selectedProjectId);
      setShowSettings(false);
    }
  }, [selectedProjectId]);

  useEffect(() => {
    if (selectedProjectId && showSettings) {
      loadPrompts(selectedProjectId);
    }
  }, [selectedProjectId, showSettings]);

  useEffect(() => {
    if (selectedChatId) {
      loadMessages(selectedChatId);
    }
  }, [selectedChatId]);

  return (
    <div style={styles.page}>
      {/* Sidebar */}
      <aside className="glass-sidebar" style={styles.sidebar}>
        <div style={styles.brand}>
          <div style={styles.brandLogo}>🤖</div>
          <div>
            <div style={styles.brandTitle}>Chatbot Platform</div>
            <div style={styles.brandSub}>{user ? user.email : "Loading..."}</div>
          </div>
        </div>

        <div style={styles.sectionHeader}>
          <span>Projects</span>
          <button style={styles.iconBtn} onClick={triggerCreateProject} title="Create Project">
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
              <div
                key={p.id}
                onClick={() => setSelectedProjectId(p.id)}
                className={`sidebar-list-item ${p.id === selectedProjectId ? 'sidebar-list-item-active' : ''}`}
                style={{
                  ...styles.listItem,
                  ...(p.id === selectedProjectId ? styles.listItemActive : {}),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                <div style={{ flex: 1, overflow: "hidden" }}>
                  <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.name}</div>
                  <div style={{ ...styles.smallMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{p.description || "No description"}</div>
                </div>
                <button
                  className="delete-btn-hover"
                  style={styles.deleteListItemBtn}
                  onClick={(e) => handleDeleteProject(p.id, e)}
                  title="Delete Project"
                >
                  <Trash2 size={14} />
                </button>
              </div>
            ))
          )}
        </div>

        <div style={styles.sectionHeader}>
          <span>Chats</span>
          <button style={styles.iconBtn} onClick={triggerCreateChat} title="Create Chat">
            <MessageSquare size={18} />
          </button>
        </div>

        {selectedProjectId && chats.length > 0 && (
          <div className="sidebar-search-container" style={styles.searchContainer}>
            <input
              type="text"
              className="sidebar-search-input"
              style={styles.searchInput}
              placeholder="Search chats..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        )}

        <div style={styles.list}>
          {loadingChats ? (
            <div style={styles.muted}>Loading chats...</div>
          ) : filteredChats.length === 0 ? (
            <div style={styles.muted}>
              {searchQuery ? "No matches found" : "No chats yet"}
            </div>
          ) : (
            filteredChats.map((c) => (
              <div
                key={c.id}
                onClick={() => setSelectedChatId(c.id)}
                className={`sidebar-list-item ${c.id === selectedChatId ? 'sidebar-list-item-active' : ''}`}
                style={{
                  ...styles.listItem,
                  ...(c.id === selectedChatId ? styles.listItemActive : {}),
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 8,
                }}
              >
                {c.id === editingChatId ? (
                  <div style={{ flex: 1, overflow: "hidden" }} onClick={(e) => e.stopPropagation()}>
                    <input
                      style={styles.renameInput}
                      value={editingChatTitle}
                      onChange={(e) => setEditingChatTitle(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") handleRenameChat(c.id);
                        if (e.key === "Escape") setEditingChatId("");
                      }}
                      onBlur={() => handleRenameChat(c.id)}
                      autoFocus
                    />
                  </div>
                ) : (
                  <>
                    <div
                      style={{ flex: 1, overflow: "hidden" }}
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        setEditingChatId(c.id);
                        setEditingChatTitle(c.title || "");
                      }}
                    >
                      <div style={{ fontWeight: 600, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.title}</div>
                      <div style={{ ...styles.smallMuted, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{c.id.slice(0, 8)}...</div>
                    </div>
                    <div style={{ display: "flex", gap: 4 }}>
                      <button
                        className="edit-btn-hover"
                        style={styles.editListItemBtn}
                        onClick={(e) => {
                          e.stopPropagation();
                          setEditingChatId(c.id);
                          setEditingChatTitle(c.title || "");
                        }}
                        title="Rename Chat"
                      >
                        <Pencil size={14} />
                      </button>
                      <button
                        className="delete-btn-hover"
                        style={styles.deleteListItemBtn}
                        onClick={(e) => handleDeleteChat(c.id, e)}
                        title="Delete Chat"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </>
                )}
              </div>
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
              {showSettings ? "Project Settings & Prompts" : (selectedChat ? selectedChat.title : "Select or create a chat")}
            </div>
          </div>
          {selectedProject && (
            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              {selectedChat && !showSettings && (
                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    className="action-btn-gradient"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={handleExportMarkdown}
                    title="Export chat history as Markdown (.md)"
                  >
                    Export .MD
                  </button>
                  <button
                    className="action-btn-gradient"
                    style={{
                      padding: "8px 12px",
                      borderRadius: 10,
                      border: "none",
                      color: "#fff",
                      fontSize: 12,
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                    onClick={handleExportJson}
                    title="Export chat history as JSON (.json)"
                  >
                    Export .JSON
                  </button>
                </div>
              )}
              <button
                style={{
                  ...styles.iconBtn,
                  background: showSettings ? "rgba(59, 130, 246, 0.4)" : "rgba(255,255,255,0.08)",
                }}
                onClick={() => setShowSettings(!showSettings)}
                title="Project Settings / Prompts"
              >
                <Settings size={18} />
              </button>
            </div>
          )}
        </div>

        {showSettings ? (
          <div style={styles.settingsArea}>
            <h3 style={styles.settingsHeading}>Project Settings</h3>
            <p style={styles.settingsSub}>
              Configure preferred AI model for <b>{selectedProject?.name}</b>.
            </p>

            <div style={styles.promptForm}>
              <h4 style={styles.formSectionTitle}>Active Model</h4>
              <select
                style={styles.settingsInput}
                value={selectedProject?.modelName || "openai/gpt-4o-mini"}
                onChange={async (e) => {
                  const newModel = e.target.value;
                  try {
                    await api.updateProject(selectedProjectId, { modelName: newModel });
                    addToast("Active model updated successfully!", "success");
                    await loadProjects();
                  } catch (err) {
                    addToast(err.message || "Failed to update model settings", "error");
                  }
                }}
              >
                <option value="openai/gpt-4o-mini">GPT-4o Mini (OpenAI)</option>
                <option value="google/gemini-2.5-flash">Gemini 2.5 Flash (Google)</option>
                <option value="anthropic/claude-3-haiku">Claude 3 Haiku (Anthropic)</option>
                <option value="meta-llama/llama-3-8b-instruct">Llama 3.1 8B (Meta)</option>
              </select>
            </div>

            <hr style={{ border: "0.5px solid rgba(255,255,255,0.08)", margin: "10px 0" }} />

            <h3 style={styles.settingsHeading}>System Instructions (Prompts)</h3>
            <p style={styles.settingsSub}>
              Configure the default system prompt/persona instructions for this project.
            </p>

            <form onSubmit={handleCreatePrompt} style={styles.promptForm}>
              <h4 style={styles.formSectionTitle}>Create New Prompt</h4>
              <input
                style={styles.settingsInput}
                placeholder="Prompt Title (e.g. Creative Assistant)"
                value={newPromptTitle}
                onChange={(e) => setNewPromptTitle(e.target.value)}
                required
              />
              <textarea
                style={styles.settingsTextarea}
                placeholder="System instructions content..."
                value={newPromptContent}
                onChange={(e) => setNewPromptContent(e.target.value)}
                required
              />
              <label style={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={newPromptIsDefault}
                  onChange={(e) => setNewPromptIsDefault(e.target.checked)}
                />
                Set as Active Default Prompt
              </label>
              <button type="submit" className="action-btn-gradient" style={styles.savePromptBtn} disabled={savingPrompt}>
                {savingPrompt ? "Saving..." : "Add Prompt"}
              </button>
            </form>

            <div style={styles.promptsList}>
              <h4 style={styles.formSectionTitle}>Existing Prompts</h4>
              {loadingPrompts ? (
                <div style={styles.muted}>Loading prompts...</div>
              ) : prompts.length === 0 ? (
                <div style={styles.muted}>No custom prompts defined. Using system default.</div>
              ) : (
                prompts.map((p) => (
                  <div
                    key={p.id}
                    style={{
                      ...styles.promptCard,
                      border: p.isDefault ? "1px solid #22c55e" : "1px solid rgba(255,255,255,0.08)",
                      background: p.isDefault ? "rgba(34, 197, 150, 0.05)" : "rgba(255,255,255,0.02)",
                    }}
                  >
                    <div style={styles.promptHeader}>
                      <span style={styles.promptTitle}>{p.title}</span>
                      {p.isDefault && <span style={styles.defaultBadge}>Active Default</span>}
                    </div>
                    <pre style={styles.promptContent}>{p.content}</pre>
                  </div>
                ))
              )}
            </div>
          </div>
        ) : (
          <>
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
                messages.filter((m) => m.content !== "").map((m) => (
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
                      <div style={styles.msgRole}>
                        <span>{m.role === "user" ? "You" : "AI"}</span>
                        {m.role === "assistant" && m.id !== "temp-ai-message" && (
                          <button
                            className="regenerate-btn"
                            onClick={() => handleRegenerate(m.id)}
                            disabled={sending}
                            title="Regenerate response"
                          >
                            <RefreshCw size={12} className={sending ? "animate-spin" : ""} />
                          </button>
                        )}
                      </div>
                      {m.role === "user" ? (
                        <div style={styles.msgText}>{m.content}</div>
                      ) : (
                        <div style={styles.msgText} className="markdown-content">
                          <ReactMarkdown components={{ pre: MarkdownPre }}>{m.content}</ReactMarkdown>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}

              {sending && (!messages.find(m => m.id === "temp-ai-message") || messages.find(m => m.id === "temp-ai-message")?.content === "") && (
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
              <button className="action-btn-gradient" style={styles.sendBtn} onClick={handleSend} disabled={sending}>
                <Send size={18} />
                Send
              </button>
            </div>
          </>
        )}
      </main>

      {/* Modals */}
      {activeModal && (
        <div className="modal-overlay-fade" style={styles.modalOverlay}>
          <div className="modal-content-scale" style={styles.modalContent}>
            <h3 style={styles.modalTitle}>
              {activeModal === "createProject" ? "Create New Project" : "Create New Chat"}
            </h3>
            <input
              style={styles.modalInput}
              placeholder={activeModal === "createProject" ? "Project Name" : "Chat Title"}
              value={modalInput}
              onChange={(e) => setModalInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  if (activeModal === "createProject") submitCreateProject();
                  else submitCreateChat();
                }
              }}
              autoFocus
            />
            <div style={styles.modalActions}>
              <button
                style={{ ...styles.modalBtn, ...styles.cancelBtn }}
                onClick={() => setActiveModal(null)}
              >
                Cancel
              </button>
              <button
                className="action-btn-gradient"
                style={{ ...styles.modalBtn, ...styles.confirmBtn }}
                onClick={activeModal === "createProject" ? submitCreateProject : submitCreateChat}
              >
                Create
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toasts Container */}
      <div style={styles.toastContainer}>
        {toasts.map((t) => (
          <div
            key={t.id}
            className="toast-slide-in"
            style={{
              ...styles.toast,
              background:
                t.type === "success"
                  ? "#22c55e"
                  : t.type === "error"
                    ? "#ef4444"
                    : t.type === "warning"
                      ? "#f59e0b"
                      : "#3b82f6",
            }}
          >
            {t.message}
          </div>
        ))}
      </div>
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
    fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif",
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
  searchContainer: {
    padding: "4px 0",
  },
  searchInput: {
    width: "100%",
    padding: "8px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(0,0,0,0.2)",
    color: "#fff",
    outline: "none",
    fontSize: 13,
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
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  settingsArea: {
    flex: 1,
    overflow: "auto",
    padding: 24,
    display: "flex",
    flexDirection: "column",
    gap: 20,
    maxWidth: 700,
    margin: "0 auto",
    width: "100%",
  },
  settingsHeading: { fontSize: 20, fontWeight: 800, margin: 0 },
  settingsSub: { fontSize: 14, opacity: 0.7, margin: 0 },
  promptForm: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
    background: "rgba(255,255,255,0.03)",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.08)",
  },
  formSectionTitle: { fontSize: 16, fontWeight: 700, margin: "0 0 4px 0" },
  settingsInput: {
    padding: "10px 12px",
    borderRadius: "20px",
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.2)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },
  settingsTextarea: {
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid rgba(255,255,255,0.10)",
    background: "rgba(0,0,0,0.2)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
    minHeight: 80,
    resize: "vertical",
    fontFamily: "inherit",
  },
  checkboxLabel: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    fontSize: 13,
    cursor: "pointer",
  },
  savePromptBtn: {
    alignSelf: "flex-start",
    border: "none",
    cursor: "pointer",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 700,
    color: "#fff",
    background: "linear-gradient(135deg, #22c55e, #3b82f6)",
  },
  promptsList: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  promptCard: {
    padding: 14,
    borderRadius: 12,
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },
  promptHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  promptTitle: { fontWeight: 700, fontSize: 14 },
  defaultBadge: {
    background: "#22c55e",
    color: "#fff",
    fontSize: 10,
    fontWeight: 800,
    padding: "3px 8px",
    borderRadius: 8,
    textTransform: "uppercase",
  },
  promptContent: {
    margin: 0,
    fontSize: 13,
    opacity: 0.85,
    whiteSpace: "pre-wrap",
    wordBreak: "break-all",
    background: "rgba(0,0,0,0.15)",
    padding: 10,
    borderRadius: 8,
    fontFamily: "monospace",
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
  msgRole: { display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12, opacity: 0.75, marginBottom: 6, fontWeight: 700 },
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
  modalOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(0,0,0,0.6)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 9999,
    backdropFilter: "blur(4px)",
  },
  modalContent: {
    background: "#1e293b",
    border: "1px solid rgba(255,255,255,0.1)",
    padding: 24,
    borderRadius: 16,
    width: "100%",
    maxWidth: 400,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    boxShadow: "0 20px 25px -5px rgba(0, 0, 0, 0.5)",
  },
  modalTitle: { margin: 0, fontSize: 18, fontWeight: 800 },
  modalInput: {
    padding: "12px 14px",
    borderRadius: 12,
    border: "1px solid rgba(255,255,255,0.15)",
    background: "rgba(0,0,0,0.25)",
    color: "#fff",
    outline: "none",
    fontSize: 14,
  },
  modalActions: { display: "flex", justifyContent: "flex-end", gap: 12 },
  modalBtn: {
    border: "none",
    cursor: "pointer",
    borderRadius: 10,
    padding: "10px 16px",
    fontWeight: 700,
    fontSize: 13,
  },
  cancelBtn: { background: "rgba(255,255,255,0.08)", color: "#fff" },
  confirmBtn: { background: "linear-gradient(135deg, #22c55e, #3b82f6)", color: "#fff" },
  toastContainer: {
    position: "fixed",
    top: 20,
    right: 20,
    display: "flex",
    flexDirection: "column",
    gap: 10,
    zIndex: 10000,
  },
  toast: {
    padding: "12px 20px",
    borderRadius: 12,
    color: "#fff",
    fontWeight: 600,
    fontSize: 14,
    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.3)",
    maxWidth: 300,
    wordBreak: "break-word",
  },
  deleteListItemBtn: {
    border: "none",
    background: "transparent",
    color: "rgba(255, 255, 255, 0.4)",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  editListItemBtn: {
    border: "none",
    background: "transparent",
    color: "rgba(255, 255, 255, 0.4)",
    cursor: "pointer",
    padding: 6,
    borderRadius: 8,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  },
  renameInput: {
    width: "100%",
    padding: "4px 8px",
    borderRadius: 6,
    border: "1px solid #3b82f6",
    background: "rgba(0,0,0,0.4)",
    color: "#fff",
    outline: "none",
    fontSize: 13,
    fontWeight: 600,
    boxSizing: "border-box",
  },
};

const MarkdownPre = ({ children, ...props }) => {
  const [copied, setCopied] = useState(false);
  const codeRef = useRef(null);

  const handleCopy = async () => {
    if (codeRef.current) {
      const codeText = codeRef.current.innerText || "";
      await navigator.clipboard.writeText(codeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="code-block-container">
      <button
        className={`copy-code-btn ${copied ? 'copied' : ''}`}
        onClick={handleCopy}
      >
        {copied ? 'Copied!' : 'Copy'}
      </button>
      <pre {...props} ref={codeRef}>
        {children}
      </pre>
    </div>
  );
};

