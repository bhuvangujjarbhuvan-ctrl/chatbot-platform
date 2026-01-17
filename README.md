# Chatbot Platform (Minimal)

A minimal multi-user chatbot platform with:
- JWT Authentication (Register/Login)
- Projects/Agents under each user
- Prompts stored per project
- Chats + Messages stored in Postgres
- LLM replies using OpenRouter API

---

## Tech Stack

### Backend
- Node.js + Express
- PostgreSQL
- Prisma ORM
- JWT Auth
- Zod validation
- OpenRouter API for chat completions

### Frontend
- React + Vite
- React Router DOM
- Clean UI (Projects + Chats + Chat panel)

---

## Features

✅ Register / Login  
✅ Create Projects (Agents)  
✅ Create Chats inside a Project  
✅ Store Messages in DB  
✅ Chat with LLM using OpenRouter  
✅ Multi-user data isolation (auth protected)

---

## Folder Structure

chatbot-platform/
backend/
frontend/


---

# Backend Setup (Node + Express + Postgres)

<!-- 1) Install dependencies
```bash
cd backend
npm install

## 2) Create .env file

Create backend/.env:

PORT=4000
DATABASE_URL="postgresql://chatbot_user:YOUR_PASSWORD@localhost:5432/chatbot_platform?schema=public"
JWT_SECRET="super_secret_change_me"
OPENROUTER_API_KEY="YOUR_OPENROUTER_KEY"
OPENROUTER_MODEL="mistralai/mistral-7b-instruct"
OPENROUTER_BASE_URL="https://openrouter.ai/api/v1"
CORS_ORIGIN="http://localhost:5173"

3) Run Prisma migration
npx prisma generate
npx prisma migrate dev --name init

4) Start backend
npm run dev


Backend runs at:

http://localhost:4000 

Frontend Setup (React + Vite)
1) Install dependencies
cd ../frontend
npm install

2) Start frontend
npm run dev


Frontend runs at:

http://localhost:5173

API Testing (Postman)
1) Register

POST:

http://localhost:4000/api/auth/register


Body (JSON):

{
  "name": "Bhuvan",
  "email": "bhuvan@gmail.com",
  "password": "123456"
}

2) Login

POST:

http://localhost:4000/api/auth/login


Body (JSON):

{
  "email": "bhuvan@gmail.com",
  "password": "123456"
}


Copy token from response and use it in:
Authorization → Bearer Token

3) Projects

GET:

http://localhost:4000/api/projects


POST:

http://localhost:4000/api/projects


Body:

{
  "name": "My Agent",
  "description": "Testing chatbot platform"
}

4) Chats

POST:

http://localhost:4000/api/projects/:projectId/chats


Body:

{
  "title": "First Chat"
}


GET:

http://localhost:4000/api/projects/:projectId/chats

5) Messages

POST:

http://localhost:4000/api/chats/:chatId/messages


Body:

{
  "content": "Hi"
}


GET:

http://localhost:4000/api/chats/:chatId/messages
-->

<!-- Notes

All protected routes require JWT token.

Messages are stored in PostgreSQL.

AI replies are generated using OpenRouter.

Future Improvements

Prompt selection UI

File upload support

Analytics dashboard

Streaming responses -->


---

# ✅ 2) Architecture / Design Doc (Markdown)

Create file: **`ARCHITECTURE.md`** in root:

```md
# Architecture / Design (Chatbot Platform)

## Overview
This project is a minimal multi-user chatbot platform where:
- Users register/login using JWT authentication.
- Each user can create Projects (Agents).
- Each Project can store Prompts.
- Each Project can have multiple Chats.
- Each Chat contains Messages (user + assistant).
- Assistant replies are generated using OpenRouter LLM API.

---

## High-Level Architecture

Frontend (React + Vite)
→ Backend API (Node + Express)
→ Database (PostgreSQL via Prisma)
→ LLM Provider (OpenRouter)

---

## Components

### 1) Frontend (React)
Responsibilities:
- Authentication screens (Login/Register)
- Dashboard UI (Projects sidebar, Chats list, Chat panel)
- API calls using `fetch` wrapper
- Stores JWT token in localStorage

Key pages:
- Login.jsx
- Register.jsx
- AppHome.jsx (main dashboard)

---

### 2) Backend (Express API)
Responsibilities:
- User authentication + JWT issuance
- Authorization middleware (authGuard)
- CRUD for Projects, Prompts, Chats
- Message storage + retrieval
- LLM integration via OpenRouter API

