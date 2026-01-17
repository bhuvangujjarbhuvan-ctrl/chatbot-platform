import express from "express";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import projectRoutes from "./routes/project.routes.js";
import promptRoutes from "./routes/prompt.routes.js";
import chatRoutes from "./routes/chat.routes.js";
import { errorHandler } from "./middleware/error.js";

const app = express();

app.use(express.json());
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*",
    credentials: true,
  })
);

app.get("/health", (req, res) => res.json({ ok: true }));

app.use("/api/auth", authRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api", promptRoutes);
app.use("/api", chatRoutes);

app.use(errorHandler);

export default app;
