import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { db } from "@db";
import { sql } from "drizzle-orm";
import dotenv from "dotenv";

dotenv.config();

// Verify required environment variables
const requiredEnvVars = ['DATABASE_URL', 'OPENWEATHER_API_KEY'];
for (const envVar of requiredEnvVars) {
  if (!process.env[envVar]) {
    throw new Error(`${envVar} environment variable is required`);
  }
}

// Initialize express app
const app = express();

// Basic middleware
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      log(logLine);
    }
  });

  next();
});

// Database connection retry logic with improved error handling
async function connectToDatabase(retries = 5, delay = 5000): Promise<void> {
  for (let i = 0; i < retries; i++) {
    try {
      log(`Attempting database connection (attempt ${i + 1}/${retries})...`);
      
      // Verify database connection
      const result = await db.execute(sql`SELECT 1`);
      if (!result) throw new Error("Database connection test failed");
      
      // Verify tables exist by checking schema
      await db.execute(sql`
        SELECT EXISTS (
          SELECT FROM pg_tables 
          WHERE schemaname = 'public' 
          AND tablename IN ('messages', 'weather_cache')
        )
      `);
      
      log("Database connection and schema verification successful");
      return;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      log(`Database connection error: ${errorMessage}`);
      
      if (i === retries - 1) {
        log("Maximum retry attempts reached");
        throw new Error(`Failed to connect to database: ${errorMessage}`);
      }
      
      log(`Retrying in ${delay/1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Graceful shutdown handler with improved cleanup
function handleShutdown(server: any) {
  let isShuttingDown = false;

  async function cleanup() {
    try {
      // Attempt to close database connections
      await db.execute(sql`SELECT pg_terminate_backend(pg_backend_pid())`);
    } catch (error) {
      log(`Error during database cleanup: ${error instanceof Error ? error.message : String(error)}`);
    }
  }

  const shutdown = async () => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    log("Received shutdown signal, beginning graceful shutdown...");
    
    try {
      await cleanup();
      server.close(() => {
        log("Server closed successfully");
        process.exit(0);
      });

      // Force exit after 10s
      setTimeout(() => {
        log("Forcing exit after timeout");
        process.exit(1);
      }, 10000);
    } catch (error) {
      log(`Error during shutdown: ${error instanceof Error ? error.message : String(error)}`);
      process.exit(1);
    }
  };

  process.on("SIGTERM", shutdown);
  process.on("SIGINT", shutdown);
  process.on("uncaughtException", (error) => {
    log(`Uncaught exception: ${error.message}`);
    shutdown();
  });
}

// Main application startup with improved error handling
(async () => {
  try {
    log("Starting application initialization...");
    
    // Verify environment variables
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL environment variable is required");
    }

    // Initialize database connection
    await connectToDatabase();

    // Verify required environment variables
    if (!process.env.OPENWEATHER_API_KEY) {
      throw new Error("OPENWEATHER_API_KEY environment variable is required");
    }

    // Register routes
    const server = registerRoutes(app);

    // Global error handling middleware
    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";
      log(`Error ${status}: ${message}`);
      
      if (!res.headersSent) {
        res.status(status).json({ 
          error: message,
          status,
          timestamp: new Date().toISOString()
        });
      }
    });

    // Setup Vite or static serving
    if (app.get("env") === "development") {
      await setupVite(app, server);
      log("Vite middleware configured");
    } else {
      serveStatic(app);
      log("Static serving configured");
    }

    // Start server
    const PORT = 5000;
    server.listen(PORT, "0.0.0.0", () => {
      log(`Server running on port ${PORT}`);
    });

    // Setup graceful shutdown
    handleShutdown(server);
    
    log("Application initialization completed successfully");
  } catch (error) {
    log(`Fatal error during startup: ${error instanceof Error ? error.message : String(error)}`);
    process.exit(1);
  }
})();
