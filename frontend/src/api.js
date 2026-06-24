const API_BASE =
  import.meta.env.VITE_API_BASE_URL || "http://localhost:4000/api";

function getToken() {
  return localStorage.getItem("token");
}

async function request(path, options = {}) {
  const token = getToken();

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const text = await res.text();
  let data = {};

  try {
    data = text ? JSON.parse(text) : {};
  } catch (e) {
    data = { raw: text };
  }

  if (!res.ok) {
    throw new Error(data?.error || "Request failed");
  }

  return data;
}

export const api = {
  login: (payload) =>
    request("/auth/login", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  register: (payload) =>
    request("/auth/register", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  me: () => request("/auth/me"),

  getProjects: () => request("/projects"),

  listProjects: () => request("/projects"),

  getPrompts: (projectId) => request(`/projects/${projectId}/prompts`),

  createPrompt: (projectId, payload) =>
    request(`/projects/${projectId}/prompts`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  createProject: (payload) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getChats: (projectId) => request(`/projects/${projectId}/chats`),

  listChats: (projectId) => request(`/projects/${projectId}/chats`),

  createChat: (projectId, payload) =>
    request(`/projects/${projectId}/chats`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getMessages: (chatId) => request(`/chats/${chatId}/messages`),

  sendMessage: (chatId, payload) =>
    request(`/chats/${chatId}/messages`, {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  sendMessageStream: async (chatId, payload, { onUserMessage, onChunk, onDone, onError }) => {
    const token = getToken();
    try {
      const response = await fetch(`${API_BASE}/chats/${chatId}/messages`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const errorText = await response.text();
        let parsed = {};
        try { parsed = JSON.parse(errorText); } catch(e) {}
        throw new Error(parsed.error || "Request failed");
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let buffer = "";
      let currentEvent = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed) continue;

          if (trimmed.startsWith("event: ")) {
            currentEvent = trimmed.slice(7).trim();
          } else if (trimmed.startsWith("data: ")) {
            const dataRaw = trimmed.slice(6).trim();
            try {
              const parsedData = JSON.parse(dataRaw);
              if (currentEvent === "userMessage" && onUserMessage) {
                onUserMessage(parsedData);
              } else if (currentEvent === "chunk" && onChunk) {
                onChunk(parsedData.text);
              } else if (currentEvent === "done" && onDone) {
                onDone(parsedData);
              } else if (currentEvent === "error" && onError) {
                onError(new Error(parsedData.error || "Stream error"));
              }
            } catch (e) {
              console.error("Error parsing stream event data", e);
            }
          }
        }
      }
    } catch (err) {
      if (onError) onError(err);
    }
  },

  deleteProject: (projectId) =>
    request(`/projects/${projectId}`, {
      method: "DELETE",
    }),

  deleteChat: (chatId) =>
    request(`/chats/${chatId}`, {
      method: "DELETE",
    }),

  updateProject: (projectId, payload) =>
    request(`/projects/${projectId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),

  updateChat: (chatId, payload) =>
    request(`/chats/${chatId}`, {
      method: "PATCH",
      body: JSON.stringify(payload),
    }),
};
