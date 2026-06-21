import express from "express";
import { z } from "zod";
import { prisma } from "../config/prisma.js";
import { authGuard } from "../middleware/auth.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const router = express.Router();
router.use(authGuard);

router.get(
  "/",
  asyncHandler(async (req, res) => {
    const projects = await prisma.project.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
    });
    res.json({ projects });
  }),
);

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const schema = z.object({
      name: z.string().min(2),
      description: z.string().optional(),
    });

    const body = schema.parse(req.body);

    const project = await prisma.project.create({
      data: {
        userId: req.user.id,
        name: body.name,
        description: body.description,
      },
    });

    res.status(201).json({ project });
  }),
);

router.delete(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    await prisma.project.delete({
      where: { id: project.id },
    });

    res.json({ success: true, message: "Project deleted successfully" });
  }),
);

router.patch(
  "/:projectId",
  asyncHandler(async (req, res) => {
    const project = await prisma.project.findFirst({
      where: { id: req.params.projectId, userId: req.user.id },
    });

    if (!project) {
      return res.status(404).json({ error: "Project not found" });
    }

    const schema = z.object({
      name: z.string().min(2).optional(),
      description: z.string().optional(),
      modelName: z.string().nullable().optional(),
      temperature: z.number().min(0.0).max(2.0).optional(),
      maxTokens: z.number().int().min(10).max(4000).optional(),
    });

    const body = schema.parse(req.body);

    const updated = await prisma.project.update({
      where: { id: project.id },
      data: {
        name: body.name !== undefined ? body.name : undefined,
        description: body.description !== undefined ? body.description : undefined,
        modelName: body.modelName !== undefined ? body.modelName : undefined,
        temperature: body.temperature !== undefined ? body.temperature : undefined,
        maxTokens: body.maxTokens !== undefined ? body.maxTokens : undefined,
      },
    });

    res.json({ project: updated });
  }),
);

export default router;
