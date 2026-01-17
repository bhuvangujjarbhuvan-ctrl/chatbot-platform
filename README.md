

---

# Chatbot Platform (Minimal)

A minimal multi-user **Chatbot Platform** built with:

* **Backend:** Node.js + Express + Prisma + PostgreSQL
* **Auth:** JWT (Register/Login)
* **Frontend:** React + Vite
* **LLM Provider:** OpenRouter (Chat Completions API)
* **Deploy:** Render (Backend + Postgres) + Vercel (Frontend)

---

## Features

✅ User Registration + Login (JWT)
✅ Create Projects/Agents under a user
✅ Store Prompts per Project (Default prompt supported)
✅ Create Chats under a Project
✅ Send Messages and get AI replies
✅ Messages stored in PostgreSQL
✅ Public hosted demo (Frontend + Backend)

---

## Tech Stack

### Backend

* Node.js
* Express
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Zod validation

### Frontend

* React (Vite)
* React Router DOM

### LLM

* OpenRouter Chat Completions API

---

## Project Structure

```
chatbot-platform/
  backend/
    prisma/
      schema.prisma
      migrations/
    src/
      routes/
      services/
      middleware/
      config/
    package.json

  frontend/
    src/
      pages/
      api.js
    package.json
```

---

# Local Setup (Run on your PC)

## 1) Clone Repo

```bash
git clone <YOUR_GITHUB_REPO_URL>
cd chatbot-platform
```

---

## 2) Backend Setup

### Go to backend folder

```bash
cd backend
npm install
```

### Create `.env`

Create a file: `backend/.env`

Example:

```env
PORT=4000
DATABASE_URL="postgresql://chatbot_user:YOUR_PASSWORD@localhost:5432/chatbot_platform?schema=public"
JWT_SECRET="super_secret_change_me"

OPENROUTER_API_KEY="sk-or-v1-xxxxxxxxxxxxxxxxxxxx"
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"

CORS_ORIGIN="http://localhost:5173"
```

---

### Run Prisma migration

```bash
npx prisma migrate dev --name init
npx prisma generate
```

---

### Start backend

```bash
npm run dev
```

Backend runs at:

```
http://localhost:4000
```

---

## 3) Frontend Setup

### Go to frontend folder

```bash
cd ../frontend
npm install
```

### Create `.env`

Create a file: `frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:4000/api
```

---

### Start frontend

```bash
npm run dev
```

Frontend runs at:

```
http://localhost:5173
```

---

# API Testing (Postman)

## Auth

### Register (No token needed)

POST:

```
/api/auth/register
```

Body:

```json
{
  "name": "Bhuvan",
  "email": "bhuvan@gmail.com",
  "password": "123456"
}
```

### Login (No token needed)

POST:

```
/api/auth/login
```

Body:

```json
{
  "email": "bhuvan@gmail.com",
  "password": "123456"
}
```

Copy the token from response.

---

## Use Token in Protected APIs

Header:

```
Authorization: Bearer <TOKEN>
```

---

## Projects

### Create Project

POST:

```
/api/projects
```

Body:

```json
{
  "name": "My First Agent",
  "description": "Testing chatbot platform"
}
```

### List Projects

GET:

```
/api/projects
```

---

## Prompts

### Create Prompt

POST:

```
/api/projects/:projectId/prompts
```

Body:

```json
{
  "title": "Default Prompt",
  "content": "You are a helpful assistant. Reply clearly and briefly.",
  "isDefault": true
}
```

---

## Chats

### Create Chat

POST:

```
/api/projects/:projectId/chats
```

Body:

```json
{
  "title": "First Chat"
}
```

### List Chats

GET:

```
/api/projects/:projectId/chats
```

---

## Messages

### Get Messages

GET:

```
/api/chats/:chatId/messages
```

### Send Message (AI Reply)

POST:

```
/api/chats/:chatId/messages
```

Body:

```json
{
  "content": "Hello!"
}
```

---

# Deployment

## Backend (Render)

### 1) Create Render PostgreSQL

* Create 1 free PostgreSQL database
* Copy **Internal Database URL**

### 2) Create Render Web Service

* Connect GitHub repo
* Root directory: `backend`

### 3) Render Environment Variables

Set these in Render backend service:

```env
DATABASE_URL=<Render Internal Database URL>
JWT_SECRET=<your-secret>
OPENROUTER_API_KEY=<your-openrouter-key>
OPENROUTER_MODEL=mistralai/mistral-7b-instruct
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1
CORS_ORIGIN=*
```

### 4) Build / Start Commands

Build Command:

```bash
npm install && npx prisma generate
```

Start Command:

```bash
node src/server.js
```

(If tables are missing, run migrations locally before deploying OR run migrate deploy on server setup.)

---

## Frontend (Vercel)

### 1) Import GitHub repo

* Framework: **Vite**
* Root directory: `frontend`

### 2) Add Vercel Environment Variable

```env
VITE_API_BASE_URL=https://<YOUR_RENDER_BACKEND_URL>/api
```

### 3) Deploy

After deploy, update backend CORS:

```env
CORS_ORIGIN=https://<YOUR_VERCEL_FRONTEND_URL>
```

Redeploy backend.

---

# Live Demo

Frontend:

* [https://chatbot-platform-phi.vercel.app](https://chatbot-platform-phi.vercel.app)

Backend:

* [https://chatbot-platform-cxq0.onrender.com](https://chatbot-platform-cxq0.onrender.com)

---

# Notes

* Do NOT commit `.env` files to GitHub.
* JWT is required for protected endpoints.
* Messages are stored in Postgres and AI replies come from OpenRouter.

---

## License

MIT

---

