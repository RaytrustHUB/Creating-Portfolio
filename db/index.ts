import { drizzle } from "drizzle-orm/neon-serverless";
import * as schema from "@db/schema";
import dotenv from "dotenv";

dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

export const db = drizzle(process.env.DATABASE_URL, {
  schema,
});