Routes (example):
- POST /api/auth/register
- POST /api/auth/login
- GET/POST /api/projects
- GET/POST /api/projects/:projectId/chats
- GET/POST /api/chats/:chatId/messages

---

### 3) Database (PostgreSQL + Prisma)
Entities:

#### User
- id
- name
- email (unique)
- passwordHash
- createdAt

#### Project
- id
- userId (FK → User)
- name
- description
- createdAt

#### Prompt
- id
- projectId (FK → Project)
- title
- content
- isDefault

#### Chat
- id
- projectId (FK → Project)
- title
- createdAt

#### Message
- id
- chatId (FK → Chat)
- role (user/assistant)
- content
- createdAt

---

## Security
- Password hashing (bcrypt)
- JWT token validation for protected endpoints
- User data isolation:
  - All queries validate `userId` ownership
- CORS restricted to frontend origin

---

## Scalability Notes
- Stateless backend (JWT auth) → horizontally scalable
- DB indexes on foreign keys improve performance
- Chat message context limited to last 20 messages to reduce LLM latency

---

## Reliability / Error Handling
- asyncHandler wrapper for clean async errors
- Zod validation for request bodies
- LLM failures return safe JSON error messages

---

## Extensibility
Future additions supported by design:
- Add analytics per project/chat
- Add file uploads (OpenAI Files API or S3)
- Add streaming responses
- Add integrations (Slack/WhatsApp)


✅ 3) Deploy Steps (Render + Vercel)
✅ Backend Deploy on Render
Step A: Push to GitHub

Make sure your repo has:

backend/
frontend/
README.md
ARCHITECTURE.md


Push it to GitHub.

Step B: Create Postgres DB (Render)

Go to Render Dashboard

Create → PostgreSQL

Copy the Internal Database URL

Step C: Create Backend Web Service (Render)

Render → Create → Web Service

Connect GitHub repo

Root directory: backend

Build command:

npm install && npx prisma generate && npx prisma migrate deploy


Start command:

node src/server.js

Step D: Add Environment Variables (Render)

In Render backend service settings, add:

DATABASE_URL = (Render Postgres URL)

JWT_SECRET = super_secret_change_me

OPENROUTER_API_KEY = your key

OPENROUTER_MODEL = mistralai/mistral-7b-instruct

OPENROUTER_BASE_URL = https://openrouter.ai/api/v1

CORS_ORIGIN = (your Vercel frontend URL after deploy)

Step E: Prisma migrate deploy

Render will run this automatically using build command:

npx prisma migrate deploy


Backend will be live like:

https://your-backend.onrender.com

✅ Frontend Deploy on Vercel
Step A: Create Vercel Project

Go to Vercel

Import your GitHub repo

Root directory: frontend

Step B: Add Environment Variable

In Vercel → Settings → Environment Variables:

Add:

VITE_API_BASE = your backend Render URL + /api

Example:

https://your-backend.onrender.com/api

Step C: Update frontend api.js to use env

In frontend/src/api.js use:

const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000/api";


Then deploy.

Frontend will be live like:

https://your-frontend.vercel.app

✅ Final Fix: Update Render CORS_ORIGIN

Once Vercel gives your final frontend URL, set backend env:

CORS_ORIGIN=https://your-frontend.vercel.app

Redeploy backend.

✅ 4) Demo Recording Script (Simple + Perfect)

Use this as your speaking script for recording (2–4 minutes):

🎥 Demo Script

1) Intro
“Hi, this is my Chatbot Platform project.
It supports authentication, multiple users, multiple projects/agents, prompts, chats and messages stored in Postgres, and AI responses using OpenRouter.”

2) Show Login/Register

Open frontend URL

Register new user

Login using email/password

Say:
“This uses JWT authentication and all protected routes require a token.”

3) Show Dashboard

Show Projects sidebar

Click “+ Project”

Create a project (agent)

Say:
“Each user can create multiple projects, and each project is isolated per user.”

4) Create Chat

Click “+ Chat”

Create a chat

Say:
“Chats belong to a project, and messages are stored in the database.”

5) Send Messages
Send:

“Hi”

“Explain JWT in 2 lines”

“What is today’s date?”

Say:
“The assistant response is generated using OpenRouter LLM API, and conversation context is maintained.”

6) Show Postman

Show login API

Show token in Authorization header

Show GET projects and chat messages

Say:
“This backend supports API testing and can be extended easily.”

7) End
“Thank you! This is the minimal working demo, and it’s ready for further features like file uploads, analytics, and integrations.”