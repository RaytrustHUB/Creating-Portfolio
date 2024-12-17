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

  // Weather API endpoint
  app.get("/api/weather", async (req, res) => {
    try {
      const city = req.query.city;
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }

      if (!process.env.OPENWEATHER_API_KEY) {
        return res.status(500).json({ error: "Weather API key is not configured" });
      }

      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city.toString())}&units=imperial&appid=${process.env.OPENWEATHER_API_KEY}`
      );
      
      if (!response.ok) {
        const errorData = await response.json();
        return res.status(response.status).json({ 
          error: errorData.message || "Weather API request failed",
          code: response.status
        });
      }

      const data = await response.json();
      res.json(data);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({ 
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : String(error)
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
