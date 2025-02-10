import { pgTable, text, serial, timestamp, integer, boolean, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Messages table for contact form
export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  message: text("message").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Weather cache table to reduce API calls
export const weatherCache = pgTable("weather_cache", {
  id: serial("id").primaryKey(),
  city: text("city").notNull().unique(),
  data: text("data").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Code Snippets
export const snippets = pgTable("snippets", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  code: text("code").notNull(),
  language: text("language").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const tags = pgTable("tags", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const snippetTags = pgTable("snippet_tags", {
  id: serial("id").primaryKey(),
  snippetId: integer("snippet_id").references(() => snippets.id).notNull(),
  tagId: integer("tag_id").references(() => tags.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Tasks
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  status: text("status").notNull().default('pending'),
  priority: text("priority").notNull().default('medium'),
  dueDate: timestamp("due_date"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const taskCategories = pgTable("task_categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  color: text("color").notNull().default('#808080'),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const taskCategoryRelations = pgTable("task_category_relations", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  categoryId: integer("category_id").references(() => taskCategories.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

export const taskDependencies = pgTable("task_dependencies", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").references(() => tasks.id).notNull(),
  dependsOnTaskId: integer("depends_on_task_id").references(() => tasks.id).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});

// Relations
export const snippetsRelations = relations(snippets, ({ many }) => ({
  snippetTags: many(snippetTags)
}));

export const tagsRelations = relations(tags, ({ many }) => ({
  snippetTags: many(snippetTags)
}));

export const snippetTagsRelations = relations(snippetTags, ({ one }) => ({
  snippet: one(snippets, {
    fields: [snippetTags.snippetId],
    references: [snippets.id],
  }),
  tag: one(tags, {
    fields: [snippetTags.tagId],
    references: [tags.id],
  }),
}));

export const tasksRelations = relations(tasks, ({ many }) => ({
  categoryRelations: many(taskCategoryRelations),
  dependencies: many(taskDependencies, { relationName: "taskDependencies" }),
  dependents: many(taskDependencies, { relationName: "dependentTasks" })
}));

export const taskCategoriesRelations = relations(taskCategories, ({ many }) => ({
  categoryRelations: many(taskCategoryRelations)
}));

// Schemas
export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;

export const insertWeatherCacheSchema = createInsertSchema(weatherCache);
export const selectWeatherCacheSchema = createSelectSchema(weatherCache);
export type InsertWeatherCache = typeof weatherCache.$inferInsert;
export type SelectWeatherCache = typeof weatherCache.$inferSelect;

export const insertSnippetSchema = createInsertSchema(snippets);
export const selectSnippetSchema = createSelectSchema(snippets);
export type InsertSnippet = typeof snippets.$inferInsert;
export type SelectSnippet = typeof snippets.$inferSelect;

export const insertTagSchema = createInsertSchema(tags);
export const selectTagSchema = createSelectSchema(tags);
export type InsertTag = typeof tags.$inferInsert;
export type SelectTag = typeof tags.$inferSelect;

export const insertTaskSchema = createInsertSchema(tasks);
export const selectTaskSchema = createSelectSchema(tasks);
export type InsertTask = typeof tasks.$inferInsert;
export type SelectTask = typeof tasks.$inferSelect;

export const insertTaskCategorySchema = createInsertSchema(taskCategories);
export const selectTaskCategorySchema = createSelectSchema(taskCategories);
export type InsertTaskCategory = typeof taskCategories.$inferInsert;
export type SelectTaskCategory = typeof taskCategories.$inferSelect;