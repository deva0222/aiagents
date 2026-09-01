import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { db } from "./src/db";
import { users } from "./src/db/schema";
import bcrypt from "bcryptjs";
import { apiRouter } from "./src/api";
import { chatRouter } from "./src/chat-api";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.use("/api/chat", chatRouter);
  app.use("/api", apiRouter);

  // Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Seed DB Route (Temporary for demo)
  app.post("/api/seed", async (req, res) => {
    try {
      const hashedAdminPass = await bcrypt.hash("admin123", 10);
      await db.insert(users).values({
        id: "admin_1",
        email: "admin@aiagents.com",
        name: "Admin User",
        password: hashedAdminPass,
        role: "ADMIN"
      }).onConflictDoNothing();
      res.json({ message: "Seed complete" });
    } catch (e: any) {
      res.status(500).json({ error: e.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: {
        middlewareMode: true,
        hmr: {
          port: 3001
        }
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
