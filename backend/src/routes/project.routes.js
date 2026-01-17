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

export default router;
