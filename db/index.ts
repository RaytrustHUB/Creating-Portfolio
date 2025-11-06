import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";
import dotenv from "dotenv";

dotenv.config();

// Check for DATABASE_URL but don't throw at module load time for serverless
if (!process.env.DATABASE_URL) {
  console.error("WARNING: DATABASE_URL is not set. Database operations will fail.");
}

// Initialize database connection
// For serverless, this will be initialized on first use
export const db = process.env.DATABASE_URL
  ? drizzle(process.env.DATABASE_URL, {
      schema,
    })
  : (null as any); // Will throw error when used if DATABASE_URL is not set
