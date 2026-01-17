

# Chatbot Platform — Architecture & Design

## 1) Overview

This project is a minimal **multi-user chatbot platform** where:

* Users can **register/login**
* Each user can create multiple **Projects (Agents)**
* Each project can store **Prompts** (including a default system prompt)
* Each project can create multiple **Chats**
* Each chat stores **Messages** (user + assistant)
* Assistant responses are generated using an **LLM provider (OpenRouter)**

The system is designed to be **secure, scalable, extensible, and reliable** while staying minimal.

---

## 2) High-Level Architecture

### Components

**Frontend (React + Vite)**

* Login/Register UI
* Projects/Chats UI
* Chat interface (send message, show replies)
* Stores JWT token in browser localStorage

**Backend (Node + Express)**

* REST APIs for auth, projects, prompts, chats, messages
* JWT authentication middleware
* LLM integration service (OpenRouter)
* Data validation using Zod

**Database (PostgreSQL + Prisma)**

* Stores users, projects, prompts, chats, messages
* Prisma handles schema, migrations, queries

**LLM Provider (OpenRouter)**

* Generates assistant responses using Chat Completions API

---

## 3) Request Flow

### A) Authentication Flow (JWT)

1. User registers or logs in via frontend
2. Backend returns a **JWT token**
3. Frontend stores token in `localStorage`
4. For protected APIs, frontend sends:

```
Authorization: Bearer <token>
```

5. Backend verifies token and attaches `req.user`

---

### B) Chat Message Flow

1. Frontend sends user message:
   `POST /api/chats/:chatId/messages`

2. Backend validates:

   * chat exists
   * chat belongs to logged-in user

3. Backend saves the user message in DB

4. Backend loads:

   * default prompt for the project
   * last N messages for context (e.g., last 20)

5. Backend calls OpenRouter:

   * system prompt = project default prompt
   * messages = chat history

6. Backend saves assistant reply to DB

7. Backend returns assistant message to frontend

---

## 4) Data Model (Database Schema)

### Entities

**User**

* Owns projects
* Authenticated using email + password hash

**Project**

* Belongs to a user
* Represents an agent/workspace

**Prompt**

* Belongs to a project
* Used as system instructions
* Supports `isDefault=true` for the main prompt

**Chat**

* Belongs to a project
* Contains many messages

**Message**

* Belongs to a chat
* `role` = `user` or `assistant`
* `content` = message text

---

### Relationships

* User **1 → many** Projects
* Project **1 → many** Prompts
* Project **1 → many** Chats
* Chat **1 → many** Messages

---

## 5) API Design

### Public Endpoints

* `POST /api/auth/register`
* `POST /api/auth/login`

### Protected Endpoints (JWT required)

* `GET /api/projects`

* `POST /api/projects`

* `GET /api/projects/:projectId/prompts`

* `POST /api/projects/:projectId/prompts`

* `GET /api/projects/:projectId/chats`

* `POST /api/projects/:projectId/chats`

* `GET /api/chats/:chatId/messages`

* `POST /api/chats/:chatId/messages`

---

## 6) Security Considerations

### Authentication

* JWT based authentication
* Passwords are hashed (bcrypt)
* Protected routes require valid token

### Authorization

* Every project/chat access is verified against `req.user.id`
* Prevents cross-user data access

### Environment Secrets

Sensitive keys are stored in `.env` and deployment environment variables:

* `JWT_SECRET`
* `OPENROUTER_API_KEY`
* `DATABASE_URL`

Never committed to GitHub.

### CORS

Backend restricts allowed origin using `CORS_ORIGIN`:

* Local: `http://localhost:5173`
* Production: `https://<vercel-app>.vercel.app`

---

## 7) Scalability & Performance

### Scalability

* Stateless backend (JWT auth) → easy horizontal scaling
* DB stores all state (messages, chats, projects)
* Multi-user support by design

### Performance

* Only last N messages are sent to LLM (`take: 20`)
* Avoids sending full chat history every time
* Simple REST endpoints for low overhead

---

## 8) Reliability & Error Handling

* Zod validates input payloads
* `asyncHandler` prevents unhandled promise errors
* Graceful JSON error responses:

  * `401 Missing token`
  * `404 Project not found`
  * `500 OpenRouter error`

---

## 9) Extensibility (Future Improvements)

This design supports easy additions such as:

### Analytics

* message count per project
* response time metrics
* token usage tracking

### File Uploads (Good-to-have)

* Attach OpenAI Files API / other storage (S3)
* Store file references per project

### Streaming Responses

* Stream tokens to frontend using SSE/WebSocket

### Prompt Versions

* prompt history and rollback
* multiple prompt profiles per project

### Role-based Access

* team projects
* shared agents

---

## 10) Deployment Architecture

### Backend

* Hosted on **Render Web Service**
* Uses **Render PostgreSQL**
* Env vars configured in Render dashboard

### Frontend

* Hosted on **Vercel**
* `VITE_API_BASE_URL` points to Render backend

---

## 11) Summary

This chatbot platform is a minimal but production-style foundation that includes:

* Secure JWT authentication
* Multi-user + multi-project architecture
* Persistent chat history in PostgreSQL
* LLM integration via OpenRouter
* Clean separation of frontend, backend, and database

---

