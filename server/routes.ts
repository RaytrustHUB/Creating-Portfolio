import type { Express } from "express";
import { createServer, type Server } from "http";
import { db } from "@db";
import { messages, weatherCache } from "@db/schema";
import { insertMessageSchema } from "@db/schema";
import { eq, and, gte } from "drizzle-orm";
import { sql } from "drizzle-orm";

export function registerRoutes(app: Express): Server {
  // Contact form submission
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertMessageSchema.parse(req.body);
      await db.insert(messages).values(validatedData);
      res.json({ success: true });
    } catch (error) {
      console.error("Contact form error:", error);
      res.status(400).json({ error: "Invalid message data" });
    }
  });

  // Get all messages
  app.get("/api/messages", async (_req, res) => {
    try {
      const allMessages = await db.select().from(messages).orderBy(messages.createdAt);
      res.json(allMessages);
    } catch (error) {
      console.error("Fetch messages error:", error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  // Weather API endpoint with caching
  app.get("/api/weather", async (req, res) => {
    try {
      const city = req.query.city?.toString();
      if (!city) {
        return res.status(400).json({ error: "City parameter is required" });
      }

      const apiKey = process.env.OPENWEATHER_API_KEY;
      if (!apiKey) {
        console.error("OpenWeather API key is not configured");
        return res.status(500).json({ error: "Weather service is not configured" });
      }

      // Check cache first (valid for 30 minutes)
      const cachedData = await db.select()
        .from(weatherCache)
        .where(
          and(
            eq(weatherCache.city, city.toLowerCase()),
            gte(weatherCache.createdAt, sql`NOW() - INTERVAL '30 minutes'`)
          )
        )
        .limit(1);

      if (cachedData.length > 0) {
        console.log("Serving cached weather data for:", city);
        return res.json(JSON.parse(cachedData[0].data));
      }

      console.log("Fetching fresh weather data for:", city);
      const response = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&units=imperial&appid=${apiKey}`
      );

      const data = await response.json();
      
      if (!response.ok) {
        console.error("OpenWeather API error:", data);
        return res.status(response.status).json({
          error: data.message || "Failed to fetch weather data",
          code: response.status,
        });
      }

      // Cache the new data
      try {
        await db.insert(weatherCache)
          .values({
            city: city.toLowerCase(),
            data: JSON.stringify(data),
          })
          .onConflictDoUpdate({
            target: weatherCache.city,
            set: {
              data: JSON.stringify(data),
              createdAt: sql`NOW()`
            }
          });

        console.log("Weather data cached for:", city);
      } catch (cacheError) {
        console.error("Failed to cache weather data:", cacheError);
        // Continue even if caching fails
      }

      res.json(data);
    } catch (error) {
      console.error("Weather API error:", error);
      res.status(500).json({
        error: "Failed to fetch weather data",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
