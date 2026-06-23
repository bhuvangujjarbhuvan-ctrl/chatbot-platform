import express from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authGuard } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { streamAssistantReply } from "../services/stream.js";
import { searchWeb } from "../utils/search.js";

const router = express.Router();
router.use(authGuard);

// ✅ Create chat under a project
router.post(
  "/projects/:projectId/chats",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      title: z.string().optional(),
    });

    const body = schema.parse(req.body);

    const chat = await prisma.chat.create({
      data: {
        projectId: project.id,
        title: body.title || "New Chat",
      },
    });

    return res.status(201).json({ chat });
  }),
);

// ✅ List chats of a project
router.get(
  "/projects/:projectId/chats",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const chats = await prisma.chat.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ chats });
  }),
);

// ✅ Get all messages of a chat
router.get(
  "/chats/:chatId/messages",
  asyncHandler(async (req, res) => {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, project: { userId: req.user.id } },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    const messages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "asc" },
    });

    return res.json({ messages });
  }),
);

// ✅ Send message + get AI reply (Streaming SSE version)
router.post(
  "/chats/:chatId/messages",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      content: z.string().min(1, "Message content is required"),
    });

    const body = schema.parse(req.body);

    // 1) Validate chat belongs to user
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, project: { userId: req.user.id } },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    // 2) Save user message
    const userMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "user",
        content: body.content,
      },
    });

    // Setup headers for Server-Sent Events (SSE)
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Write the user message details to client first
    res.write(`event: userMessage\ndata: ${JSON.stringify(userMsg)}\n\n`);

    // 3) Get default prompt for this project
    const defaultPrompt = await prisma.prompt.findFirst({
      where: { projectId: chat.projectId, isDefault: true },
      orderBy: { createdAt: "desc" },
    });

    // Get project model setting
    const project = await prisma.project.findUnique({
      where: { id: chat.projectId },
      select: { modelName: true },
    });

    // 4) Get last messages for context (latest 20)
    const lastMessages = await prisma.message.findMany({
      where: { chatId: chat.id },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    // Convert to OpenRouter format (must be oldest -> newest)
    const llmMessages = lastMessages
      .reverse()
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({
        role: m.role,
        content: m.content,
      }));

    // 5) Call OpenRouter in stream mode
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

    const searchKeywords = ["news", "today", "weather", "latest", "stock", "price", "live", "score", "recent", "current", "who is", "what is the status of"];
    const needsSearch = searchKeywords.some(keyword => body.content.toLowerCase().includes(keyword));

    let searchResults = "";
    if (needsSearch) {
      try {
        searchResults = await searchWeb(body.content);
      } catch (err) {
        console.error("Web search call failed:", err);
      }
    }

    const systemText = `
${defaultPrompt?.content || "You are a helpful assistant."}

${needsSearch && searchResults ? `[Live Web Search Context]
Query: ${body.content}
Results:
${searchResults}

Use the above real-time context to answer the user's question accurately. Cite the info if possible.` : ""}

Rules:
1) If user says only "hi" or "hello", reply normally with a greeting.
2) If user asks today's date, reply with: ${today}
3) Answer directly. No generic filler.
4) Keep it short.
`.trim();

    try {
      await streamAssistantReply({
        systemText,
        messages: llmMessages,
        model: project?.modelName,
        onChunk: (chunk) => {
          res.write(`event: chunk\ndata: ${JSON.stringify({ text: chunk })}\n\n`);
        },
        onEnd: async (fullContent) => {
          // 6) Save assistant message in DB when complete
          const assistantMsg = await prisma.message.create({
            data: {
              chatId: chat.id,
              role: "assistant",
              content: fullContent,
            },
          });
          res.write(`event: done\ndata: ${JSON.stringify(assistantMsg)}\n\n`);
          res.end();
        },
      });
    } catch (e) {
      res.write(`event: error\ndata: ${JSON.stringify({ error: e.message })}\n\n`);
      res.end();
    }
  }),
);

router.delete(
  "/chats/:chatId",
  asyncHandler(async (req, res) => {
    const chat = await prisma.chat.findFirst({
      where: { id: req.params.chatId, project: { userId: req.user.id } },
    });

    if (!chat) {
      return res.status(404).json({ error: "Chat not found" });
    }

    await prisma.chat.delete({
      where: { id: chat.id },
    });

    res.json({ success: true, message: "Chat deleted successfully" });
  }),
);

export default router;
