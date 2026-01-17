const API_BASE = "http://localhost:4000/api";

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

  getProjects: () => request("/projects"),

  createProject: (payload) =>
    request("/projects", {
      method: "POST",
      body: JSON.stringify(payload),
    }),

  getChats: (projectId) => request(`/projects/${projectId}/chats`),

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
};
