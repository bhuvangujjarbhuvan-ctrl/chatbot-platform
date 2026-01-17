import express from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authGuard } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";
import { generateAssistantReply } from "../services/openrouter.service.js";

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

// ✅ Send message + get AI reply
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

    // 3) Get default prompt for this project
    const defaultPrompt = await prisma.prompt.findFirst({
      where: { projectId: chat.projectId, isDefault: true },
      orderBy: { createdAt: "desc" },
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

    // 5) Call OpenRouter
    const today = new Date().toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "long",
      year: "numeric",
    });

const systemText = `
${defaultPrompt?.content || "You are a helpful assistant."}

Rules:
1) If user says only "hi" or "hello", reply normally with a greeting.
2) If user asks today's date, reply with: ${today}
3) Answer directly. No generic filler.
4) Keep it short.
`.trim();


    const assistantText = await generateAssistantReply({
      systemText,
      messages: llmMessages,
    });

    // 6) Save assistant message
    const assistantMsg = await prisma.message.create({
      data: {
        chatId: chat.id,
        role: "assistant",
        content: assistantText,
      },
    });

    return res.status(201).json({
      userMessage: userMsg,
      assistantMessage: assistantMsg,
    });
  }),
);

export default router;
