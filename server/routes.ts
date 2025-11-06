import type { Express } from "express";
import { createServer, type Server } from "http";
import { ZodError } from "zod";
import { db } from "@db";
import { messages, weatherCache, snippets, tags, snippetTags, tasks } from "@db/schema";
import { insertMessageSchema, insertSnippetSchema, insertTagSchema } from "@db/schema";
import { eq, and, gte, like, desc, or } from "drizzle-orm";
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
      
      // Provide more detailed error messages for validation errors
      if (error instanceof ZodError) {
        return res.status(400).json({ 
          error: "Validation failed",
          details: error.errors
        });
      }
      
      res.status(400).json({ 
        error: error instanceof Error ? error.message : "Invalid message data" 
      });
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

  // Code Snippets API Routes

  // Get all snippets with optional search and tag filters
  app.get("/api/snippets", async (req, res) => {
    try {
      const search = req.query.search?.toString();
      const tag = req.query.tag?.toString();

      let baseQuery = db
        .select({
          id: snippets.id,
          title: snippets.title,
          description: snippets.description,
          language: snippets.language,
          code: snippets.code,
          createdAt: snippets.createdAt,
          updatedAt: snippets.updatedAt,
          tags: sql<string[]>`array_agg(${tags.name})`
        })
        .from(snippets)
        .leftJoin(snippetTags, eq(snippets.id, snippetTags.snippetId))
        .leftJoin(tags, eq(snippetTags.tagId, tags.id));

      if (search) {
        baseQuery = baseQuery.where(
          or(
            like(snippets.title, `%${search}%`),
            like(snippets.description, `%${search}%`)
          )
        );
      }

      let query = baseQuery.groupBy(snippets.id);

      if (tag) {
        query = query.having(sql`${tag} = ANY(array_agg(${tags.name}))`);
      }

      const result = await query.orderBy(desc(snippets.updatedAt));
      res.json(result);
    } catch (error) {
      console.error("Fetch snippets error:", error);
      res.status(500).json({ error: "Failed to fetch snippets" });
    }
  });

  // Get a single snippet by ID
  app.get("/api/snippets/:id", async (req, res) => {
    try {
      const snippet = await db
        .select({
          id: snippets.id,
          title: snippets.title,
          description: snippets.description,
          language: snippets.language,
          code: snippets.code,
          createdAt: snippets.createdAt,
          updatedAt: snippets.updatedAt,
          tags: sql<string[]>`array_agg(${tags.name})`
        })
        .from(snippets)
        .leftJoin(snippetTags, eq(snippets.id, snippetTags.snippetId))
        .leftJoin(tags, eq(snippetTags.tagId, tags.id))
        .where(eq(snippets.id, parseInt(req.params.id)))
        .groupBy(snippets.id)
        .limit(1);

      if (!snippet[0]) {
        return res.status(404).json({ error: "Snippet not found" });
      }

      res.json(snippet[0]);
    } catch (error) {
      console.error("Fetch snippet error:", error);
      res.status(500).json({ error: "Failed to fetch snippet" });
    }
  });

  // Create a new snippet
  app.post("/api/snippets", async (req, res) => {
    try {
      const body = req.body as { tags?: string[] } & Record<string, unknown>;
      const tagNames = body.tags;
      // Extract tags before validation since they're not part of the schema
      const { tags: _, ...bodyWithoutTags } = body;
      const validatedData = insertSnippetSchema.parse(bodyWithoutTags);
      const snippetData = validatedData;

      // Start a transaction to ensure all operations succeed or fail together
      const result = await db.transaction(async (tx) => {
        // Insert the snippet
        const [newSnippet] = await tx
          .insert(snippets)
          .values(snippetData)
          .returning();

        if (tagNames && tagNames.length > 0) {
          // Insert or get existing tags
          const tagPromises = tagNames.map(async (tagName: string) => {
            const [tag] = await tx
              .insert(tags)
              .values({ name: tagName })
              .onConflictDoUpdate({
                target: tags.name,
                set: { name: tagName }
              })
              .returning();
            return tag;
          });

          const resolvedTags = await Promise.all(tagPromises);

          // Create snippet-tag relationships
          await Promise.all(
            resolvedTags.map((tag: { id: number }) =>
              tx.insert(snippetTags).values({
                snippetId: newSnippet.id,
                tagId: tag.id
              })
            )
          );
        }

        return newSnippet;
      });

      res.status(201).json(result);
    } catch (error) {
      console.error("Create snippet error:", error);
      res.status(400).json({ error: "Failed to create snippet" });
    }
  });

  // Update a snippet
  app.put("/api/snippets/:id", async (req, res) => {
    try {
      const snippetId = parseInt(req.params.id);
      const body = req.body as { tags?: string[] } & Record<string, unknown>;
      const tagNames = body.tags;
      // Extract tags before validation since they're not part of the schema
      const { tags: _, ...bodyWithoutTags } = body;
      const validatedData = insertSnippetSchema.parse(bodyWithoutTags);
      const snippetData = validatedData;

      const result = await db.transaction(async (tx) => {
        // Update snippet
        const [updatedSnippet] = await tx
          .update(snippets)
          .set({ ...snippetData, updatedAt: new Date() })
          .where(eq(snippets.id, snippetId))
          .returning();

        if (!updatedSnippet) {
          throw new Error("Snippet not found");
        }

        // Remove existing tag relationships
        await tx
          .delete(snippetTags)
          .where(eq(snippetTags.snippetId, snippetId));

        if (tagNames && tagNames.length > 0) {
          // Insert or get existing tags
          const tagPromises = tagNames.map(async (tagName: string) => {
            const [tag] = await tx
              .insert(tags)
              .values({ name: tagName })
              .onConflictDoUpdate({
                target: tags.name,
                set: { name: tagName }
              })
              .returning();
            return tag;
          });

          const resolvedTags = await Promise.all(tagPromises);

          // Create new snippet-tag relationships
          await Promise.all(
            resolvedTags.map((tag: { id: number }) =>
              tx.insert(snippetTags).values({
                snippetId: updatedSnippet.id,
                tagId: tag.id
              })
            )
          );
        }

        return updatedSnippet;
      });

      res.json(result);
    } catch (error) {
      console.error("Update snippet error:", error);
      if (error instanceof Error && error.message === "Snippet not found") {
        res.status(404).json({ error: "Snippet not found" });
      } else {
        res.status(400).json({ error: "Failed to update snippet" });
      }
    }
  });

  // Get all tags
  app.get("/api/tags", async (_req, res) => {
    try {
      const allTags = await db
        .select({
          id: tags.id,
          name: tags.name,
          count: sql<number>`count(${snippetTags.id})`
        })
        .from(tags)
        .leftJoin(snippetTags, eq(tags.id, snippetTags.tagId))
        .groupBy(tags.id)
        .orderBy(tags.name);

      res.json(allTags);
    } catch (error) {
      console.error("Fetch tags error:", error);
      res.status(500).json({ error: "Failed to fetch tags" });
    }
  });


  // Task Manager API Routes

  // Get all tasks
  app.get("/api/tasks", async (_req, res) => {
    try {
      const allTasks = await db
        .select()
        .from(tasks)
        .orderBy(desc(tasks.updatedAt));
      res.json(allTasks);
    } catch (error) {
      console.error("Fetch tasks error:", error);
      res.status(500).json({ error: "Failed to fetch tasks" });
    }
  });

  // Create a new task
  app.post("/api/tasks", async (req, res) => {
    try {
      const [task] = await db
        .insert(tasks)
        .values({
          title: req.body.title,
          description: req.body.description,
          status: req.body.status || "pending",
          priority: req.body.priority || "medium",
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
        })
        .returning();
      res.status(201).json(task);
    } catch (error) {
      console.error("Create task error:", error);
      res.status(400).json({ error: "Failed to create task" });
    }
  });

  // Update a task
  app.put("/api/tasks/:id", async (req, res) => {
    try {
      const [task] = await db
        .update(tasks)
        .set({
          title: req.body.title,
          description: req.body.description,
          status: req.body.status,
          priority: req.body.priority,
          dueDate: req.body.dueDate ? new Date(req.body.dueDate) : null,
          updatedAt: new Date(),
        })
        .where(eq(tasks.id, parseInt(req.params.id)))
        .returning();

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json(task);
    } catch (error) {
      console.error("Update task error:", error);
      res.status(400).json({ error: "Failed to update task" });
    }
  });

  // Delete a task
  app.delete("/api/tasks/:id", async (req, res) => {
    try {
      const [task] = await db
        .delete(tasks)
        .where(eq(tasks.id, parseInt(req.params.id)))
        .returning();

      if (!task) {
        return res.status(404).json({ error: "Task not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete task error:", error);
      res.status(400).json({ error: "Failed to delete task" });
    }
  });

  // Delete a snippet
  app.delete("/api/snippets/:id", async (req, res) => {
    try {
      // First delete the snippet-tag relationships
      await db
        .delete(snippetTags)
        .where(eq(snippetTags.snippetId, parseInt(req.params.id)));

      // Then delete the snippet
      const [deletedSnippet] = await db
        .delete(snippets)
        .where(eq(snippets.id, parseInt(req.params.id)))
        .returning();

      if (!deletedSnippet) {
        return res.status(404).json({ error: "Snippet not found" });
      }

      res.json({ success: true });
    } catch (error) {
      console.error("Delete snippet error:", error);
      res.status(400).json({ error: "Failed to delete snippet" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}