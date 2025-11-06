import { db } from "../db/index";
import { messages, weatherCache, tags, snippetTags, tasks } from "../db/schema";
import { readFileSync } from "fs";
import { join } from "path";

async function importData() {
  try {
    console.log("Starting data import...\n");
    
    // Check if database is configured
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set. Please configure it in your environment variables.");
    }

    // Import Messages
    console.log("Importing messages...");
    try {
      const messagesPath = join(process.cwd(), "messages.json");
      const messagesData = JSON.parse(readFileSync(messagesPath, "utf-8"));
      
      for (const message of messagesData) {
        try {
          await db.insert(messages).values({
            name: message.name,
            email: message.email,
            message: message.message,
            createdAt: new Date(message.created_at),
          });
          console.log(`  ✓ Imported message from ${message.name}`);
        } catch (error) {
          console.error(`  ✗ Failed to import message from ${message.name}:`, error);
        }
      }
      console.log(`✓ Imported ${messagesData.length} messages\n`);
    } catch (error) {
      console.error("✗ Failed to import messages:", error);
    }

    // Import Tags
    console.log("Importing tags...");
    try {
      const tagsPath = join(process.cwd(), "tags.json");
      const tagsData = JSON.parse(readFileSync(tagsPath, "utf-8"));
      
      for (const tag of tagsData) {
        try {
          await db.insert(tags).values({
            name: tag.name,
            createdAt: new Date(tag.created_at),
          }).onConflictDoUpdate({
            target: tags.name,
            set: { name: tag.name }
          });
          console.log(`  ✓ Imported tag: ${tag.name}`);
        } catch (error) {
          console.error(`  ✗ Failed to import tag ${tag.name}:`, error);
        }
      }
      console.log(`✓ Imported ${tagsData.length} tags\n`);
    } catch (error) {
      console.error("✗ Failed to import tags:", error);
    }

    // Import Snippet Tags (relationships)
    console.log("Importing snippet tags...");
    try {
      const snippetTagsPath = join(process.cwd(), "snippet_tags.json");
      const snippetTagsData = JSON.parse(readFileSync(snippetTagsPath, "utf-8"));
      
      for (const snippetTag of snippetTagsData) {
        try {
          await db.insert(snippetTags).values({
            snippetId: snippetTag.snippet_id,
            tagId: snippetTag.tag_id,
            createdAt: new Date(snippetTag.created_at),
          }).onConflictDoNothing();
          console.log(`  ✓ Imported snippet-tag relationship: snippet ${snippetTag.snippet_id} -> tag ${snippetTag.tag_id}`);
        } catch (error) {
          console.error(`  ✗ Failed to import snippet-tag relationship:`, error);
        }
      }
      console.log(`✓ Imported ${snippetTagsData.length} snippet-tag relationships\n`);
    } catch (error) {
      console.error("✗ Failed to import snippet tags:", error);
    }

    // Import Weather Cache
    console.log("Importing weather cache...");
    try {
      const weatherCachePath = join(process.cwd(), "weather_cache.json");
      const weatherCacheData = JSON.parse(readFileSync(weatherCachePath, "utf-8"));
      
      for (const cache of weatherCacheData) {
        try {
          await db.insert(weatherCache).values({
            city: cache.city,
            data: cache.data,
            createdAt: new Date(cache.created_at),
          }).onConflictDoUpdate({
            target: weatherCache.city,
            set: {
              data: cache.data,
              createdAt: new Date(cache.created_at),
            }
          });
          console.log(`  ✓ Imported weather cache for ${cache.city}`);
        } catch (error) {
          console.error(`  ✗ Failed to import weather cache for ${cache.city}:`, error);
        }
      }
      console.log(`✓ Imported ${weatherCacheData.length} weather cache entries\n`);
    } catch (error) {
      console.error("✗ Failed to import weather cache:", error);
    }

    // Import Tasks
    console.log("Importing tasks...");
    try {
      const tasksPath = join(process.cwd(), "tasks.json");
      const tasksData = JSON.parse(readFileSync(tasksPath, "utf-8"));
      
      for (const task of tasksData) {
        try {
          await db.insert(tasks).values({
            title: task.title,
            description: task.description || null,
            status: task.status || "pending",
            priority: task.priority || "medium",
            dueDate: task.due_date ? new Date(task.due_date) : null,
            completedAt: task.completed_at ? new Date(task.completed_at) : null,
            createdAt: new Date(task.created_at),
            updatedAt: new Date(task.updated_at),
          });
          console.log(`  ✓ Imported task: ${task.title}`);
        } catch (error) {
          console.error(`  ✗ Failed to import task ${task.title}:`, error);
        }
      }
      console.log(`✓ Imported ${tasksData.length} tasks\n`);
    } catch (error) {
      console.error("✗ Failed to import tasks:", error);
    }

    console.log("✅ Data import completed successfully!");
  } catch (error) {
    console.error("❌ Error importing data:", error);
    process.exit(1);
  }
}

// Run the import
importData();

