import express from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authGuard } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();
router.use(authGuard);

router.get(
  "/projects/:projectId/prompts",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    const prompts = await prisma.prompt.findMany({
      where: { projectId: project.id },
      orderBy: { createdAt: "desc" },
    });

    res.json({ prompts });
  }),
);

router.post(
  "/projects/:projectId/prompts",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      title: z.string().min(2),
      content: z.string().min(5),
      isDefault: z.boolean().optional(),
    });

    const body = schema.parse(req.body);

    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });
    if (!project) return res.status(404).json({ error: "Project not found" });

    if (body.isDefault) {
      await prisma.prompt.updateMany({
        where: { projectId: project.id, isDefault: true },
        data: { isDefault: false },
      });
    }

    const prompt = await prisma.prompt.create({
      data: {
        projectId: project.id,
        title: body.title,
        content: body.content,
        isDefault: body.isDefault ?? false,
      },
    });

    res.status(201).json({ prompt });
  }),
);

export default router;
