import { pgTable, text, serial, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

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

export const insertMessageSchema = createInsertSchema(messages);
export const selectMessageSchema = createSelectSchema(messages);
export type InsertMessage = typeof messages.$inferInsert;
export type SelectMessage = typeof messages.$inferSelect;

export const insertWeatherCacheSchema = createInsertSchema(weatherCache);
export const selectWeatherCacheSchema = createSelectSchema(weatherCache);
export type InsertWeatherCache = typeof weatherCache.$inferInsert;
export type SelectWeatherCache = typeof weatherCache.$inferSelect;
