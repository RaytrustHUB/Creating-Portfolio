import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { messages } from "@db/schema";
import { insertMessageSchema } from "@db/schema";
import { eq } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      await db.insert(messages).values(validatedData);
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get all messages
  app.get("/api/messages", async (_req, res) => {
    try {
      const allMessages = await db.select().from(messages).orderBy(messages.createdAt);
      res.json(allMessages);
    } catch (error) {
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
